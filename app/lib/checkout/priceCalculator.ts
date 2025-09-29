/**
 * 가격 계산 유틸리티
 * 서버 사이드에서만 사용 - 가격의 진실 원천 (Single Source of Truth)
 */

export interface CartLine {
  id: string;
  qty: number;
  unit: number;
  title: string;
  course_id?: string;
}

export interface PriceTotals {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  currency: 'USD';
}

export interface PriceContext {
  taxRate: number;
  discountCode?: string;
  discountAmount?: number;
}

/**
 * 카트 총액 계산
 * @param lines 카트 아이템 목록
 * @param ctx 가격 계산 컨텍스트 (세율, 할인 등)
 * @returns 계산된 가격 총액
 */
export function calculateTotals(
  lines: CartLine[],
  ctx: PriceContext
): PriceTotals {
  // 1. 소계 계산
  const subtotal = lines.reduce((sum, line) => {
    const lineTotal = line.unit * line.qty;
    return sum + lineTotal;
  }, 0);

  // 2. 할인 계산 (추후 쿠폰 시스템 구현)
  const discount = ctx.discountAmount || 0;

  // 3. 세금 계산 (할인 후 금액 기준)
  const taxBase = Math.max(0, subtotal - discount);
  const tax = Math.round(taxBase * ctx.taxRate * 100) / 100;

  // 4. 최종 금액
  const total = Math.max(0, taxBase + tax);

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discount: Math.round(discount * 100) / 100,
    tax,
    total: Math.round(total * 100) / 100,
    currency: 'USD'
  };
}

/**
 * Idempotency Key 생성
 * 중복 주문 방지를 위한 고유 키
 */
export function generateIdempotencyKey(
  userId: string,
  cartHash: string,
  timestamp: number = Date.now()
): string {
  // 사용자 ID + 카트 해시 + 타임스탬프 조합
  return `${userId}-${cartHash}-${timestamp}`;
}

/**
 * 카트 해시 생성
 * 카트 내용의 고유 식별자
 */
export function generateCartHash(lines: CartLine[]): string {
  // 카트 아이템을 정렬하여 순서 무관하게 만듦
  const sorted = [...lines].sort((a, b) => a.id.localeCompare(b.id));
  const cartString = sorted
    .map(line => `${line.id}:${line.qty}:${line.unit}`)
    .join('|');

  // 간단한 해시 (실제로는 crypto 사용 권장)
  let hash = 0;
  for (let i = 0; i < cartString.length; i++) {
    const char = cartString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * 무료 주문 여부 확인
 */
export function isFreeOrder(totals: PriceTotals): boolean {
  return totals.total === 0;
}

/**
 * 가격 검증
 * 클라이언트에서 보낸 가격과 서버 계산 가격 비교
 */
export function validatePrices(
  clientTotal: number,
  serverTotal: number,
  tolerance: number = 0.01
): boolean {
  // 부동소수점 오차를 고려한 비교
  return Math.abs(clientTotal - serverTotal) <= tolerance;
}

/**
 * 통화 포맷팅
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * 센트 단위 변환 (Stripe 등 결제 게이트웨이용)
 */
export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

export function fromCents(cents: number): number {
  return cents / 100;
}

/**
 * 세율 조회 (추후 지역별 세율 적용)
 */
export function getTaxRate(
  country: string = 'US',
  _state?: string
): number {
  // 현재는 고정 5% VAT
  // 추후 지역별 세율 테이블 구현
  const TAX_RATES: Record<string, number> = {
    'US': 0.05,
    'CA': 0.13, // Canada
    'UK': 0.20, // UK VAT
    'EU': 0.21, // EU average VAT
  };

  return TAX_RATES[country] || 0.05;
}

/**
 * 주문 번호 생성
 * Format: ORD-20250929-XXXX
 */
export function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');

  return `ORD-${year}${month}${day}-${random}`;
}

/**
 * 결제 수단별 수수료 계산 (선택사항)
 */
export function calculatePaymentFee(
  amount: number,
  paymentMethod: string
): number {
  const PAYMENT_FEES: Record<string, { fixed: number; percentage: number }> = {
    'stripe': { fixed: 0.30, percentage: 0.029 },     // 2.9% + $0.30
    'paypal': { fixed: 0.49, percentage: 0.0349 },    // 3.49% + $0.49
    'cash_on_delivery': { fixed: 0, percentage: 0 },  // No fee
  };

  const fee = PAYMENT_FEES[paymentMethod];
  if (!fee) return 0;

  return Math.round((amount * fee.percentage + fee.fixed) * 100) / 100;
}

/**
 * 배송비 계산 (추후 구현)
 */
export function calculateShipping(
  _items: CartLine[],
  _destination?: { country: string; state?: string; city?: string }
): number {
  // 현재는 무료 배송
  // 추후 무게, 거리 기반 계산 구현
  return 0;
}

/**
 * 할인 코드 검증 (추후 구현)
 */
export async function validateDiscountCode(
  code: string,
  cartTotal: number
): Promise<{ valid: boolean; discount: number; message?: string }> {
  // TODO: 데이터베이스에서 할인 코드 조회
  // 임시 구현
  const MOCK_CODES: Record<string, { discount: number; minPurchase: number }> = {
    'WELCOME10': { discount: 10, minPurchase: 50 },
    'SAVE20': { discount: 20, minPurchase: 100 },
  };

  const discountData = MOCK_CODES[code.toUpperCase()];

  if (!discountData) {
    return { valid: false, discount: 0, message: 'Invalid discount code' };
  }

  if (cartTotal < discountData.minPurchase) {
    return {
      valid: false,
      discount: 0,
      message: `Minimum purchase of $${discountData.minPurchase} required`
    };
  }

  return { valid: true, discount: discountData.discount };
}