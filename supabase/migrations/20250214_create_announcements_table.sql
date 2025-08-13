-- Create announcements table for instructor notifications
CREATE TABLE IF NOT EXISTS announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  instructor_id UUID NOT NULL REFERENCES "user"(id),
  title VARCHAR(255) NOT NULL,
  content TEXT,
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('normal', 'important', 'urgent')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_announcements_course ON announcements(course_id);
CREATE INDEX idx_announcements_instructor ON announcements(instructor_id);
CREATE INDEX idx_announcements_created ON announcements(created_at DESC);
CREATE INDEX idx_announcements_priority ON announcements(priority);

-- Enable Row Level Security
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Instructors can manage their own announcements
CREATE POLICY "Instructors can create announcements" ON announcements
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM "user" 
      WHERE "user".id = announcements.instructor_id 
      AND "user".role = 'instructor'
    )
  );

CREATE POLICY "Instructors can update own announcements" ON announcements
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM "user" 
      WHERE "user".id = announcements.instructor_id 
      AND "user".id = auth.uid()
      AND "user".role = 'instructor'
    )
  );

CREATE POLICY "Instructors can delete own announcements" ON announcements
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM "user" 
      WHERE "user".id = announcements.instructor_id 
      AND "user".id = auth.uid()
      AND "user".role = 'instructor'
    )
  );

-- Instructors can view their own announcements
CREATE POLICY "Instructors can view own announcements" ON announcements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "user" 
      WHERE "user".id = announcements.instructor_id 
      AND "user".id = auth.uid()
      AND "user".role = 'instructor'
    )
  );

-- Students can view announcements for enrolled courses
CREATE POLICY "Students can view enrolled course announcements" ON announcements
  FOR SELECT USING (
    is_active = true AND
    EXISTS (
      SELECT 1 FROM enrollments 
      WHERE enrollments.course_id = announcements.course_id 
      AND enrollments.user_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_announcements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_announcements_updated_at_trigger
  BEFORE UPDATE ON announcements
  FOR EACH ROW
  EXECUTE FUNCTION update_announcements_updated_at();

-- Grant permissions
GRANT ALL ON announcements TO authenticated;