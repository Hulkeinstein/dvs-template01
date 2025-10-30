---
title: PayPal Checkout Integration
milestone: Phase 1: Core Platform
date_completed: 2025-02-13
status: stable
tags: [payments, paypal, checkout, enrollment]
---

# PayPal Checkout Integration

## 📊 개요

PayPal 결제 시스템 완성 (2025-02-13)

- **목적**: 유료 코스 구매 및 자동 enrollment 생성
- **범위**: PayPal 우선 구현, Stripe은 Phase 2로 연기
- **상태**: 프로덕션 준비 완료 (Sandbox 검증)

## 🏗️ 아키텍처

### 결제 플로우

```
사용자 → 장바구니 → 체크아웃 페이지
         ↓
    createOrder (Server Action)
         ↓
    PayPal Order 생성 (orderActions.ts)
         ↓
    사용자 → PayPal 승인 페이지
         ↓
    승인 완료 → capturePayPalOrderAction
         ↓
    activate_paid_order RPC (Supabase)
         ↓
    Enrollment 자동 생성 + 이메일 발송
```

### 데이터 모델

**orders 테이블**:
- `id`, `user_id`, `course_id`, `amount`, `status`
- `payment_method`: 'paypal' | 'stripe' | 'cod'
- `paypal_order_id`: PayPal 주문 ID (idempotency key)

**enrollments 테이블**:
- `user_id`, `course_id` (UNIQUE 제약)
- `status`: 'active' | 'inactive'

## 🔑 주요 결정 (ADR-lite)

### 1. PayPal 우선, Stripe Phase 2 연기
- **근거**: PayPal이 더 간단하고 빠른 통합 가능
- **대안**: Stripe 동시 구현 (복잡도 증가)
- **영향**: MVP 출시 속도 향상, Stripe은 나중에 추가

### 2. Idempotency 키로 paypal_order_id 사용
- **근거**: PayPal Order ID는 고유하며 재사용 불가
- **대안**: 자체 idempotency_key 생성 (불필요한 복잡도)
- **영향**: 중복 주문 방지 자동 보장

### 3. 서버 측 가격 검증 필수
- **근거**: 클라이언트 금액은 조작 가능
- **대안**: 클라이언트 금액 신뢰 (보안 취약점)
- **영향**: DB에서 실제 가격 조회하여 검증

### 4. RPC로 Enrollment 생성 (activate_paid_order)
- **근거**: SECURITY DEFINER로 RLS 우회 필요
- **대안**: Server Actions에서 직접 INSERT (RLS 충돌)
- **영향**: 트랜잭션 안전성 보장

## 🧩 구현 포인트

### createOrder (orderActions.ts)
```typescript
export async function createOrder(formData: CheckoutFormData) {
  // 1. 서버에서 실제 가격 조회 (보안)
  const courseData = await supabase
    .from('courses')
    .select('regular_price, discounted_price')
    .eq('id', courseId)
    .single();

  // 2. PayPal Order 생성
  if (formData.paymentMethod === 'paypal') {
    const request = new paypal.orders.OrdersCreateRequest();
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: actualPrice.toFixed(2)
        }
      }]
    });

    const response = await paypalClient.execute(request);
    const approveUrl = response.result.links.find(link => link.rel === 'approve')?.href;

    return { success: true, redirectUrl: approveUrl };
  }
}
```

### capturePayPalOrderAction (orderActions.ts)
```typescript
export async function capturePayPalOrderAction(paypalOrderId: string) {
  // 1. PayPal Order Capture
  const request = new paypal.orders.OrdersCaptureRequest(paypalOrderId);
  const capture = await paypalClient.execute(request);

  // 2. 주문 상태 업데이트
  await supabase
    .from('orders')
    .update({ status: 'paid', payment_status: 'succeeded' })
    .eq('paypal_order_id', paypalOrderId);

  // 3. RPC로 Enrollment 활성화
  const { data, error } = await supabase.rpc('activate_paid_order', {
    p_order_id: orderId
  });

  // 4. 이메일 발송 (선택)
  await sendOrderConfirmationEmail(user.email, orderDetails);

  return { success: true };
}
```

### activate_paid_order RPC (Supabase)
```sql
CREATE OR REPLACE FUNCTION activate_paid_order(p_order_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER  -- RLS 우회
AS $$
DECLARE
  v_item RECORD;
  v_user_id UUID;
BEGIN
  -- 주문 상태 업데이트
  UPDATE orders
  SET status = 'paid', payment_status = 'succeeded'
  WHERE id = p_order_id
  RETURNING user_id INTO v_user_id;

  -- Enrollment 생성 (중복 무시)
  FOR v_item IN
    SELECT course_id FROM order_items WHERE order_id = p_order_id
  LOOP
    INSERT INTO enrollments (user_id, course_id, status)
    VALUES (v_user_id, v_item.course_id, 'active')
    ON CONFLICT (user_id, course_id) DO NOTHING;
  END LOOP;

  RETURN TRUE;
END$$;
```

### PayPal Client 설정 (paypal.ts)
```typescript
import paypal from '@paypal/checkout-server-sdk';

const environment = process.env.NODE_ENV === 'production'
  ? new paypal.core.LiveEnvironment(
      process.env.PAYPAL_CLIENT_ID!,
      process.env.PAYPAL_CLIENT_SECRET!
    )
  : new paypal.core.SandboxEnvironment(
      process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
      process.env.PAYPAL_CLIENT_SECRET!
    );

export const paypalClient = new paypal.core.PayPalHttpClient(environment);
```

## 🧪 테스트 & 검증

### 수용 기준 (DoD)
- ✅ PayPal Sandbox 결제 성공
- ✅ Enrollment 자동 생성 확인
- ✅ 중복 주문 방지 (idempotency)
- ✅ 서버 가격 검증 작동
- ✅ 결제 실패 시 롤백

### 테스트 시나리오
1. **정상 결제**: Sandbox 테스트 카드로 결제 → Enrollment 생성
2. **중복 방지**: 동일 PayPal Order ID로 재시도 → 무시
3. **가격 조작**: 클라이언트에서 금액 변경 → 서버 검증으로 차단
4. **결제 취소**: PayPal 승인 페이지에서 취소 → 주문 상태 'cancelled'

### 검증 완료 항목
- PayPal Sandbox 환경 정상 작동
- activate_paid_order RPC 트랜잭션 안전성
- RLS 정책과 충돌 없음
- 이메일 발송 정상 작동

## 📦 관련 파일

### 서버 액션
- `app/lib/actions/orderActions.ts` (414-878줄)
  - `createOrder()`: PayPal 주문 생성
  - `capturePayPalOrderAction()`: 결제 캡처 및 enrollment 활성화

### PayPal 설정
- `app/lib/paypal.ts`: PayPal SDK 클라이언트 초기화

### UI 컴포넌트
- `components/Checkout/Checkout.tsx`: 체크아웃 페이지
- `components/Checkout/CheckoutForm.tsx`: 결제 폼
- `components/Checkout/PaymentMethodSelector.tsx`: 결제 수단 선택

### 데이터베이스
- `supabase/migrations/20251025_fix_activate_paid_order_payload.sql`: RPC 정의

### 타입 정의
- `types/paypal.d.ts`: PayPal SDK 타입

## 🔗 참고

### 관련 작업
- Stripe 통합은 **Phase 2**로 연기됨
- 무료 코스는 별도 플로우 (즉시 enrollment 생성)

### 환경변수
```env
# Sandbox (개발)
NEXT_PUBLIC_PAYPAL_CLIENT_ID=sandbox_client_id
PAYPAL_CLIENT_SECRET=sandbox_secret

# Live (프로덕션)
PAYPAL_CLIENT_ID=live_client_id
PAYPAL_CLIENT_SECRET=live_secret
```

### 보안 고려사항
- PayPal Client Secret은 서버에서만 사용 (절대 클라이언트 노출 금지)
- HTTPS 필수 (프로덕션)
- CORS 설정으로 허용된 도메인만 접근

### 다음 단계 (Phase 2)
- [ ] Stripe 결제 통합
- [ ] 환불 시스템
- [ ] 주문 취소 기능
- [ ] 할인 코드 시스템

---

**마지막 업데이트**: 2025-10-30
**작성자**: Development Team
**버전**: 1.0.0
