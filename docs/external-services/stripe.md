---
title: "Stripe Integration Guide"
tags:
  - type/docs
  - external/stripe
created: 2025-11-01
updated: 2025-11-05
lifecycle: active
---

# Stripe Integration Guide

## Purpose & Scope

Stripe는 DVS 플랫폼의 결제 처리를 담당합니다.
현재 커버 범위:
- **Checkout Session**: 코스 구매 결제 페이지 생성
- **Webhook**: 결제 완료 이벤트 수신 및 등록 처리
- **Refunds**: 환불 처리 (향후 구현 예정)

---

## Versions & Ownership

| 항목 | 값 |
|------|-----|
| **Stripe API** | v2023-10-16 |
| **@stripe/stripe-js** | Latest (package.json 참조) |
| **stripe (Node.js SDK)** | Latest |
| **Owners** | @dev-team |
| **Last Updated** | 2025-10-01 |

---

## Setup / Config

### 1. Stripe Dashboard 설정

1. **Stripe 계정 생성** → [stripe.com](https://stripe.com)
2. **API 키 발급**:
   - Dashboard → Developers → API keys
   - **Publishable key**: 클라이언트에서 사용 (공개 가능)
   - **Secret key**: 서버 전용 (절대 노출 금지)
3. **Webhook 엔드포인트 설정**:
   - Dashboard → Developers → Webhooks → Add endpoint
   - URL: `https://yourdomain.com/api/payment/stripe/webhook`
   - Events: `checkout.session.completed`, `payment_intent.succeeded`

### 2. 환경변수 설정

```env
# .env.local
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx  # 클라이언트
STRIPE_SECRET_KEY=sk_test_xxxxx                  # 서버 전용
STRIPE_WEBHOOK_SECRET=whsec_xxxxx                # 웹훅 서명 검증
```

⚠️ **보안 주의**:
- `STRIPE_SECRET_KEY`는 서버 코드에서만 사용
- `STRIPE_WEBHOOK_SECRET`은 웹훅 핸들러에서 서명 검증에 필수
- 테스트 키(`sk_test_`, `pk_test_`)와 프로덕션 키(`sk_live_`, `pk_live_`) 분리

### 3. 데이터베이스 마이그레이션

멱등성 보장을 위한 `order_events` 테이블 생성:

```sql
CREATE TABLE IF NOT EXISTS order_events (
  id BIGSERIAL PRIMARY KEY,
  stripe_event_id TEXT UNIQUE NOT NULL,  -- 중복 처리 방지
  order_id UUID NOT NULL REFERENCES orders(id),
  event_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_order_events_stripe_event_id ON order_events(stripe_event_id);
CREATE INDEX idx_order_events_order_id ON order_events(order_id);
```

---

## Usage

### 1. Checkout Session 생성 (코스 구매)

**엔드포인트**: `/api/payment/stripe/create-session`

```typescript
// Server Action 예시
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function createCheckoutSession(courseId: string, userId: string) {
  // 1. 코스 정보 조회 (가격 검증)
  const course = await getCourseById(courseId);
  if (!course) throw new Error('Course not found');

  // 2. Order 생성
  const order = await createOrder({
    user_id: userId,
    course_id: courseId,
    amount: course.discounted_price || course.regular_price,
    status: 'pending',
  });

  // 3. Stripe Checkout Session 생성
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: course.title,
          images: [course.thumbnail_url],
        },
        unit_amount: Math.round(order.amount * 100), // cents
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: `${process.env.NEXTAUTH_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXTAUTH_URL}/courses/${courseId}`,
    metadata: {
      orderId: order.id,
      userId: userId,
      courseId: courseId,
    },
  });

  return { sessionId: session.id, url: session.url };
}
```

### 2. Webhook 처리 (결제 완료 시)

**엔드포인트**: `/api/payment/stripe/webhook`

```typescript
import { NextRequest } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature')!;

  // 1. 서명 검증 (필수!)
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // 2. 이벤트 처리
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const { orderId, userId, courseId } = session.metadata;

    // 3. 멱등성 체크
    const existingEvent = await checkOrderEvent(event.id);
    if (existingEvent) {
      return new Response('Event already processed', { status: 200 });
    }

    // 4. 결제 완료 처리
    await processPayment({
      orderId,
      userId,
      courseId,
      stripeSessionId: session.id,
      stripeEventId: event.id,
    });
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
}

async function processPayment(data: PaymentData) {
  // 1. Order 상태 업데이트
  await updateOrder(data.orderId, {
    status: 'paid',
    transaction_id: data.stripeSessionId,
  });

  // 2. Enrollment 생성 (UPSERT)
  await upsertEnrollment({
    user_id: data.userId,
    course_id: data.courseId,
    status: 'active',
  });

  // 3. 이벤트 로그 기록 (멱등성)
  await recordOrderEvent({
    stripe_event_id: data.stripeEventId,
    order_id: data.orderId,
    event_type: 'checkout.session.completed',
  });
}
```

### 3. 테스트 카드 (Stripe Test Mode)

```
카드 번호: 4242 4242 4242 4242
만료일: 미래 날짜 (예: 12/34)
CVC: 임의 3자리 (예: 123)
ZIP: 임의 5자리 (예: 12345)
```

더 많은 테스트 카드: [Stripe Testing Cards](https://stripe.com/docs/testing)

---

## Security & Compliance

### 🔒 보안 원칙

1. **API 키 보호**
   - Secret Key는 서버 측에서만 사용 (`STRIPE_SECRET_KEY`)
   - Publishable Key는 클라이언트 노출 가능 (`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`)
   - 환경변수로 관리, 절대 하드코딩 금지

2. **Webhook 서명 검증**
   ```typescript
   // 필수! 서명 검증 없이 웹훅 처리 금지
   const event = stripe.webhooks.constructEvent(
     body,
     signature,
     webhookSecret
   );
   ```

3. **금액 검증**
   - 클라이언트에서 전달받은 금액 무시
   - 서버에서 DB의 `course.regular_price` 또는 `course.discounted_price` 사용
   - 결제 금액과 주문 금액 일치 확인

4. **멱등성 보장**
   - `order_events.stripe_event_id` UNIQUE 제약
   - 웹훅 처리 전 이벤트 ID 중복 체크
   - 재시도/중복 이벤트 안전 처리

5. **HTTPS 필수**
   - 프로덕션에서는 반드시 HTTPS 사용
   - Webhook URL도 HTTPS 필수

### 키 회전 정책

- **분기별**: Test/Live 키 재생성 권장
- **유출 의심 시**: 즉시 키 폐기 및 재생성
- **Webhook Secret**: 웹훅 엔드포인트 재생성 시 자동 갱신

### PCI DSS 준수

- Stripe가 카드 정보 처리 담당 (PCI DSS Level 1)
- 서버에서 카드 정보 직접 처리 금지
- `stripe.checkout.sessions.create()`로 안전하게 처리

---

## Runbooks

### 문제: Webhook 이벤트가 처리되지 않음

**증상**:
```
결제 완료했지만 "내 강의"에 표시되지 않음
```

**해결**:
1. **Webhook 로그 확인**:
   - Stripe Dashboard → Developers → Webhooks → 엔드포인트 클릭
   - Recent deliveries에서 실패 이벤트 확인

2. **서명 검증 오류**:
   ```
   Error: No signatures found matching the expected signature
   ```
   - `STRIPE_WEBHOOK_SECRET` 값 확인
   - Webhook 엔드포인트가 올바른 시크릿 사용하는지 확인

3. **타임아웃**:
   - Webhook 처리 시간이 30초 초과하면 실패
   - 백그라운드 작업으로 분리하거나 최적화

4. **수동 재처리**:
   ```typescript
   // Stripe Dashboard에서 이벤트 ID 복사 후
   const event = await stripe.events.retrieve('evt_xxxxx');
   await processPayment(event.data.object.metadata);
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
   WHERE stripe_event_id = 'evt_xxxxx';
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

3. **UNIQUE 제약 추가** (예방):
   ```sql
   ALTER TABLE enrollments
   ADD CONSTRAINT unique_user_course
   UNIQUE(user_id, course_id);
   ```

### 문제: 테스트 결제가 프로덕션에 영향

**증상**:
```
테스트 키로 결제했는데 실제 등록됨
```

**원인**: 환경변수 혼용

**해결**:
1. **환경 분리**:
   ```env
   # .env.local (개발)
   STRIPE_SECRET_KEY=sk_test_xxxxx

   # .env.production (프로덕션)
   STRIPE_SECRET_KEY=sk_live_xxxxx
   ```

2. **Webhook 엔드포인트 분리**:
   - 개발: `https://dev.yourdomain.com/api/payment/stripe/webhook`
   - 프로덕션: `https://yourdomain.com/api/payment/stripe/webhook`

3. **환경 확인 로그**:
   ```typescript
   console.log('Stripe mode:', process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_') ? 'LIVE' : 'TEST');
   ```

---

## References

### 외부 문서
- [Stripe API Reference](https://stripe.com/docs/api)
- [Stripe Checkout Guide](https://stripe.com/docs/payments/checkout)
- [Webhook Best Practices](https://stripe.com/docs/webhooks/best-practices)
- [Testing Guide](https://stripe.com/docs/testing)

### 내부 문서
- 체크아웃 기능: [../library/checkout.md](../library/checkout.md) (생성 예정)
- MCP 통합: [./mcp.md](./mcp.md)
- 보안 원칙: [../modules/security-principles.md](../../modules/security-principles.md)

---

## CHANGELOG

### 2025-10-01
- ✅ 초기 문서 작성
- ✅ Checkout Session 및 Webhook 구현 가이드 추가
- ✅ 보안 원칙 및 런북 추가
- ✅ 멱등성 처리 방식 문서화

---

**마지막 업데이트**: 2025-10-01
**Status**: 🟢 Active
