'use client';

import StudentDashboardHeader from '@/components/Student/StudentDashboardHeader';
import StudentDashboardSidebar from '@/components/Student/StudentDashboardSidebar';
import Dashboard from '@/components/Student/Dashboard';
import FooterOne from '@/components/Footer/Footer-One';
import MobileMenu from '@/components/Header/MobileMenu';
import Cart from '@/components/Header/Offcanvas/Cart';
import HeaderStyleTen from '@/components/Header/HeaderStyle-Ten';
import Separator from '@/components/Common/Separator';
import Context from '@/context/Context';
import Store from '@/redux/store';
import { Provider } from 'react-redux';

interface StudentDashboardClientProps {
  userId?: string;
}

const StudentDashboardClient = ({ userId }: StudentDashboardClientProps) => {
  return (
    <>
      <Provider store={Store}>
        <Context>
          <MobileMenu />
          <HeaderStyleTen headerSticky="rbt-sticky" />
          <Cart />

          <div className="rbt-page-banner-wrapper">
            <div className="rbt-banner-image"></div>
          </div>

          <div className="rbt-dashboard-area rbt-section-overlayping-top rbt-section-gapBottom">
            <div className="container">
              <div className="row">
                <div className="col-lg-12">
                  <StudentDashboardHeader userId={userId} userProfile={null} />

                  <div className="row g-5">
                    <div className="col-lg-3">
                      <StudentDashboardSidebar />
                    </div>
                    <div className="col-lg-9">
                      <Dashboard userId={userId} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />
          <FooterOne
            bgColor="bg-color-white"
            isBox={false}
            newsletterBorder={false}
            islamic={false}
          />
        </Context>
      </Provider>
    </>
  );
};

export default StudentDashboardClient;
