-- =====================================================================
-- Course Approval Workflow Migration
-- =====================================================================
-- This migration adds fields and constraints for the course approval workflow
-- allowing instructors to submit courses for review and admins to approve/reject

-- 1) Add approval workflow fields
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reviewed_by UUID,
  ADD COLUMN IF NOT EXISTS review_notes TEXT;

-- 2) Add foreign key constraint for reviewer (references user table)
ALTER TABLE public.courses
  DROP CONSTRAINT IF EXISTS courses_reviewed_by_fkey;

ALTER TABLE public.courses
  ADD CONSTRAINT courses_reviewed_by_fkey
  FOREIGN KEY (reviewed_by) REFERENCES public."user"(id) ON DELETE SET NULL;

-- 3) Add indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_courses_status
  ON public.courses(status);

CREATE INDEX IF NOT EXISTS idx_courses_pending
  ON public.courses(status)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_courses_submitted_at
  ON public.courses(submitted_at DESC);

-- 4) Add check constraint for valid status values
ALTER TABLE public.courses
  DROP CONSTRAINT IF EXISTS check_course_status;

ALTER TABLE public.courses
  ADD CONSTRAINT check_course_status
  CHECK (status IN ('draft', 'pending', 'published', 'rejected', 'archived'));

-- 5) Create a function to track status changes (optional, for audit)
CREATE OR REPLACE FUNCTION track_course_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- When status changes to pending, set submitted_at
  IF NEW.status = 'pending' AND OLD.status != 'pending' THEN
    NEW.submitted_at = NOW();
    NEW.review_notes = NULL; -- Clear any previous rejection notes
  END IF;

  -- When status changes to published or rejected, set reviewed_at
  IF (NEW.status IN ('published', 'rejected')) AND
     (OLD.status NOT IN ('published', 'rejected')) THEN
    NEW.reviewed_at = NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6) Create trigger for automatic timestamp updates
DROP TRIGGER IF EXISTS trigger_course_status_change ON public.courses;

CREATE TRIGGER trigger_course_status_change
  BEFORE UPDATE ON public.courses
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION track_course_status_change();

-- 7) Update existing courses to have consistent status
-- Set any NULL status to 'draft'
UPDATE public.courses
SET status = 'draft'
WHERE status IS NULL OR status = '';

-- 8) Add comment for documentation
COMMENT ON COLUMN public.courses.submitted_at IS 'Timestamp when course was submitted for review';
COMMENT ON COLUMN public.courses.reviewed_at IS 'Timestamp when course was approved or rejected';
COMMENT ON COLUMN public.courses.reviewed_by IS 'User ID of the admin who reviewed the course';
COMMENT ON COLUMN public.courses.review_notes IS 'Rejection reason or review notes';