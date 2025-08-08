#!/usr/bin/env node
import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import {
  fileExists,
  readFile,
  writeFile,
  getKoreanDate,
} from './lib/file-utils';
import { parseClosesPattern, getCurrentBranch } from './lib/git-utils';

/**
 * 색상 코드
 */
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

/**
 * 자동화 시스템 테스트
 */
async function testAutomationSystem() {
  console.log(`${colors.cyan}🧪 자동화 시스템 통합 테스트${colors.reset}\n`);
  console.log('='.repeat(50));

  const tests = [
    {
      name: '📦 필수 파일 존재 여부',
      test: () => {
        const projectRoot = path.resolve(__dirname, '../..');
        const requiredFiles = [
          'DEVELOPMENT_PLAN.md',
          'COMPLETED_TASKS.md',
          '.husky/pre-commit',
          '.husky/post-commit',
          '.lintstagedrc.json',
          'docs/AUTOMATION_GUIDE.md',
          'docs/WORKFLOW_EXAMPLES.md',
        ];

        let allExist = true;
        for (const file of requiredFiles) {
          const fullPath = path.join(projectRoot, file);
          const exists = fileExists(fullPath);
          console.log(`  ${exists ? '✅' : '❌'} ${file}`);
          if (!exists) allExist = false;
        }
        return allExist;
      },
    },
    {
      name: '🔧 npm 스크립트 설정',
      test: () => {
        const packageJson = JSON.parse(
          readFile(path.join(__dirname, '../../package.json'))
        );
        const requiredScripts = [
          'lint',
          'format',
          'format:check',
          'prepare',
          'task:archive',
          'pre-commit',
          'automation:test',
          'pr:create',
          'pr:merge',
        ];

        let allExist = true;
        for (const script of requiredScripts) {
          const exists = packageJson.scripts && packageJson.scripts[script];
          console.log(`  ${exists ? '✅' : '❌'} ${script}`);
          if (!exists) allExist = false;
        }
        return allExist;
      },
    },
    {
      name: '🌿 Git 환경',
      test: () => {
        try {
          const branch = getCurrentBranch();
          const hasRemote = execSync('git remote -v', {
            encoding: 'utf8',
          }).includes('origin');

          console.log(`  브랜치: ${branch}`);
          console.log(`  원격 저장소: ${hasRemote ? '✅ 설정됨' : '❌ 없음'}`);

          return true;
        } catch (error) {
          console.log(`  ❌ Git 설정 오류`);
          return false;
        }
      },
    },
    {
      name: '🎯 Closes 패턴 파싱',
      test: () => {
        const testCases = [
          {
            msg: 'Closes: Phase 1, Task 2',
            expected: { phase: '1', task: '2' },
          },
          { msg: 'Closes: P3, T4', expected: { phase: '3', task: '4' } },
          { msg: '완료: Phase 5, Task 6', expected: { phase: '5', task: '6' } },
          { msg: 'Done: Phase 7, Task 8', expected: { phase: '7', task: '8' } },
          { msg: 'Closes: 9-10', expected: { phase: '9', task: '10' } },
          {
            msg: 'Fixes: Phase 11, Task 12',
            expected: { phase: '11', task: '12' },
          },
        ];

        let allPassed = true;
        for (const testCase of testCases) {
          const result = parseClosesPattern(testCase.msg);
          const passed =
            result &&
            result.phase === testCase.expected.phase &&
            result.task === testCase.expected.task;

          console.log(`  ${passed ? '✅' : '❌'} "${testCase.msg}"`);
          if (!passed) allPassed = false;
        }
        return allPassed;
      },
    },
    {
      name: '🚀 GitHub CLI 설치 (선택사항)',
      test: () => {
        try {
          execSync('gh --version', { stdio: 'ignore' });
          console.log(`  ✅ GitHub CLI 설치됨`);

          // 인증 상태 확인
          try {
            execSync('gh auth status', { stdio: 'ignore' });
            console.log(`  ✅ GitHub 인증 완료`);
          } catch {
            console.log(`  ⚠️  GitHub 인증 필요 (gh auth login)`);
          }
          return true;
        } catch {
          // Windows 전체 경로 시도
          try {
            execSync('"C:\\Program Files\\GitHub CLI\\gh.exe" --version', {
              stdio: 'ignore',
            });
            console.log(`  ✅ GitHub CLI 설치됨 (Windows)`);
            return true;
          } catch {
            console.log(`  ℹ️  GitHub CLI 미설치 (PR 자동화 불가)`);
            return true; // 선택사항이므로 true 반환
          }
        }
      },
    },
  ];

  let allPassed = true;
  const results: { name: string; passed: boolean }[] = [];

  for (const testCase of tests) {
    console.log(`\n${colors.blue}${testCase.name}${colors.reset}`);
    try {
      const passed = testCase.test();
      results.push({ name: testCase.name, passed });
      if (!passed) {
        allPassed = false;
      }
    } catch (error) {
      console.log(`  ${colors.red}❌ 테스트 실행 오류${colors.reset}`);
      results.push({ name: testCase.name, passed: false });
      allPassed = false;
    }
  }

  // 시뮬레이션 테스트
  console.log(`\n${colors.magenta}📝 시뮬레이션 테스트${colors.reset}`);
  await runSimulationTest();

  // 결과 요약
  console.log('\n' + '='.repeat(50));
  console.log(`${colors.cyan}📊 테스트 결과 요약${colors.reset}\n`);

  const passedCount = results.filter((r) => r.passed).length;
  const totalCount = results.length;
  const percentage = Math.round((passedCount / totalCount) * 100);

  console.log(`통과: ${passedCount}/${totalCount} (${percentage}%)`);

  const progressBar =
    '█'.repeat(Math.floor(percentage / 5)) +
    '░'.repeat(20 - Math.floor(percentage / 5));
  console.log(`진행도: [${progressBar}]`);

  if (allPassed) {
    console.log(`
${colors.green}✅ 모든 테스트 통과!${colors.reset}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
자동화 시스템이 완벽하게 구성되었습니다.

${colors.yellow}🚀 사용 가능한 명령어:${colors.reset}
• npm run lint          - ESLint 실행
• npm run format        - Prettier 포맷팅
• npm run task:archive  - 태스크 아카이빙 (수동)
• npm run pr:create     - PR 생성 도우미
• npm run pr:merge      - PR 머지 도우미
• npm run automation:test - 시스템 테스트

${colors.cyan}📚 문서:${colors.reset}
• docs/AUTOMATION_GUIDE.md - 사용 가이드
• docs/WORKFLOW_EXAMPLES.md - 워크플로우 예시
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);
  } else {
    console.log(`
${colors.red}⚠️  일부 테스트 실패${colors.reset}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
위의 실패한 항목을 확인하고 해결하세요.

${colors.yellow}💡 일반적인 해결 방법:${colors.reset}
1. npm install - 의존성 설치
2. npm run prepare - Husky 설정
3. 필수 파일 생성 확인
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);
    process.exit(1);
  }
}

/**
 * 시뮬레이션 테스트 실행
 */
async function runSimulationTest() {
  const testDir = path.join(__dirname, '../../.test-automation');

  // 테스트 디렉토리 생성
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }

  // 테스트 파일 생성
  const testFile = path.join(testDir, 'test-task.md');
  const testContent = `## Phase 99: Test Phase
- [ ] Task 1: 테스트 태스크
  - 이것은 시뮬레이션 테스트입니다
- [ ] Task 2: 다른 테스트
  - 자동화 검증용`;

  writeFile(testFile, testContent);
  console.log(`  ✅ 테스트 파일 생성`);

  // Closes 패턴 테스트
  const testMessage = 'Closes: Phase 99, Task 1 - 시뮬레이션 테스트';
  const parsed = parseClosesPattern(testMessage);

  if (parsed) {
    console.log(
      `  ✅ 패턴 파싱 성공: Phase ${parsed.phase}, Task ${parsed.task}`
    );
  } else {
    console.log(`  ❌ 패턴 파싱 실패`);
  }

  // 정리
  if (fs.existsSync(testDir)) {
    fs.rmSync(testDir, { recursive: true, force: true });
    console.log(`  ✅ 테스트 파일 정리 완료`);
  }
}

// 메인 실행
testAutomationSystem().catch((error) => {
  console.error(`${colors.red}❌ 테스트 중 오류:${colors.reset}`, error);
  process.exit(1);
});
