import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Student Dashboard - Online Courses & Education NEXTJS14 Template',
  description: 'Online Courses & Education NEXTJS14 Template',
};

const StudentDashboardLayout = () => {
  // 통합 대시보드로 리다이렉트
  redirect('/dashboard');
};

export default StudentDashboardLayout;
