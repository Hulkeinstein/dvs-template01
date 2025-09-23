#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// JSON input from Claude Code
const input = process.argv[2] || '{}';
let toolInput;

try {
  const parsed = JSON.parse(input);
  toolInput = parsed.tool_input || {};
} catch (e) {
  // Not a JSON input, ignore
  process.exit(0);
}

const command = toolInput.command || '';

// Check if this is a git commit or git add command
if (command.includes('git commit') || command.includes('git add')) {
  try {
    // Get staged files
    const stagedFiles = execSync('git diff --cached --name-only', {
      encoding: 'utf8',
    })
      .trim()
      .split('\n')
      .filter((file) => file.length > 0);

    let hasAny = false;
    let hasJs = false;
    const warnings = [];

    stagedFiles.forEach((file) => {
      // Check for .js files
      if (file.endsWith('.js')) {
        warnings.push(
          `⚠️  JavaScript 파일 발견: ${file} (TypeScript로 전환 필요)`
        );
        hasJs = true;
      }

      // Check for any types in .ts/.tsx files
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        try {
          const content = fs.readFileSync(file, 'utf8');
          if (content.includes(': any') || content.includes('<any>')) {
            warnings.push(`⚠️  'any' 타입 발견: ${file}`);
            hasAny = true;
          }
        } catch (e) {
          // File might not exist or be readable, ignore
        }
      }
    });

    // Output warnings to stderr so they show up in Claude Code
    if (warnings.length > 0) {
      warnings.forEach((warning) => console.error(warning));
      console.error(
        '💡 코드 품질 개선이 필요합니다. 다음 커밋에서 수정해주세요.'
      );
    }
  } catch (e) {
    // Git command failed, probably not in a git repo
  }
}

// Always exit 0 to not block the operation
process.exit(0);
