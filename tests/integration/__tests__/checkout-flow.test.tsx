/**
 * Integration Test: Checkout Components
 *
 * NOTE: Full checkout flow testing is complex due to multiple dependencies:
 * - Redux state management
 * - Session authentication
 * - Multiple server actions
 * - Router navigation
 * - Complex nested components
 *
 * These simpler integration tests focus on testable component interactions.
 * For end-to-end checkout flow testing, see tests/e2e/checkout.spec.ts
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PaymentMethodSelector from '@/components/Checkout/PaymentMethodSelector';

// Inline helper functions to avoid module resolution issues
function setEnv(key: string, value: string) {
  process.env[key] = value;
}

function createMockFunction<
  T extends (...args: any[]) => any,
>(): jest.MockedFunction<T> {
  return jest.fn() as unknown as jest.MockedFunction<T>;
}

function setupTest() {
  // Clear environment variables
  delete process.env.NEXT_PUBLIC_STRIPE_ENABLED;
}

describe('Integration: Checkout Components', () => {
  beforeEach(() => {
    setupTest();
  });

  describe('Payment Method Selection', () => {
    it('should integrate payment method selection with environment-based availability', () => {
      // Test the integration between environment config and payment options
      setEnv('NEXT_PUBLIC_STRIPE_ENABLED', 'true');

      const mockOnMethodChange = createMockFunction<(method: string) => void>();

      render(
        <PaymentMethodSelector
          selectedMethod="stripe"
          onMethodChange={mockOnMethodChange}
        />
      );

      // Verify both payment options are available
      const stripeRadio = screen.getByLabelText(
        /Credit\/Debit Card \(Stripe\)/i
      );
      const paypalRadio = screen.getByLabelText(/PayPal/i);

      expect(stripeRadio).toBeEnabled();
      expect(paypalRadio).toBeEnabled();
      expect(stripeRadio).toBeChecked();

      // Test switching payment methods (controlled component - callback is called)
      fireEvent.click(paypalRadio);

      expect(mockOnMethodChange).toHaveBeenCalledWith('paypal');
      // Note: PaymentMethodSelector is a controlled component
      // The parent component must re-render with selectedMethod="paypal"
      // for the radio to be checked
    });

    it('should handle Stripe disabled state and default to PayPal', () => {
      setEnv('NEXT_PUBLIC_STRIPE_ENABLED', 'false');

      const mockOnMethodChange = createMockFunction<(method: string) => void>();

      render(
        <PaymentMethodSelector
          selectedMethod="paypal"
          onMethodChange={mockOnMethodChange}
        />
      );

      const stripeRadio = screen.getByLabelText(
        /Credit\/Debit Card \(Stripe\)/i
      );
      const paypalRadio = screen.getByLabelText(/PayPal/i);

      // Stripe should be disabled
      expect(stripeRadio).toBeDisabled();
      expect(paypalRadio).toBeEnabled();
      expect(paypalRadio).toBeChecked();

      // Verify Stripe cannot be selected
      expect(stripeRadio).not.toBeChecked();
    });

    it('should persist payment method selection across re-renders', () => {
      setEnv('NEXT_PUBLIC_STRIPE_ENABLED', 'true');

      const mockOnMethodChange = createMockFunction<(method: string) => void>();

      const { rerender } = render(
        <PaymentMethodSelector
          selectedMethod="stripe"
          onMethodChange={mockOnMethodChange}
        />
      );

      // Switch to PayPal
      const paypalRadio = screen.getByLabelText(/PayPal/i);
      fireEvent.click(paypalRadio);

      expect(mockOnMethodChange).toHaveBeenCalledWith('paypal');

      // Re-render with PayPal selected
      rerender(
        <PaymentMethodSelector
          selectedMethod="paypal"
          onMethodChange={mockOnMethodChange}
        />
      );

      // PayPal should still be selected
      const paypalRadioAfterRender = screen.getByLabelText(/PayPal/i);
      expect(paypalRadioAfterRender).toBeChecked();
    });
  });

  describe('Environment Configuration Integration', () => {
    it('should respond to environment variable changes', () => {
      const mockOnMethodChange = createMockFunction<(method: string) => void>();

      // Initially Stripe enabled
      setEnv('NEXT_PUBLIC_STRIPE_ENABLED', 'true');

      const { rerender } = render(
        <PaymentMethodSelector
          selectedMethod="stripe"
          onMethodChange={mockOnMethodChange}
        />
      );

      let stripeRadio = screen.getByLabelText(/Credit\/Debit Card \(Stripe\)/i);
      expect(stripeRadio).toBeEnabled();

      // Simulate environment change (Stripe disabled)
      setEnv('NEXT_PUBLIC_STRIPE_ENABLED', 'false');

      rerender(
        <PaymentMethodSelector
          selectedMethod="paypal"
          onMethodChange={mockOnMethodChange}
        />
      );

      stripeRadio = screen.getByLabelText(/Credit\/Debit Card \(Stripe\)/i);
      expect(stripeRadio).toBeDisabled();
    });
  });
});
