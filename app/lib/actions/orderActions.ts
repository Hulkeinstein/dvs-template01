'use server';

import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth.config';
import { Resend } from 'resend';
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
  process.env.EMAIL_FROM || 'DVS Education <no-reply@dvs-education.com>';

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
  const cartLines: CartLine[] = validatedItems.map(item => ({
    id: item.product.id,
    course_id: item.product.id,
    qty: item.amount,
    unit: item.validated_price,
    title: item.course_title
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
            <p>Thank you for your order! Your order has been received and is being processed.</p>

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
              <h4 style="margin-top: 0; color: #155724;">Next Steps</h4>
              <p style="color: #155724;">We will process your payment and activate your course access shortly.</p>
              <p style="color: #155724;">You will receive another email once your payment is confirmed.</p>
              <p style="margin-bottom: 0; color: #155724;">
                <a href="${process.env.NEXTAUTH_URL}/student/dashboard" style="color: #155724; font-weight: bold;">
                  Go to your dashboard →
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
    const cartHash = generateCartHash(cartItems.map(item => ({
      id: item.product.id,
      qty: item.amount,
      unit: item.product.price,
      title: item.product.title || item.product.courseTitle || ''
    })));
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
      if (orderError.message?.includes('duplicate key') || orderError.message?.includes('already exists')) {
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
        error: 'This order has already been placed. Please check your email for confirmation.',
      };
    }

    // 7. Create enrollments for purchased courses (only for non-free orders)
    // Note: Free orders automatically create enrollments in the RPC function
    const isOrderFree = isFreeOrder({
      subtotal,
      tax,
      discount,
      total,
      currency: 'USD'
    });

    if (!isOrderFree) {
      // For paid orders that will be processed through payment gateway
      // Enrollments will be created after successful payment
      console.log('Paid order created, awaiting payment for enrollment activation');
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

    // 9. Return success response
    const orderId = orderResult?.[0]?.order_id || idempotencyKey;
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
