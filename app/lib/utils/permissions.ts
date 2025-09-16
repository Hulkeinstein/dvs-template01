import { UserRole } from '@/types/auth';

// 권한 매트릭스: 각 역할이 접근할 수 있는 리소스 정의
const PERMISSIONS = {
  admin: ['*' as const], // 모든 권한
  instructor: [
    'instructor-dashboard',
    'courses:manage',
    'students:view',
    'quizzes:manage',
    'assignments:manage',
    'announcements:manage',
  ] as const,
  student: [
    'student-dashboard',
    'courses:enroll',
    'courses:view',
    'quizzes:take',
    'assignments:submit',
  ] as const,
} as const;

// 역할 계층 구조: 상위 역할은 하위 역할의 모든 권한을 포함
const ROLE_HIERARCHY: Record<UserRole, UserRole[]> = {
  admin: ['admin', 'instructor', 'student'], // admin은 모든 역할 포함
  instructor: ['instructor', 'student'], // instructor는 student 권한 포함
  student: ['student'], // student는 자기 자신만
};

/**
 * 특정 역할이 다른 역할을 포함하는지 체크
 * @param userRole 현재 사용자 역할
 * @param targetRole 체크할 대상 역할
 * @returns 포함 여부
 */
export function roleIncludes(
  userRole: UserRole,
  targetRole: UserRole
): boolean {
  return ROLE_HIERARCHY[userRole]?.includes(targetRole) ?? false;
}

/**
 * 특정 리소스에 대한 접근 권한 체크
 * @param resource 접근하려는 리소스
 * @param userRole 사용자 역할
 * @returns 접근 가능 여부
 */
export function canAccess(resource: string, userRole?: UserRole): boolean {
  if (!userRole) return false;

  const permissions = PERMISSIONS[userRole] as readonly string[];
  if (!permissions) return false;

  // admin은 모든 리소스 접근 가능
  if (permissions.includes('*')) return true;

  // 특정 권한 체크
  return permissions.includes(resource);
}

/**
 * 역할 배열 중 하나라도 사용자가 가진 권한에 포함되는지 체크
 * (RoleProtection 컴포넌트에서 사용)
 * @param userRole 사용자 역할
 * @param allowedRoles 허용된 역할 배열
 * @returns 접근 가능 여부
 */
export function hasAnyRole(
  userRole: UserRole | undefined,
  allowedRoles: UserRole[]
): boolean {
  if (!userRole) return false;

  const userPermissions = ROLE_HIERARCHY[userRole] || [];
  return allowedRoles.some((role) => userPermissions.includes(role));
}

// Export constants for external use
export { ROLE_HIERARCHY, PERMISSIONS };
