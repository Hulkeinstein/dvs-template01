-- Add missing columns to user table
-- This migration adds all the necessary columns for the profile completion feature

-- Add username field (unique)
ALTER TABLE "user" 
ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE;

-- Add phone field 
ALTER TABLE "user" 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- Add phone verification status
ALTER TABLE "user" 
ADD COLUMN IF NOT EXISTS is_phone_verified BOOLEAN DEFAULT FALSE;

-- Add professional info fields (optional)
ALTER TABLE "user" 
ADD COLUMN IF NOT EXISTS skill_occupation VARCHAR(100),
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Add social media URLs
ALTER TABLE "user" 
ADD COLUMN IF NOT EXISTS facebook_url VARCHAR(255),
ADD COLUMN IF NOT EXISTS twitter_url VARCHAR(255),
ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(255),
ADD COLUMN IF NOT EXISTS website_url VARCHAR(255),
ADD COLUMN IF NOT EXISTS github_url VARCHAR(255);

-- Add name parts for better profile management
ALTER TABLE "user" 
ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);

-- Add profile completion tracking
ALTER TABLE "user" 
ADD COLUMN IF NOT EXISTS is_profile_complete BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_username ON "user"(username);
CREATE INDEX IF NOT EXISTS idx_user_phone_verified ON "user"(is_phone_verified);
CREATE INDEX IF NOT EXISTS idx_user_profile_complete ON "user"(is_profile_complete);

-- Add comments for documentation
COMMENT ON COLUMN "user".username IS 'Unique username chosen by the user';
COMMENT ON COLUMN "user".phone IS 'User phone number in international format';
COMMENT ON COLUMN "user".is_phone_verified IS 'Indicates whether the user has completed phone number verification';
COMMENT ON COLUMN "user".skill_occupation IS 'User professional skill or occupation';
COMMENT ON COLUMN "user".bio IS 'User biography or description';
COMMENT ON COLUMN "user".is_profile_complete IS 'Indicates whether the user has completed their profile';
COMMENT ON COLUMN "user".onboarding_completed_at IS 'Timestamp when user completed onboarding';