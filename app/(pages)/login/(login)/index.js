'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import BreadCrumb from '@/components/Common/BreadCrumb';
import FooterOne from '@/components/Footer/Footer-One';
import HeaderStyleTen from '@/components/Header/HeaderStyle-Ten';
import MobileMenu from '@/components/Header/MobileMenu';
import Cart from '@/components/Header/Offcanvas/Cart';
import Login from '@/components/Login/Login';
import NewsletterThree from '@/components/Newsletters/Newsletter-Three';
import Context from '@/context/Context';
import Store from '@/redux/store';
import React from 'react';
import { Provider } from 'react-redux';

const LoginPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // 로딩 중일 때는 아무것도 하지 않음
    if (status === 'loading') return;

    // 이미 로그인된 경우 홈페이지로 리다이렉트
    if (session) {
      router.push('/');
    }
  }, [session, status, router]);

  // 로딩 중이거나 로그인된 경우 로딩 표시
  if (status === 'loading' || session) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: '100vh' }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  return (
    <>
      <Provider store={Store}>
        <Context>
          <HeaderStyleTen headerSticky="rbt-sticky" headerType="" />
          <MobileMenu />
          <Cart />
          <BreadCrumb title="Login & Register" text="Login & Register" />

          <div className="rbt-elements-area bg-color-white rbt-section-gap">
            <div className="container">
              <div className="row gy-5 row--30">
                <Login />
              </div>
            </div>
          </div>

          <div className="rbt-newsletter-area bg-gradient-6 ptb--50">
            <NewsletterThree />
          </div>

          <FooterOne />
        </Context>
      </Provider>
    </>
  );
};

export default LoginPage;
