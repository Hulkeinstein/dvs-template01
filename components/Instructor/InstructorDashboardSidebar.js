"use client";

import { usePathname } from "next/navigation";
import SidebarData from "../../data/dashboard/instructor/siderbar.json";
import Link from "next/link";

const InstructorDashboardSidebar = () => {
  const pathname = usePathname();

  return (
    <>
      <div className="rbt-default-sidebar sticky-top rbt-shadow-box rbt-gradient-border">
        <div className="inner">
          <div className="content-item-content">
            <div className="rbt-default-sidebar-wrapper">
              {SidebarData && SidebarData.sections && SidebarData.sections.map((section, sectionIndex) => (
                <div key={sectionIndex}>
                  {sectionIndex === 0 ? (
                    <div className="section-title mb--20">
                      <h6 className="rbt-title-style-2">Welcome, Rafi</h6>
                    </div>
                  ) : (
                    <div className="section-title mt--40 mb--20">
                      <h6 className="rbt-title-style-2">{section.title}</h6>
                    </div>
                  )}
                  
                  <nav className="mainmenu-nav">
                    <ul className="dashboard-mainmenu rbt-default-sidebar-list">
                      {section.items && section.items.map((item, itemIndex) => (
                        <li key={itemIndex} className={sectionIndex === 0 ? "nav-item" : ""}>
                          <Link
                            href={item.link}
                            className={`${pathname === item.link ? "active" : ""}`}
                          >
                            <i className={item.icon} />
                            <span>{item.text}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InstructorDashboardSidebar;