'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { capturePayPalOrderAction } from '@/app/lib/actions/orderActions';

interface CapturePaymentProps {
  paypalOrderId?: string;
  payerId?: string;
}

export default function CapturePayment({
  paypalOrderId,
  payerId,
}: CapturePaymentProps) {
  const [state, setState] = useState<{
    phase: 'idle' | 'capturing' | 'done' | 'error';
    msg?: string;
    details?: any;
  }>({ phase: 'idle' });

  useEffect(() => {
    if (!paypalOrderId) {
      setState({
        phase: 'error',
        msg: 'Missing PayPal order token. Please contact support.',
      });
      return;
    }

    (async () => {
      try {
        setState({ phase: 'capturing' });

        const result = await capturePayPalOrderAction(paypalOrderId);

        if (result.success) {
          setState({
            phase: 'done',
            details: result,
            msg: 'Payment completed successfully!',
          });
        } else {
          setState({
            phase: 'error',
            msg: result.error || 'Failed to process payment',
          });
        }
      } catch (error: any) {
        console.error('[CapturePayment] Error:', error);
        setState({
          phase: 'error',
          msg: error?.message ?? 'An unexpected error occurred',
        });
      }
    })();
  }, [paypalOrderId]);

  // Capturing state
  if (state.phase === 'capturing') {
    return (
      <div className="rbt-checkout-success-area bg-color-white rbt-section-gapTop">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="text-center py-5">
                <div
                  className="spinner-border text-primary mb-4"
                  role="status"
                  style={{ width: '3rem', height: '3rem' }}
                >
                  <span className="visually-hidden">Processing...</span>
                </div>
                <h3 className="title mb-3">Finalizing your payment...</h3>
                <p className="description text-muted">
                  Please wait while we process your PayPal payment.
                  <br />
                  Do not close this window.
                </p>
                {payerId && (
                  <p className="mt-3 text-sm text-muted">Payer ID: {payerId}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (state.phase === 'error') {
    return (
      <div className="rbt-checkout-success-area bg-color-white rbt-section-gapTop">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="text-center mb-5">
                <div
                  className="bg-danger rounded-circle d-inline-flex align-items-center justify-content-center mb-4"
                  style={{ width: '100px', height: '100px' }}
                >
                  <i
                    className="feather-x text-white"
                    style={{ fontSize: '3rem' }}
                  ></i>
                </div>
                <h2 className="title mb-3">Payment Processing Failed</h2>
                <p className="description text-danger mb-4">{state.msg}</p>
              </div>

              <div className="card shadow-sm mb-4">
                <div className="card-body p-4">
                  <h5 className="card-title mb-3">What to do next?</h5>
                  <ul className="list-unstyled mb-0">
                    <li className="mb-2">
                      <i className="feather-alert-circle text-warning me-2"></i>
                      Try refreshing this page
                    </li>
                    <li className="mb-2">
                      <i className="feather-credit-card text-info me-2"></i>
                      Check your PayPal account for payment status
                    </li>
                    <li className="mb-2">
                      <i className="feather-mail text-primary me-2"></i>
                      Contact support if the issue persists
                    </li>
                  </ul>
                </div>
              </div>

              <div className="text-center">
                <Link
                  href="/"
                  className="rbt-btn btn-gradient hover-icon-reverse"
                >
                  <span className="icon-reverse-wrapper">
                    <span className="btn-text">Back to Home</span>
                    <span className="btn-icon">
                      <i className="feather-home"></i>
                    </span>
                    <span className="btn-icon">
                      <i className="feather-home"></i>
                    </span>
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (state.phase === 'done') {
    return (
      <div className="rbt-checkout-success-area bg-color-white rbt-section-gapTop">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              {/* Success Header */}
              <div className="success-header text-center mb-5">
                <div className="success-icon mb-4">
                  <div
                    className="bg-success rounded-circle d-inline-flex align-items-center justify-content-center"
                    style={{ width: '100px', height: '100px' }}
                  >
                    <i
                      className="feather-check text-white"
                      style={{ fontSize: '3rem' }}
                    ></i>
                  </div>
                </div>
                <h2 className="title mb-3">Payment Successful!</h2>
                <p className="description">
                  Thank you for your purchase. Your payment has been processed
                  successfully via PayPal.
                </p>
              </div>

              {/* Order Details Card */}
              <div className="card shadow-sm mb-4">
                <div className="card-body p-4">
                  <h5 className="card-title mb-4">Payment Details</h5>

                  <div className="order-info">
                    {state.details?.orderId && (
                      <div className="row mb-3">
                        <div className="col-5 col-sm-4 text-muted">
                          Order ID:
                        </div>
                        <div className="col-7 col-sm-8 fw-bold">
                          {state.details.orderId}
                        </div>
                      </div>
                    )}

                    {state.details?.transactionId && (
                      <div className="row mb-3">
                        <div className="col-5 col-sm-4 text-muted">
                          Transaction ID:
                        </div>
                        <div className="col-7 col-sm-8 fw-bold text-break">
                          {state.details.transactionId}
                        </div>
                      </div>
                    )}

                    {state.details?.amount && (
                      <div className="row mb-3">
                        <div className="col-5 col-sm-4 text-muted">
                          Amount Paid:
                        </div>
                        <div className="col-7 col-sm-8 fw-bold">
                          {state.details.currency} ${state.details.amount}
                        </div>
                      </div>
                    )}

                    <div className="row mb-3">
                      <div className="col-5 col-sm-4 text-muted">
                        Payment Status:
                      </div>
                      <div className="col-7 col-sm-8">
                        <span className="badge bg-success">Completed</span>
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-5 col-sm-4 text-muted">
                        Payment Method:
                      </div>
                      <div className="col-7 col-sm-8 fw-bold">
                        <i className="feather-check-circle text-success me-1"></i>
                        PayPal
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* What's Next Card */}
              <div className="card shadow-sm mb-4">
                <div className="card-body p-4">
                  <h5 className="card-title mb-3">What&apos;s Next?</h5>
                  <ul className="list-unstyled mb-0">
                    <li className="mb-2">
                      <i className="feather-check-circle text-success me-2"></i>
                      You can now access your enrolled courses
                    </li>
                    <li className="mb-2">
                      <i className="feather-mail text-primary me-2"></i>A
                      confirmation email has been sent
                    </li>
                    <li className="mb-2">
                      <i className="feather-book-open text-info me-2"></i>
                      Start learning at your own pace
                    </li>
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="text-center">
                <Link
                  href="/student/dashboard"
                  className="rbt-btn btn-gradient hover-icon-reverse mb-3 me-3"
                >
                  <span className="icon-reverse-wrapper">
                    <span className="btn-text">Go to My Courses</span>
                    <span className="btn-icon">
                      <i className="feather-arrow-right"></i>
                    </span>
                    <span className="btn-icon">
                      <i className="feather-arrow-right"></i>
                    </span>
                  </span>
                </Link>

                <Link
                  href="/"
                  className="rbt-btn btn-border hover-icon-reverse"
                >
                  <span className="icon-reverse-wrapper">
                    <span className="btn-text">Back to Home</span>
                    <span className="btn-icon">
                      <i className="feather-home"></i>
                    </span>
                    <span className="btn-icon">
                      <i className="feather-home"></i>
                    </span>
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
