-- =====================================================================
-- Fix Instructor IDs for Courses
-- =====================================================================
-- Update all courses to have the correct instructor_id

-- Current situation:
-- User email: info@danielvisionschool.org
-- User ID: 58bf84be-be24-4866-bf40-6278510aeaa3
-- All courses currently have instructor_id: 34e0f138-0703-45c3-8c2a-a56edb171c4b

-- Update all courses to the correct instructor
UPDATE public.courses
SET instructor_id = '58bf84be-be24-4866-bf40-6278510aeaa3'
WHERE instructor_id = '34e0f138-0703-45c3-8c2a-a56edb171c4b';

-- Verify the update
SELECT
  title,
  instructor_id,
  status
FROM public.courses
ORDER BY created_at DESC;