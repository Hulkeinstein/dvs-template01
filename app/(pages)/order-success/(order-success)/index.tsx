'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Provider } from 'react-redux';
import Store from '@/redux/store';
import Context from '@/context/Context';
import HeaderStyleTen from '@/components/Header/HeaderStyle-Ten';
import MobileMenu from '@/components/Header/MobileMenu';
import Cart from '@/components/Header/Offcanvas/Cart';
import Separator from '@/components/Common/Separator';
import FooterOne from '@/components/Footer/Footer-One';

const OrderSuccessPage = (): JSX.Element => {
  const searchParams = useSearchParams();
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  useEffect(() => {
    // Get order details from URL params
    const orderIdParam = searchParams.get('orderId');
    const orderNumberParam = searchParams.get('orderNumber');

    if (orderIdParam) {
      // Order ID is available but not currently displayed
      // Kept for future use if needed
    }
    if (orderNumberParam) {
      setOrderNumber(orderNumberParam);
    }
  }, [searchParams]);

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
                  <div className="success-icon mb-4">
                    <div className="rbt-round-icon bg-color-success-opacity">
                      <i
                        className="feather-check"
                        style={{ fontSize: '3rem', color: '#22c55e' }}
                      ></i>
                    </div>
                  </div>

                  <h2 className="title mb-4">Thank You for Your Order!</h2>

                  <p className="description mb-4">
                    Your order has been successfully placed. You will receive a
                    confirmation email shortly.
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
