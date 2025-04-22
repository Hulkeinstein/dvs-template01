import React from "react";
import Link from "next/link";

const CourseBreadcrumbSix = ({ getMatchCourse }) => {
  return (
    <>
      <div className="col">
        <div className="text-center">
          <ul className="page-list mb--30">
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
          <h2 className="w-600 mb--10">
            <span className="theme-gradient">{getMatchCourse.courseTitle}</span>
          </h2>
          <p className="mb--20">{getMatchCourse.desc}</p>
          <hr className="divider" />
          <div className="d-flex align-items-center justify-content-center flex-wrap rbt-course-details-feature vertion-02">
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
                  <Link href="#">
                    <i className="fa fa-star"></i>
                  </Link>
                  <Link href="#">
                    <i className="fa fa-star"></i>
                  </Link>
                  <Link href="#">
                    <i className="fa fa-star"></i>
                  </Link>
                  <Link href="#">
                    <i className="fa fa-star"></i>
                  </Link>
                  <Link href="#">
                    <i className="fa fa-star"></i>
                  </Link>
                </span>
                <span className="b3 ps-2">({getMatchCourse.review} Reviews)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CourseBreadcrumbSix;
