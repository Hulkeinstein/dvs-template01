import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth.config';
import { redirect } from 'next/navigation';

// UI 컴포넌트 import (서버 컴포넌트 아님)
import StudentDashboard from '../(student)/student-dashboard/(dashboard)';
import InstructorDashboard from '../(instructor)/instructor-dashboard/(dashboard)';
import { getInstructorDashboardData } from '@/app/lib/actions/getInstructorDashboardData';
import BackToTop from '@/app/backToTop';

// 동적 렌더링 강제
export const dynamic = 'force-dynamic';

// 메타데이터 설정
export const metadata = {
  title: 'Dashboard - DVS-TEMPLATE01',
  description: 'Dashboard for DVS-TEMPLATE01',
};

// 통합 대시보드 - 역할에 따라 적절한 대시보드를 표시
const DashboardPage = async () => {
  // 1. 서버에서 현재 사용자 세션을 가져옵니다.
  const session = await getServerSession(authOptions);

  // 2. 로그인하지 않은 경우 로그인 페이지로 리다이렉트
  if (!session) {
    redirect('/login');
  }

  const userRole = session.user?.role || 'student';
  const userId = session.user?.id;

  // 3. Admin과 Instructor는 InstructorDashboard 표시
  if (userRole === 'admin' || userRole === 'instructor') {
    console.log(
      '[Dashboard] Fetching data for user:',
      userId,
      'Role:',
      userRole
    );

    // 교사용 대시보드 데이터 조회 (서비스 키 사용 X)
    const stats = await getInstructorDashboardData(userId);

    console.log('[Dashboard] Stats received:', stats);

    return (
      <>
        <InstructorDashboard stats={stats} />
        <BackToTop />
      </>
    );
  } else {
    // 학생용 대시보드
    return (
      <>
        <StudentDashboard />
        <BackToTop />
      </>
    );
  }
};

export default DashboardPage;
