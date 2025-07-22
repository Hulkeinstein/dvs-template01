-- Add phone verification status column to user table
-- This column tracks whether a user has completed phone verification

ALTER TABLE "user" 
ADD COLUMN IF NOT EXISTS is_phone_verified BOOLEAN DEFAULT FALSE;

-- Add index for faster queries on phone verification status
CREATE INDEX IF NOT EXISTS idx_user_phone_verified ON "user"(is_phone_verified);

-- Update existing users who have verified phone numbers
-- (Users who have phone numbers but haven't gone through the new verification process)
-- This ensures backward compatibility
UPDATE "user" 
SET is_phone_verified = TRUE 
WHERE phone IS NOT NULL 
  AND phone != ''
  AND onboarding_completed_at IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN "user".is_phone_verified IS 'Indicates whether the user has completed phone number verification';