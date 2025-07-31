"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getUserCertificates } from "@/app/lib/certificate/actions/certificateActions";
import { isFeatureEnabled } from "@/app/lib/certificate/utils/featureFlags";

const StudentDashboardHeader = ({ userId, userProfile }) => {
  const [certificateCount, setCertificateCount] = useState(0);
  const [enrolledCount, setEnrolledCount] = useState(5); // Default value

  useEffect(() => {
    if (userId && isFeatureEnabled('CERTIFICATE_ENABLED')) {
      loadCertificateCount();
    }
  }, [userId]);

  const loadCertificateCount = async () => {
    try {
      const result = await getUserCertificates(userId);
      if (result.success) {
        setCertificateCount(result.certificates.length);
      }
    } catch (error) {
      console.error('Error loading certificate count:', error);
    }
  };

  return (
    <>
      <div className="rbt-dashboard-content-wrapper">
        <div className="tutor-bg-photo bg_image bg_image--23 height-350" />
        <div className="rbt-tutor-information">
          <div className="rbt-tutor-information-left">
            <div className="thumbnail rbt-avatars size-lg">
              <Image
                width={300}
                height={300}
                src="/images/team/avatar-2.jpg"
                alt="Instructor"
              />
            </div>
            <div className="tutor-content">
              <h5 className="title">{userProfile?.full_name || "Student"}</h5>
              <ul className="rbt-meta rbt-meta-white mt--5">
                <li>
                  <i className="feather-book"></i>{enrolledCount} Courses Enrolled
                </li>
                <li>
                  <i className="feather-award"></i>{certificateCount} Certificate{certificateCount !== 1 ? 's' : ''}
                </li>
              </ul>
            </div>
          </div>
          <div className="rbt-tutor-information-right">
            <div className="tutor-btn">
              <Link className="rbt-btn btn-md hover-icon-reverse" href="#">
                <span className="icon-reverse-wrapper">
                  <span className="btn-text">Create Link New Course</span>
                  <span className="btn-icon">
                    <i className="feather-arrow-right" />
                  </span>
                  <span className="btn-icon">
                    <i className="feather-arrow-right" />
                  </span>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentDashboardHeader;
