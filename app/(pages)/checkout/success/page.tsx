'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import CapturePayment from './CapturePayment';

interface OrderDetails {
  orderId: string;
  orderNumber?: string;
  courseTitle?: string;
  amount?: number;
  paymentMethod?: string;
}

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPayPalFlow, setIsPayPalFlow] = useState(false);
  const [paypalOrderId, setPaypalOrderId] = useState<string | null>(null);
  const [payerId, setPayerId] = useState<string | null>(null);

  useEffect(() => {
    // Check for PayPal redirect first (token parameter)
    const token = searchParams.get('token');
    const PayerID = searchParams.get('PayerID');

    if (token) {
      // PayPal redirect - show capture component
      setIsPayPalFlow(true);
      setPaypalOrderId(token);
      setPayerId(PayerID);
      setIsLoading(false);
      return;
    }

    // Regular order success flow
    const orderId = searchParams.get('orderId');
    const orderNumber = searchParams.get('orderNumber');

    if (!orderId) {
      // Redirect to home if no order ID and not PayPal flow
      router.push('/');
      return;
    }

    // Set basic order details from URL params
    setOrderDetails({
      orderId,
      orderNumber: orderNumber || orderId,
    });
    setIsLoading(false);

    // Optional: Fetch full order details from API
    // fetchOrderDetails(orderId);
  }, [searchParams, router]);

  if (isLoading || status === 'loading') {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading order details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PayPal flow - render capture component
  if (isPayPalFlow && paypalOrderId) {
    return (
      <CapturePayment
        paypalOrderId={paypalOrderId}
        payerId={payerId || undefined}
      />
    );
  }

  if (!orderDetails) {
    return null;
  }

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
                Thank you for your purchase. Your order has been processed
                successfully.
              </p>
            </div>

            {/* Order Details Card */}
            <div className="card shadow-sm mb-4">
              <div className="card-body p-4">
                <h5 className="card-title mb-4">Order Details</h5>

                <div className="order-info">
                  <div className="row mb-3">
                    <div className="col-5 text-muted">Order Number:</div>
                    <div className="col-7 fw-semibold">
                      #{orderDetails.orderNumber}
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-5 text-muted">Payment Status:</div>
                    <div className="col-7">
                      <span className="badge bg-success">Completed</span>
                    </div>
                  </div>

                  {orderDetails.paymentMethod && (
                    <div className="row mb-3">
                      <div className="col-5 text-muted">Payment Method:</div>
                      <div className="col-7 text-capitalize">
                        {orderDetails.paymentMethod}
                      </div>
                    </div>
                  )}

                  {session?.user?.email && (
                    <div className="row mb-3">
                      <div className="col-5 text-muted">Email:</div>
                      <div className="col-7">{session.user.email}</div>
                    </div>
                  )}
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
                    confirmation email has been sent to your email address
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
                href={
                  session?.user
                    ? `/student/dashboard?ref=order-${orderDetails.orderId}`
                    : '/courses'
                }
                className="rbt-btn btn-gradient hover-icon-reverse mb-3 me-3"
              >
                <span className="icon-reverse-wrapper">
                  <span className="btn-text">
                    {session?.user ? 'Go to My Courses' : 'Browse Courses'}
                  </span>
                  <span className="btn-icon">
                    <i className="feather-arrow-right"></i>
                  </span>
                  <span className="btn-icon">
                    <i className="feather-arrow-right"></i>
                  </span>
                </span>
              </Link>

              <Link href="/" className="rbt-btn btn-border hover-icon-reverse">
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

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="container py-5">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
