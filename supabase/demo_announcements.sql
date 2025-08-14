-- Demo Announcements Data
-- 교사 계정으로 로그인한 후 instructor_id를 본인의 user.id로 변경하세요
-- Supabase에서 다음 쿼리로 instructor_id 확인: SELECT id, email, role FROM "user" WHERE role = 'instructor';

-- 변수 설정 (실제 instructor_id로 변경 필요)
-- 예: 'your-instructor-uuid-here'를 실제 ID로 변경
DO $$
DECLARE
    instructor_uuid UUID := 'your-instructor-uuid-here'; -- 여기에 실제 instructor ID 입력
BEGIN

-- 기존 데모 데이터 삭제 (선택사항)
-- DELETE FROM announcements WHERE instructor_id = instructor_uuid;

-- 1. 긴급 공지 - 오늘 (Active)
INSERT INTO announcements (instructor_id, course_id, title, content, priority, is_active, created_at)
VALUES (
    instructor_uuid,
    NULL,
    '긴급: 오늘 오후 수업 취소 안내',
    '<p><strong>학생 여러분께 알려드립니다.</strong></p><p>강사 개인 사정으로 인해 오늘 오후 2시 예정된 수업이 <span style="color: red;">취소</span>되었습니다.</p><p>보강 수업은 다음 주 같은 시간에 진행될 예정입니다.</p><p>불편을 드려 죄송합니다.</p>',
    'urgent',
    true,
    NOW()
);

-- 2. 긴급 공지 - 어제 (Active)
INSERT INTO announcements (instructor_id, course_id, title, content, priority, is_active, created_at)
VALUES (
    instructor_uuid,
    NULL,
    '긴급: 시스템 점검으로 인한 접속 제한',
    '<p><strong>시스템 점검 안내</strong></p><p>📅 일시: 2월 16일(토) 새벽 2시 ~ 6시</p><p>위 시간 동안 LMS 시스템 접속이 <u>제한됩니다</u>.</p><ul><li>과제 제출</li><li>강의 시청</li><li>퀴즈 응시</li></ul><p>위 기능들을 미리 완료해 주시기 바랍니다.</p>',
    'urgent',
    true,
    NOW() - INTERVAL '1 day'
);

-- 3. 중요 공지 - 3일 전 (Active)
INSERT INTO announcements (instructor_id, course_id, title, content, priority, is_active, created_at)
VALUES (
    instructor_uuid,
    NULL,
    '중요: 기말고사 일정 및 범위 안내',
    '<p><strong>📝 기말고사 안내</strong></p><p><strong>시험 일시:</strong> 2월 28일(수) 오후 2시 ~ 4시</p><p><strong>시험 장소:</strong> 온라인 (Zoom)</p><p><strong>시험 범위:</strong></p><ol><li>Chapter 7: 데이터베이스 기초</li><li>Chapter 8: SQL 쿼리</li><li>Chapter 9: 정규화</li><li>Chapter 10: 트랜잭션</li></ol><p><strong>준비물:</strong> 계산기, A4 용지</p><p>시험 관련 질문은 Q&A 게시판을 이용해 주세요.</p>',
    'important',
    true,
    NOW() - INTERVAL '3 days'
);

-- 4. 중요 공지 - 5일 전 (Active)
INSERT INTO announcements (instructor_id, course_id, title, content, priority, is_active, created_at)
VALUES (
    instructor_uuid,
    NULL,
    '중요: 수강 신청 기간 변경 공지',
    '<p><strong>수강 신청 일정 변경</strong></p><p>학사 일정 조정으로 인해 수강 신청 기간이 변경되었습니다.</p><table><tr><th>구분</th><th>기존</th><th>변경</th></tr><tr><td>신청 시작</td><td>2월 20일</td><td><strong>2월 25일</strong></td></tr><tr><td>신청 종료</td><td>2월 25일</td><td><strong>3월 2일</strong></td></tr></table><p>변경된 일정을 꼭 확인하시기 바랍니다.</p>',
    'important',
    true,
    NOW() - INTERVAL '5 days'
);

-- 5. 중요 공지 - 7일 전 (Active)
INSERT INTO announcements (instructor_id, course_id, title, content, priority, is_active, created_at)
VALUES (
    instructor_uuid,
    NULL,
    '중요: 과제 제출 가이드라인',
    '<p><strong>과제 제출 시 주의사항</strong></p><p>모든 과제는 다음 규칙을 따라 제출해야 합니다:</p><ul><li><strong>파일명:</strong> 학번_이름_과제명.pdf</li><li><strong>파일 형식:</strong> PDF only (5MB 이하)</li><li><strong>제출 기한:</strong> 매주 일요일 자정까지</li></ul><p>⚠️ <span style="background-color: yellow;">지각 제출은 감점(-10%)</span>됩니다.</p><p>제출 전 반드시 파일명과 형식을 확인하세요!</p>',
    'important',
    true,
    NOW() - INTERVAL '7 days'
);

-- 6. 일반 공지 - 10일 전 (Active)
INSERT INTO announcements (instructor_id, course_id, title, content, priority, is_active, created_at)
VALUES (
    instructor_uuid,
    NULL,
    '새로운 학습 자료 업로드',
    '<p>안녕하세요, 수강생 여러분!</p><p>이번 주 학습에 도움이 될 추가 자료를 업로드했습니다:</p><ul><li>📄 Chapter 8 요약 노트</li><li>📊 실습 데이터셋 (샘플 DB)</li><li>🎥 보충 설명 영상 (15분)</li></ul><p>자료실에서 다운로드 받으실 수 있습니다.</p>',
    'normal',
    true,
    NOW() - INTERVAL '10 days'
);

-- 7. 일반 공지 - 12일 전 (Active)
INSERT INTO announcements (instructor_id, course_id, title, content, priority, is_active, created_at)
VALUES (
    instructor_uuid,
    NULL,
    '다음 주 특별 강연 안내',
    '<p><strong>🎤 특별 초청 강연</strong></p><p><strong>주제:</strong> "AI 시대의 데이터베이스 트렌드"</p><p><strong>강연자:</strong> 김철수 박사 (ABC Tech CTO)</p><p><strong>일시:</strong> 2월 21일(수) 오후 3시</p><p><strong>장소:</strong> Zoom (링크는 당일 공지)</p><p>많은 참여 부탁드립니다! 출석 체크 있습니다.</p>',
    'normal',
    true,
    NOW() - INTERVAL '12 days'
);

-- 8. 일반 공지 - 15일 전 (Inactive - 지난 공지)
INSERT INTO announcements (instructor_id, course_id, title, content, priority, is_active, created_at)
VALUES (
    instructor_uuid,
    NULL,
    '코스 커리큘럼 업데이트',
    '<p>커리큘럼이 일부 개선되었습니다:</p><ul><li>Week 8: NoSQL 기초 추가</li><li>Week 9: 클라우드 DB 실습 추가</li><li>Week 10: 프로젝트 기간 연장 (1주 → 2주)</li></ul><p>자세한 내용은 강의계획서를 참고하세요.</p>',
    'normal',
    false,
    NOW() - INTERVAL '15 days'
);

-- 9. 일반 공지 - 20일 전 (Active)
INSERT INTO announcements (instructor_id, course_id, title, content, priority, is_active, created_at)
VALUES (
    instructor_uuid,
    NULL,
    '학습 팁: 효과적인 복습 방법',
    '<p><strong>💡 효과적인 학습을 위한 팁</strong></p><ol><li><strong>수업 당일 복습:</strong> 배운 내용을 당일 정리</li><li><strong>주간 복습:</strong> 주말에 전체 내용 review</li><li><strong>실습 위주:</strong> 이론보다 hands-on 실습</li><li><strong>스터디 그룹:</strong> 동료와 함께 토론</li></ol><p>꾸준한 복습이 성공의 열쇠입니다! 화이팅! 💪</p>',
    'normal',
    true,
    NOW() - INTERVAL '20 days'
);

-- 10. 일반 공지 - 25일 전 (Active)
INSERT INTO announcements (instructor_id, course_id, title, content, priority, is_active, created_at)
VALUES (
    instructor_uuid,
    NULL,
    '설문조사 참여 요청',
    '<p>수강생 여러분의 의견을 듣고자 합니다.</p><p><strong>📋 중간 강의 평가 설문</strong></p><p>더 나은 수업을 위해 여러분의 솔직한 피드백이 필요합니다.</p><p>👉 <a href="#">설문 링크</a> (소요시간: 5분)</p><p><strong>참여 기간:</strong> 2월 1일 ~ 2월 7일</p><p>참여해주신 분들께는 보너스 점수(+2점)를 드립니다.</p>',
    'normal',
    true,
    NOW() - INTERVAL '25 days'
);

END $$;

-- 데이터 확인
SELECT 
    id,
    title,
    priority,
    is_active,
    created_at::date as date
FROM announcements 
ORDER BY created_at DESC;