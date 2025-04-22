import React from "react";
import Link from "next/link";
import Image from "next/image";

import BlogGrid from "../Blogs/BlogGrid";
import TestimonialFour from "../Testimonials/Testimonial-Four";

import TeamData from "../../data/elements/team.json";
import AccordionData from "../../data/elements/accordion.json";
import CourseDetails from "../../data/course-details/courseData.json";

import brand1 from "../../public/images/brand/partner-5.webp";
import brand2 from "../../public/images/brand/partner-1.webp";
import brand3 from "../../public/images/brand/partner-6.webp";
import brand4 from "../../public/images/brand/partner-3.webp";
import faqMoon from "../../public/images/shape/faq-moon.png";
import faqShape from "../../public/images/shape/a-dubble-shape.png";
import faqImg from "../../public/images/others/faq-01.png";
import faqImg2 from "../../public/images/others/faq-02.png";
import lightShape from "../../public/images/shape/a-light-shape.png";
import star from "../../public/images/shape/a-all-star.png";
import arabianImg from "../../public/images/others/arabian.png";
import readQuranImg from "../../public/images/others/read-quran.png";
import IslamicCenterBanner from "./IslamicCenter-Banner";

const IslamicCenter = ({ blogdata }) => {
  let getAllCourse = JSON.parse(JSON.stringify(CourseDetails.courseDetails));
  return (
    <>
      <main className="rbt-main-wrapper">
        <IslamicCenterBanner />
        <div className="rbt-feature-area rbt-section-gap3Top">
          <div className="container">
            <div className="row g-5">
              <div className="col-lg-4 col-md-6 col-12">
                <div className="rbt-feature-card-two">
                  <div className="feature-body">
                    <div className="icon bg-color-primary">
                      <i className="feather-heart"></i>
                    </div>
                    <h5 className="title w-500 mb--10 mt--15">
                      Flexible Classes
                    </h5>
                    <p className="description">
                      The long established fact reader distracted this looking.
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-lg-4 col-md-6 col-12">
                <div className="rbt-feature-card-two">
                  <div className="feature-body">
                    <div className="icon bg-color-secondary">
                      <i className="feather-book"></i>
                    </div>
                    <h5 className="title w-500 mb--10 mt--15">
                      Learn From Anywhere
                    </h5>
                    <p className="description">
                      Amongst buns length hints hands before clothes dismiss.
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-lg-4 col-md-6 col-12">
                <div className="rbt-feature-card-two">
                  <div className="feature-body">
                    <div className="icon bg-color-pink">
                      <i className="feather-award"></i>
                    </div>
                    <h5 className="title w-500 mb--10 mt--15">
                      Skill-Based Learning
                    </h5>
                    <p className="description">
                      Bank lane time sister along peddler nothing down rolling.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rbt-about-area rbt-section-gap3Top rbt-section-gapBottom">
          <div className="about-style-4 version-03">
            <div className="light-shadow">
              <Image src={lightShape} width={305} height={578} alt="Shape" />
            </div>
            <div className="dubble-shape">
              <Image src={faqShape} width={108} height={118} alt="Shape" />
            </div>
            <div className="container">
              <div className="row">
                <div className="col-xl-6 col-12">
                  <div className="about-thumb">
                    <div className="stars">
                      <Image src={star} width={31} height={32} alt="image" />
                    </div>
                    <div className="thumb-1">
                      <Image
                        data-parallax='{"x": 0, "y": -30}'
                        src={arabianImg}
                        width={695}
                        height={448}
                        alt="Feature"
                      />
                    </div>
                    <div className="thumb-2">
                      <Image
                        data-parallax='{"x": 0, "y": 30}'
                        src={readQuranImg}
                        alt="Feature"
                      />
                    </div>
                  </div>
                </div>
                <div className="col-xl-6 col-12">
                  <div className="content">
                    <div className="section-title">
                      <span className="subtitle bg-primary-opacity">
                        ABOUT ME
                      </span>
                      <h2 className="title w-600">
                        Learn{" "}
                        <span className="theme-gradient">
                          Online Quran Classes
                        </span>{" "}
                        For Kids & Adults
                      </h2>
                      <p className="mt--15">
                        At Histudy University, we are moving boldly - and
                        concertedly - to expand tomorrow's frontiers. We believe
                        that we have the power to shape the future, for the
                        better
                      </p>
                      <ul className="mt--30 mb--50">
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
                        <li>
                          <span className="icon bg-primary-opacity">
                            <i className="feather-heart"></i>
                          </span>
                          <span className="text">Affordable Pricing</span>
                        </li>
                        <li>
                          <span className="icon bg-secondary-opacity">
                            <i className="feather-book"></i>
                          </span>
                          <span className="text">Free Trial Classes</span>
                        </li>
                      </ul>
                      <Link
                        className="rbt-btn btn-gradient hover-icon-reverse"
                        href="/about-us-01"
                      >
                        <span className="icon-reverse-wrapper">
                          <span className="btn-text">Learn More</span>
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
          </div>
        </div>

        <div className="rbt-course-area rbt-sec-cir-shadow-1 bg-color-extra2 rbt-section-gap">
          <div className="gradient-shape-top"></div>
          <div className="gradient-shape-bottom"></div>
          <div className="container">
            <div className="row mb--50 mb_sm--45">
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
              {getAllCourse.slice(30, 33).map((data, index) => (
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

            <div className="row mt--55 mt_sm--50">
              <div className="col-lg-12">
                <div className="load-more-btn text-center">
                  <Link
                    className="rbt-btn btn-gradient btn-lg btn-mobile hover-icon-reverse"
                    href="/course-with-tab"
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
          </div>
        </div>

        <div className="rbt-accordion-area bg-color-white rbt-section-gap">
          <div className="container">
            <div className="row row--30 mt_dec--30">
              <div className="col-lg-6 mt--30">
                <div className="section-title mb--50">
                  <span className="subtitle bg-primary-opacity">
                    Question & Answer
                  </span>
                  <h2 className="title w-600">
                    I Have Been Teaching The Quran For{" "}
                    <span className="theme-gradient">20 Years</span>
                  </h2>
                </div>
                <div className="rbt-accordion-style rbt-accordion-01 accordion">
                  <div className="accordion" id="accordionExample">
                    {AccordionData.accordionFive.map((item, index) => (
                      <div key={index} className="accordion-item card">
                        <h2
                          className="accordion-header card-header"
                          id={item.headingId}
                        >
                          <button
                            className={`accordion-button ${
                              !item.expanded ? "collapsed" : ""
                            }`}
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target={`#${item.id}`}
                            aria-expanded={item.expanded}
                            aria-controls={item.id}
                          >
                            {item.question}
                          </button>
                        </h2>
                        <div
                          id={item.id}
                          className={`accordion-collapse collapse ${
                            item.expanded ? "show" : ""
                          }`}
                          aria-labelledby={item.headingId}
                          data-bs-parent="#accordionExample"
                        >
                          <div className="accordion-body card-body">
                            {item.answer.map((paragraph, idx) => (
                              <p key={idx} className="mb--15">
                                {paragraph}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="col-lg-6 mt--30">
                <div className="accordion-thumbnail">
                  <div className="moon">
                    <Image src={faqMoon} width={64} height={67} alt="Moon" />
                  </div>
                  <div className="shape">
                    <Image
                      src={faqShape}
                      width={108}
                      height={118}
                      alt="Shape"
                    />
                  </div>
                  <div className="thumb-1">
                    <Image
                      data-parallax='{"x": 0, "y": -30}'
                      src={faqImg}
                      width={390}
                      height={430}
                      unoptimized={true}
                      alt="Thumbnail"
                    />
                  </div>
                  <div className="thumb-2">
                    <Image
                      data-parallax='{"x": 0, "y": 30}'
                      src={faqImg2}
                      width={300}
                      height={340}
                      unoptimized={true}
                      alt="Thumbnail"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rbt-team-area bg-color-extra2 rbt-section-gap rbt-sec-cir-shadow-1">
          <div className="gradient-shape-top version-03"></div>
          <div className="gradient-shape-bottom version-03"></div>
          <div className="container">
            <div className="row mb--60">
              <div className="col-lg-12">
                <div className="section-title text-center">
                  <span className="subtitle bg-primary-opacity">
                    Team Members
                  </span>
                  <h2 className="title w-600">Our Expert Instructors</h2>
                </div>
              </div>
            </div>
            <div className="row row--15 mt_dec--30">
              {TeamData &&
                TeamData.teamTwo.map((data, index) => (
                  <div
                    className="col-lg-3 col-md-6 col-sm-6 col-12 mt--30"
                    key={index}
                  >
                    {data.details.map((item, innerIndex) => (
                      <div className="team" key={innerIndex}>
                        <div className="thumbnail">
                          <Image
                            src={item.img}
                            width={415}
                            height={555}
                            priority
                            alt="Blog Images"
                          />
                        </div>
                        <div className="content">
                          <h4 className="title">{item.name}</h4>
                          <p className="designation">{item.type}</p>
                        </div>
                        <ul className="social-icon">
                          <li>
                            <Link href="#">
                              <i className="fab fa-facebook-f"></i>
                            </Link>
                          </li>
                          <li>
                            <Link href="#">
                              <i className="fab fa-linkedin-in"></i>
                            </Link>
                          </li>
                          <li>
                            <Link href="#">
                              <i className="fab fa-twitter"></i>
                            </Link>
                          </li>
                        </ul>
                      </div>
                    ))}
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className="rbt-testimonial-area bg-color-white rbt-section-gap">
          <TestimonialFour leftContent={true} />
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
              start={6}
              end={9}
              blogdata={blogdata}
            />
          </div>
        </div>
      </main>
    </>
  );
};

export default IslamicCenter;
