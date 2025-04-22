import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ParallaxProvider } from "react-scroll-parallax";

import InstagramData from "../../data/elements/instagram.json";
import EventData from "../../data/events.json";

import BlogGrid from "../Blogs/BlogGrid";
import Testimonial from "../Testimonials/Testimonial";
import CardSeven from "../Cards/Card-Seven";
import ArtDesignSchoolBanner from "./ArtDesignSchool-Banner";

import testimonialShape from "../../public/images/shape/testimonial-shape-01.png";
import shape1 from "../../public/images/shape/event-shape-01.png";
import shape2 from "../../public/images/shape/event-shape-02.png";
import shape3 from "../../public/images/shape/event-shape-03.png";
import shape4 from "../../public/images/shape/ac-shape-01.png";
import shape5 from "../../public/images/shape/ac-shape-02.png";
import shadow from "../../public/images/shape/ac-c-shadow.png";

const ArtDesignSchool = ({ blogdata }) => {
  return (
    <>
      <ParallaxProvider>
        <ArtDesignSchoolBanner />
      </ParallaxProvider>
      <div className="rbt-course-area course-section-01 rbt-section-gapBottom">
        <div className="shapes">
          <div className="shape-1">
            <Image src={shape4} width={226} height={165} alt="Shape" />
          </div>
          <div className="shape-2">
            <Image src={shape5} width={155} height={121} alt="Shape" />
          </div>
        </div>
        <div className="container">
          <div className="row mb--30">
            <div className="col-lg-12">
              <div className="section-title text-center rbt-index-upper">
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
                      <span className="filter-text">Art & Design</span>
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
                      <span className="filter-text">Painting</span>
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
                      <span className="filter-text">3D & 2D</span>
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
                      <span className="filter-text">Drawing</span>
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
                      <span className="filter-text">Sculpture</span>
                    </button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button
                      id="others-tab"
                      data-bs-toggle="tab"
                      data-bs-target="#others"
                      type="button"
                      role="tab"
                      aria-controls="others"
                      aria-selected="false"
                    >
                      <span className="filter-text">and Others</span>
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="row position-relative">
            <div className="circle-shadow">
              <Image
                src={shadow}
                width={900}
                height={940}
                unoptimized={true}
                alt="Shadow"
              />
            </div>
            <div className="col-lg-12">
              <div className="tab-content" id="rbt-myTabContent">
                <div
                  className="tab-pane fade active show"
                  id="development"
                  role="tabpanel"
                  aria-labelledby="development-tab"
                >
                  <div className="row g-5">
                    <CardSeven
                      col="col-lg-4 col-md-6 col-12"
                      mt="mt--30"
                      start={18}
                      end={24}
                      isDesc={true}
                      isUser={false}
                    />
                  </div>
                </div>
                <div
                  className="tab-pane fade"
                  id="ui-ux"
                  role="tabpanel"
                  aria-labelledby="ui_ux-tab"
                >
                  <div className="row g-5">
                    <CardSeven
                      col="col-lg-4 col-md-6 col-12"
                      mt="mt--30"
                      start={18}
                      end={21}
                      isDesc={true}
                      isUser={false}
                    />
                  </div>
                </div>
                <div
                  className="tab-pane fade"
                  id="marketing"
                  role="tabpanel"
                  aria-labelledby="marketing-tab"
                >
                  <div className="row g-5">
                    <CardSeven
                      col="col-lg-4 col-md-6 col-12"
                      mt="mt--30"
                      start={20}
                      end={24}
                      isDesc={true}
                      isUser={false}
                    />
                  </div>
                </div>
                <div
                  className="tab-pane fade"
                  id="business"
                  role="tabpanel"
                  aria-labelledby="business-tab"
                >
                  <div className="row g-5">
                    <CardSeven
                      col="col-lg-4 col-md-6 col-12"
                      mt="mt--30"
                      start={19}
                      end={24}
                      isDesc={true}
                      isUser={false}
                    />
                  </div>
                </div>
                <div
                  className="tab-pane fade"
                  id="language"
                  role="tabpanel"
                  aria-labelledby="language-tab"
                >
                  <div className="row g-5">
                    <CardSeven
                      col="col-lg-4 col-md-6 col-12"
                      mt="mt--30"
                      start={18}
                      end={24}
                      isDesc={true}
                      isUser={false}
                    />
                  </div>
                </div>
                <div
                  className="tab-pane fade"
                  id="others"
                  role="tabpanel"
                  aria-labelledby="others-tab"
                >
                  <div className="row g-5">
                    <CardSeven
                      col="col-lg-4 col-md-6 col-12"
                      mt="mt--30"
                      start={18}
                      end={24}
                      isDesc={true}
                      isUser={false}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="row mt--55 mt_sm--50">
            <div className="col-lg-12">
              <div className="load-more-btn text-center">
                <Link
                  className="rbt-btn btn-gradient btn-lg btn-mobile hover-icon-reverse"
                  href="/course-with-tab"
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

      <div className="rbt-event-area event-section-01 bg-color-extra2 rbt-section-gap">
        <div className="shapes">
          <div className="shape-1">
            <Image
              src={shape1}
              width={630}
              height={275}
              unoptimized={true}
              alt="Shape"
            />
          </div>
          <div className="shape-2">
            <Image
              src={shape2}
              width={290}
              height={404}
              unoptimized={true}
              alt="Shape"
            />
          </div>
          <div className="shape-3">
            <Image
              src={shape3}
              width={113}
              height={121}
              unoptimized={true}
              alt="Shape"
            />
          </div>
        </div>
        <div className="container">
          <div className="row gx-5 gy-3 rbt-index-upper">
            <div className="col-12 col-xl-6">
              <div className="section-title mb--60 mb_sm--50">
                <h6 className="b2 mb--15">
                  <span className="theme-gradient">Our Events</span>
                </h6>
                <h2 className="title w-600">
                  Upcoming Event <br /> For{" "}
                  <span className="theme-gradient">Everyone</span>
                </h2>
              </div>

              {EventData.events.slice(3, 4).map((data, index) => (
                <div
                  className="rbt-card rbt-card-latest rbt-hover mb-xl-0 mb-4"
                  key={index}
                >
                  <div className="rbt-card-img">
                    <Link href={`/event-details/${data.id}`}>
                      <Image
                        src={data.img}
                        width={638}
                        height={300}
                        alt="Card image"
                      />
                      <div className="rbt-badge-3 bg-white">
                        <span>{data.badgeDate}</span>
                        <span>{data.badgeYear}</span>
                      </div>
                    </Link>
                  </div>
                  <div className="rbt-card-body">
                    <div>
                      <ul className="rbt-meta">
                        <li>
                          <i className="feather-map-pin"></i>
                          {data.location}
                        </li>
                        <li>
                          <i className="feather-clock"></i> {data.time}
                        </li>
                      </ul>
                      <h4 className="rbt-card-title mb_mobile--10 mb--0">
                        <Link href={`/event-details/${data.id}`}>
                          Elegant Light Box Paper <br /> Cut Dioramas
                        </Link>
                      </h4>
                    </div>

                    <div className="read-more-btn">
                      <a
                        className="rbt-btn btn-border hover-icon-reverse btn-sm radius-round"
                        href={`/event-details/${data.id}`}
                      >
                        <span className="icon-reverse-wrapper">
                          <span className="btn-text">Get Ticket</span>
                          <span className="btn-icon">
                            <i className="feather-arrow-right"></i>
                          </span>
                          <span className="btn-icon">
                            <i className="feather-arrow-right"></i>
                          </span>
                        </span>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="col-12 col-xl-6">
              <div className="row g-3">
                {EventData.events.slice(4, 7).map((data, index) => (
                  <div className="col-12 col-xl-12 col-sm-6" key={index}>
                    <div className="rbt-card card-list-2 event-list-card variation-01 rbt-hover">
                      <div className="rbt-card-img">
                        <Link href={`/event-details/${data.id}`}>
                          <Image
                            src={data.img}
                            width={231}
                            height={156}
                            alt="Card image"
                          />
                        </Link>
                      </div>
                      <div className="rbt-card-body">
                        <ul className="rbt-meta">
                          <li>
                            <i className="feather-map-pin"></i>
                            {data.location}
                          </li>
                          <li>
                            <i className="feather-clock"></i> {data.time}
                          </li>
                        </ul>
                        <h4 className="rbt-card-title">
                          <Link href={`/event-details/${data.id}`}>
                            {data.title}
                          </Link>
                        </h4>
                        <div className="read-more-btn">
                          <Link
                            className="rbt-btn btn-border hover-icon-reverse btn-sm radius-round"
                            href={`/event-details/${data.id}`}
                          >
                            <span className="icon-reverse-wrapper">
                              <span className="btn-text">Get Ticket</span>
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
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rbt-testimonial-area testimonial-section-02 bg-color-white rbt-section-gap overflow-hidden">
        <div className="shape-1">
          <Image src={testimonialShape} width={141} height={140} alt="Shape" />
        </div>
        <Testimonial />
      </div>

      <div className="rbt-blog-area rbt-sec-cir-shadow-1 rbt-section-gap bg-color-extra2">
        <div className="gradient-shape-top version-02"></div>
        <div className="gradient-shape-bottom version-02"></div>
        <div className="container">
          <div className="row mb--60 mb_sm--50 g-5 align-items-end">
            <div className="col-lg-8 col-md-8 col-12">
              <div className="section-title text-start">
                <span className="subtitle bg-primary-opacity">News & Blog</span>
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

      <div className="rbt-instagram-area bg-color-white rbt-section-gapTop">
        <div className="container">
          <div className="row">
            <div className="col-lg-12 mb--60 mb_sm--50">
              <div className="section-title text-center">
                <h6 className="b2 mb--15">
                  <span className="theme-gradient">Instagram</span>
                </h6>
                <h2 className="title w-600">
                  Follow Histudy On{" "}
                  <span className="theme-gradient">Instagram</span>
                </h2>
              </div>
            </div>
          </div>
        </div>

        <div className="container-fluid">
          <div className="row g-3">
            {InstagramData.instagramTwo.map((data, i) => (
              <div className="col-lg-2 col-md-4 col-sm-6 col-6" key={i}>
                <div className="instagram-grid">
                  <Link href={data.link}>
                    <Image
                      src={data.image}
                      width={229}
                      height={257}
                      unoptimized={true}
                      alt={data.alt}
                    />
                    <span className="user-info">
                      <span className="icon">
                        <i className="icon-instagram"></i>
                      </span>
                      <span className="user-name">{data.text}</span>
                    </span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default ArtDesignSchool;
