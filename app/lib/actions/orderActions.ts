'use server';

import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth.config';
import { Resend } from 'resend';
import { paypalClient, isPayPalEnabled } from '@/app/lib/paypal';
import paypal from '@paypal/checkout-server-sdk';
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

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Initialize Resend for email
const resend = new Resend(process.env.RESEND_API_KEY);
const EMAIL_FROM =
  process.env.EMAIL_FROM || 'DVS Education <onboarding@resend.dev>';

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
interface OrderItem {
  course_title?: string;
  product?: {
    title?: string;
    courseTitle?: string;
  };
  amount: number;
  validated_price?: number;
  subtotal?: number;
}

async function sendOrderConfirmationEmail(data: {
  email: string;
  name: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
}) {
  // Create HTML for items table
  const itemsHtml = data.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">
        ${item.course_title || item.product?.title || item.product?.courseTitle}
      </td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">
        ${item.amount}
      </td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">
        $${(item.validated_price || 0).toFixed(2)}
      </td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">
        $${(item.subtotal || 0).toFixed(2)}
      </td>
    </tr>
  `
    )
    .join('');

  const paymentMethodDisplay =
    {
      stripe: 'Credit/Debit Card',
      paypal: 'PayPal',
      cash_on_delivery: 'Pay Later',
    }[data.paymentMethod] || data.paymentMethod;

  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: data.email,
      subject: `Order Confirmation - ${data.orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; padding: 20px 0; background: #f8f9fa;">
            <h1 style="color: #333; margin: 0;">DVS Education</h1>
          </div>

          <div style="padding: 20px;">
            <h2 style="color: #333;">Order Confirmation</h2>
            <p>Dear ${data.name},</p>
            <p>Thank you for your order! Your order has been received and confirmed.</p>

            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #333;">Order Details</h3>
              <p><strong>Order Number:</strong> ${data.orderNumber}</p>
              <p><strong>Payment Method:</strong> ${paymentMethodDisplay}</p>
              <p><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>

            <h3 style="color: #333;">Order Items</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #f5f5f5;">
                  <th style="padding: 8px; text-align: left;">Course</th>
                  <th style="padding: 8px; text-align: center;">Qty</th>
                  <th style="padding: 8px; text-align: right;">Price</th>
                  <th style="padding: 8px; text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3" style="padding: 8px; text-align: right;"><strong>Subtotal:</strong></td>
                  <td style="padding: 8px; text-align: right;">$${data.subtotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colspan="3" style="padding: 8px; text-align: right;"><strong>Tax (5%):</strong></td>
                  <td style="padding: 8px; text-align: right;">$${data.tax.toFixed(2)}</td>
                </tr>
                <tr style="background: #f5f5f5;">
                  <td colspan="3" style="padding: 8px; text-align: right;"><strong>Total:</strong></td>
                  <td style="padding: 8px; text-align: right;"><strong>$${data.total.toFixed(2)}</strong></td>
                </tr>
              </tfoot>
            </table>

            <div style="margin-top: 30px; padding: 15px; background: #d4edda; border: 1px solid #c3e6cb; border-radius: 5px;">
              <h4 style="margin-top: 0; color: #155724;">🎉 Payment Successful!</h4>
              <p style="color: #155724;">Your payment has been confirmed and your course access is now active.</p>
              <p style="color: #155724;">You can start learning right away!</p>
              <p style="margin-bottom: 0; color: #155724;">
                <a href="${process.env.NEXTAUTH_URL}/student-enrolled-course" style="color: #155724; font-weight: bold;">
                  Start Learning →
                </a>
              </p>
            </div>

            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">

            <div style="text-align: center; color: #666; font-size: 14px;">
              <p>If you have any questions, please contact our support team.</p>
              <p>© ${new Date().getFullYear()} DVS Education. All rights reserved.</p>
            </div>
          </div>
        </div>
      `,
    });

    console.log(`Order confirmation email sent to ${data.email}`);
    return true;
  } catch (error) {
    console.error('Failed to send order confirmation email:', error);
    return false;
  }
}

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
    sendOrderConfirmationEmail({
      email: formData.shipping.email,
      name: customerName,
      orderNumber,
      items: validatedItems,
      subtotal,
      tax,
      total,
      paymentMethod: formData.paymentMethod,
    }).catch((error) => {
      // Log but don't fail the order if email fails
      console.error('Email sending failed:', error);
    });

    // 9. Handle payment method-specific redirects
    const orderId = orderResult?.[0]?.order_id || idempotencyKey;

    // For PayPal, create PayPal order and return approval URL
    if (formData.paymentMethod === 'paypal') {
      try {
        // 1. Check if PayPal is enabled
        if (!isPayPalEnabled()) {
          console.error('[OrderAction] PayPal is not enabled');
          return {
            success: false,
            error: 'PayPal payment is not available',
          };
        }

        // 2. Verify session in Server Action
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

        // 3. Get course information for PayPal order
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

        // 4. Create PayPal order directly using SDK
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
    // 1. Check if PayPal is enabled
    if (!isPayPalEnabled()) {
      console.error('[CapturePayPal] PayPal is not enabled');
      return {
        success: false,
        error: 'PayPal payment is not available',
      };
    }

    // 2. Verify session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.error('[CapturePayPal] User not authenticated');
      return {
        success: false,
        error: 'You must be logged in',
      };
    }

    console.log('[CapturePayPal] Processing capture:', {
      paypalOrderId,
      userId: session.user.id,
    });

    // 3. Capture PayPal order
    const request = new paypal.orders.OrdersCaptureRequest(paypalOrderId);
    // Set idempotency header for duplicate prevention
    request.headers = {
      'PayPal-Request-Id': `capture-${paypalOrderId}`,
      'Content-Type': 'application/json',
    };
    request.requestBody({});

    const capture = await paypalClient.execute(request);
    const result = capture.result as any;

    // 4. Verify capture success
    if (result.status !== 'COMPLETED') {
      console.error('[CapturePayPal] Capture not completed:', result.status);
      return {
        success: false,
        error: `Payment capture failed: ${result.status}`,
      };
    }

    // 5. Extract transaction details
    const transactionId =
      result.purchase_units[0]?.payments?.captures?.[0]?.id || paypalOrderId;
    const amount =
      result.purchase_units[0]?.payments?.captures?.[0]?.amount?.value;
    const currency =
      result.purchase_units[0]?.payments?.captures?.[0]?.amount?.currency_code;
    const referenceId = result.purchase_units[0]?.reference_id; // Our DB order ID

    console.log('[CapturePayPal] Capture successful:', {
      paypalOrderId,
      transactionId,
      amount,
      currency,
      referenceId,
    });

    // 6. Update order in DB
    if (referenceId) {
      // Update order status
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          transaction_id: transactionId,
          payment_status: 'completed',
          payment_method: 'paypal',
        })
        .eq('id', referenceId)
        .eq('user_id', session.user.id); // Security check

      if (updateError) {
        console.error('[CapturePayPal] Failed to update order:', updateError);
      }

      // 7. Activate paid order (create enrollment)
      const { data: activationResult, error: rpcError } = await supabase.rpc(
        'activate_paid_order',
        {
          p_order_id: referenceId,
          p_event_id: paypalOrderId, // Idempotency key
        }
      );

      if (rpcError) {
        console.error('[CapturePayPal] Failed to activate order:', {
          error: rpcError,
          message: rpcError.message,
          details: rpcError.details,
          hint: rpcError.hint,
          code: rpcError.code,
        });
        return {
          success: false,
          error: `Failed to activate enrollment: ${rpcError.message || rpcError.details || 'Unknown error'}`,
        };
      }

      console.log(
        '[CapturePayPal] Order activated successfully:',
        activationResult
      );

      console.log('[CapturePayPal] Starting email process...');

      // 8. Fetch order details for confirmation email
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

      if (orderError) {
        console.error('[CapturePayPal] Failed to fetch order:', orderError);
      }

      // 9. Fetch order items with course details
      const { data: orderItems, error: itemsError } = await supabase
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

      if (itemsError) {
        console.error(
          '[CapturePayPal] Failed to fetch order items:',
          itemsError
        );
      }

      // 10. Send order confirmation email (non-blocking)
      console.log('[CapturePayPal] Email check:', {
        hasOrderData: !!orderData,
        hasOrderItems: !!orderItems,
        hasUser: !!orderData?.user,
        userEmail: (orderData?.user as any)?.email,
      });

      if (orderData && orderItems && orderData.user) {
        const formattedItems = orderItems.map((item) => ({
          course_title: (item.courses as any)?.title || 'Unknown Course',
          amount: item.quantity,
          validated_price: parseFloat(item.price || '0'),
          subtotal: parseFloat(item.price || '0') * item.quantity,
        }));

        sendOrderConfirmationEmail({
          email: (orderData.user as any).email,
          name: (orderData.user as any).name || 'Customer',
          orderNumber: orderData.order_number,
          items: formattedItems,
          subtotal: parseFloat(orderData.subtotal || '0'),
          tax: parseFloat(orderData.tax_amount || '0'),
          total: parseFloat(orderData.total_amount || '0'),
          paymentMethod: 'paypal',
        }).catch((emailError) => {
          console.error('[CapturePayPal] Failed to send email:', emailError);
          // Non-blocking - don't fail the payment
        });

        console.log('[CapturePayPal] Confirmation email queued');
      } else {
        console.log('[CapturePayPal] Email NOT sent - missing data:', {
          orderData: !!orderData,
          orderItems: !!orderItems,
          user: !!orderData?.user,
        });
      }

      // 11. Log event for idempotency
      await supabase.from('order_events').insert({
        stripe_event_id: paypalOrderId,
        order_id: referenceId,
        event_type: 'paypal.payment.capture',
        payload: result,
      });
    }

    return {
      success: true,
      orderId: referenceId,
      transactionId,
      amount,
      currency,
      status: result.status,
    };
  } catch (error: any) {
    console.error('[CapturePayPal] Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to capture payment',
    };
  }
}
