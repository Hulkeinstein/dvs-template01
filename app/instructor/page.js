import { redirect } from 'next/navigation';

// 메타데이터 설정
export const metadata = {
  title: 'Instructor - DVS-TEMPLATE01',
  description: 'Instructor Dashboard for DVS-TEMPLATE01',
};

// Admin이 Instructor 역할로 접근할 때
const InstructorPage = () => {
  // instructor-dashboard로 리다이렉트
  redirect('/instructor-dashboard');
};

export default InstructorPage;
