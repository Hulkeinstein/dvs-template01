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

// Instructor Dashboard 관련 타입
export interface InstructorStats {
  totalCourses: number;
  totalStudents: number;
  totalRevenue: number;
  totalLessons: number;
  totalQuizzes?: number;
  totalAssignments?: number;
  recentEnrollments?: number;
  avgCourseRating?: number;
}

// 코스 데이터 타입
export interface CourseData {
  id: string;
  title: string;
  description?: string;
  instructor_id: string;
  instructor_name?: string;
  price: number;
  currency?: string;
  thumbnail_url?: string;
  intro_video_url?: string;
  status: 'draft' | 'published' | 'archived';
  category?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  duration?: string;
  enrolled_count?: number;
  rating?: number;
  created_at: string;
  updated_at?: string;
}

// 학생 데이터 타입
export interface StudentData {
  id: string;
  name: string;
  email: string;
  enrolled_courses: string[];
  progress?: number;
  last_active?: string;
}
