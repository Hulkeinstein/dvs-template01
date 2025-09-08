'use client';

import { useEffect, useState } from 'react';
import CounterWidget from '../Instructor/Dashboard-Section/widgets/CounterWidget';
import {
  getStudentDashboardStats,
  getEnrolledCourses,
  getNextLessonRecommendation,
} from '@/app/lib/actions/studentDashboardActions';
import Link from 'next/link';

interface DashboardProps {
  userId?: string;
}

interface StudentStats {
  enrolledCourses: number;
  activeCourses: number;
  completedCourses: number;
  bookmarkedCourses: number;
  totalProgress: number;
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

interface NextLesson {
  lesson: {
    id: string;
    title: string;
    order_index: number;
  };
  course: {
    id: string;
    title: string;
  };
}

const Dashboard = ({ userId }: DashboardProps) => {
  const [stats, setStats] = useState<StudentStats>({
    enrolledCourses: 0,
    activeCourses: 0,
    completedCourses: 0,
    bookmarkedCourses: 0,
    totalProgress: 0,
  });
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [nextLesson, setNextLesson] = useState<NextLesson | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        // Fetch all data in parallel
        const [statsData, coursesData, nextLessonData] = await Promise.all([
          getStudentDashboardStats(userId),
          getEnrolledCourses(userId),
          getNextLessonRecommendation(userId),
        ]);

        setStats(statsData);
        setEnrolledCourses(coursesData);
        setNextLesson(nextLessonData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [userId]);

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-success';
    if (progress >= 50) return 'bg-warning';
    return 'bg-primary';
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'badge-success';
      case 'active':
        return 'badge-primary';
      case 'paused':
        return 'badge-warning';
      default:
        return 'badge-secondary';
    }
  };

  return (
    <>
      <div className="rbt-dashboard-content bg-color-white rbt-shadow-box mb--60">
        <div className="content">
          <div className="section-title">
            <h4 className="rbt-title-style-3">Dashboard</h4>
          </div>

          {/* Stats Widgets */}
          <div className="row g-5">
            <div className="col-lg-4 col-md-4 col-sm-6 col-12">
              <CounterWidget
                counterStyle="two"
                styleClass="bg-primary-opacity"
                iconClass="bg-primary-opacity"
                numberClass="color-primary"
                icon="feather-book-open"
                title="Enrolled Courses"
                value={stats.enrolledCourses}
              />
            </div>
            <div className="col-lg-4 col-md-4 col-sm-6 col-12">
              <CounterWidget
                counterStyle="two"
                styleClass="bg-secondary-opacity"
                iconClass="bg-secondary-opacity"
                numberClass="color-secondary"
                icon="feather-monitor"
                title="Active Courses"
                value={stats.activeCourses}
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
                value={stats.completedCourses}
              />
            </div>
          </div>

          {/* Next Lesson Recommendation */}
          {nextLesson && (
            <div className="rbt-dashboard-content bg-color-white rbt-shadow-box mb--30 mt--30">
              <div className="content">
                <div className="section-title">
                  <h5 className="rbt-title-style-3 mb--20">
                    Continue Learning
                  </h5>
                </div>
                <div className="rbt-card variation-02 rbt-hover">
                  <div className="rbt-card-body">
                    <h6 className="mb--10">
                      <Link href={`/lesson/${nextLesson.lesson.id}`}>
                        {nextLesson.lesson.title}
                      </Link>
                    </h6>
                    <p className="mb--0 text-muted">
                      From: {nextLesson.course.title}
                    </p>
                    <div className="mt--20">
                      <Link
                        href={`/lesson/${nextLesson.lesson.id}`}
                        className="rbt-btn btn-sm btn-gradient"
                      >
                        Continue Lesson
                        <i className="feather-arrow-right ms-2"></i>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recent Courses */}
          {enrolledCourses.length > 0 && (
            <div className="rbt-dashboard-content bg-color-white rbt-shadow-box mb--30 mt--30">
              <div className="content">
                <div className="section-title d-flex align-items-center justify-content-between">
                  <h5 className="rbt-title-style-3 mb--20">My Courses</h5>
                  <Link
                    href="/student-enrolled-course"
                    className="rbt-btn-link"
                  >
                    View All <i className="feather-arrow-right"></i>
                  </Link>
                </div>

                <div className="row g-5">
                  {enrolledCourses.slice(0, 3).map((enrollment) => (
                    <div
                      key={enrollment.id}
                      className="col-lg-4 col-md-6 col-12"
                    >
                      <div className="rbt-card variation-01 rbt-hover">
                        <div className="rbt-card-img">
                          <Link
                            href={`/course-details/${enrollment.course_id}`}
                          >
                            {enrollment.course.thumbnail_url ? (
                              <img
                                src={enrollment.course.thumbnail_url}
                                alt={enrollment.course.title}
                                style={{
                                  width: '100%',
                                  height: '200px',
                                  objectFit: 'cover',
                                }}
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
                            <div className="rbt-badge-3 bg-white">
                              <span
                                className={`rbt-badge ${getStatusBadgeClass(enrollment.status)}`}
                              >
                                {enrollment.status}
                              </span>
                            </div>
                          </Link>
                        </div>
                        <div className="rbt-card-body">
                          <h4 className="rbt-card-title">
                            <Link
                              href={`/course-details/${enrollment.course_id}`}
                            >
                              {enrollment.course.title}
                            </Link>
                          </h4>

                          <ul className="rbt-meta">
                            <li>
                              <i className="feather-book"></i>
                              {enrollment.completed_lessons} /{' '}
                              {enrollment.course.total_lessons} Lessons
                            </li>
                            <li>
                              <i className="feather-user"></i>
                              {enrollment.course.instructor.name}
                            </li>
                          </ul>

                          <div className="rbt-progress-style-1 mb--20 mt--20">
                            <div className="single-progress">
                              <h6 className="rbt-title-style-2 mb--10">
                                Progress
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
                                <span className="rbt-title-style-2 progress-number">
                                  {enrollment.progress}%
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="rbt-card-bottom">
                            <Link
                              className="rbt-btn-link"
                              href={`/course-details/${enrollment.course_id}`}
                            >
                              Continue Learning
                              <i className="feather-arrow-right"></i>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {enrolledCourses.length === 0 && !loading && (
                  <div className="text-center py-5">
                    <i
                      className="feather-book-open"
                      style={{ fontSize: '48px', color: '#ccc' }}
                    ></i>
                    <h5 className="mt-3">No courses enrolled yet</h5>
                    <p className="text-muted">
                      Start your learning journey by enrolling in a course
                    </p>
                    <Link
                      href="/course-filter-one-toggle"
                      className="rbt-btn btn-gradient btn-sm mt-3"
                    >
                      Browse Courses
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Overall Progress */}
          {stats.enrolledCourses > 0 && (
            <div className="rbt-dashboard-content bg-color-white rbt-shadow-box mt--30">
              <div className="content">
                <div className="section-title">
                  <h5 className="rbt-title-style-3 mb--20">Overall Progress</h5>
                </div>
                <div className="rbt-progress-style-1">
                  <div className="single-progress">
                    <h6 className="rbt-title-style-2 mb--10">
                      Total Learning Progress
                    </h6>
                    <div className="progress">
                      <div
                        className={`progress-bar ${getProgressColor(stats.totalProgress)} wow fadeInLeft`}
                        role="progressbar"
                        style={{ width: `${stats.totalProgress}%` }}
                        aria-valuenow={stats.totalProgress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      ></div>
                      <span className="rbt-title-style-2 progress-number">
                        {stats.totalProgress}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="row g-3 mt--20">
                  <div className="col-6">
                    <div className="rbt-counterup variation-01 rbt-hover-03 border-none">
                      <div className="inner">
                        <div className="content">
                          <h3 className="counter">
                            <span className="odometer">
                              {stats.bookmarkedCourses}
                            </span>
                          </h3>
                          <span className="subtitle">Bookmarked Courses</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="rbt-counterup variation-01 rbt-hover-03 border-none">
                      <div className="inner">
                        <div className="content">
                          <h3 className="counter">
                            <span className="odometer">
                              {stats.activeCourses}
                            </span>
                          </h3>
                          <span className="subtitle">In Progress</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Dashboard;
