/**
 * Course test helpers
 * TODO: Implement actual helpers for E2E tests
 */

import { Page, Locator } from '@playwright/test';

export async function getFirstVisibleCourseCard(
  page: Page
): Promise<Locator | null> {
  void page; // TODO: Implement actual logic
  return null;
}

export async function ensureOffcanvasSearchClosed(page: Page): Promise<void> {
  void page; // TODO: Implement actual logic
}
