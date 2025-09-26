'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  approveCourse,
  rejectCourse,
  getPendingCoursesCount,
} from '@/app/lib/actions/courseApprovalActions';
import { getAllCoursesWithDetails } from '@/app/lib/actions/courseActions';
import Link from 'next/link';
import Image from 'next/image';
import { CourseStatus, RejectCourseInput } from '@/types/course';

// Type definitions for the course data structure
interface CourseInstructor {
  id: string;
  name: string;
  avatar_url?: string;
}

interface CourseWithDetails {
  id: string;
  title: string;
  slug: string;
  description?: string;
  thumbnail_url?: string;
  courseThumbnail?: string; // Legacy field
  category?: string;
  status: CourseStatus;
  submitted_at?: string;
  review_notes?: string;
  instructor?: CourseInstructor;
  instructor_id: string;
  created_at: string;
  updated_at: string;
}

interface GetCoursesOptions {
  includePending?: boolean;
  includeRejected?: boolean;
  includeDraft?: boolean;
  onlyStatus?: CourseStatus[];
}

interface ApprovalResult {
  success?: boolean;
  message?: string;
  error?: string;
}

type FilterType = 'pending' | 'all' | 'rejected';

interface StatusBadge {
  color: string;
  text: string;
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<CourseWithDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<FilterType>('pending');
  const [rejectModalOpen, setRejectModalOpen] = useState<boolean>(false);
  const [selectedCourse, setSelectedCourse] =
    useState<CourseWithDetails | null>(null);
  const [rejectNotes, setRejectNotes] = useState<string>('');
  const [pendingCount, setPendingCount] = useState<number>(0);

  const loadCourses = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      let options: GetCoursesOptions = {};

      if (filter === 'pending') {
        options = { includePending: true, onlyStatus: ['pending'] };
      } else if (filter === 'rejected') {
        options = { includeRejected: true, onlyStatus: ['rejected'] };
      } else {
        options = {
          includePending: true,
          includeRejected: true,
          includeDraft: true,
        };
      }

      // TODO(ANY-TODO #001): getAllCoursesWithDetails needs proper typing
      const result = (await getAllCoursesWithDetails(options)) as unknown;

      // Filter courses based on selected filter
      let filteredCourses: CourseWithDetails[] = [];

      // Handle both response formats (array or object with courses property)
      if (result && typeof result === 'object' && 'courses' in result) {
        const typedResult = result as { courses: unknown[] };
        filteredCourses = typedResult.courses.map((course: unknown) => {
          const courseData = course as Record<string, unknown>;
          return {
            ...courseData,
            courseThumbnail: courseData.courseImg || courseData.thumbnail_url,
            instructor: courseData.instructor || {
              id: courseData.instructor_id,
              name: courseData.name || 'Unknown',
              avatar_url: courseData.userImg,
            },
          } as CourseWithDetails;
        });
      }

      if (filter === 'pending') {
        filteredCourses = filteredCourses.filter((c) => c.status === 'pending');
      } else if (filter === 'rejected') {
        filteredCourses = filteredCourses.filter(
          (c) => c.status === 'rejected'
        );
      }

      setCourses(filteredCourses);

      // Get pending count
      const count = await getPendingCoursesCount();
      setPendingCount(count);
    } catch (error) {
      console.error('Failed to load courses:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const handleApprove = async (courseId: string): Promise<void> => {
    if (confirm('이 코스를 승인하시겠습니까?')) {
      const result: ApprovalResult = await approveCourse(courseId);
      if (result.success) {
        alert(result.message);
        loadCourses();
      } else {
        alert(result.error || '승인 중 오류가 발생했습니다.');
      }
    }
  };

  const handleRejectClick = (course: CourseWithDetails): void => {
    setSelectedCourse(course);
    setRejectNotes('');
    setRejectModalOpen(true);
  };

  const handleRejectSubmit = async (): Promise<void> => {
    if (!rejectNotes.trim() || rejectNotes.length < 10) {
      alert('거부 사유를 10자 이상 입력해주세요.');
      return;
    }

    if (!selectedCourse) return;

    const rejectInput: RejectCourseInput = {
      courseId: selectedCourse.id,
      notes: rejectNotes,
    };

    const result: ApprovalResult = await rejectCourse(rejectInput);

    if (result.success) {
      alert(result.message);
      setRejectModalOpen(false);
      setSelectedCourse(null);
      setRejectNotes('');
      loadCourses();
    } else {
      alert(result.error || '거부 처리 중 오류가 발생했습니다.');
    }
  };

  const getStatusBadge = (status: CourseStatus): JSX.Element => {
    const badges: Record<CourseStatus, StatusBadge> = {
      draft: { color: 'bg-secondary', text: 'Draft' },
      pending: { color: 'bg-warning', text: 'Pending Review' },
      published: { color: 'bg-success', text: 'Published' },
      rejected: { color: 'bg-danger', text: 'Rejected' },
      archived: { color: 'bg-dark', text: 'Archived' },
    };
    const badge = badges[status] || badges.draft;
    return (
      <span className={`badge ${badge.color} text-white`}>{badge.text}</span>
    );
  };

  return (
    <div className="rbt-dashboard-content bg-color-white rbt-shadow-box">
      <div className="content">
        <div className="section-title">
          <h4 className="rbt-title-style-3">Course Approval Management</h4>
        </div>

        {/* Filter Tabs */}
        <div className="mb-4">
          <ul className="nav nav-tabs">
            <li className="nav-item">
              <button
                className={`nav-link ${filter === 'pending' ? 'active' : ''}`}
                onClick={() => setFilter('pending')}
              >
                Pending Review
                {pendingCount > 0 && (
                  <span className="badge bg-warning ms-2">{pendingCount}</span>
                )}
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All Courses
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${filter === 'rejected' ? 'active' : ''}`}
                onClick={() => setFilter('rejected')}
              >
                Rejected
              </button>
            </li>
          </ul>
        </div>

        {/* Courses Table */}
        <div className="rbt-dashboard-table table-responsive">
          {loading ? (
            <div className="text-center p-5">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center p-5">
              <p>No courses found.</p>
            </div>
          ) : (
            <table className="rbt-table table table-borderless table-hover">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Instructor</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        {(course.courseThumbnail || course.thumbnail_url) && (
                          <div
                            className="thumbnail me-3"
                            style={{
                              width: '60px',
                              height: '40px',
                              position: 'relative',
                            }}
                          >
                            <Image
                              src={
                                course.courseThumbnail ||
                                course.thumbnail_url ||
                                ''
                              }
                              alt={course.title}
                              fill
                              style={{ objectFit: 'cover' }}
                              className="rounded"
                            />
                          </div>
                        )}
                        <div>
                          <Link
                            href={`/courses/${course.id}`}
                            className="text-decoration-none"
                          >
                            <strong>{course.title}</strong>
                          </Link>
                          {course.review_notes &&
                            course.status === 'rejected' && (
                              <div className="text-danger small mt-1">
                                <i className="feather-alert-circle me-1"></i>
                                {course.review_notes}
                              </div>
                            )}
                        </div>
                      </div>
                    </td>
                    <td>{course.instructor?.name || 'Unknown'}</td>
                    <td>{course.category || '-'}</td>
                    <td>{getStatusBadge(course.status)}</td>
                    <td>
                      {course.submitted_at
                        ? new Date(course.submitted_at).toLocaleDateString()
                        : '-'}
                    </td>
                    <td>
                      {course.status === 'pending' && (
                        <div className="btn-group" role="group">
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => handleApprove(course.id)}
                          >
                            <i className="feather-check me-1"></i>
                            Approve
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleRejectClick(course)}
                          >
                            <i className="feather-x me-1"></i>
                            Reject
                          </button>
                        </div>
                      )}
                      {course.status === 'rejected' && (
                        <button
                          className="btn btn-sm btn-info"
                          onClick={() => handleApprove(course.id)}
                        >
                          <i className="feather-check me-1"></i>
                          Approve Now
                        </button>
                      )}
                      <Link
                        href={`/courses/${course.id}`}
                        className="btn btn-sm btn-outline-secondary ms-2"
                      >
                        <i className="feather-eye"></i>
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Reject Modal */}
        {rejectModalOpen && (
          <div
            className="modal show d-block"
            tabIndex={-1}
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          >
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Reject Course</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setRejectModalOpen(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <p>
                    <strong>Course:</strong> {selectedCourse?.title}
                  </p>
                  <div className="mb-3">
                    <label className="form-label">
                      Rejection Reason (Required)
                    </label>
                    <textarea
                      className="form-control"
                      rows={4}
                      value={rejectNotes}
                      onChange={(e) => setRejectNotes(e.target.value)}
                      placeholder="Please provide a detailed reason for rejection (minimum 10 characters)"
                    ></textarea>
                    <small className="text-muted">
                      This will be sent to the instructor
                    </small>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setRejectModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleRejectSubmit}
                    disabled={!rejectNotes.trim() || rejectNotes.length < 10}
                  >
                    Reject Course
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
