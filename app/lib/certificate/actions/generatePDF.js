"use server";

import { pdf } from '@react-pdf/renderer';
import { supabase } from '@/app/lib/supabase/client';
import { getTemplateComponent } from '../templates';

/**
 * Generate PDF for a certificate
 * @param {string} certificateId - Certificate ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<Object>} Result with PDF URL
 */
export async function generateCertificatePDF(certificateId, userId) {
  try {

    // Get certificate data
    const { data: certificate, error } = await supabase
      .from('certificates')
      .select(`
        id,
        certificate_number,
        template_id,
        metadata,
        pdf_url,
        course:courses(
          title,
          instructor:user!courses_instructor_id_fkey(full_name)
        ),
        user:user(
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

    // If PDF already exists, return it
    if (certificate.pdf_url) {
      return {
        success: true,
        pdfUrl: certificate.pdf_url
      };
    }

    // Prepare certificate data
    const certificateData = {
      ...certificate.metadata,
      studentName: certificate.user?.full_name || certificate.metadata?.studentName,
      courseName: certificate.course?.title || certificate.metadata?.courseName,
      instructorName: certificate.course?.instructor?.full_name || certificate.metadata?.instructorName,
      certificateNumber: certificate.certificate_number
    };

    // Get template component
    const TemplateComponent = getTemplateComponent(certificate.template_id);
    
    // Generate PDF blob
    const pdfBlob = await pdf(
      <TemplateComponent data={certificateData} />
    ).toBlob();

    // Convert blob to base64 for upload
    const reader = new FileReader();
    const base64Promise = new Promise((resolve) => {
      reader.onloadend = () => {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
    });
    reader.readAsDataURL(pdfBlob);
    const base64 = await base64Promise;

    // Upload PDF to storage
    const fileName = `certificate_${certificate.certificate_number}.pdf`;
    const uploadResult = await uploadCertificatePDF(base64, fileName);

    if (!uploadResult.success) {
      return {
        success: false,
        error: 'Failed to upload PDF'
      };
    }

    // Update certificate record with PDF URL
    const { error: updateError } = await supabase
      .from('certificates')
      .update({
        pdf_url: uploadResult.url,
        pdf_storage_path: uploadResult.path
      })
      .eq('id', certificateId);

    if (updateError) {
      console.error('Failed to update certificate record:', updateError);
    }

    return {
      success: true,
      pdfUrl: uploadResult.url
    };

  } catch (error) {
    console.error('PDF generation error:', error);
    return {
      success: false,
      error: 'Failed to generate PDF'
    };
  }
}

/**
 * Upload certificate PDF to storage
 * @param {string} base64Data - Base64 encoded PDF
 * @param {string} fileName - File name
 * @returns {Promise<Object>} Result with URL
 */
async function uploadCertificatePDF(base64Data, fileName) {
  try {
    
    // Convert base64 to blob
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });

    // Upload to Supabase storage
    const path = `certificates/${fileName}`;
    const { data, error } = await supabase.storage
      .from('course-files')
      .upload(path, blob, {
        contentType: 'application/pdf',
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('course-files')
      .getPublicUrl(path);

    return {
      success: true,
      url: publicUrl,
      path: path
    };

  } catch (error) {
    console.error('Certificate upload error:', error);
    return {
      success: false,
      error: 'Failed to upload certificate'
    };
  }
}