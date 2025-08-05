-- 코스의 모든 레슨 확인 (퀴즈 포함)
SELECT 
  id,
  title,
  content_type,
  topic_id,
  course_id,
  created_at
FROM lessons 
WHERE course_id = '2c6d1af1-0421-4a29-b577-df87a4379fb3'
ORDER BY created_at DESC;
EOF < /dev/null
