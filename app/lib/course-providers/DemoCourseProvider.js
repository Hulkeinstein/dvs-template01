import { CourseProvider } from './CourseProvider';
import CourseData from '@/data/course-details/courseData.json';

/**
 * Demo Course Provider
 * Provides course data from static JSON files for demo/template purposes
 */
export class DemoCourseProvider extends CourseProvider {
  /**
   * Get course by ID from JSON data
   * @param {string} courseId - The course ID (numeric string like "1", "2", etc.)
   * @returns {Promise<Object>} Course data
   */
  async getCourseById(courseId) {
    try {
      const numericId = parseInt(courseId);
      const courseDetails = CourseData.courseDetails;

      const course = courseDetails.find((c) => c.id === numericId);

      if (!course) {
        throw new Error(`Demo course with ID ${courseId} not found`);
      }

      return this.transformCourse(course);
    } catch (error) {
      console.error('Error fetching demo course:', error);
      throw error;
    }
  }

  /**
   * Transform JSON data to match expected format
   * The demo data is already in the correct format, so minimal transformation needed
   */
  transformCourse(rawData) {
    return {
      ...rawData,
      // Ensure all required fields exist
      id: rawData.id,
      courseTitle: rawData.courseTitle,
      courseImg: rawData.courseImg,
      price: rawData.price,
      offPrice: rawData.offPrice,
      category: rawData.category,
      desc: rawData.desc,
      discount: rawData.discount,
      roadmap: rawData.roadmap || [],
      courseOverview: rawData.courseOverview || [],
      courseContent: rawData.courseContent || [],
      courseRequirement: rawData.courseRequirement || [],
      courseInstructor: rawData.courseInstructor || [],
      featuredReview: rawData.featuredReview || [],
      relatedCourse: rawData.relatedCourse || [],
      similarCourse: rawData.similarCourse || [],
    };
  }

  /**
   * Check if this provider can handle the given course ID
   * Demo provider handles numeric IDs (1, 2, 3, etc.) or "demo" keyword
   */
  canHandle(courseId) {
    // Handle numeric string IDs like "1", "2", "3"
    if (/^\d+$/.test(courseId)) {
      const numId = parseInt(courseId);
      return numId >= 1 && numId <= 10; // Assuming demo has up to 10 courses
    }

    // Handle special demo keywords
    return courseId === 'demo' || courseId.startsWith('demo-');
  }
}
