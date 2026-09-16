#!/usr/bin/env node

/**
 * Front-matter 검증 스크립트
 *
 * 목적: docs 폴더의 모든 마크다운 파일에서 Front-matter 유효성 검증
 *
 * 검증 항목:
 * - 필수 필드 존재 (title, tags, created, updated, lifecycle)
 * - 네임스페이스 태그 유효성 (phase/, type/, component/, external/, progress/)
 * - lifecycle 값 검증 (active|deprecated|draft)
 * - progress/* 태그 검증
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 프로젝트 루트 경로
const ROOT_DIR = path.join(__dirname, '..');
const DOCS_DIR = path.join(ROOT_DIR, 'docs');

// 유효한 태그 네임스페이스
const VALID_NAMESPACES = {
  phase: ['1', '2', '3'],
  type: ['feature', 'bug', 'docs', 'security', 'performance'],
  component: ['auth', 'payment', 'ui', 'database', 'api'],
  external: ['stripe', 'paypal', 'supabase', 'nextauth'],
  progress: ['completed', 'in-progress', 'backlog', 'blocked'],
};

// 유효한 lifecycle 값
const VALID_LIFECYCLE = ['active', 'deprecated', 'draft'];

// 필수 필드
const REQUIRED_FIELDS = ['title', 'tags', 'created', 'updated', 'lifecycle'];

// 검증 결과 저장
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: [],
};

/**
 * Front-matter 파싱
 */
function parseFrontMatter(content) {
  const frontMatterRegex = /^---\n([\s\S]*?)\n---/;
  const match = content.match(frontMatterRegex);

  if (!match) {
    return null;
  }

  const frontMatter = {};
  const lines = match[1].split('\n');
  let currentKey = null;
  let currentArray = null;

  for (const line of lines) {
    // Array item
    if (line.trim().startsWith('-')) {
      const value = line.trim().substring(1).trim();
      if (currentArray) {
        currentArray.push(value);
      }
    }
    // Key-value pair
    else if (line.includes(':')) {
      const [key, ...valueParts] = line.split(':');
      const value = valueParts.join(':').trim();
      currentKey = key.trim();

      if (value === '') {
        // Start of array
        currentArray = [];
        frontMatter[currentKey] = currentArray;
      } else {
        // Simple value
        frontMatter[currentKey] = value.replace(/['"]/g, '');
        currentArray = null;
      }
    }
  }

  return frontMatter;
}

/**
 * 태그 검증
 */
function validateTag(tag, filePath) {
  if (!tag.includes('/')) {
    return `Invalid tag format: "${tag}" (must use namespace format: category/value)`;
  }

  const [namespace, value] = tag.split('/');

  if (!VALID_NAMESPACES[namespace]) {
    return `Invalid namespace: "${namespace}" (valid: ${Object.keys(VALID_NAMESPACES).join(', ')})`;
  }

  if (!VALID_NAMESPACES[namespace].includes(value)) {
    return `Invalid value for ${namespace}: "${value}" (valid: ${VALID_NAMESPACES[namespace].join(', ')})`;
  }

  return null;
}

/**
 * Front-matter 검증
 */
function validateFrontMatter(frontMatter, filePath) {
  const errors = [];

  if (!frontMatter) {
    errors.push('Missing Front-matter');
    return errors;
  }

  // 필수 필드 검증
  for (const field of REQUIRED_FIELDS) {
    if (!frontMatter[field]) {
      errors.push(`Missing required field: "${field}"`);
    }
  }

  // tags 검증
  if (frontMatter.tags) {
    if (!Array.isArray(frontMatter.tags)) {
      errors.push('Field "tags" must be an array');
    } else {
      for (const tag of frontMatter.tags) {
        const tagError = validateTag(tag, filePath);
        if (tagError) {
          errors.push(tagError);
        }
      }
    }
  }

  // lifecycle 검증
  if (frontMatter.lifecycle) {
    if (!VALID_LIFECYCLE.includes(frontMatter.lifecycle)) {
      errors.push(
        `Invalid lifecycle: "${frontMatter.lifecycle}" (valid: ${VALID_LIFECYCLE.join(', ')})`
      );
    }
  }

  // created/updated 날짜 형식 검증
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (frontMatter.created && !dateRegex.test(frontMatter.created)) {
    errors.push(
      `Invalid date format for "created": "${frontMatter.created}" (expected: YYYY-MM-DD)`
    );
  }
  if (frontMatter.updated && !dateRegex.test(frontMatter.updated)) {
    errors.push(
      `Invalid date format for "updated": "${frontMatter.updated}" (expected: YYYY-MM-DD)`
    );
  }

  return errors;
}

/**
 * 디렉토리 재귀 스캔
 */
function* walkDir(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      yield* walkDir(filePath);
    } else if (file.endsWith('.md')) {
      yield filePath;
    }
  }
}

/**
 * 파일 검증
 */
function validateFile(filePath) {
  const relativePath = path.relative(ROOT_DIR, filePath);
  results.total++;

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const frontMatter = parseFrontMatter(content);
    const errors = validateFrontMatter(frontMatter, relativePath);

    if (errors.length > 0) {
      results.failed++;
      results.errors.push({
        file: relativePath,
        errors,
      });
    } else {
      results.passed++;
    }
  } catch (error) {
    results.failed++;
    results.errors.push({
      file: relativePath,
      errors: [`Read error: ${error.message}`],
    });
  }
}

/**
 * 결과 출력
 */
function printResults() {
  console.log('\n📊 Front-matter Validation Results\n');
  console.log(`Total files: ${results.total}`);
  console.log(`✓ Passed: ${results.passed}`);
  console.log(`✗ Failed: ${results.failed}\n`);

  if (results.errors.length > 0) {
    console.log('❌ Files with errors:\n');

    for (const { file, errors } of results.errors) {
      console.log(`  ${file}`);
      for (const error of errors) {
        console.log(`    - ${error}`);
      }
      console.log('');
    }

    process.exit(1);
  } else {
    console.log('✅ All Front-matter valid!');
    process.exit(0);
  }
}

/**
 * 메인 실행
 */
function main() {
  console.log('🔍 Validating Front-matter in docs folder...\n');

  if (!fs.existsSync(DOCS_DIR)) {
    console.error(`❌ Error: docs folder not found at ${DOCS_DIR}`);
    process.exit(1);
  }

  for (const filePath of walkDir(DOCS_DIR)) {
    validateFile(filePath);
  }

  printResults();
}

// 실행
main();
