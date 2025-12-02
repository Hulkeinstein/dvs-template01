/**
 * Mock data for testing
 * TODO: Implement actual mock data
 */

export const mockCartState = {
  items: [],
  total: 0,
};

export const mockEmptyCartState = {
  items: [],
  total: 0,
};

export const mockSingleItemCartState = {
  items: [
    {
      id: '1',
      title: 'Test Course',
      price: 99.99,
    },
  ],
  total: 99.99,
};

export const mockFreeCartState = {
  items: [
    {
      id: '1',
      title: 'Free Course',
      price: 0,
    },
  ],
  total: 0,
};
