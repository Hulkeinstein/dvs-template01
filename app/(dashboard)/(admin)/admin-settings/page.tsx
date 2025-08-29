import type { Metadata } from 'next';
import ComingSoonPage from '@/components/Admin/ComingSoonPage';

export const metadata: Metadata = {
  title: 'System Settings - Admin Dashboard',
  description: 'Configure platform settings and preferences',
};

export default function AdminSettingsPage() {
  const futureFeatures = [
    'Platform configuration and preferences',
    'Email templates and notifications',
    'API keys and webhook management',
    'Payment gateway settings',
    'Security and access controls',
    'Theme and branding customization',
    'Language and localization settings',
    'Backup and restore options',
    'System maintenance mode',
    'Third-party integrations',
    'Cache and performance settings',
    'Audit logs and compliance',
  ];

  return (
    <ComingSoonPage
      title="System Settings"
      description="Configure and customize your platform settings. Manage system configurations, security settings, integrations, and platform-wide preferences."
      icon="feather-settings"
      futureFeatures={futureFeatures}
      expectedDate="Phase 2: Q2 2025"
    />
  );
}
