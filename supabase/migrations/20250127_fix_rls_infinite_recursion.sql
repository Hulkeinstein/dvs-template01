-- =====================================================================
-- Fix RLS Infinite Recursion Issue
-- =====================================================================
-- This migration fixes the infinite recursion error in the user table RLS policy
-- The error was caused by the admin check querying the same user table recursively

-- 1) Drop the problematic policy
DROP POLICY IF EXISTS "users_can_read_basic_info" ON public."user";

-- 2) Recreate the policy without recursive admin check
CREATE POLICY "users_can_read_basic_info"
ON public."user"
FOR SELECT
TO authenticated
USING (
  -- Users can read their own full profile
  id = auth.uid()
  OR
  -- Instructors can read basic info of students enrolled in their courses
  EXISTS (
    SELECT 1
    FROM public.enrollments e
    JOIN public.courses c ON c.id = e.course_id
    WHERE e.user_id = "user".id
      AND c.instructor_id = auth.uid()
  )
);

-- Note: Admin role check was removed to prevent infinite recursion
-- Admins with instructor role can still see enrolled students through the instructor check
-- For full admin access, a separate admin-specific policy can be added later if needed