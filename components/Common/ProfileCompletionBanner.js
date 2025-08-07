'use client';

import Link from 'next/link';
import { useState } from 'react';

const ProfileCompletionBanner = ({ userProfile }) => {
  const [dismissed, setDismissed] = useState(false);

  // 프로필이 이미 완성된 경우 배너를 표시하지 않음
  if (userProfile?.is_profile_complete || dismissed) {
    return null;
  }

  // 누락된 선택 필드 확인
  const missingFields = [];
  if (!userProfile?.skill_occupation) missingFields.push('skill/occupation');
  if (!userProfile?.bio) missingFields.push('biography');

  // 전화번호가 없는 경우 배너를 표시하지 않음
  if (!userProfile?.phone) {
    return null;
  }

  return (
    <div className="rbt-dashboard-content-wrapper">
      <div className="tutor-bg-photo bg-color-darker height-200 position-relative">
        <div className="info-banner-wrapper">
          <div className="row align-items-center">
            <div className="col-lg-8 col-md-8">
              <div className="info-banner">
                <div className="info-icon">
                  <i className="feather-info"></i>
                </div>
                <div className="info-content">
                  <h6 className="mb-0">Complete Your Profile</h6>
                  <p className="mb-0">
                    Add your {missingFields.join(' and ')} to help others know
                    you better.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-4">
              <div className="info-action text-md-end">
                <Link
                  href="/instructor-profile"
                  className="rbt-btn btn-sm hover-icon-reverse"
                >
                  <span className="icon-reverse-wrapper">
                    <span className="btn-text">Complete Profile</span>
                    <span className="btn-icon">
                      <i className="feather-arrow-right"></i>
                    </span>
                    <span className="btn-icon">
                      <i className="feather-arrow-right"></i>
                    </span>
                  </span>
                </Link>
                <button
                  onClick={() => setDismissed(true)}
                  className="rbt-btn btn-sm minimal-btn ms-2"
                  aria-label="Dismiss"
                >
                  <i className="feather-x"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCompletionBanner;
