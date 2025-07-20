import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getInstructorDashboardData } from "@/app/lib/actions/getInstructorDashboardData";

import InstructorDashboard from "./(dashboard)";
import BackToTop from "@/app/backToTop";

// 메타데이터 설정
export const metadata = {
  title: "Instructor Dashboard - DVS-TEMPLATE01",
  description: "Instructor Dashboard for DVS-TEMPLATE01",
};

// 이 페이지는 서버 컴포넌트이므로 async를 사용할 수 있습니다.
const InstructorDashboardLayout = async () => {
  // 1. 서버에서 현재 사용자 세션을 가져옵니다.
  const session = await getServerSession(authOptions);
  const instructorId = session?.user?.id;

  // 2. 강사 ID를 사용하여 대시보드 데이터를 미리 조회합니다.
  const stats = await getInstructorDashboardData(instructorId);

  return (
    <>
      {/* 3. 조회된 통계 데이터(stats)를 <InstructorDashboard> 컴포넌트에 prop으로 전달합니다. */}
      <InstructorDashboard stats={stats} />
      <BackToTop />
    </>
  );
};

export default InstructorDashboardLayout;
