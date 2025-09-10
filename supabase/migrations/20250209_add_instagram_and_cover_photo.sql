-- Add Instagram URL and cover photo URL columns to user table
ALTER TABLE "user"
  ADD COLUMN IF NOT EXISTS instagram_url VARCHAR(255),
  ADD COLUMN IF NOT EXISTS cover_photo_url VARCHAR(255);

-- Add comment for clarity
COMMENT ON COLUMN "user".instagram_url IS 'Instagram profile URL';
COMMENT ON COLUMN "user".cover_photo_url IS 'Cover photo URL from storage';