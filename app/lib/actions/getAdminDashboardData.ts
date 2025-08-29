'use server';

import { supabaseServer as supabase } from '@/app/lib/supabase/server';
import { assertAdmin, logAdminAccess } from '@/app/lib/utils/authUtils';
import type { AdminDashboardStats } from '@/types/admin';

/**
 * Admin 대시보드용 통계 데이터를 조회합니다.
 * @param userId - Admin 사용자 ID
 * @returns 플랫폼 전체 통계
 */
export async function getAdminDashboardData(
  userId: string
): Promise<AdminDashboardStats> {
  try {
    // 1. Admin 권한 검증
    await assertAdmin(userId);

    // 2. 병렬 쿼리로 성능 최적화
    const [
      usersResult,
      instructorsResult,
      studentsResult,
      coursesResult,
      activeCoursesResult,
      enrollmentsResult,
    ] = await Promise.all([
      // 전체 사용자 수
      supabase.from('user').select('*', { count: 'exact', head: true }),
      // 교사 수
      supabase
        .from('user')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'instructor'),
      // 학생 수
      supabase
        .from('user')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'student'),
      // 전체 코스 수
      supabase.from('courses').select('*', { count: 'exact', head: true }),
      // 활성 코스 수 (published 상태)
      supabase
        .from('courses')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published'),
      // 전체 등록 수
      supabase.from('enrollments').select('*', { count: 'exact', head: true }),
    ]);

    // 3. 오늘 신규 사용자 수 (24시간 이내)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count: newUsersToday } = await supabase
      .from('user')
      .select('*', { count: 'exact', head: true })
      .gte('createdAt', yesterday);

    // 4. 최근 활성 사용자 (7일 이내 로그인)
    const lastWeek = new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000
    ).toISOString();
    const { count: activeUsersWeek } = await supabase
      .from('user')
      .select('*', { count: 'exact', head: true })
      .gte('lastSignInTime', lastWeek);

    // 5. 감사 로그 기록
    await logAdminAccess(userId, 'dashboard_view');

    // 6. 통계 데이터 반환
    const stats: AdminDashboardStats = {
      // 사용자 통계
      totalUsers: usersResult.count || 0,
      totalInstructors: instructorsResult.count || 0,
      totalStudents: studentsResult.count || 0,

      // 코스 통계
      totalCourses: coursesResult.count || 0,
      activeCourses: activeCoursesResult.count || 0,

      // 등록 통계
      totalEnrollments: enrollmentsResult.count || 0,

      // 최근 활동
      newUsersToday: newUsersToday || 0,
      activeUsersWeek: activeUsersWeek || 0,

      // 수익 (Phase 2에서 구현)
      totalRevenue: 0,
      monthlyRevenue: 0,

      // 플랫폼 상태
      platformHealth: 'good',
      lastUpdate: new Date().toISOString(),
    };

    return stats;
  } catch (error) {
    console.error('Error fetching admin dashboard data:', error);
    throw new Error('Failed to load admin dashboard data');
  }
}
