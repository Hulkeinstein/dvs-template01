'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Provider } from 'react-redux';
import Store from '@/redux/store';
import Context from '@/context/Context';
import HeaderStyleTen from '@/components/Header/HeaderStyle-Ten';
import MobileMenu from '@/components/Header/MobileMenu';
import Cart from '@/components/Header/Offcanvas/Cart';
import Separator from '@/components/Common/Separator';
import FooterOne from '@/components/Footer/Footer-One';
import {
  capturePayPalOrderAction,
  getOrderByNumber,
} from '@/app/lib/actions/orderActions';

interface PayPalDetails {
  transactionId: string;
  amount: string;
  currency: string;
}

const OrderSuccessPage = (): JSX.Element => {
  const searchParams = useSearchParams();
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [isProcessingPayPal, setIsProcessingPayPal] = useState(false);
  const [paypalError, setPaypalError] = useState<string | null>(null);
  const [paypalDetails, setPaypalDetails] = useState<PayPalDetails | null>(
    null
  );
  const [captureAttempted, setCaptureAttempted] = useState(false);
  const [isDownloadingReceipt, setIsDownloadingReceipt] = useState(false);
  const [receiptError, setReceiptError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    // Get order details from URL params
    const orderIdParam = searchParams.get('orderId');
    const orderNumberParam = searchParams.get('orderNumber');
    const paypalToken = searchParams.get('token');

    // Check if this is a PayPal redirect - ONLY ATTEMPT ONCE
    if (paypalToken && !captureAttempted) {
      setCaptureAttempted(true); // Mark as attempted immediately
      setIsProcessingPayPal(true);

      // Process PayPal capture
      capturePayPalOrderAction(paypalToken)
        .then((result) => {
          console.log('[OrderSuccess] PayPal capture result:', result);
          if (result.success && 'transactionId' in result) {
            // Type guard ensures we have all required PayPalDetails fields
            setPaypalDetails({
              transactionId: result.transactionId,
              amount: result.amount,
              currency: result.currency,
            });
            // Use PayPal order ID as order number if not provided
            setOrderNumber(result.orderId || paypalToken.slice(0, 10));
            setOrderId(result.orderId); // Store the database order ID (UUID)
            console.log('[OrderSuccess] Set orderId to:', result.orderId);
          } else {
            setPaypalError(
              'error' in result ? result.error : 'Payment processing failed'
            );
          }
          setIsProcessingPayPal(false);
        })
        .catch((error) => {
          console.error('PayPal capture error:', error);
          setPaypalError('An unexpected error occurred');
          setIsProcessingPayPal(false);
        });
    } else if (orderNumberParam) {
      setOrderNumber(orderNumberParam);
      // Try to get order ID from database using order number
      if (orderNumberParam) {
        getOrderByNumber(orderNumberParam).then((result) => {
          if (result.success && result.orders && result.orders.length > 0) {
            setOrderId(result.orders[0].id);
          }
        });
      }
    } else if (orderIdParam) {
      setOrderNumber(orderIdParam.slice(0, 10));
      setOrderId(orderIdParam);
    }
  }, [searchParams, captureAttempted]); // captureAttempted is safe - only set once

  // Function to handle receipt download
  const handleDownloadReceipt = async () => {
    console.log('[ReceiptDownload] Starting download, orderId:', orderId);

    if (!orderId) {
      console.log('[ReceiptDownload] No orderId available');
      setReceiptError('Order ID not found');
      return;
    }

    setIsDownloadingReceipt(true);
    setReceiptError(null);

    try {
      console.log('[ReceiptDownload] Generating PDF for orderId:', orderId);

      // Make API call to generate PDF (GET request)
      const response = await fetch(`/api/receipts/generate?orderId=${orderId}`);

      if (!response.ok) {
        throw new Error('Failed to generate receipt');
      }

      // Get the PDF blob
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${orderNumber || orderId}.pdf`;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading receipt:', error);
      setReceiptError(
        error instanceof Error ? error.message : 'Failed to download receipt'
      );
    } finally {
      setIsDownloadingReceipt(false);
    }
  };

  return (
    <Provider store={Store}>
      <Context>
        <HeaderStyleTen headerSticky="rbt-sticky" />
        <MobileMenu />
        <Cart />

        <div className="rbt-page-banner-wrapper">
          <div className="rbt-banner-image"></div>
        </div>

        <div className="rbt-section-gap">
          <div className="container">
            <div className="row">
              <div className="col-lg-8 offset-lg-2">
                <div className="order-success-wrapper text-center">
                  {/* Loading State for PayPal Processing */}
                  {isProcessingPayPal ? (
                    <>
                      <div className="mb-4">
                        <div
                          className="spinner-border text-primary"
                          role="status"
                        >
                          <span className="visually-hidden">Processing...</span>
                        </div>
                      </div>
                      <h3 className="title mb-3">Finalizing your payment...</h3>
                      <p className="description">
                        Please wait while we process your PayPal payment.
                      </p>
                    </>
                  ) : paypalError ? (
                    /* Error State */
                    <>
                      <div className="error-icon mb-4">
                        <div className="rbt-round-icon bg-color-danger-opacity">
                          <i
                            className="feather-x"
                            style={{ fontSize: '3rem', color: '#dc2626' }}
                          ></i>
                        </div>
                      </div>
                      <h2 className="title mb-4">Payment Processing Failed</h2>
                      <p className="description text-danger mb-4">
                        {paypalError}
                      </p>
                      <div className="button-group">
                        <Link href="/" className="rbt-btn btn-gradient">
                          Back to Home
                        </Link>
                      </div>
                    </>
                  ) : (
                    /* Success State */
                    <>
                      <div className="success-icon mb-4">
                        <div className="rbt-round-icon bg-color-success-opacity">
                          <i
                            className="feather-check"
                            style={{ fontSize: '3rem', color: '#22c55e' }}
                          ></i>
                        </div>
                      </div>

                      <h2 className="title mb-4">
                        {paypalDetails
                          ? 'Payment Successful!'
                          : 'Thank You for Your Order!'}
                      </h2>

                      <p className="description mb-4">
                        Your order has been successfully{' '}
                        {paypalDetails ? 'paid via PayPal' : 'placed'}. You will
                        receive a confirmation email shortly.
                      </p>

                      {orderNumber && (
                        <div className="order-details mb-4">
                          <div
                            className="order-number-box"
                            style={{
                              background: '#f5f5f5',
                              padding: '20px',
                              borderRadius: '8px',
                              border: '2px solid #22c55e',
                            }}
                          >
                            <p
                              style={{
                                fontSize: '14px',
                                color: '#666',
                                margin: '0',
                              }}
                            >
                              Order Number
                            </p>
                            <h3
                              style={{
                                fontSize: '28px',
                                fontWeight: 'bold',
                                color: '#333',
                                margin: '5px 0',
                              }}
                            >
                              {orderNumber}
                            </h3>
                            <p
                              style={{
                                fontSize: '12px',
                                color: '#999',
                                margin: '0',
                              }}
                            >
                              Please save this number for your records
                            </p>
                          </div>
                        </div>
                      )}

                      {/* PayPal Transaction Details */}
                      {paypalDetails && (
                        <div className="paypal-details mb-4">
                          <div className="row">
                            <div className="col-md-12">
                              <div className="card">
                                <div className="card-body">
                                  <h5 className="mb-3">Payment Details</h5>
                                  <div className="row">
                                    <div className="col-6 text-start">
                                      <p className="text-muted mb-2">
                                        Transaction ID:
                                      </p>
                                    </div>
                                    <div className="col-6 text-end">
                                      <p className="fw-bold text-break">
                                        {paypalDetails.transactionId}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="row">
                                    <div className="col-6 text-start">
                                      <p className="text-muted mb-2">
                                        Amount Paid:
                                      </p>
                                    </div>
                                    <div className="col-6 text-end">
                                      <p className="fw-bold">
                                        {paypalDetails.currency} $
                                        {paypalDetails.amount}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="row">
                                    <div className="col-6 text-start">
                                      <p className="text-muted mb-0">
                                        Payment Method:
                                      </p>
                                    </div>
                                    <div className="col-6 text-end">
                                      <p className="fw-bold mb-0">
                                        <i className="feather-check-circle text-success me-1"></i>
                                        PayPal
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Download Receipt Button */}
                      {orderId && (
                        <div className="receipt-download mb-4">
                          <button
                            className="rbt-btn btn-sm btn-gradient"
                            onClick={handleDownloadReceipt}
                            disabled={isDownloadingReceipt}
                            style={{
                              minWidth: '200px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px',
                            }}
                          >
                            {isDownloadingReceipt ? (
                              <>
                                <span
                                  className="spinner-border spinner-border-sm"
                                  role="status"
                                >
                                  <span className="visually-hidden">
                                    Loading...
                                  </span>
                                </span>
                                Generating Receipt...
                              </>
                            ) : (
                              <>
                                <i className="feather-download"></i>
                                Download Receipt (PDF)
                              </>
                            )}
                          </button>
                          {receiptError && (
                            <div
                              className="alert alert-danger mt-3"
                              role="alert"
                            >
                              <i className="feather-alert-circle me-2"></i>
                              {receiptError}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="order-next-steps">
                        <h4 className="mb-3">What&apos;s Next?</h4>
                        <ul className="list-style-1">
                          <li>
                            <i className="feather-check-circle"></i>
                            You&apos;ll receive an email confirmation with your
                            order details
                          </li>
                          <li>
                            <i className="feather-check-circle"></i>
                            You can now access your enrolled courses from your
                            dashboard
                          </li>
                          <li>
                            <i className="feather-check-circle"></i>
                            Start learning immediately with our online materials
                          </li>
                        </ul>
                      </div>

                      <div className="button-group mt-5">
                        <a
                          href="/student-dashboard"
                          className="rbt-btn btn-gradient hover-icon-reverse"
                        >
                          <span className="icon-reverse-wrapper">
                            <span className="btn-text">Go to Dashboard</span>
                            <span className="btn-icon">
                              <i className="feather-arrow-right"></i>
                            </span>
                            <span className="btn-icon">
                              <i className="feather-arrow-right"></i>
                            </span>
                          </span>
                        </a>

                        <a
                          href="/student-enrolled-course"
                          className="rbt-btn btn-border ml-3"
                        >
                          View My Courses
                        </a>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator />
        <FooterOne
          isBox={false}
          bgColor=""
          newsletterBorder={false}
          islamic={false}
        />
      </Context>
    </Provider>
  );
};

export default OrderSuccessPage;
