// Content types for lessons
export interface VideoContent {
  url: string;
  duration?: number;
  thumbnail?: string;
}

export interface TextContent {
  html: string;
  plainText?: string;
}

// Rubric types for assignments
export interface RubricItem {
  criteria: string;
  points: number;
  description: string;
}

// Activity types for dashboard
export interface ActivityItem {
  id: string;
  type: 'enrollment' | 'submission' | 'completion' | 'comment';
  userId: string;
  timestamp: string;
  details: Record<string, unknown>;
}

// User types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'instructor' | 'admin';
  phone?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

// Course types
export interface Course {
  id: string;
  title: string;
  description: string;
  instructor_id: string;
  instructor?: User;
  price: number;
  thumbnail_url?: string;
  preview_video_url?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  category?: string;
  language?: string;
  duration?: number;
  lessons_count?: number;
  students_count?: number;
  rating?: number;
  is_featured?: boolean;
  is_hot?: boolean;
  is_new?: boolean;
  is_bestseller?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Lesson types
export interface Lesson {
  id: string;
  course_id: string;
  topic_id?: string;
  title: string;
  description?: string;
  content_type: 'video' | 'quiz' | 'assignment' | 'text' | 'lesson';
  content_data?:
    | Quiz
    | Assignment
    | VideoContent
    | TextContent
    | Record<string, unknown>;
  order_index: number;
  duration?: number;
  is_preview?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Course Topic types
export interface CourseTopic {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

// Enrollment types
export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
  completed_at?: string;
  progress: number;
  last_accessed_at?: string;
  status: 'active' | 'completed' | 'dropped';
  user?: User;
  course?: Course;
}

// Quiz types
export interface QuizQuestion {
  id: string;
  type:
    | 'True/False'
    | 'Single Choice'
    | 'Multiple Choice'
    | 'Open Ended'
    | 'Fill in the Blanks'
    | 'Sort Answer'
    | 'Matching'
    | 'Image Matching'
    | 'Essay';
  question: string;
  points: number;
  required: boolean;
  options?: QuizOption[];
  correctAnswer?: string | string[];
  explanation?: string;
}

export interface QuizOption {
  id: string;
  text: string;
  isCorrect?: boolean;
}

export interface QuizSettings {
  timeLimit?: number;
  passingScore: number;
  showResults: boolean;
  allowRetake: boolean;
  maxAttempts?: number;
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
}

export interface Quiz {
  questions: QuizQuestion[];
  settings: QuizSettings;
  metadata?: {
    totalPoints: number;
    questionCount: number;
    estimatedTime?: number;
  };
}

// Assignment types
export interface Assignment {
  id: string;
  lesson_id: string;
  title: string;
  description: string;
  instructions: string;
  due_date?: string;
  points?: number;
  files?: string[];
  rubric?: RubricItem[];
}

// Order types
export interface Order {
  id: string;
  user_id: string;
  course_id: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method?: string;
  transaction_id?: string;
  created_at: string;
  completed_at?: string;
}

// Announcement types
export interface Announcement {
  id: string;
  course_id?: string;
  instructor_id: string;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  is_global: boolean;
  created_at: string;
  updated_at?: string;
}

// Certificate types
export interface Certificate {
  id: string;
  user_id: string;
  course_id: string;
  certificate_url: string;
  issued_at: string;
  certificate_number: string;
}

// Progress types
export interface LessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  course_id: string;
  completed: boolean;
  completed_at?: string;
  time_spent?: number;
  last_position?: number; // For video lessons
}

// Quiz Attempt types
export interface QuizAttempt {
  id: string;
  lesson_id: string;
  user_id: string;
  course_id: string;
  started_at: string;
  completed_at?: string;
  score?: number;
  total_points: number;
  passed?: boolean;
  answers?: Record<string, string | string[]>;
  attempt_number: number;
}

// Dashboard Statistics types
export interface DashboardStats {
  totalCourses?: number;
  totalStudents?: number;
  totalRevenue?: number;
  averageRating?: number;
  totalLessons?: number;
  completionRate?: number;
  activeEnrollments?: number;
  recentActivity?: ActivityItem[];
}
