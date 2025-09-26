-- =====================================================================
-- Clean and Rebuild User Table RLS Policies
-- =====================================================================
-- Remove ALL existing policies and create clean ones

-- 1) Drop ALL existing policies on user table
DROP POLICY IF EXISTS "Allow insert own user" ON public."user";
DROP POLICY IF EXISTS "Allow select own user" ON public."user";
DROP POLICY IF EXISTS "Allow update own user" ON public."user";
DROP POLICY IF EXISTS "Service role full access" ON public."user";
DROP POLICY IF EXISTS "users_update_own_profile" ON public."user";
DROP POLICY IF EXISTS "Admins can view all users" ON public."user";
DROP POLICY IF EXISTS "Admins can update user roles" ON public."user";
DROP POLICY IF EXISTS "users_read_own_profile" ON public."user";
DROP POLICY IF EXISTS "instructors_read_enrolled_students" ON public."user";
DROP POLICY IF EXISTS "users_can_read_basic_info" ON public."user";
DROP POLICY IF EXISTS "users_can_update_own_profile" ON public."user";

-- 2) Create NEW clean policies (only the necessary ones)

-- Policy 1: Users can read their own profile
CREATE POLICY "user_read_own"
ON public."user"
FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Policy 2: Instructors can read students enrolled in their courses
CREATE POLICY "instructor_read_students"
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

-- Policy 3: Users can update their own profile
CREATE POLICY "user_update_own"
ON public."user"
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Policy 4: Allow insert for new user creation (during signup)
CREATE POLICY "user_insert_own"
ON public."user"
FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- 3) Verify final policies
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
  AND cls.relname = 'user'
ORDER BY pol.polname;