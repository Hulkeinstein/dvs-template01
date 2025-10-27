import React, { ReactElement, ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { useSelector } from 'react-redux';

/**
 * Test Providers
 *
 * This file provides wrapper components and render utilities
 * that include necessary providers (Redux, Context, etc.)
 */

// ============================================================================
// Mock Redux Store Utilities
// ============================================================================

/**
 * Setup mock Redux state for tests
 * This is a simple mock that works with useSelector mock
 */
export function setupMockReduxState(state: any) {
  const mockUseSelector = useSelector as jest.MockedFunction<
    typeof useSelector
  >;
  mockUseSelector.mockImplementation((selector: any) =>
    selector({ CartReducer: state })
  );
}

/**
 * Clear all Redux mocks
 */
export function clearReduxMocks() {
  // Only clear if useSelector is actually a mock function
  if (jest.isMockFunction(useSelector)) {
    const mockUseSelector = useSelector as jest.MockedFunction<
      typeof useSelector
    >;
    mockUseSelector.mockClear();
  }
}

// ============================================================================
// Provider Wrappers
// ============================================================================

/**
 * Simple Provider wrapper for components that don't need Redux
 */
export function SimpleProviders({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

/**
 * All Providers wrapper (for future expansion)
 * Currently just a placeholder for when we add Context providers
 */
export function AllProviders({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

// ============================================================================
// Custom Render Functions
// ============================================================================

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  // Add custom options here
  cartState?: any;
  userState?: any;
}

/**
 * Custom render with all providers
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: CustomRenderOptions
) {
  const { cartState, ...renderOptions } = options || {};

  // Setup Redux state if provided
  if (cartState) {
    setupMockReduxState(cartState);
  }

  // Note: userState is in type definition for future expansion
  // but not yet implemented in the rendering logic

  return render(ui, {
    wrapper: AllProviders,
    ...renderOptions,
  });
}

/**
 * Render with Redux only
 */
export function renderWithRedux(ui: ReactElement, cartState: any) {
  setupMockReduxState(cartState);
  return render(ui, { wrapper: AllProviders });
}

// ============================================================================
// Test Setup/Teardown Utilities
// ============================================================================

/**
 * Setup function to run before each test
 * Call this in beforeEach() to ensure clean state
 */
export function setupTest() {
  clearReduxMocks();
  // Clear environment variables
  delete process.env.NEXT_PUBLIC_STRIPE_ENABLED;
}

/**
 * Teardown function to run after each test
 * Call this in afterEach() to clean up
 */
export function teardownTest() {
  clearReduxMocks();
}

// ============================================================================
// Mock Provider for Testing (Future: Real Redux Store)
// ============================================================================

/**
 * Create a mock store for testing
 * This is a placeholder for when we need a real Redux store in tests
 */
export function createMockStore(initialState: any) {
  return {
    getState: () => initialState,
    dispatch: jest.fn(),
    subscribe: jest.fn(),
  };
}

/**
 * Provider wrapper with mock store
 * Use this when you need a real Redux Provider in tests
 */
export function MockStoreProvider({
  children,
  store,
}: {
  children: ReactNode;
  store: any;
}) {
  return <Provider store={store}>{children}</Provider>;
}

// ============================================================================
// Helper: Render with Mock Store
// ============================================================================

/**
 * Render component with a mock Redux store
 * Use this instead of renderWithProviders when you need
 * a real Redux store instance
 */
export function renderWithMockStore(
  ui: ReactElement,
  initialState: any,
  options?: RenderOptions
) {
  const store = createMockStore(initialState);
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MockStoreProvider store={store}>{children}</MockStoreProvider>
  );

  return {
    ...render(ui, { wrapper, ...options }),
    store,
  };
}
