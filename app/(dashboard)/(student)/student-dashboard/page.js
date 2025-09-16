import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth.config';
import { getDashboardUrl } from '@/app/lib/utils/roleRoutes';

export const metadata = {
  title: 'Student Dashboard - Online Courses & Education NEXTJS14 Template',
  description: 'Online Courses & Education NEXTJS14 Template',
};

const StudentDashboardLayout = async () => {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }
  const userRole = session?.user?.role;
  // 통합 대시보드로 리다이렉트
  redirect(getDashboardUrl(userRole));
};

export default StudentDashboardLayout;
