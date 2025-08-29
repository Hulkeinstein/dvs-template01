#!/usr/bin/env node
const { execSync } = require('child_process');

// 색상 코드 (chalk 없이 간단한 색상 지원)
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
  reset: '\x1b[0m',
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
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

async function main() {
  const branch = getCurrentBranch();

  // Main 브랜치 직접 푸시 차단
  if (branch === 'main' || branch === 'master') {
    log('red', '🚫 오류: main 브랜치에 직접 푸시할 수 없습니다!');
    log('yellow', '\n📝 올바른 프로세스:');
    console.log(
      '  1. feature 브랜치 생성: git checkout -b feature/your-feature'
    );
    console.log('  2. 변경사항 커밋');
    console.log('  3. PR 생성: gh pr create');
    console.log('  4. PR 머지: gh pr merge --squash\n');
    process.exit(1);
  }

  // 품질 검사 실행
  log('blue', '🔎 코드 품질 검사 중...');

  try {
    // ESLint
    log('gray', '  • ESLint 검사 중...');
    try {
      execSync('npm run lint', { stdio: 'pipe', encoding: 'utf8' });
      log('green', '  ✓ ESLint 통과');
    } catch (error) {
      log('red', '  ✗ ESLint 오류 발견');
      console.log(error.stdout || error.stderr);
      throw new Error('ESLint failed');
    }

    // TypeScript 체크
    log('gray', '  • TypeScript 타입 체크 중...');
    try {
      execSync('npm run type-check', { stdio: 'pipe', encoding: 'utf8' });
      log('green', '  ✓ TypeScript 체크 통과');
    } catch (error) {
      log('red', '  ✗ TypeScript 타입 오류');
      console.log(error.stdout || error.stderr);
      throw new Error('TypeScript check failed');
    }

    // 테스트 (있으면)
    try {
      // 테스트 스크립트 존재 확인
      const packageJson = require('../../package.json');
      if (packageJson.scripts && packageJson.scripts.test) {
        log('gray', '  • 테스트 실행 중...');
        execSync('npm test -- --bail', { stdio: 'pipe', encoding: 'utf8' });
        log('green', '  ✓ 테스트 통과');
      }
    } catch {
      // 테스트가 없거나 실패하면 경고만
      log('yellow', '  ⚠ 테스트 스킵 (테스트가 없거나 실패)');
    }

    log('green', '\n✅ 모든 검사 통과! 푸시를 진행합니다...\n');
  } catch (error) {
    log('red', '\n❌ 품질 검사 실패');
    log(
      'yellow',
      '💡 팁: --no-verify 옵션으로 건너뛸 수 있지만 권장하지 않습니다\n'
    );
    process.exit(1);
  }
}

// 메인 실행
if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = { getCurrentBranch };
