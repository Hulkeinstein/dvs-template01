#!/usr/bin/env node
/**
 * Claude Safety System 설치 스크립트
 *
 * 사용법:
 *   node .claude/install.js
 *
 * 이 스크립트는:
 * 1. 필요한 디렉토리 구조 생성
 * 2. package.json에 스크립트 추가
 * 3. 권한 설정 (Unix 시스템)
 * 4. 설치 확인
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ClaudeSafetyInstaller {
  constructor() {
    this.projectDir = process.cwd();
    this.claudeDir = path.join(this.projectDir, '.claude');
    this.packageJsonPath = path.join(this.projectDir, 'package.json');
  }

  async install() {
    console.log('🚀 Claude Safety System 설치 시작\n');

    try {
      // 1. 디렉토리 구조 확인 및 생성
      this.createDirectoryStructure();

      // 2. 설정 파일 확인
      this.verifyConfigFiles();

      // 3. package.json 업데이트
      this.updatePackageJson();

      // 4. 실행 권한 설정 (Unix/Linux/Mac)
      this.setExecutablePermissions();

      // 5. .gitignore 확인
      this.verifyGitignore();

      // 6. 설치 검증
      this.verify();

      console.log('\n✅ Claude Safety System 설치 완료!\n');
      this.printUsageInstructions();
    } catch (error) {
      console.error('\n❌ 설치 실패:', error.message);
      process.exit(1);
    }
  }

  createDirectoryStructure() {
    console.log('📁 디렉토리 구조 생성 중...');

    const directories = [
      '.claude',
      '.claude/hooks',
      '.claude/backup',
      '.claude/backup/snapshots',
      '.claude/logs',
      '.claude/emergency',
      '.claude/emergency/snapshots',
      '.claude/emergency/backup',
    ];

    directories.forEach((dir) => {
      const fullPath = path.join(this.projectDir, dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(`   ✓ ${dir}`);
      }
    });
  }

  verifyConfigFiles() {
    console.log('\n📋 설정 파일 확인 중...');

    const requiredFiles = [
      '.claude/settings.json',
      '.claude/hooks/pre-exec.js',
      '.claude/hooks/file-safety.js',
      '.claude/hooks/git-safety.js',
      '.claude/hooks/db-safety.js',
      '.claude/backup/auto-backup.js',
      '.claude/emergency/stop.js',
    ];

    const missingFiles = [];
    requiredFiles.forEach((file) => {
      const fullPath = path.join(this.projectDir, file);
      if (fs.existsSync(fullPath)) {
        console.log(`   ✓ ${file}`);
      } else {
        missingFiles.push(file);
        console.log(`   ✗ ${file} (누락됨)`);
      }
    });

    if (missingFiles.length > 0) {
      console.warn(
        '\n⚠️  일부 파일이 누락되었습니다. 수동으로 생성하거나 저장소에서 복사하세요.'
      );
    }
  }

  updatePackageJson() {
    console.log('\n📦 package.json 업데이트 중...');

    if (!fs.existsSync(this.packageJsonPath)) {
      console.warn('   ⚠️  package.json을 찾을 수 없습니다.');
      return;
    }

    const packageJson = JSON.parse(
      fs.readFileSync(this.packageJsonPath, 'utf8')
    );

    // scripts 섹션이 없으면 생성
    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }

    // Claude 관련 스크립트 추가
    const claudeScripts = {
      'claude:emergency-stop': 'node .claude/emergency/stop.js',
      'claude:resume': 'node .claude/emergency/stop.js resume',
      'claude:backup-list':
        'node -e "const m=require(\'./.claude/backup/auto-backup.js\');new m.constructor().list().forEach(s=>console.log(s))"',
      'claude:verify': 'node .claude/install.js verify',
      'claude:uninstall': 'node .claude/install.js uninstall',
    };

    let updated = false;
    Object.entries(claudeScripts).forEach(([key, value]) => {
      if (!packageJson.scripts[key]) {
        packageJson.scripts[key] = value;
        console.log(`   ✓ 스크립트 추가: ${key}`);
        updated = true;
      }
    });

    if (updated) {
      fs.writeFileSync(
        this.packageJsonPath,
        JSON.stringify(packageJson, null, 2) + '\n'
      );
      console.log('   ✓ package.json 업데이트 완료');
    } else {
      console.log('   ℹ️  모든 스크립트가 이미 존재합니다');
    }
  }

  setExecutablePermissions() {
    // Windows에서는 건너뛰기
    if (process.platform === 'win32') {
      console.log('\n🔧 Windows 환경 - 권한 설정 건너뛰기');
      return;
    }

    console.log('\n🔧 실행 권한 설정 중...');

    const executableFiles = [
      '.claude/hooks/pre-exec.js',
      '.claude/hooks/file-safety.js',
      '.claude/hooks/git-safety.js',
      '.claude/hooks/db-safety.js',
      '.claude/backup/auto-backup.js',
      '.claude/emergency/stop.js',
      '.claude/install.js',
    ];

    executableFiles.forEach((file) => {
      const fullPath = path.join(this.projectDir, file);
      if (fs.existsSync(fullPath)) {
        try {
          fs.chmodSync(fullPath, 0o755);
          console.log(`   ✓ ${file}`);
        } catch (error) {
          console.warn(`   ⚠️  ${file}: ${error.message}`);
        }
      }
    });
  }

  verifyGitignore() {
    console.log('\n📝 .gitignore 확인 중...');

    const gitignorePath = path.join(this.projectDir, '.gitignore');

    if (!fs.existsSync(gitignorePath)) {
      console.warn('   ⚠️  .gitignore 파일이 없습니다.');
      return;
    }

    const gitignore = fs.readFileSync(gitignorePath, 'utf8');
    const requiredPatterns = [
      '.claude/logs/*.log',
      '.claude/backup/snapshots/*',
      '.claude/emergency/snapshots/*',
      '.claude/EMERGENCY_LOCK',
    ];

    const missingPatterns = requiredPatterns.filter(
      (pattern) => !gitignore.includes(pattern)
    );

    if (missingPatterns.length > 0) {
      console.warn('   ⚠️  다음 패턴을 .gitignore에 추가하세요:');
      missingPatterns.forEach((pattern) => console.log(`      ${pattern}`));
    } else {
      console.log('   ✓ .gitignore 설정 완료');
    }
  }

  verify() {
    console.log('\n🔍 설치 검증 중...');

    // settings.json 검증
    const settingsPath = path.join(this.claudeDir, 'settings.json');
    if (fs.existsSync(settingsPath)) {
      try {
        const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
        if (settings.version && settings.hooks && settings.safety) {
          console.log('   ✓ settings.json 유효');
        } else {
          console.warn('   ⚠️  settings.json 구조 불완전');
        }
      } catch (error) {
        console.error('   ✗ settings.json 파싱 실패:', error.message);
      }
    }

    // 디렉토리 권한 확인
    const dirs = ['.claude/logs', '.claude/backup/snapshots'];
    dirs.forEach((dir) => {
      const fullPath = path.join(this.projectDir, dir);
      try {
        fs.accessSync(fullPath, fs.constants.W_OK);
        console.log(`   ✓ ${dir} 쓰기 가능`);
      } catch {
        console.warn(`   ⚠️  ${dir} 쓰기 권한 없음`);
      }
    });
  }

  printUsageInstructions() {
    console.log('📚 사용 방법:');
    console.log('');
    console.log('  긴급 정지:');
    console.log('    npm run claude:emergency-stop');
    console.log('');
    console.log('  정상 작동 재개:');
    console.log('    npm run claude:resume');
    console.log('');
    console.log('  백업 목록 조회:');
    console.log('    npm run claude:backup-list');
    console.log('');
    console.log('  시스템 검증:');
    console.log('    npm run claude:verify');
    console.log('');
    console.log('📖 자세한 내용은 .claude/README.md를 참조하세요.');
  }

  async uninstall() {
    console.log('🗑️  Claude Safety System 제거 시작\n');

    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const answer = await new Promise((resolve) => {
      rl.question(
        '정말로 제거하시겠습니까? 백업이 모두 삭제됩니다. (yes/no): ',
        resolve
      );
    });
    rl.close();

    if (answer.toLowerCase() !== 'yes') {
      console.log('제거가 취소되었습니다.');
      return;
    }

    // package.json에서 스크립트 제거
    if (fs.existsSync(this.packageJsonPath)) {
      const packageJson = JSON.parse(
        fs.readFileSync(this.packageJsonPath, 'utf8')
      );
      if (packageJson.scripts) {
        Object.keys(packageJson.scripts).forEach((key) => {
          if (key.startsWith('claude:')) {
            delete packageJson.scripts[key];
            console.log(`   ✓ 스크립트 제거: ${key}`);
          }
        });
        fs.writeFileSync(
          this.packageJsonPath,
          JSON.stringify(packageJson, null, 2) + '\n'
        );
      }
    }

    // .claude 디렉토리 제거
    if (fs.existsSync(this.claudeDir)) {
      fs.rmSync(this.claudeDir, { recursive: true, force: true });
      console.log('   ✓ .claude 디렉토리 제거');
    }

    console.log('\n✅ Claude Safety System이 제거되었습니다.');
  }
}

// 실행
const installer = new ClaudeSafetyInstaller();

if (process.argv[2] === 'verify') {
  installer.verify();
} else if (process.argv[2] === 'uninstall') {
  installer.uninstall();
} else {
  installer.install();
}
