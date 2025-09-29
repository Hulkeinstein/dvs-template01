-- =========================================================================
-- orders 테이블 구조 진단 쿼리
-- 실제 테이블 타입을 확인하여 마이그레이션 전 상태 파악
-- =========================================================================

-- 1. orders 테이블 컬럼 정보 확인
SELECT
  column_name,
  data_type,
  udt_name,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'orders'
ORDER BY ordinal_position;

-- 2. orders 테이블의 id 타입만 확인
SELECT
  'orders.id type is: ' || data_type || ' (' || udt_name || ')' as info
FROM information_schema.columns
WHERE table_name = 'orders' AND column_name = 'id';

-- 3. 기존 인덱스 확인
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'orders';

-- 4. 외래키 제약 확인
SELECT
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
  JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
  JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'orders';

-- 5. 테이블 크기 및 행 수 확인
SELECT
  'orders table has ' || COUNT(*) || ' rows' as info
FROM orders;

-- 6. orders 테이블이 실제로 어떤 ID 타입을 사용하는지 샘플 확인
SELECT
  id,
  pg_typeof(id) as id_type,
  user_id,
  pg_typeof(user_id) as user_id_type
FROM orders
LIMIT 1;