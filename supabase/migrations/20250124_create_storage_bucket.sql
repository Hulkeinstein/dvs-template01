-- Enable storage extension if not already enabled
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'courses',
  'courses',
  true,
  524288000, -- 500MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for courses bucket
CREATE POLICY "Authenticated users can upload course files" ON storage.objects
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'courses' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Public can view course files" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'courses');

CREATE POLICY "Users can update their own course files" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'courses' 
    AND auth.uid() IN (
      SELECT instructor_id 
      FROM courses 
      WHERE courses.id::text = SPLIT_PART(name, '/', 2)
    )
  );

CREATE POLICY "Users can delete their own course files" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'courses' 
    AND auth.uid() IN (
      SELECT instructor_id 
      FROM courses 
      WHERE courses.id::text = SPLIT_PART(name, '/', 2)
    )
  );