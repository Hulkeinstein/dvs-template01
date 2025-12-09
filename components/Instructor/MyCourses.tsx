'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CourseWidget from './Dashboard-Section/widgets/CourseWidget';
import {
  getInstructorCourses,
  deleteCourse,
} from '@/app/lib/actions/courseActions';
import { ROUTES } from '@/app/lib/constants/routes';
import type { CourseStatus } from '@/types/course';

// Type definitions for the component
interface Course {
  id: string;
  title: string;
  description?: string | null;
  thumbnail_url?: string | null;
  status?: CourseStatus;
  badges?: any[]; // TODO(ANY-TODO #001): Define proper Badge type
  regular_price?: number | null;
  discounted_price?: number | null;
  total_duration_hours?: number;
  difficulty_level?: string;
  lessons?: {
    count: number;
  };
  enrollments?: {
    count: number;
  };
  reviews?: any; // TODO(ANY-TODO #002): Define proper Review type
}

interface FormattedCourseData {
  id: string;
  courseThumbnail: string;
  title: string;
  badges: any[]; // TODO(ANY-TODO #003): Define proper Badge type
  shortDescription: string;
  regular_price: number;
  discounted_price?: number; // Changed from number | null to optional number
  regularPrice: number; // Legacy compatibility
  discountedPrice?: number; // Legacy compatibility - changed from number | null
  courseDuration: string;
  lectures: number;
  enrolledStudent: number;
  courseLevel: string;
  status?: CourseStatus;
  rating: {
    average: number;
  };
  reviews?: any; // TODO(ANY-TODO #004): Define proper Review type
}

const MyCourses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = async (): Promise<void> => {
    try {
      setLoading(true);
      const result = await getInstructorCourses();

      if (result.error) {
        setError(result.error);
      } else {
        setCourses((result.courses as Course[]) || []);
      }
    } catch (err) {
      setError('Failed to fetch courses');
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleDeleteCourse = async (courseId: string): Promise<void> => {
    try {
      const result = await deleteCourse(courseId);
      if (result.success) {
        alert(result.message || '코스가 삭제되었습니다.');
        fetchCourses(); // 목록 새로고침
      } else {
        alert(result.error || '삭제 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const publishedCourses = courses.filter(
    (course) => course.status === 'published'
  );
  const pendingCourses = courses.filter(
    (course) => course.status === 'pending'
  );
  const draftCourses = courses.filter((course) => course.status === 'draft');
  const archivedCourses = courses.filter(
    (course) => course.status === 'archived'
  );

  const formatCourseData = (course: Course): FormattedCourseData => {
    const formatted: FormattedCourseData = {
      id: course.id,
      courseThumbnail: course.thumbnail_url || '/images/course/course-01.jpg',
      title: course.title,
      badges: course.badges || [],
      shortDescription: course.description || '',

      // 신규 가격 필드 (snake_case 우선)
      regular_price: Number(course?.regular_price ?? 0),
      discounted_price:
        course?.discounted_price != null
          ? Number(course.discounted_price)
          : undefined,

      // 하위 호환용 camelCase
      regularPrice: Number(course?.regular_price ?? 0),
      discountedPrice:
        course?.discounted_price != null
          ? Number(course.discounted_price)
          : undefined,

      // 기타 필드
      courseDuration: course.total_duration_hours
        ? `${course.total_duration_hours} hours`
        : 'TBD',
      lectures: course.lessons?.count || 0,
      enrolledStudent: course.enrollments?.count || 0,
      courseLevel: course.difficulty_level || 'All Levels',
      status: course.status,
      rating: { average: 0 },
      reviews: course.reviews || undefined,
    };

    // 개발 환경에서 구 키 사용 경고
    if (process.env.NODE_ENV === 'development') {
      if ('coursePrice' in formatted || 'offerPrice' in formatted) {
        console.warn(
          '[MyCourses] ⚠️ Legacy price keys detected - should use regular_price/discounted_price'
        );
      }
    }

    return formatted;
  };

  if (loading) {
    return (
      <div className="rbt-dashboard-content bg-color-white rbt-shadow-box">
        <div className="content">
          <div className="section-title">
            <h4 className="rbt-title-style-3">My Courses</h4>
          </div>
          <div className="text-center py-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading your courses...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rbt-dashboard-content bg-color-white rbt-shadow-box">
        <div className="content">
          <div className="section-title">
            <h4 className="rbt-title-style-3">My Courses</h4>
          </div>
          <div className="alert alert-danger" role="alert">
            {error}
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
            <h4 className="rbt-title-style-3">My Courses</h4>
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
                  id="publish-tab-4"
                  data-bs-toggle="tab"
                  data-bs-target="#publish-4"
                  role="tab"
                  aria-controls="publish-4"
                  aria-selected="true"
                >
                  <span className="title">
                    Published ({publishedCourses.length})
                  </span>
                </Link>
              </li>
              <li role="presentation">
                <Link
                  href="#"
                  className="tab-button"
                  id="pending-tab-4"
                  data-bs-toggle="tab"
                  data-bs-target="#pending-4"
                  role="tab"
                  aria-controls="pending-4"
                  aria-selected="false"
                >
                  <span className="title">
                    Pending ({pendingCourses.length})
                  </span>
                </Link>
              </li>
              <li role="presentation">
                <Link
                  href="#"
                  className="tab-button"
                  id="draft-tab-4"
                  data-bs-toggle="tab"
                  data-bs-target="#draft-4"
                  role="tab"
                  aria-controls="draft-4"
                  aria-selected="false"
                >
                  <span className="title">Draft ({draftCourses.length})</span>
                </Link>
              </li>
              <li role="presentation">
                <Link
                  href="#"
                  className="tab-button"
                  id="archived-tab-4"
                  data-bs-toggle="tab"
                  data-bs-target="#archived-4"
                  role="tab"
                  aria-controls="archived-4"
                  aria-selected="false"
                >
                  <span className="title">
                    Archived ({archivedCourses.length})
                  </span>
                </Link>
              </li>
            </ul>
          </div>
          <div className="tab-content">
            <div
              className="tab-pane fade active show"
              id="publish-4"
              role="tabpanel"
              aria-labelledby="publish-tab-4"
            >
              <div className="row g-5">
                {publishedCourses.length > 0 ? (
                  publishedCourses.map((course, index) => (
                    <div
                      className="col-lg-4 col-md-6 col-12"
                      key={`course-published-${index}`}
                    >
                      <CourseWidget
                        data={formatCourseData(course)}
                        courseStyle="two"
                        isEdit={false}
                        isCompleted={false}
                        isProgress={false}
                        showDescription={false}
                        showAuthor={false}
                        userRole="instructor"
                        onStatusChange={() => fetchCourses()}
                        onDeleteCourse={handleDeleteCourse}
                      />
                    </div>
                  ))
                ) : (
                  <div className="col-12">
                    <div className="text-center py-5">
                      <h5>No published courses yet</h5>
                      <p className="text-muted">
                        Your published courses will appear here once they go
                        live.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div
              className="tab-pane fade"
              id="pending-4"
              role="tabpanel"
              aria-labelledby="pending-tab-4"
            >
              <div className="row g-5">
                {pendingCourses.length > 0 ? (
                  pendingCourses.map((course, index) => (
                    <div
                      className="col-lg-4 col-md-6 col-12"
                      key={`course-pending-${index}`}
                    >
                      <CourseWidget
                        data={formatCourseData(course)}
                        courseStyle="two"
                        isEdit={false}
                        isCompleted={false}
                        isProgress={false}
                        showDescription={false}
                        showAuthor={false}
                        userRole="instructor"
                        onStatusChange={() => fetchCourses()}
                        onDeleteCourse={handleDeleteCourse}
                      />
                    </div>
                  ))
                ) : (
                  <div className="col-12">
                    <div className="text-center py-5">
                      <h5>No pending courses</h5>
                      <p className="text-muted">
                        Courses waiting for approval will appear here.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div
              className="tab-pane fade"
              id="draft-4"
              role="tabpanel"
              aria-labelledby="draft-4"
            >
              <div className="row g-5">
                {draftCourses.length > 0 ? (
                  draftCourses.map((course, index) => (
                    <div
                      className="col-lg-4 col-md-6 col-12"
                      key={`course-draft-${index}`}
                    >
                      <CourseWidget
                        data={formatCourseData(course)}
                        courseStyle="two"
                        isEdit={true}
                        isCompleted={false}
                        isProgress={false}
                        showDescription={false}
                        showAuthor={false}
                        userRole="instructor"
                        onStatusChange={() => fetchCourses()}
                        onDeleteCourse={handleDeleteCourse}
                      />
                    </div>
                  ))
                ) : (
                  <div className="col-12">
                    <div className="text-center py-5">
                      <h5>No draft courses</h5>
                      <p className="text-muted">
                        Create a new course to get started!
                      </p>
                      <Link
                        href={ROUTES.INSTRUCTOR.CREATE_COURSE}
                        className="rbt-btn btn-gradient hover-icon-reverse"
                      >
                        <span className="icon-reverse-wrapper">
                          <span className="btn-text">Create Course</span>
                          <span className="btn-icon">
                            <i className="feather-arrow-right"></i>
                          </span>
                          <span className="btn-icon">
                            <i className="feather-arrow-right"></i>
                          </span>
                        </span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div
              className="tab-pane fade"
              id="archived-4"
              role="tabpanel"
              aria-labelledby="archived-tab-4"
            >
              <div className="row g-5">
                {archivedCourses.length > 0 ? (
                  archivedCourses.map((course, index) => (
                    <div
                      className="col-lg-4 col-md-6 col-12"
                      key={`course-archived-${index}`}
                    >
                      <CourseWidget
                        data={formatCourseData(course)}
                        courseStyle="two"
                        isEdit={false}
                        isCompleted={false}
                        isProgress={false}
                        showDescription={false}
                        showAuthor={false}
                        userRole="instructor"
                        onStatusChange={() => fetchCourses()}
                      />
                    </div>
                  ))
                ) : (
                  <div className="col-12">
                    <div className="text-center py-5">
                      <h5>No archived courses</h5>
                      <p className="text-muted">
                        Archived courses will appear here.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MyCourses;
