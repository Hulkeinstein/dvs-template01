-- Helper functions for lesson progress with atomic operations
BEGIN;

-- Atomic upsert function (CRITICAL for race condition prevention)
CREATE OR REPLACE FUNCTION upsert_lesson_progress_atomic(
  p_user_id UUID,
  p_lesson_id UUID,
  p_enrollment_id UUID,
  p_status TEXT,
  p_progress INT,
  p_time_spent INT DEFAULT 0
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  v_course_id UUID;
BEGIN
  -- Get course_id from enrollment with validation
  SELECT course_id INTO v_course_id
  FROM enrollments
  WHERE id = p_enrollment_id
    AND (
      user_id = p_user_id 
      OR 
      auth.uid() = p_user_id
      OR
      (auth.jwt() ->> 'role')::text = 'service_role'
    );

  IF v_course_id IS NULL THEN
    RAISE EXCEPTION 'Invalid enrollment_id or unauthorized: %', p_enrollment_id;
  END IF;

  -- Atomic upsert of lesson_progress
  INSERT INTO lesson_progress (
    user_id, 
    lesson_id, 
    enrollment_id, 
    course_id, 
    status, 
    progress_percentage, 
    time_spent_seconds, 
    last_accessed_at, 
    completed_at
  ) VALUES (
    p_user_id,
    p_lesson_id,
    p_enrollment_id,
    v_course_id,
    p_status,
    p_progress,
    COALESCE(p_time_spent, 0),
    NOW(),
    CASE WHEN p_status = 'completed' THEN NOW() ELSE NULL END
  )
  ON CONFLICT (user_id, lesson_id)
  DO UPDATE SET
    status = EXCLUDED.status,
    progress_percentage = EXCLUDED.progress_percentage,
    time_spent_seconds = lesson_progress.time_spent_seconds + COALESCE(EXCLUDED.time_spent_seconds, 0),
    last_accessed_at = NOW(),
    completed_at = CASE 
      WHEN EXCLUDED.status = 'completed' THEN NOW() 
      ELSE lesson_progress.completed_at 
    END,
    updated_at = NOW();

  -- Update enrollment progress atomically
  PERFORM update_enrollment_progress_from_lessons(p_enrollment_id);
END;
$$;

-- Helper function to update enrollment progress
CREATE OR REPLACE FUNCTION update_enrollment_progress_from_lessons(p_enrollment_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  v_progress INT;
BEGIN
  -- Calculate progress from lesson_progress
  SELECT 
    CASE 
      WHEN COUNT(l.id) > 0 
      THEN (COUNT(CASE WHEN lp.status = 'completed' THEN 1 END) * 100 / COUNT(l.id))::INT
      ELSE 0
    END INTO v_progress
  FROM enrollments e
  JOIN lessons l ON l.course_id = e.course_id
  LEFT JOIN lesson_progress lp ON lp.lesson_id = l.id AND lp.enrollment_id = e.id
  WHERE e.id = p_enrollment_id;

  -- Update enrollment
  UPDATE enrollments 
  SET 
    progress = v_progress,
    completed_at = CASE WHEN v_progress >= 100 THEN NOW() ELSE NULL END,
    updated_at = NOW()
  WHERE id = p_enrollment_id;
END;
$$;

-- Calculate course progress
CREATE OR REPLACE FUNCTION calculate_course_progress(p_enrollment_id UUID)
RETURNS TABLE (
  total_lessons INTEGER,
  completed_lessons INTEGER,
  progress_percentage INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(l.id)::INTEGER as total_lessons,
    COUNT(CASE WHEN lp.status = 'completed' THEN 1 END)::INTEGER as completed_lessons,
    CASE 
      WHEN COUNT(l.id) > 0 
      THEN (COUNT(CASE WHEN lp.status = 'completed' THEN 1 END) * 100 / COUNT(l.id))::INTEGER
      ELSE 0
    END as progress_percentage
  FROM enrollments e
  JOIN lessons l ON l.course_id = e.course_id
  LEFT JOIN lesson_progress lp ON lp.lesson_id = l.id AND lp.enrollment_id = e.id
  WHERE e.id = p_enrollment_id;
END;
$$;

-- Get next lesson
CREATE OR REPLACE FUNCTION get_next_lesson(p_enrollment_id UUID)
RETURNS UUID 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  v_next_lesson_id UUID;
BEGIN
  SELECT l.id INTO v_next_lesson_id
  FROM enrollments e
  JOIN lessons l ON l.course_id = e.course_id
  LEFT JOIN lesson_progress lp ON lp.lesson_id = l.id AND lp.enrollment_id = e.id
  WHERE e.id = p_enrollment_id
    AND (lp.status IS NULL OR lp.status != 'completed')
  ORDER BY l.order_index
  LIMIT 1;
  
  RETURN v_next_lesson_id;
END;
$$;

-- Restrict function permissions
REVOKE ALL ON FUNCTION upsert_lesson_progress_atomic(UUID,UUID,UUID,TEXT,INT,INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION upsert_lesson_progress_atomic(UUID,UUID,UUID,TEXT,INT,INT) TO authenticated, service_role;

REVOKE ALL ON FUNCTION update_enrollment_progress_from_lessons(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION update_enrollment_progress_from_lessons(UUID) TO authenticated, service_role;

REVOKE ALL ON FUNCTION calculate_course_progress(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION calculate_course_progress(UUID) TO authenticated, service_role;

REVOKE ALL ON FUNCTION get_next_lesson(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_next_lesson(UUID) TO authenticated, service_role;

COMMIT;

-- Rollback: DROP FUNCTION IF EXISTS upsert_lesson_progress_atomic, update_enrollment_progress_from_lessons, calculate_course_progress, get_next_lesson CASCADE;