"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import sal from "sal.js";
import "venobox/dist/venobox.min.css";

import CourseData from "../../../data/course-details/courseData.json";
import { Provider } from "react-redux";
import Store from "@/redux/store";
import Context from "@/context/Context";

import MobileMenu from "@/components/Header/MobileMenu";
import HeaderStyleTen from "@/components/Header/HeaderStyle-Ten";
import Cart from "@/components/Header/Offcanvas/Cart";
import Separator from "@/components/Common/Separator";
import FooterOne from "@/components/Footer/Footer-One";
import CourseHead from "@/components/Course-Details/Course-Sections/course-head";
import CourseActionBottom from "@/components/Course-Details/Course-Sections/Course-Action-Bottom";
import RelatedCourse from "@/components/Course-Details/Course-Sections/RelatedCourse";
import CourseDetailsSeven from "@/components/Course-Details/CourseDetails-Seven";

import breadcrumbImg from "../../../public/images/shape/breadcrumb-light-shadow-01.png";
import breadcrumbShape from "../../../public/images/shape/breadcrumb-shape-01.png";

const profiles = [
  { name: "Ava Miller", src: "/images/shape/art-stu-2.png" },
  { name: "Mark Jordan", src: "/images/shape/art-stu-1.png" },
  { name: "Jordan", src: "/images/shape/art-stu-3.png" },
];

const SingleCourseSeven = ({ getParams }) => {
  const router = useRouter();
  const postId = parseInt(getParams.courseId);
  let getCourse;

  getCourse = JSON.parse(JSON.stringify(CourseData.courseTab));

  const checkMatch = getCourse.find((course) => course.id === postId);

  useEffect(() => {
    if (postId && checkMatch === undefined) {
      router.push("/course-card-2");
    }

    import("venobox/dist/venobox.min.js").then((venobox) => {
      new venobox.default({
        selector: ".popup-video",
      });
    });

    sal({
      threshold: 0.01,
      once: true,
    });
  }, [checkMatch, router]);

  return (
    <>
      <Provider store={Store}>
        <Context>
          <MobileMenu />
          <HeaderStyleTen headerSticky="" headerType={true} />
          <Cart />

          <div className="rbt-breadcrumb-default breadcrumb-bg-3 bg_image">
            <CourseHead
              checkMatch={checkMatch !== undefined ? checkMatch : ""}
            />
          </div>

          <div className="rbt-course-details-area pb--60 mt--60 mt_md--60 mt_sm--50">
            <div className="container">
              <div className="course-details-content version-02 mb--80 mb_md--60 mb_sm--50">
                <div className="light-shape">
                  <Image
                    src={breadcrumbImg}
                    width={198}
                    height={148}
                    unoptimized={true}
                    alt="Shape"
                  />
                </div>
                <div className="shape-1">
                  <Image
                    src={breadcrumbShape}
                    width={534}
                    height={400}
                    unoptimized={true}
                    alt="Shape"
                  />
                </div>
                <div className="row align-items-center rbt-index-upper-2">
                  <div className="col-lg-8">
                    <div className="d-flex align-items-center gap-3 flex-wrap mb--15">
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
                              width={40}
                              height={40}
                              unoptimized={true}
                            />
                          </Link>
                        ))}
                      </div>
                      <div className="d-flex flex-column">
                        <h6 className="number mb--0 w-600 color-white">
                          {checkMatch.studentNumber}
                        </h6>
                        <span className="small-text w-500 color-white opacity-8">
                          Students Enrolled
                        </span>
                      </div>
                    </div>
                    <h2 className="w-600 mb--10 color-white">
                      {checkMatch.courseTitle}
                    </h2>
                    <p className="mb--20 color-white opacity-8">
                      {checkMatch.desc}
                    </p>
                    <hr className="divider" />
                    <div className="d-flex align-items-center flex-wrap course-details-feature">
                      <div className="feature-sin">
                        <span className="icon">
                          <i className="feather-user color-white"></i>
                        </span>
                        <h6 className="b3 w-400 mb--0 color-white">
                          <span className="opacity-8">by</span>{" "}
                          <Link
                            className="px-1"
                            href={`/profile/${checkMatch.id}`}
                          >
                            {checkMatch.userName}
                          </Link>
                        </h6>
                      </div>

                      <div className="feature-sin">
                        <span className="icon">
                          <i className="feather-calendar color-white"></i>
                        </span>
                        <span className="b3 color-white opacity-8">
                          {checkMatch.date}
                        </span>
                      </div>

                      <div className="feature-sin rating">
                        <span className="icon">
                          <i className="feather-thumbs-up color-white"></i>
                        </span>
                        <div>
                          <span>
                            <Link className="pe-1" href="#">
                              <i className="fa fa-star"></i>
                            </Link>
                            <Link className="pe-1" href="#">
                              <i className="fa fa-star"></i>
                            </Link>
                            <Link className="pe-1" href="#">
                              <i className="fa fa-star"></i>
                            </Link>
                            <Link className="pe-1" href="#">
                              <i className="fa fa-star"></i>
                            </Link>
                            <Link className="pe-1" href="#">
                              <i className="fa fa-star"></i>
                            </Link>
                          </span>
                          <span className="b3 color-white opacity-8">
                            ({checkMatch.review} Reviews)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-4">
                    <div className="d-flex justify-content-center mt_md--60 mt_sm--60">
                      <Link
                        className="rbt-btn rounded-player-2 popup-video position-to-top rounded-player"
                        data-vbtype="video"
                        href="https://www.youtube.com/watch?v=nA1Aqp0sPQo"
                      >
                        <span className="play-icon"></span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row g-5">
                <CourseDetailsSeven
                  checkMatchCourses={checkMatch !== undefined ? checkMatch : ""}
                />
              </div>
            </div>
          </div>

          <CourseActionBottom
            checkMatchCourses={checkMatch !== undefined ? checkMatch : ""}
          />

          <div className="rbt-related-course-area bg-color-white rbt-section-gapBottom">
            <div className="container">
              <div className="related-course mt--60">
                {checkMatch &&
                  checkMatch.relatedCourse.map((data, index) => (
                    <RelatedCourse
                      {...data}
                      key={index}
                      checkMatchCourses={data}
                      colClass="col-lg-4 col-md-6 col-sm-6 col-12"
                    />
                  ))}
              </div>
            </div>
          </div>

          <Separator />
          <FooterOne />
        </Context>
      </Provider>
    </>
  );
};

export default SingleCourseSeven;
