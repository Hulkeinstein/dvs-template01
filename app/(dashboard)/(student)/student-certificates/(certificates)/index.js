"use client";

import Context from "@/context/Context";
import Store from "@/redux/store";
import { Provider } from "react-redux";
import { useSession } from "next-auth/react";

import Separator from "@/components/Common/Separator";
import FooterOne from "@/components/Footer/Footer-One";
import HeaderStyleTen from "@/components/Header/HeaderStyle-Ten";
import MobileMenu from "@/components/Header/MobileMenu";
import Cart from "@/components/Header/Offcanvas/Cart";
import StudentDashboardHeader from "@/components/Student/StudentDashboardHeader";
import StudentDashboardSidebar from "@/components/Student/StudentDashboardSidebar";
import StudentCertificates from "@/components/Student/Certificates";
import RoleProtection from "@/components/Auth/RoleProtection";

const StudentCertificatesPage = () => {
  const { data: session } = useSession();
  
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
                  <RoleProtection allowedRoles={["student"]}>
                    <StudentDashboardHeader 
                      userId={session?.user?.id} 
                      userProfile={session?.user}
                    />

                    <div className="row g-5">
                      <div className="col-lg-3">
                        <StudentDashboardSidebar />
                      </div>

                      <div className="col-lg-9">
                        <StudentCertificates userId={session?.user?.id} />
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

export default StudentCertificatesPage;