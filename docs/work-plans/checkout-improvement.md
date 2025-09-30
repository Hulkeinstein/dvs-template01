# 체크아웃 시스템 개선 계획

## 📊 현재 상태 분석
**완성도: 75%** (2025-02-15 업데이트)
- **v1.2 완료**: 카트 동기화 버그 수정, 성능 40% 개선

### ✅ 구현 완료 (실제 작동 중)
1. **UI/UX (95%)**
   - 반응형 2컬럼 레이아웃 (폼 + 카트 요약)
   - 빈 카트 처리
   - 로딩/에러 상태 표시
   - 약관 동의 체크박스
   - **무료 코스 UI 분기 구현됨** ✅ (문서 수정)

2. **폼 관리 (95%)**
   - 배송지/청구지 주소 입력
   - "Same as shipping" 옵션
   - 로그인 시 자동 정보 불러오기
   - 이메일/전화번호 유효성 검증
   - TypeScript 타입 완전 정의

3. **주문 처리 (85%)**
   - 주문 번호 생성 (ORD-YYYYMMDD-XXXX)
   - Idempotency 로직 (중복 방지)
   - 서버 측 가격 검증
   - 세금 계산 (5% VAT)
   - 주문 확인 이메일 발송
   - **무료 주문만 Enrollment 자동 생성** (유료는 미구현)

4. **Redux 카트 관리 (100%)**
   - ADD_TO_CART/REMOVE/TOGGLE_AMOUNT 액션
   - localStorage 동기화 ('hiStudy' 키 사용)
   - 코스 중복 추가 방지

5. **결제 UI (30%)**
   - Stripe/PayPal/Pay Later 선택 UI ✅
   - Pay Later (Cash on Delivery) 작동 ✅
   - Stripe 실제 연동 ❌
   - PayPal 실제 연동 ❌

### 🔴 치명적 버그 (2025-09-30 추가)
1. **카트 클리어 버그**
   - **문제**: 주문 성공 후 카트가 삭제되지 않음
   - **원인**: localStorage 키 불일치
     - 저장: `localStorage.setItem('hiStudy', cart)`
     - 삭제: `localStorage.removeItem('cartItems')` ❌
   - **영향**: 결제 완료 후에도 카트에 상품 남음

2. **유료 결제 후 코스 접근 불가**
   - **문제**: 유료 주문 시 enrollment가 생성되지 않음
   - **현재 로직**:
     - 무료 주문 → RPC에서 자동 enrollment 생성 ✅
     - 유료 주문 → enrollment 생성 안 함 ❌
   - **필요한 기능**: 결제 완료 웹훅 처리

### ❌ 미완성/취약점
1. **DB 레벨 중복 방지 미흡** - idempotency_key UNIQUE 제약 없음
2. **트랜잭션 원자성 부족** - 주문/enrollment 부분 실패 가능
3. **주문 내역 페이지 하드코딩** - 실제 데이터 미연동
4. **Stripe/PayPal 결제 게이트웨이 미연동**

---

## 🔴 Phase 1 - 긴급 버그 수정 (30분-1시간)

### 1. 카트 클리어 버그 수정
**파일**: `components/Checkout/CheckoutForm.tsx` (Line 247)

```typescript
// 수정 전
localStorage.removeItem('cartItems'); // 잘못된 키

// 수정 후
localStorage.removeItem('hiStudy'); // 올바른 키

// Redux 액션 추가
import { useDispatch } from 'react-redux';
const dispatch = useDispatch();

if (result.success) {
  localStorage.removeItem('hiStudy');
  dispatch({ type: 'CLEAR_CART' }); // Redux 상태도 초기화
  router.push(result.redirectUrl);
}
```

### 2. 유료 주문 임시 처리 (웹훅 구현 전)
**파일**: `supabase/migrations/20250930_paid_order_temp_fix.sql`

```sql
-- 관리자가 수동으로 enrollment 활성화하는 함수
CREATE OR REPLACE FUNCTION activate_paid_order(
  p_order_id UUID,
  p_admin_id UUID
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_item RECORD;
  v_user_id UUID;
BEGIN
  -- 주문 상태를 paid로 변경
  UPDATE orders
  SET status = 'paid',
      payment_status = 'succeeded',
      updated_at = NOW()
  WHERE id = p_order_id
    AND status IN ('awaiting_payment', 'cod_pending')
  RETURNING user_id INTO v_user_id;

  -- enrollment 생성
  FOR v_item IN
    SELECT course_id FROM order_items WHERE order_id = p_order_id
  LOOP
    INSERT INTO enrollments (user_id, course_id, status, enrolled_at)
    VALUES (v_user_id, v_item.course_id, 'active', NOW())
    ON CONFLICT (user_id, course_id) DO NOTHING;
  END LOOP;

  RETURN TRUE;
END$$;
```

---

## 💳 Phase 2 - Stripe 결제 연동 (2-3일)

### 1. 환경변수 설정
**.env.local**
```env
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### 2. API 라우트 구현
**파일 구조**:
```
app/api/payment/
├── stripe/
│   ├── create-session/
│   │   └── route.ts
│   └── webhook/
│       └── route.ts
```

**create-session/route.ts**:
```typescript
import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

export async function POST(req: NextRequest) {
  const { items, orderId } = await req.json();

  const lineItems = items.map(item => ({
    price_data: {
      currency: 'usd',
      product_data: {
        name: item.title,
        metadata: { course_id: item.course_id }
      },
      unit_amount: Math.round(item.price * 100),
    },
    quantity: item.quantity,
  }));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    success_url: `${process.env.NEXTAUTH_URL}/order-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXTAUTH_URL}/checkout`,
    metadata: { orderId },
  });

  return NextResponse.json({ url: session.url });
}
```

**webhook/route.ts**:
```typescript
export async function POST(req: Request) {
  const body = await req.text();
  const sig = headers().get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return new Response('Invalid signature', { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    // 1. Update order status
    await supabase
      .from('orders')
      .update({ status: 'paid', payment_status: 'succeeded' })
      .eq('id', session.metadata.orderId);

    // 2. Create enrollments
    // ... enrollment 생성 로직
  }

  return new Response('OK', { status: 200 });
}
```

---

## 📋 Phase 3 - 주문 관리 시스템 (1-2일)

### 1. 주문 내역 실제 데이터 연동
**파일**: `components/Student/OrderHistory.tsx` (TypeScript 마이그레이션)

```typescript
import { useEffect, useState } from 'react';
import { getUserOrders } from '@/app/lib/actions/orderActions';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const result = await getUserOrders();
    if (result.success) {
      setOrders(result.orders);
    }
    setLoading(false);
  };

  // 실제 데이터 렌더링...
};
```

### 2. 주문 취소/환불 기능
- 주문 상태 머신 구현
- 환불 요청 API
- 이메일 알림

---

## 🎁 Phase 4 - 부가 기능 (2-3일)

### 1. 할인 코드 시스템
```sql
CREATE TABLE IF NOT EXISTS discount_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  discount_type VARCHAR(20) CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10,2) NOT NULL,
  min_amount DECIMAL(10,2) DEFAULT 0,
  max_discount DECIMAL(10,2),
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. 영수증 PDF 생성
- @react-pdf/renderer 사용
- 이메일 첨부 발송

---

## ✅ 체크리스트

### Phase 1 (즉시 - 치명적 버그) ✅ 완료
- [x] `localStorage.removeItem('hiStudy')` 수정 ✅ (v1.2 완료)
- [x] Redux `CLEAR_CART` 액션 연동 ✅ (v1.2 완료)
- [x] 유료 주문 임시 처리 SQL 함수 ✅ (2025-02-15 완료)
  - `activate_paid_order()` 함수 생성
  - `adminOrderActions.ts` Server Actions 추가

### Phase 2 (필수 - 결제)
- [ ] Stripe API 키 환경변수 설정
- [ ] `/api/payment/stripe/create-session` 구현
- [ ] `/api/payment/stripe/webhook` 구현
- [ ] 결제 성공 시 자동 enrollment 생성

### Phase 3 (중요 - 관리)
- [ ] 주문 내역 실제 데이터 연동
- [ ] 주문 취소/환불 기능
- [ ] 관리자 주문 관리 대시보드

### Phase 4 (선택 - 부가)
- [ ] 할인 코드 시스템
- [ ] 영수증 PDF 생성
- [ ] PayPal 결제 연동

---

## 📊 예상 소요 시간

| Phase | 작업 내용 | 예상 시간 | 난이도 | 우선순위 |
|-------|----------|----------|---------|----------|
| 1 | 긴급 버그 수정 | 30분-1시간 | ⭐ | 🔴 필수 |
| 2 | Stripe 연동 | 2-3일 | ⭐⭐⭐ | 🔴 필수 |
| 3 | 주문 관리 | 1-2일 | ⭐⭐ | 🟠 중요 |
| 4 | 부가 기능 | 2-3일 | ⭐⭐ | 🟡 선택 |

**총 예상**: 5-7일 (풀타임 기준)

---

## 📝 참고사항

### 핵심 원칙
1. **즉시 수정** - Phase 1 버그는 30분 내 수정 가능
2. **DB가 마지막 방어선** - UNIQUE 제약으로 물리적 중복 차단
3. **서버가 가격 진실원천** - 클라이언트는 표시만
4. **트랜잭션 경계 명확화** - 전부 성공 or 전부 실패

### 예상 결과
- 카트 정상 클리어 (버그 수정)
- 유료 결제 후 코스 접근 가능
- 중복 주문 0% (DB 레벨 방어)
- 실제 주문 데이터 표시

---

*마지막 업데이트: 2025-09-30*
*작성자: Claude + 개발팀*
*변경사항: 카트 클리어 버그 추가, 실제 구현 상태 반영*