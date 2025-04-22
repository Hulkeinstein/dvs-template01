import Overview from "./Course-Sections/Overview";
import Content from "./Course-Sections/Content";
import Requirements from "./Course-Sections/Requirements";
import Instructor from "./Course-Sections/Instructor";
import Review from "./Course-Sections/Review";
import Featured from "./Course-Sections/Featured";
import Viedo from "./Course-Sections/Viedo";

const CourseDetailsEight = ({ checkMatchCourses }) => {
  return (
    <>
      <div className="col-lg-8">
        <div className="course-details-content">
          {checkMatchCourses &&
            checkMatchCourses.courseOverview.map((data, index) => (
              <Overview {...data} key={index} checkMatchCourses={data} />
            ))}

          <div
            className="course-content rbt-border-with-box coursecontent-wrapper mt--30"
            id="coursecontent"
          >
            {checkMatchCourses &&
              checkMatchCourses.courseContent.map((data, index) => (
                <Content {...data} key={index} checkMatchCourses={data} />
              ))}
          </div>

          <div
            className="rbt-course-feature-box rbt-border-with-box details-wrapper mt--30"
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
            className="rbt-instructor rbt-border-with-box intructor-wrapper mt--30"
            id="intructor"
          >
            {checkMatchCourses &&
              checkMatchCourses.courseInstructor.map((data, index) => (
                <Instructor {...data} key={index} checkMatchCourses={data} />
              ))}
          </div>
          <div
            className="rbt-review-wrapper rbt-border-with-box review-wrapper mt--30"
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
            <Viedo checkMatchCourses={checkMatchCourses && checkMatchCourses} />
          </div>
        </div>
      </div>
    </>
  );
};

export default CourseDetailsEight;
