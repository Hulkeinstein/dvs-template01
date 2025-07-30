-- 데이터베이스 스키마 표준화 마이그레이션
-- 이 마이그레이션은 기존의 충돌하는 스키마를 통합하고 표준화합니다

-- 1. lessons 테이블의 order_index를 sort_order로 표준화
DO $$ 
BEGIN
  -- order_index 컬럼이 존재하는 경우에만 변경
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lessons' AND column_name = 'order_index'
  ) THEN
    -- 기존 sort_order 컬럼이 있다면 삭제
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'lessons' AND column_name = 'sort_order'
    ) THEN
      ALTER TABLE lessons DROP COLUMN sort_order;
    END IF;
    
    -- order_index를 sort_order로 이름 변경
    ALTER TABLE lessons RENAME COLUMN order_index TO sort_order;
    
    -- 인덱스도 업데이트
    DROP INDEX IF EXISTS idx_lessons_order;
    CREATE INDEX idx_lessons_sort_order ON lessons(course_id, sort_order);
  END IF;
END $$;

-- 2. courses 테이블의 instructor_id 참조 수정
-- auth.users 대신 user 테이블을 참조하도록 변경
DO $$ 
BEGIN
  -- 기존 외래키 제약 조건 삭제
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'courses_instructor_id_fkey' 
    AND table_name = 'courses'
  ) THEN
    ALTER TABLE courses DROP CONSTRAINT courses_instructor_id_fkey;
  END IF;
  
  -- 새로운 외래키 제약 조건 추가 (user 테이블 참조)
  ALTER TABLE courses 
  ADD CONSTRAINT courses_instructor_id_fkey 
  FOREIGN KEY (instructor_id) 
  REFERENCES "user"(id) ON DELETE CASCADE;
END $$;

-- 3. 누락된 컬럼 추가 (존재하지 않는 경우에만)
DO $$ 
BEGIN
  -- lessons 테이블에 topic_id 추가
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lessons' AND column_name = 'topic_id'
  ) THEN
    ALTER TABLE lessons ADD COLUMN topic_id UUID REFERENCES course_topics(id) ON DELETE SET NULL;
    CREATE INDEX idx_lessons_topic_id ON lessons(topic_id);
  END IF;
  
  -- lessons 테이블에 필요한 컬럼들 추가
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lessons' AND column_name = 'video_source'
  ) THEN
    ALTER TABLE lessons ADD COLUMN video_source VARCHAR(50);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lessons' AND column_name = 'content_type'
  ) THEN
    ALTER TABLE lessons ADD COLUMN content_type VARCHAR(50) DEFAULT 'video';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lessons' AND column_name = 'content_data'
  ) THEN
    ALTER TABLE lessons ADD COLUMN content_data JSONB;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lessons' AND column_name = 'attachments'
  ) THEN
    ALTER TABLE lessons ADD COLUMN attachments JSONB;
  END IF;
END $$;

-- 4. 데이터 무결성 보장을 위한 함수
CREATE OR REPLACE FUNCTION ensure_lesson_order_integrity()
RETURNS TRIGGER AS $$
BEGIN
  -- 새 레슨 추가 시 자동으로 sort_order 설정
  IF NEW.sort_order IS NULL THEN
    SELECT COALESCE(MAX(sort_order), 0) + 1 INTO NEW.sort_order
    FROM lessons
    WHERE course_id = NEW.course_id
    AND (NEW.topic_id IS NULL OR topic_id = NEW.topic_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성 (존재하지 않는 경우에만)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'ensure_lesson_order_before_insert'
  ) THEN
    CREATE TRIGGER ensure_lesson_order_before_insert
    BEFORE INSERT ON lessons
    FOR EACH ROW
    EXECUTE FUNCTION ensure_lesson_order_integrity();
  END IF;
END $$;

-- 5. 뷰 생성으로 데이터 일관성 보장
CREATE OR REPLACE VIEW course_with_instructor AS
SELECT 
  c.*,
  u.id as instructor_user_id,
  u.email as instructor_email,
  u.name as instructor_name,
  u.role as instructor_role,
  u.avatar_url as instructor_avatar,
  u.bio as instructor_bio
FROM courses c
LEFT JOIN "user" u ON c.instructor_id = u.id;

-- 6. 데이터 일관성 검증 함수
CREATE OR REPLACE FUNCTION validate_course_data()
RETURNS TABLE (
  issue_type TEXT,
  table_name TEXT,
  record_id UUID,
  details TEXT
) AS $$
BEGIN
  -- instructor_id가 user 테이블에 없는 courses 찾기
  RETURN QUERY
  SELECT 
    'missing_instructor'::TEXT,
    'courses'::TEXT,
    c.id,
    'Instructor not found in user table'::TEXT
  FROM courses c
  WHERE NOT EXISTS (
    SELECT 1 FROM "user" u WHERE u.id = c.instructor_id
  );
  
  -- topic_id가 유효하지 않은 lessons 찾기
  RETURN QUERY
  SELECT 
    'invalid_topic'::TEXT,
    'lessons'::TEXT,
    l.id,
    'Topic not found or belongs to different course'::TEXT
  FROM lessons l
  WHERE l.topic_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM course_topics t 
    WHERE t.id = l.topic_id 
    AND t.course_id = l.course_id
  );
  
  -- sort_order가 중복된 레슨 찾기
  RETURN QUERY
  SELECT 
    'duplicate_sort_order'::TEXT,
    'lessons'::TEXT,
    l1.id,
    FORMAT('Duplicate sort_order %s in course %s', l1.sort_order, l1.course_id)::TEXT
  FROM lessons l1
  WHERE EXISTS (
    SELECT 1 FROM lessons l2
    WHERE l2.course_id = l1.course_id
    AND l2.sort_order = l1.sort_order
    AND l2.id != l1.id
    AND (l1.topic_id IS NULL AND l2.topic_id IS NULL 
         OR l1.topic_id = l2.topic_id)
  );
END;
$$ LANGUAGE plpgsql;

-- 7. 데이터 마이그레이션 및 정리
-- sort_order 중복 제거
WITH numbered_lessons AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (
      PARTITION BY course_id, topic_id 
      ORDER BY sort_order, created_at
    ) as new_order
  FROM lessons
)
UPDATE lessons l
SET sort_order = nl.new_order - 1
FROM numbered_lessons nl
WHERE l.id = nl.id;

-- 8. 통합 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_lessons_course_topic_order 
ON lessons(course_id, topic_id, sort_order);

CREATE INDEX IF NOT EXISTS idx_course_topics_course_order 
ON course_topics(course_id, sort_order);

-- 9. RLS 정책 업데이트 (user 테이블 기반)
-- 기존 정책 삭제 및 재생성
DROP POLICY IF EXISTS "Instructors can create their own courses" ON courses;
DROP POLICY IF EXISTS "Instructors can update their own courses" ON courses;
DROP POLICY IF EXISTS "Instructors can delete their own courses" ON courses;

-- 새로운 정책 생성 (user 테이블 기반)
CREATE POLICY "Instructors can create their own courses" ON courses
  FOR INSERT WITH CHECK (
    instructor_id IN (
      SELECT id FROM "user" 
      WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

CREATE POLICY "Instructors can update their own courses" ON courses
  FOR UPDATE USING (
    instructor_id IN (
      SELECT id FROM "user" 
      WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

CREATE POLICY "Instructors can delete their own courses" ON courses
  FOR DELETE USING (
    instructor_id IN (
      SELECT id FROM "user" 
      WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

-- 10. 성능 최적화를 위한 materialized view
CREATE MATERIALIZED VIEW IF NOT EXISTS course_statistics AS
SELECT 
  c.id as course_id,
  c.instructor_id,
  COUNT(DISTINCT l.id) as lesson_count,
  COUNT(DISTINCT ct.id) as topic_count,
  SUM(l.duration_minutes) as total_duration_minutes,
  COUNT(DISTINCT e.user_id) as enrolled_count
FROM courses c
LEFT JOIN lessons l ON c.id = l.course_id
LEFT JOIN course_topics ct ON c.id = ct.course_id
LEFT JOIN enrollments e ON c.id = e.course_id
GROUP BY c.id, c.instructor_id;

CREATE UNIQUE INDEX idx_course_statistics_id ON course_statistics(course_id);

-- Refresh 함수
CREATE OR REPLACE FUNCTION refresh_course_statistics()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY course_statistics;
END;
$$ LANGUAGE plpgsql;

-- 완료 메시지
DO $$ 
BEGIN
  RAISE NOTICE 'Database schema standardization completed successfully';
END $$;