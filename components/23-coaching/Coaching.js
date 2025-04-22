"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import dynamic from "next/dynamic";
const Odometer = dynamic(() => import("react-odometerjs"), {
  ssr: false,
  loading: () => 0,
});
import "venobox/dist/venobox.min.css";
import { useParallax } from "react-scroll-parallax";

import TestimonialData from "../../data/elements/testimonial.json";
import CourseDetails from "../../data/course-details/courseData.json";

import CoachingBanner from "./Coaching-Banner";
import BlogGrid from "../Blogs/BlogGrid";
import Service from "../Services/Service";
import CoachingForm from "./CoachingForm";
import CounterWrap from "../Counters/CounterWrap";

import brand1 from "../../public/images/brand/partner-5.webp";
import brand2 from "../../public/images/brand/partner-1.webp";
import brand3 from "../../public/images/brand/partner-6.webp";
import brand4 from "../../public/images/brand/partner-3.webp";
import videoImage from "../../public/images/others/video-12.png";
import bookShape from "../../public/images/shape/book-shape-01.png";
import awardImage from "../../public/images/icons/award-gd-01.png";
import cap from "../../public/images/shape/o-icon-2.png";
import coach from "../../public/images/others/coach.png";
import signature from "../../public/images/others/signature-01.png";
import dots from "../../public/images/shape/a-dot-01.png";

const profiles = [
  { name: "Ava Miller", src: "/images/shape/art-stu-2.png" },
  { name: "Mark Jordan", src: "/images/shape/art-stu-1.png" },
  { name: "Jordan", src: "/images/shape/art-stu-3.png" },
  { name: "Ava Miller", src: "/images/shape/i-team.png" },
];

const Coaching = ({ blogdata }) => {
  let getAllCourse = JSON.parse(JSON.stringify(CourseDetails.courseTab));

  const sinceParallax = useParallax({ translateX: [-20, 0] });
  const enrolledParallax = useParallax({ translateX: [30, 0] });

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
        <CoachingBanner />

        <CoachingForm />

        <div className="rbt-about-area rbt-section-gap overflow-hidden">
          <div className="about-style-4 version-04">
            <div className="shape-2">
              <Image
                src={bookShape}
                width={1393}
                height={956}
                unoptimized={true}
                alt="Shape"
              />
            </div>
            <div className="container">
              <div className="row row--60 mt_dec--40 align-items-center">
                <div className="col-xl-5 col-12 mt--40">
                  <div className="about-thumb">
                    <div className="shape-1">
                      <Image
                        src={dots}
                        width={87}
                        height={140}
                        unoptimized={true}
                        alt="Shape"
                      />
                    </div>

                    <div className="since" ref={sinceParallax.ref}>
                      <span>
                        <Image
                          src={awardImage}
                          width={36}
                          height={51}
                          alt="Award Icon"
                        />
                      </span>
                      <div className="title-wrap">
                        <h4 className="number">
                          <span className="odometer rbt-font-primary">
                            <Odometer value={1890} />
                          </span>
                        </h4>
                        <h6 className="subtitle">Since</h6>
                      </div>
                    </div>
                    <div className="enrolled" ref={enrolledParallax.ref}>
                      <div className="enrolled-cont">
                        <span>
                          <Image src={cap} width={41} height={31} alt="image" />
                        </span>
                        <div>
                          <h6 className="enrolled-title d-flex align-items-center">
                            <span className="odometer rbt-font-primary">
                              <Odometer value={36} />
                            </span>
                            k+
                          </h6>
                          <p className="enrolled-description">
                            Success Students
                          </p>
                        </div>
                      </div>
                      <div className="profile-share">
                        {profiles.map((profile, index) => (
                          <Link
                            key={index}
                            href="#"
                            className="avatar"
                            data-tooltip={profile.name}
                            tabIndex="0"
                          >
                            <Image
                              src={profile.src}
                              alt="education"
                              width={35}
                              height={35}
                              unoptimized={true}
                            />
                          </Link>
                        ))}
                      </div>
                    </div>
                    <div className="thumb-1">
                      <Image src={coach} width={474} height={662} alt="Thumb" />
                    </div>
                  </div>
                </div>
                <div className="col-xl-6 col-12 mt--40">
                  <div className="content">
                    <div className="section-title">
                      <span className="subtitle bg-primary-opacity">
                        About me
                      </span>
                      <h2 className="title w-600">
                        I Help People to Discover Their True Potential.
                      </h2>
                    </div>
                    <p className="mt--20">
                      At Histudy University, we are moving boldly - and
                      concertedly - to expand tomorrow's frontiers. We believe
                      that we have the power to shape the future, for the better
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
                      <a
                        className="rbt-btn btn-gradient hover-icon-reverse"
                        href="#"
                      >
                        <span className="icon-reverse-wrapper">
                          <span className="btn-text">Chat With Us</span>
                          <span className="btn-icon">
                            <i className="feather-arrow-right"></i>
                          </span>
                          <span className="btn-icon">
                            <i className="feather-arrow-right"></i>
                          </span>
                        </span>
                      </a>
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

        <div className="rbt-service-area service-section-01 rbt-section-gap rbt-section-box">
          <div className="container">
            <div className="row mb--60 mb_sm--50">
              <div className="col-lg-12">
                <div className="section-title text-center">
                  <span className="subtitle bg-primary-opacity">Services</span>
                  <h2 className="title w-600">What i Do For My Client</h2>
                </div>
              </div>
            </div>
            <Service head={false} />
          </div>
        </div>

        <div className="rbt-video-area bg-color-white rbt-section-gap overflow-hidden">
          <div className="container">
            <div className="row mb--60 mb_sm--50">
              <div className="col-lg-12">
                <div className="section-title text-center">
                  <span className="subtitle bg-primary-opacity">
                    Work process
                  </span>
                  <h2 className="title w-600">Simple Steps To Success</h2>
                </div>
              </div>
            </div>
            <div className="row row--35 align-items-center mt_dec--50">
              <div className="col-xl-5 col-12 mt--50">
                <div className="inner">
                  <div className="rbt-feature-wrapper">
                    <div className="rbt-feature feature-style-2 rbt-radius">
                      <div className="number">
                        <span>01</span>
                      </div>
                      <div className="feature-content">
                        <h6 className="feature-title">Make a Decision</h6>
                        <p className="feature-description">
                          It is a long established fact that a reader will be
                          distracted by this on readable content.
                        </p>
                      </div>
                    </div>

                    <div className="rbt-feature feature-style-2 rbt-radius">
                      <div className="number">
                        <span>02</span>
                      </div>
                      <div className="feature-content">
                        <h6 className="feature-title">Schedule a Meeting</h6>
                        <p className="feature-description">
                          It is a long established fact that a reader will be
                          distracted by this on readable content.
                        </p>
                      </div>
                    </div>

                    <div className="rbt-feature feature-style-2 rbt-radius">
                      <div className="number">
                        <span>03</span>
                      </div>
                      <div className="feature-content">
                        <h6 className="feature-title">Show Commitment</h6>
                        <p className="feature-description">
                          It is a long established fact that a reader will be
                          distracted by this on readable content.
                        </p>
                      </div>
                    </div>

                    <div className="rbt-feature feature-style-2 rbt-radius">
                      <div className="number">
                        <span>04</span>
                      </div>
                      <div className="feature-content">
                        <h6 className="feature-title">
                          Transformation Completed
                        </h6>
                        <p className="feature-description">
                          It is a long established fact that a reader will be
                          distracted by this on readable content.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-xl-7 col-12 mt--50">
                <div className="video-popup-wrapper version-02">
                  <Image
                    className="w-100 rbt-radius position-relative"
                    src={videoImage}
                    width={732}
                    height={571}
                    unoptimized={true}
                    alt="Video Images"
                  />
                  <a
                    className="rbt-btn btn-white rounded-player-2 popup-video position-to-top bounced-btn"
                    data-vbtype="video"
                    controls
                    href="https://www.youtube.com/watch?v=nA1Aqp0sPQo"
                  >
                    <span className="play-icon"></span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rbt-ready-area ready-section-01 rbt-section-gap rbt-section-box bg_image--29 bg_image">
          <div className="container">
            <div className="row">
              <div className="col-lg-12">
                <div className="section-title text-center">
                  <span className="subtitle bg-primary-opacity">
                    Ready to start?
                  </span>
                  <h2 className="title w-600">Self Development Course</h2>
                  <p className="mt--10 description">
                    We believe that we have the power to shape the <br />{" "}
                    future, for the better lifelong
                  </p>
                  <Link
                    className="rbt-btn btn-gradient hover-icon-reverse"
                    href="#"
                  >
                    <span className="icon-reverse-wrapper">
                      <span className="btn-text">Let’s Talk</span>
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

        <div className="rbt-course-area rbt-section-gap">
          <div className="container">
            <div className="row mb--60 mb_sm--50 g-5 align-items-end">
              <div className="col-lg-8 col-md-8 col-12">
                <div className="section-title text-start">
                  <span className="subtitle bg-primary-opacity">
                    Enroll & Become Better
                  </span>
                  <h2 className="title w-600">Explore Latest Course</h2>
                </div>
              </div>
              <div className="col-lg-4 col-md-4 col-12">
                <div className="load-more-btn text-start text-md-end">
                  <Link
                    className="rbt-btn btn-gradient hover-icon-reverse"
                    href="/course-masonry"
                  >
                    <span className="icon-reverse-wrapper">
                      <span className="btn-text">View All Course</span>
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

            <div className="row g-5">
              {getAllCourse.slice(0, 2).map((data, index) => (
                <div className="col-md-6" key={index}>
                  <div className="rbt-card variation-01 rbt-hover card-list-2">
                    <div className="rbt-card-img">
                      <Link href={`/course-details/${data.id}`}>
                        <Image
                          src={data.courseImg}
                          width={231}
                          height={324}
                          alt="Card image"
                        />
                      </Link>
                    </div>
                    <div className="rbt-card-body">
                      <div className="rbt-card-top">
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
                        <div className="rbt-bookmark-btn">
                          <Link
                            className="rbt-round-btn"
                            title="Bookmark"
                            href="#"
                          >
                            <i className="feather-bookmark"></i>
                          </Link>
                        </div>
                      </div>

                      <h4 className="rbt-card-title">
                        <Link href={`/course-details/${data.id}`}>
                          {data.courseTitle}
                        </Link>
                      </h4>

                      <ul className="rbt-meta">
                        <li>
                          <i className="feather-book"></i> {data.lesson}
                          Lessons
                        </li>
                        <li>
                          <i className="feather-users"></i> {data.student}
                          Students
                        </li>
                      </ul>

                      <p className="rbt-card-text">
                        {data.desc.substring(0, 50)}...
                      </p>
                      <div className="rbt-author-meta mb--10">
                        <div className="rbt-avater">
                          <Link href="#">
                            <Image
                              src={data.userImg}
                              width={33}
                              height={33}
                              alt="Sophia Jaymes"
                            />
                          </Link>
                        </div>
                        <div className="rbt-author-info">
                          By
                          <Link className="px-1" href={`/profile/${data.id}`}>
                            {data.userName}
                          </Link>
                          In <Link href="#">{data.userCategory}</Link>
                        </div>
                      </div>
                      <div className="rbt-card-bottom">
                        <div className="rbt-price">
                          <span className="current-price">${data.price}</span>
                          <span className="off-price">${data.offPrice}</span>
                        </div>
                        <Link
                          className="rbt-btn-link"
                          href={`/course-details/${data.id}`}
                        >
                          Learn More
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

        <div className="rbt-testimonial-area rbt-section-gap rbt-section-box bg-color-extra2 rbt-sec-cir-shadow-1">
          <div className="gradient-shape-top version-02"></div>
          <div className="gradient-shape-bottom version-02"></div>
          <div className="container">
            {TestimonialData &&
              TestimonialData.testimonialFour.map((data, index) => (
                <div className="content" key={index}>
                  <div className="row">
                    <div className="col-lg-12 mb--60 mb_sm--50">
                      <div className="section-title text-center">
                        <span className="subtitle bg-primary-opacity">
                          {data.tag}
                        </span>
                        <h2 className="title w-600">
                          Student's{" "}
                          <span className="theme-gradient">Feedback</span>
                        </h2>
                      </div>
                    </div>
                  </div>
                  <div className="row g-5">
                    {data.body.map((item, innerIndex) => (
                      <div
                        className="col-lg-4 col-md-6 col-12"
                        key={innerIndex}
                      >
                        <div className="rbt-testimonial-box">
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
                                <span>
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
                    ))}
                  </div>
                </div>
              ))}
            <div className="mt--80 position-relative">
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

        <div className="rbt-rbt-blog-area rbt-section-gap">
          <div className="gradient-shape-top version-02"></div>
          <div className="gradient-shape-bottom version-02"></div>
          <div className="container">
            <div className="row mb--30 mb_sm--50 g-5 align-items-end">
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

        <div className="rbt-newsletter-area newsletter-style-2 bg-gradient-7 rbt-section-gap">
          <div className="container">
            <div className="row row--15 align-items-center">
              <div className="col-lg-12">
                <div className="inner text-center">
                  <div className="section-title text-center">
                    <h6 className="color-white b2">Get My Tips Directly</h6>
                    <h2 className="title color-white w-600">
                      Subscribe Our Newsletter
                    </h2>
                    <p className="description color-white mt--20">
                      Lorem ipsum, dolor sit amet consectetur adipisicing elit.
                      Ipsam explicabo sit est eos earum reprehenderit inventore
                      nam autem corrupti rerum!
                    </p>
                  </div>
                  <form action="#" className="newsletter-form-1 mt--40">
                    <input type="email" placeholder="Enter Your E-Email" />
                    <button
                      type="submit"
                      className="rbt-btn btn-md btn-gradient hover-icon-reverse"
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
                  <span className="note-text color-white mt--20">
                    No ads, No trails, No commitments
                  </span>

                  <div className="row row--15 mt--50 justify-content-lg-center">
                    <div className="col-lg-3 col-md-6 col-sm-6 single-counter">
                      <div className="rbt-counterup rbt-hover-03 style-2 text-color-white">
                        <div className="inner">
                          <div className="content">
                            <h3 className="counter rv-plus color-white w-600">
                              <span className="odometer rbt-font-primary">
                                <CounterWrap value={100} />
                              </span>
                              %
                            </h3>
                            <h5 className="title color-white">
                              Client Satisfaction
                            </h5>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-lg-3 col-md-6 col-sm-6 single-counter mt_mobile--30">
                      <div className="rbt-counterup rbt-hover-03 style-2 text-color-white">
                        <div className="inner">
                          <div className="content">
                            <h3 className="counter color-white w-600">
                              <span className="odometer rbt-font-primary">
                                <CounterWrap value={500} />
                              </span>
                            </h3>
                            <h5 className="title color-white">
                              Certification Students
                            </h5>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-lg-3 col-md-6 col-sm-6 single-counter mt_md--30 mt_sm--30 mt_mobile--30">
                      <div className="rbt-counterup rbt-hover-03 style-2 text-color-white">
                        <div className="inner">
                          <div className="content">
                            <h3 className="counter color-white w-600">
                              <span className="odometer rbt-font-primary">
                                <CounterWrap value={120} />
                              </span>
                            </h3>
                            <h5 className="title color-white">Online Course</h5>
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
      </main>
    </>
  );
};

export default Coaching;
