// Course Provider Type Definitions

export interface CourseProvider {
  canHandle(courseId: string): boolean;
  getCourseById(courseId: string): Promise<Course | null>;
}

export interface DatabaseCourse {
  id: string;
  instructor_id?: string;
  title: string;
  slug?: string;
  description?: string;
  about_course?: string;
  short_description?: string;
  thumbnail_url?: string;
  intro_video_url?: string;
  intro_video_source?: string;
  category?: string;
  difficulty_level?: string;
  max_students?: number;
  is_public?: boolean;
  enable_qa?: boolean;
  status?: string;
  is_free?: boolean;
  regular_price?: number;
  discounted_price?: number;
  start_date?: string;
  language?: string;
  requirements?: string;
  targeted_audience?: string;
  course_tags?: string[];
  total_duration_hours?: number;
  total_duration_minutes?: number;
  is_bestseller?: boolean;
  created_at?: string;
  updated_at?: string;
  published_at?: string;
  instructor?: {
    id?: string;
    name?: string;
    email?: string;
    avatar_url?: string;
    expertise?: string;
    bio?: string;
    role?: string;
  };
  lessons?: any[];
}

export interface TransformedCourse extends DatabaseCourse {
  kind: 'course';
  courseId: string;
  productKey: string;
  courseTitle: string;
  courseImg?: string;
  price: number;
  offPrice: number;
  discount: number;
  desc?: string;
  sellsType: string;
  star: string;
  ratingNumber: string;
  studentNumber: string;
  userImg?: string;
  userName?: string;
  userCategory?: string;
  date?: string;
  days?: string;
  previewVideoUrl?: string | null;
  similarCourse?: any[];
  lectureCount?: number;
  totalDuration?: string;
  [key: string]: any; // Allow additional properties
}

export type Course = TransformedCourse | any; // Allow flexibility during migration

export interface CourseProviderOptions {
  session?: any;
  isPreview?: boolean;
}
