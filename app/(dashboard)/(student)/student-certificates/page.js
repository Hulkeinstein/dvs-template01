import { redirect } from 'next/navigation';

export const metadata = {
  title: "My Certificates - DVS-TEMPLATE01",
  description: "View and download your course completion certificates",
};

const StudentCertificatesLayout = () => {
  // 통합 대시보드로 리다이렉트
  redirect('/dashboard');
};

export default StudentCertificatesLayout;