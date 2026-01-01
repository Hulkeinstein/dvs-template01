import React from 'react';
import { render, RenderOptions, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Re-export setup functions from test-providers
export { setupTest, teardownTest } from './test-providers.js';

/**
 * Test Helper Utilities
 *
 * This file contains reusable test utilities to reduce code duplication
 * and make tests more maintainable.
 */

// ============================================================================
// Render Utilities
// ============================================================================

/**
 * Custom render function with providers
 * Use this instead of plain render() for components that need Redux/Context
 */
export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { ...options });
}

// ============================================================================
// Wait Utilities
// ============================================================================

/**
 * Wait for loading spinners to disappear
 */
export async function waitForLoadingToFinish() {
  await waitFor(() => {
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });
}

/**
 * Wait for an element to appear on the screen
 */
export async function waitForElement(text: string | RegExp) {
  return await waitFor(() => {
    return screen.getByText(text);
  });
}

/**
 * Wait for an element to disappear from the screen
 */
export async function waitForElementToDisappear(text: string | RegExp) {
  await waitFor(() => {
    expect(screen.queryByText(text)).not.toBeInTheDocument();
  });
}

// ============================================================================
// Mock Utilities
// ============================================================================

/**
 * Create a mock function with type safety
 */
export function createMockFunction<
  T extends (...args: any[]) => any,
>(): jest.MockedFunction<T> {
  return jest.fn() as unknown as jest.MockedFunction<T>;
}

/**
 * Setup environment variable for tests
 */
export function setEnv(key: string, value: string) {
  process.env[key] = value;
}

/**
 * Clean up environment variable after tests
 */
export function cleanEnv(key: string) {
  delete process.env[key];
}

/**
 * Reset all mocked functions
 */
export function resetAllMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

// ============================================================================
// Custom Matchers/Queries
// ============================================================================

/**
 * Check if element exists (more readable than queryBy...not.toBeInTheDocument)
 */
export function expectElementToExist(text: string | RegExp) {
  expect(screen.getByText(text)).toBeInTheDocument();
}

/**
 * Check if element does not exist
 */
export function expectElementNotToExist(text: string | RegExp) {
  expect(screen.queryByText(text)).not.toBeInTheDocument();
}

/**
 * Check if element is visible (not just in DOM, but visible)
 */
export function expectElementToBeVisible(text: string | RegExp) {
  const element = screen.getByText(text);
  expect(element).toBeVisible();
}

// ============================================================================
// Navigation Utilities
// ============================================================================

/**
 * Wait for navigation to complete
 * Useful for testing page transitions
 */
export async function waitForNavigation() {
  await waitFor(() => {
    // Wait for any loading indicators to disappear
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });
}

// ============================================================================
// Debug Utilities
// ============================================================================

/**
 * Log current screen content (useful for debugging tests)
 */
export function debugScreen() {
  screen.debug();
}

/**
 * Log specific element (useful for debugging tests)
 */
export function debugElement(text: string | RegExp) {
  const element = screen.queryByText(text);
  if (element) {
    console.log(element.outerHTML);
  } else {
    console.log(`Element with text "${text}" not found`);
  }
}
