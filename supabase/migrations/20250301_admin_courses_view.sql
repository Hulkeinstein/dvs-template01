-- Admin Course Management View
-- Creates a view for admin dashboard to see all courses with instructor information

-- Create view for admin course management
CREATE OR REPLACE VIEW admin_courses_view AS
SELECT 
  c.id,
  c.title,
  c.slug,
  c.thumbnail_url,
  c.category,
  c.price,
  c.regular_price,
  c.discounted_price,
  c.status,
  c.is_featured,
  c.created_at,
  c.updated_at,
  c.published_at,
  c.instructor_id,
  c.difficulty_level,
  c.language,
  c.total_duration_hours,
  c.max_students,
  c.enrollment_count,
  c.weekly_enrollment_count,
  c.monthly_enrollment_count,
  -- Instructor information as JSON
  jsonb_build_object(
    'id', u.id,
    'name', COALESCE(u.name, u.first_name || ' ' || u.last_name, u.email),
    'email', u.email,
    'avatar_url', COALESCE(u.avatar_url, u.photo_url),
    'role', u.role
  ) as instructor_info,
  -- Real-time enrollment count
  (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id AND e.deleted_at IS NULL) as actual_enrollment_count,
  -- Active enrollments
  (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id AND e.status = 'active' AND e.deleted_at IS NULL) as active_enrollment_count,
  -- Revenue calculation
  (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id AND e.deleted_at IS NULL) * COALESCE(c.price, 0) as estimated_revenue
FROM courses c
LEFT JOIN "user" u ON u.id = c.instructor_id
WHERE c.deleted_at IS NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_courses_instructor ON courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_courses_created ON courses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_is_featured ON courses(is_featured);

-- Grant access to authenticated users (admin check will be done in application)
GRANT SELECT ON admin_courses_view TO authenticated;

-- Comment for documentation
COMMENT ON VIEW admin_courses_view IS 'Admin view for course management with instructor information and enrollment statistics';