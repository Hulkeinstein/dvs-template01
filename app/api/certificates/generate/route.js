import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase/client';

// IMPORTANT: Node.js runtime for PDF generation
export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const { certificateId, userId } = await request.json();

    if (!certificateId || !userId) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }

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
      return NextResponse.json(
        { success: false, error: 'Certificate not found' },
        { status: 404 }
      );
    }

    // If PDF already exists, return it
    if (certificate.pdf_url) {
      return NextResponse.json({
        success: true,
        pdfUrl: certificate.pdf_url
      });
    }

    // For now, return a placeholder response
    // In production, you would generate the PDF here using a different approach
    // such as puppeteer, or a separate PDF service
    return NextResponse.json({
      success: false,
      error: 'PDF generation is temporarily disabled. Please contact support.'
    });

  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}