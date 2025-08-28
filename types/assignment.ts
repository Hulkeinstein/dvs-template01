// Assignment type definitions

export interface Assignment {
  id: string;
  lesson_id: string;
  course_id: string;
  topic_id: string;
  title: string;
  description: string;
  total_points: number;
  passing_points: number;
  due_date: string | null;
  submissions_count: number;
  created_at: string;
  updated_at: string;
  course: {
    id: string;
    title: string;
  } | null;
  topic: {
    id: string;
    title: string;
  } | null;
}

export interface AssignmentFormData {
  title: string;
  summary: string;
  attachments?: Array<{
    name: string;
    url: string;
    size: number;
    type: string;
  }>;
  timeLimit?: {
    value: number;
    unit: 'days' | 'weeks' | 'months';
  };
  totalPoints: number;
  passingPoints: number;
  maxUploads?: number;
  maxFileSize?: number; // in MB
  dueDate?: string | null;
}

export interface AssignmentSubmission {
  id: string;
  assignment_id: string;
  student_id: string;
  student_name: string;
  submitted_at: string;
  files: Array<{
    name: string;
    url: string;
    size: number;
  }>;
  score?: number | null;
  feedback?: string;
  graded_at?: string | null;
  status: 'submitted' | 'graded' | 'late' | 'missing';
}

export interface AssignmentStatistics {
  total: number;
  totalSubmissions: number;
  avgSubmissions: number;
  pastDue: number;
  upcoming: number;
  graded: number;
  pending: number;
}

// Filter and sorting options
export interface AssignmentFilters {
  courseId?: string;
  status?: 'all' | 'past-due' | 'upcoming' | 'no-due-date';
  sortBy?: 'default' | 'latest' | 'title' | 'due-date' | 'submissions';
  sortOrder?: 'asc' | 'desc';
}

// API Response types
export interface AssignmentResponse {
  success: boolean;
  data?: Assignment[] | Assignment;
  error?: string;
}

export interface AssignmentActionResponse {
  success: boolean;
  data?: Assignment;
  error?: string;
}
