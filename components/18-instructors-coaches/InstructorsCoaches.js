import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";

import CourseDetails from "../../data/course-details/courseData.json";
import TestimonialData from "../../data/elements/testimonial.json";

import BlogGrid from "../Blogs/BlogGrid";
import NewsletterTwo from "../Newsletters/Newsletter-Two";
import InstructorsCoachesBanner from "./InstructorsCoaches-Banner";

import unionImg from "../../public/images/shape/v-union.png";
import starImg from "../../public/images/shape/v-star.png";
import videoImg from "../../public/images/others/video-09.png";

import useCategoryCount from "@/context/useCategoryCount";

import "venobox/dist/venobox.min.css";

const InstructorsCoaches = ({ blogdata }) => {
  let getAllCourse = JSON.parse(
    JSON.stringify(CourseDetails.instructorsCoaches)
  );

  const { categoryCounts } = useCategoryCount(CourseDetails.courseDetails);

  const [courseFilter, setCourseFilter] = useState(getAllCourse);
  const [activeTab, setActiveTab] = useState("All Course");

  const filterItem = (types) => {
    const updateItem = getAllCourse.filter((curElm) => {
      return curElm.courseType === types;
    });

    if (types !== "All Course") {
      setCourseFilter(updateItem);
    } else {
      setCourseFilter(getAllCourse);
    }
  };

  const handleButtonClick = (courseType) => {
    setCourseFilter(getAllCourse);
    setActiveTab(courseType);
    filterItem(courseType);
  };

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
        <InstructorsCoachesBanner />

        <div className="rbt-category-area rbt-section-gapBottom">
          <div className="container">
            <div className="section-title text-center mb--55">
              <h6 className="b2 mb--15">
                <span className="theme-gradient">Popular Subject</span>
              </h6>
              <h2 className="title w-600">
                Explore Top Courses Caterories <br /> That
                <span className="theme-gradient ms-3">Change Yourself</span>
              </h2>
            </div>

            <Swiper
              className="swiper category-activation-one rbt-arrow-between icon-bg-gray rbt-dot-bottom-center gutter-swiper-30 pb--50"
              slidesPerView={1}
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
                481: {
                  slidesPerView: 1,
                },
                768: {
                  slidesPerView: 2,
                },
                992: {
                  slidesPerView: 3,
                },
                1200: {
                  slidesPerView: 4,
                },
              }}
            >
              {CourseDetails &&
                CourseDetails.courseDetails
                  .slice(0, 8)
                  .map((item, innerIndex) => {
                    const count = categoryCounts[item.category] || 0;

                    return (
                      <SwiperSlide className="swiper-wrapper" key={innerIndex}>
                        <div className="swiper-slide">
                          <div className="single-slide">
                            <Link
                              className="rbt-cat-box rbt-cat-box-1 text-center"
                              rel="preload"
                              as="fetch"
                              href={`/course-filter-one-toggle/${item.category}`}
                            >
                              <div className="inner">
                                <div className="icons">
                                  <Image
                                    src={item.cateSmallImg}
                                    width={80}
                                    height={80}
                                    priority
                                    alt="Icons Images"
                                  />
                                </div>
                                <div className="content">
                                  <h5 className="title">{item.category}</h5>
                                  <div className="read-more-btn">
                                    <span className="rbt-btn-link">
                                      {count} Course{count !== 1 ? "s" : ""}
                                      <i className="feather-arrow-right"></i>
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </Link>
                          </div>
                        </div>
                      </SwiperSlide>
                    );
                  })}

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
          </div>
        </div>

        <div className="rbt-course-area rbt-sec-cir-shadow-1 bg-color-extra2 rbt-section-gap">
          <div className="gradient-shape-top"></div>
          <div className="gradient-shape-bottom"></div>
          <div className="container">
            <div className="row mb--30">
              <div className="col-lg-12">
                <div className="section-title text-center">
                  <h6 className="b2 mb--15">
                    <span className="theme-gradient">Our Course</span>
                  </h6>
                  <h2 className="title w-600">
                    Limitless Learning, More <br />
                    <span className="theme-gradient">Possibilities</span>
                  </h2>
                </div>
              </div>
            </div>
            <div className="row mb--40">
              <div className="rbt-course-tab-button-wrap">
                <div className="col-lg-12">
                  <ul
                    className="rbt-course-tab-button nav nav-tabs"
                    id="rbt-myTab"
                    role="tablist"
                  >
                    {[
                      "All Course",
                      "Development",
                      "UI/UX Design",
                      "Marketing",
                      "Business",
                      "Language",
                    ].map((courseType, index) => (
                      <li key={index} className="nav-item" role="presentation">
                        <button
                          className={activeTab === courseType ? "active" : ""}
                          type="button"
                          onClick={() => handleButtonClick(courseType)}
                        >
                          <span className="filter-text text-capitalize">
                            {courseType}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <div className="row mb--40">
              <div className="col-lg-12">
                <div className="tab-content" id="rbt-myTabContent">
                  <div className="row g-5">
                    {courseFilter.slice(0, 6).map((data, index) => (
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
                              {data.offPrice > 0 ? (
                                <div className="rbt-badge-3 bg-white">
                                  <span>-{data.offPrice}%</span>
                                  <span>Off</span>
                                </div>
                              ) : (
                                ""
                              )}
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
                </div>
              </div>
            </div>
            <div className="row mt--55 mt_sm--50">
              <div className="col-lg-12">
                <div className="load-more-btn text-center">
                  <Link
                    className="rbt-btn btn-gradient btn-lg btn-mobile hover-icon-reverse"
                    href="/course-with-tab-two"
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

        <div className="rbt-video-area video-section-03 bg-color-white rbt-section-gap">
          <div className="container">
            <div className="row g-5 align-items-center position-relative">
              <div className="union-shape">
                <Image
                  src={unionImg}
                  width={136}
                  height={136}
                  unoptimized={true}
                  alt="Union Shape"
                />
              </div>
              <div className="star-shape">
                <Image
                  src={starImg}
                  width={50}
                  height={75}
                  unoptimized={true}
                  alt="Shape"
                />
              </div>
              <div className="col-lg-6">
                <div className="video-popup-wrapper">
                  <Image
                    className="w-100 rbt-radius"
                    src={videoImg}
                    width={668}
                    height={556}
                    unoptimized={true}
                    alt="Video Images"
                  />
                  <Link
                    className="rbt-btn rounded-player popup-video position-to-top rbtplayer border-rounded"
                    href="https://www.youtube.com/watch?v=nA1Aqp0sPQo"
                    data-vbtype="video"
                    controls
                  >
                    <span>
                      <i className="feather-play"></i>
                    </span>
                  </Link>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="inner pl--50 pl_lg--0 pl_md--0 pl_sm--0">
                  <div className="section-title text-start">
                    <h6 className="b2 mb--15">
                      <span className="theme-gradient">Why Choose Us</span>
                    </h6>
                    <h2 className="title w-600">
                      Courses Focused on <br /> Building Strong Foundational
                      Skills for
                      <span className="theme-gradient ms-2">Career Growth</span>
                    </h2>
                    <div className="rbt-feature-wrapper mt--40">
                      <div className="rbt-feature feature-style-1 align-items-center">
                        <div className="icon bg-pink-opacity">
                          <i className="feather-heart"></i>
                        </div>
                        <div className="feature-content">
                          <h6 className="feature-title">Flexible Classes</h6>
                        </div>
                      </div>

                      <div className="rbt-feature feature-style-1 align-items-center">
                        <div className="icon bg-primary-opacity">
                          <i className="feather-book"></i>
                        </div>
                        <div className="feature-content">
                          <h6 className="feature-title">Learn From Anywhere</h6>
                        </div>
                      </div>

                      <div className="rbt-feature feature-style-1 align-items-center">
                        <div className="icon bg-coral-opacity">
                          <i className="feather-monitor"></i>
                        </div>
                        <div className="feature-content">
                          <h6 className="feature-title">
                            Skill-Based Learning
                          </h6>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rbt-testimonial-area bg-color-white rbt-section-gapBottom">
          {TestimonialData &&
            TestimonialData.testimonialThree.map((data, index) => (
              <div className="container" key={index}>
                <div className="row">
                  <div className="col-lg-12 mb--60 mb_sm--50">
                    <div className="section-title text-center">
                      <h6 className="b2 mb--15">
                        <span className="theme-gradient">Testimonials</span>
                      </h6>
                      <h2 className="title">
                        Student's
                        <span className="theme-gradient ms-2">Feedback</span>
                      </h2>
                    </div>
                  </div>
                </div>

                {TestimonialData.testimonialTwo.map((parent, parentIndex) => (
                  <Swiper
                    className="testimonial-item-3-activation swiper rbt-arrow-between icon-bg-gray rbt-dot-bottom-center pb--50 gutter-swiper-30"
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

        <div className="rbt-rbt-blog-area rbt-section-gap bg-color-extra2 rbt-sec-cir-shadow-1">
          <div className="gradient-shape-top version-02"></div>
          <div className="gradient-shape-bottom version-02"></div>
          <div className="container">
            <div className="row mb--60 mb_sm--50 g-5 align-items-end">
              <div className="col-lg-8 col-md-8 col-12">
                <div className="section-title text-start">
                  <h6 className="b2 mb--15">
                    <span className="theme-gradient">News & Blog</span>
                  </h6>
                  <h2 className="title">
                    Have a Look on
                    <span className="theme-gradient ms-2">Our Update</span>
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

        <div className="rbt-newsletter-area newsletter-style-2 bg-color-primary rbt-section-gap">
          <NewsletterTwo />
        </div>
      </main>
    </>
  );
};

export default InstructorsCoaches;
