-- Comprehensive migration to ensure phone verification system is properly set up
-- Run this in Supabase SQL Editor to fix the "Error saving OTP: {}" issue

-- 1. First, ensure the user table has the necessary phone-related columns
ALTER TABLE "user" 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS is_phone_verified BOOLEAN DEFAULT FALSE;

-- 2. Create phone_verifications table if it doesn't exist
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

-- 3. Create indexes for performance (only if they don't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_phone_verifications_phone') THEN
    CREATE INDEX idx_phone_verifications_phone ON phone_verifications(phone);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_phone_verifications_expires_at') THEN
    CREATE INDEX idx_phone_verifications_expires_at ON phone_verifications(expires_at);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_phone_verifications_user_id') THEN
    CREATE INDEX idx_phone_verifications_user_id ON phone_verifications(user_id);
  END IF;
END $$;

-- 4. Enable Row Level Security
ALTER TABLE phone_verifications ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can view own verifications" ON phone_verifications;
DROP POLICY IF EXISTS "Service role can manage all verifications" ON phone_verifications;

-- Users can view their own verifications
CREATE POLICY "Users can view own verifications" ON phone_verifications
  FOR SELECT USING (auth.uid() = user_id);

-- Service role can manage all verifications
CREATE POLICY "Service role can manage all verifications" ON phone_verifications
  FOR ALL USING (true);

-- 6. Grant necessary permissions
GRANT ALL ON phone_verifications TO authenticated;
GRANT ALL ON phone_verifications TO service_role;

-- 7. Verify the table was created successfully
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'phone_verifications'
  ) THEN
    RAISE NOTICE 'Success: phone_verifications table exists';
  ELSE
    RAISE EXCEPTION 'Failed: phone_verifications table was not created';
  END IF;
END $$;

-- 8. Show the table structure for confirmation
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'phone_verifications'
ORDER BY ordinal_position;