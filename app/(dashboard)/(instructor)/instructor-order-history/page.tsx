import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth.config';
import { redirect } from 'next/navigation';
import { getInstructorOrders } from '@/app/lib/actions/orderActions';
import { getUserProfile } from '@/app/lib/actions/getUserProfile';
import BackToTop from '@/app/backToTop';
import OrderHistoryPage from './(order-history)';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title:
    'Instructor Order History - Online Courses & Education NEXTJS14 Template',
  description: 'Online Courses & Education NEXTJS14 Template',
};

const OrderHistoryLayout = async () => {
  // Check session
  const session = await getServerSession(authOptions);

  // Redirect if not logged in
  if (!session?.user?.id) {
    redirect('/login');
  }

  // Only Admin and instructor can access
  const userProfile = await getUserProfile(session.user.id);
  if (userProfile?.role !== 'instructor' && userProfile?.role !== 'admin') {
    redirect('/student-dashboard');
  }

  // Fetch order data
  let orders = await getInstructorOrders(session.user.id);
  let error: string | null = null;

  if (!orders) {
    orders = [];
    error = 'Failed to load order history';
  }

  return (
    <>
      <OrderHistoryPage orders={orders} error={error} />
      <BackToTop />
    </>
  );
};

export default OrderHistoryLayout;
