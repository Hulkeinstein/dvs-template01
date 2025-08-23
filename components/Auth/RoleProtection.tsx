'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, ReactNode } from 'react';

interface RoleProtectionProps {
  allowedRoles: Array<'student' | 'instructor' | 'admin'>;
  children: ReactNode;
}

const RoleProtection = ({ allowedRoles, children }: RoleProtectionProps) => {
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

    // Type-safe access with augmented session
    const userRole = session.user.role;
    if (!allowedRoles.includes(userRole)) {
      router.push('/dashboard');
    }
  }, [isMounted, status, session, router, allowedRoles]);

  if (!isMounted) {
    return null;
  }

  if (status !== 'authenticated') {
    return <div>Loading...</div>;
  }

  if (allowedRoles.includes(session.user.role)) {
    return <>{children}</>;
  }

  return <div>Loading...</div>;
};

export default RoleProtection;
