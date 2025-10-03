import type { Order, Money } from '../types';

/**
 * Map Supabase order data to PDF Order type
 */
export function mapSupabaseOrderToReceipt(supabaseOrder: any): Order {
  // User info
  const user = supabaseOrder.user || {};
  const userName =
    user.name ||
    `${user.first_name || ''} ${user.last_name || ''}`.trim() ||
    'Customer';
  const userEmail = user.email || '';

  // Course info (assuming single course per order for now)
  const course = supabaseOrder.courses || {};
  const courseName = course.title || 'Course';

  // Money helpers
  const currency = supabaseOrder.currency || 'USD';
  const createMoney = (value: number): Money => ({
    currency,
    value: Number(value) || 0,
  });

  // Calculate amounts
  const amount = Number(supabaseOrder.amount) || 0;
  const taxRate = 0.05; // 5% tax
  const subtotal = amount / (1 + taxRate);
  const tax = amount - subtotal;

  return {
    id: supabaseOrder.id,
    number:
      supabaseOrder.order_number || supabaseOrder.id.slice(0, 12).toUpperCase(),
    createdAt: supabaseOrder.created_at || new Date().toISOString(),

    seller: {
      name: 'Daniel Vision School',
      address: {
        line1: 'Online Learning Platform',
        city: 'Muscat',
        country: 'Oman',
      },
      email: 'support@dvs-education.com',
      website: 'https://dvs-education.com',
    },

    billTo: {
      name: userName,
      line1: userEmail,
      city: '-',
      country: '-',
    },

    items: [
      {
        id: supabaseOrder.course_id || '1',
        name: courseName,
        qty: 1,
        unitPrice: createMoney(subtotal),
        total: createMoney(subtotal),
      },
    ],

    subtotal: createMoney(subtotal),
    tax: createMoney(tax),
    total: createMoney(amount),

    payment: {
      method: supabaseOrder.payment_method || 'PayPal',
      transactionId:
        supabaseOrder.transaction_id || supabaseOrder.paypal_order_id || '-',
      paidAt: supabaseOrder.updated_at || supabaseOrder.created_at,
    },
  };
}
