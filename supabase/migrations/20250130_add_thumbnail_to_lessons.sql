-- Lessons 테이블에 thumbnail_url 컬럼 추가
-- Feature Image 저장을 위한 마이그레이션

-- 1. thumbnail_url 컬럼 추가
ALTER TABLE lessons 
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- 2. attachments 컬럼 타입 확인 및 변경 (필요시)
DO $$ 
BEGIN
  -- attachments 컬럼이 없으면 추가
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lessons' AND column_name = 'attachments'
  ) THEN
    ALTER TABLE lessons ADD COLUMN attachments JSONB DEFAULT '[]'::JSONB;
  END IF;
END $$;

-- 3. 인덱스 추가 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_lessons_thumbnail 
ON lessons(thumbnail_url) 
WHERE thumbnail_url IS NOT NULL;

-- 4. 완료 메시지
DO $$ 
BEGIN
  RAISE NOTICE 'thumbnail_url column added to lessons table successfully';
END $$;