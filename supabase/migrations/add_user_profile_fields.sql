-- Add additional fields to the user table for profile completion

-- Add username field (unique and required)
ALTER TABLE "user" 
ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE;

-- Add phone field (required)
ALTER TABLE "user" 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- Add professional info fields (optional)
ALTER TABLE "user" 
ADD COLUMN IF NOT EXISTS skill_occupation VARCHAR(100),
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Add profile completion tracking
ALTER TABLE "user" 
ADD COLUMN IF NOT EXISTS is_profile_complete BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP;

-- Add index for username for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_username ON "user"(username);

-- Add index for profile completion status
CREATE INDEX IF NOT EXISTS idx_user_profile_complete ON "user"(is_profile_complete);

-- Update existing users to mark them as needing profile completion
UPDATE "user" 
SET is_profile_complete = FALSE 
WHERE username IS NULL OR phone IS NULL;