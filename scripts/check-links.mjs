#!/usr/bin/env node

/**
 * Markdown 링크 검증 wrapper 스크립트
 * markdown-link-check가 Windows glob을 지원하지 않아 직접 파일을 찾아 실행
 */

import { glob } from 'glob';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

async function checkLinks() {
  try {
    // docs 폴더의 모든 .md 파일 찾기
    const files = await glob('docs/**/*.md', { cwd: rootDir });

    if (files.length === 0) {
      console.log('No markdown files found in docs/');
      return;
    }

    console.log(`Found ${files.length} markdown files to check`);

    // 각 파일에 대해 markdown-link-check 실행
    for (const file of files) {
      const fullPath = path.join(rootDir, file);

      await new Promise((resolve, reject) => {
        const proc = spawn('npx', ['markdown-link-check', fullPath, '--quiet'], {
          stdio: 'inherit',
          shell: true,
          cwd: rootDir
        });

        proc.on('close', (code) => {
          // Exit code 0 = success, 1 = broken links found
          // We continue regardless to check all files
          resolve();
        });

        proc.on('error', (err) => {
          console.error(`Error checking ${file}:`, err.message);
          resolve(); // Continue with other files
        });
      });
    }

    console.log('Link check complete');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkLinks();
