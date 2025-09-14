'use client';

import React from 'react';
import { Provider } from 'react-redux';
import Separator from '@/components/Common/Separator';
import FooterOne from '@/components/Footer/Footer-One';
import HeaderStyleTen from '@/components/Header/HeaderStyle-Ten';
import MobileMenu from '@/components/Header/MobileMenu';
import Cart from '@/components/Header/Offcanvas/Cart';
import Dashboard from '@/components/Instructor/Dashboard';
import InstructorDashboardHeader from '@/components/Instructor/InstructorDashboardHeader';
import InstructorDashboardSidebar from '@/components/Instructor/InstructorDashboardSidebar';
import Context from '@/context/Context';
import Store from '@/redux/store';
import RoleProtection from '@/components/Auth/RoleProtection';
import { InstructorStats } from '@/types/dashboard';
import { INSTRUCTOR_REALM_ROLES } from '@/app/lib/auth/realmRoles';

// Props 타입 정의
interface InstructorDashboardProps {
  stats: InstructorStats;
}

// --- 핵심 수정 사항 ---
// 이 컴포넌트는 이제 부모(page.tsx)로부터 stats prop을 전달받습니다.
const InstructorDashboard: React.FC<InstructorDashboardProps> = ({ stats }) => {
  return (
    <>
      <Provider store={Store}>
        <Context>
          <MobileMenu />
          <HeaderStyleTen headerSticky="rbt-sticky" headerType="" />
          <Cart />

          <div className="rbt-page-banner-wrapper">
            <div className="rbt-banner-image" />
          </div>
          <div className="rbt-dashboard-area rbt-section-overlayping-top rbt-section-gapBottom">
            <div className="container">
              <div className="row">
                <div className="col-lg-12">
                  <RoleProtection allowedRoles={INSTRUCTOR_REALM_ROLES}>
                    <InstructorDashboardHeader />

                    <div className="row g-5">
                      <div className="col-lg-3">
                        <InstructorDashboardSidebar />
                      </div>
                      <div className="col-lg-9">
                        {/* 전달받은 통계 데이터(stats)를 Dashboard 컴포넌트에 넘겨줍니다. */}
                        <Dashboard stats={stats} />
                      </div>
                    </div>
                  </RoleProtection>
                </div>
              </div>
            </div>
          </div>

          <Separator />
          <FooterOne />
        </Context>
      </Provider>
    </>
  );
};

export default InstructorDashboard;
