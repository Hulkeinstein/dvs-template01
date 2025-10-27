-- =========================================================================
-- 체크아웃 안전성 강화 마이그레이션 (타입 호환성 수정)
-- 목적: 중복 주문 방지, 결제 추적, 상태 관리
-- 작성일: 2025-09-29
-- 수정: orders 테이블 타입 호환성 문제 해결
-- =========================================================================

-- 먼저 orders 테이블의 실제 타입 확인 및 정리
DO $$
DECLARE
  v_id_type TEXT;
BEGIN
  -- orders 테이블의 id 컬럼 타입 확인
  SELECT data_type INTO v_id_type
  FROM information_schema.columns
  WHERE table_name = 'orders' AND column_name = 'id';

  RAISE NOTICE 'Current orders.id type: %', v_id_type;
END$$;

-- 1. orders 테이블에 필요한 컬럼 추가 (이미 존재하면 무시)
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT,
  ADD COLUMN IF NOT EXISTS order_number VARCHAR(50),
  ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS order_data JSONB,
  ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending';

-- tax_amount와 discount_amount는 이미 존재할 수 있음 (20250124_create_enrollment_tables.sql에서 생성)
-- total_amount도 이미 존재함

-- idempotency_key에 UNIQUE 인덱스 생성 (중복 방지 핵심)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE indexname = 'orders_idem_uniq'
  ) THEN
    CREATE UNIQUE INDEX orders_idem_uniq
      ON orders (idempotency_key)
      WHERE idempotency_key IS NOT NULL;
  END IF;
END$$;

-- order_number에 UNIQUE 인덱스 생성
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE indexname = 'orders_number_uniq'
  ) THEN
    CREATE UNIQUE INDEX orders_number_uniq
      ON orders (order_number)
      WHERE order_number IS NOT NULL;
  END IF;
END$$;

-- 2. payments 테이블 생성 (orders.id 타입에 맞춤)
DO $$
DECLARE
  v_id_type TEXT;
  v_sql TEXT;
BEGIN
  -- orders 테이블의 id 타입 확인
  SELECT data_type INTO v_id_type
  FROM information_schema.columns
  WHERE table_name = 'orders' AND column_name = 'id';

  -- payments 테이블이 없으면 생성
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payments') THEN
    -- UUID 타입인 경우
    IF v_id_type = 'uuid' THEN
      v_sql := '
        CREATE TABLE payments (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
          gateway TEXT NOT NULL,
          gateway_payment_id TEXT NOT NULL,
          amount_cents INTEGER NOT NULL,
          currency TEXT NOT NULL DEFAULT ''USD'',
          status TEXT NOT NULL DEFAULT ''pending'',
          metadata JSONB,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )';
    -- BIGINT 타입인 경우
    ELSIF v_id_type IN ('bigint', 'integer') THEN
      v_sql := '
        CREATE TABLE payments (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
          gateway TEXT NOT NULL,
          gateway_payment_id TEXT NOT NULL,
          amount_cents INTEGER NOT NULL,
          currency TEXT NOT NULL DEFAULT ''USD'',
          status TEXT NOT NULL DEFAULT ''pending'',
          metadata JSONB,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )';
    ELSE
      RAISE EXCEPTION 'Unexpected orders.id type: %', v_id_type;
    END IF;

    EXECUTE v_sql;
    RAISE NOTICE 'Created payments table with order_id type: %', v_id_type;
  END IF;
END$$;

-- 결제 게이트웨이별 중복 방지 인덱스
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE indexname = 'payments_gateway_uniq'
  ) THEN
    CREATE UNIQUE INDEX payments_gateway_uniq
      ON payments (gateway, gateway_payment_id);
  END IF;
END$$;

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

-- 4. order_items 테이블 생성 (주문 상세 아이템)
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id),
  price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  subtotal DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- order_items 타입도 orders.id에 맞춤
DO $$
DECLARE
  v_id_type TEXT;
BEGIN
  -- orders 테이블의 id 타입 확인
  SELECT data_type INTO v_id_type
  FROM information_schema.columns
  WHERE table_name = 'orders' AND column_name = 'id';

  -- order_items.order_id 타입이 맞지 않으면 재생성
  IF v_id_type IN ('bigint', 'integer') THEN
    -- order_items 테이블 삭제 후 재생성
    DROP TABLE IF EXISTS order_items CASCADE;

    CREATE TABLE order_items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      order_id BIGINT REFERENCES orders(id) ON DELETE CASCADE,
      course_id UUID REFERENCES courses(id),
      price DECIMAL(10, 2) NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      subtotal DECIMAL(10, 2) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  END IF;
END$$;

-- order_items 인덱스
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_course_id ON order_items(course_id);

-- 5. RPC 함수: 원자적 주문 생성 (트랜잭션 보장)
-- orders.id 타입에 따라 동적으로 생성
DO $$
DECLARE
  v_id_type TEXT;
  v_func_sql TEXT;
BEGIN
  -- orders 테이블의 id 타입 확인
  SELECT data_type INTO v_id_type
  FROM information_schema.columns
  WHERE table_name = 'orders' AND column_name = 'id';

  -- 기존 함수 삭제
  DROP FUNCTION IF EXISTS create_order_with_items CASCADE;

  -- UUID 타입용 함수
  IF v_id_type = 'uuid' THEN
    v_func_sql := '
      CREATE OR REPLACE FUNCTION create_order_with_items(
        p_user_id UUID,
        p_order_number VARCHAR(50),
        p_idempotency_key TEXT,
        p_order_data JSONB,
        p_items JSONB,
        p_subtotal DECIMAL(10, 2),
        p_tax_amount DECIMAL(10, 2),
        p_discount_amount DECIMAL(10, 2),
        p_total_amount DECIMAL(10, 2),
        p_currency VARCHAR(3),
        p_payment_method VARCHAR(50),
        p_notes TEXT DEFAULT NULL
      ) RETURNS TABLE(order_id UUID, is_duplicate BOOLEAN)
      LANGUAGE plpgsql
      AS $func$
      DECLARE
        v_order_id UUID;
        v_item JSONB;
        v_is_free BOOLEAN;
      BEGIN
        v_is_free := (p_total_amount = 0);

        INSERT INTO orders (
          user_id, order_number, idempotency_key, status,
          amount, subtotal, tax_amount, discount_amount, total_amount,
          currency, payment_method, order_data, notes
        )
        VALUES (
          p_user_id, p_order_number, p_idempotency_key,
          CASE
            WHEN v_is_free THEN ''paid''
            WHEN p_payment_method = ''cash_on_delivery'' THEN ''cod_pending''
            ELSE ''awaiting_payment''
          END,
          p_total_amount, p_subtotal, p_tax_amount, p_discount_amount, p_total_amount,
          p_currency, p_payment_method, p_order_data, p_notes
        )
        ON CONFLICT (idempotency_key) DO NOTHING
        RETURNING id INTO v_order_id;

        IF v_order_id IS NULL THEN
          SELECT id INTO v_order_id FROM orders WHERE idempotency_key = p_idempotency_key;
          RETURN QUERY SELECT v_order_id, true;
          RETURN;
        END IF;

        FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
        LOOP
          INSERT INTO order_items (order_id, course_id, price, quantity, subtotal)
          VALUES (
            v_order_id,
            (v_item->>''course_id'')::UUID,
            (v_item->>''price'')::DECIMAL,
            (v_item->>''quantity'')::INTEGER,
            (v_item->>''price'')::DECIMAL * (v_item->>''quantity'')::INTEGER
          );
        END LOOP;

        IF v_is_free THEN
          INSERT INTO enrollments (user_id, course_id, status, enrolled_at)
          SELECT p_user_id, (item->>''course_id'')::UUID, ''active'', NOW()
          FROM jsonb_array_elements(p_items) AS item
          ON CONFLICT (user_id, course_id) DO NOTHING;
        END IF;

        RETURN QUERY SELECT v_order_id, false;
      END;
      $func$';

  -- BIGINT 타입용 함수
  ELSIF v_id_type IN ('bigint', 'integer') THEN
    v_func_sql := '
      CREATE OR REPLACE FUNCTION create_order_with_items(
        p_user_id UUID,
        p_order_number VARCHAR(50),
        p_idempotency_key TEXT,
        p_order_data JSONB,
        p_items JSONB,
        p_subtotal DECIMAL(10, 2),
        p_tax_amount DECIMAL(10, 2),
        p_discount_amount DECIMAL(10, 2),
        p_total_amount DECIMAL(10, 2),
        p_currency VARCHAR(3),
        p_payment_method VARCHAR(50),
        p_notes TEXT DEFAULT NULL
      ) RETURNS TABLE(order_id BIGINT, is_duplicate BOOLEAN)
      LANGUAGE plpgsql
      AS $func$
      DECLARE
        v_order_id BIGINT;
        v_item JSONB;
        v_is_free BOOLEAN;
      BEGIN
        v_is_free := (p_total_amount = 0);

        INSERT INTO orders (
          user_id, order_number, idempotency_key, status,
          amount, subtotal, tax_amount, discount_amount, total_amount,
          currency, payment_method, order_data, notes
        )
        VALUES (
          p_user_id, p_order_number, p_idempotency_key,
          CASE
            WHEN v_is_free THEN ''paid''
            WHEN p_payment_method = ''cash_on_delivery'' THEN ''cod_pending''
            ELSE ''awaiting_payment''
          END,
          p_total_amount, p_subtotal, p_tax_amount, p_discount_amount, p_total_amount,
          p_currency, p_payment_method, p_order_data, p_notes
        )
        ON CONFLICT (idempotency_key) DO NOTHING
        RETURNING id INTO v_order_id;

        IF v_order_id IS NULL THEN
          SELECT id INTO v_order_id FROM orders WHERE idempotency_key = p_idempotency_key;
          RETURN QUERY SELECT v_order_id, true;
          RETURN;
        END IF;

        FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
        LOOP
          INSERT INTO order_items (order_id, course_id, price, quantity, subtotal)
          VALUES (
            v_order_id,
            (v_item->>''course_id'')::UUID,
            (v_item->>''price'')::DECIMAL,
            (v_item->>''quantity'')::INTEGER,
            (v_item->>''price'')::DECIMAL * (v_item->>''quantity'')::INTEGER
          );
        END LOOP;

        IF v_is_free THEN
          INSERT INTO enrollments (user_id, course_id, status, enrolled_at)
          SELECT p_user_id, (item->>''course_id'')::UUID, ''active'', NOW()
          FROM jsonb_array_elements(p_items) AS item
          ON CONFLICT (user_id, course_id) DO NOTHING;
        END IF;

        RETURN QUERY SELECT v_order_id, false;
      END;
      $func$';
  END IF;

  EXECUTE v_func_sql;
  RAISE NOTICE 'Created create_order_with_items function for % order IDs', v_id_type;
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
-- 검증 쿼리
-- =========================================================================
DO $$
DECLARE
  v_orders_id_type TEXT;
  v_payments_order_id_type TEXT;
  v_order_items_order_id_type TEXT;
BEGIN
  -- 타입 확인
  SELECT data_type INTO v_orders_id_type
  FROM information_schema.columns
  WHERE table_name = 'orders' AND column_name = 'id';

  SELECT data_type INTO v_payments_order_id_type
  FROM information_schema.columns
  WHERE table_name = 'payments' AND column_name = 'order_id';

  SELECT data_type INTO v_order_items_order_id_type
  FROM information_schema.columns
  WHERE table_name = 'order_items' AND column_name = 'order_id';

  RAISE NOTICE '=== Type Verification ===';
  RAISE NOTICE 'orders.id type: %', v_orders_id_type;
  RAISE NOTICE 'payments.order_id type: %', v_payments_order_id_type;
  RAISE NOTICE 'order_items.order_id type: %', v_order_items_order_id_type;

  -- 타입 일치 확인
  IF v_payments_order_id_type IS NOT NULL AND v_orders_id_type != v_payments_order_id_type THEN
    RAISE WARNING 'Type mismatch: orders.id (%) != payments.order_id (%)',
                  v_orders_id_type, v_payments_order_id_type;
  END IF;
END$$;

-- =========================================================================
-- 마이그레이션 완료
-- 실행 후 확인사항:
-- 1. orders 테이블에 idempotency_key 컬럼 및 인덱스 생성 확인
-- 2. payments 테이블 생성 확인 (orders.id 타입과 일치)
-- 3. order_items 테이블 생성 확인 (orders.id 타입과 일치)
-- 4. create_order_with_items 함수 생성 확인
-- =========================================================================