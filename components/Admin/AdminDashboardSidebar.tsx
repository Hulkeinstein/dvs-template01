'use client';

import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import type { AdminSidebarSection } from '@/types/admin';

// Import sidebar data with type assertion
import sidebarDataJson from '@/data/dashboard/admin/sidebar.json';

const sidebarData = sidebarDataJson as { sections: AdminSidebarSection[] };

const AdminDashboardSidebar: React.FC = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userName = session?.user?.name || 'Admin';

  return (
    <>
      <div className="rbt-default-sidebar sticky-top rbt-shadow-box rbt-gradient-border">
        <div className="inner">
          <div className="content-item-content">
            <div className="rbt-default-sidebar-wrapper">
              {sidebarData &&
                sidebarData.sections &&
                sidebarData.sections.map((section, sectionIndex) => (
                  <div key={sectionIndex}>
                    {sectionIndex === 0 ? (
                      <div className="section-title mb--20">
                        <h6 className="rbt-title-style-2">
                          <i className="feather-shield" /> Administrator Panel
                        </h6>
                        <p className="b3 text-muted">Welcome, {userName}</p>
                      </div>
                    ) : (
                      <div className="section-title mt--40 mb--20">
                        <h6 className="rbt-title-style-2">{section.title}</h6>
                      </div>
                    )}

                    <nav className="mainmenu-nav">
                      <ul className="dashboard-mainmenu rbt-default-sidebar-list">
                        {section.items &&
                          section.items.map((item, itemIndex) => (
                            <li
                              key={itemIndex}
                              className={sectionIndex === 0 ? 'nav-item' : ''}
                            >
                              <Link
                                href={item.link}
                                className={`${pathname === item.link ? 'active' : ''}`}
                              >
                                <i className={item.icon} />
                                <span>{item.text}</span>
                                {/* Badge for pending items */}
                                {item.link === '/admin-pending' && (
                                  <span className="rbt-badge-5 ml--10">3</span>
                                )}
                                {item.link === '/admin-updates' && (
                                  <span className="rbt-badge-5 bg-primary-opacity ml--10">New</span>
                                )}
                              </Link>
                            </li>
                          ))}
                      </ul>
                    </nav>
                  </div>
                ))}

              {/* Admin Info Card */}
              <div className="section-title mt--40 mb--20">
                <h6 className="rbt-title-style-2">System Info</h6>
              </div>
              <div className="rbt-course-widget-wrapper">
                <div className="rbt-course-widget rbt-course-widget-2">
                  <div className="inner">
                    <div className="thumbnail">
                      <i className="feather-info" />
                    </div>
                    <div className="content">
                      <h6 className="title">Platform Version</h6>
                      <p className="b3">v1.0.0</p>
                    </div>
                  </div>
                </div>
                <div className="rbt-course-widget rbt-course-widget-2 mt--20">
                  <div className="inner">
                    <div className="thumbnail">
                      <i className="feather-database" />
                    </div>
                    <div className="content">
                      <h6 className="title">Database Status</h6>
                      <p className="b3 text-success">Connected</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              <div className="section-title mt--40">
                <Link href="/api/auth/signout" className="rbt-btn btn-gradient btn-sm w-100">
                  <i className="feather-log-out" /> Logout
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboardSidebar;