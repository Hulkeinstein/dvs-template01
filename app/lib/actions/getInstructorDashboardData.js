'use server';

import { supabase } from '@/app/lib/supabase/client';

/**
 * 교사 대시보드에 필요한 통계 데이터를 조회하는 서버 액션
 * @param {string} instructorId - 현재 로그인한 교사의 고유 ID
 * @returns {Promise<object>} 교사 대시보드 통계 데이터
 */
export async function getInstructorDashboardData(instructorId) {
  if (!instructorId) {
    // ... (기존 코드와 동일)
  }

  try {
    // --- 실제 데이터베이스 쿼리 구현 ---

    // 1. 현재 강사가 운영하는 모든 강의의 ID를 먼저 가져옵니다.
    const { data: coursesData, error: coursesError } = await supabase
      .from('courses')
      .select('id')
      .eq('instructor_id', instructorId);

    if (coursesError) throw coursesError;

    const courseIds = coursesData.map((course) => course.id);

    // courseIds가 비어있으면 더 이상 조회할 필요가 없으므로 기본값을 반환합니다.
    if (courseIds.length === 0) {
      return {
        totalStudents: 0,
        totalCourses: 0,
        totalEarnings: 0,
        activeCourses: 0,
        enrolledCourses: 0,
        completedCourses: 0,
      };
    }

    // 2. 여러 통계를 동시에 조회하기 위해 Promise.all을 사용합니다.
    const [
      totalStudentsResult,
      totalEarningsResult,
      activeCoursesResult,
      archivedCoursesResult,
    ] = await Promise.all([
      // 총 학생 수: 내 강의에 등록된 학생들의 수 (중복 제거)
      supabase
        .from('enrollments')
        .select('user_id', { count: 'exact', head: true })
        .in('course_id', courseIds),
      // 총 수익: 내 강의와 관련된 모든 주문의 금액 합계
      supabase.from('orders').select('amount').in('course_id', courseIds),
      // 활성 강의 수: 내 강의 중 상태가 'published'인 것의 개수
      supabase
        .from('courses')
        .select('id', { count: 'exact', head: true })
        .eq('instructor_id', instructorId)
        .eq('status', 'published'),
      // 보관된 강의 수: 내 강의 중 상태가 'archived'인 것의 개수
      supabase
        .from('courses')
        .select('id', { count: 'exact', head: true })
        .eq('instructor_id', instructorId)
        .eq('status', 'archived'),
    ]);

    // 3. 각 조회 결과를 계산합니다.
    const totalStudents = totalStudentsResult.count || 0;
    const totalEarnings = totalEarningsResult.data
      ? totalEarningsResult.data.reduce((sum, order) => sum + order.amount, 0)
      : 0;
    const activeCourses = activeCoursesResult.count || 0;
    const completedCourses = archivedCoursesResult.count || 0;

    // 대시보드 UI에 맞는 나머지 값들을 계산합니다.
    const totalCourses = courseIds.length;
    // 'Enrolled Courses'를 '총 수강 등록 건수'로 해석합니다.
    const { count: enrolledCourses } = await supabase
      .from('enrollments')
      .select('id', { count: 'exact', head: true })
      .in('course_id', courseIds);

    // 4. 최종 통계 객체를 반환합니다.
    return {
      totalStudents,
      totalCourses,
      totalEarnings,
      activeCourses,
      enrolledCourses: enrolledCourses || 0,
      completedCourses,
    };
  } catch (error) {
    console.error('교사 대시보드 데이터 조회 중 오류 발생:', error);
    // ... (기존 에러 처리 코드와 동일)
  }
}
