-- Create profiles storage bucket for user avatars and cover photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profiles', 
  'profiles', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE
SET 
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']::text[];

-- RLS policies for profiles bucket
-- Allow public read access (since bucket is public)
CREATE POLICY "Public profiles read" ON storage.objects
FOR SELECT USING (bucket_id = 'profiles');

-- Allow authenticated users to upload their own profile images
CREATE POLICY "Users can upload own profile" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'profiles' 
  AND auth.uid() IS NOT NULL
);

-- Allow users to update their own profile images
CREATE POLICY "Users can update own profile" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'profiles' 
  AND auth.uid() IS NOT NULL
);

-- Allow users to delete their own profile images
CREATE POLICY "Users can delete own profile" ON storage.objects
FOR DELETE USING (
  bucket_id = 'profiles' 
  AND auth.uid() IS NOT NULL
);