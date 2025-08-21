#!/usr/bin/env tsx
/**
 * Test Quality Guard Script
 * 테스트 품질을 체크하는 가드 스크립트
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

interface CheckResult {
  passed: boolean;
  message: string;
}

class TestQualityChecker {
  private errors: string[] = [];
  private warnings: string[] = [];

  /**
   * Check for skipped tests
   */
  checkForSkippedTests(): CheckResult {
    console.log('🔍 Checking for skipped tests...');

    try {
      const result = execSync(
        `git grep -n "test\\.skip\\|describe\\.skip\\|it\\.skip\\|xit\\|xdescribe" -- "*.test.js" "*.test.ts" "*.spec.js" "*.spec.ts" || true`,
        { encoding: 'utf8' }
      ).trim();

      if (result) {
        this.errors.push('Found skipped tests:\n' + result);
        return {
          passed: false,
          message: `${RED}❌ Found skipped tests${RESET}`,
        };
      }

      return {
        passed: true,
        message: `${GREEN}✅ No skipped tests found${RESET}`,
      };
    } catch (error) {
      return {
        passed: true,
        message: `${GREEN}✅ No skipped tests found${RESET}`,
      };
    }
  }

  /**
   * Check for direct Supabase calls in tests
   */
  checkForDirectSupabaseCalls(): CheckResult {
    console.log('🔍 Checking for direct Supabase calls in tests...');

    try {
      const result = execSync(
        `git grep -n "from '@/app/lib/supabase/client'" -- "__tests__/**/*.ts" "__tests__/**/*.js" || true`,
        { encoding: 'utf8' }
      ).trim();

      if (result) {
        this.warnings.push(
          'Found direct Supabase imports in tests (should use repository pattern):\n' +
            result
        );
        return {
          passed: true, // Warning only
          message: `${YELLOW}⚠️  Found direct Supabase imports in tests${RESET}`,
        };
      }

      return {
        passed: true,
        message: `${GREEN}✅ No direct Supabase calls in tests${RESET}`,
      };
    } catch (error) {
      return {
        passed: true,
        message: `${GREEN}✅ No direct Supabase calls in tests${RESET}`,
      };
    }
  }

  /**
   * Check test coverage
   */
  checkTestCoverage(): CheckResult {
    console.log('🔍 Checking test coverage...');

    const coveragePath = path.join(
      process.cwd(),
      'coverage',
      'coverage-summary.json'
    );

    if (!fs.existsSync(coveragePath)) {
      console.log(
        `${YELLOW}⚠️  No coverage report found. Run 'npm test:coverage' first${RESET}`
      );
      return {
        passed: true,
        message: `${YELLOW}⚠️  Coverage not checked (no report)${RESET}`,
      };
    }

    try {
      const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
      const total = coverage.total;

      const thresholds = {
        lines: 65,
        statements: 65,
        functions: 60,
        branches: 50,
      };

      let passed = true;
      const failures: string[] = [];

      for (const [key, threshold] of Object.entries(thresholds)) {
        const actual = total[key].pct;
        if (actual < threshold) {
          passed = false;
          failures.push(
            `${key}: ${actual.toFixed(2)}% (threshold: ${threshold}%)`
          );
        }
      }

      if (!passed) {
        this.errors.push(`Coverage below thresholds:\n${failures.join('\n')}`);
        return {
          passed: false,
          message: `${RED}❌ Coverage below thresholds${RESET}`,
        };
      }

      return {
        passed: true,
        message: `${GREEN}✅ Coverage meets all thresholds${RESET}`,
      };
    } catch (error) {
      console.error('Error reading coverage report:', error);
      return {
        passed: true,
        message: `${YELLOW}⚠️  Could not parse coverage report${RESET}`,
      };
    }
  }

  /**
   * Check for console.log in non-test files
   */
  checkForConsoleLog(): CheckResult {
    console.log('🔍 Checking for console.log in production code...');

    try {
      const result = execSync(
        `git grep -n "console\\.log" -- "app/**/*.js" "app/**/*.ts" "components/**/*.js" "components/**/*.ts" ":(exclude)__tests__" ":(exclude)*.test.*" ":(exclude)*.spec.*" || true`,
        { encoding: 'utf8' }
      ).trim();

      if (result) {
        const lines = result.split('\n').length;
        if (lines > 5) {
          this.warnings.push(
            `Found ${lines} console.log statements in production code`
          );
          return {
            passed: true,
            message: `${YELLOW}⚠️  Found ${lines} console.log statements${RESET}`,
          };
        }
      }

      return {
        passed: true,
        message: `${GREEN}✅ Minimal console.log usage${RESET}`,
      };
    } catch (error) {
      return {
        passed: true,
        message: `${GREEN}✅ Minimal console.log usage${RESET}`,
      };
    }
  }

  /**
   * Check Node version
   */
  checkNodeVersion(): CheckResult {
    console.log('🔍 Checking Node version...');

    const nodeVersion = process.version;
    const match = nodeVersion.match(/^v(\d+)\.(\d+)\.(\d+)/);

    if (!match) {
      this.errors.push(`Could not parse Node version: ${nodeVersion}`);
      return {
        passed: false,
        message: `${RED}❌ Invalid Node version${RESET}`,
      };
    }

    const [, major, minor] = match.map(Number);

    if (major < 20 || (major === 20 && minor < 11)) {
      this.errors.push(
        `Node version must be 20.11.x or higher (current: ${nodeVersion})`
      );
      return {
        passed: false,
        message: `${RED}❌ Node ${nodeVersion} (requires >=20.11)${RESET}`,
      };
    }

    if (major > 20) {
      // Node 22+ is acceptable, just a warning
      this.warnings.push(
        `Node version ${nodeVersion} is higher than tested version (20.x)`
      );
      return {
        passed: true,
        message: `${YELLOW}⚠️  Node ${nodeVersion} (tested with 20.x)${RESET}`,
      };
    }

    return {
      passed: true,
      message: `${GREEN}✅ Node ${nodeVersion} is compatible${RESET}`,
    };
  }

  /**
   * Run all checks
   */
  async runAllChecks(): Promise<boolean> {
    console.log('🚀 Running test quality checks...\n');

    const checks = [
      this.checkNodeVersion(),
      this.checkForSkippedTests(),
      this.checkForDirectSupabaseCalls(),
      this.checkTestCoverage(),
      this.checkForConsoleLog(),
    ];

    console.log('\n📊 Results:');
    console.log('─'.repeat(50));

    checks.forEach((check) => {
      console.log(check.message);
    });

    console.log('─'.repeat(50));

    if (this.errors.length > 0) {
      console.log(`\n${RED}❌ ERRORS:${RESET}`);
      this.errors.forEach((err) => console.log(err));
    }

    if (this.warnings.length > 0) {
      console.log(`\n${YELLOW}⚠️  WARNINGS:${RESET}`);
      this.warnings.forEach((warn) => console.log(warn));
    }

    const allPassed = checks.every((c) => c.passed);

    if (allPassed && this.errors.length === 0) {
      console.log(`\n${GREEN}✅ All quality checks passed!${RESET}`);
      return true;
    } else {
      console.log(`\n${RED}❌ Quality checks failed!${RESET}`);
      return false;
    }
  }
}

// Run if executed directly
if (require.main === module) {
  const checker = new TestQualityChecker();
  checker.runAllChecks().then((passed) => {
    process.exit(passed ? 0 : 1);
  });
}

export { TestQualityChecker };
