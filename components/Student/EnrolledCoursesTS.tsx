'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import CourseWidgets from '../Instructor/Dashboard-Section/widgets/CourseWidget';
import { getEnrolledCoursesRPC } from '@/app/lib/actions/studentDashboardActions';

interface EnrolledCoursesProps {
  userId?: string;
}

const EnrolledCoursesTS = ({ userId }: EnrolledCoursesProps) => {
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [activeCourses, setActiveCourses] = useState<any[]>([]);
  const [completedCourses, setCompletedCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const courses = await getEnrolledCoursesRPC(userId);

        // Transform data to match CourseWidget format
        const transformedCourses = courses.map((enrollment: any) => ({
          id: enrollment.course_id,
          title: enrollment.course.title,
          courseThumbnail:
            enrollment.course.thumbnail_url || '/images/course/course-01.jpg',
          coursePrice: enrollment.course.regular_price || 0,
          offerPrice: enrollment.course.discounted_price || 0,
          lectures: enrollment.course.total_lessons || 0,
          enrolledStudent: enrollment.course.enrolled_students || 0,
          reviews: { total: 0 },
          rating: { average: 0 },
          progress: enrollment.progress || 0,
          status: enrollment.status,
          instructor: enrollment.course.instructor,
        }));

        // Separate by status
        const enrolled = transformedCourses.filter(
          (c: Record<string, unknown>) => c.status === 'active'
        );
        const active = transformedCourses.filter(
          (c: Record<string, unknown>) =>
            c.status === 'active' && (c.progress as number) > 0
        );
        const completed = transformedCourses.filter(
          (c: Record<string, unknown>) => c.status === 'completed'
        );

        setEnrolledCourses(enrolled);
        setActiveCourses(active);
        setCompletedCourses(completed);
      } catch (error) {
        console.error('Error fetching enrolled courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [userId]);

  if (loading) {
    return (
      <div className="rbt-dashboard-content bg-color-white rbt-shadow-box">
        <div className="content">
          <div className="section-title">
            <h4 className="rbt-title-style-3">Loading courses...</h4>
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
                  <span className="title">Enrolled Courses</span>
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
                  <span className="title">Active Courses</span>
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
                  <span className="title">Completed Courses</span>
                </Link>
              </li>
            </ul>
          </div>

          <div className="tab-content">
            <div
              className="tab-pane fade active show"
              id="home-4"
              role="tabpanel"
              aria-labelledby="home-tab-4"
            >
              <div className="row g-5">
                {enrolledCourses.length > 0 ? (
                  enrolledCourses.map((course, index) => (
                    <div
                      className="col-lg-4 col-md-6 col-12"
                      key={`course-enrolled-${index}`}
                    >
                      <CourseWidgets
                        data={course}
                        courseStyle="two"
                        isProgress={true}
                        isCompleted={false}
                        isEdit={false}
                        showDescription={false}
                        showAuthor={false}
                        onStatusChange={() => {}}
                        onDeleteCourse={() => {}}
                      />
                    </div>
                  ))
                ) : (
                  <div className="col-12">
                    <div className="text-center py-5">
                      <i
                        className="feather-book-open mb-3"
                        style={{ fontSize: '48px', color: '#ccc' }}
                      ></i>
                      <h5>No enrolled courses yet</h5>
                      <p className="text-muted">
                        Start your learning journey by enrolling in a course
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div
              className="tab-pane fade"
              id="profile-4"
              role="tabpanel"
              aria-labelledby="profile-tab-4"
            >
              <div className="row g-5">
                {activeCourses.length > 0 ? (
                  activeCourses.map((course, index) => (
                    <div
                      className="col-lg-4 col-md-6 col-12"
                      key={`course-active-${index}`}
                    >
                      <CourseWidgets
                        data={course}
                        courseStyle="two"
                        isCompleted={false}
                        isProgress={false}
                        isEdit={false}
                        showDescription={false}
                        showAuthor={false}
                        onStatusChange={() => {}}
                        onDeleteCourse={() => {}}
                      />
                    </div>
                  ))
                ) : (
                  <div className="col-12">
                    <div className="text-center py-5">
                      <i
                        className="feather-play-circle mb-3"
                        style={{ fontSize: '48px', color: '#ccc' }}
                      ></i>
                      <h5>No active courses</h5>
                      <p className="text-muted">
                        Continue learning to see your active courses here
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div
              className="tab-pane fade"
              id="contact-4"
              role="tabpanel"
              aria-labelledby="contact-tab-4"
            >
              <div className="row g-5">
                {completedCourses.length > 0 ? (
                  completedCourses.map((course, index) => (
                    <div
                      className="col-lg-4 col-md-6 col-12"
                      key={`course-completed-${index}`}
                    >
                      <CourseWidgets
                        data={course}
                        courseStyle="two"
                        isCompleted={true}
                        isProgress={true}
                        showDescription={false}
                        isEdit={false}
                        showAuthor={false}
                        onStatusChange={() => {}}
                        onDeleteCourse={() => {}}
                      />
                    </div>
                  ))
                ) : (
                  <div className="col-12">
                    <div className="text-center py-5">
                      <i
                        className="feather-award mb-3"
                        style={{ fontSize: '48px', color: '#ccc' }}
                      ></i>
                      <h5>No completed courses yet</h5>
                      <p className="text-muted">
                        Complete your first course to see it here
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

export default EnrolledCoursesTS;
