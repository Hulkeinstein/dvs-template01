'use server';

import { supabaseServer as supabase } from '@/app/lib/supabase/server';
import type { AdminAction } from '@/types/admin';

/**
 * Admin 권한을 검증합니다.
 * @param userId - 사용자 ID
 * @throws {Error} Admin 권한이 없는 경우 에러 발생
 */
export async function assertAdmin(userId: string): Promise<void> {
  if (!userId) {
    throw new Error('Unauthorized: User ID required');
  }

  const { data: user, error } = await supabase
    .from('user')
    .select('role')
    .eq('id', userId)
    .single();

  if (error || !user || user.role !== 'admin') {
    throw new Error('Unauthorized: Admin access required');
  }
}

/**
 * Admin 접근 로그를 기록합니다.
 * @param userId - Admin 사용자 ID
 * @param action - 수행한 액션
 * @param details - 추가 상세 정보
 */
export async function logAdminAccess(
  userId: string,
  action: AdminAction,
  details: Record<string, any> | null = null
): Promise<void> {
  try {
    // admin_audit_logs 테이블이 없는 경우 에러 무시
    await supabase.from('admin_audit_logs').insert({
      admin_id: userId,
      action,
      details,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    // 로그 실패는 무시 (테이블이 아직 없을 수 있음)
    console.log('Audit log skipped:', error instanceof Error ? error.message : 'Unknown error');
  }
}

/**
 * 사용자의 역할을 확인합니다.
 * @param userId - 사용자 ID
 * @returns 사용자 역할
 */
export async function getUserRole(userId: string): Promise<string | null> {
  if (!userId) return null;

  const { data: user, error } = await supabase
    .from('user')
    .select('role')
    .eq('id', userId)
    .single();

  if (error || !user) return null;
  return user.role;
}

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