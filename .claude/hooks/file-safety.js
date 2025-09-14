#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const toolInput = JSON.parse(process.env.CLAUDE_TOOL_INPUT || '{}');
const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const settings = JSON.parse(
  fs.readFileSync(path.join(projectDir, '.claude/settings.json'), 'utf8')
);

class FileSafetyValidator {
  constructor(settings) {
    this.settings = settings;
    this.protectedPaths = settings.safety.protectedPaths;
  }

  validate(operation, filePath) {
    // 1. 보호된 경로 체크 (개선된 매칭)
    if (this.isProtectedPath(filePath)) {
      // package-lock.json은 경고만
      if (
        filePath.includes('package-lock.json') &&
        this.settings.safety.packageLockMode === 'warn'
      ) {
        console.warn(
          `WARNING: Modifying package-lock.json - proceed with caution`
        );
      } else {
        this.block(`Protected path: ${filePath}`);
        return false;
      }
    }

    // 2. 삭제 작업 추적
    if (operation === 'Delete') {
      this.trackDeletion(filePath);
    }

    // 3. 민감 정보 감지 (Write/Edit만)
    if ((operation === 'Write' || operation === 'Edit') && toolInput.content) {
      if (this.containsSensitiveData(toolInput.content)) {
        this.block('Sensitive data detected in content');
        return false;
      }
    }

    // 4. 백업 생성 (Delete와 기존 파일 덮어쓰기만)
    if (
      operation === 'Delete' ||
      (operation === 'Write' && fs.existsSync(filePath))
    ) {
      this.createBackup(filePath);
    }

    return true;
  }

  isProtectedPath(filePath) {
    const normalizedPath = path.normalize(filePath);

    return this.protectedPaths.some((pattern) => {
      // 간단한 glob 매칭
      const regex = new RegExp(
        pattern
          .replace(/\*\*/g, '.*')
          .replace(/\*/g, '[^/]*')
          .replace(/\./g, '\\.')
      );
      return regex.test(normalizedPath);
    });
  }

  containsSensitiveData(content) {
    const sensitivePatterns = [
      /-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/,
      /aws[_\-]?(?:access[_\-]?key[_\-]?id|secret[_\-]?access[_\-]?key)\s*[:=]/i,
      /api[_\-]?key\s*[:=]\s*["']?[a-zA-Z0-9\-_]{32,}/i,
      /(?:password|passwd|pwd)\s*[:=]\s*["'][^"']{8,}/i,
      /Bearer\s+[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+/,
    ];

    return sensitivePatterns.some((pattern) => pattern.test(content));
  }

  trackDeletion(filePath) {
    const trackingFile = path.join(projectDir, '.claude/logs/operations.log');
    const now = Date.now();

    // 디렉토리 생성
    fs.mkdirSync(path.dirname(trackingFile), { recursive: true });

    // 최근 삭제 기록 확인
    let logs = [];
    if (fs.existsSync(trackingFile)) {
      logs = fs
        .readFileSync(trackingFile, 'utf8')
        .split('\n')
        .filter(Boolean)
        .map((line) => JSON.parse(line));
    }

    const recentDeletions = logs.filter(
      (log) => log.operation === 'DELETE' && now - log.timestamp < 60000
    );

    if (recentDeletions.length >= this.settings.safety.maxDeletePerMinute) {
      this.block('Deletion rate limit exceeded');
      return false;
    }

    // 로그 기록
    const logEntry = {
      timestamp: now,
      operation: 'DELETE',
      path: filePath,
      user: process.env.USER,
    };
    fs.appendFileSync(trackingFile, JSON.stringify(logEntry) + '\n');
  }

  createBackup(filePath) {
    if (!fs.existsSync(filePath)) return;

    const backupDir = path.join(projectDir, '.claude/backup/snapshots');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const relativePath = path
      .relative(projectDir, filePath)
      .replace(/[\/\\]/g, '_');
    const backupPath = path.join(backupDir, `${timestamp}_${relativePath}`);

    try {
      fs.mkdirSync(backupDir, { recursive: true });
      fs.copyFileSync(filePath, backupPath);
      console.log(`Backup created: ${backupPath}`);
    } catch (error) {
      console.error(`Backup failed: ${error.message}`);
    }
  }

  block(reason) {
    console.error(`BLOCKED: ${reason}`);

    // 로그 기록
    const logPath = path.join(projectDir, '.claude/logs/blocked.log');
    fs.mkdirSync(path.dirname(logPath), { recursive: true });
    fs.appendFileSync(
      logPath,
      JSON.stringify({
        timestamp: new Date().toISOString(),
        reason,
        file: toolInput.file_path || toolInput.path,
      }) + '\n'
    );

    process.exit(1);
  }
}

// 실행
const validator = new FileSafetyValidator(settings);
const operation = toolInput.tool || 'Unknown';
const filePath = toolInput.file_path || toolInput.path || '';

if (filePath && !validator.validate(operation, filePath)) {
  process.exit(1);
}
