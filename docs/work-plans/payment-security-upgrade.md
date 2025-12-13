---
title: "Payment Security Upgrade Work Plan"
tags:
  - phase/1
  - type/security
  - component/payment
  - external/paypal
  - progress/in-progress
created: 2025-12-13
updated: 2025-12-13
lifecycle: active
---

# Payment Security Upgrade - Work Plan

**Status**: Active
**Created**: 2025-12-13
**Last Updated**: 2025-12-13
**Issue**: #58
**Delete By**: 2026-01-12 (30일 후)

---

## Overview

**목표**: PayPal 결제 시스템 보안 취약점 수정

**예상 시간**: 2-3 hours

**복잡도**: Risky (결제 로직)

**배경**:
- 클라이언트에서 전달받은 금액을 신뢰하는 보안 취약점 발견
- DJB2 약한 해시 알고리즘 사용 중
- Enrollments 테이블에 중복 방지 제약조건 없음

---

## Phases

- [x] **P0: Critical Security Fixes** (가격 검증, 금액 검증, SHA-256)
- [x] **P1: Database Constraints** (UNIQUE 제약조건) - 마이그레이션 파일 생성 완료
- [x] **P2: Type Definitions** (결제 타입 정의) - checkout.ts에 통합
- [x] **P3: Code Quality** (역할 체크 수정 완료)
- [ ] **P4: Testing & Cleanup** (Sandbox 테스트, PR)

---

## Phase Details

### Phase 0: Critical Security Fixes

**목표**: 보안 취약점 즉시 수정

#### 0.1. 가격 검증 - DB에서 가져오기

**현재 문제** (`create-order/route.ts`):
```typescript
// Line 36: 클라이언트에서 amount를 받음 (취약점!)
const { courseId, orderId, amount } = await req.json();

// Line 47-52: course에서 price를 가져오지 않음
.select('id, title')  // ← price 없음!

// Line 120: 클라이언트 amount를 그대로 사용
value: Number(amount).toFixed(2)  // ← 조작 가능!
```

**수정 계획**:
```typescript
// 1. course query에 price 추가
.select('id, title, price')

// 2. 클라이언트 amount와 DB price 비교
if (Math.abs(Number(amount) - course.price) > 0.01) {
  return NextResponse.json(
    { error: 'Price mismatch', code: 'PRICE_TAMPERED' },
    { status: 400 }
  );
}

// 3. DB 가격 사용
value: Number(course.price).toFixed(2)
```

**작업**:
- [ ] Line 48: `.select('id, title')` → `.select('id, title, price')`
- [ ] Line 36 이후: 클라이언트 amount와 DB price 비교 로직 추가
- [ ] Line 120: `amount` → `course.price` 사용
- [ ] amount 파라미터는 검증용으로만 유지 (또는 제거)

**파일**:
- `app/api/payment/paypal/create-order/route.ts`

#### 0.2. 결제 금액 검증

**현재 문제** (`capture/route.ts`):
```typescript
// Line 117: PayPal에서 캡처된 금액을 검증하지 않음
const capture = await paypalClient.execute(request);

// order.amount (Line 58)와 비교하지 않음!
```

**수정 계획**:
```typescript
// 캡처된 금액 추출
const capturedAmount = parseFloat(
  capture.result.purchase_units[0]?.payments?.captures?.[0]?.amount?.value || '0'
);

// DB 주문 금액과 비교
if (Math.abs(capturedAmount - Number(order.amount)) > 0.01) {
  console.error('[PayPal] Amount mismatch:', {
    captured: capturedAmount,
    expected: order.amount,
  });
  return NextResponse.json(
    { error: 'Amount mismatch', code: 'AMOUNT_VERIFICATION_FAILED' },
    { status: 400 }
  );
}
```

**작업**:
- [ ] Line 117 이후: 캡처된 금액 추출 로직 추가
- [ ] 금액 비교 로직 추가 (tolerance: 0.01)
- [ ] 불일치 시 에러 반환 및 로깅

**파일**:
- `app/api/payment/paypal/capture/route.ts`

#### 0.3. SHA-256 해시로 변경

**현재 문제** (`priceCalculator.ts`):
```typescript
// Lines 88-94: DJB2 해시 (보안 취약)
let hash = 0;
for (let i = 0; i < cartString.length; i++) {
  const char = cartString.charCodeAt(i);
  hash = ((hash << 5) - hash) + char;
  hash = hash & hash;
}
return Math.abs(hash).toString(36);
```

**수정 계획**:
```typescript
import { createHash } from 'crypto';

export function generateCartHash(lines: CartLine[]): string {
  const sorted = [...lines].sort((a, b) => a.id.localeCompare(b.id));
  const cartString = sorted
    .map(line => `${line.id}:${line.qty}:${line.unit}`)
    .join('|');

  // SHA-256 해시 사용
  return createHash('sha256')
    .update(cartString)
    .digest('hex')
    .substring(0, 16);  // 처음 16자만 사용
}
```

**작업**:
- [ ] Line 1에 `import { createHash } from 'crypto';` 추가
- [ ] `generateCartHash` 함수: DJB2 → SHA-256
- [ ] `generateIdempotencyKey` 함수도 SHA-256 적용 (선택)

**파일**:
- `app/lib/checkout/priceCalculator.ts`

### Phase 1: Database Constraints

**목표**: 데이터 무결성 보장

#### 1.1. Enrollments UNIQUE 제약조건

**작업**:
- [ ] 마이그레이션 파일 생성
- [ ] UNIQUE(user_id, course_id) 추가
- [ ] 기존 중복 데이터 확인 및 정리

**파일**:
- `supabase/migrations/YYYYMMDD_enrollment_unique.sql`

### Phase 2: Type Definitions

**목표**: 타입 안전성 강화

#### 2.1. 결제 타입 정의

**작업**:
- [ ] PaymentStatus enum 정의
- [ ] PaymentErrorCode enum 정의
- [ ] PaymentError interface 정의
- [ ] 결제 API에 타입 적용

**파일**:
- `types/payment.ts` (신규)

### Phase 3: Code Quality

**목표**: 코드 품질 개선

#### 3.1. 역할 체크 수정

**작업**:
- [ ] instructor → admin || instructor 명확히

**파일**:
- `app/lib/actions/adminOrderActions.ts`

#### 3.2. 에러 핸들링 일관성

**작업**:
- [ ] 모든 결제 API에서 { error, code } 형식 사용
- [ ] 에러 코드 표준화

### Phase 4: Testing & Cleanup

**목표**: 검증 및 정리

**테스트 시나리오**:
1. PayPal Sandbox 결제 테스트
2. 가격 조작 시도 → 거부 확인
3. 중복 등록 시도 → UNIQUE 제약조건 동작 확인

**검증 명령**:
```bash
npm run typecheck
npm run lint
npm run build
```

**작업**:
- [ ] Sandbox 테스트 완료
- [ ] Library 문서 작성
- [ ] Work Plan 삭제
- [ ] PR 생성 (Closes #58)

---

## Progress Log

### 2025-12-13 - Phase 3 완료 ✅
- `adminOrderActions.ts` 역할 체크 수정
- `instructor` only → `instructor || admin` 허용
- 4곳 일괄 수정 완료
- TypeScript 검증 통과
- **Next**: Phase 4 Testing & PR

### 2025-12-13 - Phase 2 완료 ✅
- `types/checkout.ts`에 타입 통합 (Single Source of Truth)
- `OrderStatus`, `PaymentStatus`, `PaymentMethod`, `PaymentGateway` 타입 추가
- `PaymentErrorCode`, `PaymentErrorResponse` 추가
- inline 타입 → 공통 타입으로 교체
- `any` → `Record<string, unknown>` 개선
- TypeScript 검증 통과
- **Next**: Phase 3 Code Quality

### 2025-12-13 - Phase 1 완료 ✅
- 마이그레이션 파일 생성: `20251213_enrollment_unique_constraint.sql`
- UNIQUE(user_id, course_id) 제약조건
- 배포 시 자동 적용 예정
- **Next**: Phase 2 결제 타입 정의

### 2025-12-13 - Phase 0 완료 ✅
- 가격 검증: `create-order/route.ts` - DB price 사용 + 클라이언트 비교
- 금액 검증: `capture/route.ts` - 캡처 금액 vs DB 주문 금액 비교
- SHA-256 해시: `priceCalculator.ts` - DJB2 → SHA-256
- TypeScript + Lint 통과
- **Next**: Phase 1 DB UNIQUE 제약조건

### 2025-12-13 - Work Plan 생성
- Issue #58 생성 완료
- Work Plan 파일 생성
- **Next**: Phase 0 승인 대기

---

## Decisions Log

### D1: 해시 알고리즘 선택 (2025-12-13)
**질문**: Cart hash와 Idempotency key에 어떤 해시 알고리즘을 사용할 것인가?

**결정**: SHA-256 사용

**이유**:
- DJB2는 보안 목적이 아닌 일반 해싱용
- SHA-256은 암호화 표준, 충돌 저항성 우수
- Node.js crypto 모듈 내장

**대안**:
- A안: DJB2 유지 - 빠르지만 보안 취약
- B안: SHA-256 사용 - 보안 표준 ✅
- C안: UUID v4 - 해시가 아닌 랜덤값

**영향**: `priceCalculator.ts` 해시 함수 변경

---

## Risks & Mitigations

### R1: 기존 주문 호환성
**완화 방안**:
- 새 해시 방식은 신규 주문에만 적용
- 기존 주문은 영향 없음

### R2: DB 마이그레이션 실패
**완화 방안**:
- 중복 데이터 먼저 확인
- 트랜잭션 내에서 실행
- 롤백 계획 준비

---

## Completion Criteria

**Phase 0**:
- [ ] 클라이언트 금액 대신 DB 가격 사용
- [ ] 캡처 시 금액 검증 추가
- [ ] SHA-256 해시 적용

**Phase 1**:
- [ ] UNIQUE 제약조건 추가

**Phase 2**:
- [ ] 결제 타입 정의 완료

**Overall (DoD)**:
- [ ] All tests pass
- [ ] TypeScript type-check passes
- [ ] Build succeeds
- [ ] Sandbox 테스트 통과
- [ ] PR created (Closes #58)

---

## Reference

- **Issue**: #58
- **Work Plan Guide**: [../workflows/work-plan-guide.md](../workflows/work-plan-guide.md)
- **Project Workflow**: [../../modules/workflow.md](../../modules/workflow.md)
