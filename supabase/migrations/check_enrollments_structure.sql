-- enrollments 테이블 구조 확인
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'enrollments'
ORDER BY ordinal_position;

-- enrollments 테이블이 존재하는지 확인
SELECT EXISTS (
  SELECT 1 
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'enrollments'
) as enrollments_exists;

-- 관련 테이블들도 확인
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('enrollments', 'orders', 'lesson_progress')
ORDER BY table_name;