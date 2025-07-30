-- Sort Order 컬럼 추가 (누락된 컬럼 긴급 수정)
-- 이 마이그레이션은 lessons 테이블에 sort_order 컬럼이 없는 경우를 해결합니다

-- 1. sort_order 컬럼 추가
ALTER TABLE lessons 
ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;

-- 2. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_lessons_sort_order 
ON lessons(course_id, sort_order);

-- 3. 기존 데이터 정리 (생성 시간 기준으로 순서 설정)
WITH numbered_lessons AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (
      PARTITION BY course_id, topic_id 
      ORDER BY created_at
    ) as new_order
  FROM lessons
  WHERE sort_order = 0  -- 아직 순서가 설정되지 않은 레슨만
)
UPDATE lessons l
SET sort_order = nl.new_order
FROM numbered_lessons nl
WHERE l.id = nl.id;

-- 4. 완료 메시지
DO $$ 
BEGIN
  RAISE NOTICE 'sort_order column added to lessons table successfully';
END $$;