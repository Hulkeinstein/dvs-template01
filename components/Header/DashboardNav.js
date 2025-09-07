'use client';

import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const DashboardNav = () => {
  const { data: session } = useSession();
  const pathname = usePathname();
  const userRole = session?.user?.role || 'student';

  const isActive = (href) => pathname === href || pathname.startsWith(href);

  // Admin 역할인 경우 Dashboard 메뉴에 드롭다운 추가
  if (userRole === 'admin') {
    return (
      <li className="has-dropdown">
        <Link
          className={
            isActive('/dashboard') ||
            isActive('/admin') ||
            isActive('/instructor')
              ? 'active'
              : ''
          }
          href="#"
        >
          Dashboard
          <i className="feather-chevron-down"></i>
        </Link>
        <ul className="submenu">
          <li>
            <Link className={isActive('/admin') ? 'active' : ''} href="/admin">
              Admin
            </Link>
          </li>
          <li>
            <Link
              className={isActive('/instructor') ? 'active' : ''}
              href="/instructor"
            >
              Instructor
            </Link>
          </li>
        </ul>
      </li>
    );
  }

  // 일반 사용자(instructor/student)는 Dashboard 메뉴만 표시
  return (
    <li>
      <Link
        className={isActive('/dashboard') ? 'active' : ''}
        href="/dashboard"
      >
        Dashboard
      </Link>
    </li>
  );
};

export default DashboardNav;
