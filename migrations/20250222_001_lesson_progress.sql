-- Create lesson_progress table with proper auth.users reference and RLS
BEGIN;

-- Ensure required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS lesson_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  lesson_id UUID NOT NULL,
  course_id UUID NOT NULL,
  enrollment_id UUID NOT NULL,
  
  status VARCHAR(50) DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  time_spent_seconds INTEGER DEFAULT 0,
  
  quiz_score DECIMAL(5,2),
  quiz_attempts INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, lesson_id),
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE
);

-- Idempotent index creation
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_lesson_progress_user_lesson') THEN
    CREATE INDEX idx_lesson_progress_user_lesson ON lesson_progress(user_id, lesson_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_lesson_progress_course_id') THEN
    CREATE INDEX idx_lesson_progress_course_id ON lesson_progress(course_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_lesson_progress_enrollment_id') THEN
    CREATE INDEX idx_lesson_progress_enrollment_id ON lesson_progress(enrollment_id);
  END IF;
END $$;

-- Enable RLS
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if exists (idempotent)
DO $$
BEGIN
  DROP POLICY IF EXISTS lesson_progress_select_policy ON lesson_progress;
  DROP POLICY IF EXISTS lesson_progress_insert_policy ON lesson_progress;
  DROP POLICY IF EXISTS lesson_progress_update_policy ON lesson_progress;
  DROP POLICY IF EXISTS lesson_progress_service_bypass ON lesson_progress;
END$$;

-- User policies
CREATE POLICY lesson_progress_select_policy ON lesson_progress
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY lesson_progress_insert_policy ON lesson_progress
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY lesson_progress_update_policy ON lesson_progress
  FOR UPDATE USING (user_id = auth.uid());

-- Service role bypass (with both USING and WITH CHECK)
CREATE POLICY lesson_progress_service_bypass ON lesson_progress
  FOR ALL
  USING (
    COALESCE((auth.jwt() ->> 'role')::text, '') = 'service_role'
    OR 
    COALESCE((current_setting('request.jwt.claims', true)::json ->> 'role')::text, '') = 'service_role'
  )
  WITH CHECK (
    COALESCE((auth.jwt() ->> 'role')::text, '') = 'service_role'
    OR 
    COALESCE((current_setting('request.jwt.claims', true)::json ->> 'role')::text, '') = 'service_role'
  );

-- Update trigger
CREATE OR REPLACE FUNCTION update_lesson_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_lesson_progress_updated_at
  BEFORE UPDATE ON lesson_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_lesson_progress_updated_at();

COMMIT;

-- Rollback: DROP TABLE IF EXISTS lesson_progress CASCADE;