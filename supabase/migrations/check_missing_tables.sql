-- lessons과 course_settings 테이블 존재 여부 확인
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('lessons', 'course_settings', 'lesson_progress')
ORDER BY table_name;

-- 테이블이 없을 경우 아래 쿼리 실행 필요
-- 1. lessons 테이블
-- 2. course_settings 테이블  
-- 3. lesson_progress 테이블 (enrollments 마이그레이션에 포함됨)