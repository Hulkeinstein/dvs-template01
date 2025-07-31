/**
 * Certificate Validator
 * Validates certificate issuance eligibility
 */

export class CertificateValidator {
  /**
   * Check if a user is eligible for certificate
   * @param {Object} progress - User's course progress
   * @param {Object} courseSettings - Course certificate settings
   * @returns {Object} Validation result
   */
  static canIssueCertificate(progress, courseSettings) {
    const result = {
      eligible: false,
      reasons: []
    };

    // Check if certificate is enabled for the course
    if (!courseSettings.certificateEnabled) {
      result.reasons.push('Certificate not enabled for this course');
      return result;
    }

    // Check course completion
    if (!progress.isCompleted || progress.completionPercentage < 100) {
      result.reasons.push('Course not completed');
      return result;
    }

    // Check passing grade if applicable
    if (courseSettings.passingGrade && progress.averageScore < courseSettings.passingGrade) {
      result.reasons.push(`Score ${progress.averageScore}% is below passing grade ${courseSettings.passingGrade}%`);
      return result;
    }

    // Check if all required lessons are completed
    if (progress.incompleteLessons && progress.incompleteLessons.length > 0) {
      result.reasons.push('Some required lessons are not completed');
      return result;
    }

    // All checks passed
    result.eligible = true;
    return result;
  }

  /**
   * Validate certificate data before generation
   * @param {Object} data - Certificate data
   * @returns {Object} Validation result
   */
  static validateCertificateData(data) {
    const errors = [];

    if (!data.studentName || data.studentName.trim().length === 0) {
      errors.push('Student name is required');
    }

    if (!data.courseName || data.courseName.trim().length === 0) {
      errors.push('Course name is required');
    }

    if (!data.completionDate || !(data.completionDate instanceof Date)) {
      errors.push('Valid completion date is required');
    }

    if (!data.certificateNumber) {
      errors.push('Certificate number is required');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Check if certificate already exists
   * @param {string} userId - User ID
   * @param {string} courseId - Course ID
   * @param {Object} supabase - Supabase client
   * @returns {Promise<boolean>} True if certificate exists
   */
  static async certificateExists(userId, courseId, supabase) {
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select('id')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      return !!data;
    } catch (error) {
      console.error('Error checking certificate existence:', error);
      return false;
    }
  }
}

export default CertificateValidator;