import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth.config';
import { redirect } from 'next/navigation';
import InstructorDashboard from './(dashboard)';
import { getInstructorDashboardData } from '@/app/lib/actions/getInstructorDashboardData';
import { getUserProfile } from '@/app/lib/actions/getUserProfile';
import { getDashboardUrl } from '@/app/lib/utils/roleRoutes';
import BackToTop from '@/app/backToTop';

// 메타데이터 설정
export const metadata = {
  title: 'Instructor Dashboard - DVS-TEMPLATE01',
  description: 'Instructor Dashboard for DVS-TEMPLATE01',
};

const InstructorDashboardPage = async () => {
  // 서버에서 현재 사용자 세션을 가져옵니다.
  const session = await getServerSession(authOptions);

  // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
  if (!session) {
    redirect('/login');
  }

  const userRole = session.user?.role || 'student';
  const userId = session.user?.id;

  // Admin 또는 Instructor 역할만 접근 가능 (Admin의 듀얼 역할 지원)
  if (userRole !== 'admin' && userRole !== 'instructor') {
    redirect(getDashboardUrl(userRole));
  }

  // Fetch user profile for display name
  let userProfile = null;
  if (userId) {
    userProfile = await getUserProfile(userId);
  }
  const userName = userProfile?.full_name || session.user?.name || 'User';

  // 교사용 대시보드 데이터 조회
  const stats = await getInstructorDashboardData(userId);

  return (
    <>
      <InstructorDashboard stats={stats} userName={userName} />
      <BackToTop />
    </>
  );
};

export default InstructorDashboardPage;
