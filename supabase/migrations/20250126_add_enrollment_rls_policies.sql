-- =====================================================================
-- Enrollments RLS Policies Migration
-- =====================================================================
-- This migration adds Row Level Security (RLS) policies for the enrollments table
-- to ensure proper access control for instructors and students

-- 1) Enable RLS on enrollments table
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- 2) Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "instructors_can_read_enrollments_for_their_courses" ON public.enrollments;
DROP POLICY IF EXISTS "students_can_read_own_enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "students_can_insert_own_enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "students_can_update_own_enrollments" ON public.enrollments;

-- 3) Create policy: Instructors can read enrollments for their courses
CREATE POLICY "instructors_can_read_enrollments_for_their_courses"
ON public.enrollments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.courses c
    WHERE c.id = enrollments.course_id
      AND c.instructor_id = auth.uid()
  )
);

-- 4) Create policy: Students can read their own enrollments
CREATE POLICY "students_can_read_own_enrollments"
ON public.enrollments
FOR SELECT
TO authenticated
USING (enrollments.user_id = auth.uid());

-- 5) Create policy: Students can insert their own enrollments
CREATE POLICY "students_can_insert_own_enrollments"
ON public.enrollments
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- 6) Create policy: Students can update their own enrollments (for progress tracking)
CREATE POLICY "students_can_update_own_enrollments"
ON public.enrollments
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 7) Enable RLS on courses table if not already enabled
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- 8) Drop existing course policies if they exist
DROP POLICY IF EXISTS "instructors_can_read_own_courses" ON public.courses;
DROP POLICY IF EXISTS "public_can_read_published_courses" ON public.courses;
DROP POLICY IF EXISTS "instructors_can_manage_own_courses" ON public.courses;

-- 9) Create policy: Instructors can read their own courses
CREATE POLICY "instructors_can_read_own_courses"
ON public.courses
FOR SELECT
TO authenticated
USING (
  instructor_id = auth.uid()
  OR status = 'published'
  OR EXISTS (
    SELECT 1 FROM public."user" u
    WHERE u.id = auth.uid()
    AND u.role = 'admin'
  )
);

-- 10) Create policy: Public can read published courses
CREATE POLICY "public_can_read_published_courses"
ON public.courses
FOR SELECT
TO anon
USING (status = 'published' AND is_public = true);

-- 11) Create policy: Instructors can manage their own courses
CREATE POLICY "instructors_can_manage_own_courses"
ON public.courses
FOR ALL
TO authenticated
USING (instructor_id = auth.uid())
WITH CHECK (instructor_id = auth.uid());

-- 12) Create policy for user table to allow joining in queries
ALTER TABLE public."user" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_can_read_basic_info" ON public."user";
DROP POLICY IF EXISTS "users_can_update_own_profile" ON public."user";

-- 13) Allow reading basic user info for enrolled students (for instructors)
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

-- 14) Users can update their own profile
CREATE POLICY "users_can_update_own_profile"
ON public."user"
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- 15) Add helpful comments
COMMENT ON POLICY "instructors_can_read_enrollments_for_their_courses" ON public.enrollments
  IS 'Allows instructors to view all enrollments for courses they teach';

COMMENT ON POLICY "students_can_read_own_enrollments" ON public.enrollments
  IS 'Allows students to view their own course enrollments';

COMMENT ON POLICY "instructors_can_read_own_courses" ON public.courses
  IS 'Allows instructors to read their own courses and all published courses';

COMMENT ON POLICY "users_can_read_basic_info" ON public."user"
  IS 'Allows instructors to read basic info of students enrolled in their courses';

-- 16) Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON public.enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON public.enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_courses_instructor_id ON public.courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_courses_status ON public.courses(status);

-- Note: These policies ensure that:
-- 1. Instructors can only see enrollments for courses they teach
-- 2. Students can only see and manage their own enrollments
-- 3. The join queries in getInstructorEnrolledStudents will work properly
-- 4. Basic user information is accessible for enrolled students display