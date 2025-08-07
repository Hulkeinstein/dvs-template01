-- Create quiz_attempts table for tracking student quiz attempts
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  
  -- Attempt information
  attempt_number INTEGER NOT NULL DEFAULT 1,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  time_spent_seconds INTEGER,
  
  -- Score information
  score DECIMAL(5,2),
  total_points DECIMAL(5,2),
  percentage DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE WHEN total_points > 0 THEN (score / total_points) * 100 ELSE 0 END
  ) STORED,
  passed BOOLEAN,
  
  -- Answer data
  answers JSONB NOT NULL DEFAULT '{}',
  -- Format: { "questionId": { "answer": "...", "isCorrect": true/false, "points": 10 } }
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_score CHECK (score >= 0 AND score <= total_points),
  CONSTRAINT valid_time_spent CHECK (time_spent_seconds >= 0)
);

-- Create indexes for better performance
CREATE INDEX idx_quiz_attempts_user_lesson ON quiz_attempts(user_id, lesson_id);
CREATE INDEX idx_quiz_attempts_course_user ON quiz_attempts(course_id, user_id);
CREATE INDEX idx_quiz_attempts_lesson_completed ON quiz_attempts(lesson_id, completed_at) WHERE completed_at IS NOT NULL;
CREATE INDEX idx_quiz_attempts_user_passed ON quiz_attempts(user_id, passed) WHERE passed = true;

-- Function to calculate attempt number
CREATE OR REPLACE FUNCTION calculate_attempt_number() 
RETURNS TRIGGER AS $$
BEGIN
  NEW.attempt_number := COALESCE(
    (SELECT MAX(attempt_number) + 1 
     FROM quiz_attempts 
     WHERE user_id = NEW.user_id AND lesson_id = NEW.lesson_id),
    1
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to set attempt number
CREATE TRIGGER set_attempt_number
BEFORE INSERT ON quiz_attempts
FOR EACH ROW
EXECUTE FUNCTION calculate_attempt_number();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_quiz_attempts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_quiz_attempts_updated_at_trigger
BEFORE UPDATE ON quiz_attempts
FOR EACH ROW
EXECUTE FUNCTION update_quiz_attempts_updated_at();

-- Enable RLS
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Students can view their own quiz attempts
CREATE POLICY "Students can view own quiz attempts" ON quiz_attempts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Students can create quiz attempts for themselves
CREATE POLICY "Students can create own quiz attempts" ON quiz_attempts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Students can update their own incomplete quiz attempts
CREATE POLICY "Students can update own incomplete quiz attempts" ON quiz_attempts
  FOR UPDATE
  USING (auth.uid() = user_id AND completed_at IS NULL);

-- Instructors can view quiz attempts for their courses
CREATE POLICY "Instructors can view course quiz attempts" ON quiz_attempts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = quiz_attempts.course_id
      AND courses.instructor_id = auth.uid()
    )
  );

-- Add comment
COMMENT ON TABLE quiz_attempts IS 'Stores quiz attempt records for students';
COMMENT ON COLUMN quiz_attempts.attempt_number IS 'Auto-calculated attempt number for each user-lesson combination';
COMMENT ON COLUMN quiz_attempts.time_spent_seconds IS 'Time spent on the quiz in seconds';
COMMENT ON COLUMN quiz_attempts.percentage IS 'Auto-calculated percentage score';
COMMENT ON COLUMN quiz_attempts.answers IS 'JSON object storing answers and results for each question';