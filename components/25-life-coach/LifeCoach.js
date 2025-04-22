"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

import { useParallax } from "react-scroll-parallax";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";

import "venobox/dist/venobox.min.css";

import TestimonialData from "../../data/elements/testimonial.json";
import CourseDetails from "../../data/course-details/courseData.json";

import BlogGrid from "../Blogs/BlogGrid";
import LifeCoachFeature from "./LifeCoachFeature";
import LifeCoachBanner from "./LifeCoach-Banner";
import CountDownTwo from "../Counters/CountDownTwo";
import CounterWrap from "../Counters/CounterWrap";

import shapeImg from "../../public/images/shape/brand-text-shape-01.png";
import brand1 from "../../public/images/brand/partner-5.webp";
import brand2 from "../../public/images/brand/partner-1.webp";
import brand3 from "../../public/images/brand/partner-6.webp";
import brand4 from "../../public/images/brand/partner-3.webp";
import awardIcon from "../../public/images/icons/award-gd-01.png";
import dots from "../../public/images/shape/coach-a-dot.png";
import coach1 from "../../public/images/about/coach-a-01.png";
import coach2 from "../../public/images/about/coach-a-02.png";
import newsShadow from "../../public/images/shape/newsletter-shadow-01.png";
import union from "../../public/images/shape/v-union.png";
import mailIcon from "../../public/images/icons/email-icon-01.png";

const LifeCoach = ({ blogdata }) => {
  let getAllCourse = JSON.parse(JSON.stringify(CourseDetails.courseDetails));

  const sinceParallax = useParallax({ translateY: [-20, 0] });
  const enrolledParallax = useParallax({ translateY: [10, 0] });

  useEffect(() => {
    import("venobox/dist/venobox.min.js").then((venobox) => {
      new venobox.default({
        selector: ".popup-video",
      });
    });
  }, []);
  return (
    <>
      <main className="rbt-main-wrapper">
        <LifeCoachBanner />

        <div className="rbt-newsletter-area newsletter-section-02">
          <div className="container newsletter-style-3">
            <div className="shape-1">
              <Image src={newsShadow} width={350} height={307} alt="Shape" />
            </div>
            <div className="shape-union">
              <Image src={union} width={93} height={93} alt="Shape" />
            </div>
            <div className="shape-2"></div>
            <div className="row align-items-center">
              <div className="col-lg-12">
                <div className="inner text-center">
                  <div className="section-title text-center">
                    <h2 className="title w-600">
                      Get My Free Essential <br /> Mindset{" "}
                      <span>
                        <Image
                          src={mailIcon}
                          width={50}
                          height={42}
                          alt="Icon"
                        />
                      </span>{" "}
                      Exercise
                    </h2>
                  </div>
                  <form
                    action="#"
                    className="newsletter-form-1 mt--30 radius-round"
                  >
                    <input
                      className="rbt-border"
                      type="email"
                      placeholder="Enter Your E-Email"
                    />
                    <button
                      type="submit"
                      className="rbt-btn btn-md hover-icon-reverse radius-round"
                    >
                      <span className="icon-reverse-wrapper">
                        <span className="btn-text">Subscribe</span>
                        <span className="btn-icon">
                          <i className="feather-arrow-right"></i>
                        </span>
                        <span className="btn-icon">
                          <i className="feather-arrow-right"></i>
                        </span>
                      </span>
                    </button>
                  </form>
                  <p className="b3 mt--20">No ads, No trails, No commitments</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <LifeCoachFeature />

        <div className="rbt-course-area rbt-sec-cir-shadow-1 bg-color-extra2 rbt-section-gap">
          <div className="gradient-shape-top"></div>
          <div className="gradient-shape-bottom"></div>
          <div className="container">
            <div className="row mb--50">
              <div className="col-lg-12">
                <div className="section-title text-center">
                  <span className="subtitle bg-primary-opacity">
                    Learn From Me
                  </span>
                  <h2 className="title w-600">Enroll Course Become Better</h2>
                </div>
              </div>
            </div>

            <div className="row g-5">
              {getAllCourse.slice(27, 30).map((data, index) => (
                <div className={`col-lg-4 col-md-6 col-12`} key={index}>
                  <div className="rbt-card variation-04 rbt-hover">
                    <div className="rbt-card-img">
                      <Link href={`/course-details/${data.id}`}>
                        <Image
                          src={data.courseImg}
                          width={355}
                          height={244}
                          alt="Card image"
                        />
                      </Link>
                    </div>
                    <div className="rbt-card-body">
                      <ul className="rbt-meta">
                        <li>
                          <i className="feather-book"></i>
                          {data.lesson} Lessons
                        </li>
                        <li>
                          <i className="feather-users"></i>
                          {data.student} Students
                        </li>
                      </ul>
                      <h4 className="rbt-card-title">
                        <Link href={`/course-details/${data.id}`}>
                          {data.courseTitle}
                        </Link>
                      </h4>
                      <p className="rbt-card-text">{data.desc}</p>

                      <div className="rbt-review">
                        <div className="rating">
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                        </div>
                        <span className="rating-count">
                          ({data.review} Reviews)
                        </span>
                      </div>

                      <div className="rbt-card-bottom">
                        <div className="rbt-price">
                          <span className="current-price mb-0">
                            ${data.price}
                          </span>
                          <span className="off-price version-02">
                            ${data.offPrice}
                          </span>
                        </div>

                        <Link
                          className="rbt-btn-link color-primary"
                          href={`/course-details/${data.id}`}
                        >
                          Enroll Course
                          <i className="feather-arrow-right"></i>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="row mt--50">
              <div className="col-lg-12">
                <div className="load-more-btn text-center">
                  <Link
                    className="rbt-btn btn-gradient btn-lg btn-mobile hover-icon-reverse"
                    href="/course-with-tab-two"
                  >
                    <span className="icon-reverse-wrapper">
                      <span className="btn-text">Load More</span>
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

        <div className="rbt-video-area rbt-video-banner bg_image bg_image_fixed bg_image--27">
          <div className="row">
            <div className="col-12">
              <div className="video-popup-wrapper version-02">
                <Link
                  className="rbt-btn btn-white rounded-player-2 popup-video position-to-top with-animation"
                  href="https://www.youtube.com/watch?v=nA1Aqp0sPQo"
                  data-vbtype="video"
                  controls
                >
                  <span className="play-icon"></span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="rbt-about-area rbt-section-gap about-style-3">
          <div className="container">
            <div className="row row--40 mt_dec--40">
              <div className="col-xl-6 col-12 mt--40">
                <div className="content">
                  <div className="section-title text-start mb--50">
                    <span className="subtitle bg-primary-opacity">
                      our approach
                    </span>
                    <h2 className="title w-600">
                      Creative And Helpful <br />{" "}
                      <span className="theme-gradient">Online Courses</span>
                    </h2>
                    <p className="mt--20">
                      At Histudy University, we are moving boldly - and
                      concertedly - to expand tomorrow's frontiers. We believe
                      that we have the power to shape the future, for the better
                    </p>
                  </div>
                  <div className="row g-5">
                    <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                      <div className="rbt-counterup style-2">
                        <div className="inner">
                          <div className="content">
                            <h3 className="counter w-500">
                              <span className="odometer">
                                <CounterWrap value={500} format="(d)" />
                              </span>
                            </h3>
                            <h5 className="mb--5 mt--5 w-500">
                              Certification Students
                            </h5>
                            <span className="b3">Learners &amp; counting</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                      <div className="rbt-counterup style-2">
                        <div className="inner">
                          <div className="content">
                            <h3 className="counter w-500">
                              <span className="odometer">
                                <CounterWrap value={800} format="(d)" />
                              </span>
                            </h3>
                            <h5 className="mb--5 mt--5 w-500">
                              Successfully Trained
                            </h5>
                            <span className="b3">Online Course</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-xl-6 col-12 mt--40">
                <div className="thumbnail-wrapper">
                  <div className="shape-1">
                    <Image src={dots} width={92} height={36} alt="Shape" />
                  </div>
                  <div className="shadow-shape"></div>
                  <div className="experience">
                    <span>
                      <Image
                        src={awardIcon}
                        width={36}
                        height={51}
                        alt="Award Icon"
                      />
                    </span>
                    <div className="title-wrap">
                      <h4 className="number">
                        <span className="odometer rbt-font-primary">
                          <CounterWrap value={30} format="(d)" />
                        </span>
                        <span className="plus">+</span>
                      </h4>
                      <p className="subtitle">Years Experience</p>
                    </div>
                  </div>
                  <div className="thumbnail-1">
                    <Image
                      data-parallax='{"x": 0, "y": -30}'
                      ref={sinceParallax.ref}
                      src={coach1}
                      width={420}
                      height={500}
                      alt="Thumbnail"
                    />
                  </div>
                  <div className="thumbnail-2">
                    <Image
                      data-parallax='{"x": 0, "y": 30}'
                      ref={enrolledParallax.ref}
                      src={coach2}
                      width={370}
                      height={420}
                      alt="Thumbnail"
                    />
                  </div>
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

        <div className="rbt-testimonial-area rbt-sec-cir-shadow-1 bg-color-extra2 rbt-section-gap">
          <div className="gradient-shape-top version-04"></div>
          <div className="gradient-shape-bottom verstion-04"></div>
          {TestimonialData &&
            TestimonialData.testimonialThree.map((data, index) => (
              <div className="container" key={index}>
                <div className="row">
                  <div className="col-lg-12 mb--60 mb_sm--50">
                    <div className="section-title text-center">
                      <span className="subtitle bg-primary-opacity">
                        EDUCATION FOR EVERYONE
                      </span>
                      <h2 className="title w-600">Student's Feedback</h2>
                    </div>
                  </div>
                </div>

                {TestimonialData.testimonialTwo.map((parent, parentIndex) => (
                  <Swiper
                    className="testimonial-item-3-activation swiper rbt-arrow-between icon-bg-gray rbt-dot-bottom-center pb--60 pb_sm--50 gutter-swiper-30"
                    slidesPerView={1}
                    key={parentIndex}
                    modules={[Navigation, Pagination]}
                    pagination={{
                      el: ".rbt-swiper-pagination",
                      clickable: true,
                    }}
                    navigation={{
                      nextEl: ".rbt-arrow-left",
                      prevEl: ".rbt-arrow-right",
                    }}
                    breakpoints={{
                      575: {
                        slidesPerView: 1,
                      },

                      768: {
                        slidesPerView: 2,
                      },

                      992: {
                        slidesPerView: 3,
                      },
                    }}
                  >
                    {parent.left.map((data, index) => (
                      <SwiperSlide className="swiper-wrapper" key={index}>
                        <div className="swiper-slide">
                          <div className="single-slide">
                            <div className="rbt-testimonial-box">
                              <div className="inner shadow-11">
                                <div className="clint-info-wrapper">
                                  <div className="thumb">
                                    <Image
                                      src={data.img}
                                      width={494}
                                      height={494}
                                      alt="Clint Images"
                                    />
                                  </div>
                                  <div className="client-info">
                                    <h5 className="title">{data.title}</h5>
                                    <span>
                                      {data.position} <i>{data.company}</i>
                                    </span>
                                  </div>
                                </div>
                                <div className="description">
                                  <p className="subtitle-3">{data.desc}</p>
                                  <div className="rating mt--20">
                                    <Link href="#">
                                      <i className="fa fa-star"></i>
                                    </Link>
                                    <Link href="#">
                                      <i className="fa fa-star"></i>
                                    </Link>
                                    <Link href="#">
                                      <i className="fa fa-star"></i>
                                    </Link>
                                    <Link href="#">
                                      <i className="fa fa-star"></i>
                                    </Link>
                                    <Link href="#">
                                      <i className="fa fa-star"></i>
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </SwiperSlide>
                    ))}
                    <div className="rbt-swiper-arrow rbt-arrow-left">
                      <div className="custom-overfolow">
                        <i className="rbt-icon feather-arrow-left"></i>
                        <i className="rbt-icon-top feather-arrow-left"></i>
                      </div>
                    </div>

                    <div className="rbt-swiper-arrow rbt-arrow-right">
                      <div className="custom-overfolow">
                        <i className="rbt-icon feather-arrow-right"></i>
                        <i className="rbt-icon-top feather-arrow-right"></i>
                      </div>
                    </div>

                    <div className="rbt-swiper-pagination"></div>
                  </Swiper>
                ))}
              </div>
            ))}
        </div>

        <div className="rbt-rbt-blog-area rbt-section-gap">
          <div className="gradient-shape-top version-02"></div>
          <div className="gradient-shape-bottom version-02"></div>
          <div className="container">
            <div className="row mb--30 mb_sm--50 g-5 align-items-end">
              <div className="col-lg-8 col-md-8 col-12">
                <div className="section-title text-start">
                  <span className="subtitle bg-primary-opacity">
                    News &amp; Blog
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
              start={3}
              end={6}
              blogdata={blogdata}
            />
          </div>
        </div>

        <div className="rbt-brand-area brand-section-01 bg-gradient-5 rbt-section-gap">
          <div className="container">
            <div className="row">
              <div className="col-lg-12 mb--60 mb_sm--50">
                <div className="section-title text-center">
                  <span className="subtitle bg-primary-opacity">
                    My trusted Client
                  </span>
                  <h2 className="title w-600">
                    I work in Collaboration{" "}
                    <span>
                      <Image
                        src={shapeImg}
                        width={34}
                        height={34}
                        alt="Shape"
                      />
                    </span>{" "}
                    With Over 100+ <br />{" "}
                    <span className="theme-gradient">
                      Coaches and Companies
                    </span>
                  </h2>
                </div>
              </div>
            </div>
            <ul className="brand-list brand-style-3 justify-content-start justify-content-lg-between">
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
                    src={brand3}
                    width={120}
                    height={135}
                    alt="Brand Image"
                  />
                </a>
              </li>{" "}
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
            </ul>
          </div>
        </div>
      </main>
    </>
  );
};

export default LifeCoach;
