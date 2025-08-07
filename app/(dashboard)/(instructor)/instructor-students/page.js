import BackToTop from '@/app/backToTop';
import StudentManagementPage from './(students)';

export const metadata = {
  title: 'Students - Histudy',
  description: 'Manage your students and track their progress',
};

const StudentManagementLayout = () => {
  return (
    <>
      <StudentManagementPage />
      <BackToTop />
    </>
  );
};

export default StudentManagementLayout;
