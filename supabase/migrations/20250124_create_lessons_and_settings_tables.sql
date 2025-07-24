-- Create lessons table if not exists
CREATE TABLE IF NOT EXISTS lessons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  video_url TEXT,
  duration_minutes INTEGER,
  order_index INTEGER NOT NULL,
  is_preview BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create course_settings table if not exists
CREATE TABLE IF NOT EXISTS course_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  certificate_enabled BOOLEAN DEFAULT false,
  certificate_title VARCHAR(255),
  passing_grade INTEGER DEFAULT 70,
  max_students INTEGER,
  enrollment_deadline DATE,
  start_date DATE,
  end_date DATE,
  allow_lifetime_access BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes if not exist
CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_order ON lessons(course_id, order_index);
CREATE INDEX IF NOT EXISTS idx_course_settings_course_id ON course_settings(course_id);

-- Enable RLS if not already enabled
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_settings ENABLE ROW LEVEL SECURITY;

-- Lessons policies (create if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'lessons' AND policyname = 'Published course lessons are viewable'
  ) THEN
    CREATE POLICY "Published course lessons are viewable" ON lessons
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM courses 
          WHERE courses.id = lessons.course_id 
          AND courses.status = 'published'
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'lessons' AND policyname = 'Instructors can manage lessons of their courses'
  ) THEN
    CREATE POLICY "Instructors can manage lessons of their courses" ON lessons
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM courses 
          WHERE courses.id = lessons.course_id 
          AND courses.instructor_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Course settings policies (create if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'course_settings' AND policyname = 'Course settings viewable with course'
  ) THEN
    CREATE POLICY "Course settings viewable with course" ON course_settings
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM courses 
          WHERE courses.id = course_settings.course_id 
          AND (courses.status = 'published' OR courses.instructor_id = auth.uid())
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'course_settings' AND policyname = 'Instructors can manage course settings'
  ) THEN
    CREATE POLICY "Instructors can manage course settings" ON course_settings
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM courses 
          WHERE courses.id = course_settings.course_id 
          AND courses.instructor_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Create update trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers if not exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_lessons_updated_at'
  ) THEN
    CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON lessons
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_course_settings_updated_at'
  ) THEN
    CREATE TRIGGER update_course_settings_updated_at BEFORE UPDATE ON course_settings
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;