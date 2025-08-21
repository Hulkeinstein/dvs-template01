/**
 * Jest Configuration for Next.js with TypeScript/ESM Support
 *
 * Key features:
 * - ESM module support
 * - Coverage thresholds for quality gates
 * - Repository pattern mocking
 * - Test isolation and cleanup
 */

const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
});

// Custom Jest configuration
const customJestConfig = {
  // Test environment setup
  testEnvironment: 'jest-environment-jsdom',
  testEnvironmentOptions: {
    url: 'http://localhost', // Prevent relative URL errors in JSDOM
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Module name mapping
  moduleNameMapper: {
    // Handle module aliases
    '^@/(.*)$': '<rootDir>/$1',
    // Repository pattern mocking
    '^@/app/data/(.*)\\.repo$': '<rootDir>/tests/mocks/data/$1.repo.ts',
    // CSS/SCSS mocking
    '\\.(css|scss|sass)$': 'identity-obj-proxy',
    // ESM module mocks
    '^jose$': '<rootDir>/__mocks__/jose.ts',
    '^@panva/hkdf$': '<rootDir>/__mocks__/@panva/hkdf.js',
    '^next-auth$': '<rootDir>/__mocks__/next-auth/index.js',
    '^next-auth/react$': '<rootDir>/__mocks__/next-auth/react.js',
  },

  // Test file patterns
  testMatch: [
    '**/__tests__/**/*.(test|spec).[jt]s?(x)',
    '!**/__tests__/**/*.skip.[jt]s?(x)', // Exclude .skip files
  ],

  // Paths to ignore
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/dist/',
    '<rootDir>/build/',
    '<rootDir>/e2e/',
    '<rootDir>/out/',
  ],

  // Transform configuration
  transform: {
    // Use babel-jest with Next.js preset
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },

  // ESM packages to transform
  transformIgnorePatterns: [
    '/node_modules/(?!(jose|openid-client|next-auth|@panva|oidc-token-hash|@supabase|nanoid|@supabase/supabase-js|@supabase/realtime-js|@supabase/auth-js|@supabase/auth-helpers-core|@supabase/functions-js|@supabase/postgrest-js|@supabase/storage-js))',
  ],

  // ESM support
  extensionsToTreatAsEsm: ['.ts', '.tsx'],

  // Coverage configuration
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    '!app/**/*.d.ts',
    '!app/**/layout.{js,jsx,ts,tsx}',
    '!app/**/page.{js,jsx,ts,tsx}',
    '!app/api/**',
    '!app/fonts.js',
    '!app/bootstrap-client.js',
    '!app/backToTop.js',
    '!app/Providers.js',
    '!**/__tests__/**',
    '!**/__mocks__/**',
    '!**/node_modules/**',
    '!**/.next/**',
  ],

  // Coverage thresholds - Quality Gates
  coverageThreshold: {
    global: {
      branches: 50, // 50% branch coverage
      functions: 60, // 60% function coverage
      lines: 65, // 65% line coverage
      statements: 65, // 65% statement coverage
    },
    // Stricter thresholds for critical modules
    './app/lib/actions/*.js': {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },

  // Coverage reporters
  coverageReporters: ['text', 'lcov', 'html', 'text-summary'],

  // Test timeout (2 minutes)
  testTimeout: 120000,

  // Reporters for CI
  reporters: process.env.CI ? ['default', 'github-actions'] : ['default'],

  // Verbose output in CI
  verbose: process.env.CI === 'true',

  // Max workers for parallel execution
  maxWorkers: process.env.CI ? 2 : '50%',
};

// Export configuration
module.exports = createJestConfig(customJestConfig);
