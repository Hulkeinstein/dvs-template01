import HeaderDashboard from '@/components/Header/HeaderDashboard';
import AdminDashboardSidebar from '@/components/Admin/AdminDashboardSidebar';
import MobileMenu from '@/components/Header/MobileMenu';
import Cart from '@/components/Header/Offcanvas/Cart';

const AdminLayout = ({ children }) => {
  return (
    <>
      <div className="rbt-page-banner-wrapper">
        <div className="rbt-banner-image" />
      </div>

      <div className="rbt-dashboard-area rbt-section-overlayping-top rbt-section-gapBottom">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <HeaderDashboard />

              <div className="row g-5">
                <div className="col-lg-3">
                  <AdminDashboardSidebar />
                </div>

                <div className="col-lg-9">{children}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <MobileMenu />
      <Cart />
    </>
  );
};

export default AdminLayout;