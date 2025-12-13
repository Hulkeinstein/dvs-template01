'use server';

import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth.config';

// Initialize Supabase with service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Get all pending paid orders
 * Admin only function to view orders awaiting payment confirmation
 */
export async function getPendingPaidOrders() {
  try {
    // Check if user is admin
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get user role
    const { data: userData, error: userError } = await supabase
      .from('user')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (userError || !['instructor', 'admin'].includes(userData?.role ?? '')) {
      return { success: false, error: 'Admin access required' };
    }

    // Call the SQL function to get pending orders
    const { data, error } = await supabase.rpc('get_pending_paid_orders');

    if (error) {
      console.error('Error fetching pending orders:', error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      orders: data || [],
      message: `Found ${data?.length || 0} pending orders`,
    };
  } catch (error) {
    console.error('Unexpected error in getPendingPaidOrders:', error);
    return { success: false, error: 'Failed to fetch pending orders' };
  }
}

/**
 * Activate a paid order and create enrollments
 * Admin only function to manually confirm payment and grant course access
 */
export async function activatePaidOrder(orderId: string) {
  try {
    // Check if user is admin
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get user role
    const { data: userData, error: userError } = await supabase
      .from('user')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (userError || !['instructor', 'admin'].includes(userData?.role ?? '')) {
      return { success: false, error: 'Admin access required' };
    }

    // Call the SQL function to activate the order
    const { data, error } = await supabase.rpc('activate_paid_order', {
      p_order_id: orderId,
      p_admin_id: session.user.id,
    });

    if (error) {
      console.error('Error activating order:', error);
      return { success: false, error: error.message };
    }

    // Check the result from the SQL function
    if (data && typeof data === 'object') {
      if (data.success) {
        return {
          success: true,
          message: data.message || 'Order activated successfully',
          enrollments_created: data.enrollments_created || 0,
          order_id: data.order_id,
          user_id: data.user_id,
        };
      } else {
        return {
          success: false,
          error: data.error || 'Failed to activate order',
        };
      }
    }

    return { success: true, message: 'Order activated successfully' };
  } catch (error) {
    console.error('Unexpected error in activatePaidOrder:', error);
    return { success: false, error: 'Failed to activate order' };
  }
}

/**
 * Get order details with items
 * Admin function to view detailed order information
 */
export async function getOrderDetails(orderId: string) {
  try {
    // Check if user is admin
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get user role
    const { data: userData, error: userError } = await supabase
      .from('user')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (userError || !['instructor', 'admin'].includes(userData?.role ?? '')) {
      return { success: false, error: 'Admin access required' };
    }

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(
        `
        *,
        user:user_id (
          id,
          email,
          name
        )
      `
      )
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return { success: false, error: 'Order not found' };
    }

    // Check if order_items table exists and get items
    let orderItems = [];
    const { data: tableExists } = await supabase.rpc('to_regclass', {
      p_table: 'public.order_items',
    });

    if (tableExists) {
      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select(
          `
          *,
          course:course_id (
            id,
            title,
            regular_price,
            discounted_price
          )
        `
        )
        .eq('order_id', orderId);

      if (!itemsError && items) {
        orderItems = items;
      }
    } else {
      // If no order_items table, try to get course from orders table
      if (order.course_id) {
        const { data: course } = await supabase
          .from('courses')
          .select('id, title, regular_price, discounted_price')
          .eq('id', order.course_id)
          .single();

        if (course) {
          orderItems = [
            {
              course_id: course.id,
              course: course,
              quantity: 1,
              price: order.total_amount,
            },
          ];
        }
      }
    }

    return {
      success: true,
      order: order,
      items: orderItems,
    };
  } catch (error) {
    console.error('Unexpected error in getOrderDetails:', error);
    return { success: false, error: 'Failed to fetch order details' };
  }
}

/**
 * Update order payment status
 * Admin function to manually update payment status
 */
export async function updateOrderPaymentStatus(
  orderId: string,
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded'
) {
  try {
    // Check if user is admin
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get user role
    const { data: userData, error: userError } = await supabase
      .from('user')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (userError || !['instructor', 'admin'].includes(userData?.role ?? '')) {
      return { success: false, error: 'Admin access required' };
    }

    // Update order payment status
    const { data, error } = await supabase
      .from('orders')
      .update({
        payment_status: status,
        status: status === 'succeeded' ? 'completed' : 'pending',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      console.error('Error updating order status:', error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      message: `Order payment status updated to ${status}`,
      order: data,
    };
  } catch (error) {
    console.error('Unexpected error in updateOrderPaymentStatus:', error);
    return { success: false, error: 'Failed to update order status' };
  }
}
