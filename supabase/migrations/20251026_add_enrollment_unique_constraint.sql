-- =========================================================================
-- Migration: Add UNIQUE constraint to enrollments table
-- Date: 2025-10-26
-- Purpose: Prevent duplicate enrollments (duplicate payment prevention)
-- Part of: Phase 1 Core Platform - Duplicate Payment Prevention System
-- =========================================================================

-- Add UNIQUE constraint to prevent duplicate enrollments
-- This is the physical defense layer (Layer 4) that prevents duplicate
-- enrollments even if application logic fails or race conditions occur
ALTER TABLE enrollments
ADD CONSTRAINT uq_user_course_enrollment
UNIQUE (user_id, course_id);

-- Note: This constraint will fail if duplicate enrollments already exist.
-- If migration fails, clean up duplicates first:
--
-- -- Find duplicates
-- SELECT user_id, course_id, COUNT(*)
-- FROM enrollments
-- GROUP BY user_id, course_id
-- HAVING COUNT(*) > 1;
--
-- -- Keep only the earliest enrollment, delete others
-- DELETE FROM enrollments a
-- USING enrollments b
-- WHERE a.id > b.id
--   AND a.user_id = b.user_id
--   AND a.course_id = b.course_id;
