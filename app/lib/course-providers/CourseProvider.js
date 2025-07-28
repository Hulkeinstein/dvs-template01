/**
 * Abstract CourseProvider class
 * All course providers must extend this class and implement the required methods
 */
export class CourseProvider {
  /**
   * Get course by ID
   * @param {string} courseId - The course ID
   * @returns {Promise<Object>} Course data in standardized format
   */
  async getCourseById(courseId) {
    throw new Error('getCourseById method must be implemented');
  }

  /**
   * Transform raw data to standardized course format
   * @param {Object} rawData - Raw course data from source
   * @returns {Object} Standardized course object
   */
  transformCourse(rawData) {
    // This method can be overridden by subclasses if needed
    // Default implementation assumes data is already in correct format
    return rawData;
  }

  /**
   * Check if provider can handle this course ID
   * @param {string} courseId - The course ID to check
   * @returns {boolean} True if this provider can handle the ID
   */
  canHandle(courseId) {
    throw new Error('canHandle method must be implemented');
  }
}