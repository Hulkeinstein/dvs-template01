import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

import "venobox/dist/venobox.min.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import useCategoryCount from "@/context/useCategoryCount";

import EventData from "../../data/events.json";
import CourseDetails from "../../data/course-details/courseData.json";
import TestimonialData from "../../data/elements/testimonial.json";

import BlogGrid from "../Blogs/BlogGrid";
import CounterSix from "../Counters/Counter-Six";
import InstituteGallery from "./InstituteGallery";
import HealthGoal from "./HealthGoal";
import HealthFeature from "./HealthFeature";
import HealthBanner from "./Health-Banner";

import brand1 from "../../public/images/brand/partner-5.webp";
import brand2 from "../../public/images/brand/partner-1.webp";
import brand3 from "../../public/images/brand/partner-6.webp";
import brand4 from "../../public/images/brand/partner-3.webp";
import lineArrow from "../../public/images/shape/o-line-arrow.png";
import videoDot from "../../public/images/shape/video-dot-02.png";
import videoBanner from "../../public/images/others/video-11.png";
import shapeIcon from "../../public/images/shape/o-icon-2.png";

const HealthInstitute = ({ blogdata }) => {
  let getAllCourse = JSON.parse(JSON.stringify(CourseDetails.courseDetails));
  const { categoryCounts } = useCategoryCount(CourseDetails.courseDetails);

  useEffect(() => {
    import("venobox/dist/venobox.min.js").then((venobox) => {
      new venobox.default({
        selector: ".popup-video",
      });
    });
  }, []);
  return (
    <main className="rbt-main-wrapper">
      <HealthBanner />

      <div className="rbt-feature-area feature-section-02">
        <div className="container">
          <HealthFeature />
        </div>
      </div>

      <HealthGoal />

      <div className="rbt-categories-area rbt-section-gap">
        <div className="container">
          <div className="row g-5 align-items-center mb--50">
            <div className="col-lg-8 col-md-7 col-12">
              <div className="section-title">
                <h2 className="title">
                  Best Platform To{" "}
                  <span>
                    <Image
                      src={shapeIcon}
                      width={41}
                      height={31}
                      alt="Cap Icon"
                    />
                  </span>{" "}
                  Learn Everything
                </h2>
              </div>
            </div>
            <div className="col-lg-4 col-md-5 col-12">
              <div className="d-flex justify-content-end gap-3 rbt-arrow-between">
                <div className="rbt-swiper-arrow style_2 rbt-arrow-left opacity-100">
                  <div className="custom-overfolow">
                    <i className="rbt-icon feather-arrow-left"></i>
                    <i className="rbt-icon-top feather-arrow-left"></i>
                  </div>
                </div>

                <div className="rbt-swiper-arrow style_2 rbt-arrow-right opacity-100">
                  <div className="custom-overfolow">
                    <i className="rbt-icon feather-arrow-right"></i>
                    <i className="rbt-icon-top feather-arrow-right"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="category-activation-four swiper">
            <Swiper
              className="swiper-wrapper py-3"
              modules={[Navigation]}
              loop={false}
              slidesPerView={1}
              spaceBetween={30}
              navigation={{
                nextEl: ".rbt-arrow-right",
                prevEl: ".rbt-arrow-left",
                clickable: true,
              }}
              scrollbar={{
                el: ".swiper-scrollbar",
                draggable: true,
                hide: true,
                snapOnRelease: true,
              }}
              breakpoints={{
                480: {
                  slidesPerView: 1,
                },
                481: {
                  slidesPerView: 2,
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
                CourseDetails.courseDetails.map((item, innerIndex) => {
                  const count = categoryCounts[item.category] || 0;
                  return (
                    <SwiperSlide className="swiper-slide" key={innerIndex}>
                      <div className="rbt-cat-box rbt-cat-box-1 variation-3 text-center">
                        <div className="inner">
                          <div className="thumbnail">
                            <Link
                              href={`/course-filter-one-toggle/${item.category}`}
                            >
                              <Image
                                src={item.cateBigImg}
                                width={304}
                                height={166}
                                unoptimized={true}
                                alt="Category Images"
                              />
                              <div className="read-more-btn">
                                <span className="rbt-btn btn-sm btn-white radius-round">
                                  {count} Course{count !== 1 ? "s" : ""}
                                </span>
                              </div>
                            </Link>
                          </div>
                          <div className="content">
                            <h5 className="title">
                              <Link
                                href={`/course-filter-one-toggle/${item.category}`}
                              >
                                {item.category}
                              </Link>
                            </h5>
                            <p className="description">{item.cateDesc}</p>
                          </div>
                        </div>
                      </div>
                    </SwiperSlide>
                  );
                })}
            </Swiper>
          </div>
        </div>
      </div>

      <div className="rbt-course-area rbt-sec-cir-shadow-1 bg-color-extra2 rbt-section-gap">
        <div className="gradient-shape-top"></div>
        <div className="gradient-shape-bottom"></div>
        <div className="container">
          <div className="row mb--50">
            <div className="col-lg-12">
              <div className="section-title text-center">
                <h6 className="b2 mb--15">
                  <span className="theme-gradient">Admission</span>
                </h6>
                <h2 className="title w-600">
                  Courses Offered At Histudy <br />{" "}
                  <span className="theme-gradient">Medical Institute</span>
                </h2>
              </div>
            </div>
          </div>

          <div className="row g-5">
            {getAllCourse.slice(24, 27).map((data, index) => (
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

          <div className="row mt--55">
            <div className="col-lg-12">
              <div className="load-more-btn text-center">
                <Link
                  className="rbt-btn btn-gradient btn-lg hover-icon-reverse"
                  href="/course-withtab-two"
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

      <div className="rbt-video-area bg-color-white rbt-section-gap overflow-hidden">
        <div className="container">
          <div className="row row--35 align-items-center mt_dec--50">
            <div className="col-xl-6 col-12 mt--50">
              <div className="video-popup-wrapper version-02">
                <div className="v-shape-1 style-02">
                  <Image src={videoDot} width={103} height={181} alt="Shape" />
                </div>
                <Image
                  className="w-100 rbt-radius position-relative"
                  src={videoBanner}
                  width={618}
                  height={566}
                  alt="Video Images"
                />
                <Link
                  className="rbt-btn btn-white rounded-player-2 popup-video position-to-top bounced-btn"
                  data-vbtype="video"
                  controls
                  href="https://www.youtube.com/watch?v=nA1Aqp0sPQo"
                >
                  <span className="play-icon"></span>
                </Link>
              </div>
            </div>
            <div className="col-xl-5 col-12 mt--50">
              <div className="inner">
                <div className="section-title text-start">
                  <h6 className="b2 mb--15">
                    <span className="theme-gradient">Histudy</span>
                  </h6>
                  <h2 className="title w-600">Campus Life</h2>
                </div>

                <div className="rbt-feature-wrapper mt--30 ml_dec_20">
                  <div className="rbt-feature feature-style-2 rbt-radius">
                    <div className="icon bg-pink-opacity">
                      <i className="feather-heart"></i>
                    </div>
                    <div className="feature-content">
                      <h6 className="feature-title">Flexible Classes</h6>
                      <p className="feature-description">
                        It is a long established fact that a reader will be
                        distracted by this on readable content of when looking
                        at its layout.
                      </p>
                    </div>
                  </div>

                  <div className="rbt-feature feature-style-2 rbt-radius">
                    <div className="icon bg-primary-opacity">
                      <i className="feather-book"></i>
                    </div>
                    <div className="feature-content">
                      <h6 className="feature-title">Learn From Anywhere</h6>
                      <p className="feature-description">
                        Sed distinctio repudiandae eos recusandae laborum eaque
                        non eius iure suscipit laborum eaque non eius iure
                        suscipit.
                      </p>
                    </div>
                  </div>

                  <div className="rbt-feature feature-style-2 rbt-radius">
                    <div className="icon bg-secondary-opacity">
                      <i className="feather-award"></i>
                    </div>
                    <div className="feature-content">
                      <h6 className="feature-title">Skill-Based Learning</h6>
                      <p className="feature-description">
                        It is a long established fact that a reader will be
                        distracted by this on readable content of when looking
                        at its layout.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rbt-counterup-area counterup-section-02 rbt-section-gapBottom">
        <div className="shape-1">
          <Image src={lineArrow} width={86} height={50} alt="Shape" />
        </div>
        <CounterSix />
      </div>

      <div className="rbt-event-area bg-gradient-7 rbt-section-gap rbt-section-box">
        <div className="container">
          <div className="row mb--60 mb_sm--50 g-5 align-items-end">
            <div className="col-lg-8 col-md-8 col-12">
              <div className="section-title text-start">
                <h6 className="color-white w-500 b2 mb--15">Compass Summit</h6>
                <h2 className="title w-600 color-white">
                  Join Upcoming Events
                </h2>
              </div>
            </div>
            <div className="col-lg-4 col-md-4 col-12">
              <div className="load-more-btn text-start text-md-end">
                <Link
                  className="rbt-btn btn-border hover-icon-reverse"
                  href="/event-grid"
                >
                  <span className="icon-reverse-wrapper">
                    <span className="btn-text color-white">
                      View All Events
                    </span>
                    <span className="btn-icon color-white">
                      <i className="feather-arrow-right"></i>
                    </span>
                    <span className="btn-icon color-white">
                      <i className="feather-arrow-right"></i>
                    </span>
                  </span>
                </Link>
              </div>
            </div>
          </div>
          <div className="row g-5">
            <div className="col-12 col-lg-4">
              {EventData.events.slice(3, 4).map((data, index) => (
                <div
                  className="rbt-card event-grid-card variation-01 rbt-hover p-4"
                  key={index}
                >
                  <div className="rbt-card-img">
                    <Link href={`/event-details/${data.id}`}>
                      <Image
                        src={data.img}
                        width={385}
                        height={242}
                        alt="Card image"
                      />
                    </Link>
                  </div>
                  <div className="rbt-card-body">
                    <h4 className="rbt-card-title mb--5">
                      <Link href={`/event-details/${data.id}`}>
                        {data.title}
                      </Link>
                    </h4>
                    <p className="b3 mb--20">
                      The Campaign for the Histudy University is the largest
                      fundraising campaign in history with a historic $1.5
                      billion goal.
                    </p>
                    <div className="read-more-btn">
                      <Link
                        className="rbt-btn btn-gradient hover-icon-reverse"
                        href={`/event-details/${data.id}`}
                      >
                        <span className="icon-reverse-wrapper">
                          <span className="btn-text">Become A Donor</span>
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
              ))}
            </div>
            <div className="col-12 col-lg-8">
              <div className="row mt_dec--20">
                {EventData.events.slice(5, 7).map((data, index) => (
                  <div className="col-12 col-sm-6 col-lg-12 mt--20" key={index}>
                    <div className="rbt-card card-list-2 event-list-card variation-01 rbt-hover p-4">
                      <div className="rbt-card-img">
                        <Link href={`/event-details/${data.id}`}>
                          <Image
                            src={data.img}
                            width={332}
                            height={210}
                            alt="Card image"
                          />
                        </Link>
                      </div>
                      <div className="rbt-card-body">
                        <ul className="rbt-meta">
                          <li>
                            <i className="feather-calendar"></i>
                            {data.time}
                          </li>
                          <li>
                            <i className="feather-map-pin"></i>
                            {data.location}
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

      <div className="rbt-testimonial-area bg-color-white rbt-section-gap">
        {TestimonialData &&
          TestimonialData.testimonialThree.map((data, index) => (
            <div className="container" key={index}>
              <div className="row">
                <div className="col-lg-12 mb--60 mb_sm--50">
                  <div className="section-title text-center">
                    <h6>
                      <span className={`theme-gradient`}>{data.tag}</span>
                    </h6>
                    <h2 className="title">{data.title}</h2>
                  </div>
                </div>
              </div>
              <div className="row g-5">
                <div className="col-lg-6">
                  <div className="rbt-accordion-style rbt-accordion-01  accordion">
                    <div className="accordion" id="accordionExamplea1">
                      {data.accordion.map((item, innerIndex) => (
                        <div className="accordion-item card" key={innerIndex}>
                          <h2
                            className="accordion-header card-header"
                            id={item.heading}
                          >
                            <button
                              className={`accordion-button ${
                                !item.collapsed ? "collapsed" : ""
                              }`}
                              type="button"
                              data-bs-toggle="collapse"
                              data-bs-target={`#${item.collapse}`}
                              aria-expanded={item.expanded}
                              aria-controls={item.collapse}
                            >
                              {item.btnText}
                            </button>
                          </h2>
                          <div
                            id={item.collapse}
                            className={`accordion-collapse collapse ${
                              item.show ? "show" : ""
                            }`}
                            aria-labelledby={item.heading}
                            data-bs-parent="#accordionExamplea1"
                          >
                            <div className="accordion-body card-body">
                              {item.desc}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="col-lg-6">
                  <Swiper
                    slidesPerView={1}
                    modules={[Pagination]}
                    pagination={{
                      el: ".rbt-swiper-pagination",
                      clickable: true,
                    }}
                    className="swiper testimonial-activation-1 rbt-dot-bottom-left pb--60"
                  >
                    {data.body.map((item, innerIndex) => (
                      <SwiperSlide className="swiper-wrapper" key={innerIndex}>
                        <div className="swiper-slide">
                          <div
                            className={`rbt-testimonial-box no-box-shadow bg-gradient-7 text-white`}
                          >
                            <div className="inner">
                              <div className="clint-info-wrapper">
                                <div className="thumb">
                                  <Image
                                    src={item.img}
                                    width={494}
                                    height={494}
                                    alt="Clint Images"
                                  />
                                </div>
                                <div className="client-info">
                                  <h5 className="title">{item.title}</h5>
                                  <span className={`$designation}`}>
                                    {item.position} <i>{item.company}</i>
                                  </span>
                                </div>
                              </div>
                              <div className="description">
                                <p className="subtitle-3">{item.desc}</p>

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
                      </SwiperSlide>
                    ))}

                    <div className="rbt-swiper-pagination"></div>
                  </Swiper>
                </div>
              </div>
            </div>
          ))}
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
                <Link href="#">
                  <Image
                    src={brand1}
                    width={120}
                    height={135}
                    alt="Brand Image"
                  />
                </Link>
              </li>
              <li>
                <Link href="#">
                  <Image
                    src={brand2}
                    width={120}
                    height={135}
                    alt="Brand Image"
                  />
                </Link>
              </li>
              <li>
                <Link href="#">
                  <Image
                    src={brand1}
                    width={120}
                    height={135}
                    alt="Brand Image"
                  />
                </Link>
              </li>
              <li>
                <Link href="#">
                  <Image
                    src={brand3}
                    width={120}
                    height={135}
                    alt="Brand Image"
                  />
                </Link>
              </li>
              <li>
                <Link href="#">
                  <Image
                    src={brand4}
                    width={120}
                    height={135}
                    alt="Brand Image"
                  />
                </Link>
              </li>{" "}
              <li>
                <Link href="#">
                  <Image
                    src={brand2}
                    width={120}
                    height={135}
                    alt="Brand Image"
                  />
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="rbt-blog-area rbt-sec-cir-shadow-1 rbt-section-gap bg-color-extra2 rbt-section-box">
        <div className="gradient-shape-top version-02"></div>
        <div className="gradient-shape-bottom version-02"></div>
        <div className="container">
          <div className="row mb--30 mb_sm--50 g-5 align-items-end">
            <div className="col-lg-8 col-md-8 col-12">
              <div className="section-title text-start">
                <h6>
                  <span className="theme-gradient">News &amp; Blog</span>
                </h6>
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

      <div className="rbt-gallery-area rbt-section-gap">
        <div className="container">
          <div className="row mb--60">
            <div className="col-12">
              <div className="section-title text-center">
                <h6>
                  <span className="theme-gradient">University</span>
                </h6>
                <h2 className="title w-600">Our Gallery</h2>
              </div>
            </div>
          </div>
          <InstituteGallery />
        </div>
      </div>
    </main>
  );
};

export default HealthInstitute;
