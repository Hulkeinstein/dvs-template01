import {
  CourseProvider as ICourseProvider,
  Course,
} from '@/types/course-provider';

/**
 * Abstract CourseProvider class
 * All course providers must extend this class and implement the required methods
 */
export abstract class CourseProvider implements ICourseProvider {
  /**
   * Get course by ID
   * @param courseId - The course ID
   * @returns Course data in standardized format
   */
  abstract getCourseById(courseId: string): Promise<Course | null>;

  /**
   * Transform raw data to standardized course format
   * @param rawData - Raw course data from source
   * @returns Standardized course object
   */
  transformCourse(rawData: any): Course {
    // This method can be overridden by subclasses if needed
    // Default implementation assumes data is already in correct format
    return rawData;
  }

  /**
   * Check if provider can handle this course ID
   * @param courseId - The course ID to check
   * @returns True if this provider can handle the ID
   */
  abstract canHandle(courseId: string): boolean;
}
