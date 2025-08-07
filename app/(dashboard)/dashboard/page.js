import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

// 컴포넌트 import
import StudentDashboard from '../(student)/student-dashboard/(dashboard)';
import InstructorDashboard from '../(instructor)/instructor-dashboard/(dashboard)';
import { getInstructorDashboardData } from '@/app/lib/actions/getInstructorDashboardData';
import BackToTop from '@/app/backToTop';

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

  // 3. 온보딩 제거 - 이제 모든 사용자가 대시보드에 접근 가능

  // 4. 역할에 따라 적절한 대시보드를 렌더링
  if (userRole === 'instructor') {
    // 교사용 대시보드 데이터 조회
    const stats = await getInstructorDashboardData(userId);

    return (
      <>
        <InstructorDashboard stats={stats} />
        <BackToTop />
      </>
    );
  } else {
    // 학생용 대시보드 - userProfile 전달
    return (
      <>
        <StudentDashboard />
        <BackToTop />
      </>
    );
  }
};

export default DashboardPage;
