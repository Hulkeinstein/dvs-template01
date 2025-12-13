'use client';

import Separator from '@/components/Common/Separator';
import FooterOne from '@/components/Footer/Footer-One';
import HeaderStyleTen from '@/components/Header/HeaderStyle-Ten';
import MobileMenu from '@/components/Header/MobileMenu';
import Cart from '@/components/Header/Offcanvas/Cart';
import EnrolledCoursesTS from '@/components/Student/EnrolledCoursesTS';
import InstructorDashboardHeader from '@/components/Instructor/InstructorDashboardHeader';
import InstructorDashboardSidebar from '@/components/Instructor/InstructorDashboardSidebar';
import Context from '@/context/Context';
import Store from '@/redux/store';
import { Provider } from 'react-redux';
import { useSession } from 'next-auth/react';

const EnrolledCoursesClient = () => {
  const { data: session } = useSession();

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
                      <EnrolledCoursesTS userId={session?.user?.id} />
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

export default EnrolledCoursesClient;
