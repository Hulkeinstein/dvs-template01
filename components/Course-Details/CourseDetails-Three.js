"use client";

import { useEffect } from "react";

import "venobox/dist/venobox.min.css";
import Viedo from "./Course-Sections/Viedo";
import CourseMenu from "./Course-Sections/Course-Menu";
import Overview from "./Course-Sections/Overview";
import Requirements from "./Course-Sections/Requirements";
import Instructor from "./Course-Sections/Instructor";
import Review from "./Course-Sections/Review";
import Featured from "./Course-Sections/Featured";
import Content from "./Course-Sections/Content";

const CourseDetailsThree = ({ checkMatchCourses }) => {
  useEffect(() => {
    import("venobox/dist/venobox.min.js").then((venobox) => {
      new venobox.default({
        selector: ".popup-video",
      });
    });
  }, []);
  return (
    <>
      <div className="row g-5">
        <div className="col-lg-8">
          <div className="course-details-content">
            <div className="rbt-inner-onepage-navigation sticky-top mt--30">
              <CourseMenu />
            </div>

            {checkMatchCourses &&
              checkMatchCourses.courseOverview.map((data, index) => (
                <Overview {...data} key={index} checkMatchCourses={data} />
              ))}

            <div
              className="course-content rbt-shadow-box coursecontent-wrapper mt--30"
              id="coursecontent"
            >
              {checkMatchCourses &&
                checkMatchCourses.courseContent.map((data, index) => (
                  <Content {...data} key={index} checkMatchCourses={data} />
                ))}
            </div>

            <div
              className="rbt-course-feature-box rbt-shadow-box details-wrapper mt--30"
              id="details"
            >
              <div className="row g-5">
                {checkMatchCourses &&
                  checkMatchCourses.courseRequirement.map((data, index) => (
                    <Requirements
                      {...data}
                      key={index}
                      checkMatchCourses={data}
                    />
                  ))}
              </div>
            </div>
            <div
              className="rbt-instructor rbt-shadow-box intructor-wrapper mt--30"
              id="intructor"
            >
              {checkMatchCourses &&
                checkMatchCourses.courseInstructor.map((data, index) => (
                  <Instructor {...data} key={index} checkMatchCourses={data} />
                ))}
            </div>
            <div
              className="rbt-review-wrapper rbt-shadow-box review-wrapper mt--30"
              id="review"
            >
              <Review />
            </div>

            {checkMatchCourses &&
              checkMatchCourses.featuredReview.map((data, index) => (
                <Featured {...data} key={index} coursesFeatured={data} />
              ))}
          </div>
        </div>

        <div className="col-lg-4">
          <div className="course-sidebar sticky-top rbt-shadow-box rbt-gradient-border">
            <div className="inner">
              <div className="content-item-content">
                <Viedo
                  checkMatchCourses={checkMatchCourses && checkMatchCourses}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CourseDetailsThree;
