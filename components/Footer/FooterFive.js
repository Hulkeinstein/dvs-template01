import Image from "next/image";
import React, { useEffect } from "react";
import Link from "next/link";
import sal from "sal.js";

import footerGd from "../../public/images/shape/footer-gd-01.png";
import hello from "../../public/images/shape/w-hello.png";
import { useParallax } from "react-scroll-parallax";

const FooterFive = () => {
  const { ref: ref1, style: style1 } = useParallax({
    translateY: [10, 30],
    speed: -1,
    lerp: 0.8,
  });

  useEffect(() => {
    sal({
      threshold: 0.01,
      once: true,
    });
  }, []);
  return (
    <>
      <footer className="rbt-footer footer-style-3 overflow-hidden">
        <div className="shape-gd-1">
          <Image
            ref={ref1}
            style={style1}
            src={footerGd}
            width={713}
            height={218}
            alt="Gradient Shape"
          />
        </div>
        <div className="container">
          <div className="footer-5-top">
            <div className="text-center section-title-2">
              <div>
                <Image src={hello} width={69} height={52} alt="Banner Shape" />
              </div>
              <h2 className="title mb--30">Exploring Course</h2>
              <form action="#" className="newsletter-form-1 radius-round">
                <input
                  className="rbt-border"
                  type="email"
                  placeholder="Enter Your Email"
                />
                <button
                  type="submit"
                  className="rbt-btn btn-md btn-gradient hover-icon-reverse radius-round"
                >
                  <span className="icon-reverse-wrapper">
                    <span className="btn-text">Join Wishlist</span>
                    <span className="btn-icon">
                      <i className="feather-arrow-right"></i>
                    </span>
                    <span className="btn-icon">
                      <i className="feather-arrow-right"></i>
                    </span>
                  </span>
                </button>
              </form>
            </div>
          </div>
        </div>
        <div className="container-fluid">
          <h2 className="big-title">UI/UX Design</h2>
        </div>
        <div className="copyright-area copyright-style-1 pt--20 pb--30">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-xxl-6 col-xl-6 col-lg-6 col-md-12 col-12">
                <p className="rbt-link-hover text-center text-lg-start">
                  © 2025 <a href="https://rainbowthemes.net">Rainbow-Themes.</a>{" "}
                  All Rights Reserved
                </p>
              </div>
              <div className="col-xxl-6 col-xl-6 col-lg-6 col-md-12 col-12">
                <ul className="copyright-link rbt-link-hover justify-content-center justify-content-lg-end mt_sm--10 mt_md--10">
                  <li>
                    <a href="#">Terms of service</a>
                  </li>
                  <li>
                    <Link href="/privacy-policy">Privacy policy</Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default FooterFive;
