#!/usr/bin/env node
// 명령형 변환: 지정한 JS/JSX 파일을 TS/TSX로 리네임(git mv)
// 사용법: npm run migrate:ts path/A.jsx path/B.js scripts/
const { spawnSync, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function isInRepo() {
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

function isTracked(p) {
  try {
    execSync(`git ls-files --error-unmatch -- "${p}"`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function readFileForHeuristic(p) {
  try {
    return fs.readFileSync(p, 'utf8');
  } catch {
    return '';
  }
}

function looksLikeJSX(src, p) {
  if (/\.jsx$/i.test(p)) return true;
  return (
    /from\s+['"]react['"]/.test(src) ||
    /React\./.test(src) ||
    /<[A-Z][A-Za-z0-9]*\b/.test(src)
  );
}

function targetName(p, src) {
  return p.replace(/\.jsx?$/i, looksLikeJSX(src, p) ? '.tsx' : '.ts');
}

function gitMv(from, to) {
  fs.mkdirSync(path.dirname(to), { recursive: true });
  const r = spawnSync('git', ['mv', from, to], { stdio: 'inherit' });
  if (r.status !== 0) throw new Error(`git mv failed: ${from} -> ${to}`);
}

function gitMvCaseSafe(from, to) {
  // 대소문자만 다른 경우 임시 파일을 거쳐서 변경
  if (from.toLowerCase() === to.toLowerCase() && from !== to) {
    const tmp = `${to}.tmp_ren_${Date.now()}`;
    spawnSync('git', ['mv', from, tmp], { stdio: 'inherit' });
    spawnSync('git', ['mv', tmp, to], { stdio: 'inherit' });
  } else {
    gitMv(from, to);
  }
}

function expandArgs(args) {
  const out = [];
  for (const a of args) {
    if (fs.existsSync(a) && fs.lstatSync(a).isDirectory()) {
      // 디렉터리인 경우 git ls-files로 JS/JSX 파일 찾기
      try {
        const list = execSync(`git ls-files -z -- "${a}"`, {
          encoding: 'utf8',
        });
        list
          .split('\0')
          .filter(Boolean)
          .forEach((f) => {
            if (/\.jsx?$/i.test(f)) out.push(f);
          });
      } catch {
        // 디렉터리가 비어있거나 git 파일이 없는 경우
      }
    } else {
      out.push(a);
    }
  }
  return out;
}

(async function main() {
  if (!isInRepo()) {
    console.error('❌ Git 저장소가 아닙니다.');
    process.exit(1);
  }

  const rawArgs = process.argv.slice(2).filter(Boolean);

  if (rawArgs.length === 0) {
    console.error(
      '사용법: npm run migrate:ts <파일1.jsx> <파일2.js> <디렉터리> ...'
    );
    console.error('  예) npm run migrate:ts src/App.jsx components/');
    process.exit(1);
  }

  // 디렉터리 인자 확장
  const args = expandArgs(rawArgs);

  if (args.length === 0) {
    console.error('ℹ JS/JSX 파일이 없습니다.');
    process.exit(0);
  }

  const changed = [];
  const skipped = [];

  for (const f of args) {
    if (!/\.jsx?$/i.test(f)) {
      skipped.push(`무시(확장자): ${f}`);
      continue;
    }

    if (!fs.existsSync(f)) {
      skipped.push(`없음: ${f}`);
      continue;
    }

    if (!isTracked(f)) {
      skipped.push(`Git 미추적: ${f}`);
      continue;
    }

    const src = readFileForHeuristic(f);
    const to = targetName(f, src);

    if (to === f) {
      skipped.push(`타깃 동일: ${f}`);
      continue;
    }

    if (fs.existsSync(to)) {
      skipped.push(`타깃 이미 존재: ${to}`);
      continue;
    }

    try {
      gitMvCaseSafe(f, to);
      changed.push([f, to]);
    } catch (e) {
      console.error(`❌ 실패: ${f} → ${to}\n  ${e.message}`);
    }
  }

  // 스킵된 파일 출력 (디버깅용)
  if (skipped.length > 0) {
    console.error('\n⚠️  스킵된 파일:');
    skipped.forEach((msg) => console.error(`  - ${msg}`));
  }

  if (changed.length > 0) {
    try {
      execSync('git add -A', { stdio: 'ignore' });
    } catch {}

    console.error('\n✅ 변환 완료 (Git 히스토리 보존):');
    for (const [a, b] of changed) {
      console.error(`  📝 ${a}  →  ${b}`);
    }

    console.error('\n📌 다음 단계:');
    console.error('  1. import 경로의 확장자를 .ts/.tsx로 수정');
    console.error('  2. npm run typecheck 로 타입 오류 확인');
    console.error('  3. git add -A && git commit');
  } else {
    console.error('\nℹ️  변환 대상이 없습니다.');
    if (rawArgs.length > 0) {
      console.error('   (모든 파일이 스킵되었습니다)');
    }
  }
})();
