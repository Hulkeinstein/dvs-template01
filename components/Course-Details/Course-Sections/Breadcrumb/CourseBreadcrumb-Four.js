import React from "react";
import Image from "next/image";
import Link from "next/link";

const profiles = [
  { name: "Ava Miller", src: "/images/shape/art-stu-2.png" },
  { name: "Mark Jordan", src: "/images/shape/art-stu-1.png" },
  { name: "Jordan", src: "/images/shape/art-stu-3.png" },
];

const CourseBreadcrumbFour = ({ getMatchCourse }) => {
  return (
    <>
      <div className="col-lg-8">
        <div className="content text-start">
          <ul className="page-list mb--80 mb_md--60 mb_sm--40">
            <li className="rbt-breadcrumb-item">
              <Link className="color-white" href="/">
                Home
              </Link>
            </li>
            <li>
              <div className="icon-right">
                <i className="feather-chevron-right color-white"></i>
              </div>
            </li>
            <li className="rbt-breadcrumb-item active color-white opacity-8">
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
              <h6 className="number mb--0 w-600 color-white">
                {getMatchCourse.studentNumber}
              </h6>
              <span className="small-text w-500 color-white opacity-8">
                Students Enrolled
              </span>
            </div>
          </div>
          <h2 className="w-600 mb--10 color-white">
            {getMatchCourse.courseTitle}
          </h2>
          <p className="mb--20 color-white opacity-8">{getMatchCourse.desc}</p>
          <hr className="divider color-white" />
          <div className="d-flex align-items-center flex-wrap rbt-course-details-feature vertion-02">
            <div className="feature-sin">
              <span className="icon">
                <i className="feather-user color-white"></i>
              </span>
              <h6 className="b3 w-400 mb--0 color-white">
                <span className="opacity-8">by</span>{" "}
                <Link className="px-1" href={`/profile/${getMatchCourse.id}`}>
                  {getMatchCourse.userName}
                </Link>
              </h6>
            </div>

            <div className="feature-sin">
              <span className="icon">
                <i className="feather-calendar color-white"></i>
              </span>
              <span className="b3 color-white opacity-8">
                {getMatchCourse.date}
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
                  ({getMatchCourse.review} Reviews)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CourseBreadcrumbFour;
