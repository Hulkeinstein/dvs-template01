---
title: "PayPal Integration Guide"
tags:
  - type/docs
  - external/paypal
created: 2025-11-01
updated: 2025-11-05
lifecycle: active
---

# PayPal Integration Guide

## Purpose & Scope

PayPal은 DVS 플랫폼의 결제 처리를 담당합니다.
현재 커버 범위:
- **Order Creation**: 코스 구매 결제 주문 생성
- **Order Capture**: 결제 승인 및 등록 처리
- **Idempotency**: 중복 결제 방지
- **Refunds**: 환불 처리 (향후 구현 예정)

---

## Versions & Ownership

| 항목 | 값 |
|------|-----|
| **PayPal API** | v2 (Orders API) |
| **@paypal/checkout-server-sdk** | v1.0.3 |
| **@paypal/react-paypal-js** | v8.9.1 |
| **Owners** | @dev-team |
| **Last Updated** | 2025-10-01 |

---

## Setup / Config

### 1. PayPal Developer Dashboard 설정

1. **PayPal 계정 생성** → [developer.paypal.com](https://developer.paypal.com)
2. **REST API 앱 생성**:
   - Dashboard → My Apps & Credentials → Create App
   - App Name: "DVS Education Platform"
   - App Type: "Merchant"
3. **API 키 발급**:
   - **Sandbox**: 테스트용 Client ID & Secret
   - **Live**: 프로덕션용 Client ID & Secret (검증 후 사용 가능)

### 2. 환경변수 설정

```env
# .env.local
NEXT_PUBLIC_PAYPAL_CLIENT_ID=xxxxx-sandbox  # 클라이언트에서 사용
PAYPAL_CLIENT_SECRET=xxxxx-sandbox          # 서버 전용
PAYPAL_MODE=sandbox                         # sandbox | live
ENABLE_PAYPAL=true                          # 기능 플래그
```

⚠️ **보안 주의**:
- `PAYPAL_CLIENT_SECRET`은 서버 코드에서만 사용
- `NEXT_PUBLIC_PAYPAL_CLIENT_ID`는 클라이언트 노출 가능
- 테스트 키(`sandbox`)와 프로덕션 키(`live`) 분리

### 3. 데이터베이스 (기존 재사용)

**PayPal은 Stripe 통합 시 생성된 테이블을 재사용합니다:**

- `order_events` - `stripe_event_id`에 PayPal Order ID 저장
- `orders` - 주문 정보
- `enrollments` - 등록 정보
- `activate_paid_order(UUID)` RPC 함수

---

## Usage

### 1. Order 생성 (코스 구매)

**엔드포인트**: `/api/payment/paypal/create-order`

**Flow**:
1. 클라이언트에서 `courseId` 전송
2. 서버에서 가격 검증 (DB에서 조회)
3. DB에 `orders` 레코드 생성 (`payment_method='paypal'`, `payment_status='pending'`)
4. PayPal Order 생성 (`reference_id = order.id`)
5. PayPal Order ID 반환

**구현 예시**:
```typescript
// app/api/payment/paypal/create-order/route.ts
import { paypalClient, isPayPalEnabled } from '@/app/lib/paypal';
import paypal from '@paypal/checkout-server-sdk';

export async function POST(req: NextRequest) {
  // 1. PayPal 활성화 확인
  if (!isPayPalEnabled()) {
    return NextResponse.json({ error: 'PayPal not enabled' }, { status: 503 });
  }

  // 2. 인증 확인
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 3. 코스 정보 조회 (가격 검증 - 서버 신뢰 근원)
  const { courseId } = await req.json();
  const course = await getCourseById(courseId);
  const amount = course.discounted_price || course.regular_price;

  // 4. DB Order 생성
  const order = await createOrder({
    user_id: session.user.id,
    course_id: courseId,
    amount,
    payment_method: 'paypal',
    payment_status: 'pending',
  });

  // 5. PayPal Order 생성
  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer('return=representation');
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [{
      reference_id: order.id, // DB order ID로 멱등 연결
      description: course.title,
      amount: {
        currency_code: 'USD',
        value: amount.toFixed(2),
      },
    }],
    application_context: {
      brand_name: 'DVS Education',
      return_url: `${process.env.NEXTAUTH_URL}/checkout/success`,
      cancel_url: `${process.env.NEXTAUTH_URL}/courses/${courseId}`,
    },
  });

  const response = await paypalClient.execute(request);

  return NextResponse.json({
    paypalOrderId: response.result.id,
    orderId: order.id,
  });
}
```

### 2. Order Capture (결제 승인)

**엔드포인트**: `/api/payment/paypal/capture`

**Flow**:
1. 클라이언트에서 `paypalOrderId`, `orderId` 전송
2. 멱등성 체크 (`order_events`에 이미 존재하는지 확인)
3. PayPal Order Capture 실행
4. `activate_paid_order(orderId)` RPC 호출 → Enrollment 생성
5. `order_events`에 이벤트 기록
6. `orders.transaction_id` 업데이트

**구현 예시**:
```typescript
// app/api/payment/paypal/capture/route.ts
export async function POST(req: NextRequest) {
  const { paypalOrderId, orderId } = await req.json();

  // 1. 멱등성 체크
  const existingEvent = await supabase
    .from('order_events')
    .select('id')
    .eq('stripe_event_id', paypalOrderId)
    .single();

  if (existingEvent.data) {
    return NextResponse.json({ success: true, message: 'Already processed' });
  }

  // 2. PayPal Capture
  const request = new paypal.orders.OrdersCaptureRequest(paypalOrderId);
  request.requestBody({});
  const capture = await paypalClient.execute(request);

  if (capture.result.status !== 'COMPLETED') {
    return NextResponse.json({ error: 'Capture failed' }, { status: 400 });
  }

  // 3. activate_paid_order RPC 호출
  await supabase.rpc('activate_paid_order', { p_order_id: orderId });

  // 4. 이벤트 기록
  await supabase.from('order_events').insert({
    stripe_event_id: paypalOrderId, // 재사용
    order_id: orderId,
    event_type: 'paypal.payment.capture',
    payload: capture.result,
  });

  // 5. transaction_id 업데이트
  const transactionId = capture.result.purchase_units[0]?.payments?.captures?.[0]?.id;
  await supabase.from('orders').update({
    transaction_id: transactionId,
    payment_status: 'completed',
  }).eq('id', orderId);

  return NextResponse.json({ success: true, orderId, transactionId });
}
```

### 3. 클라이언트 통합 (React)

**PayPal 버튼 컴포넌트**:
```typescript
// components/Checkout/PayPalButton.tsx
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

export default function PayPalButton({ courseId, amount }: Props) {
  const createOrder = async (): Promise<string> => {
    const response = await fetch('/api/payment/paypal/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId }),
    });
    const data = await response.json();
    return data.paypalOrderId;
  };

  const onApprove = async (data: { orderID: string }) => {
    const response = await fetch('/api/payment/paypal/capture', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paypalOrderId: data.orderID,
        orderId: data.orderID, // 실제로는 create-order에서 받은 orderId 사용
      }),
    });
    const result = await response.json();
    router.push(`/checkout/success?orderId=${result.orderId}`);
  };

  return (
    <PayPalScriptProvider
      options={{
        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
        currency: 'USD',
        intent: 'capture',
      }}
    >
      <PayPalButtons
        createOrder={createOrder}
        onApprove={onApprove}
        onCancel={() => console.log('Cancelled')}
        onError={(err) => console.error('PayPal error:', err)}
        style={{
          layout: 'vertical',
          color: 'gold',
          shape: 'rect',
          label: 'paypal',
        }}
      />
    </PayPalScriptProvider>
  );
}
```

### 4. 테스트 계정 (Sandbox)

**PayPal Sandbox 테스트 계정**:
1. Dashboard → Sandbox → Accounts
2. "Create Account" → Personal (Buyer) 또는 Business (Seller)
3. 생성된 계정으로 로그인하여 테스트

**테스트 카드 정보**:
- Sandbox 계정은 가상 자금($1000)으로 시작
- 실제 카드 정보 필요 없음
- 모든 결제는 테스트 모드로만 처리

더 많은 정보: [PayPal Sandbox Testing](https://developer.paypal.com/docs/api-basics/sandbox/)

---

## Security & Compliance

### 🔒 보안 원칙

1. **API 키 보호**
   - Client Secret은 서버 측에서만 사용 (`PAYPAL_CLIENT_SECRET`)
   - Client ID는 클라이언트 노출 가능 (`NEXT_PUBLIC_PAYPAL_CLIENT_ID`)
   - 환경변수로 관리, 절대 하드코딩 금지

2. **금액 검증**
   - 클라이언트에서 전달받은 금액 무시
   - 서버에서 DB의 `course.regular_price` 또는 `course.discounted_price` 사용
   - 결제 금액과 주문 금액 일치 확인

3. **멱등성 보장**
   - `order_events.stripe_event_id` UNIQUE 제약 (PayPal Order ID 저장)
   - Capture 처리 전 이벤트 ID 중복 체크
   - 재시도/중복 이벤트 안전 처리

4. **주문 소유권 확인**
   ```typescript
   const order = await getOrderById(orderId);
   if (order.user_id !== session.user.id) {
     return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
   }
   ```

5. **HTTPS 필수**
   - 프로덕션에서는 반드시 HTTPS 사용
   - PayPal Return URL도 HTTPS 필수

### 키 회전 정책

- **분기별**: Sandbox/Live 키 재생성 권장
- **유출 의심 시**: 즉시 키 폐기 및 재생성
- **App 재생성 시**: Client ID & Secret 자동 갱신

### PCI DSS 준수

- PayPal이 카드 정보 처리 담당 (PCI DSS Level 1)
- 서버에서 카드 정보 직접 처리 금지
- `paypal.orders.OrdersCreateRequest()`로 안전하게 처리

---

## Runbooks

### 문제: Order Capture 실패

**증상**:
```
결제는 PayPal에서 승인되었지만 "내 강의"에 표시되지 않음
```

**해결**:
1. **Logs 확인**:
   ```sql
   SELECT * FROM order_events
   WHERE stripe_event_id = 'PAYPAL-ORDER-ID';
   ```

2. **수동 재처리**:
   ```typescript
   // Admin 도구 또는 직접 API 호출
   await fetch('/api/payment/paypal/capture', {
     method: 'POST',
     body: JSON.stringify({
       paypalOrderId: 'PAYPAL-ORDER-ID',
       orderId: 'ORDER-UUID',
     }),
   });
   ```

3. **DB 직접 수정 (최후 수단)**:
   ```sql
   -- RPC 함수 직접 호출
   SELECT activate_paid_order('ORDER-UUID');
   ```

### 문제: 중복 등록 발생

**증상**:
```
동일 사용자가 동일 코스에 2번 등록됨
```

**원인**: 멱등성 체크 누락 또는 실패

**해결**:
1. **이벤트 로그 확인**:
   ```sql
   SELECT * FROM order_events
   WHERE order_id = 'ORDER-UUID';
   ```

2. **중복 Enrollment 정리**:
   ```sql
   -- 중복 찾기
   SELECT user_id, course_id, COUNT(*)
   FROM enrollments
   GROUP BY user_id, course_id
   HAVING COUNT(*) > 1;

   -- 최신 것만 남기고 삭제
   DELETE FROM enrollments
   WHERE id NOT IN (
     SELECT MAX(id) FROM enrollments
     GROUP BY user_id, course_id
   );
   ```

3. **UNIQUE 제약 확인**:
   ```sql
   -- 이미 존재하는지 확인
   SELECT constraint_name
   FROM information_schema.table_constraints
   WHERE table_name = 'enrollments'
     AND constraint_type = 'UNIQUE';
   ```

### 문제: Sandbox와 Live 환경 혼동

**증상**:
```
Sandbox 키로 결제했는데 실제 등록됨
```

**원인**: 환경변수 혼용

**해결**:
1. **환경 분리**:
   ```env
   # .env.local (개발)
   PAYPAL_MODE=sandbox
   NEXT_PUBLIC_PAYPAL_CLIENT_ID=sandbox-client-id

   # .env.production (프로덕션)
   PAYPAL_MODE=live
   NEXT_PUBLIC_PAYPAL_CLIENT_ID=live-client-id
   ```

2. **환경 확인 로그**:
   ```typescript
   console.log('PayPal mode:', process.env.PAYPAL_MODE);
   ```

---

## References

### 외부 문서
- [PayPal Orders API v2](https://developer.paypal.com/docs/api/orders/v2/)
- [PayPal Checkout Guide](https://developer.paypal.com/docs/checkout/)
- [PayPal React SDK](https://paypal.github.io/react-paypal-js/)
- [Testing Guide](https://developer.paypal.com/docs/api-basics/sandbox/)

### 내부 문서
- 체크아웃 기능: [../library/checkout.md](../library/checkout.md)
- Stripe 통합: [./stripe.md](./stripe.md)

---

## 구현 파일

### 서버 사이드
- `app/lib/paypal.ts` - PayPal SDK 초기화
- `app/api/payment/paypal/create-order/route.ts` - Order 생성 API
- `app/api/payment/paypal/capture/route.ts` - Capture API

### 클라이언트 사이드
- `components/Checkout/PayPalButton.tsx` - PayPal 버튼 컴포넌트
- `components/Checkout/Checkout.tsx` - 결제 방식 선택 UI
- `app/(pages)/checkout/success/page.tsx` - 결제 성공 페이지

### 타입 정의
- `types/paypal.d.ts` - PayPal SDK 타입 선언

---

## CHANGELOG

### 2025-10-01
- ✅ 초기 구현 완료
- ✅ Order Creation & Capture API 구현
- ✅ 멱등성 처리 (order_events 재사용)
- ✅ React 버튼 컴포넌트 통합
- ✅ Success 페이지 생성
- ✅ 타입 선언 파일 추가
- ✅ 문서 작성 완료

---

**마지막 업데이트**: 2025-10-01
**Status**: 🟢 Active (Sandbox 테스트 완료, Production 준비 완료)
