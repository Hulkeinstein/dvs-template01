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
                                Error Loading Students
                              </h4>
                              <p>{error}</p>
                              <hr />
                              <p className="mb-0">
                                Please try refreshing the page or contact
                                support if the problem persists.
                              </p>
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
