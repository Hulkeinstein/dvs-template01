-- =========================================================================
-- 완전한 체크아웃 시스템 구현
-- 목적: 중복 방지, 결제 추적, 원자적 트랜잭션 지원
-- 작성일: 2025-09-29
-- 전제조건: orders 테이블이 UUID 타입으로 생성되어 있어야 함
-- =========================================================================

-- 1. 사전 검증
DO $$
DECLARE
  v_id_type TEXT;
BEGIN
  -- orders 테이블 ID 타입 확인
  SELECT data_type INTO v_id_type
  FROM information_schema.columns
  WHERE table_name = 'orders' AND column_name = 'id';

  IF v_id_type != 'uuid' THEN
    RAISE EXCEPTION 'orders.id must be UUID type. Current type: %. Please run 20250929_fix_orders_table_type.sql first', v_id_type;
  END IF;

  RAISE NOTICE '✅ orders.id is UUID type. Proceeding with migration...';
END$$;

-- =========================================================================
-- 2. PAYMENTS 테이블 생성
-- =========================================================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  gateway TEXT NOT NULL, -- 'stripe', 'paypal', 'manual', 'free'
  gateway_payment_id TEXT NOT NULL, -- Stripe PI ID, PayPal Transaction ID 등
  amount_cents INTEGER NOT NULL, -- 정수로 저장 (소수점 오류 방지)
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, succeeded, failed, refunded
  metadata JSONB, -- 게이트웨이별 추가 데이터
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 결제 중복 방지 인덱스
CREATE UNIQUE INDEX IF NOT EXISTS payments_gateway_uniq
  ON payments (gateway, gateway_payment_id);

-- 성능 인덱스
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);

-- =========================================================================
-- 3. ORDER_ITEMS 테이블 생성
-- =========================================================================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id),
  price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  subtotal DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_course_id ON order_items(course_id);

-- =========================================================================
-- 4. 주문 상태 ENUM (선택사항 - status 컬럼 표준화)
-- =========================================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
    CREATE TYPE order_status AS ENUM (
      'draft',            -- 임시 저장
      'awaiting_payment', -- 결제 대기
      'cod_pending',      -- Pay Later 대기
      'processing',       -- 결제 처리 중
      'paid',            -- 결제 완료
      'fulfilled',       -- 이행 완료
      'cancelled',       -- 취소
      'failed',          -- 실패
      'refunded'         -- 환불
    );
  END IF;
END$$;

-- =========================================================================
-- 5. RPC 함수: 원자적 주문 생성 (개선된 버전)
-- =========================================================================
CREATE OR REPLACE FUNCTION create_order_with_items(
  p_user_id UUID,
  p_order_number VARCHAR(50),
  p_idempotency_key TEXT,
  p_order_data JSONB,
  p_items JSONB, -- [{course_id, price, quantity}]
  p_subtotal DECIMAL(10, 2),
  p_tax_amount DECIMAL(10, 2),
  p_discount_amount DECIMAL(10, 2),
  p_total_amount DECIMAL(10, 2),
  p_currency VARCHAR(3),
  p_payment_method VARCHAR(50),
  p_notes TEXT DEFAULT NULL
) RETURNS TABLE(order_id UUID, is_duplicate BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_id UUID;
  v_item JSONB;
  v_is_free BOOLEAN;
  v_course_id UUID;
BEGIN
  -- 1) 무료 주문 여부 확인
  v_is_free := (p_total_amount = 0);

  -- 2) 멱등성 체크 - 이미 존재하는 주문 확인
  SELECT id INTO v_order_id
  FROM orders
  WHERE idempotency_key = p_idempotency_key;

  IF v_order_id IS NOT NULL THEN
    -- 이미 존재하는 주문
    RETURN QUERY SELECT v_order_id, true;
    RETURN;
  END IF;

  -- 3) 새 주문 생성
  INSERT INTO orders (
    user_id,
    order_number,
    idempotency_key,
    status,
    amount,
    subtotal,
    tax_amount,
    discount_amount,
    total_amount,
    currency,
    payment_method,
    payment_status,
    order_data,
    notes
  )
  VALUES (
    p_user_id,
    p_order_number,
    p_idempotency_key,
    CASE
      WHEN v_is_free THEN 'paid'
      WHEN p_payment_method = 'cash_on_delivery' THEN 'cod_pending'
      ELSE 'awaiting_payment'
    END,
    p_total_amount, -- 호환성을 위해 유지
    p_subtotal,
    p_tax_amount,
    p_discount_amount,
    p_total_amount,
    p_currency,
    p_payment_method,
    CASE
      WHEN v_is_free THEN 'completed'
      ELSE 'pending'
    END,
    p_order_data,
    p_notes
  )
  RETURNING id INTO v_order_id;

  -- 4) 주문 아이템 삽입
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO order_items (
      order_id,
      course_id,
      price,
      quantity,
      subtotal
    )
    VALUES (
      v_order_id,
      (v_item->>'course_id')::UUID,
      (v_item->>'price')::DECIMAL,
      (v_item->>'quantity')::INTEGER,
      (v_item->>'price')::DECIMAL * (v_item->>'quantity')::INTEGER
    );

    -- 각 코스 ID 저장 (enrollment 생성용)
    v_course_id := (v_item->>'course_id')::UUID;

    -- 5) 무료 주문인 경우 즉시 enrollment 생성
    IF v_is_free THEN
      INSERT INTO enrollments (user_id, course_id, status, enrolled_at, progress_percentage)
      VALUES (p_user_id, v_course_id, 'active', NOW(), 0)
      ON CONFLICT (user_id, course_id) DO NOTHING;
    END IF;
  END LOOP;

  -- 6) 무료 주문인 경우 자동 결제 기록 생성
  IF v_is_free THEN
    INSERT INTO payments (
      order_id,
      gateway,
      gateway_payment_id,
      amount_cents,
      currency,
      status,
      metadata
    )
    VALUES (
      v_order_id,
      'free',
      'FREE_' || v_order_id::TEXT,
      0,
      p_currency,
      'succeeded',
      jsonb_build_object('auto_approved', true, 'reason', 'free_order')
    );
  END IF;

  -- 7) 결과 반환
  RETURN QUERY SELECT v_order_id, false;

EXCEPTION
  WHEN unique_violation THEN
    -- 동시성 처리: unique 제약 위반 시 기존 주문 반환
    SELECT id INTO v_order_id
    FROM orders
    WHERE idempotency_key = p_idempotency_key;

    RETURN QUERY SELECT v_order_id, true;
END;
$$;

-- =========================================================================
-- 6. 결제 완료 처리 함수 (웹훅용)
-- =========================================================================
CREATE OR REPLACE FUNCTION process_payment_completion(
  p_order_id UUID,
  p_gateway TEXT,
  p_gateway_payment_id TEXT,
  p_amount_cents INTEGER,
  p_currency TEXT,
  p_metadata JSONB DEFAULT NULL
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_course_id UUID;
BEGIN
  -- 1) 결제 기록 생성/업데이트 (중복 방지)
  INSERT INTO payments (
    order_id,
    gateway,
    gateway_payment_id,
    amount_cents,
    currency,
    status,
    metadata
  )
  VALUES (
    p_order_id,
    p_gateway,
    p_gateway_payment_id,
    p_amount_cents,
    p_currency,
    'succeeded',
    p_metadata
  )
  ON CONFLICT (gateway, gateway_payment_id)
  DO UPDATE SET
    status = 'succeeded',
    metadata = payments.metadata || p_metadata,
    updated_at = NOW()
  WHERE payments.status != 'succeeded'; -- 이미 성공한 결제는 수정하지 않음

  -- 2) 주문 상태 업데이트
  UPDATE orders
  SET
    status = 'paid',
    payment_status = 'completed',
    updated_at = NOW()
  WHERE id = p_order_id
    AND status != 'paid'; -- 이미 paid 상태면 업데이트 안 함

  -- 3) enrollment 생성 (주문의 모든 코스)
  FOR v_course_id IN
    SELECT course_id FROM order_items WHERE order_id = p_order_id
  LOOP
    SELECT user_id INTO v_user_id FROM orders WHERE id = p_order_id;

    INSERT INTO enrollments (user_id, course_id, status, enrolled_at, progress_percentage)
    VALUES (v_user_id, v_course_id, 'active', NOW(), 0)
    ON CONFLICT (user_id, course_id) DO NOTHING;
  END LOOP;

  RETURN TRUE;
END;
$$;

-- =========================================================================
-- 7. 유틸리티 함수들
-- =========================================================================

-- 주문 조회 함수
CREATE OR REPLACE FUNCTION get_order_details(p_order_id UUID)
RETURNS TABLE(
  order_info JSONB,
  items JSONB,
  payments JSONB
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    to_jsonb(o.*) AS order_info,
    COALESCE(
      jsonb_agg(DISTINCT oi.*) FILTER (WHERE oi.id IS NOT NULL),
      '[]'::jsonb
    ) AS items,
    COALESCE(
      jsonb_agg(DISTINCT p.*) FILTER (WHERE p.id IS NOT NULL),
      '[]'::jsonb
    ) AS payments
  FROM orders o
  LEFT JOIN order_items oi ON oi.order_id = o.id
  LEFT JOIN payments p ON p.order_id = o.id
  WHERE o.id = p_order_id
  GROUP BY o.id;
END;
$$;

-- =========================================================================
-- 8. 트리거: payments updated_at
-- =========================================================================
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =========================================================================
-- 9. 권한 부여
-- =========================================================================
GRANT EXECUTE ON FUNCTION create_order_with_items TO authenticated;
GRANT EXECUTE ON FUNCTION process_payment_completion TO service_role;
GRANT EXECUTE ON FUNCTION get_order_details TO authenticated;

-- =========================================================================
-- 10. 테이블 코멘트
-- =========================================================================
COMMENT ON TABLE payments IS 'Payment transaction records with idempotency';
COMMENT ON TABLE order_items IS 'Order line items for multi-course orders';

COMMENT ON COLUMN payments.gateway IS 'Payment gateway: stripe, paypal, manual, free';
COMMENT ON COLUMN payments.gateway_payment_id IS 'Unique ID from payment gateway';
COMMENT ON COLUMN payments.amount_cents IS 'Amount in cents to avoid decimal issues';

COMMENT ON FUNCTION create_order_with_items IS 'Creates order with items atomically, handles free orders';
COMMENT ON FUNCTION process_payment_completion IS 'Processes successful payment webhook, creates enrollments';

-- =========================================================================
-- 11. 검증 쿼리
-- =========================================================================
DO $$
DECLARE
  v_tables_ok BOOLEAN := TRUE;
  v_missing TEXT := '';
BEGIN
  -- 테이블 존재 확인
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payments') THEN
    v_tables_ok := FALSE;
    v_missing := v_missing || 'payments, ';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'order_items') THEN
    v_tables_ok := FALSE;
    v_missing := v_missing || 'order_items, ';
  END IF;

  -- 함수 존재 확인
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'create_order_with_items') THEN
    v_tables_ok := FALSE;
    v_missing := v_missing || 'create_order_with_items function, ';
  END IF;

  -- 결과 출력
  IF v_tables_ok THEN
    RAISE NOTICE '✅ Checkout system successfully installed!';
    RAISE NOTICE 'Tables: orders, payments, order_items';
    RAISE NOTICE 'Functions: create_order_with_items, process_payment_completion';
  ELSE
    RAISE WARNING '⚠️ Missing components: %', v_missing;
  END IF;
END$$;

-- =========================================================================
-- 마이그레이션 완료
-- 체크아웃 시스템이 완전히 구현되었습니다.
-- =========================================================================