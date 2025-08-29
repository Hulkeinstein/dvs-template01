// User Management Types

export type UserRole = 'admin' | 'instructor' | 'student';
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  joinDate: string;
  lastActive: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  courses?: number; // Number of courses (for instructors)
  enrollments?: number; // Number of enrollments (for students)
  totalSpent?: number; // Total spent (for students)
  totalEarned?: number; // Total earned (for instructors)
  country?: string;
  timezone?: string;
  bio?: string;
  skills?: string[];
  socialLinks?: {
    website?: string;
    linkedin?: string;
    twitter?: string;
  };
}

export interface UserFilters {
  search: string;
  role: UserRole | 'all';
  status: UserStatus | 'all';
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  sortBy: 'name' | 'email' | 'joinDate' | 'lastActive';
  sortOrder: 'asc' | 'desc';
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  admins: number;
  instructors: number;
  students: number;
  newThisWeek: number;
  newThisMonth: number;
}

export interface BulkAction {
  action: 'activate' | 'deactivate' | 'delete' | 'export' | 'email';
  userIds: string[];
}

export interface UserActivity {
  id: string;
  userId: string;
  action: string;
  timestamp: string;
  details?: string;
  ipAddress?: string;
}
