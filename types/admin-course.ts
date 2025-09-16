// Admin Course Management Types

export type CourseStatus = 'draft' | 'published' | 'archived' | 'pending';
export type CourseBadge = 'featured' | 'hot' | 'new' | 'bestseller';

export interface InstructorInfo {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  role: string;
}

export interface AdminCourse {
  id: string;
  title: string;
  slug: string;
  thumbnail_url: string | null;
  category: string | null;
  price: number;
  regular_price: number | null;
  discounted_price: number | null;
  status: CourseStatus;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  instructor_id: string;
  difficulty_level: string | null;
  language: string | null;
  total_duration_hours: number | null;
  max_students: number | null;
  enrollment_count: number;
  weekly_enrollment_count: number;
  monthly_enrollment_count: number;
  instructor_info: InstructorInfo;
  actual_enrollment_count: number;
  active_enrollment_count: number;
  estimated_revenue: number;
}

export interface CourseFilters {
  search?: string;
  status?: CourseStatus | 'all';
  category?: string;
  instructorId?: string;
  isFeatured?: boolean;
  sortBy?:
    | 'created_desc'
    | 'created_asc'
    | 'price_desc'
    | 'price_asc'
    | 'enrollment_desc'
    | 'enrollment_asc';
  page?: number;
  limit?: number;
}

export interface CourseUpdatePayload {
  status?: CourseStatus;
  price?: number;
  category?: string;
  is_featured?: boolean;
}

export interface AdminCoursesResponse {
  courses: AdminCourse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CourseActionResult {
  success: boolean;
  data?: AdminCourse;
  error?: string;
}
