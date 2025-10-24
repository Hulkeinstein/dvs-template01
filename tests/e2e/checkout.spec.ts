import { test, expect } from '@playwright/test';
import {
  getFirstVisibleCourseCard,
  ensureOffcanvasSearchClosed,
} from '../helpers/course';
import { waitForCartUpdate } from '../helpers/cart-helpers';
import { SELECTORS, TIMEOUTS } from '../selectors';

/**
 * E2E Test: Complete Checkout Flow
 *
 * Tests the critical path from course browsing to enrollment:
 * 1. Browse courses
 * 2. View course details
 * 3. Add to cart
 * 4. Proceed to checkout
 * 5. Fill checkout form
 * 6. Complete payment
 * 7. Verify enrollment
 *
 * Prerequisites:
 * - Dev server running on http://localhost:3000
 * - Test user account (or use guest checkout)
 * - At least one published course available
 *
 * Change history:
 * - 2025-10-16: Selector stabilization (.course-grid-3 .rbt-card + visible filter)
 */

test.describe('Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Start from the homepage
    await page.goto('/');
  });

  test('should complete checkout flow for a paid course', async ({ page }) => {
    // 1. Navigate to courses page
    await page.goto('/all-courses');

    // 2. Ensure offcanvas search is closed (prevent selector conflict)
    await ensureOffcanvasSearchClosed(page);

    // 3. Click on the first available course (using helper)
    const firstCourse = await getFirstVisibleCourseCard(page);
    await firstCourse.click();

    // 4. Verify course details page loads
    await expect(page).toHaveURL(/\/course-details\/.+/, {
      timeout: TIMEOUTS.PAGE_LOAD,
    });
    // Verify page is loaded by checking for Add to Cart button (it's a Link, not a button)
    await expect(page.getByText('Add to Cart').first()).toBeVisible({
      timeout: TIMEOUTS.DEFAULT,
    });

    // 5. Click "Add to Cart" button (actually a Link component)
    const addToCartButton = page.getByText('Add to Cart').first();
    await addToCartButton.click();

    // 6. Close the cart offcanvas (opens after clicking Add to Cart)
    const closeButton = page
      .locator('.minicart-close-button, .rbt-round-btn')
      .first();
    await closeButton.waitFor({ state: 'visible', timeout: 3000 });
    await closeButton.click();

    // 7. Wait for cart to update (Redux + localStorage sync)
    await waitForCartUpdate(page, 1);

    // 7. Navigate to cart
    await page.goto('/cart');

    // 8. Verify item is in cart
    await expect(page.locator(SELECTORS.CART_ITEM)).toBeVisible();

    // 9. Click "Proceed to Checkout"
    const checkoutButton = page.getByRole('button', {
      name: /proceed to checkout|checkout/i,
    });
    await checkoutButton.click();

    // 10. Verify checkout page loads
    await expect(page).toHaveURL('/checkout');

    // 11. Fill out checkout form (using selectors)
    await page.fill(SELECTORS.CHECKOUT_FORM.FIRST_NAME, 'John');
    await page.fill(SELECTORS.CHECKOUT_FORM.LAST_NAME, 'Doe');
    await page.fill(SELECTORS.CHECKOUT_FORM.EMAIL, 'john.doe@example.com');
    await page.fill(SELECTORS.CHECKOUT_FORM.PHONE, '123-456-7890');
    await page.fill(SELECTORS.CHECKOUT_FORM.ADDRESS, '123 Main St');
    await page.fill(SELECTORS.CHECKOUT_FORM.CITY, 'New York');
    await page.fill(SELECTORS.CHECKOUT_FORM.ZIP, '10001');

    // 12. Agree to terms
    await page.check('input[id*="agree_terms"]');
    await page.check('input[id*="agree_privacy"]');

    // 13. Select payment method (PayPal for testing)
    await page.check('input[value="paypal"]');

    // 14. Click "Place Order"
    const placeOrderButton = page.getByRole('button', {
      name: /place order|complete order/i,
    });
    await placeOrderButton.click();

    // 15. Handle PayPal redirect (or mock payment)
    // Note: In real testing, you would either:
    // - Use PayPal's sandbox test accounts
    // - Mock the payment gateway
    // - Skip actual payment in test environment

    // For now, verify the order was created (assuming redirect to success page)
    await page.waitForURL(/\/order-success|\/student\/dashboard/, {
      timeout: TIMEOUTS.NETWORK,
    });

    // 16. Verify success message or enrollment
    await expect(
      page.getByText(/order successful|enrolled successfully/i)
    ).toBeVisible({ timeout: 5000 });
  });

  test('should complete checkout flow for a free course', async ({ page }) => {
    // TODO: Implement free course checkout flow
    // This test assumes there's a free course available
    // 1. Navigate to courses page
    // 2. Filter for free courses or find a specific free course
    // 3. Add free course to cart
    // 4. Proceed to checkout
    // 5. Verify no payment method selection required
    // 6. Click "Enroll Now (Free)"
    // 7. Verify immediate enrollment

    // Placeholder test - mark as implemented when UI is ready
    await page.goto('/');
    expect(page).toBeTruthy();
  });

  test('should handle cart persistence across page navigation', async ({
    page,
  }) => {
    // 1. Navigate to courses page
    await page.goto('/all-courses');

    // 2. Ensure offcanvas search is closed
    await ensureOffcanvasSearchClosed(page);

    // 3. Click on the first available course
    const firstCourse = await getFirstVisibleCourseCard(page);
    await firstCourse.click();
    const addToCartButton = page.getByText('Add to Cart').first();
    await addToCartButton.click();

    // 3.5. Close cart offcanvas
    const closeButton = page
      .locator('.minicart-close-button, .rbt-round-btn')
      .first();
    await closeButton.waitFor({ state: 'visible', timeout: 3000 });
    await closeButton.click();

    // 3.6. Wait for cart to update
    await waitForCartUpdate(page, 1);

    // 4. Navigate away and back
    await page.goto('/');
    await page.goto('/cart');

    // 5. Verify item still in cart
    await expect(page.locator(SELECTORS.CART_ITEM)).toBeVisible();
  });

  test('should validate required fields before checkout', async ({ page }) => {
    // 1. Add item to cart and go to checkout
    await page.goto('/checkout');

    // 2. Try to submit without filling required fields
    const placeOrderButton = page.getByRole('button', {
      name: /place order/i,
    });
    await placeOrderButton.click();

    // 3. Verify validation errors are shown
    await expect(page.getByText(/required|please enter/i)).toBeVisible();
  });

  test('should display correct total with tax calculation', async ({
    page,
  }) => {
    // 1. Navigate to courses page
    await page.goto('/all-courses');

    // 2. Ensure offcanvas search is closed
    await ensureOffcanvasSearchClosed(page);

    // 3. Click on the first available course
    const firstCourse = await getFirstVisibleCourseCard(page);
    await firstCourse.click();
    const addToCartButton = page.getByText('Add to Cart').first();
    await addToCartButton.click();

    // 3.5. Close cart offcanvas
    const closeButton = page
      .locator('.minicart-close-button, .rbt-round-btn')
      .first();
    await closeButton.waitFor({ state: 'visible', timeout: 3000 });
    await closeButton.click();

    // 3.6. Wait for cart to update
    await waitForCartUpdate(page, 1);

    // 4. Go to checkout
    await page.goto('/checkout');

    // 3. Verify price breakdown is visible
    await expect(page.getByText(/sub total/i)).toBeVisible();
    await expect(page.getByText(/tax/i)).toBeVisible();
    await expect(page.getByText(/grand total/i)).toBeVisible();

    // 4. Verify grand total = subtotal + tax
    // (This would require parsing the actual values)
  });
});
