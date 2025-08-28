'use client';

import React from 'react';
// 기존 CounterWidget 재사용
import CounterWidget from '@/components/Instructor/Dashboard-Section/widgets/CounterWidget';

const AdminDashboard = ({ stats }) => {
  // stats가 없는 경우를 대비한 기본값 설정
  const displayStats = stats || {
    totalUsers: 0,
    totalInstructors: 0,
    totalStudents: 0,
    totalCourses: 0,
    activeCourses: 0,
    totalEnrollments: 0,
    newUsersToday: 0,
    activeUsersWeek: 0,
    totalRevenue: 0,
    platformHealth: 'good',
  };

  return (
    <>
      {/* Admin Dashboard Main Content */}
      <div className="rbt-dashboard-content bg-color-white rbt-shadow-box mb--60">
        <div className="content">
          <div className="section-title">
            <h4 className="rbt-title-style-3">Admin Dashboard</h4>
            <p className="b3 text-muted">Platform Overview and Statistics</p>
          </div>

          {/* User Statistics Row */}
          <div className="row g-5 mb--30">
            <div className="col-lg-4 col-md-4 col-sm-6 col-12">
              <CounterWidget
                counterStyle="two"
                styleClass="bg-primary-opacity"
                iconClass="bg-primary-opacity"
                numberClass="color-primary"
                icon="feather-users"
                title="Total Users"
                value={displayStats.totalUsers}
              />
            </div>

            <div className="col-lg-4 col-md-4 col-sm-6 col-12">
              <CounterWidget
                counterStyle="two"
                styleClass="bg-success-opacity"
                iconClass="bg-success-opacity"
                numberClass="color-success"
                icon="feather-award"
                title="Total Instructors"
                value={displayStats.totalInstructors}
              />
            </div>

            <div className="col-lg-4 col-md-4 col-sm-6 col-12">
              <CounterWidget
                counterStyle="two"
                styleClass="bg-violet-opacity"
                iconClass="bg-violet-opacity"
                numberClass="color-violet"
                icon="feather-book-open"
                title="Total Students"
                value={displayStats.totalStudents}
              />
            </div>
          </div>

          {/* Course Statistics Row */}
          <div className="row g-5 mb--30">
            <div className="col-lg-4 col-md-4 col-sm-6 col-12">
              <CounterWidget
                counterStyle="two"
                styleClass="bg-secondary-opacity"
                iconClass="bg-secondary-opacity"
                numberClass="color-secondary"
                icon="feather-grid"
                title="Total Courses"
                value={displayStats.totalCourses}
              />
            </div>

            <div className="col-lg-4 col-md-4 col-sm-6 col-12">
              <CounterWidget
                counterStyle="two"
                styleClass="bg-coral-opacity"
                iconClass="bg-coral-opacity"
                numberClass="color-coral"
                icon="feather-monitor"
                title="Active Courses"
                value={displayStats.activeCourses}
              />
            </div>

            <div className="col-lg-4 col-md-4 col-sm-6 col-12">
              <CounterWidget
                counterStyle="two"
                styleClass="bg-pink-opacity"
                iconClass="bg-pink-opacity"
                numberClass="color-pink"
                icon="feather-check-square"
                title="Total Enrollments"
                value={displayStats.totalEnrollments}
              />
            </div>
          </div>

          {/* Activity Statistics Row */}
          <div className="row g-5">
            <div className="col-lg-4 col-md-4 col-sm-6 col-12">
              <CounterWidget
                counterStyle="two"
                styleClass="bg-info-opacity"
                iconClass="bg-info-opacity"
                numberClass="color-info"
                icon="feather-user-plus"
                title="New Users Today"
                value={displayStats.newUsersToday}
              />
            </div>

            <div className="col-lg-4 col-md-4 col-sm-6 col-12">
              <CounterWidget
                counterStyle="two"
                styleClass="bg-warning-opacity"
                iconClass="bg-warning-opacity"
                numberClass="color-warning"
                icon="feather-activity"
                title="Active This Week"
                value={displayStats.activeUsersWeek}
              />
            </div>

            <div className="col-lg-4 col-md-4 col-sm-6 col-12">
              <CounterWidget
                counterStyle="two"
                styleClass="bg-success-opacity"
                iconClass="bg-success-opacity"
                numberClass="color-success"
                icon="feather-dollar-sign"
                title="Total Revenue"
                value={`$${displayStats.totalRevenue.toLocaleString()}`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Platform Health Status */}
      <div className="rbt-dashboard-content bg-color-white rbt-shadow-box mb--60">
        <div className="content">
          <div className="section-title mb--30">
            <h4 className="rbt-title-style-3">System Status</h4>
          </div>
          
          <div className="row g-5">
            <div className="col-12">
              <div className={`alert ${
                displayStats.platformHealth === 'good' ? 'alert-success' : 
                displayStats.platformHealth === 'warning' ? 'alert-warning' : 
                'alert-danger'
              }`} role="alert">
                <h5 className="alert-heading">
                  <i className={`feather ${
                    displayStats.platformHealth === 'good' ? 'feather-check-circle' : 
                    displayStats.platformHealth === 'warning' ? 'feather-alert-triangle' : 
                    'feather-alert-circle'
                  }`} /> Platform Health: {displayStats.platformHealth?.toUpperCase()}
                </h5>
                <p className="mb-0">
                  All systems are operational. Last checked: {new Date(displayStats.lastUpdate).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rbt-dashboard-content bg-color-white rbt-shadow-box">
        <div className="content">
          <div className="section-title mb--30">
            <h4 className="rbt-title-style-3">Quick Actions</h4>
          </div>
          
          <div className="row g-5">
            <div className="col-lg-3 col-md-6">
              <a href="/admin-users" className="rbt-btn btn-gradient hover-icon-reverse w-100">
                <span className="icon-reverse-wrapper">
                  <span className="btn-text">Manage Users</span>
                  <span className="btn-icon"><i className="feather-users" /></span>
                  <span className="btn-icon"><i className="feather-users" /></span>
                </span>
              </a>
            </div>
            
            <div className="col-lg-3 col-md-6">
              <a href="/admin-courses" className="rbt-btn btn-gradient hover-icon-reverse w-100">
                <span className="icon-reverse-wrapper">
                  <span className="btn-text">Manage Courses</span>
                  <span className="btn-icon"><i className="feather-grid" /></span>
                  <span className="btn-icon"><i className="feather-grid" /></span>
                </span>
              </a>
            </div>
            
            <div className="col-lg-3 col-md-6">
              <a href="/admin-analytics" className="rbt-btn btn-gradient hover-icon-reverse w-100">
                <span className="icon-reverse-wrapper">
                  <span className="btn-text">View Analytics</span>
                  <span className="btn-icon"><i className="feather-bar-chart-2" /></span>
                  <span className="btn-icon"><i className="feather-bar-chart-2" /></span>
                </span>
              </a>
            </div>
            
            <div className="col-lg-3 col-md-6">
              <a href="/admin-settings" className="rbt-btn btn-gradient hover-icon-reverse w-100">
                <span className="icon-reverse-wrapper">
                  <span className="btn-text">System Settings</span>
                  <span className="btn-icon"><i className="feather-settings" /></span>
                  <span className="btn-icon"><i className="feather-settings" /></span>
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;