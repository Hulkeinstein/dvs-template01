-- ============================================================================
-- 체크아웃 시스템 테스트 SQL 스니펫
-- Supabase SQL Editor에서 실행
-- 작성일: 2025-09-30
-- ============================================================================

-- ============================================================================
-- 1. 함수 설치 확인
-- ============================================================================

-- 필요한 함수들이 모두 설치되었는지 확인
SELECT
  proname as function_name,
  pronargs as argument_count,
  pg_get_functiondef(oid) as definition_preview
FROM pg_proc
WHERE proname IN (
  'activate_paid_order',
  'check_order_activation_status',
  'create_order_with_items',
  'process_payment_completion'
)
ORDER BY proname;

-- ============================================================================
-- 2. 테스트 데이터 준비
-- ============================================================================

-- 테스트용 무료 코스 찾기
SELECT
  id,
  title,
  is_free,
  regular_price,
  instructor_id
FROM courses
WHERE is_free = true
  AND status = 'published'
LIMIT 3;

-- 테스트용 유료 코스 찾기
SELECT
  id,
  title,
  regular_price,
  discounted_price,
  instructor_id
FROM courses
WHERE is_free = false
  AND regular_price > 0
  AND status = 'published'
LIMIT 3;

-- ============================================================================
-- 3. 최근 주문 조회
-- ============================================================================

-- 최근 24시간 내 모든 주문
SELECT
  o.id,
  o.order_number,
  o.status,
  o.payment_status,
  o.total_amount,
  o.payment_method,
  u.email as user_email,
  o.created_at,
  COUNT(oi.id) as item_count
FROM orders o
JOIN "user" u ON u.id = o.user_id
LEFT JOIN order_items oi ON oi.order_id = o.id
WHERE o.created_at > NOW() - INTERVAL '24 hours'
GROUP BY o.id, o.order_number, o.status, o.payment_status,
         o.total_amount, o.payment_method, u.email, o.created_at
ORDER BY o.created_at DESC;

-- cod_pending (Pay Later) 주문만 조회
SELECT
  o.id,
  o.order_number,
  o.status,
  o.payment_status,
  o.total_amount,
  u.email as user_email,
  u.name as user_name,
  o.created_at
FROM orders o
JOIN "user" u ON u.id = o.user_id
WHERE o.status = 'cod_pending'
  AND o.created_at > NOW() - INTERVAL '7 days'
ORDER BY o.created_at DESC
LIMIT 10;

-- ============================================================================
-- 4. 주문 상태 상세 확인
-- ============================================================================

-- 특정 주문의 상세 정보 (주문 ID를 입력하세요)
WITH order_details AS (
  SELECT
    o.id as order_id,
    o.order_number,
    o.user_id,
    o.status as order_status,
    o.payment_status,
    o.total_amount,
    o.idempotency_key,
    o.created_at,
    u.email,
    u.name
  FROM orders o
  JOIN "user" u ON u.id = o.user_id
  WHERE o.id = 'YOUR-ORDER-ID-HERE'  -- <-- 여기에 주문 ID 입력
)
SELECT * FROM order_details;

-- 해당 주문의 아이템들
SELECT
  oi.id as item_id,
  c.title as course_title,
  oi.price,
  oi.quantity,
  oi.subtotal
FROM order_items oi
JOIN courses c ON c.id = oi.course_id
WHERE oi.order_id = 'YOUR-ORDER-ID-HERE';  -- <-- 여기에 주문 ID 입력

-- 해당 사용자의 enrollment 상태
SELECT
  e.id as enrollment_id,
  c.title as course_title,
  e.status as enrollment_status,
  e.enrolled_at,
  e.progress_percentage
FROM enrollments e
JOIN courses c ON c.id = e.course_id
WHERE e.user_id = (
  SELECT user_id FROM orders WHERE id = 'YOUR-ORDER-ID-HERE'  -- <-- 여기에 주문 ID 입력
);

-- ============================================================================
-- 5. 주문 활성화 (관리자용)
-- ============================================================================

-- Step 1: 활성화할 주문 선택
SELECT
  o.id,
  o.order_number,
  o.status,
  o.total_amount,
  u.email
FROM orders o
JOIN "user" u ON u.id = o.user_id
WHERE o.status IN ('cod_pending', 'awaiting_payment')
  AND o.created_at > NOW() - INTERVAL '7 days'
ORDER BY o.created_at DESC
LIMIT 5;

-- Step 2: 활성화 전 상태 확인
SELECT * FROM check_order_activation_status('YOUR-ORDER-ID-HERE');

-- Step 3: 주문 활성화 실행
SELECT activate_paid_order('YOUR-ORDER-ID-HERE');

-- Step 4: 활성화 후 상태 재확인
SELECT * FROM check_order_activation_status('YOUR-ORDER-ID-HERE');

-- ============================================================================
-- 6. 중복 주문 테스트
-- ============================================================================

-- 동일한 idempotency_key를 가진 주문 찾기
SELECT
  idempotency_key,
  COUNT(*) as duplicate_count,
  STRING_AGG(order_number, ', ') as order_numbers,
  STRING_AGG(id::TEXT, ', ') as order_ids
FROM orders
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY idempotency_key
HAVING COUNT(*) > 1;

-- 특정 사용자의 최근 주문 패턴 분석
WITH user_orders AS (
  SELECT
    o.user_id,
    u.email,
    o.order_number,
    o.idempotency_key,
    o.total_amount,
    o.created_at,
    LAG(o.created_at) OVER (PARTITION BY o.user_id ORDER BY o.created_at) as prev_order_time
  FROM orders o
  JOIN "user" u ON u.id = o.user_id
  WHERE o.created_at > NOW() - INTERVAL '24 hours'
)
SELECT
  *,
  CASE
    WHEN prev_order_time IS NOT NULL
    THEN EXTRACT(EPOCH FROM (created_at - prev_order_time)) / 60  -- 분 단위 차이
  END as minutes_since_last_order
FROM user_orders
ORDER BY user_id, created_at DESC;

-- ============================================================================
-- 7. Enrollment 검증
-- ============================================================================

-- 무료 코스 주문과 enrollment 매칭 확인
SELECT
  o.order_number,
  o.status as order_status,
  o.total_amount,
  c.title as course_title,
  c.is_free,
  e.id as enrollment_id,
  e.status as enrollment_status,
  e.enrolled_at
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
JOIN courses c ON c.id = oi.course_id
LEFT JOIN enrollments e ON e.user_id = o.user_id AND e.course_id = c.id
WHERE o.total_amount = 0  -- 무료 주문
  AND o.created_at > NOW() - INTERVAL '24 hours'
ORDER BY o.created_at DESC;

-- 유료 코스 주문과 enrollment 매칭 확인
SELECT
  o.order_number,
  o.status as order_status,
  o.payment_status,
  o.total_amount,
  c.title as course_title,
  e.id as enrollment_id,
  e.status as enrollment_status,
  CASE
    WHEN e.id IS NULL THEN '❌ No enrollment'
    ELSE '✅ Enrolled'
  END as enrollment_check
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
JOIN courses c ON c.id = oi.course_id
LEFT JOIN enrollments e ON e.user_id = o.user_id AND e.course_id = c.id
WHERE o.total_amount > 0  -- 유료 주문
  AND o.created_at > NOW() - INTERVAL '24 hours'
ORDER BY o.created_at DESC;

-- ============================================================================
-- 8. 데이터 정합성 체크
-- ============================================================================

-- order_items의 subtotal과 실제 계산값 비교
SELECT
  oi.id,
  oi.order_id,
  oi.price,
  oi.quantity,
  oi.subtotal as stored_subtotal,
  (oi.price * oi.quantity) as calculated_subtotal,
  CASE
    WHEN oi.subtotal = (oi.price * oi.quantity) THEN '✅ Match'
    ELSE '❌ Mismatch'
  END as validation
FROM order_items oi
WHERE oi.order_id IN (
  SELECT id FROM orders WHERE created_at > NOW() - INTERVAL '24 hours'
);

-- orders 테이블의 total_amount 검증
WITH order_totals AS (
  SELECT
    o.id,
    o.order_number,
    o.subtotal as order_subtotal,
    o.tax_amount,
    o.discount_amount,
    o.total_amount as stored_total,
    (o.subtotal + o.tax_amount - COALESCE(o.discount_amount, 0)) as calculated_total,
    SUM(oi.subtotal) as items_subtotal
  FROM orders o
  LEFT JOIN order_items oi ON oi.order_id = o.id
  WHERE o.created_at > NOW() - INTERVAL '24 hours'
  GROUP BY o.id, o.order_number, o.subtotal, o.tax_amount, o.discount_amount, o.total_amount
)
SELECT
  *,
  CASE
    WHEN ABS(stored_total - calculated_total) < 0.01 THEN '✅ Total Match'
    ELSE '❌ Total Mismatch'
  END as total_validation,
  CASE
    WHEN ABS(order_subtotal - items_subtotal) < 0.01 THEN '✅ Subtotal Match'
    ELSE '❌ Subtotal Mismatch'
  END as subtotal_validation
FROM order_totals;

-- ============================================================================
-- 9. 성능 모니터링
-- ============================================================================

-- 주문 생성 속도 (시간당)
SELECT
  DATE_TRUNC('hour', created_at) as hour,
  COUNT(*) as orders_count,
  AVG(total_amount) as avg_order_value,
  SUM(total_amount) as total_revenue
FROM orders
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', created_at)
ORDER BY hour DESC;

-- 결제 방법별 통계
SELECT
  payment_method,
  COUNT(*) as order_count,
  AVG(total_amount) as avg_amount,
  SUM(total_amount) as total_amount,
  COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_count,
  COUNT(CASE WHEN status = 'cod_pending' THEN 1 END) as pending_count
FROM orders
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY payment_method
ORDER BY order_count DESC;

-- ============================================================================
-- 10. 정리 및 유지보수
-- ============================================================================

-- 오래된 cod_pending 주문 찾기 (7일 이상)
SELECT
  o.id,
  o.order_number,
  o.status,
  o.total_amount,
  u.email,
  o.created_at,
  AGE(NOW(), o.created_at) as age
FROM orders o
JOIN "user" u ON u.id = o.user_id
WHERE o.status = 'cod_pending'
  AND o.created_at < NOW() - INTERVAL '7 days'
ORDER BY o.created_at ASC;

-- 테스트 주문 삭제 (주의: 실제 데이터 삭제!)
-- DELETE FROM orders
-- WHERE order_number LIKE 'TEST-%'
--   OR notes LIKE '%test%';

-- ============================================================================
-- 11. 대시보드용 통계
-- ============================================================================

-- 오늘의 주문 현황
SELECT
  COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE) as today_orders,
  COUNT(*) FILTER (WHERE status = 'paid') as paid_orders,
  COUNT(*) FILTER (WHERE status = 'cod_pending') as pending_orders,
  COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_orders,
  SUM(total_amount) FILTER (WHERE status = 'paid') as today_revenue,
  AVG(total_amount) FILTER (WHERE status = 'paid') as avg_order_value
FROM orders
WHERE created_at >= CURRENT_DATE;

-- ============================================================================
-- 도움말
-- ============================================================================

/*
사용 방법:

1. 주문 ID 찾기:
   - Section 3의 쿼리 실행
   - 원하는 주문의 ID 복사

2. 주문 활성화:
   - Section 5의 Step 1-4 순서대로 실행
   - 'YOUR-ORDER-ID-HERE'를 실제 ID로 교체

3. 데이터 검증:
   - Section 8의 쿼리로 데이터 정합성 체크
   - Mismatch가 있으면 조사 필요

4. 성능 모니터링:
   - Section 9의 쿼리로 시스템 상태 확인
   - 이상 패턴 발견 시 조치

주의사항:
- DELETE 쿼리는 주석 처리됨 (실행 시 주의)
- 프로덕션에서는 WHERE 조건 재확인 필수
*/