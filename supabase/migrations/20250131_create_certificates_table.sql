-- Create certificates table
CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  
  -- Certificate details
  certificate_number VARCHAR(100) UNIQUE NOT NULL,
  template_id VARCHAR(50) NOT NULL,
  issued_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- PDF storage
  pdf_url TEXT,
  pdf_storage_path TEXT,
  
  -- Verification
  verification_code VARCHAR(50) UNIQUE,
  qr_code_url TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Status
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired')),
  revoked_at TIMESTAMPTZ,
  revoked_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one certificate per user per course
  UNIQUE(user_id, course_id)
);

-- Create indexes for better performance
CREATE INDEX idx_certificates_user_id ON certificates(user_id);
CREATE INDEX idx_certificates_course_id ON certificates(course_id);
CREATE INDEX idx_certificates_certificate_number ON certificates(certificate_number);
CREATE INDEX idx_certificates_verification_code ON certificates(verification_code);
CREATE INDEX idx_certificates_status ON certificates(status);

-- Add certificate settings to courses table if not exists
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS certificate_settings JSONB DEFAULT '{
  "enabled": false,
  "template_id": "template1",
  "passing_grade": 70,
  "certificate_title": "",
  "auto_issue": false
}';

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_certificates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_certificates_updated_at_trigger
BEFORE UPDATE ON certificates
FOR EACH ROW
EXECUTE FUNCTION update_certificates_updated_at();

-- Add RLS policies
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own certificates
CREATE POLICY "Users can view own certificates" ON certificates
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Instructors can view certificates for their courses
CREATE POLICY "Instructors can view course certificates" ON certificates
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = certificates.course_id
      AND courses.instructor_id = auth.uid()
    )
  );

-- Policy: Only system can insert certificates (via service role)
CREATE POLICY "System can insert certificates" ON certificates
  FOR INSERT
  WITH CHECK (false);

-- Policy: Only system can update certificates (via service role)
CREATE POLICY "System can update certificates" ON certificates
  FOR UPDATE
  USING (false);

-- Add comment
COMMENT ON TABLE certificates IS 'Stores issued course completion certificates';
COMMENT ON COLUMN certificates.certificate_number IS 'Unique certificate number for verification';
COMMENT ON COLUMN certificates.template_id IS 'References the certificate template used';
COMMENT ON COLUMN certificates.verification_code IS 'Short code for quick verification';
COMMENT ON COLUMN certificates.metadata IS 'Additional certificate data (student name, course details, etc.)';