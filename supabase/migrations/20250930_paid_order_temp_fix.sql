-- =========================================================================
-- 유료 주문 임시 활성화 함수
-- 목적: Stripe 웹훅 구현 전까지 관리자가 수동으로 주문 활성화
-- 작성일: 2025-09-30
-- =========================================================================

-- 관리자가 수동으로 유료 주문을 활성화하는 함수
CREATE OR REPLACE FUNCTION activate_paid_order(
  p_order_id UUID,
  p_admin_id UUID DEFAULT NULL
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_item RECORD;
  v_user_id UUID;
  v_order_status VARCHAR(50);
BEGIN
  -- 1. 현재 주문 상태 확인 및 사용자 ID 가져오기
  SELECT status, user_id INTO v_order_status, v_user_id
  FROM orders
  WHERE id = p_order_id;

  -- 주문을 찾을 수 없는 경우
  IF v_user_id IS NULL THEN
    RAISE NOTICE 'Order % not found', p_order_id;
    RETURN FALSE;
  END IF;

  -- 이미 처리된 주문인 경우
  IF v_order_status = 'paid' OR v_order_status = 'fulfilled' THEN
    RAISE NOTICE 'Order % already processed (status: %)', p_order_id, v_order_status;
    RETURN FALSE;
  END IF;

  -- 2. 주문 상태를 paid로 변경
  UPDATE orders
  SET
    status = 'paid',
    payment_status = 'succeeded',
    updated_at = NOW()
  WHERE id = p_order_id
    AND status IN ('awaiting_payment', 'cod_pending', 'processing');

  -- 3. payments 테이블에 수동 결제 기록 추가 (선택사항)
  INSERT INTO payments (
    order_id,
    gateway,
    gateway_payment_id,
    amount_cents,
    currency,
    status,
    metadata
  )
  SELECT
    p_order_id,
    'manual',
    'MANUAL_' || p_order_id::TEXT,
    (total_amount * 100)::INTEGER, -- cents로 변환
    currency,
    'succeeded',
    jsonb_build_object(
      'activated_by', p_admin_id,
      'activated_at', NOW(),
      'reason', 'manual_activation'
    )
  FROM orders
  WHERE id = p_order_id
  ON CONFLICT (gateway, gateway_payment_id) DO NOTHING;

  -- 4. 각 코스에 대해 enrollment 생성
  FOR v_item IN
    SELECT DISTINCT course_id
    FROM order_items
    WHERE order_id = p_order_id
  LOOP
    -- enrollment 생성 또는 업데이트
    INSERT INTO enrollments (
      user_id,
      course_id,
      status,
      enrolled_at,
      progress_percentage,
      created_at,
      updated_at
    )
    VALUES (
      v_user_id,
      v_item.course_id,
      'active',
      NOW(),
      0,
      NOW(),
      NOW()
    )
    ON CONFLICT (user_id, course_id)
    DO UPDATE SET
      status = 'active',
      updated_at = NOW()
    WHERE enrollments.status != 'active';

    RAISE NOTICE 'Enrollment created/updated for user % and course %', v_user_id, v_item.course_id;
  END LOOP;

  -- 5. 로그 메시지
  RAISE NOTICE 'Order % successfully activated. User % can now access enrolled courses.', p_order_id, v_user_id;

  RETURN TRUE;

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to activate order %: %', p_order_id, SQLERRM;
    RETURN FALSE;
END$$;

-- 권한 부여 (authenticated 사용자만 실행 가능)
GRANT EXECUTE ON FUNCTION activate_paid_order TO authenticated;

-- =========================================================================
-- 사용 예시
-- =========================================================================
-- SELECT activate_paid_order('order-uuid-here');
-- SELECT activate_paid_order('order-uuid-here', 'admin-uuid-here');

-- =========================================================================
-- 주문 활성화 상태 확인용 헬퍼 함수
-- =========================================================================
CREATE OR REPLACE FUNCTION check_order_activation_status(p_order_id UUID)
RETURNS TABLE(
  order_id UUID,
  order_number VARCHAR(50),
  user_id UUID,
  user_email TEXT,
  order_status VARCHAR(50),
  payment_status VARCHAR(50),
  total_amount DECIMAL(10, 2),
  enrollments_count BIGINT,
  courses_accessible TEXT[]
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    o.id AS order_id,
    o.order_number,
    o.user_id,
    u.email AS user_email,
    o.status AS order_status,
    o.payment_status,
    o.total_amount,
    COUNT(DISTINCT e.course_id) AS enrollments_count,
    ARRAY_AGG(DISTINCT c.title) AS courses_accessible
  FROM orders o
  LEFT JOIN "user" u ON u.id = o.user_id
  LEFT JOIN order_items oi ON oi.order_id = o.id
  LEFT JOIN enrollments e ON e.user_id = o.user_id AND e.course_id = oi.course_id
  LEFT JOIN courses c ON c.id = e.course_id
  WHERE o.id = p_order_id
  GROUP BY o.id, o.order_number, o.user_id, u.email, o.status, o.payment_status, o.total_amount;
END$$;

-- 권한 부여
GRANT EXECUTE ON FUNCTION check_order_activation_status TO authenticated;

-- =========================================================================
-- 사용 예시
-- =========================================================================
-- 주문 활성화 전 상태 확인:
-- SELECT * FROM check_order_activation_status('order-uuid-here');
--
-- 주문 활성화:
-- SELECT activate_paid_order('order-uuid-here');
--
-- 주문 활성화 후 상태 확인:
-- SELECT * FROM check_order_activation_status('order-uuid-here');

-- =========================================================================
-- 대량 활성화 (필요시)
-- =========================================================================
-- 모든 cod_pending 주문 활성화:
-- SELECT activate_paid_order(id)
-- FROM orders
-- WHERE status = 'cod_pending'
--   AND created_at > NOW() - INTERVAL '7 days';