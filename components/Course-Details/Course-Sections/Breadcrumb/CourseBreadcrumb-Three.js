import Image from "next/image";
import Link from "next/link";
import React, { useEffect } from "react";

import "venobox/dist/venobox.min.css";

const profiles = [
  { name: "Ava Miller", src: "/images/shape/art-stu-2.png" },
  { name: "Mark Jordan", src: "/images/shape/art-stu-1.png" },
  { name: "Jordan", src: "/images/shape/art-stu-3.png" },
];

const CourseBreadcrumbThree = ({ getMatchCourse }) => {
    useEffect(() => {
    import("venobox/dist/venobox.min.js").then((venobox) => {
      new venobox.default({
        selector: ".popup-video",
      });
    });
    }, [])
    
  return (
    <>
      <div className="col-lg-7">
        <div className="content text-start">
          <ul className="page-list mb--80 mb_md--60 mb_sm--40">
            <li className="rbt-breadcrumb-item">
              <Link href="/">Home</Link>
            </li>
            <li>
              <div className="icon-right">
                <i className="feather-chevron-right"></i>
              </div>
            </li>
            <li className="rbt-breadcrumb-item active">
              {getMatchCourse.category}
            </li>
          </ul>
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
                {getMatchCourse.studentNumber}
              </h6>
              <span className="small-text w-500">Students Enrolled</span>
            </div>
          </div>
          <h2 className="w-600 mb--10">{getMatchCourse.courseTitle}</h2>
          <p className="mb--20">{getMatchCourse.desc}</p>
          <hr className="divider" />
          <div className="d-flex align-items-center flex-wrap rbt-course-details-feature vertion-02">
            <div className="feature-sin">
              <span className="icon">
                <i className="feather-user"></i>
              </span>
              <h6 className="b3 w-400 mb--0">
                <span className="color-body">by</span>{" "}
                <Link className="px-1" href={`/profile/${getMatchCourse.id}`}>
                  {getMatchCourse.userName}
                </Link>
              </h6>
            </div>

            <div className="feature-sin">
              <span className="icon">
                <i className="feather-calendar"></i>
              </span>
              <span className="b3">{getMatchCourse.date}</span>
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
                <span className="b3 ms-2">
                  ({getMatchCourse.review} Reviews)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-lg-5">
        <div className="radius-10 overflow-hidden p-4 bg-color-white-opacity mt_md--60 mt_sm--60 mt_mobile--40">
          <div className="plyr__video-embed rbtplayer">
            <iframe
              className="radius-10 overflow-hidden"
              src="https://www.youtube.com/embed/DR9lxZ8kPYQ?autoplay=0&controls=0&disablekb=1&playsinline=0&cc_load_policy=0&cc_lang_pref=auto&widget_referrer=http%3A%2F%2Flocalhost%3A3001%2Fcourse-details-3.html&rel=0&showinfo=0&iv_load_policy=3&modestbranding=1&customControls=true&noCookie=false&enablejsapi=1&origin=http%3A%2F%2Flocalhost%3A3001&widgetid=1"
              allowFullScreen
              width={505}
              height={284}
              allow="autoplay"
            ></iframe>
          </div>
        </div>
      </div>
    </>
  );
};

export default CourseBreadcrumbThree;
