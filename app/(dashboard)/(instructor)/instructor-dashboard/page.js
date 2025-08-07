import { redirect } from 'next/navigation';

// 메타데이터 설정
export const metadata = {
  title: 'Instructor Dashboard - DVS-TEMPLATE01',
  description: 'Instructor Dashboard for DVS-TEMPLATE01',
};

const InstructorDashboardLayout = () => {
  // 통합 대시보드로 리다이렉트
  redirect('/dashboard');
};

export default InstructorDashboardLayout;
