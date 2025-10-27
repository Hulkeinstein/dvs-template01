-- =========================================================================
-- 유료 주문 임시 처리 함수
-- 목적: Stripe/PayPal 웹훅 구현 전까지 관리자가 수동으로 유료 주문 활성화
-- 작성일: 2025-02-15
-- =========================================================================

-- 함수: 유료 주문을 완료 처리하고 enrollment 생성
CREATE OR REPLACE FUNCTION activate_paid_order(
  p_order_id UUID,
  p_admin_id UUID DEFAULT NULL
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_record RECORD;
  v_user_id UUID;
  v_course_count INT := 0;
  v_enrollment_count INT := 0;
  v_result JSON;
BEGIN
  -- 1. 주문 정보 조회 및 검증
  SELECT
    o.id,
    o.user_id,
    o.status,
    o.payment_status,
    o.total_amount
  INTO v_order_record
  FROM orders o
  WHERE o.id = p_order_id;

  -- 주문이 없으면 에러
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Order not found'
    );
  END IF;

  -- 이미 완료된 주문이면 스킵
  IF v_order_record.status = 'completed' OR v_order_record.payment_status = 'succeeded' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Order already completed'
    );
  END IF;

  v_user_id := v_order_record.user_id;

  -- 2. 주문 상태를 완료로 변경
  UPDATE orders
  SET
    status = 'completed',
    payment_status = 'succeeded',
    updated_at = NOW()
  WHERE id = p_order_id;

  -- 3. 주문 아이템에서 코스 ID를 가져와서 enrollment 생성
  -- order_items 테이블이 있는 경우
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'order_items') THEN
    FOR v_course_count IN
      SELECT COUNT(*) FROM order_items WHERE order_id = p_order_id
    LOOP
      INSERT INTO enrollments (user_id, course_id, status, progress_percentage, enrolled_at)
      SELECT
        v_user_id,
        oi.course_id,
        'active',
        0,
        NOW()
      FROM order_items oi
      WHERE oi.order_id = p_order_id
      ON CONFLICT (user_id, course_id)
      DO UPDATE SET
        status = 'active',
        last_accessed_at = NOW();
    END LOOP;
  -- order_items 테이블이 없으면 orders 테이블의 course_id 사용 (단일 코스)
  ELSE
    -- orders 테이블에 course_id 컬럼이 있는지 확인
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name = 'orders' AND column_name = 'course_id') THEN
      INSERT INTO enrollments (user_id, course_id, status, progress_percentage, enrolled_at)
      SELECT
        user_id,
        course_id,
        'active',
        0,
        NOW()
      FROM orders
      WHERE id = p_order_id
        AND course_id IS NOT NULL
      ON CONFLICT (user_id, course_id)
      DO UPDATE SET
        status = 'active',
        last_accessed_at = NOW();

      v_enrollment_count := 1;
    END IF;
  END IF;

  -- 4. 실제 생성된 enrollment 수 계산
  SELECT COUNT(*) INTO v_enrollment_count
  FROM enrollments
  WHERE user_id = v_user_id
    AND created_at >= NOW() - INTERVAL '1 minute';

  -- 5. 결과 반환
  RETURN json_build_object(
    'success', true,
    'order_id', p_order_id,
    'user_id', v_user_id,
    'enrollments_created', v_enrollment_count,
    'message', 'Order activated and enrollments created successfully'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- 권한 설정: service role만 실행 가능
REVOKE EXECUTE ON FUNCTION activate_paid_order FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION activate_paid_order FROM anon;
REVOKE EXECUTE ON FUNCTION activate_paid_order FROM authenticated;

-- =========================================================================
-- 편의 함수: 특정 사용자의 모든 대기 중인 주문 조회
-- =========================================================================
CREATE OR REPLACE FUNCTION get_pending_paid_orders()
RETURNS TABLE (
  order_id UUID,
  user_id UUID,
  user_email TEXT,
  total_amount DECIMAL,
  payment_method VARCHAR,
  created_at TIMESTAMPTZ,
  days_pending INT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    o.id as order_id,
    o.user_id,
    u.email as user_email,
    o.total_amount,
    o.payment_method,
    o.created_at,
    EXTRACT(DAY FROM (NOW() - o.created_at))::INT as days_pending
  FROM orders o
  LEFT JOIN "user" u ON u.id = o.user_id
  WHERE o.status IN ('pending', 'awaiting_payment', 'processing')
    AND o.payment_status != 'succeeded'
    AND o.total_amount > 0
  ORDER BY o.created_at DESC;
END;
$$;

-- =========================================================================
-- 사용 예시 (관리자 패널에서 실행)
-- =========================================================================
-- 대기 중인 유료 주문 조회:
-- SELECT * FROM get_pending_paid_orders();

-- 특정 주문 활성화 (결제 확인 후):
-- SELECT activate_paid_order('주문ID'::uuid);

-- =========================================================================
-- 롤백 스크립트 (필요시)
-- =========================================================================
-- DROP FUNCTION IF EXISTS activate_paid_order(UUID, UUID);
-- DROP FUNCTION IF EXISTS get_pending_paid_orders();