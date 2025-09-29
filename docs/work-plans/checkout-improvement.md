# 체크아웃 시스템 개선 계획

## 📊 현재 상태 분석
**완성도: 85%** (2025-09-29 기준)

### ✅ 구현 완료 (이미 작동 중)
1. **UI/UX (100%)**
   - 반응형 2컬럼 레이아웃 (폼 + 카트 요약)
   - 빈 카트 처리
   - 로딩/에러 상태 표시
   - 약관 동의 체크박스

2. **폼 관리 (95%)**
   - 배송지/청구지 주소 입력
   - "Same as shipping" 옵션
   - 로그인 시 자동 정보 불러오기
   - 이메일/전화번호 유효성 검증
   - TypeScript 타입 완전 정의

3. **주문 처리 (90%)**
   - 주문 번호 생성 (ORD-YYYYMMDD-XXXX)
   - Idempotency 로직 (중복 방지)
   - 서버 측 가격 검증
   - 세금 계산 (5% VAT)
   - 주문 확인 이메일 발송
   - Enrollment 자동 생성

4. **결제 UI (30%)**
   - Stripe/PayPal/Pay Later 선택 UI ✅
   - Pay Later (Cash on Delivery) 작동 ✅
   - Stripe 실제 연동 ❌
   - PayPal 실제 연동 ❌

### ❌ 미완성/취약점
1. **DB 레벨 중복 방지 미흡** - idempotency_key UNIQUE 제약 없음
2. **무료 코스 분기 없음** - 0원도 결제 플로우 거침
3. **트랜잭션 원자성 부족** - 주문/enrollment 부분 실패 가능
4. **컴포넌트 재사용성** - 주소/결제/요약 분리 안 됨

---

## 🔴 P0 - 즉시 개선사항 (안전성 강화)

### 1. DB 물리적 제약 강제
**파일**: `supabase/migrations/20250929_checkout_safety.sql`

```sql
-- 중복 주문 물리적 방지
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS orders_idem_uniq
  ON orders (idempotency_key);

-- 결제 중복 방지 (웹훅용)
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  gateway TEXT NOT NULL,
  gateway_payment_id TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS payments_gateway_uniq
  ON payments (gateway, gateway_payment_id);

-- 주문 상태 enum (명확한 전이)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
    CREATE TYPE order_status AS ENUM (
      'draft',
      'awaiting_payment',
      'cod_pending',
      'paid',
      'fulfilled',
      'cancelled',
      'failed'
    );
  END IF;
END$$;
```

### 2. 가격 계산 서버 진실원천
**파일**: `lib/checkout/priceCalculator.ts`

```typescript
export type CartLine = {
  id: string;
  qty: number;
  unit: number;
  title: string;
};

export type PriceTotals = {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  currency: 'USD';
};

export function calculateTotals(
  lines: CartLine[],
  ctx: { taxRate: number }
): PriceTotals {
  const subtotal = lines.reduce((sum, line) => sum + line.unit * line.qty, 0);
  const discount = 0; // 추후 쿠폰 시스템
  const taxBase = subtotal - discount;
  const tax = Math.round(taxBase * ctx.taxRate * 100) / 100;
  const total = taxBase + tax;

  return { subtotal, discount, tax, total, currency: 'USD' };
}

// Idempotency key 생성
export function generateIdempotencyKey(
  userId: string,
  cartHash: string,
  timestamp: number
): string {
  return `${userId}-${cartHash}-${timestamp}`;
}
```

### 3. RPC 함수 개선 (원자적 트랜잭션)
**수정**: `create_order_with_items` 함수

```sql
CREATE OR REPLACE FUNCTION create_order_with_items(
  p_user_id UUID,
  p_idem_key TEXT,
  p_lines JSONB,
  p_totals JSONB,
  p_gateway TEXT
) RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_order_id UUID;
BEGIN
  -- 1) 중복 체크 (멱등성)
  INSERT INTO orders (
    user_id,
    idempotency_key,
    status,
    amount,
    currency,
    order_data
  )
  VALUES (
    p_user_id,
    p_idem_key,
    'awaiting_payment'::order_status,
    (p_totals->>'total')::DECIMAL,
    (p_totals->>'currency')::TEXT,
    p_totals
  )
  ON CONFLICT (idempotency_key) DO NOTHING
  RETURNING id INTO v_order_id;

  IF v_order_id IS NULL THEN
    -- 이미 존재하는 주문 반환
    SELECT id INTO v_order_id
    FROM orders
    WHERE idempotency_key = p_idem_key;
    RETURN v_order_id;
  END IF;

  -- 2) 주문 아이템 삽입
  -- (생략)

  -- 3) 무료 코스 즉시 처리
  IF (p_totals->>'total')::DECIMAL = 0 THEN
    UPDATE orders
    SET status = 'paid'::order_status,
        updated_at = NOW()
    WHERE id = v_order_id;

    -- Enrollment 즉시 생성
    INSERT INTO enrollments (user_id, course_id)
    SELECT p_user_id, (item->>'course_id')::UUID
    FROM jsonb_array_elements(p_lines) AS item
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN v_order_id;
END$$;
```

### 4. 무료 코스 UI 분기
**파일**: `components/Checkout/Checkout.tsx`

```typescript
// 총액 계산
const { total } = calculateTotals(cart, { taxRate: 0.05 });
const isFreeOrder = total === 0;

// UI 분기
{isFreeOrder ? (
  <button
    className="rbt-btn btn-gradient"
    onClick={handleFreeEnrollment}
  >
    Enroll Now (Free)
  </button>
) : (
  // 기존 결제 UI
)}
```

### 5. 컴포넌트 분리
```
components/checkout/
├── AddressForm.tsx       # 주소 입력 (배송/청구 공용)
├── PaymentMethodSelector.tsx  # 결제 수단 선택
├── CartSummary.tsx       # 카트 요약 및 가격
└── index.ts
```

**AddressForm.tsx 예시**:
```typescript
interface AddressFormProps {
  mode: 'shipping' | 'billing';
  data: ShippingAddress;
  onChange: (field: string, value: string) => void;
  disabled?: boolean;
}

export function AddressForm({ mode, data, onChange, disabled }: AddressFormProps) {
  // Zod 스키마 검증
  // 재사용 가능한 주소 폼
}
```

---

## 🟡 P1 - 다음 단계 (결제 연동)

### 1. Stripe 연동
```typescript
// api/stripe/create-intent/route.ts
export async function POST(req: Request) {
  const { orderId, amount } = await req.json();

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100, // cents
    currency: 'usd',
    metadata: { orderId },
    automatic_payment_methods: { enabled: true }
  });

  return Response.json({ clientSecret: paymentIntent.client_secret });
}

// api/stripe/webhook/route.ts
// payment_intent.succeeded → orders.status = 'paid'
```

### 2. 주문 상태 머신
```typescript
const ORDER_TRANSITIONS = {
  draft: ['awaiting_payment', 'cancelled'],
  awaiting_payment: ['paid', 'cod_pending', 'failed', 'cancelled'],
  cod_pending: ['paid', 'cancelled'],
  paid: ['fulfilled', 'refunded'],
  fulfilled: ['refunded'],
  cancelled: [],
  failed: ['awaiting_payment']
};
```

### 3. E2E 테스트 시나리오
```typescript
// tests/e2e/checkout.spec.ts
test.describe('Checkout Flow', () => {
  test('무료 코스 - 결제 스킵', async ({ page }) => {
    // 0원 코스 카트 추가
    // 체크아웃 이동
    // "Enroll Now (Free)" 버튼 확인
    // 클릭 후 즉시 success
  });

  test('Pay Later 플로우', async ({ page }) => {
    // 유료 코스 추가
    // 체크아웃 폼 입력
    // Pay Later 선택
    // 주문 성공 확인
  });
});
```

---

## ✅ 체크리스트

### P0 (즉시)
- [ ] `orders.idempotency_key` UNIQUE 인덱스 생성
- [ ] `payments` 테이블 생성 (웹훅 중복 방지)
- [ ] `order_status` enum 타입 생성
- [ ] `priceCalculator.ts` 순수 함수 분리
- [ ] `create_order_with_items` RPC 트랜잭션 보강
- [ ] 무료 코스 UI 분기 구현
- [ ] AddressForm 컴포넌트 추출
- [ ] PaymentMethodSelector 컴포넌트 추출
- [ ] CartSummary 컴포넌트 추출

### P1 (다음)
- [ ] Stripe Payment Intent 생성 API
- [ ] Stripe 웹훅 처리
- [ ] PayPal 연동
- [ ] 주문 상태 전이 가드
- [ ] 구조화 로그
- [ ] E2E 테스트 작성

---

## 📝 참고사항

### 핵심 원칙
1. **DB가 마지막 방어선** - UNIQUE 제약으로 물리적 중복 차단
2. **서버가 가격 진실원천** - 클라이언트는 표시만
3. **트랜잭션 경계 명확화** - 전부 성공 or 전부 실패
4. **무료 코스 빠른 경로** - 결제 단계 완전 생략

### 예상 결과
- 중복 주문 0% (DB 레벨 방어)
- 부분 실패 0% (트랜잭션 원자성)
- 무료 코스 즉시 등록 (UX 개선)
- 테스트 가능한 구조 (순수 함수 분리)

### 작업 시간 예상
- P0 전체: 4시간
  - DB 마이그레이션: 30분
  - 가격 계산 분리: 30분
  - RPC 개선: 1시간
  - 무료 코스 분기: 30분
  - 컴포넌트 분리: 1시간 30분
- P1 전체: 8시간

---

*마지막 업데이트: 2025-09-29*
*작성자: Claude + 개발팀*