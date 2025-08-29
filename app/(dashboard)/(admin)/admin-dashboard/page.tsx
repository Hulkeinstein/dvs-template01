import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

// 메타데이터 설정
export const metadata: Metadata = {
  title: 'Admin Dashboard - DVS-TEMPLATE01',
  description: 'Admin Dashboard for DVS-TEMPLATE01',
};

const AdminDashboardLayout = () => {
  // 통합 대시보드로 리다이렉트
  redirect('/dashboard');
};

export default AdminDashboardLayout;
