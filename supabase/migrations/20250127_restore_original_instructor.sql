-- =====================================================================
-- Restore Original Instructor ID for Courses
-- =====================================================================
-- This migration restores the courses to the original instructor account

-- Original owner: jangkamwoo@gmail.com (34e0f138-0703-45c3-8c2a-a56edb171c4b)
-- Mistakenly changed to: info@danielvisionschool.org (58bf84be-be24-4866-bf40-6278510aeaa3)

-- Restore all courses to the original instructor
UPDATE public.courses
SET instructor_id = '34e0f138-0703-45c3-8c2a-a56edb171c4b'
WHERE instructor_id = '58bf84be-be24-4866-bf40-6278510aeaa3';

-- Verify the update
SELECT
  title,
  instructor_id,
  status,
  CASE
    WHEN instructor_id = '34e0f138-0703-45c3-8c2a-a56edb171c4b' THEN '✅ Restored to jangkamwoo@gmail.com'
    ELSE '❌ Different instructor'
  END as verification
FROM public.courses
ORDER BY created_at DESC;