-- =========================================================================
-- 체크아웃 안전성 강화 마이그레이션
-- 목적: 중복 주문 방지, 결제 추적, 상태 관리
-- 작성일: 2025-09-29
-- =========================================================================

-- 1. orders 테이블에 idempotency_key 추가 (중복 주문 물리적 방지)
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT,
  ADD COLUMN IF NOT EXISTS order_number VARCHAR(50),
  ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS order_data JSONB,
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- idempotency_key에 UNIQUE 인덱스 생성 (중복 방지 핵심)
CREATE UNIQUE INDEX IF NOT EXISTS orders_idem_uniq
  ON orders (idempotency_key)
  WHERE idempotency_key IS NOT NULL;

-- order_number에 UNIQUE 인덱스 생성
CREATE UNIQUE INDEX IF NOT EXISTS orders_number_uniq
  ON orders (order_number)
  WHERE order_number IS NOT NULL;

-- 2. payments 테이블 생성 (웹훅 중복 방지)
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  gateway TEXT NOT NULL, -- 'stripe', 'paypal', 'manual'
  gateway_payment_id TEXT NOT NULL, -- Stripe PI ID, PayPal Transaction ID 등
  amount_cents INTEGER NOT NULL, -- 정수로 저장 (소수점 오류 방지)
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, succeeded, failed, refunded
  metadata JSONB, -- 게이트웨이별 추가 데이터
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 결제 게이트웨이별 중복 방지 인덱스
CREATE UNIQUE INDEX IF NOT EXISTS payments_gateway_uniq
  ON payments (gateway, gateway_payment_id);

-- 3. 주문 상태 enum 타입 생성 (명확한 상태 전이)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status_enum') THEN
    CREATE TYPE order_status_enum AS ENUM (
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

-- orders 테이블 status 컬럼 타입 변경 (안전하게)
DO $$
BEGIN
  -- 기존 status 컬럼이 text 타입이면 enum으로 변경
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders'
    AND column_name = 'status'
    AND data_type = 'character varying'
  ) THEN
    -- 임시 컬럼 생성
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS status_new order_status_enum;

    -- 기존 데이터 마이그레이션
    UPDATE orders SET status_new =
      CASE
        WHEN status = 'pending' THEN 'awaiting_payment'::order_status_enum
        WHEN status = 'completed' THEN 'paid'::order_status_enum
        WHEN status = 'cancelled' THEN 'cancelled'::order_status_enum
        WHEN status = 'failed' THEN 'failed'::order_status_enum
        ELSE 'awaiting_payment'::order_status_enum
      END
    WHERE status_new IS NULL;

    -- 기존 컬럼 삭제 및 이름 변경
    ALTER TABLE orders DROP COLUMN status;
    ALTER TABLE orders RENAME COLUMN status_new TO status;

    -- NOT NULL 제약 추가
    ALTER TABLE orders ALTER COLUMN status SET NOT NULL;
    ALTER TABLE orders ALTER COLUMN status SET DEFAULT 'awaiting_payment'::order_status_enum;
  END IF;
END$$;

-- 4. order_items 테이블 생성 (주문 상세 아이템)
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id),
  price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  subtotal DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- order_items 인덱스
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_course_id ON order_items(course_id);

-- 5. RPC 함수: 원자적 주문 생성 (트랜잭션 보장)
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
AS $$
DECLARE
  v_order_id UUID;
  v_item JSONB;
  v_is_free BOOLEAN;
BEGIN
  -- 1) 무료 코스 여부 확인
  v_is_free := (p_total_amount = 0);

  -- 2) 중복 체크 및 주문 생성 (멱등성 보장)
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
    order_data,
    notes
  )
  VALUES (
    p_user_id,
    p_order_number,
    p_idempotency_key,
    CASE
      WHEN v_is_free THEN 'paid'::order_status_enum
      WHEN p_payment_method = 'cash_on_delivery' THEN 'cod_pending'::order_status_enum
      ELSE 'awaiting_payment'::order_status_enum
    END,
    p_total_amount, -- 기존 호환성
    p_subtotal,
    p_tax_amount,
    p_discount_amount,
    p_total_amount,
    p_currency,
    p_payment_method,
    p_order_data,
    p_notes
  )
  ON CONFLICT (idempotency_key) DO NOTHING
  RETURNING id INTO v_order_id;

  -- 이미 존재하는 주문인 경우
  IF v_order_id IS NULL THEN
    SELECT id INTO v_order_id
    FROM orders
    WHERE idempotency_key = p_idempotency_key;

    RETURN QUERY SELECT v_order_id, true;
    RETURN;
  END IF;

  -- 3) 주문 아이템 삽입
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
  END LOOP;

  -- 4) 무료 코스는 즉시 enrollment 생성
  IF v_is_free THEN
    INSERT INTO enrollments (user_id, course_id, status, enrolled_at)
    SELECT
      p_user_id,
      (item->>'course_id')::UUID,
      'active',
      NOW()
    FROM jsonb_array_elements(p_items) AS item
    ON CONFLICT (user_id, course_id) DO NOTHING;
  END IF;

  -- 5) 결과 반환
  RETURN QUERY SELECT v_order_id, false;
END$$;

-- 6. 트리거: updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- orders 테이블 트리거
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- payments 테이블 트리거
DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 7. 인덱스 추가 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- =========================================================================
-- 마이그레이션 완료
-- 실행 후 확인사항:
-- 1. orders 테이블에 idempotency_key 컬럼 및 인덱스 생성 확인
-- 2. payments 테이블 생성 확인
-- 3. order_status_enum 타입 생성 확인
-- 4. create_order_with_items 함수 생성 확인
-- =========================================================================