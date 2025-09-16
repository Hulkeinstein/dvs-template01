#!/usr/bin/env node
const { execSync } = require('child_process');

const toolInput = JSON.parse(process.env.CLAUDE_TOOL_INPUT || '{}');
const command = toolInput.command || process.argv.slice(2).join(' ');

// Git 명령이 아니면 즉시 종료
if (!command.includes('git ')) {
  process.exit(0);
}

class GitSafetyValidator {
  constructor() {
    this.protectedBranches = ['main', 'master', 'production'];
    this.dangerousCommands = [
      /git\s+push\s+.*(?:--force|-f)/,
      /git\s+reset\s+--hard\s+HEAD~\d+/,
      /git\s+clean\s+-[fd]+/,
    ];
  }

  validate(command) {
    // 1. 위험 명령 차단
    for (const pattern of this.dangerousCommands) {
      if (pattern.test(command)) {
        console.error(`BLOCKED: Dangerous git command - ${command}`);
        process.exit(1);
      }
    }

    // 2. 보호된 브랜치 체크
    const currentBranch = this.getCurrentBranch();
    if (this.protectedBranches.includes(currentBranch)) {
      if (command.includes('push') && !command.includes('origin')) {
        console.error(`BLOCKED: Cannot push directly to ${currentBranch}`);
        process.exit(1);
      }
    }

    // 3. 미커밋 변경사항 자동 stash
    if (command.includes('reset') || command.includes('checkout')) {
      if (this.hasUncommittedChanges()) {
        console.warn('Auto-stashing uncommitted changes...');
        try {
          execSync('git stash push -m "Auto-stash by Claude safety"');
        } catch (error) {
          console.error('Failed to auto-stash:', error.message);
        }
      }
    }

    return true;
  }

  getCurrentBranch() {
    try {
      return execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    } catch {
      return '';
    }
  }

  hasUncommittedChanges() {
    try {
      const status = execSync('git status --porcelain', { encoding: 'utf8' });
      return status.length > 0;
    } catch {
      return false;
    }
  }
}

// 실행
const validator = new GitSafetyValidator();
validator.validate(command);
