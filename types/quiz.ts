// Quiz-related TypeScript type definitions
// Following "Touch It, Type It" principle - minimal types for immediate needs

/**
 * Extended Quiz Attempt with relations
 * Used in instructor dashboard to display student quiz attempts
 */
export interface QuizAttemptWithRelations {
  id: string;
  user_id: string;
  lesson_id: string;
  course_id: string;
  started_at?: string;
  completed_at?: string;
  score: number;
  total_points: number;
  passed: boolean;
  answers?: any; // Complex JSON structure - use any initially, refine later

  // Nested relations from Supabase joins
  user?: {
    name: string;
    email: string;
  };
  lessons?: {
    title: string;
    course_id?: string;
  };
  courses?: {
    title: string;
    instructor_id?: string;
    id?: string;
  };
  created_at?: string; // Fallback timestamp
}

/**
 * Props for QuizAttempts component
 */
export interface QuizAttemptsProps {
  quizAttempts?: QuizAttemptWithRelations[];
  error?: any; // Error from server - keep as any for flexibility
  useDevData?: boolean; // Development mode flag for sample data
}

/**
 * Option type for react-select dropdowns
 */
export interface SelectOption {
  value: string;
  label: string;
}

/**
 * Filter and sort types
 */
export type FilterStatus = 'all' | 'pass' | 'fail';
export type SortBy = 'date_desc' | 'date_asc' | 'score_desc' | 'score_asc';
