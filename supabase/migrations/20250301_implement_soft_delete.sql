-- =============================================
-- Soft Delete Implementation for DVS-TEMPLATE01
-- =============================================
-- This migration implements enterprise-grade soft delete functionality
-- with audit logging and data snapshots for compliance and recovery

-- =============================================
-- PART 1: Add deleted_at columns to existing tables
-- =============================================

-- Add deleted_at to courses table (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'courses' AND column_name = 'deleted_at'
    ) THEN
        ALTER TABLE courses ADD COLUMN deleted_at TIMESTAMPTZ;
        COMMENT ON COLUMN courses.deleted_at IS 'Soft delete timestamp - when set, record is considered deleted';
    END IF;
END $$;

-- Add deleted_at to lessons table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'lessons' AND column_name = 'deleted_at'
    ) THEN
        ALTER TABLE lessons ADD COLUMN deleted_at TIMESTAMPTZ;
        COMMENT ON COLUMN lessons.deleted_at IS 'Soft delete timestamp';
    END IF;
END $$;

-- Add deleted_at to enrollments table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'enrollments' AND column_name = 'deleted_at'
    ) THEN
        ALTER TABLE enrollments ADD COLUMN deleted_at TIMESTAMPTZ;
        COMMENT ON COLUMN enrollments.deleted_at IS 'Soft delete timestamp';
    END IF;
END $$;

-- Add deleted_at to course_topics table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'course_topics' AND column_name = 'deleted_at'
    ) THEN
        ALTER TABLE course_topics ADD COLUMN deleted_at TIMESTAMPTZ;
        COMMENT ON COLUMN course_topics.deleted_at IS 'Soft delete timestamp';
    END IF;
END $$;

-- Add deleted_at to quiz_attempts table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'quiz_attempts' AND column_name = 'deleted_at'
    ) THEN
        ALTER TABLE quiz_attempts ADD COLUMN deleted_at TIMESTAMPTZ;
        COMMENT ON COLUMN quiz_attempts.deleted_at IS 'Soft delete timestamp';
    END IF;
END $$;

-- =============================================
-- PART 2: Create indexes for performance
-- =============================================

CREATE INDEX IF NOT EXISTS idx_courses_deleted_at ON courses(deleted_at);
CREATE INDEX IF NOT EXISTS idx_lessons_deleted_at ON lessons(deleted_at);
CREATE INDEX IF NOT EXISTS idx_enrollments_deleted_at ON enrollments(deleted_at);
CREATE INDEX IF NOT EXISTS idx_course_topics_deleted_at ON course_topics(deleted_at);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_deleted_at ON quiz_attempts(deleted_at);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_courses_status_deleted_at ON courses(status, deleted_at);
CREATE INDEX IF NOT EXISTS idx_courses_instructor_deleted_at ON courses(instructor_id, deleted_at);

-- =============================================
-- PART 3: Create audit log table
-- =============================================

CREATE TABLE IF NOT EXISTS audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    table_name VARCHAR(255) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL, -- INSERT, UPDATE, DELETE, SOFT_DELETE, RESTORE
    user_id UUID,
    user_email TEXT,
    changes JSONB, -- Stores the before/after values
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for audit_log table
CREATE INDEX IF NOT EXISTS idx_audit_log_table_record ON audit_log(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log(created_at);

COMMENT ON TABLE audit_log IS 'Audit trail for all data modifications - required for compliance';

-- =============================================
-- PART 4: Create snapshots table for deleted courses
-- =============================================

CREATE TABLE IF NOT EXISTS course_snapshots (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID NOT NULL,
    snapshot_data JSONB NOT NULL, -- Complete course data at deletion time
    deleted_by UUID,
    deleted_at TIMESTAMPTZ DEFAULT NOW(),
    reason TEXT,
    can_restore BOOLEAN DEFAULT true,
    restored_at TIMESTAMPTZ
);

-- Create indexes for course_snapshots table
CREATE INDEX IF NOT EXISTS idx_snapshots_course ON course_snapshots(course_id);
CREATE INDEX IF NOT EXISTS idx_snapshots_deleted_at ON course_snapshots(deleted_at);

COMMENT ON TABLE course_snapshots IS 'Preserves complete course data when soft deleted for recovery and compliance';

-- =============================================
-- PART 5: Update RLS policies to exclude soft deleted records
-- =============================================

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can view published courses" ON courses;
DROP POLICY IF EXISTS "Instructors can manage their courses" ON courses;
DROP POLICY IF EXISTS "Users can view lessons" ON lessons;
DROP POLICY IF EXISTS "Instructors can manage lessons" ON lessons;

-- Recreate policies with soft delete awareness
CREATE POLICY "Users can view published courses" ON courses
    FOR SELECT
    USING (
        deleted_at IS NULL AND (
            status = 'published' OR 
            auth.uid() = instructor_id
        )
    );

CREATE POLICY "Instructors can manage their courses" ON courses
    FOR ALL
    USING (auth.uid() = instructor_id)
    WITH CHECK (auth.uid() = instructor_id);

CREATE POLICY "Users can view lessons" ON lessons
    FOR SELECT
    USING (
        deleted_at IS NULL AND
        EXISTS (
            SELECT 1 FROM courses 
            WHERE courses.id = lessons.course_id 
            AND courses.deleted_at IS NULL
            AND (courses.status = 'published' OR courses.instructor_id = auth.uid())
        )
    );

CREATE POLICY "Instructors can manage lessons" ON lessons
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM courses 
            WHERE courses.id = lessons.course_id 
            AND courses.instructor_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM courses 
            WHERE courses.id = lessons.course_id 
            AND courses.instructor_id = auth.uid()
        )
    );

-- =============================================
-- PART 6: Create views for active (non-deleted) records
-- =============================================

-- Active courses view
CREATE OR REPLACE VIEW active_courses AS
SELECT * FROM courses 
WHERE deleted_at IS NULL;

COMMENT ON VIEW active_courses IS 'View of all non-deleted courses for easy querying';

-- Active lessons view
CREATE OR REPLACE VIEW active_lessons AS
SELECT l.* FROM lessons l
JOIN courses c ON l.course_id = c.id
WHERE l.deleted_at IS NULL 
AND c.deleted_at IS NULL;

COMMENT ON VIEW active_lessons IS 'View of all non-deleted lessons from non-deleted courses';

-- Active enrollments view
CREATE OR REPLACE VIEW active_enrollments AS
SELECT e.* FROM enrollments e
JOIN courses c ON e.course_id = c.id
WHERE e.deleted_at IS NULL 
AND c.deleted_at IS NULL;

COMMENT ON VIEW active_enrollments IS 'View of all active enrollments for non-deleted courses';

-- =============================================
-- PART 7: Create utility functions
-- =============================================

-- Function to soft delete a course and cascade
CREATE OR REPLACE FUNCTION soft_delete_course(course_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
    deletion_time TIMESTAMPTZ := NOW();
BEGIN
    -- Update course
    UPDATE courses 
    SET deleted_at = deletion_time,
        status = 'deleted',
        updated_at = deletion_time
    WHERE id = course_id_param;
    
    -- Cascade to related tables
    UPDATE lessons 
    SET deleted_at = deletion_time 
    WHERE course_id = course_id_param;
    
    UPDATE course_topics 
    SET deleted_at = deletion_time 
    WHERE course_id = course_id_param;
    
    -- Log to audit
    INSERT INTO audit_log (table_name, record_id, action, user_id)
    VALUES ('courses', course_id_param, 'SOFT_DELETE', auth.uid());
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to restore a soft deleted course
CREATE OR REPLACE FUNCTION restore_course(course_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Restore course
    UPDATE courses 
    SET deleted_at = NULL,
        status = 'draft',
        updated_at = NOW()
    WHERE id = course_id_param 
    AND deleted_at IS NOT NULL;
    
    -- Restore related records
    UPDATE lessons 
    SET deleted_at = NULL 
    WHERE course_id = course_id_param;
    
    UPDATE course_topics 
    SET deleted_at = NULL 
    WHERE course_id = course_id_param;
    
    -- Log to audit
    INSERT INTO audit_log (table_name, record_id, action, user_id)
    VALUES ('courses', course_id_param, 'RESTORE', auth.uid());
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- PART 8: Update foreign key constraints
-- =============================================

-- Remove CASCADE DELETE from orders table (preserve purchase history)
ALTER TABLE orders 
DROP CONSTRAINT IF EXISTS orders_course_id_fkey;

ALTER TABLE orders 
ADD CONSTRAINT orders_course_id_fkey 
FOREIGN KEY (course_id) 
REFERENCES courses(id) 
ON DELETE RESTRICT; -- Prevent deletion if orders exist

-- =============================================
-- PART 9: Create cleanup job (optional - for hard delete after retention period)
-- =============================================

-- Function to permanently delete old soft-deleted records (e.g., after 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_deleted_records()
RETURNS void AS $$
DECLARE
    retention_days INTEGER := 90; -- Configurable retention period
    cutoff_date TIMESTAMPTZ := NOW() - INTERVAL '1 day' * retention_days;
BEGIN
    -- First, save to snapshots if not already saved
    INSERT INTO course_snapshots (course_id, snapshot_data, deleted_by)
    SELECT 
        c.id,
        row_to_json(c),
        c.instructor_id
    FROM courses c
    WHERE c.deleted_at < cutoff_date
    AND c.deleted_at IS NOT NULL
    AND NOT EXISTS (
        SELECT 1 FROM course_snapshots cs 
        WHERE cs.course_id = c.id
    );
    
    -- Then perform hard delete (optional - uncomment if needed)
    -- DELETE FROM courses WHERE deleted_at < cutoff_date;
    
    -- Log cleanup
    INSERT INTO audit_log (table_name, action, changes)
    VALUES ('courses', 'CLEANUP', jsonb_build_object('cutoff_date', cutoff_date));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- PART 10: Grant permissions
-- =============================================

-- Grant necessary permissions to authenticated users
GRANT SELECT ON active_courses TO authenticated;
GRANT SELECT ON active_lessons TO authenticated;
GRANT SELECT ON active_enrollments TO authenticated;
GRANT SELECT ON audit_log TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION soft_delete_course(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION restore_course(UUID) TO authenticated;

-- =============================================
-- Migration completed successfully
-- =============================================

-- Add migration metadata (only if table exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'migrations_metadata'
    ) THEN
        INSERT INTO migrations_metadata (name, version, executed_at, description)
        VALUES (
            '20250301_implement_soft_delete',
            '1.0.0',
            NOW(),
            'Implements enterprise-grade soft delete with audit logging and data recovery'
        ) ON CONFLICT DO NOTHING;
    END IF;
END $$;