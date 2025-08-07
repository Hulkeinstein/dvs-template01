import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getUserProfile } from '@/app/lib/actions/getUserProfile';
import { redirect } from 'next/navigation';
import BackToTop from '@/app/backToTop';
import SettingPage from './(settings)';

export const metadata = {
  title: 'Instructor Settings - Online Courses & Education NEXTJS14 Template',
  description: 'Online Courses & Education NEXTJS14 Template',
};

const SettingLayout = async () => {
  // 서버에서 현재 사용자 세션을 가져옵니다.
  const session = await getServerSession(authOptions);

  // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
  if (!session) {
    redirect('/login');
  }

  // 학생이 instructor-settings에 접근하는 경우 student-settings로 리다이렉트
  if (session.user?.role !== 'instructor') {
    redirect('/student-settings');
  }

  const userId = session?.user?.id;

  // 사용자 프로필 데이터를 가져옵니다.
  const userProfile = await getUserProfile(userId);

  return (
    <>
      <SettingPage userProfile={userProfile} />
      <BackToTop />
    </>
  );
};

export default SettingLayout;
