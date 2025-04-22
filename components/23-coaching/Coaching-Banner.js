import Image from "next/image";
import React from "react";

import coIcon from "../../public/images/shape/co-icon-1.png";
import coMen from "../../public/images/banner/co-men.png";
import coMen2 from "../../public/images/shape/co-men-gradient.png";
import coSocialBg from "../../public/images/shape/co-social-bg.png";
import coSocialBgDark from "../../public/images/shape/co-social-bg-dark.png";
import coEmoji from "../../public/images/shape/co-emoji-1.png";
import { useParallax } from "react-scroll-parallax";

const shapes = [
  {
    className: "main-bg",
    src: "/images/shape/co-banner-bg.png",
    alt: "Banner Shape",
    wdt: 1425,
    ht: 856,
  },
  {
    className: "bg-shape",
    src: "/images/shape/co-bg-shape.png",
    alt: "Banner Shape",
    wdt: 1420,
    ht: 932,
  },
  {
    className: "light-shadow",
    src: "/images/shape/co-light-shadow.png",
    alt: "Banner Shape",
    wdt: 301,
    ht: 337,
  },
  {
    className: "shape-gd-1",
    src: "/images/shape/co-gd-shape-1.png",
    alt: "Banner Shape",
    wdt: 127,
    ht: 325,
  },
  {
    className: "shape-yel-1",
    src: "/images/shape/co-yel.png",
    alt: "Banner Shape",
    wdt: 65,
    ht: 125,
  },
  {
    className: "shape-arrow-1",
    src: "/images/shape/co-arrow-1.png",
    alt: "Banner Shape",
    wdt: 60,
    ht: 70,
  },
  {
    className: "shape-union-1",
    src: "/images/shape/co-union.png",
    alt: "Banner Shape",
    wdt: 44,
    ht: 44,
  },
];

const CoachingBanner = () => {
  const sinceParallax = useParallax({ translateY: [0, 10] });

  return (
    <>
      <div className="rbt-banner-area rbt-banner-23">
        <div className="wrapper">
          <div className="shape-wrap">
            {shapes.map((shape, index) => (
              <div key={index} className={shape.className}>
                <Image
                  src={shape.src}
                  alt={shape.alt}
                  width={shape.wdt}
                  height={shape.ht}
                />
              </div>
            ))}
          </div>
          <div className="container">
            <div className="content-wrap d-flex d-xl-block flex-column-reverse flex-xl-row">
              <div className="inner">
                <h6 className="subtitle">
                  <span className="theme-gradient">
                    Grow Knowledge With ZARA
                  </span>
                </h6>
                <h1 className="title">
                  Faster Progress With{" "}
                  <span className="theme-gradient">
                    <span className="expert">Expert</span> Guidance
                  </span>
                </h1>
                <p className="description">
                  Amet minim mollit non deserunt ullamco est sit aliqua dolor do
                  amet sint. 
                  <span className="bold">Velit officia consequat.</span>
                </p>
                <div className="action">
                  <a
                    className="rbt-btn btn-gradient hover-icon-reverse"
                    href="#"
                  >
                    <span className="icon-reverse-wrapper">
                      <span className="btn-text">Start Learning</span>
                      <span className="btn-icon">
                        <i className="feather-arrow-right"></i>
                      </span>
                      <span className="btn-icon">
                        <i className="feather-arrow-right"></i>
                      </span>
                    </span>
                  </a>
                  <div className="sucess">
                    <span>
                      <Image src={coIcon} width={40} height={42} alt="Shape" />
                    </span>
                    <div>
                      <h6 className="number">100%</h6>
                      <span className="sucess-title">Success Rate</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="main-img-wrap">
                <div className="main-img">
                  <Image
                    ref={sinceParallax.ref}
                    src={coMen}
                    width={1385}
                    height={950}
                    unoptimized={true}
                    alt=""
                  />
                </div>
                <div className="shape">
                  <Image src={coMen2} width={1120} height={553} alt="Shape" />
                </div>
                <div className="social-media">
                  <div className="social-bg">
                    <Image
                      src={coSocialBg}
                      width={190}
                      height={153}
                      alt="Shape"
                    />
                  </div>
                  <div className="social-bg-dark">
                    <Image
                      src={coSocialBgDark}
                      width={192}
                      height={140}
                      alt="Shape"
                    />
                  </div>
                  <span className="subtitle">Social Midea:</span>
                  <h5 className="social-title">
                    Connect with me{" "}
                    <Image src={coEmoji} width={17} height={17} alt="" />
                  </h5>
                  <ul className="social-icon social-default mt--15 justify-content-start">
                    <li>
                      <a href="#">
                        <i className="feather-twitter"></i>
                      </a>
                    </li>
                    <li>
                      <a href="#">
                        <i className="feather-facebook"></i>
                      </a>
                    </li>
                    <li>
                      <a href="#">
                        <i className="feather-instagram"></i>
                      </a>
                    </li>
                    <li>
                      <a href="#">
                        <i className="feather-youtube"></i>
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CoachingBanner;
