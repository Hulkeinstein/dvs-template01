// Checkout System Type Definitions

// ============================================
// Status Types (Single Source of Truth)
// ============================================

/** 주문 상태 */
export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled';

/** 결제 상태 */
export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'refunded'
  | 'paid' // legacy: OrderData 호환
  | 'succeeded'; // legacy: Payment 호환

/** 결제 수단 */
export type PaymentMethod = 'stripe' | 'paypal' | 'cash_on_delivery';

/** 결제 게이트웨이 */
export type PaymentGateway = 'stripe' | 'paypal' | 'manual' | 'free';

/** 결제 에러 코드 */
export type PaymentErrorCode =
  | 'PRICE_TAMPERED'
  | 'AMOUNT_VERIFICATION_FAILED'
  | 'DUPLICATE_ENROLLMENT'
  | 'ORDER_NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'PAYPAL_CAPTURE_FAILED'
  | 'PAYPAL_ORDER_FAILED'
  | 'PAYMENT_ALREADY_PROCESSED'
  | 'INVALID_REQUEST'
  | 'INTERNAL_ERROR';

/** 결제 에러 응답 */
export interface PaymentErrorResponse {
  error: string;
  code: PaymentErrorCode;
  details?: string;
}

// ============================================
// Product & Cart Types
// ============================================

export interface Product {
  id: string;
  title?: string;
  courseTitle?: string;
  price: number;
  thumbnail_url?: string;
  instructor_name?: string;
  regular_price?: number;
  discounted_price?: number;
}

export interface CartItem {
  id: string;
  amount: number;
  product: Product;
  max?: number;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  address: string;
  city: string;
  country: string;
  zipCode: string;
  state?: string;
}

export interface BillingAddress extends ShippingAddress {
  sameAsShipping?: boolean;
}

export interface CheckoutFormData {
  shipping: ShippingAddress;
  billing: BillingAddress;
  paymentMethod: PaymentMethod;
  orderNotes?: string;
  agreeToTerms: boolean;
  agreeToPrivacy: boolean;
  agreeToMarketing: boolean;
}

export interface OrderData {
  user_id: string;
  items: OrderItem[];
  total_amount: number;
  subtotal: number;
  tax_amount?: number;
  discount_amount?: number;
  shipping_address: ShippingAddress;
  billing_address: BillingAddress;
  payment_method: string;
  order_notes?: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  currency: string;
  transaction_id?: string;
}

export interface OrderItem {
  course_id: string;
  course_title: string;
  price: number;
  quantity: number;
  instructor_id?: string;
}

export interface CheckoutResponse {
  success: boolean;
  orderId?: string;
  orderNumber?: string;
  redirectUrl?: string;
  error?: string;
  message?: string;
}

export interface CheckoutState {
  isLoading: boolean;
  error: string | null;
  currentStep: 'billing' | 'payment' | 'review' | 'complete';
  formData: Partial<CheckoutFormData>;
}

// ============================================
// Database Types (matching new structure)
// ============================================

export interface Order {
  id: string; // UUID
  user_id: string;
  course_id?: string;
  order_number: string;
  idempotency_key: string;
  amount: number;
  subtotal?: number;
  tax_amount?: number;
  discount_amount?: number;
  total_amount?: number;
  currency: string;
  payment_method?: PaymentMethod;
  payment_status?: PaymentStatus;
  status?: OrderStatus;
  transaction_id?: string;
  order_data?: Record<string, unknown>; // JSONB
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  order_id: string;
  gateway: PaymentGateway;
  gateway_payment_id: string;
  amount_cents: number;
  currency: string;
  status: PaymentStatus;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface OrderItemDB {
  id: string;
  order_id: string;
  course_id: string;
  price: number;
  quantity: number;
  subtotal: number;
  created_at: string;
}
