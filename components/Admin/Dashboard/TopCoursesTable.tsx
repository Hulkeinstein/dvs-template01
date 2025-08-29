'use client';

import React, { useState } from 'react';
import { TopCourse } from '@/types/dashboard';

interface Props {
  courses: TopCourse[];
}

type SortField = 'title' | 'enrollments' | 'revenue' | 'rating';
type SortOrder = 'asc' | 'desc';

const TopCoursesTable: React.FC<Props> = ({ courses }) => {
  const [sortField, setSortField] = useState<SortField>('enrollments');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const sortedCourses = [...courses].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (typeof aValue === 'string') {
      return sortOrder === 'asc'
        ? aValue.localeCompare(bValue as string)
        : (bValue as string).localeCompare(aValue);
    }

    return sortOrder === 'asc'
      ? (aValue as number) - (bValue as number)
      : (bValue as number) - (aValue as number);
  });

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return 'feather-chevron-down text-muted';
    return sortOrder === 'asc' ? 'feather-chevron-up' : 'feather-chevron-down';
  };

  const getStatusBadge = (status: TopCourse['status']) => {
    const badges = {
      active: 'badge-success-soft',
      pending: 'badge-warning-soft',
      archived: 'badge-secondary-soft',
    };
    return badges[status] || 'badge-secondary-soft';
  };

  const renderRating = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(rating)) {
        stars.push(
          <i key={i} className="feather-star text-warning fill-warning"></i>
        );
      } else if (i - 0.5 <= rating) {
        stars.push(<i key={i} className="feather-star text-warning"></i>);
      } else {
        stars.push(<i key={i} className="feather-star text-muted"></i>);
      }
    }
    return (
      <div className="d-flex align-items-center">
        {stars}
        <small className="ms-2">({rating.toFixed(1)})</small>
      </div>
    );
  };

  return (
    <div className="rbt-dashboard-content bg-color-white rbt-shadow-box mb--60">
      <div className="content">
        <div className="section-title mb--30">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h4 className="rbt-title-style-3">Top Performing Courses</h4>
              <p className="b3 text-muted">Courses with highest engagement</p>
            </div>
            <a
              href="/admin-courses"
              className="rbt-btn btn-sm btn-outline-primary"
            >
              View All Courses
            </a>
          </div>
        </div>

        <div className="rbt-dashboard-table table-responsive">
          <table className="rbt-table table table-borderless">
            <thead>
              <tr className="border-bottom">
                <th
                  className="cursor-pointer"
                  onClick={() => handleSort('title')}
                >
                  Course Name
                  <i className={`ms-1 ${getSortIcon('title')}`}></i>
                </th>
                <th>Instructor</th>
                <th
                  className="cursor-pointer text-center"
                  onClick={() => handleSort('enrollments')}
                >
                  Enrollments
                  <i className={`ms-1 ${getSortIcon('enrollments')}`}></i>
                </th>
                <th
                  className="cursor-pointer text-end"
                  onClick={() => handleSort('revenue')}
                >
                  Revenue
                  <i className={`ms-1 ${getSortIcon('revenue')}`}></i>
                </th>
                <th
                  className="cursor-pointer text-center"
                  onClick={() => handleSort('rating')}
                >
                  Rating
                  <i className={`ms-1 ${getSortIcon('rating')}`}></i>
                </th>
                <th className="text-center">Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedCourses.length > 0 ? (
                sortedCourses.map((course) => (
                  <tr key={course.id}>
                    <td>
                      <div>
                        <p className="mb-0 fw-bold">{course.title}</p>
                        <small className="text-muted">
                          ID: {course.id.substring(0, 8)}
                        </small>
                      </div>
                    </td>
                    <td>
                      <p className="mb-0">{course.instructor}</p>
                    </td>
                    <td className="text-center">
                      <span className="badge badge-primary-soft">
                        {course.enrollments}
                      </span>
                    </td>
                    <td className="text-end">
                      <strong className="color-success">
                        ${course.revenue.toLocaleString()}
                      </strong>
                    </td>
                    <td className="text-center">
                      {renderRating(course.rating)}
                    </td>
                    <td className="text-center">
                      <span
                        className={`badge ${getStatusBadge(course.status)}`}
                      >
                        {course.status}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="btn-group">
                        <button className="rbt-btn btn-xs btn-outline-primary">
                          <i className="feather-eye"></i>
                        </button>
                        <button className="rbt-btn btn-xs btn-outline-secondary ms-1">
                          <i className="feather-edit"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-5">
                    <i
                      className="feather-grid mb-3"
                      style={{ fontSize: '2rem' }}
                    ></i>
                    <p>No courses available</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TopCoursesTable;
