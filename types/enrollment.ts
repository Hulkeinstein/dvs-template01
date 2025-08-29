// Type definitions for enrollment and student management

export type EnrollmentStatus = 'active' | 'completed' | 'dropped' | 'expired';

// User profile type for enrolled students
export interface StudentProfile {
  id: string;
  email: string;
  name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  avatar_url?: string | null;
  username?: string | null;
  phone?: string | null;
  bio?: string | null;
}

// Course info type for enrollment display
export interface CourseInfo {
  id: string;
  title: string;
  thumbnail_url?: string | null;
  instructor_id: string;
  category?: string | null;
  difficulty_level?: string | null;
  total_duration_hours?: number | null;
  total_duration_minutes?: number | null;
}

// Main enrollment type
export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
  completed_at?: string | null;
  progress: number; // 0-100
  last_accessed_at?: string | null;
  certificate_issued_at?: string | null;
  status: EnrollmentStatus;
  created_at: string;
  updated_at: string;
}

// Combined enrolled student data
export interface EnrolledStudent {
  enrollment: Enrollment;
  student: StudentProfile;
  course: CourseInfo;
}

// Summary statistics for dashboard
export interface EnrollmentSummary {
  total: number;
  enrolled: number; // status = active, progress = 0
  active: number; // status = active, progress > 0 && < 100
  completed: number; // status = completed or progress = 100
  dropped: number; // status = dropped
}

// Filter status for UI tabs
export type FilterStatus = 'all' | 'enrolled' | 'active' | 'completed';

// Server action response types
export interface GetEnrolledStudentsResponse {
  students: EnrolledStudent[];
  summary: EnrollmentSummary;
}

// Error response type
export interface ErrorResponse {
  error: string;
  message?: string;
}
