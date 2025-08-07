'use client';

import React from 'react';
// 원래 템플릿에서 사용하던 CounterWidget 컴포넌트를 그대로 import합니다.
import CounterWidget from './Dashboard-Section/widgets/CounterWidget';
import MyCourses from './Dashboard-Section/MyCourses';

// 이 컴포넌트는 이제 부모로부터 stats prop을 전달받습니다.
const Dashboard = ({ stats }) => {
  // stats가 없는 경우를 대비하여 기본값을 설정합니다.
  const displayStats = stats || {
    enrolledCourses: 0,
    activeCourses: 0,
    completedCourses: 0,
    totalStudents: 0,
    totalCourses: 0,
    totalEarnings: 0,
  };

  return (
    <>
      {/* --- 원래 코드의 전체적인 구조와 클래스를 그대로 유지합니다. --- */}
      <div className="rbt-dashboard-content bg-color-white rbt-shadow-box mb--60">
        <div className="content">
          <div className="section-title">
            <h4 className="rbt-title-style-3">Dashboard</h4>
          </div>

          <div className="row g-5">
            {/* --- 각 CounterWidget에 빠졌던 iconClass, numberClass 등을 모두 복원했습니다. --- */}

            <div className="col-lg-4 col-md-4 col-sm-6 col-12">
              <CounterWidget
                counterStyle="two"
                styleClass="bg-primary-opacity"
                iconClass="bg-primary-opacity"
                numberClass="color-primary"
                icon="feather-book-open"
                title="Enrolled Courses"
                value={displayStats.enrolledCourses}
              />
            </div>

            <div className="col-lg-4 col-md-4 col-sm-6 col-12">
              <CounterWidget
                counterStyle="two"
                styleClass="bg-secondary-opacity"
                iconClass="bg-secondary-opacity"
                numberClass="color-secondary"
                icon="feather-monitor"
                title="ACTIVE COURSES"
                value={displayStats.activeCourses}
              />
            </div>

            <div className="col-lg-4 col-md-4 col-sm-6 col-12">
              <CounterWidget
                counterStyle="two"
                styleClass="bg-violet-opacity"
                iconClass="bg-violet-opacity"
                numberClass="color-violet"
                icon="feather-award"
                title="Completed Courses"
                value={displayStats.completedCourses}
              />
            </div>

            <div className="col-lg-4 col-md-4 col-sm-6 col-12">
              <CounterWidget
                counterStyle="two"
                styleClass="bg-pink-opacity"
                iconClass="bg-pink-opacity"
                numberClass="color-pink"
                icon="feather-users"
                title="Total Students"
                value={displayStats.totalStudents}
              />
            </div>

            <div className="col-lg-4 col-md-4 col-sm-6 col-12">
              <CounterWidget
                counterStyle="two"
                styleClass="bg-coral-opacity"
                iconClass="bg-coral-opacity"
                numberClass="color-coral"
                icon="feather-gift"
                title="Total Courses"
                value={displayStats.totalCourses}
              />
            </div>

            <div className="col-lg-4 col-md-4 col-sm-6 col-12">
              <CounterWidget
                counterStyle="two"
                styleClass="bg-warning-opacity"
                iconClass="bg-warning-opacity"
                numberClass="color-warning"
                icon="feather-dollar-sign"
                title="Total Earnings"
                value={displayStats.totalEarnings}
              />
            </div>
          </div>
        </div>
      </div>

      <MyCourses />
    </>
  );
};

export default Dashboard;
