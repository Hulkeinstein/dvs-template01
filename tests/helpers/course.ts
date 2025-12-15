/**
 * Course test helpers
 * TODO: Implement actual helpers for E2E tests
 */

import { Page, Locator } from '@playwright/test';

export async function getFirstVisibleCourseCard(
  page: Page
): Promise<Locator | null> {
  // Wait for the grid container first to ensure page content is loaded
  const grid = page.locator('.rbt-course-grid-column');
  await grid.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});

  // Try to find any link to course details
  const courseLink = page.locator('a[href^="/course-details/"]').first();
  try {
    await courseLink.waitFor({ state: 'visible', timeout: 15000 });
    return courseLink;
  } catch {
    return null;
  }
}

export async function ensureOffcanvasSearchClosed(page: Page): Promise<void> {
  // Press Escape to close any open overlays/offcanvas
  await page.keyboard.press('Escape');
}
