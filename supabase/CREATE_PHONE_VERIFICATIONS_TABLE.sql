-- Supabase SQL Editor에서 실행하세요
-- This creates the phone_verifications table needed for OTP verification

-- 1. Create the phone_verifications table
CREATE TABLE IF NOT EXISTS phone_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES "user"(id) ON DELETE CASCADE,
  phone VARCHAR(20) NOT NULL,
  otp VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_phone_verifications_phone ON phone_verifications(phone);
CREATE INDEX IF NOT EXISTS idx_phone_verifications_expires_at ON phone_verifications(expires_at);
CREATE INDEX IF NOT EXISTS idx_phone_verifications_user_id ON phone_verifications(user_id);

-- 3. Enable Row Level Security
ALTER TABLE phone_verifications ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role can manage all verifications" ON phone_verifications;
DROP POLICY IF EXISTS "Users can view own verifications" ON phone_verifications;

-- Allow service role to manage all verifications
CREATE POLICY "Service role can manage all verifications" ON phone_verifications
  FOR ALL USING (true);

-- 5. Verify the table was created
SELECT 
  'Table created successfully!' as status,
  count(*) as column_count
FROM information_schema.columns
WHERE table_name = 'phone_verifications';