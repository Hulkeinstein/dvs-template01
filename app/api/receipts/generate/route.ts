import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase/server';
import { generateReceiptPDF } from '@/components/PDF';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Fetch order from database
    const { data: order, error } = await supabase
      .from('orders')
      .select(
        `
        *,
        user:user_id (
          id,
          name,
          email,
          first_name,
          last_name
        ),
        courses:course_id (
          id,
          title
        )
      `
      )
      .eq('id', orderId)
      .single();

    if (error || !order) {
      console.error('[PDF] Order not found:', error);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Generate PDF using JSX component system
    const pdfBuffer = await generateReceiptPDF(order);

    // Return PDF
    // @ts-expect-error - Buffer is compatible with BodyInit at runtime
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="receipt-${orderId}.pdf"`,
      },
    });
  } catch (error) {
    console.error('[PDF] Error generating receipt:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
