-- Migration: Add UNIQUE constraint to enrollments table
-- Purpose: Prevent duplicate course enrollments at DB level
-- Issue: #58 - Payment Security Upgrade
-- Date: 2025-12-13

-- Check for duplicates before adding constraint (safety check)
DO $$
DECLARE
  duplicate_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO duplicate_count
  FROM (
    SELECT user_id, course_id, COUNT(*) as cnt
    FROM enrollments
    GROUP BY user_id, course_id
    HAVING COUNT(*) > 1
  ) as duplicates;

  IF duplicate_count > 0 THEN
    RAISE EXCEPTION 'Found % duplicate enrollment(s). Please clean up duplicates before running this migration.', duplicate_count;
  END IF;
END $$;

-- Add UNIQUE constraint
ALTER TABLE enrollments
ADD CONSTRAINT unique_user_course UNIQUE (user_id, course_id);

-- Add comment for documentation
COMMENT ON CONSTRAINT unique_user_course ON enrollments IS
  'Prevents duplicate course enrollments. Added for payment security (#58).';
