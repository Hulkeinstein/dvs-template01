import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth.config';
import { redirect } from 'next/navigation';
import AdminRedirect from '@/components/Admin/AdminRedirect';

// 동적 렌더링 강제
export const dynamic = 'force-dynamic';

// 메타데이터 설정
export const metadata = {
  title: 'Admin - DVS-TEMPLATE01',
  description: 'Admin Dashboard for DVS-TEMPLATE01',
};

// Admin 페이지 - Admin 앱으로 리디렉트
const AdminPage = async () => {
  // 서버에서 현재 사용자 세션을 가져옵니다.
  const session = await getServerSession(authOptions);

  // 로그인하지 않은 경우 로그인 페이지로 리디렉트
  if (!session) {
    redirect('/login');
  }

  const userRole = session.user?.role || 'student';

  // Admin 역할이 아닌 경우 접근 거부
  if (userRole !== 'admin') {
    redirect('/dashboard');
  }

  // Admin 앱(포트 3002)으로 리디렉트
  const adminUrl =
    process.env.ADMIN_URL ||
    process.env.NEXT_PUBLIC_ADMIN_URL ||
    'http://localhost:3002';

  // 클라이언트 사이드 리디렉트 컴포넌트 사용
  return <AdminRedirect adminUrl={adminUrl} />;
};

export default AdminPage;
