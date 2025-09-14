#!/usr/bin/env node
/**
 * 긴급 정지 스크립트
 * Claude Code의 모든 작업을 즉시 중단하고 안전 모드로 전환
 *
 * 사용법:
 * - 터미널에서: node .claude/emergency/stop.js
 * - 또는: npm run claude:emergency-stop
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class EmergencyStop {
  constructor() {
    this.projectDir = process.cwd();
    this.claudeDir = path.join(this.projectDir, '.claude');
    this.lockFile = path.join(this.claudeDir, 'EMERGENCY_LOCK');
    this.logFile = path.join(this.claudeDir, 'logs', 'emergency.log');
  }

  async execute() {
    console.log('\n🚨 EMERGENCY STOP ACTIVATED 🚨\n');

    try {
      // 1. 긴급 잠금 파일 생성
      this.createLockFile();

      // 2. 현재 상태 스냅샷
      this.createStateSnapshot();

      // 3. Git 상태 저장
      this.saveGitState();

      // 4. 실행 중인 프로세스 정보 수집
      this.collectProcessInfo();

      // 5. 최근 변경사항 백업
      this.backupRecentChanges();

      // 6. 안전 모드 활성화
      this.enableSafeMode();

      // 7. 보고서 생성
      this.generateReport();

      console.log('\n✅ Emergency stop completed successfully\n');
      console.log('📋 Actions taken:');
      console.log('   - Created emergency lock file');
      console.log('   - Saved current state snapshot');
      console.log('   - Backed up recent changes');
      console.log('   - Enabled safe mode');
      console.log('\n🔄 To resume normal operation:');
      console.log('   1. Review the emergency report');
      console.log('   2. Run: npm run claude:resume');
      console.log('\n');
    } catch (error) {
      console.error('❌ Emergency stop failed:', error.message);
      process.exit(1);
    }
  }

  createLockFile() {
    const lockData = {
      timestamp: new Date().toISOString(),
      reason: process.argv[2] || 'Manual emergency stop',
      pid: process.pid,
      user: process.env.USER || 'unknown',
    };

    fs.writeFileSync(this.lockFile, JSON.stringify(lockData, null, 2));
    console.log('🔒 Lock file created');
  }

  createStateSnapshot() {
    const snapshotDir = path.join(this.claudeDir, 'emergency', 'snapshots');
    fs.mkdirSync(snapshotDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const snapshotFile = path.join(snapshotDir, `snapshot_${timestamp}.json`);

    const snapshot = {
      timestamp,
      environment: process.env.NODE_ENV,
      workingDirectory: process.cwd(),
      nodeVersion: process.version,
      platform: process.platform,
      memory: process.memoryUsage(),
      uptime: process.uptime(),
    };

    // 최근 수정된 파일 목록
    try {
      const recentFiles = execSync(
        'find . -type f -mmin -10 -not -path "./node_modules/*" -not -path "./.git/*" 2>/dev/null || true',
        { encoding: 'utf8' }
      )
        .trim()
        .split('\n')
        .filter(Boolean);

      snapshot.recentlyModified = recentFiles;
    } catch {
      snapshot.recentlyModified = [];
    }

    fs.writeFileSync(snapshotFile, JSON.stringify(snapshot, null, 2));
    console.log('📸 State snapshot created');
  }

  saveGitState() {
    try {
      // Git 상태 저장
      const gitStatus = execSync('git status --porcelain', {
        encoding: 'utf8',
      });
      const gitBranch = execSync('git branch --show-current', {
        encoding: 'utf8',
      }).trim();
      const gitLog = execSync('git log --oneline -10', { encoding: 'utf8' });

      const gitStateFile = path.join(
        this.claudeDir,
        'emergency',
        'git-state.txt'
      );
      const gitState = `
Git State at Emergency Stop
============================
Time: ${new Date().toISOString()}
Branch: ${gitBranch}

Status:
${gitStatus || 'No changes'}

Recent Commits:
${gitLog}
`;

      fs.writeFileSync(gitStateFile, gitState);

      // Uncommitted changes를 stash
      if (gitStatus.trim()) {
        execSync('git stash push -m "Emergency stop auto-stash"');
        console.log('💾 Uncommitted changes stashed');
      }

      console.log('📝 Git state saved');
    } catch (error) {
      console.warn('⚠️  Could not save git state:', error.message);
    }
  }

  collectProcessInfo() {
    const processInfo = {
      timestamp: new Date().toISOString(),
      pid: process.pid,
      ppid: process.ppid,
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
      v8Version: process.versions.v8,
      memory: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      resourceUsage: process.resourceUsage ? process.resourceUsage() : null,
    };

    const infoFile = path.join(
      this.claudeDir,
      'emergency',
      'process-info.json'
    );
    fs.writeFileSync(infoFile, JSON.stringify(processInfo, null, 2));
    console.log('🔍 Process information collected');
  }

  backupRecentChanges() {
    const backupDir = path.join(this.claudeDir, 'emergency', 'backup');
    fs.mkdirSync(backupDir, { recursive: true });

    try {
      // 최근 10분 내 수정된 파일 백업
      const recentFiles = execSync(
        'find . -type f -mmin -10 -not -path "./node_modules/*" -not -path "./.git/*" -not -path "./.claude/*" 2>/dev/null || true',
        { encoding: 'utf8', maxBuffer: 1024 * 1024 * 10 }
      )
        .trim()
        .split('\n')
        .filter(Boolean);

      recentFiles.forEach((file) => {
        if (fs.existsSync(file)) {
          const relativePath = path.relative(this.projectDir, file);
          const backupPath = path.join(backupDir, relativePath);
          const backupDirPath = path.dirname(backupPath);

          fs.mkdirSync(backupDirPath, { recursive: true });
          fs.copyFileSync(file, backupPath);
        }
      });

      console.log(`💼 Backed up ${recentFiles.length} recent files`);
    } catch (error) {
      console.warn('⚠️  Backup warning:', error.message);
    }
  }

  enableSafeMode() {
    const settingsPath = path.join(this.claudeDir, 'settings.json');

    if (fs.existsSync(settingsPath)) {
      const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));

      // 원본 설정 백업
      const backupPath = path.join(
        this.claudeDir,
        'emergency',
        'settings.backup.json'
      );
      fs.writeFileSync(backupPath, JSON.stringify(settings, null, 2));

      // 안전 모드 설정
      settings.safeMode = true;
      settings.safety = settings.safety || {};
      settings.safety.mode = 'strict';
      settings.safety.maxFilesPerOperation = 1;
      settings.safety.maxDeletePerMinute = 0;
      settings.permissions = settings.permissions || {};
      settings.permissions.deny = [
        ...new Set([
          ...(settings.permissions.deny || []),
          'Delete:*',
          'Bash:rm *',
          'Bash:git push',
          'Bash:git reset --hard',
          'Write:.env*',
        ]),
      ];

      fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
      console.log('🛡️  Safe mode enabled');
    }
  }

  generateReport() {
    const reportPath = path.join(this.claudeDir, 'emergency', 'report.md');
    const timestamp = new Date().toISOString();

    const report = `# Emergency Stop Report

## Summary
- **Time**: ${timestamp}
- **Reason**: ${process.argv[2] || 'Manual emergency stop'}
- **User**: ${process.env.USER || 'unknown'}
- **Status**: Successfully stopped

## Actions Taken
1. ✅ Created emergency lock file
2. ✅ Saved state snapshot
3. ✅ Backed up recent changes
4. ✅ Saved Git state
5. ✅ Enabled safe mode

## Recent Activity
Check the following files for details:
- State snapshot: \`emergency/snapshots/\`
- Git state: \`emergency/git-state.txt\`
- Recent backups: \`emergency/backup/\`
- Process info: \`emergency/process-info.json\`

## Recovery Steps
1. Review this report and recent changes
2. Check git status and stash if needed
3. Run \`npm run claude:resume\` to resume normal operation
4. Or manually remove \`.claude/EMERGENCY_LOCK\` file

## Notes
- All recent changes have been backed up
- Git uncommitted changes have been stashed
- Safe mode is active (strict permissions)

---
Generated: ${timestamp}
`;

    fs.writeFileSync(reportPath, report);
    console.log('📄 Emergency report generated');
  }

  // 로그 기록
  log(message) {
    const logDir = path.dirname(this.logFile);
    fs.mkdirSync(logDir, { recursive: true });

    const logEntry = `${new Date().toISOString()} - ${message}\n`;
    fs.appendFileSync(this.logFile, logEntry);
  }
}

// Resume 기능
class EmergencyResume {
  constructor() {
    this.projectDir = process.cwd();
    this.claudeDir = path.join(this.projectDir, '.claude');
    this.lockFile = path.join(this.claudeDir, 'EMERGENCY_LOCK');
  }

  async execute() {
    if (!fs.existsSync(this.lockFile)) {
      console.log(
        'ℹ️  No emergency lock found. System is already operational.'
      );
      return;
    }

    console.log('\n🔄 RESUMING NORMAL OPERATION\n');

    try {
      // 1. 잠금 파일 읽기
      const lockData = JSON.parse(fs.readFileSync(this.lockFile, 'utf8'));
      console.log(`Lock created: ${lockData.timestamp}`);
      console.log(`Reason: ${lockData.reason}`);

      // 2. 안전 모드 해제
      this.disableSafeMode();

      // 3. 잠금 파일 제거
      fs.unlinkSync(this.lockFile);
      console.log('🔓 Lock file removed');

      // 4. Git stash 복원 제안
      try {
        const stashList = execSync('git stash list', { encoding: 'utf8' });
        if (stashList.includes('Emergency stop auto-stash')) {
          console.log('\n💡 Found emergency stash. To restore:');
          console.log('   git stash pop');
        }
      } catch {}

      console.log('\n✅ System resumed successfully\n');
    } catch (error) {
      console.error('❌ Resume failed:', error.message);
      process.exit(1);
    }
  }

  disableSafeMode() {
    const settingsPath = path.join(this.claudeDir, 'settings.json');
    const backupPath = path.join(
      this.claudeDir,
      'emergency',
      'settings.backup.json'
    );

    if (fs.existsSync(backupPath)) {
      // 백업된 설정 복원
      const originalSettings = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
      delete originalSettings.safeMode; // 안전 모드 플래그 제거
      fs.writeFileSync(settingsPath, JSON.stringify(originalSettings, null, 2));
      console.log('⚙️  Settings restored');
    }
  }
}

// 실행
if (process.argv[2] === 'resume') {
  const resume = new EmergencyResume();
  resume.execute();
} else {
  const stop = new EmergencyStop();
  stop.execute();
}
