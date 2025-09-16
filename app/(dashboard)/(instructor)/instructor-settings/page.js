import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth.config';
import { getUserProfile } from '@/app/lib/actions/getUserProfile';
import { redirect } from 'next/navigation';
import {
  hasInstructorAccess,
  getDashboardUrl,
} from '@/app/lib/utils/roleRoutes';
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

  const userRole = session.user?.role || 'student';

  // Admin과 instructor만 접근 가능
  if (!hasInstructorAccess(userRole)) {
    redirect(getDashboardUrl(userRole));
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
