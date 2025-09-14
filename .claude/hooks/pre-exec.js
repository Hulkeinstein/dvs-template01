#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const toolInput = JSON.parse(process.env.CLAUDE_TOOL_INPUT || '{}');
const command = toolInput.command || process.argv[2];
const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();

// 설정 로드
const settings = JSON.parse(
  fs.readFileSync(path.join(projectDir, '.claude/settings.json'), 'utf8')
);

class CommandValidator {
  constructor(settings) {
    this.settings = settings;
    this.blockedCommands = [
      /rm\s+-rf\s+\/(?:\s|$)/,
      /rm\s+-rf\s+\/\*/,
      /rm\s+-rf\s+\.\s*$/,
      /:\(\)\{.*\|\:.*\};:/,
      /format\s+[cC]:/,
      /> \/dev\//,
      /dd\s+if=/,
      /mkfs/,
      /fdisk/,
    ];

    // 삭제 추적용
    this.deletionLog = path.join(projectDir, '.claude/logs/deletions.json');
  }

  validate(command) {
    // 1. 완전 차단 명령 체크
    for (const pattern of this.blockedCommands) {
      if (pattern.test(command)) {
        this.blockCommand(command, 'Dangerous command detected');
        return false;
      }
    }

    // 2. 확인 필요 명령 체크
    for (const pattern of this.settings.safety.requireConfirmation) {
      const regex = new RegExp(pattern, 'i');
      if (regex.test(command)) {
        this.requestConfirmation(command);
        return false;
      }
    }

    // 3. 삭제율 체크 (rm 명령인 경우)
    if (command.includes('rm ')) {
      if (!this.checkDeletionRate()) {
        this.blockCommand(command, 'Deletion rate limit exceeded');
        return false;
      }
    }

    // 4. 대량 파일 영향 체크
    const affectedFiles = this.estimateAffectedFiles(command);
    if (affectedFiles > this.settings.safety.maxFilesPerOperation) {
      this.requestConfirmation(command, `Affects ${affectedFiles} files`);
      return false;
    }

    return true;
  }

  checkDeletionRate() {
    const now = Date.now();
    let deletions = [];

    if (fs.existsSync(this.deletionLog)) {
      deletions = JSON.parse(fs.readFileSync(this.deletionLog, 'utf8'));
    }

    // 1분 이내 삭제 횟수 체크
    const recentDeletions = deletions.filter((d) => now - d.timestamp < 60000);

    if (recentDeletions.length >= this.settings.safety.maxDeletePerMinute) {
      return false;
    }

    // 삭제 기록 추가
    deletions.push({ timestamp: now });

    // 오래된 기록 정리 (1시간 이상)
    deletions = deletions.filter((d) => now - d.timestamp < 3600000);

    fs.writeFileSync(this.deletionLog, JSON.stringify(deletions));
    return true;
  }

  blockCommand(command, reason) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      command,
      reason,
      blocked: true,
    };

    // 로그 기록
    const logPath = path.join(projectDir, '.claude/logs/blocked.log');
    fs.mkdirSync(path.dirname(logPath), { recursive: true });
    fs.appendFileSync(logPath, JSON.stringify(logEntry) + '\n');

    console.error(`BLOCKED: ${reason}`);
    console.error(`Command: ${command}`);
    process.exit(1);
  }

  requestConfirmation(command, reason = '') {
    console.error(
      `CONFIRM_REQUIRED: ${reason || 'This command requires user confirmation'}`
    );
    console.error(`Command: ${command}`);
    process.exit(2);
  }

  estimateAffectedFiles(command) {
    if (command.includes('**')) return 1000;
    if (command.includes('*')) return 100;
    if (command.includes('-r') || command.includes('-R')) return 50;
    return 1;
  }
}

// 실행
const validator = new CommandValidator(settings);
if (!validator.validate(command)) {
  process.exit(1);
}
