import { DemoCourseProvider } from './DemoCourseProvider';
import { DatabaseCourseProvider } from './DatabaseCourseProvider';

/**
 * Factory class for creating appropriate course providers
 */
export class CourseProviderFactory {
  /**
   * Get the appropriate provider for a given course ID
   * @param {string} courseId - The course ID
   * @param {Object} options - Additional options (e.g., session for auth)
   * @returns {CourseProvider} The appropriate course provider instance
   */
  static getProvider(courseId, options = {}) {
    // Create instances of providers
    const demoProvider = new DemoCourseProvider();
    const databaseProvider = new DatabaseCourseProvider(options.session);

    // Check which provider can handle this ID
    if (demoProvider.canHandle(courseId)) {
      return demoProvider;
    }

    if (databaseProvider.canHandle(courseId)) {
      return databaseProvider;
    }

    // Default to demo provider for unknown IDs
    console.warn(
      `No provider found for course ID: ${courseId}, defaulting to demo provider`
    );
    return demoProvider;
  }

  /**
   * Force a specific provider type (useful for testing or special cases)
   * @param {string} type - Provider type ('demo' or 'database')
   * @param {Object} options - Additional options
   * @returns {CourseProvider} The requested provider instance
   */
  static forceProvider(type, options = {}) {
    switch (type.toLowerCase()) {
      case 'demo':
        return new DemoCourseProvider();
      case 'database':
        return new DatabaseCourseProvider(options.session);
      default:
        throw new Error(`Unknown provider type: ${type}`);
    }
  }

  /**
   * Get course data using automatic provider selection
   * @param {string} courseId - The course ID
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Course data
   */
  static async getCourse(courseId, options = {}) {
    const provider = this.getProvider(courseId, options);
    return await provider.getCourseById(courseId);
  }
}
