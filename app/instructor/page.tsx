import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth.config';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import InstructorDashboard from '@/app/(dashboard)/(instructor)/instructor-dashboard/(dashboard)/index';
import { getInstructorDashboardData } from '@/app/lib/actions/getInstructorDashboardData';
import BackToTop from '@/app/backToTop';
import { UserRole } from '@/types/auth';
import { InstructorStats } from '@/types/dashboard';

// 동적 렌더링 강제
export const dynamic = 'force-dynamic';

// 메타데이터 설정 (타입 적용)
export const metadata: Metadata = {
  title: 'Instructor Dashboard - DVS-TEMPLATE01',
  description: 'Instructor Dashboard for Admin users',
};

// Admin이 Instructor 기능을 사용하는 페이지
const InstructorPage = async (): Promise<React.ReactElement> => {
  // 서버에서 현재 사용자 세션을 가져옵니다.
  const session = await getServerSession(authOptions);

  // 로그인하지 않은 경우 로그인 페이지로 리디렉트
  if (!session) {
    redirect('/login');
  }

  const userRole = (session.user?.role as UserRole) || 'student';
  const userId = session.user?.id;

  // Admin 역할만 접근 가능
  if (userRole !== 'admin') {
    redirect('/dashboard');
  }

  // 교사용 대시보드 데이터 조회
  const stats = (await getInstructorDashboardData(userId)) as InstructorStats;

  return (
    <>
      <InstructorDashboard stats={stats} />
      <BackToTop />
    </>
  );
};

export default InstructorPage;
