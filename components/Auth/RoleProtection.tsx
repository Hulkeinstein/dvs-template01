'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, ReactNode } from 'react';
import { UserRole } from '@/types/auth';
import { hasAnyRole } from '@/app/lib/utils/permissions';

interface RoleProtectionProps {
  allowedRoles: UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
}

const RoleProtection = ({
  allowedRoles,
  children,
  fallback = null,
}: RoleProtectionProps) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || status === 'loading') {
      return;
    }

    if (!session) {
      router.push('/login');
      return;
    }

    // 권한 계층 구조를 적용한 체크
    const userRole = session.user?.role as UserRole;
    if (!userRole || !hasAnyRole(userRole, allowedRoles)) {
      router.push('/dashboard');
    }
  }, [isMounted, status, session, router, allowedRoles]);

  if (!isMounted) {
    return null;
  }

  if (status !== 'authenticated') {
    return <div>Loading...</div>;
  }

  // 권한 계층 구조를 적용한 체크 (admin은 모든 권한 자동 포함)
  const userRole = session.user?.role as UserRole;
  if (userRole && hasAnyRole(userRole, allowedRoles)) {
    return <>{children}</>;
  }

  // fallback이 제공되면 사용, 아니면 Loading 표시
  return <>{fallback || <div>Loading...</div>}</>;
};

export default RoleProtection;
