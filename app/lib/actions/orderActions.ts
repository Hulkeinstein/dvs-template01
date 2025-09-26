'use server';

import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth.config';
import type {
  CheckoutFormData,
  CheckoutResponse,
  CartItem,
} from '@/types/checkout';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Creates a new order in the database
 * Works with the existing simple orders table structure
 */
export async function createOrder(
  formData: CheckoutFormData,
  cartItems: CartItem[]
): Promise<CheckoutResponse> {
  try {
    // Get current user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return {
        success: false,
        error: 'User not authenticated',
      };
    }

    // Get user from database
    const { data: userData, error: userError } = await supabase
      .from('user')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (userError || !userData) {
      return {
        success: false,
        error: 'User not found',
      };
    }

    // Calculate total (not used for individual orders, but can be used for logging)

    // Create orders for each course (since the table has course_id column)
    const orderPromises = cartItems.map(async (item) => {
      const { data: orderResult, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: userData.id,
          course_id: item.product.id,
          amount: item.product.price * item.amount,
        })
        .select('id')
        .single();

      if (orderError) {
        console.error(
          'Order creation error for course:',
          item.product.id,
          orderError
        );
        throw orderError;
      }

      return orderResult;
    });

    try {
      const orderResults = await Promise.all(orderPromises);

      // Create enrollments for each course
      const enrollments = cartItems.map((item) => ({
        user_id: userData.id,
        course_id: item.product.id,
        status: 'active', // Activate immediately for now
      }));

      const { error: enrollmentError } = await supabase
        .from('enrollments')
        .upsert(enrollments, {
          onConflict: 'user_id,course_id',
        });

      if (enrollmentError) {
        console.error('Enrollment creation error:', enrollmentError);
      }

      // Return success with the first order ID
      const orderId = orderResults[0]?.id || 'success';

      return {
        success: true,
        orderId: String(orderId),
        redirectUrl: `/student/dashboard?orderSuccess=true`,
        message: 'Order created successfully! You can now access your courses.',
      };
    } catch (error) {
      console.error('Failed to create orders:', error);
      return {
        success: false,
        error: 'Failed to process some items in your order',
      };
    }
  } catch (error) {
    console.error('Unexpected error in createOrder:', error);
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}

/**
 * Gets user's orders
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
