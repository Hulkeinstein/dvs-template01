#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 색상 코드
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 민감한 패턴 정의
const sensitivePatterns = [
  // API 키 패턴
  /api[_-]?key[\s]*[:=][\s]*['"][a-zA-Z0-9_\-]{20,}['"]/gi,
  /apikey[\s]*[:=][\s]*['"][a-zA-Z0-9_\-]{20,}['"]/gi,

  // AWS 키
  /aws_access_key_id[\s]*[:=][\s]*['"][A-Z0-9]{20}['"]/gi,
  /aws_secret_access_key[\s]*[:=][\s]*['"][a-zA-Z0-9\/+=]{40}['"]/gi,

  // GitHub 토큰
  /ghp_[a-zA-Z0-9]{36}/g,
  /gho_[a-zA-Z0-9]{36}/g,

  // 일반 토큰/시크릿
  /token[\s]*[:=][\s]*['"][a-zA-Z0-9_\-\.]{20,}['"]/gi,
  /secret[\s]*[:=][\s]*['"][a-zA-Z0-9_\-\.]{20,}['"]/gi,
  /password[\s]*[:=][\s]*['"][^'"]{8,}['"]/gi,

  // Private keys
  /-----BEGIN\s+(RSA|DSA|EC|OPENSSH)\s+PRIVATE\s+KEY-----/gi,

  // Database URLs with credentials
  /mongodb(\+srv)?:\/\/[^:]+:[^@]+@/gi,
  /postgres(ql)?:\/\/[^:]+:[^@]+@/gi,
  /mysql:\/\/[^:]+:[^@]+@/gi,
];

// 제외할 파일 패턴
const excludePatterns = [
  /node_modules/,
  /\.git/,
  /\.next/,
  /dist/,
  /build/,
  /coverage/,
  /\.env\.example$/,
  /\.env\.sample$/,
  /package-lock\.json$/,
  /yarn\.lock$/,
];

function scanFile(filePath) {
  // 제외 패턴 확인
  if (excludePatterns.some((pattern) => pattern.test(filePath))) {
    return [];
  }

  // 바이너리 파일 스킵
  const binaryExtensions = [
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.pdf',
    '.zip',
    '.tar',
    '.gz',
    '.exe',
    '.dll',
  ];
  if (binaryExtensions.some((ext) => filePath.endsWith(ext))) {
    return [];
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];

    sensitivePatterns.forEach((pattern) => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach((match) => {
          // 라인 번호 찾기
          const lines = content.split('\n');
          const lineIndex = lines.findIndex((line) => line.includes(match));

          issues.push({
            file: filePath,
            line: lineIndex + 1,
            match: match.substring(0, 50) + (match.length > 50 ? '...' : ''),
            pattern: pattern.source.substring(0, 30) + '...',
          });
        });
      }
    });

    return issues;
  } catch (error) {
    // 파일 읽기 실패 시 스킵
    return [];
  }
}

function getGitFiles() {
  try {
    // staged 파일 목록
    const staged = execSync('git diff --cached --name-only', {
      encoding: 'utf8',
    })
      .split('\n')
      .filter(Boolean);

    // 변경된 파일 목록
    const modified = execSync('git diff --name-only', { encoding: 'utf8' })
      .split('\n')
      .filter(Boolean);

    return [...new Set([...staged, ...modified])];
  } catch {
    return [];
  }
}

async function scanSecrets() {
  log('blue', '🔐 시크릿 스캔 중...');

  // gitleaks 설치 확인 (선택적)
  let hasGitleaks = false;
  try {
    execSync('gitleaks version', { stdio: 'pipe' });
    hasGitleaks = true;
  } catch {
    // gitleaks가 없으면 내장 스캐너 사용
  }

  if (hasGitleaks) {
    // gitleaks 사용
    try {
      execSync('gitleaks detect --source . --verbose', { stdio: 'pipe' });
      log('green', '✅ Gitleaks 스캔 통과');
    } catch (error) {
      log('red', '🚨 Gitleaks가 민감 정보를 감지했습니다!');
      console.log(error.stdout || error.stderr);
      process.exit(1);
    }
  } else {
    // 내장 스캐너 사용
    const files = getGitFiles();

    if (files.length === 0) {
      log('gray', '  스캔할 파일이 없습니다');
      return;
    }

    let totalIssues = [];

    files.forEach((file) => {
      const issues = scanFile(file);
      totalIssues = totalIssues.concat(issues);
    });

    if (totalIssues.length > 0) {
      log('red', '\n🚨 민감 정보 감지!');
      console.log('\n발견된 문제:');

      totalIssues.forEach((issue) => {
        console.log(`  ${issue.file}:${issue.line}`);
        console.log(`    내용: ${issue.match}`);
      });

      log('yellow', '\n💡 해결 방법:');
      console.log('  1. 민감한 정보를 .env 파일로 이동');
      console.log('  2. .env 파일이 .gitignore에 포함되어 있는지 확인');
      console.log('  3. 코드에서는 process.env.변수명 사용');
      console.log('  4. .env.example 파일에 템플릿만 제공\n');

      process.exit(1);
    }

    log('green', '✅ 시크릿 스캔 통과 (내장 스캐너)');
  }

  // .env 파일이 gitignore에 있는지 확인
  const gitignorePath = path.join(process.cwd(), '.gitignore');
  if (fs.existsSync(gitignorePath)) {
    const gitignore = fs.readFileSync(gitignorePath, 'utf8');
    if (!gitignore.includes('.env') || gitignore.includes('!.env')) {
      log(
        'yellow',
        '⚠️ 경고: .env 파일이 .gitignore에 없거나 제외되어 있습니다'
      );
    }
  }
}

// 메인 실행
if (require.main === module) {
  scanSecrets().catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
}

module.exports = { scanSecrets };
