import BackToTop from '@/app/backToTop';
import LessonContent from './LessonContent';

export const metadata = {
  title: 'Lesson - Online Courses & Education',
  description: 'Online Courses & Education NEXTJS14 Template',
};

const LessonPage = ({ params }) => {
  return (
    <>
      <LessonContent lessonId={params.id} />
      <BackToTop />
    </>
  );
};

export default LessonPage;
