// Supabase client
// NOTE: 공용 지연 생성 클라이언트 — import 시점이 아닌 최초 사용 시점에 env를 검증한다
import { supabaseServer as supabase } from '@/app/lib/supabase/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth.config';

// Dynamic imports for server-only modules to prevent client bundle inclusion
// These are loaded only when needed at runtime
const getPayPalModules = async () => {
  const [paypalModule, paypalLib] = await Promise.all([
    import('@/app/lib/paypal'),
    import('@paypal/checkout-server-sdk'),
  ]);
  return {
    paypalClient: paypalModule.paypalClient,
    isPayPalEnabled: paypalModule.isPayPalEnabled,
    paypal: paypalLib.default,
  };
};

const getEmailService = async () => {
  const emailModule = await import('@/app/lib/services/emailService');
  return emailModule.sendOrderConfirmationEmail;
};

const getPaymentService = async () => {
  const paymentModule = await import('@/app/lib/services/paymentService');
  return paymentModule.capturePayPalOrder;
};
import {
  calculateTotals,
  generateOrderNumber,
  generateCartHash,
  generateIdempotencyKey,
  isFreeOrder,
  getTaxRate,
  type CartLine,
} from '@/app/lib/checkout/priceCalculator';
import type {
  CheckoutFormData,
  CheckoutResponse,
  CartItem,
} from '@/types/checkout';

// =========================================================================
// Helper Functions
// =========================================================================

/**
 * Validate cart prices and calculate totals
 * Always use server-side prices for security
 */
async function validateAndCalculatePrices(items: CartItem[]) {
  // Get course IDs from cart
  const courseIds = items.map((item) => item.product.id);

  // Fetch actual prices from database
  const { data: courses, error } = await supabase
    .from('courses')
    .select('id, title, regular_price, discounted_price, is_free')
    .in('id', courseIds);

  if (error || !courses) {
    throw new Error('Failed to validate course prices');
  }

  // Map and validate each item
  const validatedItems = items.map((item) => {
    const course = courses.find((c) => c.id === item.product.id);
    if (!course) {
      throw new Error(`Course ${item.product.id} not found`);
    }

    // Use discounted price if available, otherwise regular price
    const price = course.is_free
      ? 0
      : course.discounted_price || course.regular_price || 0;

    return {
      ...item,
      course_title: course.title,
      validated_price: price,
      subtotal: price * item.amount,
    };
  });

  // Calculate totals using the price calculator
  const cartLines: CartLine[] = validatedItems.map((item) => ({
    id: item.product.id,
    course_id: item.product.id,
    qty: item.amount,
    unit: item.validated_price,
    title: item.course_title,
  }));

  const taxRate = getTaxRate('US'); // Can be enhanced with location-based tax
  const totals = calculateTotals(cartLines, { taxRate });

  return {
    validatedItems,
    subtotal: totals.subtotal,
    tax: totals.tax,
    discount: totals.discount,
    total: totals.total,
  };
}

/**
 * Send order confirmation email
 */

// =========================================================================
// Main Order Creation Function (Refactored)
// =========================================================================

/**
 * Creates a new order with atomic transaction support
 * Includes idempotency, price validation, and email notification
 */
export async function createOrder(
  formData: CheckoutFormData,
  cartItems: CartItem[]
): Promise<CheckoutResponse> {
  try {
    // 1. Validate session
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return {
        success: false,
        error: 'User not authenticated',
      };
    }

    // 2. Get user from database
    const { data: userData, error: userError } = await supabase
      .from('user')
      .select('id, name')
      .eq('email', session.user.email)
      .single();

    if (userError || !userData) {
      return {
        success: false,
        error: 'User not found',
      };
    }

    // 3. Validate and calculate prices
    let validatedItems, subtotal, tax, discount, total;
    try {
      const priceData = await validateAndCalculatePrices(cartItems);
      validatedItems = priceData.validatedItems;
      subtotal = priceData.subtotal;
      tax = priceData.tax;
      discount = priceData.discount;
      total = priceData.total;
    } catch (error) {
      console.error('Price validation error:', error);
      return {
        success: false,
        error: 'Failed to validate item prices. Please refresh and try again.',
      };
    }

    // 4. Generate unique identifiers
    const cartHash = generateCartHash(
      cartItems.map((item) => ({
        id: item.product.id,
        qty: item.amount,
        unit: item.product.price,
        title: item.product.title || item.product.courseTitle || '',
      }))
    );
    const idempotencyKey = generateIdempotencyKey(userData.id, cartHash);
    const orderNumber = generateOrderNumber();

    // 5. Prepare order data
    const orderData = {
      contact: {
        email: formData.shipping.email,
        phone: formData.shipping.phone,
      },
      shipping_address: formData.shipping,
      billing_address: formData.billing.sameAsShipping
        ? formData.shipping
        : formData.billing,
      items: validatedItems.map((item) => ({
        course_id: item.product.id,
        title:
          item.course_title || item.product.title || item.product.courseTitle,
        quantity: item.amount,
        price: item.validated_price,
        subtotal: item.subtotal,
      })),
    };

    // 6. Call RPC function for atomic order creation
    const itemsForRPC = validatedItems.map((item) => ({
      course_id: item.product.id,
      price: item.validated_price,
      quantity: item.amount,
    }));

    const { data: orderResult, error: orderError } = await supabase.rpc(
      'create_order_with_items',
      {
        p_user_id: userData.id,
        p_order_number: orderNumber,
        p_idempotency_key: idempotencyKey,
        p_order_data: orderData,
        p_items: itemsForRPC,
        p_subtotal: subtotal,
        p_tax_amount: tax,
        p_discount_amount: discount,
        p_total_amount: total,
        p_currency: 'USD',
        p_payment_method: formData.paymentMethod,
        p_notes: formData.orderNotes || null,
      }
    );

    if (orderError) {
      console.error('Order creation error:', orderError);

      // Check if it's a duplicate order
      if (
        orderError.message?.includes('duplicate key') ||
        orderError.message?.includes('already exists')
      ) {
        return {
          success: false,
          error:
            'This order is already being processed. Please check your email.',
        };
      }

      return {
        success: false,
        error: 'Failed to create order. Please try again.',
      };
    }

    // Check if it's a duplicate order (from RPC return value)
    const isDuplicate = orderResult?.[0]?.is_duplicate;
    if (isDuplicate) {
      return {
        success: false,
        error:
          'This order has already been placed. Please check your email for confirmation.',
      };
    }

    // 7. Create enrollments for purchased courses (only for non-free orders)
    // Note: Free orders automatically create enrollments in the RPC function
    const isOrderFree = isFreeOrder({
      subtotal,
      tax,
      discount,
      total,
      currency: 'USD',
    });

    if (!isOrderFree) {
      // For paid orders that will be processed through payment gateway
      // Enrollments will be created after successful payment
      console.log(
        'Paid order created, awaiting payment for enrollment activation'
      );
    } else {
      console.log('Free order - enrollments created automatically');
    }

    // 8. Send order confirmation email (non-blocking)
    const customerName = `${formData.shipping.firstName} ${formData.shipping.lastName}`;
    getEmailService()
      .then((sendOrderConfirmationEmail) =>
        sendOrderConfirmationEmail({
          email: formData.shipping.email,
          name: customerName,
          orderNumber,
          items: validatedItems,
          subtotal,
          tax,
          total,
          paymentMethod: formData.paymentMethod,
        })
      )
      .catch((error) => {
        // Log but don't fail the order if email fails
        console.error('Email sending failed:', error);
      });

    // 9. Handle payment method-specific redirects
    const orderId = orderResult?.[0]?.order_id || idempotencyKey;

    // For PayPal, create PayPal order and return approval URL
    if (formData.paymentMethod === 'paypal') {
      try {
        // 1. Load PayPal modules dynamically
        const { paypalClient, isPayPalEnabled, paypal } =
          await getPayPalModules();

        // 2. Check if PayPal is enabled
        if (!isPayPalEnabled()) {
          console.error('[OrderAction] PayPal is not enabled');
          return {
            success: false,
            error: 'PayPal payment is not available',
          };
        }

        // 3. Verify session in Server Action
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
          console.error('[OrderAction] PayPal: User not authenticated');
          return {
            success: false,
            error: 'You must be logged in to complete this purchase',
          };
        }

        console.log('[OrderAction] PayPal: Session verified', {
          userId: session.user.id,
          email: session.user.email,
        });

        // 4. Get course information for PayPal order
        const { data: course } = await supabase
          .from('courses')
          .select('id, title')
          .eq('id', cartItems[0]?.product.id)
          .single();

        if (!course) {
          console.error('[OrderAction] PayPal: Course not found');
          return {
            success: false,
            error: 'Course not found',
          };
        }

        // 5. Create PayPal order directly using SDK
        const request = new paypal.orders.OrdersCreateRequest();
        request.prefer('return=representation');
        request.headers['Content-Type'] = 'application/json';
        request.requestBody({
          intent: 'CAPTURE',
          purchase_units: [
            {
              reference_id: String(orderId), // DB order ID for tracking
              description: course.title,
              amount: {
                currency_code: 'USD',
                value: Number(total).toFixed(2),
              },
            },
          ],
          application_context: {
            brand_name: 'DVS Education',
            landing_page: 'NO_PREFERENCE',
            user_action: 'PAY_NOW',
            return_url: `${process.env.NEXTAUTH_URL}/order-success`,
            cancel_url: `${process.env.NEXTAUTH_URL}/courses/${cartItems[0]?.product.id}`,
          },
        });

        const response = await paypalClient.execute(request);

        // 5. Extract approval URL
        const approveUrl = response.result.links?.find(
          (link: any) => link.rel === 'approve'
        )?.href;

        if (!approveUrl) {
          console.error('[OrderAction] PayPal: No approve URL found');
          return {
            success: false,
            error: 'Failed to get PayPal approval URL',
          };
        }

        console.log('[OrderAction] PayPal order created successfully:', {
          orderId: String(orderId),
          paypalOrderId: response.result.id,
          amount: total.toFixed(2),
          approveUrl,
        });

        return {
          success: true,
          orderId: String(orderId),
          orderNumber: orderNumber,
          redirectUrl: approveUrl, // Redirect to PayPal
          message: 'Redirecting to PayPal...',
        };
      } catch (error: any) {
        console.error('[OrderAction] PayPal integration error:', error);
        return {
          success: false,
          error:
            error.message || 'Failed to connect to PayPal. Please try again.',
        };
      }
    }

    // For other payment methods, redirect to success page
    return {
      success: true,
      orderId: String(orderId),
      orderNumber: orderNumber,
      redirectUrl: `/order-success?orderId=${orderId}&orderNumber=${orderNumber}`,
      message: 'Order created successfully!',
    };
  } catch (error) {
    console.error('Unexpected error in createOrder:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

// =========================================================================
// Additional Functions
// =========================================================================

/**
 * Get user's orders
 */
export async function getUserOrders() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return {
        success: false,
        error: 'User not authenticated',
      };
    }

    const { data: userData } = await supabase
      .from('user')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (!userData) {
      return {
        success: false,
        error: 'User not found',
      };
    }

    const { data: orders, error } = await supabase
      .from('orders')
      .select(
        `
        *,
        courses:course_id (
          title,
          thumbnail_url,
          instructor_id
        )
      `
      )
      .eq('user_id', userData.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      return {
        success: false,
        error: 'Failed to fetch orders',
      };
    }

    return {
      success: true,
      orders: orders || [],
    };
  } catch (error) {
    console.error('Error fetching orders:', error);
    return {
      success: false,
      error: 'Failed to fetch orders',
    };
  }
}

/**
 * Get order by order number
 */
export async function getOrderByNumber(orderNumber: string) {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select(
        `
        *,
        courses:course_id (
          title,
          thumbnail_url,
          instructor_id
        ),
        user:user_id (
          name,
          email
        )
      `
      )
      .eq('order_number', orderNumber);

    if (error) {
      console.error('Error fetching order:', error);
      return {
        success: false,
        error: 'Failed to fetch order',
      };
    }

    return {
      success: true,
      orders: orders || [],
    };
  } catch (error) {
    console.error('Error fetching order:', error);
    return {
      success: false,
      error: 'Failed to fetch order',
    };
  }
}

// =========================================================================
// PayPal Capture
// =========================================================================

/**
 * Capture PayPal payment after user approval
 * Called from success page with PayPal Order ID
 */
export async function capturePayPalOrderAction(paypalOrderId: string) {
  try {
    // 1. Verify session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.error('[CapturePayPal] User not authenticated');
      return {
        success: false,
        error: 'You must be logged in',
      };
    }

    // 2. Call Payment Service (dynamic import)
    const capturePayPalOrder = await getPaymentService();
    return await capturePayPalOrder(paypalOrderId, session.user.id);
  } catch (error: unknown) {
    console.error('[CapturePayPal] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Payment capture failed',
    };
  }
}

// =========================================================================
// Instructor Order Functions
// =========================================================================

/**
 * Instructor order with course sales details
 */
export interface InstructorOrder {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  payment_method: string;
  total_amount: number;
  created_at: string;
  buyer: {
    name: string;
    email: string;
  } | null;
  order_items: Array<{
    course_id: string;
    quantity: number;
    price: string;
    course: {
      id: string;
      title: string;
      thumbnail_url: string | null;
    };
  }>;
}

/**
 * Get orders for courses owned by the instructor
 * Shows sales history for instructor's courses
 */
export async function getInstructorOrders(
  instructorId: string
): Promise<InstructorOrder[]> {
  try {
    // First get all courses by this instructor
    const { data: instructorCourses, error: coursesError } = await supabase
      .from('courses')
      .select('id')
      .eq('instructor_id', instructorId);

    if (coursesError) {
      console.error('Error fetching instructor courses:', coursesError);
      return [];
    }

    if (!instructorCourses || instructorCourses.length === 0) {
      return [];
    }

    const courseIds = instructorCourses.map((c) => c.id);

    // Get order_items for these courses, then join with orders
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select(
        `
        order_id,
        course_id,
        quantity,
        price,
        course:courses (
          id,
          title,
          thumbnail_url
        ),
        order:orders (
          id,
          order_number,
          status,
          payment_status,
          payment_method,
          total_amount,
          created_at,
          buyer:user_id (
            name,
            email
          )
        )
      `
      )
      .in('course_id', courseIds)
      .order('created_at', { ascending: false, referencedTable: 'orders' });

    if (itemsError) {
      console.error('Error fetching order items:', itemsError);
      return [];
    }

    if (!orderItems || orderItems.length === 0) {
      return [];
    }

    // Group by order and transform data
    const ordersMap = new Map<string, InstructorOrder>();

    for (const item of orderItems) {
      const order = item.order as any;
      if (!order) continue;

      const orderId = order.id;

      if (!ordersMap.has(orderId)) {
        ordersMap.set(orderId, {
          id: order.id,
          order_number: order.order_number,
          status: order.status || 'pending',
          payment_status: order.payment_status || 'pending',
          payment_method: order.payment_method || 'unknown',
          total_amount: parseFloat(order.total_amount) || 0,
          created_at: order.created_at,
          buyer: order.buyer,
          order_items: [],
        });
      }

      const existingOrder = ordersMap.get(orderId)!;
      existingOrder.order_items.push({
        course_id: item.course_id,
        quantity: item.quantity,
        price: item.price,
        course: item.course as any,
      });
    }

    // Convert to array and sort by date
    const orders = Array.from(ordersMap.values()).sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return orders;
  } catch (error) {
    console.error('Error in getInstructorOrders:', error);
    return [];
  }
}
