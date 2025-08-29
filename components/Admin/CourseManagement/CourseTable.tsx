'use client';

import React, { useState, useTransition } from 'react';
import { formatDistanceToNow } from 'date-fns';
import type { AdminCourse, CourseStatus } from '@/types/admin-course';
import {
  updateCourseStatus,
  updateCoursePrice,
  updateCourseCategory,
  toggleCourseFeatured,
} from '@/app/(dashboard)/(admin)/admin-courses/actions';

interface CourseTableProps {
  initialCourses: AdminCourse[];
  total: number;
  currentPage: number;
  limit: number;
  totalPages: number;
}

export default function CourseTable({
  initialCourses,
  total,
  currentPage,
  limit,
  totalPages,
}: CourseTableProps) {
  const [courses, setCourses] = useState(initialCourses);
  const [isPending, startTransition] = useTransition();
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(
    new Set()
  );

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedCourses(new Set(courses.map((c) => c.id)));
    } else {
      setSelectedCourses(new Set());
    }
  };

  const handleSelectCourse = (courseId: string) => {
    const newSelected = new Set(selectedCourses);
    if (newSelected.has(courseId)) {
      newSelected.delete(courseId);
    } else {
      newSelected.add(courseId);
    }
    setSelectedCourses(newSelected);
  };

  const handleStatusChange = async (
    course: AdminCourse,
    newStatus: CourseStatus
  ) => {
    if (
      !confirm(
        `Are you sure you want to change the status of "${course.title}" to ${newStatus}?`
      )
    ) {
      return;
    }

    startTransition(async () => {
      const result = await updateCourseStatus(course.id, newStatus);
      if (result.success) {
        setCourses((prev) =>
          prev.map((c) =>
            c.id === course.id ? { ...c, status: newStatus } : c
          )
        );
      } else {
        alert(`Failed to update status: ${result.error}`);
      }
    });
  };

  const handlePriceChange = async (course: AdminCourse) => {
    const newPriceStr = prompt(
      'Enter new price:',
      course.price?.toString() || '0'
    );
    if (!newPriceStr) return;

    const newPrice = parseFloat(newPriceStr);
    if (isNaN(newPrice) || newPrice < 0) {
      alert('Please enter a valid price');
      return;
    }

    startTransition(async () => {
      const result = await updateCoursePrice(course.id, newPrice);
      if (result.success) {
        setCourses((prev) =>
          prev.map((c) => (c.id === course.id ? { ...c, price: newPrice } : c))
        );
      } else {
        alert(`Failed to update price: ${result.error}`);
      }
    });
  };

  const handleCategoryChange = async (course: AdminCourse) => {
    const newCategory = prompt('Enter new category:', course.category || '');
    if (!newCategory) return;

    startTransition(async () => {
      const result = await updateCourseCategory(course.id, newCategory);
      if (result.success) {
        setCourses((prev) =>
          prev.map((c) =>
            c.id === course.id ? { ...c, category: newCategory } : c
          )
        );
      } else {
        alert(`Failed to update category: ${result.error}`);
      }
    });
  };

  const handleToggleFeatured = async (course: AdminCourse) => {
    startTransition(async () => {
      const result = await toggleCourseFeatured(course.id);
      if (result.success) {
        setCourses((prev) =>
          prev.map((c) =>
            c.id === course.id ? { ...c, is_featured: !c.is_featured } : c
          )
        );
      } else {
        alert(`Failed to toggle featured status: ${result.error}`);
      }
    });
  };

  const getStatusBadgeClass = (status: CourseStatus) => {
    switch (status) {
      case 'published':
        return 'bg-success';
      case 'draft':
        return 'bg-warning';
      case 'archived':
        return 'bg-secondary';
      default:
        return 'bg-light text-dark';
    }
  };

  return (
    <div className="rbt-dashboard-table table-responsive">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="text-muted">
          Showing {(currentPage - 1) * limit + 1}-
          {Math.min(currentPage * limit, total)} of {total} courses
        </div>
        {selectedCourses.size > 0 && (
          <div className="text-primary">
            {selectedCourses.size} course(s) selected
          </div>
        )}
      </div>

      <table className="rbt-table table table-borderless table-header-align">
        <thead>
          <tr>
            <th className="text-center">
              <input
                type="checkbox"
                className="form-check-input"
                checked={
                  selectedCourses.size === courses.length && courses.length > 0
                }
                onChange={handleSelectAll}
              />
            </th>
            <th className="text-start">Course</th>
            <th className="text-start">Instructor</th>
            <th className="text-center">Category</th>
            <th className="text-end">Price</th>
            <th className="text-center">Status</th>
            <th className="text-center">Featured</th>
            <th className="text-center">Enrollments</th>
            <th className="text-end">Revenue</th>
            <th className="text-start">Created</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => (
            <tr key={course.id}>
              <td className="text-center">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={selectedCourses.has(course.id)}
                  onChange={() => handleSelectCourse(course.id)}
                />
              </td>
              <td>
                <div className="d-flex align-items-center">
                  {course.thumbnail_url ? (
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="rounded me-3"
                      style={{
                        width: 60,
                        height: 40,
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <div
                      className="bg-light rounded me-3 d-flex align-items-center justify-content-center"
                      style={{ width: 60, height: 40 }}
                    >
                      <i className="feather-image text-muted"></i>
                    </div>
                  )}
                  <div>
                    <div className="fw-medium">{course.title}</div>
                    <small className="text-muted">
                      {course.difficulty_level || 'All Levels'}
                    </small>
                  </div>
                </div>
              </td>
              <td>
                <div className="d-flex align-items-center">
                  <img
                    src={
                      course.instructor_info?.avatar_url ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        course.instructor_info?.name || 'Unknown'
                      )}&background=2f57ef&color=fff`
                    }
                    alt={course.instructor_info?.name}
                    className="rounded-circle me-2"
                    style={{ width: 32, height: 32, objectFit: 'cover' }}
                  />
                  <div>
                    <div className="small fw-medium">
                      {course.instructor_info?.name || 'Unknown'}
                    </div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                      {course.instructor_info?.email}
                    </div>
                  </div>
                </div>
              </td>
              <td className="text-center">
                <span
                  className="badge bg-light text-dark"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleCategoryChange(course)}
                >
                  {course.category || 'Uncategorized'}
                  <i
                    className="feather-edit-2 ms-1"
                    style={{ fontSize: '10px' }}
                  ></i>
                </span>
              </td>
              <td className="text-end">
                <span
                  style={{ cursor: 'pointer' }}
                  onClick={() => handlePriceChange(course)}
                  className="text-primary"
                >
                  ${course.price || 0}
                  <i
                    className="feather-edit-2 ms-1"
                    style={{ fontSize: '10px' }}
                  ></i>
                </span>
              </td>
              <td className="text-center">
                <span className={`badge ${getStatusBadgeClass(course.status)}`}>
                  {course.status}
                </span>
              </td>
              <td className="text-center">
                <button
                  className="btn btn-sm"
                  onClick={() => handleToggleFeatured(course)}
                  disabled={isPending}
                  style={{ padding: '2px 8px' }}
                >
                  {course.is_featured ? (
                    <i className="feather-star text-warning"></i>
                  ) : (
                    <i className="feather-star"></i>
                  )}
                </button>
              </td>
              <td className="text-center">
                <span className="badge bg-info">
                  {course.actual_enrollment_count || 0}
                </span>
              </td>
              <td className="text-end">${course.estimated_revenue || 0}</td>
              <td>
                <small className="text-muted">
                  {formatDistanceToNow(new Date(course.created_at), {
                    addSuffix: true,
                  })}
                </small>
              </td>
              <td className="text-center">
                <div className="dropdown">
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    disabled={isPending}
                  >
                    <i className="feather-more-vertical"></i>
                  </button>
                  <ul className="dropdown-menu">
                    <li>
                      <a
                        className="dropdown-item"
                        href={`/courses/${course.id}`}
                        target="_blank"
                      >
                        <i className="feather-eye me-2"></i>
                        View
                      </a>
                    </li>
                    <li>
                      <a
                        className="dropdown-item"
                        href={`/instructor/courses/${course.id}/edit`}
                      >
                        <i className="feather-edit me-2"></i>
                        Edit
                      </a>
                    </li>
                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                    {course.status === 'draft' && (
                      <li>
                        <button
                          className="dropdown-item text-success"
                          onClick={() =>
                            handleStatusChange(course, 'published')
                          }
                        >
                          <i className="feather-check-circle me-2"></i>
                          Publish
                        </button>
                      </li>
                    )}
                    {course.status === 'published' && (
                      <li>
                        <button
                          className="dropdown-item text-warning"
                          onClick={() => handleStatusChange(course, 'draft')}
                        >
                          <i className="feather-eye-off me-2"></i>
                          Unpublish
                        </button>
                      </li>
                    )}
                    {course.status !== 'archived' && (
                      <li>
                        <button
                          className="dropdown-item text-danger"
                          onClick={() => handleStatusChange(course, 'archived')}
                        >
                          <i className="feather-archive me-2"></i>
                          Archive
                        </button>
                      </li>
                    )}
                    {course.status === 'archived' && (
                      <li>
                        <button
                          className="dropdown-item"
                          onClick={() => handleStatusChange(course, 'draft')}
                        >
                          <i className="feather-refresh-cw me-2"></i>
                          Restore
                        </button>
                      </li>
                    )}
                  </ul>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {courses.length === 0 && (
        <div className="text-center py-5">
          <i className="feather-inbox mb-3" style={{ fontSize: '3rem' }}></i>
          <p className="text-muted">No courses found</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-4">
          <div className="text-muted">
            Page {currentPage} of {totalPages}
          </div>
          <nav>
            <ul className="pagination mb-0">
              <li
                className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}
              >
                <a
                  className="page-link"
                  href={`?page=${currentPage - 1}`}
                  aria-label="Previous"
                >
                  <span aria-hidden="true">&laquo;</span>
                </a>
              </li>
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const pageNum = i + 1;
                return (
                  <li
                    key={pageNum}
                    className={`page-item ${currentPage === pageNum ? 'active' : ''}`}
                  >
                    <a className="page-link" href={`?page=${pageNum}`}>
                      {pageNum}
                    </a>
                  </li>
                );
              })}
              <li
                className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}
              >
                <a
                  className="page-link"
                  href={`?page=${currentPage + 1}`}
                  aria-label="Next"
                >
                  <span aria-hidden="true">&raquo;</span>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
}
