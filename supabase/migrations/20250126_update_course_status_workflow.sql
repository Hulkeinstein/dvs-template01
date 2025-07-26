-- Update course status workflow to support 5 states
-- draft -> pending -> published -> unpublished -> archived

-- First, update any existing 'active' status to 'published'
UPDATE courses 
SET status = 'published' 
WHERE status = 'active';

-- Drop the existing check constraint
ALTER TABLE courses 
DROP CONSTRAINT IF EXISTS courses_status_check;

-- Add new check constraint with 5 status values
ALTER TABLE courses 
ADD CONSTRAINT courses_status_check 
CHECK (status IN ('draft', 'pending', 'published', 'unpublished', 'archived'));

-- Add comment to explain the workflow
COMMENT ON COLUMN courses.status IS 'Course status workflow: draft -> pending -> published -> unpublished -> archived';