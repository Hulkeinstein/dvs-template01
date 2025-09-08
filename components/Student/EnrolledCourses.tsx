'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getEnrolledCourses } from '@/app/lib/actions/studentDashboardActions';

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

const EnrolledCourses = ({ userId }: EnrolledCoursesProps) => {
  const [allCourses, setAllCourses] = useState<EnrolledCourse[]>([]);
  const [activeCourses, setActiveCourses] = useState<EnrolledCourse[]>([]);
  const [completedCourses, setCompletedCourses] = useState<EnrolledCourse[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const courses = await getEnrolledCourses(userId);
        setAllCourses(courses);
        setActiveCourses(courses.filter((c) => c.status === 'active'));
        setCompletedCourses(courses.filter((c) => c.status === 'completed'));
      } catch (error) {
        console.error('Error fetching enrolled courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [userId]);

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

  const CourseCard = ({ enrollment }: { enrollment: EnrolledCourse }) => (
    <div className="rbt-card variation-01 rbt-hover">
      <div className="rbt-card-img">
        <Link href={`/course-details/${enrollment.course_id}`}>
          {enrollment.course.thumbnail_url ? (
            <img
              src={enrollment.course.thumbnail_url}
              alt={enrollment.course.title}
              style={{ width: '100%', height: '200px', objectFit: 'cover' }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '200px',
                backgroundColor: '#f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <i
                className="feather-image"
                style={{ fontSize: '48px', color: '#ccc' }}
              ></i>
            </div>
          )}
        </Link>
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
          <Link href={`/course-details/${enrollment.course_id}`}>
            {enrollment.course.title}
          </Link>
        </h4>

        <p className="rbt-card-text">
          {enrollment.course.description?.slice(0, 100)}...
        </p>

        <div className="rbt-progress-style-1 mb--20 mt--20">
          <div className="single-progress">
            <h6 className="rbt-title-style-2 mb--10">Progress</h6>
            <div className="progress">
              <div
                className={`progress-bar ${getProgressColor(enrollment.progress)} wow fadeInLeft`}
                role="progressbar"
                style={{ width: `${enrollment.progress}%` }}
                aria-valuenow={enrollment.progress}
                aria-valuemin={0}
                aria-valuemax={100}
              ></div>
              <span className="rbt-title-style-2 progress-number">
                {enrollment.progress}%
              </span>
            </div>
          </div>
        </div>

        <div className="rbt-card-bottom">
          <div className="rbt-price">
            <span className="current-price">
              Enrolled: {formatDate(enrollment.enrolled_at)}
            </span>
          </div>
          <Link
            className="rbt-btn-link"
            href={`/course-details/${enrollment.course_id}`}
          >
            {enrollment.status === 'completed'
              ? 'Review Course'
              : 'Continue Learning'}
            <i className="feather-arrow-right"></i>
          </Link>
        </div>
      </div>
    </div>
  );

  const EmptyState = ({ message }: { message: string }) => (
    <div className="col-12">
      <div className="text-center py-5">
        <i
          className="feather-book-open"
          style={{ fontSize: '48px', color: '#ccc' }}
        ></i>
        <h5 className="mt-3">{message}</h5>
        <Link
          href="/course-filter-one-toggle"
          className="rbt-btn btn-gradient btn-sm mt-3"
        >
          Browse Courses
        </Link>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="rbt-dashboard-content bg-color-white rbt-shadow-box">
        <div className="content">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rbt-dashboard-content bg-color-white rbt-shadow-box">
        <div className="content">
          <div className="section-title">
            <h4 className="rbt-title-style-3">Enrolled Courses</h4>
          </div>
          <div className="advance-tab-button mb--30">
            <ul
              className="nav nav-tabs tab-button-style-2 justify-content-start"
              id="myTab-4"
              role="tablist"
            >
              <li role="presentation">
                <Link
                  href="#"
                  className="tab-button active"
                  id="home-tab-4"
                  data-bs-toggle="tab"
                  data-bs-target="#home-4"
                  role="tab"
                  aria-controls="home-4"
                  aria-selected="true"
                >
                  <span className="title">
                    All Courses ({allCourses.length})
                  </span>
                </Link>
              </li>
              <li role="presentation">
                <Link
                  href="#"
                  className="tab-button"
                  id="profile-tab-4"
                  data-bs-toggle="tab"
                  data-bs-target="#profile-4"
                  role="tab"
                  aria-controls="profile-4"
                  aria-selected="false"
                >
                  <span className="title">
                    Active Courses ({activeCourses.length})
                  </span>
                </Link>
              </li>
              <li role="presentation">
                <Link
                  href="#"
                  className="tab-button"
                  id="contact-tab-4"
                  data-bs-toggle="tab"
                  data-bs-target="#contact-4"
                  role="tab"
                  aria-controls="contact-4"
                  aria-selected="false"
                >
                  <span className="title">
                    Completed Courses ({completedCourses.length})
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          <div className="tab-content">
            {/* All Courses Tab */}
            <div
              className="tab-pane fade active show"
              id="home-4"
              role="tabpanel"
              aria-labelledby="home-tab-4"
            >
              <div className="row g-5">
                {allCourses.length > 0 ? (
                  allCourses.map((enrollment) => (
                    <div
                      className="col-lg-4 col-md-6 col-12"
                      key={enrollment.id}
                    >
                      <CourseCard enrollment={enrollment} />
                    </div>
                  ))
                ) : (
                  <EmptyState message="No courses enrolled yet" />
                )}
              </div>
            </div>

            {/* Active Courses Tab */}
            <div
              className="tab-pane fade"
              id="profile-4"
              role="tabpanel"
              aria-labelledby="profile-tab-4"
            >
              <div className="row g-5">
                {activeCourses.length > 0 ? (
                  activeCourses.map((enrollment) => (
                    <div
                      className="col-lg-4 col-md-6 col-12"
                      key={enrollment.id}
                    >
                      <CourseCard enrollment={enrollment} />
                    </div>
                  ))
                ) : (
                  <EmptyState message="No active courses" />
                )}
              </div>
            </div>

            {/* Completed Courses Tab */}
            <div
              className="tab-pane fade"
              id="contact-4"
              role="tabpanel"
              aria-labelledby="contact-tab-4"
            >
              <div className="row g-5">
                {completedCourses.length > 0 ? (
                  completedCourses.map((enrollment) => (
                    <div
                      className="col-lg-4 col-md-6 col-12"
                      key={enrollment.id}
                    >
                      <CourseCard enrollment={enrollment} />
                    </div>
                  ))
                ) : (
                  <EmptyState message="No completed courses yet" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EnrolledCourses;
