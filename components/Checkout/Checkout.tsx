'use client';

import React, { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import dynamic from 'next/dynamic';

import CheckoutForm, { CheckoutFormRef } from './CheckoutForm';

// Define types for cart items and Redux state
interface Product {
  courseTitle?: string;
  title?: string;
  price: number;
}

interface CartItem {
  id: string | number;
  product: Product;
  amount: number;
  max?: number;
}

interface CartState {
  cart: CartItem[];
  total_amount: number;
  shipping_fee: number;
  total_items?: number;
  loading?: boolean;
  error?: boolean;
  msg?: string;
}

interface RootState {
  CartReducer: CartState;
}

const Checkout = (): JSX.Element => {
  const { cart, total_amount } = useSelector(
    (state: RootState) => state.CartReducer
  );

  const checkoutFormRef = useRef<CheckoutFormRef>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>('stripe');
  const [agreeToTerms, setAgreeToTerms] = useState<boolean>(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Constants
  const TAX_RATE = 0.05; // 5% tax rate

  // Calculate if this is a free order
  const subtotal = total_amount;
  const tax = subtotal * TAX_RATE;
  const grandTotal = subtotal + tax;
  const isFreeOrder = grandTotal === 0;

  const handlePaymentMethodChange = (method: string) => {
    setSelectedPaymentMethod(method);
    // Map payment method values to our system
    let mappedMethod: 'stripe' | 'paypal' | 'cash_on_delivery' = 'stripe';
    if (method === 'paypal') mappedMethod = 'paypal';
    else if (method === 'cash' || method === 'check' || method === 'bank')
      mappedMethod = 'cash_on_delivery';

    checkoutFormRef.current?.setPaymentMethod(mappedMethod);
  };

  const handlePlaceOrder = async () => {
    setPaymentError(null);

    if (!agreeToTerms) {
      setPaymentError('Please accept the terms & conditions');
      return;
    }

    if (!checkoutFormRef.current) {
      setPaymentError('Form not ready, please try again');
      return;
    }

    // Call the form's place order method
    await checkoutFormRef.current.handlePlaceOrder();
  };

  const handleFreeEnrollment = async () => {
    setPaymentError(null);

    if (!agreeToTerms) {
      setPaymentError('Please accept the terms & conditions');
      return;
    }

    if (!checkoutFormRef.current) {
      setPaymentError('Form not ready, please try again');
      return;
    }

    // For free orders, set payment method to 'free' and process immediately
    checkoutFormRef.current.setPaymentMethod('cash_on_delivery'); // Using COD for free orders
    await checkoutFormRef.current.handlePlaceOrder();
  };

  // Show empty cart message
  if (!cart || cart.length === 0) {
    return (
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="empty-cart-message text-center py-5">
              <i
                className="feather-shopping-cart mb-4"
                style={{ fontSize: '4rem', color: '#ccc' }}
              ></i>
              <h3 className="mb-3">Your cart is empty</h3>
              <p className="mb-4">
                Please add some courses to your cart before checkout.
              </p>
              <a href="/all-courses" className="rbt-btn btn-gradient">
                <span className="btn-text">Browse Courses</span>
                <span className="btn-icon">
                  <i className="feather-arrow-right"></i>
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container">
        <div className="row g-5 checkout-form">
          <CheckoutForm ref={checkoutFormRef} />

          <div className="col-lg-5">
            <div className="row pl--50 pl_md--0 pl_sm--0">
              <div className="col-12 mb--60">
                <h4 className="checkout-title">Cart Total</h4>

                <div className="checkout-cart-total">
                  <h4>
                    Product <span>Total</span>
                  </h4>

                  <ul>
                    {cart.map((data, index) => (
                      <li key={index}>
                        {data.product.courseTitle || data.product.title}
                        <span>${data.product.price * data.amount}.00</span>
                      </li>
                    ))}
                  </ul>

                  <p>
                    Sub Total
                    <span>${total_amount}.00</span>
                  </p>

                  <p>
                    Tax ({(TAX_RATE * 100).toFixed(0)}%){' '}
                    <span>${(total_amount * TAX_RATE).toFixed(2)}</span>
                  </p>

                  <h4 className="mt--30">
                    Grand Total{' '}
                    <span>${(total_amount * (1 + TAX_RATE)).toFixed(2)}</span>
                  </h4>
                </div>
              </div>

              <div className="col-12 mb--60">
                {!isFreeOrder && (
                  <>
                    <h4 className="checkout-title">Payment Method</h4>

                    {paymentError && (
                      <div className="alert alert-danger mb-3" role="alert">
                        {paymentError}
                      </div>
                    )}

                    <div
                      className="checkout-payment-method accordion rbt-accordion-style rbt-accordion-05 accordion"
                      id="accordionExamplea1"
                    >
                  <div className="single-method">
                    <input
                      type="radio"
                      id="payment_stripe"
                      name="payment-method"
                      value="stripe"
                      checked={selectedPaymentMethod === 'stripe'}
                      onChange={(e) =>
                        handlePaymentMethodChange(e.target.value)
                      }
                    />
                    <label
                      htmlFor="payment_stripe"
                      data-bs-toggle="collapse"
                      data-bs-target="#stripe"
                      aria-expanded="true"
                      aria-controls="stripe"
                    >
                      Credit/Debit Card (Stripe)
                    </label>
                    <div
                      className="accordion-collapse collapse show"
                      id="stripe"
                      aria-labelledby="headingOne"
                      data-bs-parent="#accordionExamplea1"
                    >
                      <div className="accordion-body">
                        Pay securely with your credit or debit card through
                        Stripe. Your payment information is encrypted and
                        secure.
                      </div>
                    </div>
                  </div>

                  <div className="single-method">
                    <input
                      type="radio"
                      id="payment_paypal"
                      name="payment-method"
                      value="paypal"
                      checked={selectedPaymentMethod === 'paypal'}
                      onChange={(e) =>
                        handlePaymentMethodChange(e.target.value)
                      }
                    />
                    <label
                      htmlFor="payment_paypal"
                      data-bs-toggle="collapse"
                      data-bs-target="#paypal"
                      aria-expanded="false"
                      aria-controls="paypal"
                    >
                      PayPal
                    </label>
                    <div
                      className="accordion-collapse collapse"
                      id="paypal"
                      aria-labelledby="headingTwo"
                      data-bs-parent="#accordionExamplea1"
                    >
                      <div className="accordion-body">
                        Pay with your PayPal account. You will be redirected to
                        PayPal to complete your payment securely.
                      </div>
                    </div>
                  </div>

                  <div className="single-method">
                    <input
                      type="radio"
                      id="payment_cash"
                      name="payment-method"
                      value="cash"
                      checked={selectedPaymentMethod === 'cash'}
                      onChange={(e) =>
                        handlePaymentMethodChange(e.target.value)
                      }
                    />
                    <label
                      htmlFor="payment_cash"
                      data-bs-toggle="collapse"
                      data-bs-target="#cash"
                      aria-expanded="false"
                      aria-controls="cash"
                    >
                      Pay Later
                    </label>
                    <div
                      className="accordion-collapse collapse"
                      id="cash"
                      aria-labelledby="headingThree"
                      data-bs-parent="#accordionExamplea1"
                    >
                      <div className="accordion-body">
                        Reserve your course now and pay later. Your enrollment
                        will be confirmed, and you can access the course after
                        payment is completed.
                      </div>
                    </div>
                  </div>
                    </div>
                  </>
                )}

                {/* Terms and conditions for all orders */}
                {paymentError && isFreeOrder && (
                  <div className="alert alert-danger mb-3" role="alert">
                    {paymentError}
                  </div>
                )}

                <div className="single-method">
                  <input
                    type="checkbox"
                    id="accept_terms"
                    checked={agreeToTerms}
                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                  />
                  <label htmlFor="accept_terms">
                    I&apos;ve read and accept the terms & conditions
                  </label>
                </div>
                <div className="plceholder-button mt--50">
                  {isFreeOrder ? (
                    <button
                      className="rbt-btn btn-gradient hover-icon-reverse"
                      onClick={handleFreeEnrollment}
                      disabled={checkoutFormRef.current?.isLoading}
                    >
                      <span className="icon-reverse-wrapper">
                        <span className="btn-text">
                          {checkoutFormRef.current?.isLoading
                            ? 'Processing...'
                            : 'Enroll Now (Free)'}
                        </span>
                        <span className="btn-icon">
                          <i className="feather-arrow-right"></i>
                        </span>
                        <span className="btn-icon">
                          <i className="feather-arrow-right"></i>
                        </span>
                      </span>
                    </button>
                  ) : (
                    <button
                      className="rbt-btn btn-gradient hover-icon-reverse"
                      onClick={handlePlaceOrder}
                      disabled={checkoutFormRef.current?.isLoading}
                    >
                      <span className="icon-reverse-wrapper">
                        <span className="btn-text">
                          {checkoutFormRef.current?.isLoading
                            ? 'Processing...'
                            : 'Place order'}
                        </span>
                        <span className="btn-icon">
                          <i className="feather-arrow-right"></i>
                        </span>
                        <span className="btn-icon">
                          <i className="feather-arrow-right"></i>
                        </span>
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default dynamic(() => Promise.resolve(Checkout), { ssr: false });
