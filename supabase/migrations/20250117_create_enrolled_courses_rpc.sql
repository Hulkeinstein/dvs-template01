-- =============================================
-- RPC Function: get_enrolled_courses_with_progress
-- Purpose: Efficiently fetch enrolled courses with progress data
-- Created: 2025-01-17
-- =============================================

CREATE OR REPLACE FUNCTION public.get_enrolled_courses_with_progress(p_user_id uuid)
RETURNS TABLE (
  enrollment_id uuid,
  course_id uuid,
  enrolled_at timestamptz,
  last_accessed_at timestamptz,
  status text,
  manual_progress integer,

  -- Course details
  course_title text,
  course_description text,
  course_thumbnail text,
  instructor_id uuid,

  -- Instructor details
  instructor_name text,
  instructor_avatar text,

  -- Progress calculations
  total_lessons bigint,
  completed_lessons bigint,
  calculated_progress integer
)
LANGUAGE plpgsql
SECURITY DEFINER
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
    e.status,
    e.progress as manual_progress,

    -- Course data
    c.title as course_title,
    c.description as course_description,
    c.thumbnail_url as course_thumbnail,
    c.instructor_id,

    -- Instructor data
    u.name as instructor_name,
    u.avatar_url as instructor_avatar,

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

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_enrolled_courses_with_progress(uuid) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION public.get_enrolled_courses_with_progress(uuid) IS
'Fetches all enrolled courses for a user with calculated progress, instructor details, and lesson counts. Optimized to avoid N+1 queries.';

-- =============================================
-- Indexes to optimize the RPC function
-- =============================================

-- Ensure we have proper indexes for the queries
CREATE INDEX IF NOT EXISTS idx_enrollments_user_deleted
  ON enrollments(user_id, deleted_at);

CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_enrollment
  ON lesson_progress(user_id, enrollment_id)
  WHERE completed = true;

CREATE INDEX IF NOT EXISTS idx_lessons_course_id
  ON lessons(course_id);