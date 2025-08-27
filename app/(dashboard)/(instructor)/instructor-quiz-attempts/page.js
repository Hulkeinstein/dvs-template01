import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth.config';
import { redirect } from 'next/navigation';
import { getInstructorQuizAttempts } from '@/app/lib/actions/quizActions';
import { getUserProfile } from '@/app/lib/actions/getUserProfile';
import BackToTop from '@/app/backToTop';
import QuizAttemptsPage from './(quiz-attempts)';

export const metadata = {
  title:
    'Instructor Quiz Attempts Course - Online Courses & Education NEXTJS14 Template',
  description: 'Online Courses & Education NEXTJS14 Template',
};

const QuizAttemptsLayout = async () => {
  // 세션 확인
  const session = await getServerSession(authOptions);

  // 비로그인 시 리다이렉트
  if (!session?.user?.id) {
    redirect('/login');
  }

  // instructor가 아닌 경우 리다이렉트
  const userProfile = await getUserProfile(session.user.id);
  if (userProfile?.role !== 'instructor') {
    redirect('/student-dashboard');
  }

  // 퀴즈 시도 데이터 가져오기
  const { data: quizAttempts, error } = await getInstructorQuizAttempts(
    session.user.id
  );

  return (
    <>
      <QuizAttemptsPage quizAttempts={quizAttempts || []} error={error} />
      <BackToTop />
    </>
  );
};

export default QuizAttemptsLayout;
