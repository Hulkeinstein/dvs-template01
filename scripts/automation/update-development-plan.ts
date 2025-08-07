#!/usr/bin/env node
import * as path from 'path';
import {
  getCurrentBranch,
  getLastCommitMessage,
  getLastCommitHash,
  getCommitAuthor,
  getChangedFiles,
  parseClosesPattern,
  isMainBranch,
} from './lib/git-utils';
import {
  readFile,
  writeFile,
  fileExists,
  findTaskInDevelopmentPlan,
  removeTaskFromDevelopmentPlan,
  addTaskToCompletedTasks,
  getKoreanDate,
} from './lib/file-utils';

/**
 * 태스크 아카이빙 메인 함수
 */
async function archiveCompletedTask() {
  console.log('🔍 태스크 아카이빙 프로세스 시작...');

  // 1. main 브랜치 확인
  if (!isMainBranch()) {
    console.log('📌 main 브랜치가 아닙니다. 아카이빙을 건너뜁니다.');
    return;
  }

  // 2. 커밋 메시지 확인
  const commitMessage = getLastCommitMessage();
  console.log(`📝 커밋 메시지: ${commitMessage}`);

  const closesInfo = parseClosesPattern(commitMessage);
  if (!closesInfo) {
    console.log('ℹ️ Closes 패턴을 찾을 수 없습니다. 아카이빙을 건너뜁니다.');
    return;
  }

  console.log(
    `✅ Closes 패턴 감지: Phase ${closesInfo.phase}, Task ${closesInfo.task}`
  );

  // 3. 파일 경로 설정
  const projectRoot = path.resolve(__dirname, '../..');
  const devPlanPath = path.join(projectRoot, 'DEVELOPMENT_PLAN.md');
  const completedTasksPath = path.join(projectRoot, 'COMPLETED_TASKS.md');

  // 4. DEVELOPMENT_PLAN.md 읽기
  if (!fileExists(devPlanPath)) {
    console.error('❌ DEVELOPMENT_PLAN.md 파일을 찾을 수 없습니다.');
    return;
  }

  const devPlanContent = readFile(devPlanPath);

  // 5. 태스크 찾기
  const taskContent = findTaskInDevelopmentPlan(
    devPlanContent,
    closesInfo.phase,
    closesInfo.task
  );
  if (!taskContent) {
    console.log(
      `⚠️ Phase ${closesInfo.phase}, Task ${closesInfo.task}를 찾을 수 없습니다.`
    );
    return;
  }

  console.log(`📋 태스크 내용 찾음:\n${taskContent}`);

  // 6. 메타데이터 수집
  const commitHash = getLastCommitHash();
  const author = getCommitAuthor();
  const changedFiles = getChangedFiles();
  const date = getKoreanDate();

  // 7. COMPLETED_TASKS.md 업데이트
  let completedContent = '';
  if (fileExists(completedTasksPath)) {
    completedContent = readFile(completedTasksPath);
  }

  const updatedCompletedContent = addTaskToCompletedTasks(completedContent, {
    phase: closesInfo.phase,
    task: closesInfo.task,
    description: taskContent,
    date,
    commitHash,
    author,
    files: changedFiles,
  });

  if (!writeFile(completedTasksPath, updatedCompletedContent)) {
    console.error('❌ COMPLETED_TASKS.md 업데이트 실패');
    return;
  }

  console.log('✅ COMPLETED_TASKS.md에 태스크 추가 완료');

  // 8. DEVELOPMENT_PLAN.md에서 태스크 제거
  const updatedDevPlanContent = removeTaskFromDevelopmentPlan(
    devPlanContent,
    closesInfo.phase,
    closesInfo.task
  );

  if (!writeFile(devPlanPath, updatedDevPlanContent)) {
    console.error('❌ DEVELOPMENT_PLAN.md 업데이트 실패');
    return;
  }

  console.log('✅ DEVELOPMENT_PLAN.md에서 태스크 제거 완료');

  // 9. 완료 메시지
  console.log(`
🎉 태스크 아카이빙 완료!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 Phase ${closesInfo.phase}, Task ${closesInfo.task}
👤 작업자: ${author}
🔗 커밋: ${commitHash}
📅 완료일: ${date}
📁 변경 파일: ${changedFiles.length}개
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
}

// 에러 핸들링
process.on('uncaughtException', (error) => {
  console.error('❌ 예기치 않은 오류:', error);
  process.exit(0); // 커밋은 차단하지 않음
});

// 메인 실행
archiveCompletedTask().catch((error) => {
  console.error('❌ 아카이빙 중 오류:', error);
  process.exit(0); // 커밋은 차단하지 않음
});
