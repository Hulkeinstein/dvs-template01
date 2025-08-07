import { execSync } from 'child_process';

/**
 * Git 유틸리티 함수들
 */

/**
 * 현재 브랜치 이름 가져오기
 */
export function getCurrentBranch(): string {
  try {
    const branch = execSync('git branch --show-current', {
      encoding: 'utf8',
    }).trim();
    return branch;
  } catch (error) {
    console.error('Failed to get current branch:', error);
    return '';
  }
}

/**
 * 최근 커밋 메시지 가져오기
 */
export function getLastCommitMessage(): string {
  try {
    const message = execSync('git log -1 --pretty=%B', {
      encoding: 'utf8',
    }).trim();
    return message;
  } catch (error) {
    console.error('Failed to get last commit message:', error);
    return '';
  }
}

/**
 * 최근 커밋 해시 가져오기
 */
export function getLastCommitHash(): string {
  try {
    const hash = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
    return hash.substring(0, 7); // 짧은 해시 반환
  } catch (error) {
    console.error('Failed to get last commit hash:', error);
    return '';
  }
}

/**
 * 커밋 작성자 이름 가져오기
 */
export function getCommitAuthor(): string {
  try {
    const author = execSync('git config user.name', {
      encoding: 'utf8',
    }).trim();
    return author;
  } catch (error) {
    console.error('Failed to get commit author:', error);
    return 'Unknown';
  }
}

/**
 * 변경된 파일 목록 가져오기 (최대 5개)
 */
export function getChangedFiles(maxFiles: number = 5): string[] {
  try {
    const files = execSync('git diff-tree --no-commit-id --name-only -r HEAD', {
      encoding: 'utf8',
    })
      .trim()
      .split('\n')
      .filter((file) => file.length > 0)
      .slice(0, maxFiles);
    return files;
  } catch (error) {
    console.error('Failed to get changed files:', error);
    return [];
  }
}

/**
 * 커밋 메시지에서 Closes 패턴 파싱
 * 예: "Closes: Phase 1, Task 2" -> { phase: 1, task: 2 }
 */
export function parseClosesPattern(
  message: string
): { phase: string; task: string } | null {
  // 다양한 패턴 지원
  const patterns = [
    /Closes:\s*Phase\s*(\d+),\s*Task\s*(\d+)/i,
    /Closes:\s*P(\d+),\s*T(\d+)/i,
    /완료:\s*Phase\s*(\d+),\s*Task\s*(\d+)/i,
    /Done:\s*Phase\s*(\d+),\s*Task\s*(\d+)/i,
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match) {
      return {
        phase: match[1],
        task: match[2],
      };
    }
  }

  return null;
}

/**
 * main 브랜치인지 확인
 */
export function isMainBranch(): boolean {
  const branch = getCurrentBranch();
  return branch === 'main' || branch === 'master';
}
