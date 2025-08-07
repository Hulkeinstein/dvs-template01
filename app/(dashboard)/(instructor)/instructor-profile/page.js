import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getUserProfile } from '@/app/lib/actions/getUserProfile';
import BackToTop from '@/app/backToTop';
import InstructorProfile from './(profile)';

export const metadata = {
  title: 'Instructor Profile - Online Courses & Education NEXTJS14 Template',
  description: 'Online Courses & Education NEXTJS14 Template',
};

const InstructorProfileLayout = async () => {
  // 서버에서 현재 사용자 세션을 가져옵니다.
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  // 사용자 프로필 데이터를 가져옵니다.
  const userProfile = await getUserProfile(userId);

  return (
    <>
      <InstructorProfile userProfile={userProfile} />
      <BackToTop />
    </>
  );
};

export default InstructorProfileLayout;
