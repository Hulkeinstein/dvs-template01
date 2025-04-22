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
import CourseDetailsEight from "@/components/Course-Details/CourseDetails-Eight";
import CourseMenu from "@/components/Course-Details/Course-Sections/Course-Menu";

const profiles = [
  { name: "Ava Miller", src: "/images/shape/art-stu-2.png" },
  { name: "Mark Jordan", src: "/images/shape/art-stu-1.png" },
  { name: "Jordan", src: "/images/shape/art-stu-3.png" },
];

const SingleCourseEight = ({ getParams }) => {
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
              <div className="course-details-content mb--80 mb_md--60 mb_sm--50">
                <div className="row row--20 align-items-center">
                  <div className="col-lg-7">
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
                        <h6 className="number mb--0 w-600">
                          {checkMatch.studentNumber}
                        </h6>
                        <span className="small-text w-500">
                          Students Enrolled
                        </span>
                      </div>
                    </div>
                    <h2 className="w-600 mb--10">{checkMatch.courseTitle}</h2>
                    <p className="mb--20">{checkMatch.desc}</p>
                    <hr className="divider" />
                    <div className="d-flex align-items-center flex-wrap course-details-feature">
                      <div className="feature-sin">
                        <span className="icon">
                          <i className="feather-user"></i>
                        </span>
                        <h6 className="b3 w-400 mb--0">
                          <span className="color-body">by</span>{" "}
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
                          <i className="feather-calendar"></i>
                        </span>
                        <span className="b3">{checkMatch.date}</span>
                      </div>

                      <div className="feature-sin rating">
                        <span className="icon">
                          <i className="feather-thumbs-up"></i>
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
                          <span className="b3 ps-2">
                            ({checkMatch.review} Reviews)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-5">
                    <div className="mt_md--60 mt_sm--60 mt_mobile--40 overflow-hidden rbt-card p-4">
                      <div className="plyr__video-embed rbtplayer">
                        <iframe
                          className="radius-10 overflow-hidden"
                          src="https://www.youtube.com/embed/DR9lxZ8kPYQ?autoplay=0&controls=0&disablekb=1&playsinline=0&cc_load_policy=0&cc_lang_pref=auto&widget_referrer=http%3A%2F%2Flocalhost%3A3001%2Fcourse-details-3.html&rel=0&showinfo=0&iv_load_policy=3&modestbranding=1&customControls=true&noCookie=false&enablejsapi=1&origin=http%3A%2F%2Flocalhost%3A3001&widgetid=1"
                          width={496}
                          height={280}
                          allowFullScreen
                          allow="autoplay"
                        ></iframe>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rbt-inner-onepage-navigation version-02 sticky-top mb--40">
                <CourseMenu />
              </div>

              <div className="row g-5">
                <CourseDetailsEight
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

export default SingleCourseEight;
