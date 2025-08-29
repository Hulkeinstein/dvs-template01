'use client';

import React, { useEffect, useState } from 'react';
import { AdminDashboardData } from '@/types/dashboard';
import { getAdminDashboardData } from '../actions/getAdminDashData';
import KPICard from '@/components/Admin/Dashboard/KPICard';
import UserGrowthChart from '@/components/Admin/Dashboard/UserGrowthChart';
import RevenueChart from '@/components/Admin/Dashboard/RevenueChart';
import CourseDistribution from '@/components/Admin/Dashboard/CourseDistribution';
import CourseBarChart from '@/components/Admin/Dashboard/CourseBarChart';
import RecentActivity from '@/components/Admin/Dashboard/RecentActivity';
import TopCoursesTable from '@/components/Admin/Dashboard/TopCoursesTable';
import SystemMetrics from '@/components/Admin/Dashboard/SystemMetrics';

const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const dashboardData = await getAdminDashboardData();
        setData(dashboardData);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Refresh data every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="rbt-dashboard-content bg-color-white rbt-shadow-box">
        <div className="content">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rbt-dashboard-content bg-color-white rbt-shadow-box">
        <div className="content">
          <div className="alert alert-danger" role="alert">
            <h4 className="alert-heading">Error Loading Dashboard</h4>
            <p>{error || 'Unable to load dashboard data'}</p>
            <hr />
            <button
              className="rbt-btn btn-sm btn-primary"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Admin Dashboard Header */}
      <div className="rbt-dashboard-content bg-color-white rbt-shadow-box mb--60">
        <div className="content">
          <div className="section-title">
            <h4 className="rbt-title-style-3">Admin Dashboard</h4>
            <p className="b3 text-muted">
              Platform Overview • Last updated:{' '}
              {new Date(data.lastUpdated).toLocaleTimeString()}
            </p>
          </div>

          {/* KPI Cards */}
          <div className="row g-5">
            {data.kpis.map((kpi, index) => (
              <div key={index} className="col-lg-3 col-md-6 col-sm-6 col-12">
                <KPICard data={kpi} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="row g-5 mb--60">
        <div className="col-lg-8">
          <UserGrowthChart data={data.userGrowthData} />
        </div>
        <div className="col-lg-4">
          <CourseDistribution data={data.courseDistribution} />
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="row g-5 mb--60">
        <div className="col-lg-7">
          <RevenueChart data={data.revenueData} />
        </div>
        <div className="col-lg-5">
          <CourseBarChart data={data.courseBarData} />
        </div>
      </div>

      {/* Tables and Activity */}
      <div className="row g-5 mb--60">
        <div className="col-lg-8">
          <TopCoursesTable courses={data.topCourses} />
        </div>
        <div className="col-lg-4">
          <RecentActivity activities={data.recentActivity} />
        </div>
      </div>

      {/* System Metrics */}
      <SystemMetrics />

      {/* Quick Actions */}
      <div className="rbt-dashboard-content bg-color-white rbt-shadow-box mt--60">
        <div className="content">
          <div className="section-title mb--30">
            <h4 className="rbt-title-style-3">Quick Actions</h4>
          </div>

          <div className="row g-5">
            <div className="col-lg-3 col-md-6">
              <a
                href="/admin-users"
                className="rbt-btn btn-gradient hover-icon-reverse w-100"
              >
                <span className="icon-reverse-wrapper">
                  <span className="btn-text">Manage Users</span>
                  <span className="btn-icon">
                    <i className="feather-users" />
                  </span>
                  <span className="btn-icon">
                    <i className="feather-users" />
                  </span>
                </span>
              </a>
            </div>

            <div className="col-lg-3 col-md-6">
              <a
                href="/admin-courses"
                className="rbt-btn btn-gradient hover-icon-reverse w-100"
              >
                <span className="icon-reverse-wrapper">
                  <span className="btn-text">Manage Courses</span>
                  <span className="btn-icon">
                    <i className="feather-grid" />
                  </span>
                  <span className="btn-icon">
                    <i className="feather-grid" />
                  </span>
                </span>
              </a>
            </div>

            <div className="col-lg-3 col-md-6">
              <a
                href="/admin-analytics"
                className="rbt-btn btn-gradient hover-icon-reverse w-100"
              >
                <span className="icon-reverse-wrapper">
                  <span className="btn-text">View Analytics</span>
                  <span className="btn-icon">
                    <i className="feather-bar-chart-2" />
                  </span>
                  <span className="btn-icon">
                    <i className="feather-bar-chart-2" />
                  </span>
                </span>
              </a>
            </div>

            <div className="col-lg-3 col-md-6">
              <a
                href="/admin-settings"
                className="rbt-btn btn-gradient hover-icon-reverse w-100"
              >
                <span className="icon-reverse-wrapper">
                  <span className="btn-text">System Settings</span>
                  <span className="btn-icon">
                    <i className="feather-settings" />
                  </span>
                  <span className="btn-icon">
                    <i className="feather-settings" />
                  </span>
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
