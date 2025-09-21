'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState, useMemo } from 'react';
import { getEnrolledCoursesRPC } from '@/app/lib/actions/studentDashboardActions';
import {
  updateEnrollmentProgress,
  unenrollFromCourse,
} from '@/app/lib/actions/enrollmentActions';
import { ROUTES } from '@/app/lib/constants/routes';

interface EnrolledCoursesProps {
  userId?: string;
}

interface EnrolledCourse {
  id: string;
  course_id: string;
  progress: number;
  enrolled_at: string;
  last_accessed_at: string | null;
  status: 'active' | 'completed' | 'paused';
  course: {
    id: string;
    title: string;
    description: string;
    thumbnail_url: string | null;
    instructor_id: string;
    instructor: {
      id: string;
      name: string;
      avatar_url: string | null;
    };
    total_lessons: number;
  };
  completed_lessons: number;
}

type SortOption = 'recent' | 'progress' | 'alphabetical' | 'enrolled';
type FilterOption = 'all' | 'active' | 'completed' | 'paused';

const EnrolledCoursesEnhanced = ({ userId }: EnrolledCoursesProps) => {
  const [allCourses, setAllCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [coursesPerPage] = useState(6);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const courses = await getEnrolledCoursesRPC(userId);
        setAllCourses(courses);
      } catch (error) {
        console.error('Error fetching enrolled courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [userId]);

  // Filter and search logic
  const filteredAndSortedCourses = useMemo(() => {
    let filtered = [...allCourses];

    // Apply filter
    if (filterBy !== 'all') {
      filtered = filtered.filter((course) => course.status === filterBy);
    }

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(
        (course) =>
          course.course.title
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          course.course.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          course.course.instructor.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return (
            new Date(b.last_accessed_at || b.enrolled_at).getTime() -
            new Date(a.last_accessed_at || a.enrolled_at).getTime()
          );
        case 'progress':
          return b.progress - a.progress;
        case 'alphabetical':
          return a.course.title.localeCompare(b.course.title);
        case 'enrolled':
          return (
            new Date(b.enrolled_at).getTime() -
            new Date(a.enrolled_at).getTime()
          );
        default:
          return 0;
      }
    });

    return filtered;
  }, [allCourses, filterBy, searchTerm, sortBy]);

  // Pagination logic
  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = filteredAndSortedCourses.slice(
    indexOfFirstCourse,
    indexOfLastCourse
  );
  const totalPages = Math.ceil(
    filteredAndSortedCourses.length / coursesPerPage
  );

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStatusChange = async (
    enrollmentId: string,
    newStatus: 'active' | 'completed' | 'paused'
  ) => {
    setActionLoading(enrollmentId);
    try {
      const result = await updateEnrollmentProgress({
        enrollmentId,
        status: newStatus,
        progress: newStatus === 'completed' ? 100 : undefined,
      });

      if (result.success) {
        // Update local state
        setAllCourses((prev) =>
          prev.map((course) =>
            course.id === enrollmentId
              ? {
                  ...course,
                  status: newStatus,
                  progress: newStatus === 'completed' ? 100 : course.progress,
                }
              : course
          )
        );
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnenroll = async (enrollmentId: string) => {
    if (!confirm('Are you sure you want to unenroll from this course?')) return;

    setActionLoading(enrollmentId);
    try {
      const result = await unenrollFromCourse(enrollmentId);
      if (result.success) {
        setAllCourses((prev) =>
          prev.map((course) =>
            course.id === enrollmentId
              ? { ...course, status: 'paused' }
              : course
          )
        );
      }
    } catch (error) {
      console.error('Error unenrolling:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-success';
    if (progress >= 50) return 'bg-warning';
    return 'bg-primary';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'rbt-badge-5';
      case 'completed':
        return 'rbt-badge-4';
      case 'paused':
        return 'rbt-badge-6';
      default:
        return 'rbt-badge-5';
    }
  };

  const CourseCard = ({ enrollment }: { enrollment: EnrolledCourse }) => {
    const isLoading = actionLoading === enrollment.id;

    return (
      <div className="rbt-card variation-01 rbt-hover">
        <div className="rbt-card-img">
          <Link href={ROUTES.COURSE.DETAILS(enrollment.course_id)}>
            {enrollment.course.thumbnail_url ? (
              <Image
                src={enrollment.course.thumbnail_url}
                alt={enrollment.course.title}
                width={300}
                height={200}
                className="enrolled-course-thumbnail"
              />
            ) : (
              <div className="enrolled-course-placeholder">
                <i className="feather-image"></i>
              </div>
            )}
          </Link>
          <div className="rbt-badge-3 bg-white">
            <span className={getStatusBadgeClass(enrollment.status)}>
              {enrollment.status.charAt(0).toUpperCase() +
                enrollment.status.slice(1)}
            </span>
          </div>
        </div>
        <div className="rbt-card-body">
          <ul className="rbt-meta">
            <li>
              <i className="feather-book"></i>
              {enrollment.completed_lessons} / {enrollment.course.total_lessons}{' '}
              Lessons
            </li>
            <li>
              <i className="feather-user"></i>
              {enrollment.course.instructor.name}
            </li>
          </ul>

          <h4 className="rbt-card-title">
            <Link href={ROUTES.COURSE.DETAILS(enrollment.course_id)}>
              {enrollment.course.title}
            </Link>
          </h4>

          <p className="rbt-card-text">
            {enrollment.course.description?.slice(0, 100)}...
          </p>

          <div className="rbt-progress-style-1 mb--20 mt--20">
            <div className="single-progress">
              <h6 className="rbt-title-style-2 mb--10">
                Progress ({enrollment.progress}%)
              </h6>
              <div className="progress">
                <div
                  className={`progress-bar ${getProgressColor(enrollment.progress)} wow fadeInLeft`}
                  role="progressbar"
                  style={{ width: `${enrollment.progress}%` }}
                  aria-valuenow={enrollment.progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                ></div>
              </div>
            </div>
          </div>

          <div className="rbt-card-bottom">
            <div className="rbt-price">
              <span className="current-price">
                Enrolled: {formatDate(enrollment.enrolled_at)}
              </span>
              {enrollment.last_accessed_at && (
                <span className="off-price">
                  Last: {formatDate(enrollment.last_accessed_at)}
                </span>
              )}
            </div>

            <div className="d-flex justify-content-between align-items-center mt--20">
              <Link
                className="rbt-btn btn-sm btn-gradient"
                href={ROUTES.COURSE.DETAILS(enrollment.course_id)}
              >
                {enrollment.status === 'completed' ? 'Review' : 'Continue'}
                <i className="feather-arrow-right"></i>
              </Link>

              <div className="dropdown">
                <button
                  className="rbt-btn btn-sm btn-border"
                  type="button"
                  data-bs-toggle="dropdown"
                  disabled={isLoading}
                >
                  <i className="feather-more-vertical"></i>
                </button>
                <ul className="dropdown-menu">
                  {enrollment.status !== 'completed' && (
                    <li>
                      <button
                        className="dropdown-item"
                        onClick={() =>
                          handleStatusChange(enrollment.id, 'completed')
                        }
                        disabled={isLoading}
                      >
                        <i className="feather-check-circle"></i> Mark Complete
                      </button>
                    </li>
                  )}
                  {enrollment.status === 'paused' && (
                    <li>
                      <button
                        className="dropdown-item"
                        onClick={() =>
                          handleStatusChange(enrollment.id, 'active')
                        }
                        disabled={isLoading}
                      >
                        <i className="feather-play-circle"></i> Resume
                      </button>
                    </li>
                  )}
                  {enrollment.status === 'active' && (
                    <li>
                      <button
                        className="dropdown-item"
                        onClick={() =>
                          handleStatusChange(enrollment.id, 'paused')
                        }
                        disabled={isLoading}
                      >
                        <i className="feather-pause-circle"></i> Pause
                      </button>
                    </li>
                  )}
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <button
                      className="dropdown-item text-danger"
                      onClick={() => handleUnenroll(enrollment.id)}
                      disabled={isLoading}
                    >
                      <i className="feather-x-circle"></i> Unenroll
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const EmptyState = ({ message }: { message: string }) => (
    <div className="col-12">
      <div className="text-center py-5">
        <i className="feather-book-open enrolled-course-empty-icon"></i>
        <h5 className="mt-3">{message}</h5>
        <p className="text-muted">
          Start your learning journey by enrolling in courses
        </p>
        <Link
          href={ROUTES.STUDENT.COURSE_BROWSER}
          className="rbt-btn btn-gradient btn-sm mt-3"
        >
          Browse Courses
        </Link>
      </div>
    </div>
  );

  const LoadingSkeleton = () => (
    <div className="col-lg-4 col-md-6 col-12">
      <div className="rbt-card variation-01">
        <div className="rbt-card-img">
          <div className="enrolled-courses-skeleton enrolled-courses-skeleton-image"></div>
        </div>
        <div className="rbt-card-body">
          <div className="enrolled-courses-skeleton enrolled-courses-skeleton-text enrolled-courses-skeleton-text-short"></div>
          <div className="enrolled-courses-skeleton enrolled-courses-skeleton-text mt--10"></div>
          <div className="enrolled-courses-skeleton enrolled-courses-skeleton-text enrolled-courses-skeleton-text-medium"></div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="rbt-dashboard-content bg-color-white rbt-shadow-box">
        <div className="content">
          <div className="section-title">
            <h4 className="rbt-title-style-3">My Courses</h4>
          </div>
          <div className="row g-5">
            {[1, 2, 3].map((i) => (
              <LoadingSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const stats = {
    total: allCourses.length,
    active: allCourses.filter((c) => c.status === 'active').length,
    completed: allCourses.filter((c) => c.status === 'completed').length,
    paused: allCourses.filter((c) => c.status === 'paused').length,
  };

  return (
    <div className="rbt-dashboard-content bg-color-white rbt-shadow-box">
      <div className="content">
        <div className="section-title mb--30">
          <h4 className="rbt-title-style-3">My Courses</h4>
          <div className="row g-3 align-items-center mt--10">
            {/* Stats Cards */}
            <div className="col-lg-3 col-md-6">
              <div className="rbt-counterup variation-01 rbt-hover-03 rbt-border-dashed">
                <div className="inner">
                  <div className="rbt-round-icon bg-primary-opacity">
                    <i className="feather-book-open"></i>
                  </div>
                  <div className="content">
                    <h3 className="counter">
                      <span className="odometer">{stats.total}</span>
                    </h3>
                    <span className="subtitle">Total Courses</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="rbt-counterup variation-01 rbt-hover-03 rbt-border-dashed">
                <div className="inner">
                  <div className="rbt-round-icon bg-success-opacity">
                    <i className="feather-play-circle"></i>
                  </div>
                  <div className="content">
                    <h3 className="counter">
                      <span className="odometer">{stats.active}</span>
                    </h3>
                    <span className="subtitle">Active</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="rbt-counterup variation-01 rbt-hover-03 rbt-border-dashed">
                <div className="inner">
                  <div className="rbt-round-icon bg-violet-opacity">
                    <i className="feather-check-circle"></i>
                  </div>
                  <div className="content">
                    <h3 className="counter">
                      <span className="odometer">{stats.completed}</span>
                    </h3>
                    <span className="subtitle">Completed</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="rbt-counterup variation-01 rbt-hover-03 rbt-border-dashed">
                <div className="inner">
                  <div className="rbt-round-icon bg-warning-opacity">
                    <i className="feather-pause-circle"></i>
                  </div>
                  <div className="content">
                    <h3 className="counter">
                      <span className="odometer">{stats.paused}</span>
                    </h3>
                    <span className="subtitle">Paused</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="rbt-dashboard-filter mb--30">
          <div className="row g-3">
            <div className="col-lg-6">
              <div className="filter-select rbt-modern-select">
                <div className="row g-3">
                  <div className="col-md-6">
                    <select
                      className="form-select"
                      value={filterBy}
                      onChange={(e) =>
                        setFilterBy(e.target.value as FilterOption)
                      }
                    >
                      <option value="all">All Courses</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="paused">Paused</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <select
                      className="form-select"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                    >
                      <option value="recent">Recently Accessed</option>
                      <option value="progress">Progress</option>
                      <option value="alphabetical">Alphabetical</option>
                      <option value="enrolled">Enrollment Date</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="rbt-search-style-1">
                <input
                  className="rbt-search-active"
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className="search-btn">
                  <i className="feather-search"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Course Grid */}
        <div className="row g-5">
          {currentCourses.length > 0 ? (
            currentCourses.map((enrollment) => (
              <div className="col-lg-4 col-md-6 col-12" key={enrollment.id}>
                <CourseCard enrollment={enrollment} />
              </div>
            ))
          ) : (
            <EmptyState message="No courses found" />
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="row">
            <div className="col-lg-12 mt--60">
              <nav>
                <ul className="rbt-pagination">
                  <li className={currentPage === 1 ? 'disabled' : ''}>
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="rbt-btn"
                    >
                      <i className="feather-chevron-left"></i>
                    </button>
                  </li>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <li
                        key={page}
                        className={currentPage === page ? 'active' : ''}
                      >
                        <button
                          onClick={() => handlePageChange(page)}
                          className="rbt-btn"
                        >
                          {page}
                        </button>
                      </li>
                    )
                  )}
                  <li className={currentPage === totalPages ? 'disabled' : ''}>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="rbt-btn"
                    >
                      <i className="feather-chevron-right"></i>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnrolledCoursesEnhanced;
