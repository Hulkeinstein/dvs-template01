/**
 * Test selectors and timeouts
 * TODO: Implement actual selectors
 */

export const SELECTORS = {
  // Course page
  courseCard: '[data-testid="course-card"]',
  addToCartButton: '[data-testid="add-to-cart"]',

  // Cart
  cartIcon: '[data-testid="cart-icon"]',
  cartItem: '[data-testid="cart-item"]',

  // Checkout
  checkoutButton: '[data-testid="checkout-button"]',
  checkoutForm: '[data-testid="checkout-form"]',
};

export const TIMEOUTS = {
  short: 1000,
  medium: 3000,
  long: 5000,
};
