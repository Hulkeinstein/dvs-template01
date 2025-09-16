#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const toolInput = JSON.parse(process.env.CLAUDE_TOOL_INPUT || '{}');
const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();

class AutoBackupManager {
  constructor() {
    this.backupDir = path.join(projectDir, '.claude/backup');
    this.snapshotDir = path.join(this.backupDir, 'snapshots');
    this.metadataFile = path.join(this.backupDir, 'metadata.json');

    // 백업 설정
    this.config = {
      maxSnapshots: 50, // 최대 스냅샷 수
      maxSizePerFile: 10485760, // 10MB
      compressionEnabled: true,
      retentionDays: 7,
    };

    // 중요 파일 패턴
    this.importantPatterns = [
      'package.json',
      'package-lock.json',
      '.env*',
      '*.config.js',
      '*.config.ts',
      'tsconfig.json',
    ];

    this.ensureDirectories();
  }

  ensureDirectories() {
    [this.backupDir, this.snapshotDir].forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  async backup() {
    const operation = toolInput.tool || 'Unknown';
    const filePath = toolInput.file_path || toolInput.path;

    // 파일 작업인 경우만 백업
    if (!filePath || !fs.existsSync(filePath)) {
      return;
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileInfo = this.getFileInfo(filePath);

    // 1. 중요 파일 체크
    if (this.isImportantFile(filePath)) {
      console.log(
        `Creating backup for important file: ${path.basename(filePath)}`
      );
      this.createSnapshot(filePath, timestamp, 'important');
    }

    // 2. 삭제 작업 백업
    if (operation === 'Delete') {
      console.log(
        `Creating backup before deletion: ${path.basename(filePath)}`
      );
      this.createSnapshot(filePath, timestamp, 'pre-delete');
    }

    // 3. 대용량 변경 백업
    if (operation === 'Write' || operation === 'Edit') {
      const stats = fs.statSync(filePath);
      if (stats.size > 1024) {
        // 1KB 이상
        this.createSnapshot(filePath, timestamp, 'pre-modify');
      }
    }

    // 4. 메타데이터 업데이트
    this.updateMetadata({
      timestamp,
      operation,
      file: filePath,
      size: fileInfo.size,
      backupCreated: true,
    });

    // 5. 오래된 백업 정리
    this.cleanOldBackups();
  }

  createSnapshot(filePath, timestamp, reason) {
    try {
      const fileName = path.basename(filePath);
      const relativePath = path
        .relative(projectDir, filePath)
        .replace(/[\\/]/g, '_');
      const backupName = `${timestamp}_${reason}_${relativePath}`;
      const backupPath = path.join(this.snapshotDir, backupName);

      // 파일 복사
      fs.copyFileSync(filePath, backupPath);

      // 압축 (옵션)
      if (
        this.config.compressionEnabled &&
        fs.statSync(filePath).size > 1024 * 100
      ) {
        this.compressFile(backupPath);
      }

      console.log(`✓ Backup created: ${backupName}`);
      return backupPath;
    } catch (error) {
      console.error(`Backup failed: ${error.message}`);
      return null;
    }
  }

  compressFile(filePath) {
    try {
      // gzip 압축 (Node.js 내장)
      const zlib = require('zlib');
      const input = fs.createReadStream(filePath);
      const output = fs.createWriteStream(`${filePath}.gz`);
      input.pipe(zlib.createGzip()).pipe(output);

      // 원본 삭제
      output.on('finish', () => {
        fs.unlinkSync(filePath);
      });
    } catch (error) {
      console.error(`Compression failed: ${error.message}`);
    }
  }

  isImportantFile(filePath) {
    const fileName = path.basename(filePath);
    return this.importantPatterns.some((pattern) => {
      if (pattern.includes('*')) {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        return regex.test(fileName);
      }
      return fileName === pattern;
    });
  }

  getFileInfo(filePath) {
    try {
      const stats = fs.statSync(filePath);
      return {
        size: stats.size,
        modified: stats.mtime,
        isDirectory: stats.isDirectory(),
      };
    } catch {
      return { size: 0, modified: null, isDirectory: false };
    }
  }

  updateMetadata(entry) {
    let metadata = [];

    if (fs.existsSync(this.metadataFile)) {
      try {
        metadata = JSON.parse(fs.readFileSync(this.metadataFile, 'utf8'));
      } catch {
        metadata = [];
      }
    }

    metadata.push(entry);

    // 최대 1000개 엔트리 유지
    if (metadata.length > 1000) {
      metadata = metadata.slice(-1000);
    }

    fs.writeFileSync(this.metadataFile, JSON.stringify(metadata, null, 2));
  }

  cleanOldBackups() {
    const now = Date.now();
    const maxAge = this.config.retentionDays * 24 * 60 * 60 * 1000;

    try {
      const files = fs.readdirSync(this.snapshotDir);
      const snapshots = [];

      // 스냅샷 정보 수집
      files.forEach((file) => {
        const filePath = path.join(this.snapshotDir, file);
        const stats = fs.statSync(filePath);
        snapshots.push({
          path: filePath,
          name: file,
          time: stats.mtime.getTime(),
          size: stats.size,
        });
      });

      // 정렬 (오래된 것부터)
      snapshots.sort((a, b) => a.time - b.time);

      // 삭제 대상 결정
      const toDelete = [];

      // 1. 보존 기간 초과
      snapshots.forEach((snapshot) => {
        if (now - snapshot.time > maxAge) {
          toDelete.push(snapshot);
        }
      });

      // 2. 최대 개수 초과
      const remaining = snapshots.filter((s) => !toDelete.includes(s));
      if (remaining.length > this.config.maxSnapshots) {
        const excess = remaining.length - this.config.maxSnapshots;
        toDelete.push(...remaining.slice(0, excess));
      }

      // 삭제 실행
      toDelete.forEach((snapshot) => {
        fs.unlinkSync(snapshot.path);
        console.log(`Cleaned old backup: ${snapshot.name}`);
      });
    } catch (error) {
      console.error(`Cleanup failed: ${error.message}`);
    }
  }

  // 복원 기능
  restore(backupName) {
    const backupPath = path.join(this.snapshotDir, backupName);

    if (!fs.existsSync(backupPath)) {
      console.error(`Backup not found: ${backupName}`);
      return false;
    }

    // 백업 이름에서 원본 경로 추출
    const parts = backupName.split('_');
    const originalPath = parts.slice(3).join('_').replace(/_/g, path.sep);
    const targetPath = path.join(projectDir, originalPath);

    try {
      // 현재 파일 백업 (있다면)
      if (fs.existsSync(targetPath)) {
        const tempBackup = `${targetPath}.current-${Date.now()}`;
        fs.copyFileSync(targetPath, tempBackup);
        console.log(`Current file backed up to: ${tempBackup}`);
      }

      // 복원
      fs.copyFileSync(backupPath, targetPath);
      console.log(`✓ Restored: ${backupName} → ${originalPath}`);
      return true;
    } catch (error) {
      console.error(`Restore failed: ${error.message}`);
      return false;
    }
  }

  // 백업 목록 조회
  list() {
    try {
      const files = fs.readdirSync(this.snapshotDir);
      const snapshots = files.map((file) => {
        const filePath = path.join(this.snapshotDir, file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          size: (stats.size / 1024).toFixed(2) + ' KB',
          date: stats.mtime.toISOString(),
        };
      });

      snapshots.sort((a, b) => new Date(b.date) - new Date(a.date));
      return snapshots;
    } catch {
      return [];
    }
  }
}

// 실행
const manager = new AutoBackupManager();
manager.backup();
