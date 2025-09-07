-- Create bookmarks table for student wishlists
CREATE TABLE IF NOT EXISTS bookmarks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure a user can't bookmark the same course twice
    UNIQUE(user_id, course_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_course_id ON bookmarks(course_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_created_at ON bookmarks(created_at DESC);

-- Add RLS policies
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Users can only see their own bookmarks
CREATE POLICY "Users can view own bookmarks" ON bookmarks
    FOR SELECT USING (auth.uid()::text = user_id::text);

-- Users can create their own bookmarks
CREATE POLICY "Users can create own bookmarks" ON bookmarks
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Users can delete their own bookmarks
CREATE POLICY "Users can delete own bookmarks" ON bookmarks
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- Add helpful comments
COMMENT ON TABLE bookmarks IS 'Stores course bookmarks/wishlists for students';
COMMENT ON COLUMN bookmarks.user_id IS 'The student who bookmarked the course';
COMMENT ON COLUMN bookmarks.course_id IS 'The course that was bookmarked';
COMMENT ON COLUMN bookmarks.created_at IS 'When the bookmark was created';