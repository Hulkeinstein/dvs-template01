"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import sal from "sal.js";
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
import CourseDetailsFive from "@/components/Course-Details/CourseDetails-Five";

const SingleCourseFive = ({ getParams }) => {
  const router = useRouter();
  const postId = parseInt(getParams.courseId);
  let getCourse;

  getCourse = JSON.parse(JSON.stringify(CourseData.courseTab));

  const checkMatch = getCourse.find((course) => course.id === postId);

  useEffect(() => {
    if (postId && checkMatch === undefined) {
      router.push("/course-card-2");
    }

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

          <div className="rbt-course-details-area ptb--60">
            <div className="container">
              <div className="row g-5">
                <CourseDetailsFive
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

export default SingleCourseFive;
