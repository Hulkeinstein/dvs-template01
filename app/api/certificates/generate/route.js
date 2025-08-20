import 'server-only';
import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase/client';

// IMPORTANT: Node.js runtime for PDF generation
export const runtime = 'nodejs';

// PDF feature toggle
const PDF_ENABLED = process.env.PDF_ENABLED !== 'false';

async function buildPdf(certificateId, userId) {
  if (!PDF_ENABLED) {
    throw new Error('PDF generation is disabled');
  }

  try {
    // Dynamic import - build 시점에 번들링되지 않음
    const { pdf, Document, Page, Text, View, StyleSheet } = await import(
      '@react-pdf/renderer'
    );

    // Get certificate data
    const { data: certificate, error } = await supabase
      .from('certificates')
      .select(
        `
        id,
        certificate_number,
        template_id,
        metadata,
        course:courses(
          title,
          instructor:user!courses_instructor_id_fkey(full_name)
        ),
        user:user(
          full_name,
          email
        )
      `
      )
      .eq('id', certificateId)
      .eq('user_id', userId)
      .single();

    if (error || !certificate) {
      throw new Error('Certificate not found');
    }

    // PDF 스타일
    const styles = StyleSheet.create({
      page: {
        padding: 50,
        backgroundColor: '#ffffff',
      },
      title: {
        fontSize: 32,
        textAlign: 'center',
        marginBottom: 20,
        fontFamily: 'Helvetica-Bold',
      },
      text: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 10,
        fontFamily: 'Helvetica',
      },
      certificateNumber: {
        fontSize: 12,
        textAlign: 'center',
        marginTop: 30,
        color: '#666666',
      },
    });

    // PDF 문서 생성
    const CertificateDocument = (
      <Document>
        <Page size="A4" orientation="landscape" style={styles.page}>
          <Text style={styles.title}>Certificate of Completion</Text>
          <Text style={styles.text}>This is to certify that</Text>
          <Text style={[styles.text, { fontSize: 24, marginVertical: 20 }]}>
            {certificate.user?.full_name || 'Student'}
          </Text>
          <Text style={styles.text}>has successfully completed</Text>
          <Text style={[styles.text, { fontSize: 20, marginVertical: 20 }]}>
            {certificate.course?.title || 'Course'}
          </Text>
          <Text style={styles.text}>
            Instructor:{' '}
            {certificate.course?.instructor?.full_name || 'Instructor'}
          </Text>
          <Text style={styles.certificateNumber}>
            Certificate Number: {certificate.certificate_number}
          </Text>
        </Page>
      </Document>
    );

    // PDF 생성
    const pdfBuffer = await pdf(CertificateDocument).toBuffer();

    // Supabase Storage에 업로드
    const fileName = `certificate-${certificateId}.pdf`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('certificates')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadError) {
      throw uploadError;
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('certificates').getPublicUrl(fileName);

    // Update certificate record with PDF URL
    await supabase
      .from('certificates')
      .update({ pdf_url: publicUrl })
      .eq('id', certificateId);

    return publicUrl;
  } catch (error) {
    console.error('PDF generation error:', error);
    throw error;
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const certificateId = searchParams.get('certificateId');
  const userId = searchParams.get('userId');

  if (!certificateId || !userId) {
    return NextResponse.json(
      { success: false, error: 'Missing required parameters' },
      { status: 400 }
    );
  }

  try {
    const pdfUrl = await buildPdf(certificateId, userId);
    return NextResponse.json({
      success: true,
      pdfUrl,
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: PDF_ENABLED
          ? 'Failed to generate PDF. Please try again.'
          : 'PDF generation is temporarily disabled.',
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { certificateId, userId } = await request.json();

    if (!certificateId || !userId) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const pdfUrl = await buildPdf(certificateId, userId);
    return NextResponse.json({
      success: true,
      pdfUrl,
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: PDF_ENABLED
          ? 'Failed to generate PDF. Please try again.'
          : 'PDF generation is temporarily disabled.',
      },
      { status: 500 }
    );
  }
}
