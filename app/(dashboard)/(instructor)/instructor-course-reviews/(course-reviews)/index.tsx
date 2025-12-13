'use client';

import Separator from '@/components/Common/Separator';
import FooterOne from '@/components/Footer/Footer-One';
import HeaderStyleTen from '@/components/Header/HeaderStyle-Ten';
import MobileMenu from '@/components/Header/MobileMenu';
import Cart from '@/components/Header/Offcanvas/Cart';
import InstructorDashboardHeader from '@/components/Instructor/InstructorDashboardHeader';
import InstructorDashboardSidebar from '@/components/Instructor/InstructorDashboardSidebar';
import CourseReviews from '@/components/Instructor/CourseReviews';
import Context from '@/context/Context';
import Store from '@/redux/store';
import { Provider } from 'react-redux';
import { useSession } from 'next-auth/react';

const CourseReviewsPage = () => {
  const { data: session } = useSession();

  return (
    <>
      <Provider store={Store}>
        <Context>
          <MobileMenu />
          {/* @ts-expect-error - HeaderStyleTen has loose typing from JS template */}
          <HeaderStyleTen headerSticky="rbt-sticky" headerType="" />
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
                      <CourseReviews instructorId={session?.user?.id} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />
          {/* @ts-expect-error - FooterOne has loose typing from JS template */}
          <FooterOne />
        </Context>
      </Provider>
    </>
  );
};

export default CourseReviewsPage;
