import CourseMenu from "./Course-Sections/Course-Menu";
import Overview from "./Course-Sections/Overview";
import Content from "./Course-Sections/Content";
import Requirements from "./Course-Sections/Requirements";
import Instructor from "./Course-Sections/Instructor";
import Review from "./Course-Sections/Review";
import Featured from "./Course-Sections/Featured";
import RelatedCourse from "./Course-Sections/RelatedCourse";
import Viedo from "./Course-Sections/Viedo";
import Link from "next/link";
import Image from "next/image";

const profiles = [
  { name: "Ava Miller", src: "/images/shape/art-stu-2.png" },
  { name: "Mark Jordan", src: "/images/shape/art-stu-1.png" },
  { name: "Jordan", src: "/images/shape/art-stu-3.png" },
];

const CourseDetailsFive = ({ checkMatchCourses }) => {
  
  return (
    <>
      <div className="col-lg-8">
        <div className="course-details-content">
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
                {checkMatchCourses.studentNumber}
              </h6>
              <span className="small-text w-500">Students Enrolled</span>
            </div>
          </div>
          <h2 className="w-600 mb--10">{checkMatchCourses.courseTitle}</h2>
          <p className="mb--20">{checkMatchCourses.desc}</p>
          <hr className="divider" />
          <div className="d-flex align-items-center mb--20 flex-wrap course-details-feature">
            <div className="feature-sin">
              <span className="icon">
                <i className="feather-user"></i>
              </span>
              <h6 className="b3 w-400 mb--0">
                <span className="color-body">by</span>{" "}
                <Link
                  className="px-1"
                  href={`/profile/${checkMatchCourses.id}`}
                >
                  {checkMatchCourses.userName}
                </Link>
              </h6>
            </div>

            <div className="feature-sin">
              <span className="icon">
                <i className="feather-calendar"></i>
              </span>
              <span className="b3">{checkMatchCourses.date}</span>
            </div>

            <div className="feature-sin rating">
              <span className="icon">
                <i className="feather-thumbs-up"></i>
              </span>
              <div>
                <span>
                  <a href="#">
                    <i className="fa fa-star"></i>
                  </a>
                  <a href="#">
                    <i className="fa fa-star"></i>
                  </a>
                  <a href="#">
                    <i className="fa fa-star"></i>
                  </a>
                  <a href="#">
                    <i className="fa fa-star"></i>
                  </a>
                  <a href="#">
                    <i className="fa fa-star"></i>
                  </a>
                </span>
                <span className="b3">({checkMatchCourses.review} Reviews)</span>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rbt-card mt--50">
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
        <div className="sticky-top">
          <div className="course-sidebar rbt-shadow-box rbt-gradient-border position-relative">
            <div className="inner">
              <Viedo
                checkMatchCourses={checkMatchCourses && checkMatchCourses}
              />
            </div>
          </div>

          <div className="course-sidebar rbt-shadow-box rbt-gradient-border position-relative mt--30">
            <h5 className="title">Similar Course</h5>
            {checkMatchCourses.relatedCourse.map((data, i) => (
              <div className="inner" key={i}>
                {data.body.map((innerData, i) => (
                  <div className="course-item" key={i}>
                    <Link href={`${innerData.link}/${innerData.id}`}>
                      <div className="item-img">
                        <Image
                          src={innerData.img}
                          alt="course"
                          width={113}
                          height={78}
                          unoptimized={true}
                        />
                      </div>
                    </Link>
                    <div className="item-body">
                      <h6 className="mb--5 w-400">
                        <Link href={`${innerData.link}/${innerData.id}`}>
                          {innerData.title}
                        </Link>
                      </h6>
                      <div className="rating">
                        <h6 className="mb--0 w-400">Rating</h6>
                        <span>
                          <i className="fa fa-star"></i>
                          <i className="fa fa-star"></i>
                          <i className="fa fa-star"></i>
                          <i className="fa fa-star"></i>
                          <i className="fa fa-star"></i>
                        </span>
                      </div>
                      <span className="author">
                        By{" "}
                        <Link
                          className="px-1"
                          href={`/profile/${innerData.id}`}
                        >
                          {innerData.author}
                        </Link>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default CourseDetailsFive;
