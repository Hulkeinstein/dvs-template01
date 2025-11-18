/**
 * Cart test helpers
 * TODO: Implement actual helpers for E2E tests
 */

import { Page } from '@playwright/test';

export async function waitForCartUpdate(page: Page): Promise<void> {
  // TODO: Implement actual logic
  await page.waitForTimeout(100);
}
