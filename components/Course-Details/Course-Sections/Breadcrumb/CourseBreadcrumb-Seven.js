import Link from "next/link";
import React from "react";

const CourseBreadcrumbSeven = ({ getMatchCourse }) => {
  return (
    <>
      <div className="col">
        <ul className="page-list">
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
      </div>
    </>
  );
};

export default CourseBreadcrumbSeven;
