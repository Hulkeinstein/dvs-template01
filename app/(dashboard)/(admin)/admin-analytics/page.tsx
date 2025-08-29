import type { Metadata } from 'next';
import ComingSoonPage from '@/components/Admin/ComingSoonPage';

export const metadata: Metadata = {
  title: 'Analytics & Reports - Admin Dashboard',
  description: 'Platform analytics and detailed reports',
};

export default function AdminAnalyticsPage() {
  const futureFeatures = [
    'Advanced user behavior analytics',
    'Revenue and financial reports',
    'Course performance metrics',
    'Conversion funnel analysis',
    'User engagement heatmaps',
    'Custom report builder',
    'Automated report scheduling',
    'Data export (CSV, PDF, Excel)',
    'Predictive analytics and trends',
    'A/B testing results dashboard',
  ];

  return (
    <ComingSoonPage
      title="Analytics & Reports"
      description="Comprehensive analytics dashboard with detailed insights into platform performance, user behavior, and revenue metrics. Make data-driven decisions with powerful reporting tools."
      icon="feather-bar-chart-2"
      futureFeatures={futureFeatures}
      expectedDate="Phase 2: Q2 2025"
    />
  );
}
