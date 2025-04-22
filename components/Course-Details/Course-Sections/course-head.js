"use client";

import Image from "next/image";
import { usePathname, useParams } from "next/navigation";

import CourseBreadcrumb from "./Breadcrumb/Course-Breadcrumb";

import bgImage from "../../../public/images/bg/bg-image-10.jpg";
import bgImage2 from "../../../public/images/bg/breadcrumb-bg-01.png";
import bgImage3 from "../../../public/images/bg/breadcrumb-bg-02.png";

import CourseBreadcrumbTwo from "./Breadcrumb/CourseBreadcrumb-Two";
import CourseBreadcrumbThree from "./Breadcrumb/CourseBreadcrumb-Three";
import CourseBreadcrumbFour from "./Breadcrumb/CourseBreadcrumb-Four";
import CourseBreadcrumbFive from "./Breadcrumb/CourseBreadcrumb-Five";
import CourseBreadcrumbSix from "./Breadcrumb/CourseBreadcrumb-Six";
import CourseBreadcrumbSeven from "./Breadcrumb/CourseBreadcrumb-Seven";

const CourseHead = ({ checkMatch }) => {
  const pathname = usePathname();
  const path = useParams();

  return (
    <>
      {pathname === `/course-detail-2/${path.courseId}` ? (
        <div className="container">
          <div className="row">
            <CourseBreadcrumbTwo getMatchCourse={checkMatch && checkMatch} />
          </div>
        </div>
      ) : (
        ""
      )}

      {pathname === `/course-details/${path.courseId}` ? (
        <>
          <div className="breadcrumb-inner breadcrumb-dark">
            <Image
              src={bgImage}
              width={1425}
              height={583}
              unoptimized={true}
              alt="Education Images"
            />
          </div>
          <div className="container">
            <div className="row">
              <CourseBreadcrumb getMatchCourse={checkMatch && checkMatch} />
            </div>
          </div>
        </>
      ) : (
        ""
      )}

      {pathname === `/course-detail-3/${path.courseId}` ? (
        <>
          <div className="breadcrumb-inner">
            <Image
              src={bgImage2}
              width={1425}
              height={460}
              unoptimized={true}
              alt="Education Images"
            />
          </div>
          <div className="container">
            <div className="row align-items-center">
              <CourseBreadcrumbThree
                getMatchCourse={checkMatch && checkMatch}
              />
            </div>
          </div>
        </>
      ) : (
        ""
      )}

      {pathname === `/course-detail-4/${path.courseId}` ? (
        <>
          <div className="breadcrumb-inner breadcrumb-inner-2">
            <Image
              src={bgImage3}
              width={1425}
              height={460}
              unoptimized={true}
              alt="Education Images"
            />
          </div>
          <div className="container">
            <div className="row">
              <CourseBreadcrumbFour getMatchCourse={checkMatch && checkMatch} />
            </div>
          </div>
        </>
      ) : (
        ""
      )}

      {pathname === `/course-detail-5/${path.courseId}` ? (
        <>
          <div className="container">
            <div className="row">
              <CourseBreadcrumbFive getMatchCourse={checkMatch && checkMatch} />
            </div>
          </div>
        </>
      ) : (
        ""
      )}

      {pathname === `/course-detail-6/${path.courseId}` ? (
        <>
          <div className="breadcrumb-inner">
            <Image
              src={bgImage2}
              width={1425}
              height={340}
              alt="Education Images"
            />
          </div>
          <div className="container">
            <div className="row">
              <CourseBreadcrumbSix getMatchCourse={checkMatch && checkMatch} />
            </div>
          </div>
        </>
      ) : (
        ""
      )}

      {pathname === `/course-detail-7/${path.courseId}` ? (
        <>
          <div className="container">
            <div className="row">
              <CourseBreadcrumbSeven
                getMatchCourse={checkMatch && checkMatch}
              />
            </div>
          </div>
        </>
      ) : (
        ""
      )}

      {pathname === `/course-detail-8/${path.courseId}` ? (
        <>
          <div className="container">
            <div className="row">
              <CourseBreadcrumbSeven
                getMatchCourse={checkMatch && checkMatch}
              />
            </div>
          </div>
        </>
      ) : (
        ""
      )}
    </>
  );
};

export default CourseHead;
