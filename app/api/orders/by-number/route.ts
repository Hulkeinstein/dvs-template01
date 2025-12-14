import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth.config';
import { getServerClient } from '@/app/lib/supabase/server';

/**
 * GET /api/orders/by-number?orderNumber=xxx
 * 주문번호로 주문 조회
 */
export async function GET(req: NextRequest) {
  try {
    // 1. 인증 확인
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const orderNumber = searchParams.get('orderNumber');

    if (!orderNumber) {
      return NextResponse.json(
        { error: 'Order number is required' },
        { status: 400 }
      );
    }

    const supabase = getServerClient();

    // 2. 주문 조회 (본인 주문만)
    const { data: orders, error } = await supabase
      .from('orders')
      .select('id, order_number, payment_status, total_amount, created_at')
      .eq('order_number', orderNumber)
      .eq('user_id', session.user.id);

    if (error) {
      console.error('[Orders By Number] Query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch order' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      orders: orders || [],
    });
  } catch (error: unknown) {
    console.error('[Orders By Number] Error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to fetch order';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
