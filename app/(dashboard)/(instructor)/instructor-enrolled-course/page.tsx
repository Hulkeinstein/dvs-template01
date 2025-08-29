import BackToTop from '@/app/backToTop';
import EnrolledCoursePage from './(enrolled-course)';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Enrolled Students - Online Courses & Education NEXTJS14 Template',
  description: 'View and manage students enrolled in your courses',
};

const EnrolledCourseLayout = () => {
  return (
    <>
      <EnrolledCoursePage />
      <BackToTop />
    </>
  );
};

export default EnrolledCourseLayout;
