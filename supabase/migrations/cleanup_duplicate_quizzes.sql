-- 중복 퀴즈 정리 쿼리
-- 이 쿼리는 같은 제목의 퀴즈가 여러 개 생성되었을 때 사용합니다.
-- 가장 최근에 생성된 퀴즈 1개만 남기고 나머지는 삭제합니다.

-- 1. 중복된 퀴즈 확인 (실행 전 확인용)
-- SELECT 
--   id,
--   title,
--   content_type,
--   topic_id,
--   created_at
-- FROM lessons 
-- WHERE content_type = 'quiz'
-- ORDER BY course_id, title, created_at DESC;

-- 2. 특정 코스의 중복 퀴즈 삭제
-- course_id를 실제 코스 ID로 변경하여 사용하세요
DELETE FROM lessons
WHERE course_id = 'YOUR_COURSE_ID_HERE'  -- 코스 ID 입력
  AND content_type = 'quiz'
  AND title IN (
    -- 중복된 제목 찾기
    SELECT title
    FROM lessons
    WHERE course_id = 'YOUR_COURSE_ID_HERE'  -- 코스 ID 입력
      AND content_type = 'quiz'
    GROUP BY title
    HAVING COUNT(*) > 1
  )
  AND id NOT IN (
    -- 각 제목별로 가장 최근 퀴즈 보존
    SELECT DISTINCT ON (title) id
    FROM lessons
    WHERE course_id = 'YOUR_COURSE_ID_HERE'  -- 코스 ID 입력
      AND content_type = 'quiz'
    ORDER BY title, created_at DESC
  );

-- 3. 전체 시스템의 중복 퀴즈 삭제 (주의: 전체 시스템에 영향)
-- 주의: 이 쿼리는 모든 코스의 중복 퀴즈를 삭제합니다
-- DELETE FROM lessons l1
-- WHERE content_type = 'quiz'
--   AND EXISTS (
--     SELECT 1
--     FROM lessons l2
--     WHERE l2.course_id = l1.course_id
--       AND l2.title = l1.title
--       AND l2.content_type = 'quiz'
--       AND l2.created_at > l1.created_at
--   );

-- 사용 예시:
-- 1. 'YOUR_COURSE_ID_HERE'를 실제 코스 ID로 변경
-- 2. 먼저 주석 처리된 SELECT 쿼리로 중복 확인
-- 3. DELETE 쿼리 실행하여 중복 제거