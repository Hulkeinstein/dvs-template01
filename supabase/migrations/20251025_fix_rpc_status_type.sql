-- =========================================================================
-- Fix RPC function type mismatch (status VARCHAR(50) → text)
-- Date: 2025-10-25
-- Purpose: Cast enrollments.status to text to resolve ERROR 42804
-- Issue: Return type declared as 'text' but actual column is VARCHAR(50)
-- =========================================================================

-- Step 1: Recreate function with type casting
CREATE OR REPLACE FUNCTION get_enrolled_courses_with_progress(p_user_id uuid)
RETURNS TABLE (
  enrollment_id uuid,
  course_id uuid,
  enrolled_at timestamp with time zone,
  last_accessed_at timestamp with time zone,
  status text,
  manual_progress integer,
  course_title text,
  course_description text,
  course_thumbnail text,
  instructor_id uuid,
  instructor_name text,
  instructor_avatar text,
  total_lessons bigint,
  completed_lessons bigint,
  calculated_progress integer
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  WITH course_lessons AS (
    -- Get lesson counts per course
    SELECT
      l.course_id,
      COUNT(DISTINCT l.id) as total_lessons
    FROM lessons l
    WHERE l.course_id IN (
      SELECT e.course_id
      FROM enrollments e
      WHERE e.user_id = p_user_id
        AND e.deleted_at IS NULL
    )
    GROUP BY l.course_id
  ),
  lesson_completion AS (
    -- Get completed lesson counts per enrollment
    SELECT
      lp.enrollment_id,
      COUNT(DISTINCT lp.lesson_id) as completed_lessons
    FROM lesson_progress lp
    WHERE lp.user_id = p_user_id
      AND lp.completed = true
    GROUP BY lp.enrollment_id
  )
  SELECT
    -- Enrollment data
    e.id as enrollment_id,
    e.course_id,
    e.enrolled_at,
    e.last_accessed_at,
    e.status::text as status,  -- ✅ FIXED: Explicit cast to text
    e.progress as manual_progress,

    -- Course data
    c.title as course_title,
    c.description as course_description,
    c.thumbnail_url as course_thumbnail,
    c.instructor_id,

    -- Instructor data
    u.name as instructor_name,
    u.avatar_url::text as instructor_avatar,  -- ✅ FIXED: Cast VARCHAR(500) to text

    -- Progress data
    COALESCE(cl.total_lessons, 0)::bigint as total_lessons,
    COALESCE(lc.completed_lessons, 0)::bigint as completed_lessons,

    -- Calculate progress percentage
    CASE
      WHEN COALESCE(cl.total_lessons, 0) = 0 THEN 0
      ELSE ROUND(
        (COALESCE(lc.completed_lessons, 0)::numeric / cl.total_lessons::numeric) * 100
      )::integer
    END as calculated_progress

  FROM enrollments e
  INNER JOIN courses c ON c.id = e.course_id
  LEFT JOIN "user" u ON u.id = c.instructor_id
  LEFT JOIN course_lessons cl ON cl.course_id = e.course_id
  LEFT JOIN lesson_completion lc ON lc.enrollment_id = e.id

  WHERE e.user_id = p_user_id
    AND e.deleted_at IS NULL

  ORDER BY
    e.last_accessed_at DESC NULLS LAST,
    e.enrolled_at DESC;
END;
$$;

-- Step 2: Grant permissions (ensure access for authenticated users)
GRANT EXECUTE ON FUNCTION get_enrolled_courses_with_progress(uuid) TO anon, authenticated, service_role;

-- =========================================================================
-- Verification Query
-- =========================================================================

-- Verify function exists with correct signature
SELECT
  p.proname as function_name,
  p.pronargs as num_parameters,
  pg_get_function_arguments(p.oid) as parameters,
  pg_get_function_result(p.oid) as return_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'get_enrolled_courses_with_progress'
  AND n.nspname = 'public';

-- Expected result:
-- function_name: get_enrolled_courses_with_progress
-- num_parameters: 1
-- parameters: p_user_id uuid
-- return_type: TABLE(enrollment_id uuid, ..., status text, ...)

-- =========================================================================
-- Test Query
-- =========================================================================

-- Test with a real user_id (replace with actual user)
-- SELECT * FROM get_enrolled_courses_with_progress('user-uuid-here');
