import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth.config';
import StudentDashboardClient from './StudentDashboardClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Student Dashboard - Online Courses & Education NEXTJS14 Template',
  description: 'Online Courses & Education NEXTJS14 Template',
};

const StudentDashboardPage = async () => {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  // role이 instructor나 admin이면 instructor-dashboard로 리다이렉트
  if (session.user?.role === 'instructor' || session.user?.role === 'admin') {
    redirect('/instructor-dashboard');
  }

  return <StudentDashboardClient userId={session.user?.id} />;
};

export default StudentDashboardPage;
