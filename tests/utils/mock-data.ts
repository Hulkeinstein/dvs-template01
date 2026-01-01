/**
 * Mock data for testing
 * Matches the actual Redux CartReducer structure
 */

// CartReducer structure used by components
export const mockCartState = {
  cart: [
    {
      id: 1,
      product: {
        courseTitle: 'React Fundamentals',
        price: 149.99,
      },
      amount: 1,
    },
    {
      id: 2,
      product: {
        courseTitle: 'TypeScript Advanced',
        price: 99.99,
      },
      amount: 1,
    },
  ],
  total_amount: 249.98,
  shipping_fee: 0,
};

export const mockEmptyCartState = {
  cart: [],
  total_amount: 0,
  shipping_fee: 0,
};

export const mockSingleItemCartState = {
  cart: [
    {
      id: 1,
      product: {
        courseTitle: 'Test Course',
        price: 99.99,
      },
      amount: 1,
    },
  ],
  total_amount: 99.99,
  shipping_fee: 0,
};

export const mockFreeCartState = {
  cart: [
    {
      id: 1,
      product: {
        courseTitle: 'Free Course',
        price: 0,
      },
      amount: 1,
    },
  ],
  total_amount: 0,
  shipping_fee: 0,
};
