-- courses 테이블에 누락된 컬럼 추가
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS slug VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS about_course TEXT,
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
ADD COLUMN IF NOT EXISTS intro_video_url TEXT,
ADD COLUMN IF NOT EXISTS intro_video_source VARCHAR(50),
ADD COLUMN IF NOT EXISTS category VARCHAR(100),
ADD COLUMN IF NOT EXISTS difficulty_level VARCHAR(50) DEFAULT 'All Levels',
ADD COLUMN IF NOT EXISTS max_students INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS enable_qa BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS regular_price DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS discounted_price DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS language VARCHAR(50) DEFAULT 'English',
ADD COLUMN IF NOT EXISTS requirements TEXT,
ADD COLUMN IF NOT EXISTS targeted_audience TEXT,
ADD COLUMN IF NOT EXISTS course_tags TEXT[],
ADD COLUMN IF NOT EXISTS total_duration_hours INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_duration_minutes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS content_drip_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS content_drip_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS certificate_template VARCHAR(50),
ADD COLUMN IF NOT EXISTS certificate_orientation VARCHAR(20) DEFAULT 'landscape',
ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE;

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

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_course_topics_course_id ON course_topics(course_id);
CREATE INDEX IF NOT EXISTS idx_course_topics_sort_order ON course_topics(course_id, sort_order);

-- lessons 테이블에 누락된 컬럼 추가
ALTER TABLE lessons
ADD COLUMN IF NOT EXISTS video_source VARCHAR(50),
ADD COLUMN IF NOT EXISTS content_type VARCHAR(50) DEFAULT 'video',
ADD COLUMN IF NOT EXISTS content_data JSONB,
ADD COLUMN IF NOT EXISTS attachments JSONB,
ADD COLUMN IF NOT EXISTS topic_id UUID REFERENCES course_topics(id) ON DELETE SET NULL;

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_lessons_topic_id ON lessons(topic_id);

-- RLS 정책 추가
ALTER TABLE course_topics ENABLE ROW LEVEL SECURITY;

-- Course topics policies (조건부 생성)
DO $$ 
BEGIN
  -- Topics are viewable if course is viewable
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

  -- Instructors can manage topics in their courses
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

-- 트리거 추가 (조건부)
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