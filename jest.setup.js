// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Used for __tests__/testing-library.js
// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Set up test environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
process.env.NEXTAUTH_SECRET = 'test-secret';
process.env.GOOGLE_CLIENT_ID = 'test-google-client-id';
process.env.GOOGLE_CLIENT_SECRET = 'test-google-client-secret';

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
