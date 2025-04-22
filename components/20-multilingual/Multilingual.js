"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

import sal from "sal.js";

import MultilingualBanner from "./Multilingual-Banner";
import BlogGrid from "../Blogs/BlogGrid";
import TestimonialFour from "../Testimonials/Testimonial-Four";
import CountDownTwo from "../Counters/CountDownTwo";

import CourseTabData from "../../data/elements/advanceTab.json";

import brand1 from "../../public/images/brand/partner-5.webp";
import brand2 from "../../public/images/brand/partner-1.webp";
import brand3 from "../../public/images/brand/partner-6.webp";
import brand4 from "../../public/images/brand/partner-3.webp";
import ukSvg from "../../public/images/shape/united-kingdom.svg";
import germanySvg from "../../public/images/shape/germany.svg";
import skSvg from "../../public/images/shape/south-korea.svg";
import franceSvg from "../../public/images/shape/france.svg";
import japanSvg from "../../public/images/shape/japan.svg";
import italySvg from "../../public/images/shape/italian.svg";

const FeatureData = [
  {
    id: 1,
    img: "/images/icons/f-icon-01.png",
    title: "Best Industry",
    subTitle: "Leaders",
    description:
      "It is a long established fact that a reader will be distracted by this on readable.",
  },
  {
    id: 2,
    img: "/images/icons/f-icon-02.png",
    title: "Learn Courses",
    subTitle: "Online",
    description:
      "It is a long established fact that a reader will be distracted by this on readable.",
  },
  {
    id: 3,
    img: "/images/icons/f-icon-03.png",
    title: "Online Book",
    subTitle: "Library",
    description:
      "It is a long established fact that a reader will be distracted by this on readable.",
  },
];
const Multilingual = ({ blogdata }) => {
  const getAllCourse = JSON.parse(JSON.stringify(CourseTabData.courseTab));

  useEffect(() => {
    sal({
      threshold: 0.01,
      once: true,
    });
  }, []);
  return (
    <>
      <main className="rbt-main-wrapper">
        <MultilingualBanner />
        <div className="rbt-feature-area rbt-section-gap">
          <div className="container">
            <div className="row g-5">
              {FeatureData.map((data, i) => (
                <div className="col-xl-4 col-lg-6 col-md-6 col-12" key={i}>
                  <div className="rbt-feature-card">
                    <div className="d-sm-flex align-items-center gap-4">
                      <span
                        className={`icon ${
                          data.id === 1 ? "bg-color-pink" : "bg-color-primary"
                        } ${data.id === 3 ? "bg-color-secondary" : ""}`}
                      >
                        <Image
                          src={data.img}
                          width={35}
                          height={35}
                          alt="Banner Icon"
                        />
                      </span>
                      <h6 className="card-title mt-4 mt-sm-0">
                        {data.title} <br /> {data.subTitle}
                      </h6>
                    </div>
                    <p className="description">{data.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rbt-course-area rbt-section-gapBottom">
          <div className="container">
            <div className="row mb--30">
              <div className="col-lg-12">
                <div className="section-title text-center">
                  <h6 className="b2 mb--15">
                    <span className="theme-gradient">Our Course</span>
                  </h6>
                  <h2 className="title w-600">
                    Limitless Learning, More <br />{" "}
                    <span className="theme-gradient">Possibilities</span>
                  </h2>
                </div>
              </div>
            </div>
            <div className="row mb--40">
              <div className="col-lg-12">
                <div className="rbt-course-tab-button-wrap">
                  <ul
                    className="rbt-course-tab-button nav nav-tabs"
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
                        <span className="icon">
                          <Image
                            src={ukSvg}
                            width={20}
                            height={20}
                            alt="Flag Icon"
                          />
                        </span>
                        <span className="btn-text">English</span>
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
                        <span className="icon">
                          <Image
                            src={germanySvg}
                            width={20}
                            height={20}
                            alt="Flag Icon"
                          />
                        </span>
                        <span className="btn-text">German</span>
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
                        <span className="icon">
                          <Image
                            src={skSvg}
                            width={20}
                            height={20}
                            alt="Flag Icon"
                          />
                        </span>
                        <span className="btn-text">Korean</span>
                      </button>
                    </li>
                    <li className="nav-item" role="presentation">
                      <button
                        id="business-tab"
                        data-bs-toggle="tab"
                        data-bs-target="#business"
                        type="button"
                        role="tab"
                        aria-controls="business"
                        aria-selected="false"
                      >
                        <span className="icon">
                          <Image
                            src={franceSvg}
                            width={20}
                            height={20}
                            alt="Flag Icon"
                          />
                        </span>
                        <span className="btn-text">French</span>
                      </button>
                    </li>
                    <li className="nav-item" role="presentation">
                      <button
                        id="language-tab"
                        data-bs-toggle="tab"
                        data-bs-target="#language"
                        type="button"
                        role="tab"
                        aria-controls="language"
                        aria-selected="false"
                      >
                        <span className="icon">
                          <Image
                            src={japanSvg}
                            width={20}
                            height={20}
                            alt="Flag Icon"
                          />
                        </span>
                        <span className="btn-text">Japanese</span>
                      </button>
                    </li>
                    <li className="nav-item" role="presentation">
                      <button
                        id="italian-tab"
                        data-bs-toggle="tab"
                        data-bs-target="#italian"
                        type="button"
                        role="tab"
                        aria-controls="italian"
                        aria-selected="false"
                      >
                        <span className="icon">
                          <Image
                            src={italySvg}
                            width={20}
                            height={20}
                            alt="Flag Icon"
                          />
                        </span>
                        <span className="btn-text">Italian</span>
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-12">
                <div className="tab-content" id="rbt-myTabContent">
                  {getAllCourse.map((data, i) => (
                    <div
                      className={`tab-pane fade ${
                        data.isActive ? "active show" : ""
                      }`}
                      id={data.category}
                      role="tabpanel"
                      aria-labelledby={`${data.category}-tab`}
                      key={i}
                    >
                      <div className="row g-5">
                        {data.body.map((innerData, index) => (
                          <div
                            className="col-xl-4 col-lg-4 col-md-6 col-sm-6 col-12"
                            // data-sal-delay="150"
                            // data-sal="slide-up"
                            // data-sal-duration="800"
                            key={index}
                          >
                            <div className="rbt-card variation-03 rbt-hover">
                              <div className="rbt-card-img">
                                <Link
                                  className="thumbnail-link"
                                  href={`/course-withtab-two`}
                                >
                                  <Image
                                    src={innerData.img}
                                    width={355}
                                    height={244}
                                    alt="Card image"
                                  />
                                  <span className="rbt-btn btn-white icon-hover btn-md">
                                    <span className="btn-text">Read More</span>
                                    <span className="btn-icon">
                                      <i className="feather-arrow-right"></i>
                                    </span>
                                  </span>
                                </Link>
                              </div>
                              <div className="rbt-card-body">
                                <h5 className="rbt-card-title">
                                  <Link href={`/course-withtab-two`}>
                                    English Courses
                                  </Link>
                                </h5>
                                <div className="rbt-card-bottom">
                                  <Link
                                    className="transparent-button"
                                    href={`/course-withtab-two`}
                                  >
                                    <i>
                                      <svg
                                        width="17"
                                        height="12"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <g
                                          stroke="#27374D"
                                          fill="none"
                                          fillRule="evenodd"
                                        >
                                          <path d="M10.614 0l5.629 5.629-5.63 5.629"></path>
                                          <path
                                            strokeLinecap="square"
                                            d="M.663 5.572h14.594"
                                          ></path>
                                        </g>
                                      </svg>
                                    </i>
                                  </Link>
                                </div>
                              </div>
                              <div className="card-information">
                                <div className="card-flag">
                                  <Image
                                    src={innerData.flagImg}
                                    width={20}
                                    height={20}
                                    alt="united-kingdom"
                                  />
                                </div>
                                <div className="card-count">
                                  {innerData.totalCourse} programs
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="row mt--55">
              <div className="col-lg-12">
                <div className="load-more-btn text-center">
                  <Link
                    className="rbt-btn btn-gradient btn-lg hover-icon-reverse"
                    href="/course-card-3"
                  >
                    <span className="icon-reverse-wrapper">
                      <span className="btn-text">View All Courses</span>
                      <span className="btn-icon">
                        <i className="feather-arrow-right"></i>
                      </span>
                      <span className="btn-icon">
                        <i className="feather-arrow-right"></i>
                      </span>
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className="rbt-countdown-area bg_image bg_image--6 bg_image_fixed rbt-section-gap"
          data-black-overlay="5"
        >
          <div className="container">
            <CountDownTwo />
          </div>
        </div>

        <div className="rbt-testimonial-area bg-color-white rbt-section-gap">
          <TestimonialFour />
          <div className="container">
            <div className="mt--80">
              <div className="rbt-brand-title-wrap">
                <h5 className="rbt-brand-title w-600 text-center mb-0">
                  Making
                  <span className="theme-gradient ms-2">
                    sensitive clients
                  </span>{" "}
                  more valuable for{" "}
                  <span className="theme-gradient me-2">companies</span>
                  like
                </h5>
              </div>
              <ul className="brand-list brand-style-3 justify-content-start justify-content-lg-between mt--30">
                <li>
                  <a href="#">
                    <Image
                      src={brand1}
                      width={120}
                      height={135}
                      alt="Brand Image"
                    />
                  </a>
                </li>
                <li>
                  <a href="#">
                    <Image
                      src={brand2}
                      width={120}
                      height={135}
                      alt="Brand Image"
                    />
                  </a>
                </li>
                <li>
                  <a href="#">
                    <Image
                      src={brand1}
                      width={120}
                      height={135}
                      alt="Brand Image"
                    />
                  </a>
                </li>
                <li>
                  <a href="#">
                    <Image
                      src={brand3}
                      width={120}
                      height={135}
                      alt="Brand Image"
                    />
                  </a>
                </li>
                <li>
                  <a href="#">
                    <Image
                      src={brand4}
                      width={120}
                      height={135}
                      alt="Brand Image"
                    />
                  </a>
                </li>{" "}
                <li>
                  <a href="#">
                    <Image
                      src={brand2}
                      width={120}
                      height={135}
                      alt="Brand Image"
                    />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="rbt-blog-area rbt-sec-cir-shadow-1 rbt-section-gap bg-color-extra2 rbt-section-box">
          <div className="gradient-shape-top version-02"></div>
          <div className="gradient-shape-bottom version-02"></div>
          <div className="container">
            <div className="row mb--60 mb_sm--50 g-5 align-items-end">
              <div className="col-lg-8 col-md-8 col-12">
                <div className="section-title text-start">
                  <span className="subtitle bg-primary-opacity">
                    News & Blog
                  </span>
                  <h2 className="title w-600">
                    Have a Look on{" "}
                    <span className="theme-gradient">Our Update</span>
                  </h2>
                </div>
              </div>
              <div className="col-lg-4 col-md-4 col-12">
                <div className="load-more-btn text-start text-md-end">
                  <Link
                    className="rbt-btn btn-gradient hover-icon-reverse"
                    href="/blog-list"
                  >
                    <span className="icon-reverse-wrapper">
                      <span className="btn-text">View All Posts</span>
                      <span className="btn-icon">
                        <i className="feather-arrow-right"></i>
                      </span>
                      <span className="btn-icon">
                        <i className="feather-arrow-right"></i>
                      </span>
                    </span>
                  </Link>
                </div>
              </div>
            </div>
            <BlogGrid
              isPagination={false}
              top={false}
              start={0}
              end={3}
              blogdata={blogdata}
            />
          </div>
        </div>
      </main>
    </>
  );
};

export default Multilingual;
