import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ParallaxProvider } from "react-scroll-parallax";

import OnlineAcademyBanner from "./OnlineAcademy-Banner";
import CategoryOne from "../Category/CategoryOne";
import AboutTwo from "../Abouts/About-Two";
import Counter from "../Counters/Counter";
import EventCarouse from "../Events/EventCarouse";
import TestimonialFour from "../Testimonials/Testimonial-Four";
import BlogGrid from "../Blogs/BlogGrid";

import CourseDetails from "../../data/course-details/courseData.json";

import brand1 from "../../public/images/brand/partner-5.webp";
import brand2 from "../../public/images/brand/partner-1.webp";
import brand3 from "../../public/images/brand/partner-6.webp";
import brand4 from "../../public/images/brand/partner-3.webp";

const OnlineAcademy = ({ blogdata }) => {
  let getAllCourse = JSON.parse(JSON.stringify(CourseDetails.courseDetails));

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
  return (
    <>
      <main className="rbt-main-wrapper">
        <OnlineAcademyBanner />

        <div className="rbt-category-area category-section-02 bg-color-white rbt-section-gap">
          <div className="gradient-shape"></div>
          <div className="container">
            <div className="row">
              <div className="col-lg-12">
                <div className="section-title text-center">
                  <span className="subtitle bg-primary-opacity">
                    CATEGORIES
                  </span>
                  <h2 className="title w-600">
                    Explore Top Courses Caterories <br /> That
                    <span className="theme-gradient mx-2">Change Yourself</span>
                  </h2>
                </div>
              </div>
            </div>
            <div className="row g-5 mt--20 rbt-index-upper-2">
              <CategoryOne />
            </div>
          </div>
        </div>

        <div className="rbt-course-area rbt-sec-cir-shadow-1 bg-color-extra2 rbt-section-gap">
          <div className="gradient-shape-top"></div>
          <div className="gradient-shape-bottom"></div>
          <div className="container">
            <div className="row mb--30">
              <div className="col-lg-12">
                <div className="section-title text-center">
                  <span className="subtitle bg-primary-opacity">
                    Top Popular Course
                  </span>
                  <h2 className="title w-600">
                    Histudy Course Student <br /> Can{" "}
                    <span className="theme-gradient">Join With Us</span>
                  </h2>
                </div>
              </div>
            </div>
            <div className="row mb--40 mb_sm--30">
              <div className="col-lg-12">
                <div className="rbt-course-tab-button-wrap">
                  <ul
                    className="rbt-course-tab-button nav nav-tabs"
                    id="rbt-myTab"
                    role="tablist"
                  >
                    {[
                      "All Course",
                      "featured",
                      "popular",
                      "trending",
                      "latest",
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
            <div className="row mt--55">
              <div className="col-lg-12">
                <div className="load-more-btn text-center">
                  <Link
                    className="rbt-btn btn-gradient btn-lg hover-icon-reverse"
                    href="/course-withtab-two"
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

        <div className="rbt-about-area bg-color-white rbt-section-gap about-style-1">
          <div className="container">
            <ParallaxProvider>
              <AboutTwo />
            </ParallaxProvider>
          </div>

          <Counter isDesc={false} head="" />
        </div>

        <div className="rbt-event-area event-style-2 rbt-section-gap bg-gradient-7">
          <div className="container">
            <div className="row mb--55">
              <div className="section-title text-center">
                <span className="subtitle bg-white-opacity">
                  STIMULATED TO TAKE PART IN?
                </span>
                <h2 className="title color-white">Upcoming Events</h2>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-12">
                <EventCarouse />
              </div>
            </div>
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

        <div className="rbt-blog-area rbt-sec-cir-shadow-1 rbt-section-gap bg-color-extra2">
          <div className="gradient-shape-top version-02"></div>
          <div className="gradient-shape-bottom version-02"></div>
          <div className="container">
            <div className="row mb--60 g-5 align-items-end">
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

export default OnlineAcademy;
