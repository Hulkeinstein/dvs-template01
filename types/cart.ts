// Cart System Type Definitions

export interface CartProduct {
  id?: string;
  kind?: 'course' | 'product';
  courseId?: string;
  courseTitle?: string;
  title?: string;
  productKey?: string;
  courseImg?: string;
  eventImg?: string;
  thumbnail_url?: string;
  price: number;
  regular_price?: number;
  discounted_price?: number;
  productType?: string;
}

export interface CartItem {
  id: string;
  productKey?: string;
  kind?: 'course' | 'product';
  price: number;
  product: CartProduct;
  amount: number;
  max: number;
}

export interface CartState {
  cart: CartItem[];
  total_items: number;
  total_amount: number;
  shipping_fee: number;
  loading: boolean;
  error: boolean;
  msg: string;
}

// Redux Action Types
export type CartActionType =
  | 'CART_REQ'
  | 'CART_REQ_OUT'
  | 'ADD_TO_CART'
  | 'TOGGLE_CART_AMOUNT'
  | 'DELETE_CART_ITEM'
  | 'COUNT_CART_TOTALS'
  | 'CLEAR_CART'
  | 'SET_CART_ERROR'
  | 'CLEAR_CART_ERROR';

export interface AddToCartPayload {
  id: string;
  amount: number;
  product: CartProduct;
  category?: string;
}

export interface ToggleAmountPayload {
  id: string;
  value: 'inc' | 'dec';
}

export interface CartAction {
  type: CartActionType;
  payload?: AddToCartPayload | ToggleAmountPayload | string | undefined;
}