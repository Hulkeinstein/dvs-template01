import React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";

import { useParallax } from "react-scroll-parallax";
const Odometer = dynamic(() => import("react-odometerjs"), {
  ssr: false,
  loading: () => 0,
});

import hShapeDots from "../../public/images/shape/h-shape-dot-01.png";
import awardImg from "../../public/images/icons/award-gd-01.png";
import videoIcon from "../../public/images/icons/video-icon-01.png";
import personImg from "../../public/images/others/health-b-01.png";
import addImg from "../../public/images/others/health-b-02.png";
import union from "../../public/images/shape/v-union.png";
import signature from "../../public/images/others/signature-01.png";

const HealthGoal = () => {
  const sinceParallax = useParallax({ translateY: [-20, 0] });
  const enrolledParallax = useParallax({ translateY: [20, 0] });

  return (
    <>
      <div className="rbt-About-area rbt-section-gapTop">
        <div className="about-style-4 version-02">
          <div className="u-shape">
            <Image src={union} width={136} height={136} alt="Shape" />
          </div>
          <div className="container">
            <div className="row row--40 mt_dec--40">
              <div className="col-xl-6 col-12 mt--40">
                <div className="about-thumb">
                  <div className="shape-1">
                    <Image
                      src={hShapeDots}
                      width={31}
                      height={82}
                      alt="Shape"
                    />
                  </div>
                  <div className="since">
                    <span>
                      <Image
                        src={awardImg}
                        width={36}
                        height={51}
                        alt="Award Icon"
                      />
                    </span>
                    <div className="title-wrap">
                      <h4 className="number">
                        <span
                          className="odometer rbt-font-primary"
                          data-count="1890"
                        >
                          <Odometer value={1890} />
                        </span>
                      </h4>
                      <h6 className="subtitle">Since</h6>
                    </div>
                  </div>
                  <div className="satisfied">
                    <span>
                      <Image src={videoIcon} width={41} height={41} alt="" />
                    </span>
                    <div className="title-wrap">
                      <h6 className="item-title">
                        <span
                          className="odometer rbt-font-primary"
                          data-count="99"
                        >
                          <Odometer value={99} />
                        </span>
                        %
                      </h6>
                      <h6 className="subtitle">Satisfied</h6>
                    </div>
                  </div>
                  <div ref={enrolledParallax.ref} className="thumb-1">
                    <Image
                      src={personImg}
                      width={390}
                      height={480}
                      alt="Thumb"
                    />
                  </div>
                  <div ref={sinceParallax.ref} className="thumb-2">
                    <Image src={addImg} width={339} height={336} alt="Thumb" />
                  </div>
                </div>
              </div>
              <div className="col-xl-6 col-12 mt--40">
                <div className="content">
                  <div className="section-title">
                    <h6 className="b2 mb--15">
                      <span className="theme-gradient">
                        Welcome To Histudy Institute
                      </span>
                    </h6>
                    <h2 className="title w-600">
                      Your Goals Are Within <br />{" "}
                      <svg
                        width="40"
                        height="30"
                        viewBox="0 0 40 30"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M2 16.8032C7.91578 16.9588 13.8152 14.5642 17.3757 9.31372C18.7544 7.28056 19.2564 4.87202 19.6736 2.5C20.006 12.1364 30.1484 15.4819 38 16.8227C30.9581 16.3571 23.3519 20.0182 22.65 27.5C18.2438 20.052 10.1583 17.4958 2 16.8032Z"
                          fill="white"
                          stroke="url(#paint0_linear_100_66)"
                          strokeWidth="4"
                          strokeMiterlimit="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>
                        <defs>
                          <linearGradient
                            id="paint0_linear_100_66"
                            x1="18.2"
                            y1="2.5"
                            x2="18.2"
                            y2="27.5"
                            gradientUnits="userSpaceOnUse"
                          >
                            <stop offset="0" stopColor="#2F57EF"></stop>
                            <stop offset="1" stopColor="#C586EE"></stop>
                          </linearGradient>
                        </defs>
                      </svg>{" "}
                      Reach.
                    </h2>
                    <ul
                      className="rbt-course-tab-button mt--40 mb--35 justify-content-start nav nav-tabs"
                      id="rbt-myTab"
                      role="tablist"
                    >
                      <li className="nav-item" role="presentation">
                        <button
                          className="active"
                          id="development-tab"
                          data-bs-toggle="tab"
                          data-bs-target="#development"
                          type="button"
                          role="tab"
                          aria-controls="development"
                          aria-selected="true"
                        >
                          <span className="filter-text">Our History</span>
                        </button>
                      </li>
                      <li className="nav-item" role="presentation">
                        <button
                          id="ui_ux-tab"
                          data-bs-toggle="tab"
                          data-bs-target="#ui-ux"
                          type="button"
                          role="tab"
                          aria-controls="ui-ux"
                          aria-selected="false"
                        >
                          <span className="filter-text">Our Mission</span>
                        </button>
                      </li>
                      <li className="nav-item" role="presentation">
                        <button
                          id="marketing-tab"
                          data-bs-toggle="tab"
                          data-bs-target="#marketing"
                          type="button"
                          role="tab"
                          aria-controls="marketing"
                          aria-selected="false"
                        >
                          <span className="filter-text">Our Values</span>
                        </button>
                      </li>
                    </ul>
                    <div className="tab-content" id="rbt-myTabContent">
                      <div
                        className="tab-pane fade active show"
                        id="development"
                        role="tabpanel"
                        aria-labelledby="development-tab"
                      >
                        <p className="mt--20">
                          At Histudy University, we are moving boldly - and
                          concertedly - to expand tomorrow's frontiers. We
                          believe that we have the power to shape the future,
                          for the better
                        </p>
                        <ul className="mt--30 mb--25">
                          <li>
                            <span className="icon bg-primary-opacity">
                              <i className="feather-heart"></i>
                            </span>
                            <span className="text">Flexible Classes</span>
                          </li>
                          <li>
                            <span className="icon bg-secondary-opacity">
                              <i className="feather-book"></i>
                            </span>
                            <span className="text">Learn From Anywhere</span>
                          </li>
                        </ul>
                        <div className="d-flex align-items-center gap-5 flex-wrap">
                          <Link
                            className="rbt-btn btn-gradient hover-icon-reverse"
                            href="/about-us-01"
                          >
                            <span className="icon-reverse-wrapper">
                              <span className="btn-text">Explore More</span>
                              <span className="btn-icon">
                                <i className="feather-arrow-right"></i>
                              </span>
                              <span className="btn-icon">
                                <i className="feather-arrow-right"></i>
                              </span>
                            </span>
                          </Link>
                          <div>
                            <Image
                              src={signature}
                              width={150}
                              height={106}
                              alt="Signature"
                            />
                          </div>
                        </div>
                      </div>
                      <div
                        className="tab-pane fade"
                        id="ui-ux"
                        role="tabpanel"
                        aria-labelledby="ui_ux-tab"
                      >
                        <p className="mt--20">
                          At Histudy University, we are moving boldly - and
                          concertedly - to expand tomorrow's frontiers. We
                          believe that we have the power to shape the future,
                          for the better
                        </p>
                        <ul className="mt--30 mb--25">
                          <li>
                            <span className="icon bg-primary-opacity">
                              <i className="feather-heart"></i>
                            </span>
                            <span className="text">Flexible Classes</span>
                          </li>
                          <li>
                            <span className="icon bg-secondary-opacity">
                              <i className="feather-book"></i>
                            </span>
                            <span className="text">Learn From Anywhere</span>
                          </li>
                        </ul>
                        <div className="d-flex align-items-center gap-5 flex-wrap">
                          <Link
                            className="rbt-btn btn-gradient hover-icon-reverse"
                            href="/about-us-01"
                          >
                            <span className="icon-reverse-wrapper">
                              <span className="btn-text">Explore More</span>
                              <span className="btn-icon">
                                <i className="feather-arrow-right"></i>
                              </span>
                              <span className="btn-icon">
                                <i className="feather-arrow-right"></i>
                              </span>
                            </span>
                          </Link>
                          <div>
                            <Image
                              src={signature}
                              width={150}
                              height={106}
                              alt="Signature"
                            />
                          </div>
                        </div>
                      </div>
                      <div
                        className="tab-pane fade"
                        id="marketing"
                        role="tabpanel"
                        aria-labelledby="marketing-tab"
                      >
                        <p className="mt--20">
                          At Histudy University, we are moving boldly - and
                          concertedly - to expand tomorrow's frontiers. We
                          believe that we have the power to shape the future,
                          for the better
                        </p>
                        <ul className="mt--30 mb--25">
                          <li>
                            <span className="icon bg-primary-opacity">
                              <i className="feather-heart"></i>
                            </span>
                            <span className="text">Flexible Classes</span>
                          </li>
                          <li>
                            <span className="icon bg-secondary-opacity">
                              <i className="feather-book"></i>
                            </span>
                            <span className="text">Learn From Anywhere</span>
                          </li>
                        </ul>
                        <div className="d-flex align-items-center gap-5 flex-wrap">
                          <Link
                            className="rbt-btn btn-gradient hover-icon-reverse"
                            href="/about-us-01"
                          >
                            <span className="icon-reverse-wrapper">
                              <span className="btn-text">Explore More</span>
                              <span className="btn-icon">
                                <i className="feather-arrow-right"></i>
                              </span>
                              <span className="btn-icon">
                                <i className="feather-arrow-right"></i>
                              </span>
                            </span>
                          </Link>
                          <div>
                            <Image
                              src={signature}
                              width={150}
                              height={106}
                              alt="Signature"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HealthGoal;
