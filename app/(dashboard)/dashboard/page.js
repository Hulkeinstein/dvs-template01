import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from 'next/navigation';

// 컴포넌트 import
import StudentDashboard from "../(student)/student-dashboard/(dashboard)";
import InstructorDashboard from "../(instructor)/instructor-dashboard/(dashboard)";
import { getInstructorDashboardData } from "@/app/lib/actions/getInstructorDashboardData";
import { getUserProfile } from "@/app/lib/actions/getUserProfile";
import BackToTop from "@/app/backToTop";

// 메타데이터 설정
export const metadata = {
  title: "Dashboard - DVS-TEMPLATE01",
  description: "Dashboard for DVS-TEMPLATE01",
};

// 통합 대시보드 - 역할에 따라 적절한 대시보드를 표시
const DashboardPage = async () => {
  // 1. 서버에서 현재 사용자 세션을 가져옵니다.
  const session = await getServerSession(authOptions);
  
  // 2. 로그인하지 않은 경우 로그인 페이지로 리다이렉트
  if (!session) {
    redirect('/login');
  }

  // 3. 프로필이 완성되지 않은 경우 온보딩으로 리다이렉트
  if (!session.user?.isProfileComplete) {
    redirect('/onboarding');
  }

  const userRole = session.user?.role || 'student';
  const userId = session.user?.id;

  // 4. 사용자 프로필 정보 가져오기 (배너 표시용)
  const userProfile = await getUserProfile(userId);

  // 5. 역할에 따라 적절한 대시보드를 렌더링
  if (userRole === 'instructor') {
    // 교사용 대시보드 데이터 조회
    const stats = await getInstructorDashboardData(userId);
    
    return (
      <>
        <InstructorDashboard stats={stats} userProfile={userProfile} />
        <BackToTop />
      </>
    );
  } else {
    // 학생용 대시보드
    return (
      <>
        <StudentDashboard userProfile={userProfile} />
        <BackToTop />
      </>
    );
  }
};

export default DashboardPage;