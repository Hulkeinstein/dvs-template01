'use client';

import Link from 'next/link';
import type { InstructorOrder } from '@/app/lib/actions/orderActions';

interface OrderHistoryProps {
  orders: InstructorOrder[];
  error?: string | null;
}

// Status badge styling constants
const STATUS_STYLES: Record<
  string,
  { bg: string; color: string; label: string }
> = {
  completed: {
    bg: 'bg-color-success-opacity',
    color: 'color-success',
    label: 'Completed',
  },
  success: {
    bg: 'bg-color-success-opacity',
    color: 'color-success',
    label: 'Success',
  },
  processing: {
    bg: 'bg-primary-opacity',
    color: '',
    label: 'Processing',
  },
  pending: {
    bg: 'bg-color-warning-opacity',
    color: 'color-warning',
    label: 'Pending',
  },
  on_hold: {
    bg: 'bg-color-warning-opacity',
    color: 'color-warning',
    label: 'On Hold',
  },
  cancelled: {
    bg: 'bg-color-danger-opacity',
    color: 'color-danger',
    label: 'Cancelled',
  },
  canceled: {
    bg: 'bg-color-danger-opacity',
    color: 'color-danger',
    label: 'Cancelled',
  },
  refunded: {
    bg: 'bg-color-danger-opacity',
    color: 'color-danger',
    label: 'Refunded',
  },
  failed: {
    bg: 'bg-color-danger-opacity',
    color: 'color-danger',
    label: 'Failed',
  },
};

// Format currency
const formatCurrency = (amount: number | string): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(numAmount || 0);
};

// Format date
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Get status badge
const StatusBadge = ({ status }: { status: string }) => {
  const normalizedStatus = status?.toLowerCase() || 'pending';
  const style = STATUS_STYLES[normalizedStatus] || STATUS_STYLES.pending;

  return (
    <span className={`rbt-badge-5 ${style.bg} ${style.color}`}>
      {style.label}
    </span>
  );
};

const OrderHistory = ({ orders, error }: OrderHistoryProps) => {
  // Error state
  if (error) {
    return (
      <div className="rbt-dashboard-content bg-color-white rbt-shadow-box">
        <div className="content">
          <div className="section-title">
            <h4 className="rbt-title-style-3">Order History</h4>
            <p className="description">Sales from your courses</p>
          </div>
          <div className="alert alert-danger">{error}</div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!orders || orders.length === 0) {
    return (
      <div className="rbt-dashboard-content bg-color-white rbt-shadow-box">
        <div className="content">
          <div className="section-title">
            <h4 className="rbt-title-style-3">Order History</h4>
            <p className="description">Sales from your courses</p>
          </div>
          <div className="text-center py-5">
            <i
              className="feather-shopping-bag"
              style={{ fontSize: '48px', opacity: 0.3 }}
            />
            <p className="mt-3 mb-0">No orders yet.</p>
            <p className="text-muted">
              When students purchase your courses, orders will appear here.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rbt-dashboard-content bg-color-white rbt-shadow-box">
      <div className="content">
        <div className="section-title">
          <h4 className="rbt-title-style-3">Order History</h4>
          <p className="description">
            Sales from your courses ({orders.length} total)
          </p>
        </div>

        <div className="rbt-dashboard-table table-responsive mobile-table-750">
          <table className="rbt-table table table-borderless">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Course</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <th>#{order.order_number}</th>
                  <td>
                    <div>
                      <span className="d-block">
                        {order.buyer?.name || 'Unknown'}
                      </span>
                      <small className="text-muted">
                        {order.buyer?.email || ''}
                      </small>
                    </div>
                  </td>
                  <td>
                    {order.order_items.map((item, idx) => (
                      <div key={idx} className="mb-1">
                        <Link
                          href={`/course-details/${item.course_id}`}
                          className="text-primary"
                        >
                          {item.course?.title || 'Unknown Course'}
                        </Link>
                        {item.quantity > 1 && (
                          <small className="text-muted">
                            {' '}
                            x{item.quantity}
                          </small>
                        )}
                      </div>
                    ))}
                  </td>
                  <td>{formatDate(order.created_at)}</td>
                  <td>
                    <span className="rbt-badge-5 bg-primary-opacity">
                      {formatCurrency(order.total_amount)}
                    </span>
                  </td>
                  <td>
                    <StatusBadge
                      status={order.payment_status || order.status}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;
