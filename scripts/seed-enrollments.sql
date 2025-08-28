-- Script to seed test enrollment data
-- Run this in Supabase SQL Editor to create sample enrolled students

-- First, ensure we have some test users (students)
-- Note: These users should already exist from auth.users
-- This script assumes you have at least one instructor with courses

-- Get an instructor's course (adjust the email as needed)
DO $$
DECLARE
    instructor_id UUID;
    course_id UUID;
    student_id UUID;
BEGIN
    -- Get an instructor
    SELECT id INTO instructor_id 
    FROM "user" 
    WHERE role = 'instructor' 
    LIMIT 1;
    
    IF instructor_id IS NULL THEN
        RAISE NOTICE 'No instructor found. Please create an instructor first.';
        RETURN;
    END IF;
    
    -- Get a course from this instructor
    SELECT id INTO course_id
    FROM courses
    WHERE instructor_id = instructor_id
    AND status = 'active'
    LIMIT 1;
    
    IF course_id IS NULL THEN
        RAISE NOTICE 'No active course found for instructor. Please create a course first.';
        RETURN;
    END IF;
    
    -- Create sample enrollments with different progress levels
    -- You may need to adjust these user IDs based on your actual users
    
    -- Sample enrollment 1: Just enrolled (0% progress)
    INSERT INTO enrollments (user_id, course_id, progress, status, enrolled_at)
    SELECT id, course_id, 0, 'active', NOW() - INTERVAL '1 day'
    FROM "user"
    WHERE role = 'student'
    AND id NOT IN (SELECT user_id FROM enrollments WHERE course_id = course_id)
    LIMIT 1
    ON CONFLICT (user_id, course_id) DO NOTHING;
    
    -- Sample enrollment 2: Active student (35% progress)
    INSERT INTO enrollments (user_id, course_id, progress, status, enrolled_at, last_accessed_at)
    SELECT id, course_id, 35, 'active', NOW() - INTERVAL '7 days', NOW() - INTERVAL '2 hours'
    FROM "user"
    WHERE role = 'student'
    AND id NOT IN (SELECT user_id FROM enrollments WHERE course_id = course_id)
    LIMIT 1
    ON CONFLICT (user_id, course_id) DO NOTHING;
    
    -- Sample enrollment 3: Active student (67% progress)
    INSERT INTO enrollments (user_id, course_id, progress, status, enrolled_at, last_accessed_at)
    SELECT id, course_id, 67, 'active', NOW() - INTERVAL '14 days', NOW() - INTERVAL '1 day'
    FROM "user"
    WHERE role = 'student'
    AND id NOT IN (SELECT user_id FROM enrollments WHERE course_id = course_id)
    LIMIT 1
    ON CONFLICT (user_id, course_id) DO NOTHING;
    
    -- Sample enrollment 4: Completed student (100% progress)
    INSERT INTO enrollments (user_id, course_id, progress, status, enrolled_at, completed_at, certificate_issued_at, last_accessed_at)
    SELECT id, course_id, 100, 'completed', NOW() - INTERVAL '30 days', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', NOW() - INTERVAL '5 days'
    FROM "user"
    WHERE role = 'student'
    AND id NOT IN (SELECT user_id FROM enrollments WHERE course_id = course_id)
    LIMIT 1
    ON CONFLICT (user_id, course_id) DO NOTHING;
    
    -- Sample enrollment 5: Dropped student
    INSERT INTO enrollments (user_id, course_id, progress, status, enrolled_at, last_accessed_at)
    SELECT id, course_id, 15, 'dropped', NOW() - INTERVAL '20 days', NOW() - INTERVAL '15 days'
    FROM "user"
    WHERE role = 'student'
    AND id NOT IN (SELECT user_id FROM enrollments WHERE course_id = course_id)
    LIMIT 1
    ON CONFLICT (user_id, course_id) DO NOTHING;
    
    RAISE NOTICE 'Sample enrollments created successfully for course %', course_id;
END $$;

-- Verify the enrollments were created
SELECT 
    e.id,
    e.status,
    e.progress,
    u.email as student_email,
    u.name as student_name,
    c.title as course_title
FROM enrollments e
JOIN "user" u ON e.user_id = u.id
JOIN courses c ON e.course_id = c.id
ORDER BY e.enrolled_at DESC
LIMIT 10;