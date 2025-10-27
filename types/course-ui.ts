// UI-specific types for course-related components

/**
 * Course card data structure for UI rendering
 * Maps to the format expected by course card components
 */
export interface CourseCardData {
  id: string;
  courseId?: string; // Fallback ID field (may exist in some data sources)
  courseTitle: string;
  desc: string;
  courseImg: string;
  userCategory: string;
  courseType: string;
  price: number;
  offPrice?: number;
  name: string;
  instructor?: string; // Instructor name as string (alternative to name field)
  userImg: string;
  student: string;
  lesson: number;
  review: string;
  reviewCount: string;
  duration: string;
}

/**
 * Props for the All Courses page component
 */
export interface AllCoursesPageProps {
  initialCourses: CourseCardData[];
  initialBookmarks: string[];
}

/**
 * Filter state for course filtering
 */
export interface CourseFilterState {
  category?: string;
  level?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  sortBy?: 'default' | 'latest' | 'popularity' | 'price-low' | 'price-high';
}
