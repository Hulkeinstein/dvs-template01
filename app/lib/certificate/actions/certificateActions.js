"use server";

import { supabase } from '@/app/lib/supabase/client';
import CertificateValidator from "../core/validator";
import { isFeatureEnabled } from "../utils/featureFlags";
import { getTemplateConfig } from "../utils/templateMapper";

/**
 * Issue a certificate for a completed course
 * @param {string} userId - User ID
 * @param {string} courseId - Course ID
 * @returns {Promise<Object>} Result object
 */
export async function issueCertificate(userId, courseId) {
  try {
    // Check if certificate feature is enabled
    if (!isFeatureEnabled('CERTIFICATE_ENABLED')) {
      return {
        success: false,
        error: 'Certificate feature is not enabled'
      };
    }


    // Check if certificate already exists
    const exists = await CertificateValidator.certificateExists(userId, courseId, supabase);
    if (exists) {
      return {
        success: false,
        error: 'Certificate already issued for this course'
      };
    }

    // Get user data
    const { data: userData, error: userError } = await supabase
      .from('user')
      .select('id, email, full_name')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return {
        success: false,
        error: 'User not found'
      };
    }

    // Get course data with instructor
    const { data: courseData, error: courseError } = await supabase
      .from('courses')
      .select(`
        id,
        title,
        instructor_id,
        certificate_settings,
        instructor:user!courses_instructor_id_fkey(full_name)
      `)
      .eq('id', courseId)
      .single();

    if (courseError || !courseData) {
      return {
        success: false,
        error: 'Course not found'
      };
    }

    // Get course progress
    const { data: progressData, error: progressError } = await supabase
      .from('enrollments')
      .select('progress, completed_at')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single();

    if (progressError || !progressData) {
      return {
        success: false,
        error: 'Enrollment not found'
      };
    }

    // Validate certificate eligibility
    const courseSettings = courseData.certificate_settings || {};
    const progress = {
      isCompleted: progressData.progress === 100,
      completionPercentage: progressData.progress,
      completedAt: progressData.completed_at
    };

    const validation = CertificateValidator.canIssueCertificate(progress, courseSettings);
    if (!validation.eligible) {
      return {
        success: false,
        error: validation.reasons.join(', ')
      };
    }

    // Generate certificate number
    const certificateNumber = `CERT-${courseId.slice(-8)}-${userId.slice(-8)}-${Date.now()}`.toUpperCase();
    const verificationCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Prepare certificate data
    const certificateData = {
      studentName: userData.full_name || userData.email,
      courseName: courseData.title,
      instructorName: courseData.instructor?.full_name || 'Instructor',
      completionDate: new Date(progressData.completed_at),
      certificateNumber: certificateNumber,
      certificateTitle: courseSettings.certificate_title || 'Certificate of Completion',
      templateId: courseSettings.template_id || 'template1'
    };

    // Validate certificate data
    const dataValidation = CertificateValidator.validateCertificateData(certificateData);
    if (!dataValidation.valid) {
      return {
        success: false,
        error: dataValidation.errors.join(', ')
      };
    }

    // For now, we'll store the certificate record without generating PDF
    // PDF generation will be done on-demand to save resources
    const { data: certificate, error: insertError } = await supabase
      .from('certificates')
      .insert({
        user_id: userId,
        course_id: courseId,
        certificate_number: certificateNumber,
        template_id: certificateData.templateId,
        verification_code: verificationCode,
        metadata: certificateData,
        status: 'active'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Certificate insertion error:', insertError);
      return {
        success: false,
        error: 'Failed to issue certificate'
      };
    }

    return {
      success: true,
      certificate: {
        id: certificate.id,
        certificateNumber: certificate.certificate_number,
        issuedDate: certificate.issued_date
      }
    };

  } catch (error) {
    console.error('Certificate issuance error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred'
    };
  }
}

/**
 * Get user's certificates
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Result object with certificates
 */
export async function getUserCertificates(userId) {
  try {
    if (!isFeatureEnabled('CERTIFICATE_ENABLED')) {
      return {
        success: true,
        certificates: []
      };
    }


    const { data: certificates, error } = await supabase
      .from('certificates')
      .select(`
        id,
        certificate_number,
        issued_date,
        template_id,
        status,
        metadata,
        course:courses(
          id,
          title,
          thumbnail_url
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('issued_date', { ascending: false });

    if (error) {
      console.error('Error fetching certificates:', error);
      return {
        success: false,
        error: 'Failed to fetch certificates'
      };
    }

    return {
      success: true,
      certificates: certificates || []
    };

  } catch (error) {
    console.error('Get certificates error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred'
    };
  }
}

/**
 * Get certificate by ID
 * @param {string} certificateId - Certificate ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<Object>} Result object with certificate
 */
export async function getCertificate(certificateId, userId) {
  try {
    if (!isFeatureEnabled('CERTIFICATE_ENABLED')) {
      return {
        success: false,
        error: 'Certificate feature is not enabled'
      };
    }


    const { data: certificate, error } = await supabase
      .from('certificates')
      .select(`
        id,
        certificate_number,
        issued_date,
        template_id,
        status,
        metadata,
        verification_code,
        course:courses(
          id,
          title,
          instructor:user!courses_instructor_id_fkey(full_name)
        ),
        user:user(
          id,
          full_name,
          email
        )
      `)
      .eq('id', certificateId)
      .eq('user_id', userId)
      .single();

    if (error || !certificate) {
      return {
        success: false,
        error: 'Certificate not found'
      };
    }

    return {
      success: true,
      certificate
    };

  } catch (error) {
    console.error('Get certificate error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred'
    };
  }
}

/**
 * Verify certificate by number or verification code
 * @param {string} code - Certificate number or verification code
 * @returns {Promise<Object>} Result object with certificate info
 */
export async function verifyCertificate(code) {
  try {
    if (!isFeatureEnabled('CERTIFICATE_VERIFICATION')) {
      return {
        success: false,
        error: 'Certificate verification is not enabled'
      };
    }


    // Try to find by certificate number first, then verification code
    const { data: certificate, error } = await supabase
      .from('certificates')
      .select(`
        certificate_number,
        issued_date,
        status,
        metadata,
        course:courses(title),
        user:user(full_name)
      `)
      .or(`certificate_number.eq.${code},verification_code.eq.${code}`)
      .single();

    if (error || !certificate) {
      return {
        success: false,
        error: 'Certificate not found',
        verified: false
      };
    }

    if (certificate.status !== 'active') {
      return {
        success: false,
        error: 'Certificate is not active',
        verified: false,
        status: certificate.status
      };
    }

    return {
      success: true,
      verified: true,
      certificate: {
        certificateNumber: certificate.certificate_number,
        studentName: certificate.user?.full_name || certificate.metadata?.studentName,
        courseName: certificate.course?.title || certificate.metadata?.courseName,
        issuedDate: certificate.issued_date
      }
    };

  } catch (error) {
    console.error('Certificate verification error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred',
      verified: false
    };
  }
}