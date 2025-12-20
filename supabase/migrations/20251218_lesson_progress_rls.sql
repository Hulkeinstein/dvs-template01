-- Enable RLS on lesson_progress table
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own progress
CREATE POLICY "Users can view own progress" ON lesson_progress
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own progress
CREATE POLICY "Users can insert own progress" ON lesson_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own progress
CREATE POLICY "Users can update own progress" ON lesson_progress
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own progress (if needed)
CREATE POLICY "Users can delete own progress" ON lesson_progress
  FOR DELETE
  USING (auth.uid() = user_id);
