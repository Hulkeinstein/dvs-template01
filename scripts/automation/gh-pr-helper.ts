#!/usr/bin/env node
import { execSync } from 'child_process';
import * as readline from 'readline';
import { getCurrentBranch, isMainBranch } from './lib/git-utils';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

/**
 * 질문 헬퍼 함수
 */
function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

/**
 * GitHub CLI 설치 확인
 */
function checkGitHubCLI(): boolean {
  try {
    execSync('gh --version', { stdio: 'ignore' });
    return true;
  } catch {
    // Windows에서 전체 경로로 시도
    try {
      execSync('"C:\\Program Files\\GitHub CLI\\gh.exe" --version', {
        stdio: 'ignore',
      });
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * gh 명령어 실행 (Windows 호환)
 */
function runGH(command: string): string {
  try {
    return execSync(`gh ${command}`, { encoding: 'utf8' });
  } catch {
    // Windows 전체 경로로 재시도
    return execSync(`"C:\\Program Files\\GitHub CLI\\gh.exe" ${command}`, {
      encoding: 'utf8',
    });
  }
}

/**
 * PR 생성 헬퍼
 */
async function createPR() {
  console.log('🚀 GitHub PR 생성 도우미\n');

  // GitHub CLI 확인
  if (!checkGitHubCLI()) {
    console.error('❌ GitHub CLI가 설치되지 않았습니다.');
    console.log('\n설치 방법:');
    console.log('Windows: winget install --id GitHub.cli');
    console.log('Mac: brew install gh');
    console.log('Linux: https://github.com/cli/cli#installation');
    process.exit(1);
  }

  // 현재 브랜치 확인
  const currentBranch = getCurrentBranch();
  if (isMainBranch()) {
    console.error('❌ main 브랜치에서는 PR을 생성할 수 없습니다.');
    console.log('feature 브랜치를 생성하세요: git checkout -b feature/새기능');
    process.exit(1);
  }

  console.log(`현재 브랜치: ${currentBranch}\n`);

  // PR 정보 입력
  const title = await question('PR 제목 (예: feat: 새 기능 추가): ');

  console.log('\nPR 설명을 입력하세요 (여러 줄 가능, 완료는 빈 줄 + Enter):');
  const bodyLines: string[] = [];
  let line = await question('');
  while (line.trim() !== '') {
    bodyLines.push(line);
    line = await question('');
  }
  const body = bodyLines.join('\n');

  const labels = await question('\n라벨 (쉼표로 구분, 선택사항): ');

  // PR 생성 명령어 구성
  let prCommand = `pr create --title "${title}"`;

  if (body) {
    // Windows에서 멀티라인 처리
    const escapedBody = body.replace(/"/g, '\\"').replace(/\n/g, '\\n');
    prCommand += ` --body "${escapedBody}"`;
  }

  if (labels) {
    prCommand += ` --label "${labels}"`;
  }

  console.log('\n📝 PR 생성 중...');

  try {
    const result = runGH(prCommand);
    console.log('✅ PR이 성공적으로 생성되었습니다!');
    console.log(result);

    // PR 번호 추출
    const prMatch = result.match(/\/pull\/(\d+)/);
    if (prMatch) {
      const prNumber = prMatch[1];
      console.log(`\n🔗 PR #${prNumber}`);

      const openBrowser = await question('\n브라우저에서 PR을 열까요? (y/n): ');
      if (openBrowser.toLowerCase() === 'y') {
        runGH(`pr view ${prNumber} --web`);
      }
    }
  } catch (error: any) {
    console.error('❌ PR 생성 실패:', error.message);
    console.log('\n수동으로 생성해보세요:');
    console.log(`gh ${prCommand}`);
  }

  rl.close();
}

/**
 * PR 머지 헬퍼
 */
async function mergePR() {
  console.log('🔀 GitHub PR 머지 도우미\n');

  // PR 목록 표시
  console.log('📋 열린 PR 목록:\n');
  try {
    const prList = runGH('pr list');
    console.log(prList);
  } catch {
    console.error('❌ PR 목록을 가져올 수 없습니다.');
    process.exit(1);
  }

  const prNumber = await question('\n머지할 PR 번호: ');

  console.log('\n머지 방법 선택:');
  console.log('1. Squash and merge (권장)');
  console.log('2. Create a merge commit');
  console.log('3. Rebase and merge');

  const mergeMethod = await question('선택 (1-3): ');

  let mergeCommand = `pr merge ${prNumber}`;

  switch (mergeMethod) {
    case '1':
      mergeCommand += ' --squash';
      break;
    case '2':
      mergeCommand += ' --merge';
      break;
    case '3':
      mergeCommand += ' --rebase';
      break;
    default:
      console.error('❌ 잘못된 선택입니다.');
      process.exit(1);
  }

  const deleteBranch = await question(
    '머지 후 브랜치를 삭제하시겠습니까? (y/n): '
  );
  if (deleteBranch.toLowerCase() === 'y') {
    mergeCommand += ' --delete-branch';
  }

  console.log('\n🔀 PR 머지 중...');

  try {
    const result = runGH(mergeCommand);
    console.log('✅ PR이 성공적으로 머지되었습니다!');
    console.log(result);

    console.log('\n다음 단계:');
    console.log('1. git checkout main');
    console.log('2. git pull');

    // 태스크 완료 체크
    const hasTask = await question('\n완료된 태스크가 있나요? (y/n): ');
    if (hasTask.toLowerCase() === 'y') {
      const phase = await question('Phase 번호: ');
      const task = await question('Task 번호: ');
      const description = await question('간단한 설명: ');

      console.log(`\n다음 커밋을 실행하세요:`);
      console.log(
        `git commit --allow-empty -m "Closes: Phase ${phase}, Task ${task} - ${description}"`
      );
    }
  } catch (error: any) {
    console.error('❌ PR 머지 실패:', error.message);
  }

  rl.close();
}

/**
 * 메인 함수
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'create':
      await createPR();
      break;
    case 'merge':
      await mergePR();
      break;
    default:
      console.log('📚 GitHub PR 헬퍼\n');
      console.log('사용법:');
      console.log('  npm run pr:create  - 새 PR 생성');
      console.log('  npm run pr:merge   - PR 머지');
      console.log('\n또는:');
      console.log('  npx tsx scripts/automation/gh-pr-helper.ts create');
      console.log('  npx tsx scripts/automation/gh-pr-helper.ts merge');
      rl.close();
  }
}

// 에러 핸들링
process.on('uncaughtException', (error) => {
  console.error('❌ 예기치 않은 오류:', error);
  rl.close();
  process.exit(1);
});

// 실행
main().catch((error) => {
  console.error('❌ 오류:', error);
  rl.close();
  process.exit(1);
});
