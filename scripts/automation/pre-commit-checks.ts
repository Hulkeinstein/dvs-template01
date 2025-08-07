#!/usr/bin/env node
import { execSync } from 'child_process';
import * as path from 'path';

/**
 * Pre-commit 체크 실행
 */
async function runPreCommitChecks() {
  console.log('🔍 Pre-commit 체크 시작...\n');

  let hasErrors = false;
  const checks = [
    {
      name: 'ESLint',
      command: 'npm run lint',
      emoji: '🔧',
      allowFailure: false, // ESLint 오류는 커밋 차단
    },
    {
      name: 'Prettier',
      command: 'npm run format:check',
      emoji: '💅',
      allowFailure: false, // Prettier 오류는 커밋 차단
    },
    {
      name: 'TypeScript',
      command: 'npx tsc --noEmit',
      emoji: '📘',
      allowFailure: true, // TypeScript 오류는 경고만
    },
  ];

  for (const check of checks) {
    console.log(`${check.emoji} ${check.name} 체크 중...`);

    try {
      execSync(check.command, {
        stdio: 'pipe',
        encoding: 'utf8',
        cwd: path.resolve(__dirname, '../..'),
      });
      console.log(`✅ ${check.name} 체크 통과\n`);
    } catch (error: any) {
      console.log(`❌ ${check.name} 체크 실패\n`);

      if (error.stdout) {
        console.log('출력:', error.stdout);
      }
      if (error.stderr) {
        console.log('에러:', error.stderr);
      }

      if (!check.allowFailure) {
        hasErrors = true;
      } else {
        console.log(`⚠️ ${check.name} 오류는 경고로 처리됩니다.\n`);
      }
    }
  }

  if (hasErrors) {
    console.log(`
❌ Pre-commit 체크 실패!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
코드 품질 문제가 발견되었습니다.

해결 방법:
1. ESLint 오류 수정: npm run lint -- --fix
2. Prettier 포맷팅: npm run format

수정 후 다시 커밋해주세요.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);
    process.exit(1); // 커밋 차단
  }

  console.log(`
✅ Pre-commit 체크 완료!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
모든 코드 품질 체크를 통과했습니다.
커밋을 계속 진행합니다...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
}

// 메인 실행
runPreCommitChecks().catch((error) => {
  console.error('❌ Pre-commit 체크 중 오류:', error);
  process.exit(1);
});
