import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth.config';
import { capturePayPalOrder } from '@/app/lib/services/paymentService';

/**
 * POST /api/payment/paypal/capture-redirect
 * PayPal redirect 후 결제 캡처
 * Called from order-success page with paypalOrderId (token from redirect)
 */
export async function POST(req: NextRequest) {
  try {
    // 1. 인증 확인
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { paypalOrderId } = await req.json();

    if (!paypalOrderId) {
      return NextResponse.json(
        { error: 'PayPal Order ID is required' },
        { status: 400 }
      );
    }

    // 2. Payment Service 호출 (기존 로직 재사용)
    const result = await capturePayPalOrder(paypalOrderId, session.user.id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Payment capture failed' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      orderId: result.orderId,
      transactionId: result.transactionId,
      amount: result.amount,
      currency: result.currency || 'USD',
      message: result.message,
    });
  } catch (error: unknown) {
    console.error('[PayPal Capture Redirect] Error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Payment capture failed';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
