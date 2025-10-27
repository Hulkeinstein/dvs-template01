import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useSelector } from 'react-redux';
import { Checkout } from '../Checkout'; // Use named export to avoid dynamic() wrapper
import { setupTest } from '../../../tests/utils/test-providers';
import {
  mockCartState,
  mockEmptyCartState,
  mockSingleItemCartState,
  mockFreeCartState,
} from '../../../tests/utils/mock-data';
import { setEnv } from '../../../tests/utils/test-helpers';

// Mock react-redux
jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
}));

// Mock CheckoutForm component
const MockCheckoutForm = React.forwardRef<
  Record<string, unknown>,
  Record<string, unknown>
>((_props, _ref) => (
  <div data-testid="checkout-form-mock">Mocked CheckoutForm</div>
));
MockCheckoutForm.displayName = 'MockCheckoutForm';

jest.mock('../CheckoutForm', () => ({
  __esModule: true,
  default: MockCheckoutForm,
}));

describe('Checkout Component', () => {
  const mockUseSelector = useSelector as jest.MockedFunction<
    typeof useSelector
  >;

  beforeEach(() => {
    setupTest();
    mockUseSelector.mockClear();
  });

  describe('Empty Cart Scenarios', () => {
    it('should show empty cart message when cart is empty', () => {
      mockUseSelector.mockReturnValue(mockEmptyCartState);

      render(<Checkout />);

      // Should show empty cart message
      expect(screen.getByText(/Your cart is empty/i)).toBeInTheDocument();
      expect(
        screen.getByText(
          /Please add some courses to your cart before checkout/i
        )
      ).toBeInTheDocument();

      // Should show "Browse Courses" button
      const browseCourses = screen.getByText(/Browse Courses/i);
      expect(browseCourses).toBeInTheDocument();
      expect(browseCourses.closest('a')).toHaveAttribute(
        'href',
        '/all-courses'
      );
    });

    it('should NOT show checkout form when cart is empty', () => {
      mockUseSelector.mockReturnValue(mockEmptyCartState);

      render(<Checkout />);

      // Checkout form should not be rendered
      expect(
        screen.queryByTestId('checkout-form-mock')
      ).not.toBeInTheDocument();
    });
  });

  describe('Cart with Items', () => {
    beforeEach(() => {
      mockUseSelector.mockReturnValue(mockCartState);
    });

    it('should render checkout form when cart has items', () => {
      render(<Checkout />);

      // Checkout form should be rendered
      expect(screen.getByTestId('checkout-form-mock')).toBeInTheDocument();
    });

    it('should display all cart items', () => {
      render(<Checkout />);

      // Should show both course titles
      expect(screen.getByText('React Fundamentals')).toBeInTheDocument();
      expect(screen.getByText('TypeScript Advanced')).toBeInTheDocument();
    });

    it('should calculate and display correct totals', () => {
      render(<Checkout />);

      // Tax rate is 5%
      const subtotal = 249.98;
      const tax = subtotal * 0.05;
      const grandTotal = subtotal + tax;

      // Check that all required information is displayed (not testing exact DOM structure)
      expect(screen.getByText(/Sub Total/i)).toBeInTheDocument();
      expect(screen.getByText(`$${subtotal}.00`)).toBeInTheDocument();

      expect(screen.getByText(/Tax \(5%\)/i)).toBeInTheDocument();
      expect(screen.getByText(`$${tax.toFixed(2)}`)).toBeInTheDocument();

      expect(screen.getByText(/Grand Total/i)).toBeInTheDocument();
      expect(screen.getByText(`$${grandTotal.toFixed(2)}`)).toBeInTheDocument();
    });
  });

  describe('Stripe Payment Method Selection', () => {
    it('should select Stripe by default when Stripe is enabled', () => {
      setEnv('NEXT_PUBLIC_STRIPE_ENABLED', 'true');
      mockUseSelector.mockReturnValue(mockSingleItemCartState);

      render(<Checkout />);

      // Stripe radio should be checked
      const stripeRadio = screen.getByLabelText(
        /Credit\/Debit Card \(Stripe\)/i
      );
      expect(stripeRadio).toBeChecked();
    });

    it('should select PayPal by default when Stripe is disabled', () => {
      setEnv('NEXT_PUBLIC_STRIPE_ENABLED', 'false');
      mockUseSelector.mockReturnValue(mockSingleItemCartState);

      render(<Checkout />);

      // PayPal radio should be checked
      const paypalRadio = screen.getByLabelText(/PayPal/i);
      expect(paypalRadio).toBeChecked();
    });

    it('should disable Stripe radio button when Stripe is disabled', () => {
      setEnv('NEXT_PUBLIC_STRIPE_ENABLED', 'false');
      mockUseSelector.mockReturnValue(mockSingleItemCartState);

      render(<Checkout />);

      // Stripe radio should be disabled
      const stripeRadio = screen.getByLabelText(
        /Credit\/Debit Card \(Stripe\)/i
      );
      expect(stripeRadio).toBeDisabled();

      // Should show "Coming Soon" text
      expect(screen.getByText('(Coming Soon)')).toBeInTheDocument();
    });
  });

  describe('Free Order Scenarios', () => {
    it('should show "Enroll Now (Free)" button for free orders', () => {
      mockUseSelector.mockReturnValue(mockFreeCartState);

      render(<Checkout />);

      // Should show free enrollment button
      expect(screen.getByText(/Enroll Now \(Free\)/i)).toBeInTheDocument();
    });

    it('should show "Place order" button for paid orders', () => {
      mockUseSelector.mockReturnValue(mockSingleItemCartState);

      render(<Checkout />);

      // Should show place order button
      expect(screen.getByText(/Place order/i)).toBeInTheDocument();
    });

    it('should NOT show payment method selection for free orders', () => {
      mockUseSelector.mockReturnValue(mockFreeCartState);

      render(<Checkout />);

      // Payment method section should not be visible
      expect(screen.queryByText(/Payment Method/i)).not.toBeInTheDocument();
    });
  });

  describe('Tax Calculation', () => {
    it('should correctly calculate 5% tax', () => {
      mockUseSelector.mockReturnValue(mockSingleItemCartState);

      render(<Checkout />);

      // Tax should be 5% of subtotal
      const expectedTax = 99.99 * 0.05;

      expect(screen.getByText(/Tax \(5%\)/i)).toBeInTheDocument();
      expect(
        screen.getByText(`$${expectedTax.toFixed(2)}`)
      ).toBeInTheDocument();
    });

    it('should calculate grand total as subtotal + tax', () => {
      const subtotal = 250.0;
      const taxRate = 0.05;
      const tax = subtotal * taxRate;
      const grandTotal = subtotal + tax;

      mockUseSelector.mockReturnValue({
        cart: [
          {
            id: 1,
            product: {
              courseTitle: 'Test Course',
              price: subtotal,
            },
            amount: 1,
          },
        ],
        total_amount: subtotal,
      });

      render(<Checkout />);

      expect(screen.getByText(/Grand Total/i)).toBeInTheDocument();
      expect(screen.getByText(`$${grandTotal.toFixed(2)}`)).toBeInTheDocument();
    });
  });
});
