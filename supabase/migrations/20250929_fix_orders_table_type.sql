-- =========================================================================
-- Orders 테이블 타입 문제 해결
-- 목적: BIGINT로 잘못 생성된 orders 테이블을 UUID로 재생성
-- 작성일: 2025-09-29
-- =========================================================================

-- 1. 현재 상태 확인 및 로깅
DO $$
DECLARE
  v_count INTEGER;
  v_id_type TEXT;
BEGIN
  -- 데이터 존재 여부 확인
  SELECT COUNT(*) INTO v_count FROM orders;
  RAISE NOTICE 'Current orders table has % rows', v_count;

  -- ID 타입 확인
  SELECT data_type INTO v_id_type
  FROM information_schema.columns
  WHERE table_name = 'orders' AND column_name = 'id';
  RAISE NOTICE 'Current orders.id type: %', v_id_type;

  -- 데이터가 있으면 경고
  IF v_count > 0 THEN
    RAISE WARNING 'Orders table contains data! Please backup before proceeding.';
  END IF;
END$$;

-- 2. 기존 의존 객체 삭제 (CASCADE로 안전하게 처리)
DROP FUNCTION IF EXISTS public.create_order_atomic CASCADE;
DROP FUNCTION IF EXISTS public.create_order_with_items CASCADE;
DROP FUNCTION IF EXISTS public.get_order_by_number CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column CASCADE;

-- 3. 기존 트리거 삭제
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;

-- 4. 기존 테이블 삭제 (의존 객체 포함)
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS orders CASCADE;

-- 5. orders 테이블을 UUID 타입으로 재생성
CREATE TABLE orders (
  -- 기본 키
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 외래 키
  user_id UUID NOT NULL,
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,

  -- 주문 식별자
  order_number VARCHAR(50) UNIQUE,
  idempotency_key TEXT UNIQUE,

  -- 금액 정보
  amount DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2),
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2),
  currency VARCHAR(3) DEFAULT 'USD',

  -- 결제 정보
  payment_method VARCHAR(50),
  payment_status VARCHAR(50) DEFAULT 'pending',
  status VARCHAR(50) DEFAULT 'pending',
  transaction_id VARCHAR(255),

  -- 추가 데이터
  order_data JSONB,
  notes TEXT,

  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. 인덱스 생성
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_course_id ON orders(course_id);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_idempotency_key ON orders(idempotency_key);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- 7. updated_at 트리거 재생성
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 8. 코멘트 추가
COMMENT ON TABLE orders IS 'Order management table with UUID primary key';
COMMENT ON COLUMN orders.order_number IS 'Human-readable order number (e.g., ORD-20250929-1234)';
COMMENT ON COLUMN orders.idempotency_key IS 'Unique key to prevent duplicate order creation';
COMMENT ON COLUMN orders.subtotal IS 'Order subtotal before tax and discounts';
COMMENT ON COLUMN orders.tax_amount IS 'Calculated tax amount';
COMMENT ON COLUMN orders.discount_amount IS 'Applied discount amount';
COMMENT ON COLUMN orders.total_amount IS 'Final amount including tax minus discount';
COMMENT ON COLUMN orders.order_data IS 'JSON data containing shipping, billing, and item details';

-- 9. 검증
DO $$
DECLARE
  v_new_type TEXT;
BEGIN
  -- 새 테이블의 ID 타입 확인
  SELECT data_type INTO v_new_type
  FROM information_schema.columns
  WHERE table_name = 'orders' AND column_name = 'id';

  IF v_new_type = 'uuid' THEN
    RAISE NOTICE '✅ Success: orders table recreated with UUID type';
  ELSE
    RAISE EXCEPTION '❌ Error: orders table id is still %, expected uuid', v_new_type;
  END IF;
END$$;

-- =========================================================================
-- 완료
-- 다음 단계: 20250929_complete_checkout_system.sql 실행
-- =========================================================================