-- Create assignment_templates table for instructor template management
-- Created: 2025-11-17
-- Purpose: Allow instructors to save and reuse assignment configurations

-- Create the assignment_templates table
CREATE TABLE IF NOT EXISTS assignment_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  instructor_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  template_data JSONB NOT NULL,
  is_shared BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
  CONSTRAINT usage_count_non_negative CHECK (usage_count >= 0)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_assignment_templates_instructor
  ON assignment_templates(instructor_id);

CREATE INDEX IF NOT EXISTS idx_assignment_templates_created
  ON assignment_templates(created_at DESC);

-- Enable Row Level Security
ALTER TABLE assignment_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Instructors can view their own templates
CREATE POLICY "Instructors view own templates"
  ON assignment_templates
  FOR SELECT
  USING (instructor_id = auth.uid());

-- RLS Policy: Instructors can create their own templates
CREATE POLICY "Instructors create own templates"
  ON assignment_templates
  FOR INSERT
  WITH CHECK (instructor_id = auth.uid());

-- RLS Policy: Instructors can update their own templates
CREATE POLICY "Instructors update own templates"
  ON assignment_templates
  FOR UPDATE
  USING (instructor_id = auth.uid())
  WITH CHECK (instructor_id = auth.uid());

-- RLS Policy: Instructors can delete their own templates
CREATE POLICY "Instructors delete own templates"
  ON assignment_templates
  FOR DELETE
  USING (instructor_id = auth.uid());

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_assignment_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS trigger_update_assignment_templates_updated_at ON assignment_templates;
CREATE TRIGGER trigger_update_assignment_templates_updated_at
  BEFORE UPDATE ON assignment_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_assignment_templates_updated_at();

-- Create RPC function to increment usage count
CREATE OR REPLACE FUNCTION increment_template_usage(template_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE assignment_templates
  SET usage_count = usage_count + 1,
      updated_at = NOW()
  WHERE id = template_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on RPC function
GRANT EXECUTE ON FUNCTION increment_template_usage(UUID) TO authenticated;

-- Add comment for documentation
COMMENT ON TABLE assignment_templates IS 'Stores assignment templates created by instructors for reuse';
COMMENT ON COLUMN assignment_templates.template_data IS 'JSONB structure matching lessons.content_data for assignments';
COMMENT ON FUNCTION increment_template_usage(UUID) IS 'Increments usage_count when a template is loaded';
