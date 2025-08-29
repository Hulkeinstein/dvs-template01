export type TrendDirection = 'up' | 'down' | 'stable';

export interface KPIData {
  label: string;
  value: number;
  deltaPct: number;
  direction: TrendDirection;
  sparkline?: number[];
  icon?: string;
  color?: string;
}

export interface LinePoint {
  name: string;
  value: number;
}

export interface Series {
  label: string;
  value: number;
}

export interface ActivityItem {
  id: string;
  type: 'user' | 'course' | 'enrollment' | 'system';
  message: string;
  timestamp: string;
  icon?: string;
}

export interface TopCourse {
  id: string;
  title: string;
  instructor: string;
  enrollments: number;
  revenue: number;
  rating: number;
  status: 'active' | 'pending' | 'archived';
}

export interface AdminDashboardData {
  kpis: KPIData[];
  userGrowthData: LinePoint[];
  revenueData: LinePoint[];
  courseDistribution: Series[];
  courseBarData: Series[];
  recentActivity: ActivityItem[];
  topCourses: TopCourse[];
  lastUpdated: string;
}
