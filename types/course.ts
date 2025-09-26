// Course type definitions

export type CourseStatus =
  | 'draft'
  | 'pending'
  | 'published'
  | 'rejected'
  | 'archived';

export interface Course {
  id: string;
  instructor_id: string;
  title: string;
  slug: string;
  description?: string;
  about_course?: string;
  thumbnail_url?: string;
  intro_video_url?: string;
  intro_video_source?: string;
  category?: string;
  difficulty_level?: string;
  max_students?: number;
  is_public: boolean;
  enable_qa: boolean;
  status: CourseStatus;
  is_free: boolean;
  regular_price?: number;
  discounted_price?: number;
  start_date?: string;
  language?: string;
  requirements?: string;
  targeted_audience?: string;
  course_tags?: string[];
  total_duration_hours?: number;
  total_duration_minutes?: number;
  content_drip_enabled?: boolean;
  content_drip_type?: string;
  certificate_template?: string;
  certificate_orientation?: string;
  created_at: string;
  updated_at: string;
  published_at?: string;

  // Approval workflow fields
  submitted_at?: string;
  reviewed_at?: string;
  reviewed_by?: string;
  review_notes?: string;
}

export interface CourseApprovalActions {
  submitForReview: (
    courseId: string
  ) => Promise<{ success?: boolean; error?: string }>;
  approveCourse: (
    courseId: string
  ) => Promise<{ success?: boolean; error?: string }>;
  rejectCourse: (
    courseId: string,
    notes: string
  ) => Promise<{ success?: boolean; error?: string }>;
}

export interface CourseFilterOptions {
  includePending?: boolean;
  includeRejected?: boolean;
  includeDraft?: boolean;
  instructorId?: string;
  status?: CourseStatus[];
}

export interface RejectCourseInput {
  courseId: string;
  notes: string;
}
