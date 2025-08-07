'use client';

import { useState, useEffect } from 'react'; // useState, useEffect 추가
import Image from 'next/image';
import Link from 'next/link';

import logo from '../../public/images/logo/logo.png';

import Nav from './Nav';
import { useAppContext } from '@/context/Context';

const MobileMenu = () => {
  // mobile 상태와 함께 mounted 상태도 가져오거나, 여기서 직접 생성합니다.
  // 여기서는 직접 생성하는 방식을 보여드립니다.
  const { mobile, setMobile } = useAppContext();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 마운트되기 전에는 렌더링하지 않아 Hydration 오류를 방지합니다.
  if (!mounted) {
    return null;
  }

  return (
    <>
      <div className={`popup-mobile-menu ${mobile ? '' : 'active'}`}>
        <div className="backdrop" onClick={() => setMobile(!mobile)}></div>
        <div className="inner-wrapper">
          <div className="inner-top">
            <div className="content">
              <div className="logo">
                <Link href="/">
                  <Image
                    src={logo}
                    width={137}
                    height={45}
                    alt="Education Logo Images"
                  />
                </Link>
              </div>
              <div className="rbt-btn-close">
                <button
                  className="close-button rbt-round-btn"
                  onClick={() => setMobile(!mobile)}
                >
                  <i className="feather-x"></i>
                </button>
              </div>
            </div>
            <p className="description">
              Histudy is a education website template. You can customize all.
            </p>
            <ul className="navbar-top-left rbt-information-list justify-content-start">
              <li>
                <Link href="mailto:hello@example.com">
                  <i className="feather-mail"></i>example@gmail.com
                </Link>
              </li>
              <li>
                <Link href="#">
                  <i className="feather-phone"></i>(302) 555-0107
                </Link>
              </li>
            </ul>
          </div>

          <Nav />

          <div className="mobile-menu-bottom">
            <div className="rbt-btn-wrapper mb--20">
              <Link
                className="rbt-btn btn-border-gradient radius-round btn-sm hover-transform-none w-100 justify-content-center text-center"
                href="#"
              >
                <span>Enroll Now</span>
              </Link>
            </div>

            <div className="social-share-wrapper">
              <span className="rbt-short-title d-block">Find With Us</span>
              <ul className="social-icon social-default transparent-with-border justify-content-start mt--20">
                <li>
                  <Link href="https://www.facebook.com/">
                    <i className="feather-facebook"></i>
                  </Link>
                </li>
                <li>
                  <Link href="https://www.twitter.com">
                    <i className="feather-twitter"></i>
                  </Link>
                </li>
                <li>
                  <Link href="https://www.instagram.com/">
                    <i className="feather-instagram"></i>
                  </Link>
                </li>
                <li>
                  <Link href="https://www.linkdin.com/">
                    <i className="feather-linkedin"></i>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileMenu;
