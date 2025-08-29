// Admin Dashboard Types

export interface AdminDashboardStats {
  // User Statistics
  totalUsers: number;
  totalInstructors: number;
  totalStudents: number;

  // Course Statistics
  totalCourses: number;
  activeCourses: number;

  // Enrollment Statistics
  totalEnrollments: number;

  // Recent Activity
  newUsersToday: number;
  activeUsersWeek: number;

  // Revenue
  totalRevenue: number;
  monthlyRevenue: number;

  // Platform Status
  platformHealth: 'good' | 'warning' | 'critical';
  lastUpdate: string;
}

export interface AdminAuditLog {
  id: string;
  admin_id: string;
  action: AdminAction;
  details?: Record<string, any>;
  timestamp: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export type AdminAction =
  | 'dashboard_view'
  | 'user_list'
  | 'user_edit'
  | 'user_delete'
  | 'course_list'
  | 'course_approve'
  | 'course_reject'
  | 'course_delete'
  | 'settings_update'
  | 'backup_create'
  | 'logs_view';

export interface AdminSidebarSection {
  title: string;
  items: AdminSidebarItem[];
}

export interface AdminSidebarItem {
  text: string;
  link: string;
  icon: string;
  badge?: string | number;
  badgeType?:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'danger'
    | 'warning'
    | 'info';
}
