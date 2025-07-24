-- Create storage buckets for courses
-- This creates a public bucket for course-related files

-- Create the courses bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'courses',
  'courses', 
  true, -- Public bucket
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'video/mp4', 'video/webm']::text[]
)
ON CONFLICT (id) DO UPDATE
SET 
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'video/mp4', 'video/webm']::text[];

-- Create RLS policies for the courses bucket

-- Allow anyone to view files (since it's a public bucket)
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'courses');

-- Allow authenticated users to upload their own files
CREATE POLICY "Authenticated users can upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'courses' 
    AND auth.role() = 'authenticated'
  );

-- Allow users to update their own files
CREATE POLICY "Users can update own files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'courses' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to delete their own files  
CREATE POLICY "Users can delete own files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'courses' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_storage_objects_bucket_id ON storage.objects(bucket_id);
CREATE INDEX IF NOT EXISTS idx_storage_objects_name ON storage.objects(name);

-- Grant necessary permissions
GRANT ALL ON storage.objects TO authenticated;
GRANT SELECT ON storage.objects TO anon;