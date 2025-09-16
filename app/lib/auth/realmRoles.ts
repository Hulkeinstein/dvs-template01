/**
 * 역할 기반 접근 제어를 위한 Realm Roles 정의
 *
 * Realm이란 동일한 권한 영역을 공유하는 역할 그룹을 의미합니다.
 * 예: Instructor Realm에는 instructor와 admin이 모두 포함됩니다.
 */

import { UserRole } from '@/types/auth';

/**
 * Instructor Realm Roles
 * - instructor: 일반 강사
 * - admin: 관리자 (모든 강사 기능 접근 가능)
 */
export const INSTRUCTOR_REALM_ROLES: readonly UserRole[] = [
  'instructor',
  'admin',
] as const;

/**
 * Student Realm Roles
 * - student: 일반 학생
 * 참고: admin은 학생 기능에 직접 접근하지 않음 (관리 기능 통해 접근)
 */
export const STUDENT_REALM_ROLES: readonly UserRole[] = ['student'] as const;

/**
 * Admin Realm Roles
 * - admin: 관리자 전용 기능
 */
export const ADMIN_REALM_ROLES: readonly UserRole[] = ['admin'] as const;

/**
 * 모든 역할 (전체 사용자 접근 가능한 페이지용)
 */
export const ALL_ROLES: readonly UserRole[] = [
  'admin',
  'instructor',
  'student',
] as const;

/**
 * Helper function to check if user has instructor realm access
 */
export function hasInstructorRealmAccess(
  role: UserRole | null | undefined
): boolean {
  if (!role) return false;
  return INSTRUCTOR_REALM_ROLES.includes(role as UserRole);
}

/**
 * Helper function to check if user has student realm access
 */
export function hasStudentRealmAccess(
  role: UserRole | null | undefined
): boolean {
  if (!role) return false;
  return STUDENT_REALM_ROLES.includes(role as UserRole);
}

/**
 * Helper function to check if user has admin realm access
 */
export function hasAdminRealmAccess(
  role: UserRole | null | undefined
): boolean {
  if (!role) return false;
  return ADMIN_REALM_ROLES.includes(role as UserRole);
}
