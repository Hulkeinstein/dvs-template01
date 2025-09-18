'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { createTestEnrollment } from '@/app/lib/actions/enrollmentActions';
import { getAvailableCourses } from '@/app/lib/actions/courseActions';
import { ROUTES } from '@/app/lib/constants/routes';

interface Course {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  thumbnail_url?: string | null;
  status?: string;
  is_free?: boolean;
  regular_price?: number | null;
  discounted_price?: number | null;
  instructor_id?: string;
  instructor?: {
    id: string;
    name: string;
    avatar_url?: string | null;
  };
}

export default function TestEnrollmentPage() {
  const { data: session } = useSession();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [coursesLoading, setCoursesLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      setCoursesLoading(true);
      try {
        const result = await getAvailableCourses();
        if (result.success && result.courses) {
          setCourses(result.courses);
          // Auto-select first course if available
          if (result.courses.length > 0) {
            setSelectedCourseId(result.courses[0].id);
          }
        } else {
          setMessage(
            `⚠️ Failed to load courses: ${result.error || 'Unknown error'}`
          );
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        setMessage('⚠️ Failed to load courses');
      } finally {
        setCoursesLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleCreateTestEnrollment = async () => {
    if (!session?.user?.id) {
      setMessage('❌ Please login first');
      return;
    }

    if (!selectedCourseId) {
      setMessage('❌ Please select a course');
      return;
    }

    setLoading(true);
    try {
      const result = await createTestEnrollment(
        session.user.id,
        selectedCourseId
      );

      if (result.success) {
        const selectedCourse = courses.find((c) => c.id === selectedCourseId);
        setMessage(
          `✅ Successfully enrolled in "${selectedCourse?.title}"! Go to Enrolled Courses to see it.`
        );
      } else {
        setMessage(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      setMessage('❌ Unexpected error occurred');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const selectedCourse = courses.find((c) => c.id === selectedCourseId);

  return (
    <div className="rbt-dashboard-area rbt-section-overlayping-top rbt-section-gapBottom">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="rbt-dashboard-content bg-color-white rbt-shadow-box">
              <div className="content">
                <div className="section-title">
                  <h4 className="rbt-title-style-3">Test Enrollment Creator</h4>
                  <p className="mt--20">
                    This is a test page to create enrollment data for
                    development.
                  </p>
                </div>

                <div className="row g-5 mt--20">
                  <div className="col-lg-6">
                    <div className="rbt-form-group">
                      <label>Current User</label>
                      <input
                        type="text"
                        className="form-control"
                        value={session?.user?.email || 'Not logged in'}
                        disabled
                      />
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="rbt-form-group">
                      <label>User ID</label>
                      <input
                        type="text"
                        className="form-control"
                        value={session?.user?.id || 'N/A'}
                        disabled
                      />
                    </div>
                  </div>
                </div>

                <div className="row g-5 mt--10">
                  <div className="col-lg-12">
                    <div className="rbt-form-group">
                      <label>Select Course</label>
                      {coursesLoading ? (
                        <div className="text-center py-3">
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Loading courses...
                        </div>
                      ) : courses.length > 0 ? (
                        <select
                          className="form-control form-select"
                          value={selectedCourseId}
                          onChange={(e) => setSelectedCourseId(e.target.value)}
                          disabled={loading}
                        >
                          <option value="">-- Select a Course --</option>
                          {courses.map((course) => (
                            <option key={course.id} value={course.id}>
                              {course.title} ({course.status}) -{' '}
                              {course.instructor?.name || 'Unknown'}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="alert alert-warning">
                          No courses available. Please create a course first.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {selectedCourse && (
                  <div className="row g-5 mt--10">
                    <div className="col-lg-12">
                      <div className="alert alert-info">
                        <h6>Selected Course Details:</h6>
                        <ul className="mb-0">
                          <li>
                            <strong>Title:</strong> {selectedCourse.title}
                          </li>
                          <li>
                            <strong>Instructor:</strong>{' '}
                            {selectedCourse.instructor?.name || 'Unknown'}
                          </li>
                          <li>
                            <strong>Status:</strong> {selectedCourse.status}
                          </li>
                          <li>
                            <strong>Price:</strong>{' '}
                            {selectedCourse.is_free
                              ? 'Free'
                              : `$${selectedCourse.regular_price || selectedCourse.discounted_price || 0}`}
                          </li>
                          <li>
                            <strong>ID:</strong>{' '}
                            <code>{selectedCourse.id}</code>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                <div className="row g-5 mt--20">
                  <div className="col-lg-12">
                    <button
                      className="rbt-btn btn-gradient"
                      onClick={handleCreateTestEnrollment}
                      disabled={
                        loading ||
                        !session?.user?.id ||
                        !selectedCourseId ||
                        coursesLoading
                      }
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Creating...
                        </>
                      ) : (
                        'Create Test Enrollment'
                      )}
                    </button>

                    {message && (
                      <div
                        className={`alert ${
                          message.startsWith('✅')
                            ? 'alert-success'
                            : message.startsWith('❌')
                              ? 'alert-danger'
                              : 'alert-warning'
                        } mt--20`}
                      >
                        {message}
                      </div>
                    )}
                  </div>
                </div>

                <div className="row g-5 mt--30">
                  <div className="col-lg-12">
                    <div className="alert alert-info">
                      <h6>Note:</h6>
                      <ul className="mb-0">
                        <li>
                          This will create an enrollment with random progress
                          (0-100%)
                        </li>
                        <li>
                          The enrollment will be marked as &quot;active&quot;
                        </li>
                        <li>
                          You can create multiple enrollments for different
                          courses
                        </li>
                        <li>
                          Go to{' '}
                          <a href={ROUTES.STUDENT.ENROLLED_COURSES}>
                            Enrolled Courses
                          </a>{' '}
                          to see the results
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
