-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  about_course TEXT,
  thumbnail_url TEXT,
  intro_video_url TEXT,
  intro_video_source VARCHAR(50), -- 'youtube', 'vimeo', 'local'
  category VARCHAR(100),
  difficulty_level VARCHAR(50) DEFAULT 'All Levels',
  max_students INTEGER DEFAULT 0, -- 0 means no limit
  is_public BOOLEAN DEFAULT false,
  enable_qa BOOLEAN DEFAULT false,
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'active', 'archived'
  
  -- Pricing
  is_free BOOLEAN DEFAULT false,
  regular_price DECIMAL(10, 2),
  discounted_price DECIMAL(10, 2),
  
  -- Additional info
  start_date DATE,
  language VARCHAR(50) DEFAULT 'English',
  requirements TEXT,
  targeted_audience TEXT,
  course_tags TEXT[], -- Array of tags
  total_duration_hours INTEGER DEFAULT 0,
  total_duration_minutes INTEGER DEFAULT 0,
  
  -- Content drip settings
  content_drip_enabled BOOLEAN DEFAULT false,
  content_drip_type VARCHAR(50), -- 'by_date', 'after_enrollment', 'sequential', 'after_prerequisites'
  
  -- Certificate
  certificate_template VARCHAR(50),
  certificate_orientation VARCHAR(20) DEFAULT 'landscape', -- 'landscape' or 'portrait'
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE,
  
  -- Indexes
  CONSTRAINT courses_instructor_id_fkey FOREIGN KEY (instructor_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_courses_instructor_id ON courses(instructor_id);
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_courses_slug ON courses(slug);

-- Create lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  video_url TEXT,
  video_source VARCHAR(50), -- 'youtube', 'vimeo', 'local'
  duration_minutes INTEGER DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_preview BOOLEAN DEFAULT false,
  
  -- Content
  content_type VARCHAR(50) DEFAULT 'video', -- 'video', 'text', 'quiz', 'assignment'
  content_data JSONB, -- Flexible storage for different content types
  
  -- Attachments
  attachments JSONB, -- Array of file URLs and metadata
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for lessons
CREATE INDEX idx_lessons_course_id ON lessons(course_id);
CREATE INDEX idx_lessons_sort_order ON lessons(course_id, sort_order);

-- Create course_topics table (for grouping lessons)
CREATE TABLE IF NOT EXISTS course_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for course_topics
CREATE INDEX idx_course_topics_course_id ON course_topics(course_id);
CREATE INDEX idx_course_topics_sort_order ON course_topics(course_id, sort_order);

-- Add topic_id to lessons table
ALTER TABLE lessons ADD COLUMN topic_id UUID REFERENCES course_topics(id) ON DELETE SET NULL;
CREATE INDEX idx_lessons_topic_id ON lessons(topic_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to tables
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON lessons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_topics_updated_at BEFORE UPDATE ON course_topics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create RLS policies
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_topics ENABLE ROW LEVEL SECURITY;

-- Courses policies
CREATE POLICY "Public courses are viewable by everyone" ON courses
  FOR SELECT USING (is_public = true OR status = 'active');

CREATE POLICY "Instructors can create their own courses" ON courses
  FOR INSERT WITH CHECK (auth.uid() = instructor_id);

CREATE POLICY "Instructors can update their own courses" ON courses
  FOR UPDATE USING (auth.uid() = instructor_id);

CREATE POLICY "Instructors can delete their own courses" ON courses
  FOR DELETE USING (auth.uid() = instructor_id);

-- Lessons policies (inherit from course permissions)
CREATE POLICY "Lessons are viewable if course is viewable" ON lessons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM courses 
      WHERE courses.id = lessons.course_id 
      AND (courses.is_public = true OR courses.status = 'active' OR courses.instructor_id = auth.uid())
    )
  );

CREATE POLICY "Instructors can manage lessons in their courses" ON lessons
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM courses 
      WHERE courses.id = lessons.course_id 
      AND courses.instructor_id = auth.uid()
    )
  );

-- Course topics policies (inherit from course permissions)
CREATE POLICY "Topics are viewable if course is viewable" ON course_topics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM courses 
      WHERE courses.id = course_topics.course_id 
      AND (courses.is_public = true OR courses.status = 'active' OR courses.instructor_id = auth.uid())
    )
  );

CREATE POLICY "Instructors can manage topics in their courses" ON course_topics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM courses 
      WHERE courses.id = course_topics.course_id 
      AND courses.instructor_id = auth.uid()
    )
  );