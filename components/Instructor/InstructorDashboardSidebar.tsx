'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  resolveUrl,
  hasInstructorAccess,
  UserRole,
} from '@/app/lib/utils/roleRoutes';
import SidebarData from '../../data/dashboard/sidebar-items.json';

interface SidebarItem {
  key: string;
  label: string;
  icon: string;
  href?: string;
  isStatic?: boolean;
}

interface SidebarSection {
  title: string;
  items: SidebarItem[];
  requiresInstructorAccess?: boolean;
}

const InstructorDashboardSidebar = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userRole = (session?.user?.role || 'student') as UserRole;
  const userName = session?.user?.name || 'User';

  // Helper function to check if a path is active
  const isActive = (href: string): boolean => {
    if (pathname === href) return true;
    // Check if current path starts with href (for nested routes)
    if (pathname.startsWith(href + '/')) return true;
    return false;
  };

  // Helper function to get the href for an item
  const getItemHref = (item: SidebarItem): string => {
    // For static links (like logout), use the provided href
    if (item.isStatic && item.href) {
      return item.href;
    }
    // Otherwise, resolve based on key and role
    return resolveUrl(item.key, userRole);
  };

  return (
    <>
      <div className="rbt-default-sidebar sticky-top rbt-shadow-box rbt-gradient-border">
        <div className="inner">
          <div className="content-item-content">
            <div className="rbt-default-sidebar-wrapper">
              {SidebarData &&
                SidebarData.sections &&
                SidebarData.sections.map(
                  (section: SidebarSection, sectionIndex: number) => {
                    // Skip instructor section if user doesn't have access
                    if (
                      section.requiresInstructorAccess &&
                      !hasInstructorAccess(userRole)
                    ) {
                      return null;
                    }

                    return (
                      <div key={sectionIndex}>
                        {sectionIndex === 0 ? (
                          <div className="section-title mb--20">
                            <h6 className="rbt-title-style-2">
                              Welcome, {userName}
                            </h6>
                          </div>
                        ) : (
                          <div className="section-title mt--40 mb--20">
                            <h6 className="rbt-title-style-2">
                              {section.title}
                            </h6>
                          </div>
                        )}

                        <nav className="mainmenu-nav">
                          <ul className="dashboard-mainmenu rbt-default-sidebar-list">
                            {section.items &&
                              section.items.map(
                                (item: SidebarItem, itemIndex: number) => {
                                  const href = getItemHref(item);
                                  const active = isActive(href);

                                  return (
                                    <li
                                      key={itemIndex}
                                      className={
                                        sectionIndex === 0 ? 'nav-item' : ''
                                      }
                                    >
                                      <Link
                                        href={href}
                                        className={active ? 'active' : ''}
                                      >
                                        <i className={item.icon} />
                                        <span>{item.label}</span>
                                      </Link>
                                    </li>
                                  );
                                }
                              )}
                          </ul>
                        </nav>
                      </div>
                    );
                  }
                )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InstructorDashboardSidebar;
