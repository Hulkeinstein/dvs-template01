#!/usr/bin/env node
import { execSync } from 'child_process';
import * as path from 'path';
import { fileExists, readFile } from './lib/file-utils';

/**
 * 자동화 시스템 테스트
 */
async function testAutomationSystem() {
  console.log('🧪 자동화 시스템 테스트 시작...\n');

  const tests = [
    {
      name: 'Git 유틸리티 테스트',
      test: () => {
        const branch = execSync('git branch --show-current', {
          encoding: 'utf8',
        }).trim();
        console.log(`  현재 브랜치: ${branch}`);
        return true;
      },
    },
    {
      name: '파일 시스템 테스트',
      test: () => {
        const projectRoot = path.resolve(__dirname, '../..');
        const devPlanExists = fileExists(
          path.join(projectRoot, 'DEVELOPMENT_PLAN.md')
        );
        const completedExists = fileExists(
          path.join(projectRoot, 'COMPLETED_TASKS.md')
        );
        console.log(
          `  DEVELOPMENT_PLAN.md 존재: ${devPlanExists ? '✅' : '❌'}`
        );
        console.log(
          `  COMPLETED_TASKS.md 존재: ${completedExists ? '✅' : '❌'}`
        );
        return devPlanExists && completedExists;
      },
    },
    {
      name: 'Husky hooks 테스트',
      test: () => {
        const preCommitExists = fileExists(
          path.join(__dirname, '../../.husky/pre-commit')
        );
        const postCommitExists = fileExists(
          path.join(__dirname, '../../.husky/post-commit')
        );
        console.log(`  pre-commit hook: ${preCommitExists ? '✅' : '❌'}`);
        console.log(`  post-commit hook: ${postCommitExists ? '✅' : '❌'}`);
        return preCommitExists && postCommitExists;
      },
    },
    {
      name: 'lint-staged 설정 테스트',
      test: () => {
        const configExists = fileExists(
          path.join(__dirname, '../../.lintstagedrc.json')
        );
        console.log(`  .lintstagedrc.json 존재: ${configExists ? '✅' : '❌'}`);
        return configExists;
      },
    },
    {
      name: 'TypeScript 스크립트 테스트',
      test: () => {
        const scriptsExist = [
          'update-development-plan.ts',
          'pre-commit-checks.ts',
          'lib/git-utils.ts',
          'lib/file-utils.ts',
        ].every((file) => {
          const exists = fileExists(path.join(__dirname, file));
          console.log(`  ${file}: ${exists ? '✅' : '❌'}`);
          return exists;
        });
        return scriptsExist;
      },
    },
  ];

  let allPassed = true;

  for (const testCase of tests) {
    console.log(`\n📋 ${testCase.name}`);
    try {
      const passed = testCase.test();
      if (passed) {
        console.log(`✅ 테스트 통과`);
      } else {
        console.log(`❌ 테스트 실패`);
        allPassed = false;
      }
    } catch (error) {
      console.log(`❌ 테스트 실패:`, error);
      allPassed = false;
    }
  }

  console.log('\n' + '='.repeat(50));

  if (allPassed) {
    console.log(`
✅ 모든 테스트 통과!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
자동화 시스템이 정상적으로 설정되었습니다.

다음 단계:
1. feature 브랜치에서 테스트 커밋
2. main 브랜치에서 Closes 패턴 테스트
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);
  } else {
    console.log(`
❌ 일부 테스트 실패
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
문제를 해결한 후 다시 테스트하세요.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);
    process.exit(1);
  }
}

// 메인 실행
testAutomationSystem().catch((error) => {
  console.error('❌ 테스트 중 오류:', error);
  process.exit(1);
});
