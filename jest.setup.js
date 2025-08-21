// Polyfills must be imported first
import './tests/polyfills.js';

// Testing library setup
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';

// Test helpers
import { resetAllMocks } from './tests/utils/test-helpers';

// Set up test environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
process.env.NEXTAUTH_SECRET = 'test-secret';
process.env.GOOGLE_CLIENT_ID = 'test-google-client-id';
process.env.GOOGLE_CLIENT_SECRET = 'test-google-client-secret';

// Network blocking setup
const BLOCKED_HOSTS = [
  'supabase.co',
  'googleapis.com',
  'stripe.com',
  'github.com',
];

beforeAll(() => {
  // Create error with stack trace for better debugging
  const block = (caller) => {
    const err = new Error(
      `[TEST FAIL] Network call blocked: ${caller}\nStack: ${new Error().stack}`
    );
    console.error(err);
    throw err;
  };

  // Block fetch
  const originalFetch = global.fetch;
  global.fetch = jest.fn((url) => {
    const urlString = typeof url === 'string' ? url : url.toString();
    if (BLOCKED_HOSTS.some((host) => urlString.includes(host))) {
      return block(`fetch(${urlString})`);
    }
    // Allow localhost for testing
    if (urlString.includes('localhost') || urlString.includes('127.0.0.1')) {
      return Promise.resolve(new Response());
    }
    return block(`fetch(${urlString})`);
  });

  // Block axios if present
  try {
    const axios = require('axios');
    axios.get = jest.fn(() => block('axios.get'));
    axios.post = jest.fn(() => block('axios.post'));
    axios.put = jest.fn(() => block('axios.put'));
    axios.delete = jest.fn(() => block('axios.delete'));
    axios.patch = jest.fn(() => block('axios.patch'));
  } catch {
    // axios not installed, skip
  }

  // Block Node.js network modules
  ['http', 'https'].forEach((module) => {
    try {
      const mod = require(`node:${module}`);
      jest
        .spyOn(mod, 'request')
        .mockImplementation(() => block(`${module}.request`));
      jest.spyOn(mod, 'get').mockImplementation(() => block(`${module}.get`));
    } catch {
      // Module not available, skip
    }
  });
});

// Timer and cleanup setup
beforeEach(() => {
  // Use modern fake timers for consistency
  jest.useFakeTimers('modern');
});

afterEach(() => {
  // Clean up React components
  cleanup();

  // Run all pending timers and clean up
  jest.runOnlyPendingTimers();
  jest.useRealTimers();

  // Clear all mocks using helper
  resetAllMocks();

  // Clear DOM
  document.body.innerHTML = '';
  document.head.innerHTML = '';

  // Log flaky tests for monitoring
  const testName = expect.getState().currentTestName;
  if (testName && testName.includes('@flaky')) {
    console.warn('[FLAKY TEST]', testName);
  }
});

// Mock Supabase client module
jest.mock('@/app/lib/supabase/client', () => {
  const mockFrom = jest.fn();
  const mockSelect = jest.fn();
  const mockInsert = jest.fn();
  const mockUpdate = jest.fn();
  const mockDelete = jest.fn();
  const mockEq = jest.fn();
  const mockSingle = jest.fn();
  const mockOrder = jest.fn();

  // Set up method chaining
  mockOrder.mockReturnThis();
  mockSingle.mockReturnThis();
  mockEq.mockReturnThis();
  mockDelete.mockReturnThis();
  mockUpdate.mockReturnThis();
  mockInsert.mockReturnThis();
  mockSelect.mockReturnThis();

  mockFrom.mockReturnValue({
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
    delete: mockDelete,
    eq: mockEq,
    single: mockSingle,
    order: mockOrder,
  });

  mockSelect.mockReturnValue({
    eq: mockEq,
    single: mockSingle,
    order: mockOrder,
  });

  mockInsert.mockReturnValue({
    select: mockSelect,
    single: mockSingle,
  });

  mockUpdate.mockReturnValue({
    eq: mockEq,
    single: mockSingle,
  });

  mockDelete.mockReturnValue({
    eq: mockEq,
  });

  mockEq.mockReturnValue({
    single: mockSingle,
    order: mockOrder,
    select: mockSelect,
  });

  const mockSupabase = {
    from: mockFrom,
    auth: {
      getUser: jest
        .fn()
        .mockResolvedValue({ data: { user: null }, error: null }),
    },
    storage: {
      from: jest.fn().mockReturnValue({
        upload: jest
          .fn()
          .mockResolvedValue({ data: { path: 'test-path' }, error: null }),
        getPublicUrl: jest
          .fn()
          .mockReturnValue({ data: { publicUrl: 'test-url' } }),
      }),
    },
  };

  return {
    supabase: mockSupabase,
    __mockFrom: mockFrom,
    __mockSelect: mockSelect,
    __mockInsert: mockInsert,
    __mockUpdate: mockUpdate,
    __mockDelete: mockDelete,
    __mockEq: mockEq,
    __mockSingle: mockSingle,
    __mockOrder: mockOrder,
  };
});
