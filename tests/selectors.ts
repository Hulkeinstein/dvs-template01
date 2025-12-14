/**
 * Test selectors and timeouts
 * TODO: Implement actual selectors
 */

export const SELECTORS = {
  // Course page
  courseCard: '.rbt-card',
  addToCartButton: '.rbt-btn-link:has-text("Add To Cart")',

  // Cart
  cartIcon: '.cart-icon', // Placeholder, verify if needed
  cartItem: '.minicart-item, .cart-item', // Adjust based on cart component

  // Checkout
  checkoutButton: '.rbt-btn:has-text("Proceed to Checkout")',
  checkoutForm: 'form', // Generic for now
  
  CHECKOUT_FORM: {
     FIRST_NAME: '#billing_first_name',
     LAST_NAME: '#billing_last_name',
     EMAIL: '#billing_email',
     PHONE: '#billing_phone',
     ADDRESS: '#billing_address_1',
     CITY: '#billing_city',
     ZIP: '#billing_postcode',
  }
};

export const TIMEOUTS = {
  short: 1000,
  medium: 3000,
  long: 5000,
};
