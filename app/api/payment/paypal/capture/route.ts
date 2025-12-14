import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth.config';
import { paypalClient, isPayPalEnabled } from '@/app/lib/paypal';
import paypal from '@paypal/checkout-server-sdk';
import { getServerClient } from '@/app/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    // 1. PayPal 활성화 확인
    if (!isPayPalEnabled()) {
      return NextResponse.json(
        { error: 'PayPal payment is not enabled' },
        { status: 503 }
      );
    }

    // 2. 인증 확인
    // NextAuth in App Router: getServerSession reads cookies automatically
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { paypalOrderId, orderId } = await req.json();

    if (!paypalOrderId || !orderId) {
      return NextResponse.json(
        { error: 'PayPal Order ID and Order ID are required' },
        { status: 400 }
      );
    }

    const supabase = getServerClient();

    // 3. 멱등성 체크 - PayPal Order ID로 이벤트 중복 확인
    const { data: existingEvent } = await supabase
      .from('order_events')
      .select('id, order_id')
      .eq('stripe_event_id', paypalOrderId) // stripe_event_id 재사용
      .single();

    if (existingEvent) {
      console.log('[PayPal] Order already captured:', {
        paypalOrderId,
        orderId: existingEvent.order_id,
      });
      return NextResponse.json({
        success: true,
        message: 'Payment already processed',
        orderId: existingEvent.order_id,
      });
    }

    // 4. 주문 소유권 확인
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, user_id, course_id, amount, payment_status')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error('Order not found:', orderError);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.user_id !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (order.payment_status === 'completed') {
      return NextResponse.json({
        success: true,
        message: 'Order already completed',
        orderId: order.id,
      });
    }

    // 5. 중복 등록 확인 (Duplicate Enrollment Prevention - Layer 3)
    const { data: existingEnrollment, error: enrollmentCheckError } =
      await supabase
        .from('enrollments')
        .select('id, status')
        .eq('user_id', session.user.id)
        .eq('course_id', order.course_id)
        .maybeSingle();

    if (enrollmentCheckError) {
      console.error('Enrollment check failed:', enrollmentCheckError);
      return NextResponse.json(
        { error: 'Failed to verify enrollment status' },
        { status: 500 }
      );
    }

    if (existingEnrollment) {
      console.warn('[PayPal] Duplicate enrollment attempt at capture:', {
        userId: session.user.id,
        courseId: order.course_id,
        enrollmentId: existingEnrollment.id,
        status: existingEnrollment.status,
      });
      return NextResponse.json(
        {
          error: 'Already enrolled',
          message: 'You are already enrolled in this course',
          enrollmentId: existingEnrollment.id,
        },
        { status: 409 }
      );
    }

    // 6. PayPal Order Capture
    const request = new paypal.orders.OrdersCaptureRequest(paypalOrderId);
    request.requestBody({});

    const capture = await paypalClient.execute(request);

    // 7. Capture 성공 확인
    if (capture.result.status !== 'COMPLETED') {
      console.error('[PayPal] Capture not completed:', capture.result);
      return NextResponse.json(
        { error: 'Payment capture failed', status: capture.result.status },
        { status: 400 }
      );
    }

    // 7.1 캡처된 금액 검증 (보안)
    const capturedAmount = parseFloat(
      capture.result.purchase_units?.[0]?.payments?.captures?.[0]?.amount
        ?.value || '0'
    );
    const expectedAmount = Number(order.amount);
    if (Math.abs(capturedAmount - expectedAmount) > 0.01) {
      console.error('[PayPal] Amount mismatch detected:', {
        capturedAmount,
        expectedAmount,
        orderId,
        paypalOrderId,
      });
      return NextResponse.json(
        { error: 'Amount mismatch', code: 'AMOUNT_VERIFICATION_FAILED' },
        { status: 400 }
      );
    }

    // 8. 트랜잭션 ID 추출
    const transactionId =
      capture.result.purchase_units[0]?.payments?.captures?.[0]?.id ||
      paypalOrderId;

    // 9. activate_paid_order RPC 호출 (등록 upsert)
    const { error: rpcError } = await supabase.rpc('activate_paid_order', {
      p_order_id: orderId,
    });

    if (rpcError) {
      console.error('[PayPal] activate_paid_order failed:', rpcError);
      throw new Error('Failed to activate order');
    }

    // 10. order_events에 이벤트 기록 (멱등성 보장)
    const { error: eventError } = await supabase.from('order_events').insert({
      stripe_event_id: paypalOrderId, // stripe_event_id 재사용
      order_id: orderId,
      event_type: 'paypal.payment.capture',
      payload: capture.result,
    });

    if (eventError) {
      console.error('[PayPal] Failed to log event:', eventError);
      // 이벤트 로그 실패는 치명적이지 않으므로 계속 진행
    }

    // 11. orders.transaction_id 업데이트
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        transaction_id: transactionId,
        payment_status: 'completed',
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('[PayPal] Failed to update order:', updateError);
    }

    console.log('[PayPal] Payment captured successfully:', {
      orderId,
      paypalOrderId,
      transactionId,
      amount: order.amount,
    });

    return NextResponse.json({
      success: true,
      orderId,
      transactionId,
      message: 'Payment completed successfully',
    });
  } catch (error: any) {
    console.error('[PayPal] Capture failed:', error);

    // PayPal API 오류 처리
    if (error.statusCode) {
      return NextResponse.json(
        {
          error: 'PayPal capture failed',
          details: error.message || 'Unknown error',
          statusCode: error.statusCode,
        },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      {
        error: error.message || 'Payment capture failed',
        details: error.details || undefined,
      },
      { status: 500 }
    );
  }
}
