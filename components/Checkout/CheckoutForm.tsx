'use client';

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import type { CheckoutFormData, CartItem } from '@/types/checkout';
import { createOrder } from '@/app/lib/actions/orderActions';
import { getUserProfile } from '@/app/lib/actions/userActions';

// Cart item type
interface CartItemProduct {
  id: string;
  title?: string;
  courseTitle?: string;
  price?: number;
  regular_price?: number;
}

interface CartItemType {
  id: string;
  amount: number;
  product: CartItemProduct;
}

// Redux state type
interface CartState {
  cart: CartItemType[];
  total_amount: number;
  shipping_fee: number;
  total_items: number;
  loading: boolean;
  error: boolean;
  msg: string;
}

interface RootState {
  CartReducer: CartState;
}

export interface CheckoutFormRef {
  handlePlaceOrder: () => Promise<void>;
  getPaymentMethod: () => string;
  setPaymentMethod: (method: 'stripe' | 'paypal' | 'cash_on_delivery') => void;
  isLoading: boolean;
}

const CheckoutForm = React.forwardRef<CheckoutFormRef>((props, ref) => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const cartItems = useSelector((state: RootState) => state.CartReducer.cart);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CheckoutFormData>({
    shipping: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: '',
      address: '',
      city: '',
      country: 'United States',
      zipCode: '',
      state: '',
    },
    billing: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: '',
      address: '',
      city: '',
      country: 'United States',
      zipCode: '',
      state: '',
      sameAsShipping: true,
    },
    paymentMethod: 'stripe',
    orderNotes: '',
    agreeToTerms: false,
  });

  // Auto-fill user information when logged in
  useEffect(() => {
    const loadUserProfile = async () => {
      if (session?.user?.email) {
        setIsLoadingProfile(true);
        try {
          const profile = await getUserProfile(session.user.email);
          if (profile) {
            setFormData((prev) => ({
              ...prev,
              shipping: {
                ...prev.shipping,
                firstName:
                  profile.first_name || profile.name?.split(' ')[0] || '',
                lastName:
                  profile.last_name || profile.name?.split(' ')[1] || '',
                email: profile.email || session.user.email,
                phone: profile.phone || '',
                company: '',
                // Keep address fields empty for user to fill
                address: prev.shipping.address || '',
                city: prev.shipping.city || '',
                state: prev.shipping.state || '',
                zipCode: prev.shipping.zipCode || '',
                country: prev.shipping.country || 'United States',
              },
            }));
          }
        } catch (error) {
          console.error('Failed to load user profile:', error);
        } finally {
          setIsLoadingProfile(false);
        }
      }
    };

    if (status === 'authenticated') {
      loadUserProfile();
    }
  }, [session, status]);

  // Handle input changes
  const handleShippingChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      shipping: {
        ...prev.shipping,
        [field]: value,
      },
    }));
  };

  const handleBillingChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      billing: {
        ...prev.billing,
        [field]: value,
      },
    }));
  };

  // Expose methods via ref
  React.useImperativeHandle(ref, () => ({
    handlePlaceOrder,
    getPaymentMethod: () => formData.paymentMethod,
    setPaymentMethod: (method: 'stripe' | 'paypal' | 'cash_on_delivery') => {
      setFormData((prev) => ({ ...prev, paymentMethod: method }));
    },
    isLoading,
  }));

  // Email validation helper
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Phone validation helper (accepts various formats)
  const isValidPhone = (phone: string): boolean => {
    // Remove all non-digit characters for validation
    const digitsOnly = phone.replace(/\D/g, '');
    // Check if it has at least 10 digits (for US/CA numbers)
    return digitsOnly.length >= 10;
  };

  // Handle Place Order
  const handlePlaceOrder = async () => {
    setError(null);

    // Enhanced validation with field-specific errors
    const validationErrors: string[] = [];

    if (!formData.shipping.firstName || !formData.shipping.lastName) {
      validationErrors.push('Please enter your first and last name');
    }

    if (!formData.shipping.email) {
      validationErrors.push('Please enter your email address');
    } else if (!isValidEmail(formData.shipping.email)) {
      validationErrors.push('Please enter a valid email address');
    }

    if (!formData.shipping.phone) {
      validationErrors.push('Please enter your phone number');
    } else if (!isValidPhone(formData.shipping.phone)) {
      validationErrors.push(
        'Please enter a valid phone number (at least 10 digits)'
      );
    }

    if (!formData.shipping.address || !formData.shipping.city) {
      validationErrors.push('Please enter your complete shipping address');
    }

    if (!formData.shipping.zipCode) {
      validationErrors.push('Please enter your zip/postal code');
    }

    if (!formData.agreeToTerms) {
      validationErrors.push('Please agree to the terms and conditions');
    }

    if (cartItems.length === 0) {
      validationErrors.push('Your cart is empty');
    }

    // Show all validation errors
    if (validationErrors.length > 0) {
      setError(validationErrors[0]); // Show first error
      return;
    }

    setIsLoading(true);

    try {
      // Prepare cart items for order
      const orderItems: CartItem[] = cartItems.map((item: CartItemType) => ({
        id: item.id,
        amount: item.amount,
        product: {
          id: item.product.id,
          title: item.product.title || item.product.courseTitle,
          courseTitle: item.product.courseTitle,
          price: item.product.price || item.product.regular_price || 0,
        },
      }));

      // If billing same as shipping, copy shipping data
      if (sameAsShipping) {
        formData.billing = { ...formData.shipping, sameAsShipping: true };
      }

      // Create order with improved error handling
      const result = await createOrder(formData, orderItems);

      if (result.success) {
        // Clear cart from localStorage
        localStorage.removeItem('cartItems');

        // Show success message briefly
        setError(null);

        // Redirect to success page with order info
        router.push(
          result.redirectUrl ||
            `/order-success?orderId=${result.orderId}&orderNumber=${result.orderNumber}`
        );
      } else {
        setError(result.error || 'Failed to place order. Please try again.');
        // Keep form data for retry
      }
    } catch (err) {
      console.error('Place order error:', err);
      setError(
        'An unexpected error occurred. Please try again or contact support.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="col-lg-7">
        <div className="checkout-content-wrapper">
          {/* Loading overlay for profile data */}
          {isLoadingProfile && (
            <div className="alert alert-info mb-4" role="alert">
              <i className="feather-loader mr-2 spin"></i> Loading your
              information...
            </div>
          )}

          {/* Processing order overlay */}
          {isLoading && (
            <div className="alert alert-warning mb-4" role="alert">
              <i className="feather-loader mr-2 spin"></i> Processing your
              order... Please do not refresh the page.
            </div>
          )}

          {error && !isLoading && (
            <div className="alert alert-danger mb-4" role="alert">
              <i className="feather-alert-circle mr-2"></i> {error}
            </div>
          )}

          <div id="billing-form">
            <h4 className="checkout-title">Billing Address</h4>

            <div className="row">
              <div className="col-md-6 col-12 mb--20">
                <label>First Name*</label>
                <input
                  type="text"
                  placeholder="First Name"
                  value={formData.shipping.firstName}
                  onChange={(e) =>
                    handleShippingChange('firstName', e.target.value)
                  }
                  required
                  disabled={isLoadingProfile || isLoading}
                />
              </div>

              <div className="col-md-6 col-12 mb--20">
                <label>Last Name*</label>
                <input
                  type="text"
                  placeholder="Last Name"
                  value={formData.shipping.lastName}
                  onChange={(e) =>
                    handleShippingChange('lastName', e.target.value)
                  }
                  required
                  disabled={isLoadingProfile || isLoading}
                />
              </div>

              <div className="col-md-6 col-12 mb--20">
                <label>Email Address*</label>
                <input
                  type="email"
                  placeholder="Email Address"
                  value={formData.shipping.email}
                  onChange={(e) =>
                    handleShippingChange('email', e.target.value)
                  }
                  required
                  disabled={isLoadingProfile || isLoading}
                />
              </div>

              <div className="col-md-6 col-12 mb--20">
                <label>Phone no*</label>
                <input
                  type="tel"
                  placeholder="Phone number (e.g., 123-456-7890)"
                  value={formData.shipping.phone}
                  onChange={(e) =>
                    handleShippingChange('phone', e.target.value)
                  }
                  required
                  disabled={isLoadingProfile || isLoading}
                />
              </div>

              <div className="col-12 mb--20">
                <label>Company Name</label>
                <input
                  type="text"
                  placeholder="Company Name (Optional)"
                  value={formData.shipping.company}
                  onChange={(e) =>
                    handleShippingChange('company', e.target.value)
                  }
                />
              </div>

              <div className="col-12 mb--20">
                <label>Address*</label>
                <input
                  type="text"
                  placeholder="Address"
                  value={formData.shipping.address}
                  onChange={(e) =>
                    handleShippingChange('address', e.target.value)
                  }
                  required
                />
              </div>

              <div className="col-md-6 col-12 mb--20">
                <label>Country*</label>
                <div className="rbt-modern-select bg-transparent height-45">
                  <select
                    className="w-100"
                    value={formData.shipping.country}
                    onChange={(e) =>
                      handleShippingChange('country', e.target.value)
                    }
                  >
                    <option value="United States">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Australia">Australia</option>
                    <option value="Germany">Germany</option>
                    <option value="France">France</option>
                    <option value="Japan">Japan</option>
                    <option value="South Korea">South Korea</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="col-md-6 col-12 mb--20">
                <label>City*</label>
                <input
                  type="text"
                  placeholder="City"
                  value={formData.shipping.city}
                  onChange={(e) => handleShippingChange('city', e.target.value)}
                  required
                />
              </div>

              <div className="col-md-6 col-12 mb--20">
                <label>State/Province</label>
                <input
                  type="text"
                  placeholder="State/Province"
                  value={formData.shipping.state}
                  onChange={(e) =>
                    handleShippingChange('state', e.target.value)
                  }
                />
              </div>

              <div className="col-md-6 col-12 mb--20">
                <label>Zip Code*</label>
                <input
                  type="text"
                  placeholder="Zip Code"
                  value={formData.shipping.zipCode}
                  onChange={(e) =>
                    handleShippingChange('zipCode', e.target.value)
                  }
                  required
                />
              </div>

              <div className="col-12 mb--20">
                <div className="check-box">
                  <input
                    type="checkbox"
                    id="shiping_address"
                    checked={!sameAsShipping}
                    onChange={(e) => setSameAsShipping(!e.target.checked)}
                  />
                  <label htmlFor="shiping_address">
                    Ship to Different Address
                  </label>
                </div>
                <div className="check-box">
                  <input
                    type="checkbox"
                    id="agree_terms"
                    checked={formData.agreeToTerms}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        agreeToTerms: e.target.checked,
                      }))
                    }
                  />
                  <label htmlFor="agree_terms">
                    I agree to the Terms & Conditions
                  </label>
                </div>
              </div>
            </div>
          </div>

          {!sameAsShipping && (
            <div id="shipping-form" className="mt--20">
              <h4 className="checkout-title">Shipping Address</h4>
              <div className="row g-5">
                <div className="col-md-6 col-12">
                  <label>First Name*</label>
                  <input
                    type="text"
                    placeholder="First Name"
                    value={formData.billing.firstName}
                    onChange={(e) =>
                      handleBillingChange('firstName', e.target.value)
                    }
                  />
                </div>

                <div className="col-md-6 col-12">
                  <label>Last Name*</label>
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={formData.billing.lastName}
                    onChange={(e) =>
                      handleBillingChange('lastName', e.target.value)
                    }
                  />
                </div>

                <div className="col-md-6 col-12">
                  <label>Email Address*</label>
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={formData.billing.email}
                    onChange={(e) =>
                      handleBillingChange('email', e.target.value)
                    }
                  />
                </div>

                <div className="col-md-6 col-12">
                  <label>Phone no*</label>
                  <input
                    type="text"
                    placeholder="Phone number"
                    value={formData.billing.phone}
                    onChange={(e) =>
                      handleBillingChange('phone', e.target.value)
                    }
                  />
                </div>

                <div className="col-12">
                  <label>Company Name</label>
                  <input
                    type="text"
                    placeholder="Company Name (Optional)"
                    value={formData.billing.company}
                    onChange={(e) =>
                      handleBillingChange('company', e.target.value)
                    }
                  />
                </div>

                <div className="col-12">
                  <label>Address*</label>
                  <input
                    type="text"
                    placeholder="Address"
                    value={formData.billing.address}
                    onChange={(e) =>
                      handleBillingChange('address', e.target.value)
                    }
                  />
                </div>

                <div className="col-md-6 col-12">
                  <label>Country*</label>
                  <div className="rbt-modern-select bg-transparent height-45">
                    <select
                      className="w-100"
                      value={formData.billing.country}
                      onChange={(e) =>
                        handleBillingChange('country', e.target.value)
                      }
                    >
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Australia">Australia</option>
                      <option value="Germany">Germany</option>
                      <option value="France">France</option>
                      <option value="Japan">Japan</option>
                      <option value="South Korea">South Korea</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="col-md-6 col-12">
                  <label>City*</label>
                  <input
                    type="text"
                    placeholder="City"
                    value={formData.billing.city}
                    onChange={(e) =>
                      handleBillingChange('city', e.target.value)
                    }
                  />
                </div>

                <div className="col-md-6 col-12">
                  <label>State/Province</label>
                  <input
                    type="text"
                    placeholder="State/Province"
                    value={formData.billing.state}
                    onChange={(e) =>
                      handleBillingChange('state', e.target.value)
                    }
                  />
                </div>

                <div className="col-md-6 col-12">
                  <label>Zip Code*</label>
                  <input
                    type="text"
                    placeholder="Zip Code"
                    value={formData.billing.zipCode}
                    onChange={(e) =>
                      handleBillingChange('zipCode', e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
});

CheckoutForm.displayName = 'CheckoutForm';

export default CheckoutForm;
