import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth.config';
import { getDashboardUrl } from '@/app/lib/utils/roleRoutes';
import type { Metadata } from 'next';

// 메타데이터 설정
export const metadata: Metadata = {
  title: 'Admin Dashboard - DVS-TEMPLATE01',
  description: 'Admin Dashboard for DVS-TEMPLATE01',
};

const AdminDashboardLayout = async () => {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }
  const userRole = session?.user?.role;
  // 통합 대시보드로 리다이렉트
  redirect(getDashboardUrl(userRole));
};

export default AdminDashboardLayout;
