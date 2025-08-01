-- Add order_index column to lessons table
ALTER TABLE lessons 
ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_lessons_order ON lessons(course_id, topic_id, order_index);

-- Update existing lessons with order index based on created_at
WITH ordered_lessons AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (
      PARTITION BY course_id, topic_id 
      ORDER BY created_at
    ) - 1 as new_order
  FROM lessons
  WHERE order_index IS NULL OR order_index = 0
)
UPDATE lessons
SET order_index = ordered_lessons.new_order
FROM ordered_lessons
WHERE lessons.id = ordered_lessons.id;