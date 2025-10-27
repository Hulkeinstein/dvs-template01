// Domain types for receipt PDF

export type Money = {
  currency: string; // e.g., "USD", "OMR", "KRW"
  value: number; // stored as major unit (e.g., 1.23 = $1.23)
};

export type Address = {
  name?: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
  phone?: string;
  email?: string;
};

export type OrderItem = {
  id: string;
  sku?: string;
  name: string;
  description?: string;
  qty: number;
  unitPrice: Money;
  discount?: Money;
  tax?: Money;
  total: Money; // qty * unitPrice - discount + tax
};

export type PaymentInfo = {
  method: 'PayPal' | 'Card' | 'BankTransfer' | 'Cash' | string;
  brand?: string; // e.g., "VISA"
  last4?: string; // e.g., "4242"
  approvalCode?: string; // e.g., auth code
  transactionId?: string; // PSP tx id
  paidAt?: string; // ISO string
  notes?: string;
};

export type Seller = {
  name: string;
  logoBase64?: string; // data:image/png;base64,....
  address?: Address;
  taxId?: string;
  website?: string;
  email?: string;
  phone?: string;
};

export type Order = {
  id: string; // DB id
  number: string; // human-readable order no.
  createdAt: string; // ISO
  dueAt?: string; // ISO (optional)
  seller: Seller;
  billTo: Address;
  shipTo?: Address;

  items: OrderItem[];

  subtotal: Money;
  shipping?: Money;
  tax?: Money;
  discount?: Money;
  total: Money;

  payment?: PaymentInfo;
  notes?: string;
};

export type ReceiptProps = {
  order: Order;
  logoBase64?: string; // overrides seller.logoBase64
};
