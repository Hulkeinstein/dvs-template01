-- 현재 버킷 설정 확인
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types,
    created_at,
    updated_at
FROM storage.buckets 
WHERE name IN ('courses', 'course-attachments');

-- 스토리지 정책 확인
SELECT 
    name as policy_name,
    definition,
    bucket_id
FROM storage.policies
WHERE bucket_id IN ('courses', 'course-attachments');

-- 버킷에 허용된 MIME types 업데이트 (필요한 경우)
-- Option 1: courses 버킷에 attachment MIME types 추가
UPDATE storage.buckets 
SET allowed_mime_types = ARRAY[
    -- 기존 이미지/비디오 타입
    'image/jpeg',
    'image/png', 
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm',
    -- 새로 추가할 문서 타입
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
WHERE name = 'courses';

-- Option 2: course-attachments 버킷이 제대로 생성되지 않았다면 다시 생성
DELETE FROM storage.buckets WHERE name = 'course-attachments';

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-attachments',
  'course-attachments',
  true,
  10485760,
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
);