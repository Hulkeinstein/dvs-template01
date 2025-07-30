-- Option 1: Create a new bucket for course attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-attachments',
  'course-attachments',
  true,
  10485760, -- 10MB limit for attachments
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/zip',
    'application/x-rar-compressed',
    'text/plain'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for course-attachments bucket
CREATE POLICY "Authenticated users can upload attachments" ON storage.objects
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'course-attachments' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Public can view attachments" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'course-attachments');

CREATE POLICY "Users can update their own attachments" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'course-attachments' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete their own attachments" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'course-attachments' 
    AND auth.role() = 'authenticated'
  );

-- Option 2: If you prefer to use existing 'courses' bucket, update it to allow attachment file types
-- This would need to be run in Supabase SQL editor as UPDATE on storage.buckets might be restricted
/*
UPDATE storage.buckets 
SET allowed_mime_types = array_cat(
  allowed_mime_types,
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/zip',
    'application/x-rar-compressed',
    'text/plain'
  ]::text[]
)
WHERE id = 'courses';
*/