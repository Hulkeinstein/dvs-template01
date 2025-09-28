-- =====================================================================
-- Check and Fix ALL User Table RLS Policies
-- =====================================================================
-- This migration checks all existing policies and recreates them properly

-- 1) First, let's see what policies exist on the user table
SELECT
  pol.polname as policy_name,
  CASE pol.polcmd
    WHEN 'r' THEN 'SELECT'
    WHEN 'a' THEN 'INSERT'
    WHEN 'w' THEN 'UPDATE'
    WHEN 'd' THEN 'DELETE'
    ELSE 'ALL'
  END as command,
  pol.polroles::regrole[] as roles,
  pg_get_expr(pol.polqual, pol.polrelid) as using_expression,
  pg_get_expr(pol.polwithcheck, pol.polrelid) as with_check
FROM pg_policy pol
JOIN pg_class cls ON pol.polrelid = cls.oid
JOIN pg_namespace nsp ON cls.relnamespace = nsp.oid
WHERE nsp.nspname = 'public'
  AND cls.relname = 'user';

-- 2) Drop ALL existing policies on user table to start fresh
DROP POLICY IF EXISTS "users_can_read_basic_info" ON public."user";
DROP POLICY IF EXISTS "users_can_update_own_profile" ON public."user";
DROP POLICY IF EXISTS "Users can view own profile" ON public."user";
DROP POLICY IF EXISTS "Users can update own profile" ON public."user";
DROP POLICY IF EXISTS "Enable read access for all users" ON public."user";
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public."user";
DROP POLICY IF EXISTS "Enable update for users based on email" ON public."user";

-- 3) Create clean, non-recursive policies

-- Allow users to read their own profile
CREATE POLICY "users_read_own_profile"
ON public."user"
FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Allow users to read other users' basic info (for instructor view of enrolled students)
CREATE POLICY "instructors_read_enrolled_students"
ON public."user"
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.enrollments e
    JOIN public.courses c ON c.id = e.course_id
    WHERE e.user_id = "user".id
      AND c.instructor_id = auth.uid()
  )
);

-- Allow users to update their own profile
CREATE POLICY "users_update_own_profile"
ON public."user"
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Allow anonymous read for public profiles (optional, can be removed if not needed)
-- CREATE POLICY "anon_read_public_profiles"
-- ON public."user"
-- FOR SELECT
-- TO anon
-- USING (is_profile_complete = true);

-- 4) Verify the policies are created
SELECT
  pol.polname as policy_name,
  CASE pol.polcmd
    WHEN 'r' THEN 'SELECT'
    WHEN 'a' THEN 'INSERT'
    WHEN 'w' THEN 'UPDATE'
    WHEN 'd' THEN 'DELETE'
    ELSE 'ALL'
  END as command
FROM pg_policy pol
JOIN pg_class cls ON pol.polrelid = cls.oid
JOIN pg_namespace nsp ON cls.relnamespace = nsp.oid
WHERE nsp.nspname = 'public'
  AND cls.relname = 'user';