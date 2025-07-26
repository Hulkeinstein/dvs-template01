-- courses 테이블에 실제로 누락된 컬럼들 추가
-- (information_schema 조회 결과 기반)

ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS difficulty_level VARCHAR(50) DEFAULT 'All Levels',
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
ADD COLUMN IF NOT EXISTS intro_video_url TEXT,
ADD COLUMN IF NOT EXISTS intro_video_source VARCHAR(50),
ADD COLUMN IF NOT EXISTS max_students INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS regular_price DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS discounted_price DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS language VARCHAR(50) DEFAULT 'English',
ADD COLUMN IF NOT EXISTS course_tags TEXT[],
ADD COLUMN IF NOT EXISTS total_duration_hours INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- updated_at 자동 업데이트를 위한 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- courses 테이블에 updated_at 트리거 추가
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_courses_updated_at'
  ) THEN
    CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- course_topics 테이블이 없으면 생성
CREATE TABLE IF NOT EXISTS course_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- course_topics 인덱스
CREATE INDEX IF NOT EXISTS idx_course_topics_course_id ON course_topics(course_id);
CREATE INDEX IF NOT EXISTS idx_course_topics_sort_order ON course_topics(course_id, sort_order);

-- lessons 테이블에 누락된 컬럼 추가
ALTER TABLE lessons
ADD COLUMN IF NOT EXISTS video_source VARCHAR(50),
ADD COLUMN IF NOT EXISTS content_type VARCHAR(50) DEFAULT 'video',
ADD COLUMN IF NOT EXISTS content_data JSONB,
ADD COLUMN IF NOT EXISTS attachments JSONB,
ADD COLUMN IF NOT EXISTS topic_id UUID REFERENCES course_topics(id) ON DELETE SET NULL;

-- lessons 인덱스
CREATE INDEX IF NOT EXISTS idx_lessons_topic_id ON lessons(topic_id);

-- RLS 정책 (course_topics)
ALTER TABLE course_topics ENABLE ROW LEVEL SECURITY;

-- course_topics 정책
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'course_topics' AND policyname = 'Topics are viewable if course is viewable'
  ) THEN
    CREATE POLICY "Topics are viewable if course is viewable" ON course_topics
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM courses 
          WHERE courses.id = course_topics.course_id 
          AND (courses.is_public = true OR courses.status = 'active' OR courses.instructor_id = auth.uid())
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'course_topics' AND policyname = 'Instructors can manage topics in their courses'
  ) THEN
    CREATE POLICY "Instructors can manage topics in their courses" ON course_topics
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM courses 
          WHERE courses.id = course_topics.course_id 
          AND courses.instructor_id = auth.uid()
        )
      );
  END IF;
END $$;

-- course_topics 트리거
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_course_topics_updated_at'
  ) THEN
    CREATE TRIGGER update_course_topics_updated_at BEFORE UPDATE ON course_topics
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;