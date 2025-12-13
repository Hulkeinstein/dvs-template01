import BackToTop from '@/app/backToTop';
import CourseReviewsPage from './(course-reviews)';

export const metadata = {
  title: 'Course Reviews - Online Courses & Education NEXTJS14 Template',
  description: 'Reviews received from students on your courses',
};

const CourseReviewsLayout = () => {
  return (
    <>
      <CourseReviewsPage />

      <BackToTop />
    </>
  );
};

export default CourseReviewsLayout;
