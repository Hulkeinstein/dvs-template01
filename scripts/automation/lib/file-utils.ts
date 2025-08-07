import * as fs from 'fs';
import * as path from 'path';

/**
 * 파일 유틸리티 함수들
 */

/**
 * 파일 읽기
 */
export function readFile(filePath: string): string {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Failed to read file ${filePath}:`, error);
    return '';
  }
}

/**
 * 파일 쓰기
 */
export function writeFile(filePath: string, content: string): boolean {
  try {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  } catch (error) {
    console.error(`Failed to write file ${filePath}:`, error);
    return false;
  }
}

/**
 * 파일 존재 여부 확인
 */
export function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

/**
 * DEVELOPMENT_PLAN.md에서 특정 태스크 찾기
 */
export function findTaskInDevelopmentPlan(
  content: string,
  phase: string,
  task: string
): string | null {
  const lines = content.split('\n');
  const phasePattern = new RegExp(`Phase\\s*${phase}`, 'i');
  const taskPattern = new RegExp(`Task\\s*${task}|\\b${task}\\.\\s*`, 'i');

  let inTargetPhase = false;
  let taskContent: string[] = [];
  let foundTask = false;

  for (const line of lines) {
    // Phase 섹션 찾기
    if (line.includes('Phase') && phasePattern.test(line)) {
      inTargetPhase = true;
      continue;
    }

    // 다른 Phase 섹션 시작
    if (inTargetPhase && line.includes('Phase') && !phasePattern.test(line)) {
      break;
    }

    // 해당 Phase 내에서 Task 찾기
    if (inTargetPhase && taskPattern.test(line)) {
      foundTask = true;
      taskContent.push(line);
      continue;
    }

    // Task 내용 수집 (들여쓰기된 라인)
    if (foundTask && line.match(/^\s{2,}[-*]|^\s{4,}/)) {
      taskContent.push(line);
    } else if (foundTask && line.trim() && !line.match(/^\s/)) {
      // 새로운 Task 시작
      break;
    }
  }

  return taskContent.length > 0 ? taskContent.join('\n') : null;
}

/**
 * DEVELOPMENT_PLAN.md에서 태스크 제거
 */
export function removeTaskFromDevelopmentPlan(
  content: string,
  phase: string,
  task: string
): string {
  const lines = content.split('\n');
  const phasePattern = new RegExp(`Phase\\s*${phase}`, 'i');
  const taskPattern = new RegExp(`Task\\s*${task}|\\b${task}\\.\\s*`, 'i');

  let inTargetPhase = false;
  let skipTask = false;
  const newLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Phase 섹션 찾기
    if (line.includes('Phase') && phasePattern.test(line)) {
      inTargetPhase = true;
    } else if (
      inTargetPhase &&
      line.includes('Phase') &&
      !phasePattern.test(line)
    ) {
      inTargetPhase = false;
    }

    // 해당 Task 찾기
    if (inTargetPhase && taskPattern.test(line)) {
      skipTask = true;
      continue; // 이 라인 건너뛰기
    }

    // Task 내용 건너뛰기
    if (skipTask) {
      if (line.match(/^\s{2,}[-*]|^\s{4,}/)) {
        continue; // 들여쓰기된 내용 건너뛰기
      } else if (line.trim() && !line.match(/^\s/)) {
        skipTask = false; // 새로운 섹션 시작
      }
    }

    if (!skipTask) {
      newLines.push(line);
    }
  }

  return newLines.join('\n');
}

/**
 * COMPLETED_TASKS.md에 태스크 추가
 */
export function addTaskToCompletedTasks(
  content: string,
  taskInfo: {
    phase: string;
    task: string;
    description: string;
    date: string;
    commitHash: string;
    author: string;
    files: string[];
  }
): string {
  const newEntry = `
## Phase ${taskInfo.phase}, Task ${taskInfo.task}
**완료일**: ${taskInfo.date}  
**작업자**: ${taskInfo.author}  
**커밋**: \`${taskInfo.commitHash}\`  

### 설명
${taskInfo.description}

### 변경된 파일
${taskInfo.files.map((file) => `- ${file}`).join('\n')}

---
`;

  // 파일이 비어있거나 헤더만 있는 경우
  if (!content.trim() || content.trim() === '# Completed Tasks') {
    return `# Completed Tasks\n\n${newEntry}`;
  }

  // 기존 내용 뒤에 추가
  const lines = content.split('\n');
  let insertIndex = -1;

  // "# Completed Tasks" 헤더 찾기
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('# Completed Tasks')) {
      insertIndex = i + 1;
      // 빈 줄 건너뛰기
      while (insertIndex < lines.length && !lines[insertIndex].trim()) {
        insertIndex++;
      }
      break;
    }
  }

  if (insertIndex === -1) {
    // 헤더가 없으면 맨 앞에 추가
    return `# Completed Tasks\n\n${newEntry}\n${content}`;
  }

  // 헤더 다음에 새 엔트리 삽입
  lines.splice(insertIndex, 0, newEntry);
  return lines.join('\n');
}

/**
 * 현재 날짜를 한국 시간으로 포맷
 */
export function getKoreanDate(): string {
  const now = new Date();
  const kstOffset = 9 * 60; // KST는 UTC+9
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const kstDate = new Date(utc + kstOffset * 60000);

  const year = kstDate.getFullYear();
  const month = String(kstDate.getMonth() + 1).padStart(2, '0');
  const day = String(kstDate.getDate()).padStart(2, '0');
  const hours = String(kstDate.getHours()).padStart(2, '0');
  const minutes = String(kstDate.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes} KST`;
}
