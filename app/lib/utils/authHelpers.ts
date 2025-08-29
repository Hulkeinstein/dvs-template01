/**
 * Auth Helper Functions (Client/Server Compatible)
 * These are synchronous utility functions that don't require 'use server'
 */

/**
 * Instructor 권한이 있는지 확인합니다 (Admin 포함).
 * @param role - 사용자 역할
 * @returns Instructor 또는 Admin이면 true
 */
export function hasInstructorPrivileges(role: string): boolean {
  return role === 'instructor' || role === 'admin';
}

/**
 * Instructor 또는 Admin 권한을 검증합니다.
 * @param role - 사용자 역할
 * @throws {Error} Instructor/Admin 권한이 없는 경우 에러 발생
 */
export function assertInstructorOrAdmin(role: string): void {
  if (!hasInstructorPrivileges(role)) {
    throw new Error('Instructor or Admin privileges required');
  }
}
