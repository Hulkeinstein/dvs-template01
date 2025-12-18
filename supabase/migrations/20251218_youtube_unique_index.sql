-- Create a partial unique index to prevent duplicate YouTube videos within the same course
-- This ensures that for a given course_id, the 'youtube_id' inside content_data (when video_source is 'youtube') is unique.
-- We only check when deleted_at is NULL to allow re-adding if previously soft-deleted.

CREATE UNIQUE INDEX IF NOT EXISTS idx_lessons_youtube_unique
ON lessons (course_id, (content_data->'youtube'->>'youtube_id'))
WHERE video_source = 'youtube'
  AND content_data->'youtube'->>'youtube_id' IS NOT NULL
  AND deleted_at IS NULL;
