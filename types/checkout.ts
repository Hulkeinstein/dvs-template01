// Checkout System Type Definitions

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
  paymentMethod: 'stripe' | 'paypal' | 'cash_on_delivery';
  orderNotes?: string;
  agreeToTerms: boolean;
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
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
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
