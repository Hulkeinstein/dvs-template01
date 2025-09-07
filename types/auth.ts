// 사용자 역할 타입 정의 (next-auth.d.ts와 일치)
export type UserRole = 'admin' | 'instructor' | 'student';

// RoleProtection 컴포넌트 Props 타입
export interface RoleProtectionProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
}

// 사용자 타입
export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  image?: string;
}

// 세션 타입 (NextAuth와 통합)
export interface Session {
  user: User;
  expires: string;
}
