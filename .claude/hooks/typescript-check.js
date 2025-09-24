#!/usr/bin/env node
/* .claude/hooks/typescript-check.js - Robust TypeScript Migration Check */
const { execSync } = require('child_process');
const fs = require('fs');

// Debug 모드
const DEBUG = !!process.env.TS_HOOK_DEBUG;
function log(...args) {
  if (DEBUG) console.error('[ts-check]', ...args);
}

// Git 저장소 여부 확인
function inGitRepo() {
  try {
    return (
      execSync('git rev-parse --is-inside-work-tree', {
        encoding: 'utf8',
      }).trim() === 'true'
    );
  } catch {
    return false;
  }
}

// Staged 파일 목록 가져오기
function getStagedFiles() {
  try {
    return execSync('git diff --cached --name-only', { encoding: 'utf8' })
      .split('\n')
      .filter(Boolean);
  } catch {
    return [];
  }
}

// Staged 파일 내용 읽기 (git index 우선, fallback to filesystem)
function readStagedContent(filepath) {
  try {
    // Git index에서 staged 버전 읽기
    return execSync(`git show :${filepath}`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch {
    // Fallback: 파일 시스템에서 읽기
    try {
      return fs.readFileSync(filepath, 'utf8');
    } catch {
      return '';
    }
  }
}

// 1) 다중 경로에서 command 힌트 수집
const rawArg = (process.argv.slice(2) || []).join(' ');
let cmdHint = '';

try {
  const parsed = JSON.parse(rawArg || '{}');
  cmdHint =
    parsed.command ||
    parsed?.tool_input?.command ||
    parsed?.bash_command ||
    process.env.CLAUDE_TOOL_INPUT ||
    process.env.TOOL_INPUT ||
    '';
} catch {
  cmdHint = rawArg || '';
}

// 2) Git 명령 감지 (여러 소스에서)
const hintDetected =
  /git\s+(add|commit|merge|rebase|stash)/i.test(cmdHint) ||
  /git\s+(add|commit|merge|rebase|stash)/i.test(process.argv.join(' ')) ||
  !!process.env.GIT_COMMAND ||
  !!process.env.TS_HOOK_FORCE;

log('hint detected:', hintDetected, 'cmdHint:', cmdHint);

// 3) Git 저장소 체크
if (!inGitRepo()) {
  log('not in git repo → exit');
  process.exit(0);
}

// 4) Staged 파일 확인 (최종 폴백)
const stagedFiles = getStagedFiles();
log('staged files:', stagedFiles.length);

// 힌트도 없고 staged 파일도 없으면 종료
if (!hintDetected && stagedFiles.length === 0) {
  log('no hint & no staged files → skip');
  process.exit(0);
}

// ========== TypeScript 체크 로직 ==========
const issues = [];

for (const file of stagedFiles) {
  if (!file) continue;

  const isJS = /\.jsx?$/.test(file);
  const isTS = /\.(ts|tsx)$/.test(file);

  if (!isJS && !isTS) continue;

  const content = readStagedContent(file);
  if (!content) continue;

  // Rule 1: JavaScript 파일 경고
  if (isJS) {
    issues.push({
      file,
      rule: 'JS_FILE',
      msg: 'JavaScript 파일이 스테이징됨 (TypeScript로 전환 권장)',
    });
  }

  // Rule 2: any 타입 사용 경고
  if (isTS) {
    // 더 정확한 any 감지: 타입 위치에서만
    const anyMatches = content.match(/:\s*any\b|<any>/g) || [];
    const anyCount = anyMatches.length;

    if (anyCount > 0) {
      issues.push({
        file,
        rule: 'ANY_TYPE',
        msg: `'any' 타입 ${anyCount}개 발견 (구체적 타입으로 교체 권장)`,
      });
    }
  }
}

// 5) 경고 출력 (차단하지 않음)
if (issues.length > 0) {
  console.error('\n⚠️  TypeScript 마이그레이션 체크');
  console.error('─'.repeat(50));

  for (const issue of issues) {
    console.error(`  📌 ${issue.file}`);
    console.error(`     → ${issue.msg}`);
  }

  console.error('─'.repeat(50));
  console.error('💡 점진적으로 개선해주세요. (경고만 출력, 차단 안 함)');
  console.error('');
} else {
  log('no issues found');
}

// 항상 성공 (경고만, 차단 안 함)
process.exit(0);
