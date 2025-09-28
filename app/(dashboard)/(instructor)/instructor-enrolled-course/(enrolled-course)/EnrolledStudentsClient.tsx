'use client';

import Separator from '@/components/Common/Separator';
import FooterOne from '@/components/Footer/Footer-One';
import HeaderStyleTen from '@/components/Header/HeaderStyle-Ten';
import MobileMenu from '@/components/Header/MobileMenu';
import Cart from '@/components/Header/Offcanvas/Cart';
import EnrolledStudents from '@/components/Instructor/EnrolledStudents';
import InstructorDashboardHeader from '@/components/Instructor/InstructorDashboardHeader';
import InstructorDashboardSidebar from '@/components/Instructor/InstructorDashboardSidebar';
import Context from '@/context/Context';
import Store from '@/redux/store';
import { Provider } from 'react-redux';
import type { GetEnrolledStudentsResponse } from '@/types/enrollment';

interface EnrolledStudentsClientProps {
  initialData: GetEnrolledStudentsResponse | null;
  error: string | null;
}

const EnrolledStudentsClient = ({
  initialData,
  error,
}: EnrolledStudentsClientProps) => {
  return (
    <>
      <Provider store={Store}>
        <Context>
          <MobileMenu />
          <HeaderStyleTen headerSticky="rbt-sticky" />
          <Cart />

          <div className="rbt-page-banner-wrapper">
            <div className="rbt-banner-image" />
          </div>
          <div className="rbt-dashboard-area rbt-section-overlayping-top rbt-section-gapBottom">
            <div className="container">
              <div className="row">
                <div className="col-lg-12">
                  <InstructorDashboardHeader />

                  <div className="row g-5">
                    <div className="col-lg-3">
                      <InstructorDashboardSidebar />
                    </div>

                    <div className="col-lg-9">
                      {error ? (
                        <div className="rbt-dashboard-content bg-color-white rbt-shadow-box">
                          <div className="content">
                            <div className="alert alert-danger" role="alert">
                              <h4 className="alert-heading">
                                <i className="feather-alert-circle me-2"></i>
                                {error.includes('AUTH_REQUIRED')
                                  ? 'Authentication Required'
                                  : error.includes('ROLE_UNAUTHORIZED')
                                    ? 'Access Denied'
                                    : error.includes('COURSES_QUERY_FAILED')
                                      ? 'Failed to Load Courses'
                                      : error.includes(
                                            'ENROLLMENTS_QUERY_FAILED'
                                          )
                                        ? 'Failed to Load Enrollments'
                                        : 'Error Loading Students'}
                              </h4>
                              <p>
                                {error.includes('AUTH_REQUIRED')
                                  ? 'You must be logged in to view enrolled students.'
                                  : error.includes('ROLE_UNAUTHORIZED')
                                    ? 'Only instructors can view enrolled students.'
                                    : error.includes('USER_NOT_FOUND')
                                      ? 'Your user account could not be found in the database.'
                                      : error.includes('COURSES_QUERY_FAILED')
                                        ? 'There was an issue loading your courses. This might be due to database permissions.'
                                        : error.includes(
                                              'ENROLLMENTS_QUERY_FAILED'
                                            )
                                          ? 'There was an issue loading student enrollments. This might be due to database permissions.'
                                          : error}
                              </p>
                              <hr />
                              <div className="d-flex gap-2 mb-0">
                                <button
                                  className="btn btn-sm btn-primary"
                                  onClick={() => window.location.reload()}
                                >
                                  <i className="feather-refresh-cw me-2"></i>
                                  Retry
                                </button>
                                <a
                                  href="/instructor-dashboard"
                                  className="btn btn-sm btn-outline-secondary"
                                >
                                  <i className="feather-home me-2"></i>
                                  Back to Dashboard
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : initialData && initialData.students.length === 0 ? (
                        <div className="rbt-dashboard-content bg-color-white rbt-shadow-box">
                          <div className="content">
                            <div className="text-center py-5">
                              <i
                                className="feather-users"
                                style={{ fontSize: '48px', color: '#6b7385' }}
                              ></i>
                              <h4 className="mt-4 mb-3">
                                No Students Enrolled Yet
                              </h4>
                              <p className="text-muted mb-4">
                                {initialData.summary &&
                                  'Your courses are ready, but no students have enrolled yet.'}
                                <br />
                                Once students enroll in your courses, they will
                                appear here.
                              </p>
                              <div className="d-flex gap-2 justify-content-center">
                                <a
                                  href="/instructor-personal-courses"
                                  className="btn btn-primary"
                                >
                                  <i className="feather-book me-2"></i>
                                  View Your Courses
                                </a>
                                <button
                                  className="btn btn-outline-secondary"
                                  onClick={() => window.location.reload()}
                                >
                                  <i className="feather-refresh-cw me-2"></i>
                                  Refresh
                                </button>
                              </div>
                              <div className="mt-4 p-3 bg-light rounded">
                                <small className="text-muted">
                                  <i className="feather-info me-2"></i>
                                  <strong>Tip:</strong> Make sure your courses
                                  are published and visible to students. You can
                                  check the status of your courses in the
                                  <a
                                    href="/instructor-personal-courses"
                                    className="dark-safe-link ms-1"
                                  >
                                    courses management page
                                  </a>
                                  .
                                </small>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : initialData ? (
                        <EnrolledStudents
                          data={initialData.students}
                          summary={initialData.summary}
                        />
                      ) : (
                        <div className="rbt-dashboard-content bg-color-white rbt-shadow-box">
                          <div className="content">
                            <div className="text-center">
                              <div
                                className="spinner-border text-primary"
                                role="status"
                              >
                                <span className="visually-hidden">
                                  Loading...
                                </span>
                              </div>
                              <p className="mt-3">
                                Loading enrolled students...
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />
          <FooterOne
            isBox={false}
            bgColor=""
            newsletterBorder=""
            islamic={false}
          />
        </Context>
      </Provider>
    </>
  );
};

export default EnrolledStudentsClient;
