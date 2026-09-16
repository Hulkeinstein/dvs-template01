// Supabase client with Service Role for admin access
// NOTE: 공용 지연 생성 클라이언트 — import 시점이 아닌 최초 사용 시점에 env를 검증한다
import { supabaseServer as supabase } from '@/app/lib/supabase/server';
import { paypalClient, isPayPalEnabled } from '@/app/lib/paypal';
import paypal from '@paypal/checkout-server-sdk';
import { sendOrderConfirmationEmail } from './emailService';

interface CaptureResult {
  success: boolean;
  error?: string;
  orderId?: string;
  transactionId?: string;
  message?: string;
  amount?: string;
  currency?: string;
  status?: string;
}

/**
 * Capture PayPal payment
 * Can be called from Server Action (with userId) or Webhook (without userId)
 */
export async function capturePayPalOrder(
  paypalOrderId: string,
  userId?: string
): Promise<CaptureResult> {
  try {
    // 1. Check if PayPal is enabled
    if (!isPayPalEnabled()) {
      console.error('[PaymentService] PayPal is not enabled');
      return {
        success: false,
        error: 'PayPal payment is not available',
      };
    }

    console.log('[PaymentService] Processing capture:', {
      paypalOrderId,
      userId: userId || 'webhook',
    });

    // 2. Capture PayPal order
    // Using simple request body as we are capturing existing authorization
    const request = new paypal.orders.OrdersCaptureRequest(paypalOrderId);
    request.headers = {
      'PayPal-Request-Id': `capture-${paypalOrderId}`,
      'Content-Type': 'application/json',
    };
    request.requestBody({});

    let capture;
    try {
      capture = await paypalClient.execute(request);
    } catch (err: any) {
      // Check if already captured
      if (
        err.statusCode === 422 &&
        err.message?.includes('ORDER_ALREADY_CAPTURED')
      ) {
        console.log(
          '[PaymentService] Order already captured, checking DB status...'
        );
        // Proceed to check DB status
        // We'll skip fetching details for now to avoid specific SDK type issues
        // and assume we can find the order by ID if needed or fail gracefully.
        // const getRequest = new paypal.orders.OrdersGetRequest(paypalOrderId);
        // const orderDetails = await paypalClient.execute(getRequest);
        throw new Error('Order already captured');
      } else {
        throw err;
      }
    }

    const result = capture.result as any;

    // 3. Verify capture success
    if (result.status !== 'COMPLETED') {
      // If it's not completed (e.g. pending), we might still want to record it, but for now treat as error
      console.error('[PaymentService] Capture not completed:', result.status);
      return {
        success: false,
        error: `Payment capture failed: ${result.status}`,
      };
    }

    // 4. Extract transaction details
    // Capture ID is usually inside purchase_units[0].payments.captures[0].id
    // But if we used 'capture' action, it might be result.id if result is a capture object?
    // PayPal SDK execute returns the full response.
    // Ensure we parse it correctly.
    // If it was a 'capture' call, the result IS the capture.
    // If it was a 'get' call (already captured), the result is the Order, which has purchase_units[0].payments.captures

    let transactionId = '';
    let amount = '';
    let referenceId = '';

    if (result.purchase_units) {
      // It's an Order object (from Get or Capture response structure)
      const captures = result.purchase_units[0]?.payments?.captures;
      if (captures && captures.length > 0) {
        transactionId = captures[0].id;
        amount = captures[0].amount?.value;
        referenceId = result.purchase_units[0]?.reference_id;
      }
    }

    // Fallback if structure is different (direct capture object?)
    if (!transactionId) {
      transactionId = result.id || paypalOrderId; // Fallback
    }

    console.log('[PaymentService] Capture successful:', {
      paypalOrderId,
      transactionId,
      amount,
      referenceId,
    });

    if (!referenceId) {
      console.warn(
        '[PaymentService] No reference_id found in PayPal order. Cannot link to local order.'
      );
      // Try to find order by stripe_event_id (paypalOrderId) if we stored it?
      // But we store it AFTER capture usually.
      // We should depend on reference_id being set during create-order.
      return {
        success: false,
        error: 'Could not link PayPal order to local order',
      };
    }

    // 5. Update order in DB
    let query = supabase
      .from('orders')
      .update({
        transaction_id: transactionId,
        payment_status: 'completed',
        payment_method: 'paypal',
      })
      .eq('id', referenceId);

    // If userId provided, enforce ownership check
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { error: updateError } = await query;

    if (updateError) {
      console.error('[PaymentService] Failed to update order:', updateError);
      // We don't return error here because payment IS captured. We need to try activation.
    }

    // 6. Activate paid order (create enrollment)
    const { data: activationResult, error: rpcError } = await supabase.rpc(
      'activate_paid_order',
      {
        p_order_id: referenceId,
        p_event_id: paypalOrderId, // Idempotency key
      }
    );

    if (rpcError) {
      console.error('[PaymentService] Failed to activate order:', rpcError);
      return {
        success: true, // Payment successful technically
        message:
          'Payment received but enrollment failed. Please contact support.',
        error: `Enrollment error: ${rpcError.message}`,
      };
    }

    console.log(
      '[PaymentService] Order activated successfully:',
      activationResult
    );

    // 7. Send Email
    // Fetch order details first
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select(
        `
        id,
        order_number,
        subtotal,
        tax_amount,
        total_amount,
        user:user_id (
          email,
          name
        )
      `
      )
      .eq('id', referenceId)
      .single();

    if (orderError || !orderData) {
      console.error(
        '[PaymentService] Failed to fetch order for email:',
        orderError
      );
    } else {
      // Fetch items
      const { data: orderItems } = await supabase
        .from('order_items')
        .select(
          `
          id,
          course_id,
          quantity,
          price,
          courses:course_id (
            title
          )
        `
        )
        .eq('order_id', referenceId);

      const items =
        orderItems?.map((item: any) => ({
          course_title: item.courses?.title,
          amount: item.quantity,
          validated_price: item.price,
          subtotal: item.price * item.quantity,
        })) || [];

      const user = Array.isArray(orderData.user)
        ? orderData.user[0]
        : orderData.user;
      const customerName = user?.name || 'Customer';
      const customerEmail = user?.email;

      if (customerEmail) {
        await sendOrderConfirmationEmail({
          email: customerEmail,
          name: customerName,
          orderNumber: orderData.order_number,
          items,
          subtotal: Number(orderData.subtotal),
          tax: Number(orderData.tax_amount),
          total: Number(orderData.total_amount),
          paymentMethod: 'paypal',
        });
      }
    }

    return {
      success: true,
      orderId: referenceId,
      transactionId,
      message: 'Payment completed successfully',
    };
  } catch (error: any) {
    console.error('[PaymentService] Capture exception:', error);
    return {
      success: false,
      error: error.message || 'Payment capture failed',
    };
  }
}
