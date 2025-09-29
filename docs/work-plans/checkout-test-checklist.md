# 체크아웃 시스템 테스트 체크리스트

## 📅 작성일: 2025-09-29

## ✅ 데이터베이스 마이그레이션 확인
- [x] `20250929_fix_orders_table_type.sql` 실행 완료
- [x] `20250929_complete_checkout_system.sql` 실행 완료
- [x] orders 테이블이 UUID 타입으로 생성됨
- [x] payments 테이블 생성됨
- [x] order_items 테이블 생성됨
- [x] RPC 함수들 생성됨

## 🧪 테스트 시나리오

### 1. 무료 코스 테스트 (0원 주문)
- [ ] 무료 코스를 카트에 추가
- [ ] /checkout 페이지 이동
- [ ] "Enroll Now (Free)" 버튼 표시 확인
- [ ] 결제 방법 섹션 숨김 확인
- [ ] 주문 완료 확인
- [ ] enrollments 테이블에 자동 등록 확인
- [ ] payments 테이블에 'free' 게이트웨이 기록 확인

### 2. 유료 코스 테스트
- [ ] 유료 코스를 카트에 추가
- [ ] /checkout 페이지 이동
- [ ] "Place order" 버튼 표시 확인
- [ ] 결제 방법 선택 가능 확인
- [ ] 주문 생성 확인
- [ ] orders 테이블에 'awaiting_payment' 상태 확인

### 3. 중복 주문 방지 테스트
- [ ] 같은 카트로 주문 시도
- [ ] 빠르게 두 번 클릭
- [ ] "This order has already been placed" 메시지 확인
- [ ] orders 테이블에 하나의 주문만 생성됨 확인

### 4. 데이터 검증 쿼리

```sql
-- 최근 주문 확인
SELECT * FROM orders
ORDER BY created_at DESC
LIMIT 5;

-- 주문 상세 정보 확인
SELECT
  o.order_number,
  o.status,
  o.payment_status,
  o.total_amount,
  oi.course_id,
  oi.price,
  oi.quantity
FROM orders o
LEFT JOIN order_items oi ON oi.order_id = o.id
ORDER BY o.created_at DESC;

-- 결제 정보 확인
SELECT * FROM payments
ORDER BY created_at DESC
LIMIT 5;

-- 무료 주문 enrollment 확인
SELECT
  e.user_id,
  e.course_id,
  e.status,
  e.enrolled_at,
  o.order_number
FROM enrollments e
JOIN orders o ON o.user_id = e.user_id
WHERE o.total_amount = 0
ORDER BY e.enrolled_at DESC;
```

## 🔍 확인 사항

### 프론트엔드
- [x] Checkout.tsx에서 무료 주문 UI 분기 구현됨
- [x] CartSummary 컴포넌트 생성됨
- [x] AddressForm 컴포넌트 생성됨
- [x] PaymentMethodSelector 컴포넌트 생성됨

### 백엔드
- [x] orderActions.ts가 새 RPC 함수 호출
- [x] priceCalculator.ts 유틸리티 생성됨
- [x] 멱등성 키 생성 로직 구현됨

### 타입 정의
- [x] Order 인터페이스 추가됨
- [x] Payment 인터페이스 추가됨
- [x] OrderItemDB 인터페이스 추가됨

## 🚀 테스트 명령어

```bash
# 개발 서버 실행
npm run dev

# 타입 체크
npm run typecheck

# 린트 체크
npm run lint
```

## 📝 테스트 결과 기록

### 테스트 일시:
### 테스터:
### 결과:

#### 무료 코스 테스트
- 결과:
- 이슈:

#### 유료 코스 테스트
- 결과:
- 이슈:

#### 중복 방지 테스트
- 결과:
- 이슈:

## 🐛 발견된 이슈

1.

## ✨ 개선 사항

1.

---

**마지막 업데이트**: 2025-09-29