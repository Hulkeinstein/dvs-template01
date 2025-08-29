import type { Metadata } from 'next';
import ComingSoonPage from '@/components/Admin/ComingSoonPage';

export const metadata: Metadata = {
  title: 'Course Management - Admin Dashboard',
  description: 'Manage courses, approvals, and categories',
};

export default function AdminCoursesPage() {
  const futureFeatures = [
    'View all courses across the platform',
    'Approve or reject pending courses',
    'Manage course categories and tags',
    'Set featured and promoted courses',
    'Quality review and content moderation',
    'Course pricing management',
    'Bulk course operations',
    'Course analytics and performance metrics',
    'Content compliance checking',
  ];

  return (
    <ComingSoonPage
      title="Course Management"
      description="Centralized course management system. Review, approve, and manage all courses on the platform. Ensure quality standards and content compliance."
      icon="feather-grid"
      futureFeatures={futureFeatures}
      expectedDate="Phase 1: Q1 2025"
    />
  );
}
