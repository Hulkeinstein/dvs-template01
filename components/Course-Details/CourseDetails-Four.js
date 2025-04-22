import CourseMenu from "./Course-Sections/Course-Menu";
import Overview from "./Course-Sections/Overview";
import Content from "./Course-Sections/Content";
import Requirements from "./Course-Sections/Requirements";
import Instructor from "./Course-Sections/Instructor";
import Review from "./Course-Sections/Review";
import Featured from "./Course-Sections/Featured";
import RelatedCourse from "./Course-Sections/RelatedCourse";
import Viedo from "./Course-Sections/Viedo";

const CourseDetailsFour = ({ checkMatchCourses }) => {
  return (
    <>
      <div className="col-lg-8">
        <div className="course-details-content">
          <div className="overflow-hidden rbt-card">
            <div className="plyr__video-embed rbtplayer">
              <iframe
                className="overflow-hidden"
                src="https://www.youtube.com/embed/DR9lxZ8kPYQ?autoplay=0&controls=0&disablekb=1&playsinline=0&cc_load_policy=0&cc_lang_pref=auto&widget_referrer=http%3A%2F%2Flocalhost%3A3001%2Fcourse-details-3.html&rel=0&showinfo=0&iv_load_policy=3&modestbranding=1&customControls=true&noCookie=false&enablejsapi=1&origin=http%3A%2F%2Flocalhost%3A3001&widgetid=1"
                allowFullScreen
                width={800}
                height={450}
                allow="autoplay"
              ></iframe>
            </div>
          </div>

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
        <div className="related-course mt--60">
          {checkMatchCourses &&
            checkMatchCourses.relatedCourse.map((data, index) => (
              <RelatedCourse {...data} key={index} checkMatchCourses={data} />
            ))}
        </div>
      </div>

      <div className="col-lg-4">
        <div className="course-sidebar sticky-top rbt-shadow-box rbt-gradient-border course-sidebar-top sidebar-top-110">
          <div className="inner">
            <Viedo checkMatchCourses={checkMatchCourses && checkMatchCourses} />
          </div>
        </div>
      </div>
    </>
  );
};

export default CourseDetailsFour;
