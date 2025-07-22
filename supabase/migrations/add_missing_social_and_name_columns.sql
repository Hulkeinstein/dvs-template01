-- Add missing columns to user table
-- This migration adds the remaining columns that were not included in previous migrations

-- Add updated_at column with automatic timestamp update
ALTER TABLE "user" 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Add first_name and last_name columns
ALTER TABLE "user" 
ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);

-- Add social media URL columns
ALTER TABLE "user" 
ADD COLUMN IF NOT EXISTS facebook_url VARCHAR(255),
ADD COLUMN IF NOT EXISTS twitter_url VARCHAR(255),
ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(255),
ADD COLUMN IF NOT EXISTS website_url VARCHAR(255),
ADD COLUMN IF NOT EXISTS github_url VARCHAR(255);

-- Create trigger to automatically update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if exists (to avoid errors on re-run)
DROP TRIGGER IF EXISTS update_user_updated_at ON "user";

-- Create trigger for user table
CREATE TRIGGER update_user_updated_at 
BEFORE UPDATE ON "user" 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_first_name ON "user"(first_name);
CREATE INDEX IF NOT EXISTS idx_user_last_name ON "user"(last_name);
CREATE INDEX IF NOT EXISTS idx_user_updated_at ON "user"(updated_at);

-- Add comments for documentation
COMMENT ON COLUMN "user".first_name IS 'User first name';
COMMENT ON COLUMN "user".last_name IS 'User last name';
COMMENT ON COLUMN "user".facebook_url IS 'Facebook profile URL';
COMMENT ON COLUMN "user".twitter_url IS 'Twitter/X profile URL';
COMMENT ON COLUMN "user".linkedin_url IS 'LinkedIn profile URL';
COMMENT ON COLUMN "user".website_url IS 'Personal website URL';
COMMENT ON COLUMN "user".github_url IS 'GitHub profile URL';
COMMENT ON COLUMN "user".updated_at IS 'Timestamp of last update, automatically maintained';