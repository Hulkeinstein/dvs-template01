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
    console.log('[PayPal API] Session Debug:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      hasUserId: !!session?.user?.id,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      userRole: session?.user?.role,
      fullUser: session?.user,
    });

    if (!session?.user?.id) {
      console.error('[PayPal API] Unauthorized - session.user.id is missing');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { courseId, orderId, amount } = await req.json();

    if (!courseId || !orderId || !amount) {
      return NextResponse.json(
        { error: 'Course ID, Order ID, and amount are required' },
        { status: 400 }
      );
    }

    const supabase = getServerClient();

    // 3. 코스 정보 조회 (제목만 필요)
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, title')
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      console.error('Course not found:', courseError);
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // 4. 중복 등록 확인 (Duplicate Enrollment Prevention - Layer 3)
    const { data: existingEnrollment, error: enrollmentCheckError } =
      await supabase
        .from('enrollments')
        .select('id, status')
        .eq('user_id', session.user.id)
        .eq('course_id', courseId)
        .maybeSingle();

    if (enrollmentCheckError) {
      console.error('Enrollment check failed:', enrollmentCheckError);
      return NextResponse.json(
        { error: 'Failed to verify enrollment status' },
        { status: 500 }
      );
    }

    if (existingEnrollment) {
      console.warn('[PayPal] Duplicate enrollment attempt:', {
        userId: session.user.id,
        courseId,
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

    // 5. DB Order 확인 (이미 생성되어 있어야 함)
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, user_id, amount')
      .eq('id', orderId)
      .eq('user_id', session.user.id) // 본인 주문인지 확인
      .single();

    if (orderError || !order) {
      console.error('Order not found or unauthorized:', orderError);
      return NextResponse.json(
        { error: 'Order not found or unauthorized' },
        { status: 404 }
      );
    }

    // 6. PayPal Order 생성
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: order.id, // DB order ID로 멱등 연결
          description: course.title,
          amount: {
            currency_code: 'USD',
            value: Number(amount).toFixed(2), // 파라미터로 받은 amount 사용
          },
        },
      ],
      application_context: {
        brand_name: 'DVS Education',
        landing_page: 'NO_PREFERENCE',
        user_action: 'PAY_NOW',
        return_url: `${process.env.NEXTAUTH_URL}/checkout/success`,
        cancel_url: `${process.env.NEXTAUTH_URL}/courses/${courseId}`,
      },
    });

    const response = await paypalClient.execute(request);

    // PayPal 승인 URL 추출
    const approveUrl = response.result.links?.find(
      (link: any) => link.rel === 'approve'
    )?.href;

    if (!approveUrl) {
      console.error('[PayPal] No approve URL found in response');
      throw new Error('Failed to get PayPal approval URL');
    }

    console.log('[PayPal] Order created:', {
      orderId: order.id,
      paypalOrderId: response.result.id,
      amount: amount.toFixed(2),
      approveUrl,
    });

    return NextResponse.json({
      paypalOrderId: response.result.id,
      orderId: order.id,
      approveUrl, // PayPal 승인 페이지 URL
    });
  } catch (error: any) {
    console.error('PayPal order creation failed:', error);
    return NextResponse.json(
      {
        error: error.message || 'Payment initialization failed',
        details: error.details || undefined,
      },
      { status: 500 }
    );
  }
}
