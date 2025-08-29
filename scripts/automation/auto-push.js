#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 색상 코드
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  reset: '\x1b[0m',
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 설정 파일 경로
const configPath = path.join(process.cwd(), '.git-workflow.json');

// AUTO_PUSH 활성화 확인
function isAutoPushEnabled() {
  // 1. 환경변수 확인
  if (process.env.AUTO_PUSH === '1') {
    return true;
  }

  // 2. 설정 파일 확인
  if (fs.existsSync(configPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return config.autoPush === true;
    } catch {
      // 파싱 오류 시 비활성화
      return false;
    }
  }

  // 3. .env.local 파일 확인
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    return envContent.includes('AUTO_PUSH=1');
  }

  return false;
}

function getCurrentBranch() {
  try {
    return execSync('git symbolic-ref --short HEAD', {
      encoding: 'utf8',
    }).trim();
  } catch {
    return 'detached';
  }
}

function getChangedFiles() {
  try {
    // 최근 커밋의 변경 파일 목록
    return execSync('git diff --name-only HEAD~1', { encoding: 'utf8' })
      .split('\n')
      .filter(Boolean);
  } catch {
    // 첫 커밋인 경우
    try {
      return execSync('git ls-tree --name-only -r HEAD', { encoding: 'utf8' })
        .split('\n')
        .filter(Boolean);
    } catch {
      return [];
    }
  }
}

async function main() {
  // AUTO_PUSH 비활성화 시 종료
  if (!isAutoPushEnabled()) {
    log('gray', '📌 자동 푸시 비활성화됨 (AUTO_PUSH=1로 활성화 가능)');
    process.exit(0);
  }

  const branch = getCurrentBranch();

  // main 브랜치나 detached HEAD는 스킵
  if (branch === 'main' || branch === 'master' || branch === 'detached') {
    process.exit(0);
  }

  // 변경된 파일 확인
  const changedFiles = getChangedFiles();

  // 코드 파일 확인
  const codeExtensions = [
    '.js',
    '.jsx',
    '.ts',
    '.tsx',
    '.py',
    '.java',
    '.go',
    '.rs',
    '.cpp',
    '.c',
  ];
  const hasCodeChanges = changedFiles.some((file) =>
    codeExtensions.some((ext) => file.endsWith(ext))
  );

  // 문서만 변경된 경우 옵션 확인
  if (!hasCodeChanges && changedFiles.length > 0) {
    const docOnlyFiles = changedFiles.every(
      (file) =>
        /\.(md|txt|json|yml|yaml)$/.test(file) ||
        file.includes('README') ||
        file.includes('LICENSE')
    );

    if (docOnlyFiles) {
      log('gray', '📄 문서만 변경됨. 자동 푸시 스킵');
      log('gray', '   (수동 푸시: git push origin ' + branch + ')');
      process.exit(0);
    }
  }

  log('blue', `🚀 자동 푸시 시작: ${branch}`);

  try {
    // 원격 브랜치 존재 확인
    let remoteExists = false;
    try {
      const remoteList = execSync(`git ls-remote --heads origin ${branch}`, {
        encoding: 'utf8',
      });
      remoteExists = remoteList.length > 0;
    } catch {
      remoteExists = false;
    }

    // 푸시 실행
    if (remoteExists) {
      execSync(`git push origin ${branch}`, { stdio: 'inherit' });
    } else {
      log('yellow', '📍 새 브랜치를 원격에 생성합니다...');
      execSync(`git push -u origin ${branch}`, { stdio: 'inherit' });
    }

    log('green', '\n✅ 자동 푸시 완료!');

    // PR 생성 안내
    log('cyan', '\n📝 다음 단계:');
    const featureName = branch.replace(
      /^(feature|fix|chore|docs|refactor)\//,
      ''
    );
    console.log(`   gh pr create --title "feat: ${featureName}" --base main`);
    console.log(`   또는`);
    console.log(`   GitHub에서 Pull Request 생성: https://github.com로 이동\n`);
  } catch (error) {
    log('yellow', '\n⚠️ 자동 푸시 실패');
    log('gray', `수동 푸시 명령어:`);
    console.log(`   git push origin ${branch}\n`);

    // 에러 상세 정보
    if (error.message) {
      log('gray', `에러: ${error.message}`);
    }
  }
}

// 메인 실행
if (require.main === module) {
  main().catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(0); // 커밋은 이미 완료되었으므로 0으로 종료
  });
}
