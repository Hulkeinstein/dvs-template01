-- =============================================
-- Badge System Migration
-- Created: 2025-02-13
-- Description: Implements multiple badge system for courses
-- =============================================

-- 1. Create course_badges table for multiple badges per course
CREATE TABLE IF NOT EXISTS course_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  badge_type VARCHAR(50) NOT NULL,
  priority INTEGER DEFAULT 999,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  
  -- Ensure unique badge type per course
  CONSTRAINT unique_course_badge UNIQUE(course_id, badge_type)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_course_badges_course_id ON course_badges(course_id);
CREATE INDEX IF NOT EXISTS idx_course_badges_type ON course_badges(badge_type);
CREATE INDEX IF NOT EXISTS idx_course_badges_expires ON course_badges(expires_at) WHERE expires_at IS NOT NULL;

-- 2. Add enrollment tracking columns to courses table
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS enrollment_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS weekly_enrollment_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS monthly_enrollment_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS featured_until DATE;

-- 3. Create function to auto-calculate badges
CREATE OR REPLACE FUNCTION calculate_course_badges(p_course_id UUID)
RETURNS VOID AS $$
DECLARE
  v_course RECORD;
  v_days_since_created INTEGER;
  v_discount_percentage NUMERIC;
BEGIN
  -- Get course details
  SELECT * INTO v_course FROM courses WHERE id = p_course_id;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Calculate days since created
  v_days_since_created := EXTRACT(DAY FROM NOW() - v_course.created_at);
  
  -- Remove expired badges
  DELETE FROM course_badges 
  WHERE course_id = p_course_id 
  AND expires_at < NOW();
  
  -- 1. NEW badge (7 days)
  IF v_days_since_created <= 7 THEN
    INSERT INTO course_badges (course_id, badge_type, priority, expires_at)
    VALUES (p_course_id, 'new', 6, v_course.created_at + INTERVAL '7 days')
    ON CONFLICT (course_id, badge_type) 
    DO UPDATE SET expires_at = EXCLUDED.expires_at;
  ELSE
    DELETE FROM course_badges 
    WHERE course_id = p_course_id AND badge_type = 'new';
  END IF;
  
  -- 2. SALE badge (if discounted)
  IF v_course.discounted_price IS NOT NULL 
     AND v_course.regular_price IS NOT NULL 
     AND v_course.discounted_price < v_course.regular_price THEN
    
    v_discount_percentage := ROUND(
      ((v_course.regular_price - v_course.discounted_price) / v_course.regular_price * 100)::NUMERIC, 
      0
    );
    
    INSERT INTO course_badges (course_id, badge_type, priority, metadata)
    VALUES (p_course_id, 'sale', 1, jsonb_build_object('discount', v_discount_percentage))
    ON CONFLICT (course_id, badge_type) 
    DO UPDATE SET metadata = EXCLUDED.metadata;
  ELSE
    DELETE FROM course_badges 
    WHERE course_id = p_course_id AND badge_type = 'sale';
  END IF;
  
  -- 3. BESTSELLER badge (100+ enrollments)
  IF v_course.enrollment_count >= 100 THEN
    INSERT INTO course_badges (course_id, badge_type, priority)
    VALUES (p_course_id, 'bestseller', 3)
    ON CONFLICT (course_id, badge_type) DO NOTHING;
  ELSE
    DELETE FROM course_badges 
    WHERE course_id = p_course_id AND badge_type = 'bestseller';
  END IF;
  
  -- 4. HOT badge (20+ weekly enrollments)
  IF v_course.weekly_enrollment_count >= 20 THEN
    INSERT INTO course_badges (course_id, badge_type, priority)
    VALUES (p_course_id, 'hot', 2)
    ON CONFLICT (course_id, badge_type) DO NOTHING;
  ELSE
    DELETE FROM course_badges 
    WHERE course_id = p_course_id AND badge_type = 'hot';
  END IF;
  
  -- 5. LIMITED badge (80% capacity)
  IF v_course.max_students > 0 
     AND v_course.enrollment_count >= (v_course.max_students * 0.8) THEN
    INSERT INTO course_badges (course_id, badge_type, priority, metadata)
    VALUES (
      p_course_id, 
      'limited', 
      2,
      jsonb_build_object('remaining', v_course.max_students - v_course.enrollment_count)
    )
    ON CONFLICT (course_id, badge_type) 
    DO UPDATE SET metadata = EXCLUDED.metadata;
  ELSE
    DELETE FROM course_badges 
    WHERE course_id = p_course_id AND badge_type = 'limited';
  END IF;
  
  -- 6. FEATURED badge (manually set)
  IF v_course.is_featured = true THEN
    INSERT INTO course_badges (course_id, badge_type, priority, expires_at)
    VALUES (p_course_id, 'featured', 4, v_course.featured_until)
    ON CONFLICT (course_id, badge_type) 
    DO UPDATE SET expires_at = EXCLUDED.expires_at;
  ELSE
    DELETE FROM course_badges 
    WHERE course_id = p_course_id AND badge_type = 'featured';
  END IF;
  
  -- 7. CERTIFIED badge (if certificate template exists)
  IF v_course.certificate_template IS NOT NULL THEN
    INSERT INTO course_badges (course_id, badge_type, priority)
    VALUES (p_course_id, 'certified', 5)
    ON CONFLICT (course_id, badge_type) DO NOTHING;
  ELSE
    DELETE FROM course_badges 
    WHERE course_id = p_course_id AND badge_type = 'certified';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 4. Create trigger to auto-update badges when course changes
CREATE OR REPLACE FUNCTION trigger_update_course_badges()
RETURNS TRIGGER AS $$
BEGIN
  -- Only recalculate if relevant fields changed
  IF (OLD.discounted_price IS DISTINCT FROM NEW.discounted_price) OR
     (OLD.regular_price IS DISTINCT FROM NEW.regular_price) OR
     (OLD.enrollment_count IS DISTINCT FROM NEW.enrollment_count) OR
     (OLD.weekly_enrollment_count IS DISTINCT FROM NEW.weekly_enrollment_count) OR
     (OLD.max_students IS DISTINCT FROM NEW.max_students) OR
     (OLD.is_featured IS DISTINCT FROM NEW.is_featured) OR
     (OLD.certificate_template IS DISTINCT FROM NEW.certificate_template) THEN
    
    PERFORM calculate_course_badges(NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS update_course_badges_trigger ON courses;
CREATE TRIGGER update_course_badges_trigger
AFTER UPDATE ON courses
FOR EACH ROW
EXECUTE FUNCTION trigger_update_course_badges();

-- 5. Create trigger for new courses
CREATE OR REPLACE FUNCTION trigger_new_course_badges()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM calculate_course_badges(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS new_course_badges_trigger ON courses;
CREATE TRIGGER new_course_badges_trigger
AFTER INSERT ON courses
FOR EACH ROW
EXECUTE FUNCTION trigger_new_course_badges();

-- 6. Update enrollment count when new enrollment is created
CREATE OR REPLACE FUNCTION update_enrollment_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Update total enrollment count
    UPDATE courses 
    SET enrollment_count = enrollment_count + 1,
        weekly_enrollment_count = weekly_enrollment_count + 1,
        monthly_enrollment_count = monthly_enrollment_count + 1
    WHERE id = NEW.course_id;
  ELSIF TG_OP = 'DELETE' THEN
    -- Update total enrollment count
    UPDATE courses 
    SET enrollment_count = GREATEST(0, enrollment_count - 1)
    WHERE id = OLD.course_id;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_enrollment_counts_trigger ON enrollments;
CREATE TRIGGER update_enrollment_counts_trigger
AFTER INSERT OR DELETE ON enrollments
FOR EACH ROW
EXECUTE FUNCTION update_enrollment_counts();

-- 7. Create scheduled job to reset weekly/monthly counts (requires pg_cron extension)
-- Note: This is a placeholder. Actual implementation depends on your hosting setup
-- You might need to set up a separate cron job or use Supabase Edge Functions

-- 8. Calculate badges for all existing courses
DO $$
DECLARE
  course_record RECORD;
BEGIN
  FOR course_record IN SELECT id FROM courses LOOP
    PERFORM calculate_course_badges(course_record.id);
  END LOOP;
END $$;

-- 9. Grant appropriate permissions
GRANT SELECT ON course_badges TO authenticated;
GRANT INSERT, UPDATE, DELETE ON course_badges TO service_role;