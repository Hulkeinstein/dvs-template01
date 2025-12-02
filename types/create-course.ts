/**
 * Shared types for CreateCourse components
 * These types are used across CreateCourse, modals, and lesson components
 */

// ============================================================================
// Base Types
// ============================================================================

export type ContentType = 'video' | 'quiz' | 'assignment';
export type VideoSource =
  | 'youtube'
  | 'vimeo'
  | 'external'
  | 'facebook'
  | 'twitter';
export type QuestionType =
  | 'True/False'
  | 'Single Choice'
  | 'Multiple Choice'
  | 'Open Ended'
  | 'Fill in the Blanks'
  | 'Sort Answer'
  | 'Matching'
  | 'Image Matching'
  | 'Short Answer';

// ============================================================================
// Lesson Types
// ============================================================================

export interface BaseLesson {
  id: string | number;
  title: string;
  content_type: ContentType;
}

export interface VideoLesson extends BaseLesson {
  content_type: 'video';
  description?: string;
  videoUrl: string;
  videoSource: VideoSource;
  duration: number;
  enablePreview?: boolean;
  is_preview?: boolean;
  thumbnail?: string | null;
  attachments?: AttachmentData[];
}

export interface QuizLesson extends BaseLesson {
  content_type: 'quiz';
  summary?: string;
  description?: string;
  questions: QuizQuestion[];
  settings: QuizSettings;
}

export interface AssignmentLesson extends BaseLesson {
  content_type: 'assignment';
  summary: string;
  instructions?: string;
  totalPoints: number;
  passingPoints: number;
  maxUploads: number;
  maxFileSize: number;
  attachments?: AttachmentData[];
  timeLimit: TimeLimitData;
}

export type LessonData = VideoLesson | QuizLesson | AssignmentLesson;

// ============================================================================
// Topic Types
// ============================================================================

export interface TopicData {
  id: string | number;
  name: string;
  summary: string;
  lessons: LessonData[];
  quizzes?: QuizLesson[];
  assignments?: AssignmentLesson[];
}

// ============================================================================
// Quiz Types
// ============================================================================

export interface QuizSettings {
  passingScore: number;
  feedbackMode: 'default' | 'reveal' | 'off';
  randomizeQuestions: boolean;
  showAnswersAfterSubmit: boolean;
  maxQuestions: number;
  maxAttempts: number;
  questionLayout: 'random' | 'one_per_page';
  questionsOrder: 'single_question' | 'sequential';
  hideQuestionNumber: boolean;
  shortAnswerLimit: number;
  essayAnswerLimit: number;
}

export interface QuestionOption {
  id: string;
  text: string;
}

export interface BlankAnswer {
  id: number;
  answers: string[];
  caseSensitive: boolean;
}

export interface SortItem {
  id: number;
  text: string;
  order: number;
}

export interface MatchingPairs {
  leftItems: Array<{ id: string; text: string }>;
  rightItems: Array<{ id: string; text: string }>;
  correctMatches: Record<string, string>;
}

export interface ImageMatchingPair {
  id: string;
  image: string;
  text: string;
}

export interface BaseQuestion {
  id?: string;
  question: string;
  questionImage?: string | null;
  type: QuestionType;
  points: number;
  required: boolean;
  randomize: boolean;
  description?: string;
  explanation?: string;
}

export interface TrueFalseQuestion extends BaseQuestion {
  type: 'True/False';
  correctAnswer: boolean;
}

export interface SingleChoiceQuestion extends BaseQuestion {
  type: 'Single Choice';
  options: QuestionOption[];
  correctAnswer: string | number;
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'Multiple Choice';
  options: QuestionOption[];
  correctAnswer: (string | number)[];
}

export interface OpenEndedQuestion extends BaseQuestion {
  type: 'Open Ended';
  correctAnswer: null;
}

export interface FillInTheBlanksQuestion extends BaseQuestion {
  type: 'Fill in the Blanks';
  blanks: BlankAnswer[];
  correctAnswer: Record<number, string[]>;
}

export interface SortAnswerQuestion extends BaseQuestion {
  type: 'Sort Answer';
  sortItems: SortItem[];
  correctAnswer: number[];
}

export interface MatchingQuestion extends BaseQuestion {
  type: 'Matching';
  matchingPairs: MatchingPairs;
  correctAnswer: Record<string, string>;
}

export interface ImageMatchingQuestion extends BaseQuestion {
  type: 'Image Matching';
  imageMatchingImage: string | null;
  imageMatchingText: string;
  imageMatchingPairs: ImageMatchingPair[];
}

export interface ShortAnswerQuestion extends BaseQuestion {
  type: 'Short Answer';
  correctAnswer: string | null;
}

export type QuizQuestion =
  | TrueFalseQuestion
  | SingleChoiceQuestion
  | MultipleChoiceQuestion
  | OpenEndedQuestion
  | FillInTheBlanksQuestion
  | SortAnswerQuestion
  | MatchingQuestion
  | ImageMatchingQuestion
  | ShortAnswerQuestion;

// ============================================================================
// Assignment Types
// ============================================================================

export interface TimeLimitData {
  value: number;
  unit: 'hours' | 'days' | 'weeks';
}

export interface AttachmentData {
  id: string | number;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt?: string;
}

// ============================================================================
// Form Data Types
// ============================================================================

export interface CourseFormData {
  // Basic info
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  category: string;
  level: string;
  maxStudents: number;

  // Video
  introVideoUrl: string;

  // Pricing
  price: number;
  discountPrice: number | null;

  // Additional info
  startDate: string;
  endDate: string;
  enrollmentDeadline: string;
  language: string;
  duration: number;
  requirements?: string;
  totalDurationHours?: string | number;
  totalDurationMinutes?: string | number;
  courseTags?: string;
  targetedAudience?: string;

  // Certificate
  certificateEnabled: boolean;
  certificateTitle: string;
  certificateTemplate?: string;
  passingGrade: number;
  lifetimeAccess: boolean;

  // Course content
  topics: TopicData[];

  // Thumbnail
  thumbnailPreview?: string | null;
  thumbnail_url?: string | null;

  // Status
  status?: 'draft' | 'published';
}

// ============================================================================
// Modal Props Types
// ============================================================================

export interface TopicModalProps {
  onAddTopic: (topicData: { name: string; summary: string }) => void;
}

export interface LessonModalProps {
  modalId?: string;
  onAddLesson?: (lessonData: VideoLesson) => void;
  editingLesson?: VideoLesson | null;
  onEditComplete?: () => void;
}

export interface QuizModalProps {
  modalId?: string;
  topicId?: string | number;
  onAddQuiz?: (quizData: QuizLesson) => { success: boolean };
  onUpdateQuiz?: (quizId: string | number, quizData: QuizLesson) => void;
  editingQuiz?: QuizLesson | null;
  onEditComplete?: () => void;
}

export interface UpdateModalProps {
  modalId?: string;
  topicData?: TopicData | null;
  onUpdateTopic?: (data: { name: string; summary: string }) => void;
}

export interface AssignmentModalProps {
  modalId?: string;
  onAddAssignment?: (assignmentData: AssignmentLesson) => { success: boolean };
  editingAssignment?: AssignmentLesson | null;
  onEditComplete?: () => void;
}

// ============================================================================
// Lesson Component Props
// ============================================================================

export interface LessonComponentProps {
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleImportClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  target: string;
  expanded: boolean;
  text: string;
  start: number;
  end: number;
  id: string;
  topicId?: string | number;
  topicData: TopicData;
  onDeleteTopic: () => void;
  onUpdateTopic: (data: { name: string; summary: string }) => void;
  onAddLesson: (lessonData: VideoLesson) => void;
  onAddQuiz: (quizData: QuizLesson) => { success: boolean };
  onUpdateQuiz?: (quizId: string | number, quizData: QuizLesson) => void;
  onAddAssignment: (assignmentData: AssignmentLesson) => { success: boolean };
  onDeleteContent: (
    topicId: string | number,
    contentId: string | number
  ) => void;
  onDeleteLesson: (topicId: string | number, lessonId: string | number) => void;
  onEditLesson: (topicId: string | number, lesson: LessonData) => void;
  onUploadLesson: (topicId: string | number, lessonId: string | number) => void;
}

// ============================================================================
// CreateCourse Props
// ============================================================================

export interface CreateCourseProps {
  userProfile: {
    id?: string;
    email?: string;
    phone?: string;
    phone_verified?: boolean;
  } | null;
  editMode?: boolean;
  courseId?: string | null;
}

// ============================================================================
// Thumbnail Data
// ============================================================================

export interface ThumbnailData {
  file: File;
  base64: string;
}

// ============================================================================
// Auto Save Types
// ============================================================================

export interface AutoSaveStatus {
  status: 'idle' | 'saving' | 'saved' | 'dirty' | 'error';
  lastSavedAt: number | null;
  saveNow: () => void;
  recover: () => void;
  getRecoverable: () => {
    data: CourseFormData | null;
    timestamp: number | null;
  };
  clearDraft: () => void;
}

// ============================================================================
// Utility Types
// ============================================================================

export interface CourseActionResult {
  success: boolean;
  courseId?: string;
  course?: unknown;
  error?: string;
}
