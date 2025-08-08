# Development Guide (Claude Code Reference)

## 필수 개발 명령어

### 기본 명령어
```bash
npm run dev        # 개발 서버 시작 (포트 3000)
npm run build      # 프로덕션 빌드
npm run start      # 프로덕션 서버 시작
```

### 코드 품질 (커밋 전 필수)
```bash
npm run lint       # ESLint 검사
npm run format     # Prettier 포맷팅
npm run format:check  # 포맷팅 체크만
```

## 데이터베이스 마이그레이션

### Supabase SQL Editor에서 순서대로 실행:
1. `create_courses_tables.sql`
2. `20250124_create_enrollment_tables.sql`
3. `20250124_create_storage_bucket.sql`
4. `20250207_add_course_topics.sql`
5. `20250207_create_quiz_tables.sql`

## 중요 파일 위치

### 자주 수정하는 경로
- **서버 액션**: `/app/lib/actions/`
- **SCSS 파일**: `/public/scss/` (CSS 직접 수정 금지!)
- **컴포넌트**: `/components/`
- **대시보드**: `/app/(dashboard)/`

### 테스트 데이터
- **샘플 퀴즈**: `/constants/sampleQuizData.js`
- **테스트 계정**:
  - 교사: `instructor@test.com`
  - 학생: `student@test.com`

## 작업 체크포인트

### 코스 생성 시
- [ ] 파일 업로드: Base64 변환 확인
- [ ] 썸네일: 5MB 제한, 이미지만 허용
- [ ] DB 저장: instructor_id 자동 설정

### 레슨 관리 시
- [ ] 드래그앤드롭: order_index 업데이트
- [ ] 삭제: 남은 레슨 재정렬
- [ ] 퀴즈: content_type = 'quiz'

### 퀴즈 작업 시
- [ ] Zod 버전: v3.25.76 사용 (v4는 에러)
- [ ] Quill 에디터: 비디오 placeholder 변환
- [ ] 9가지 문제 유형 지원

### 커밋 전 체크리스트
- [ ] `npm run lint` 실행 (에러 0개)
- [ ] `npm run format` 실행
- [ ] import 경로 확인 (대소문자)
- [ ] SCSS만 수정 (CSS 건드리지 않기)

## 환경 변수 필수 항목
```env
NEXTAUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_CERTIFICATE_ENABLED=false
```

## 자주 사용하는 Server Actions

### 코스 관련
- `createCourse()` - 새 코스 생성
- `updateCourse()` - 코스 정보 수정
- `getCourseById()` - 코스 상세 조회

### 레슨 관련
- `createLesson()` - 레슨 추가
- `updateLesson()` - 레슨 수정
- `deleteLesson()` - 레슨 삭제
- `reorderLessons()` - 순서 변경

### 퀴즈 관련
- `createQuizLesson()` - 퀴즈 생성
- `updateQuizLesson()` - 퀴즈 수정
- `getQuizByLessonId()` - 퀴즈 조회

## 개발 주의사항

### 필수 규칙
1. **개발 서버**: 이미 3000번 포트에서 실행 중일 수 있음
   - 새 서버 시작 전 확인 필요
   - 재시작 필요 시 사용자에게 먼저 확인

2. **CSS 수정 금지**: 항상 SCSS 파일만 수정
   - CSS 파일은 자동 생성됨
   - 수정 위치: `/public/scss/`

3. **Server Actions 사용**: API 대신 `/app/lib/actions/` 사용
   - 모든 DB 작업은 Server Actions로
   - Named exports 필수

4. **역할 확인**: 교사 기능 테스트 시 DB에서 role 확인
   - Supabase에서 user 테이블 확인
   - role: 'instructor' 또는 'student'

5. **파일명**: Windows에서 대소문자 주의
   - Import 경로 정확히 매칭