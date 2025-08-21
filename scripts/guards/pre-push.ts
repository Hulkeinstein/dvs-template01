#!/usr/bin/env tsx
/**
 * Pre-push Guard Script
 * Push 전에 품질 체크를 수행하는 스크립트
 */

import { execSync } from 'child_process';
import { TestQualityChecker } from './check-test-quality';

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

async function main() {
  console.log(`${BLUE}🛡️  Running pre-push quality checks...${RESET}\n`);
  
  // 1. Run tests
  console.log('📝 Running tests...');
  try {
    execSync('npm run test:coverage', { stdio: 'inherit' });
    console.log(`${GREEN}✅ Tests passed${RESET}\n`);
  } catch (error) {
    console.error(`${RED}❌ Tests failed. Push aborted.${RESET}`);
    process.exit(1);
  }
  
  // 2. Run quality checks
  const checker = new TestQualityChecker();
  const qualityPassed = await checker.runAllChecks();
  
  if (!qualityPassed) {
    console.error(`\n${RED}❌ Quality checks failed. Push aborted.${RESET}`);
    console.log(`${YELLOW}💡 Fix the issues above and try again.${RESET}`);
    process.exit(1);
  }
  
  // 3. Check for uncommitted changes
  console.log('\n📝 Checking for uncommitted changes...');
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    if (status.trim()) {
      console.warn(`${YELLOW}⚠️  Warning: You have uncommitted changes:${RESET}`);
      console.log(status);
      console.log(`${YELLOW}Consider committing or stashing them.${RESET}`);
    } else {
      console.log(`${GREEN}✅ Working directory clean${RESET}`);
    }
  } catch (error) {
    console.error('Error checking git status');
  }
  
  console.log(`\n${GREEN}✅ All pre-push checks passed!${RESET}`);
  console.log(`${BLUE}🚀 Ready to push${RESET}`);
}

// Run
main().catch(error => {
  console.error(`${RED}Unexpected error:${RESET}`, error);
  process.exit(1);
});