-- Add additional fields for user profile editing

-- Add name fields (for separate first/last name editing)
ALTER TABLE "user" 
ADD COLUMN IF NOT EXISTS first_name VARCHAR(50),
ADD COLUMN IF NOT EXISTS last_name VARCHAR(50);

-- Add social media links
ALTER TABLE "user" 
ADD COLUMN IF NOT EXISTS facebook_url VARCHAR(255),
ADD COLUMN IF NOT EXISTS twitter_url VARCHAR(255),
ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(255),
ADD COLUMN IF NOT EXISTS website_url VARCHAR(255),
ADD COLUMN IF NOT EXISTS github_url VARCHAR(255);

-- Update existing users to split their display name into first/last
UPDATE "user" 
SET 
  first_name = SPLIT_PART(name, ' ', 1),
  last_name = CASE 
    WHEN ARRAY_LENGTH(STRING_TO_ARRAY(name, ' '), 1) > 1 
    THEN SUBSTR(name, LENGTH(SPLIT_PART(name, ' ', 1)) + 2)
    ELSE ''
  END
WHERE first_name IS NULL;