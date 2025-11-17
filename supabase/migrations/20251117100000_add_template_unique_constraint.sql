-- Add UNIQUE constraint to prevent duplicate template names per instructor
-- Migration: 2025-11-17
-- Purpose: Ensure each instructor has unique template names

-- Add UNIQUE constraint
ALTER TABLE assignment_templates
  ADD CONSTRAINT uq_assignment_templates_owner_name
  UNIQUE (instructor_id, name);

-- Add helpful comment
COMMENT ON CONSTRAINT uq_assignment_templates_owner_name ON assignment_templates
IS 'Prevents duplicate template names for the same instructor. Different instructors can use the same template name.';
