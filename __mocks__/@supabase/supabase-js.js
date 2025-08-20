const mockFrom = jest.fn();
const mockSelect = jest.fn();
const mockInsert = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();
const mockEq = jest.fn();
const mockSingle = jest.fn();
const mockOrder = jest.fn();

// Chain methods together
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

// Make these available for testing
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

const mockSupabaseClient = {
  from: mockFrom,
  auth: {
    getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
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

const createClient = jest.fn(() => mockSupabaseClient);

module.exports = {
  createClient,
  __mockSupabase: mockSupabaseClient,
  __mockFrom: mockFrom,
  __mockSelect: mockSelect,
  __mockInsert: mockInsert,
  __mockUpdate: mockUpdate,
  __mockDelete: mockDelete,
  __mockEq: mockEq,
  __mockSingle: mockSingle,
  __mockOrder: mockOrder,
};
