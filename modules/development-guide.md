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

## 🛡️ DISCOVER 프로세스 (코드 작성 전 필수)

새 기능을 구현하기 전에 반드시 거쳐야 할 체계적인 탐색 프로세스입니다.

### D - Detect (감지)
**"뭘 만들려고 하는가?"**
- 요구사항 명확히 파악
- 예: "Assignment에 파일 업로드 추가"

### I - Investigate (조사) 
**전체 코드베이스에서 관련 기능 찾기**
```bash
grep -r "upload\|file\|attachment" --include="*.js"
grep -r "storage\|blob\|base64" --include="*.js"
```
질문: 비슷한 기능이 어디에 있나? 몇 가지 방식이 존재하나?

### S - Study (학습)
**발견한 패턴들 분석**
- Course 썸네일: Base64 → Server Action → Supabase
- Quiz 이미지: 동일한 패턴
- 왜 이런 패턴을 사용했는지 이해

### C - Compare (비교)
**옵션들을 표로 정리**
| 기능 | 방식 | 위치 | 재사용성 |
|------|------|------|----------|
| Quiz | Base64+Server | uploadActions | ⭐⭐⭐ |
| 새로 만들기 | - | - | ⭐ |

### O - Optimize (최적화)
**최선의 선택**
- 유사도 > 80%: 기존 코드 재사용
- 유사도 > 50%: 기존 코드 확장
- 유사도 < 50%: 새로 만들기 (매우 드물어야 함)

### V - Verify (검증)
**체크포인트**
- [ ] 중복 코드 만들지 않았나?
- [ ] 기존 패턴과 일관성 있나?
- [ ] 더 간단한 방법은 없나?

### E - Execute (실행)
**구현**
- 기존 패턴 따라 구현
- 필요시 기존 코드 리팩토링

### R - Record (기록)
**문서화**
- 이 문서나 관련 문서에 패턴 추가
- 예: "Assignment 파일 업로드 = Quiz와 동일 패턴"

## 🚨 RED FLAGS (위험 신호)

즉시 멈춰야 할 신호들:
- 🚩 비슷한 이름의 새 파일 생성 (예: assignmentFileUpload.js)
- 🚩 복사-붙여넣기 유혹
- 🚩 "일단 만들고 나중에 정리"
- 🚩 "이건 특별한 케이스야"
- 🚩 기존 코드 확인 없이 새 파일 생성

**대응**: 위 신호 감지 시 즉시 STOP → DISCOVER 프로세스로 돌아가기

## ⏱️ 3-3-3 규칙

### 3초 - 즉각 반응
"새 파일 만들기" 충동 → 3초 멈춤 → "이거 어디서 본 것 같은데?"

### 3분 - 빠른 탐색
```bash
grep -r "관련키워드" --include="*.js" | head -20
```
비슷한 것 있으면 새 파일 생성 중단

### 30분 - 깊은 분석
새로 만들기로 결정했다면 30분 투자해서 정말 필요한지 재검토
(90%는 기존 코드로 해결 가능)

## 📝 개발 체크포인트

주요 작업 시 확인사항:
- [ ] 기존 코드 재사용 가능한지 확인
- [ ] 중복 코드 없는지 검토
- [ ] GitHub Issue 생성 및 연결

## 작업 프로세스 (Claude Code + User 협업)

### 1. 코드 수정 단계
- Claude Code가 요청된 기능 구현
- 필요한 파일 수정/생성
- SCSS만 수정 (CSS 직접 수정 금지)

### 2. 사용자 테스트 단계 ⭐ 필수
- Claude Code가 테스트 안내: "개발 서버에서 다음을 확인해주세요:"
  - [ ] 페이지가 정상적으로 로드되는지
  - [ ] 브라우저 콘솔에 에러가 없는지  
  - [ ] 구현한 기능이 정상 작동하는지
  - [ ] UI가 의도대로 표시되는지
- 사용자가 테스트 결과 피드백
- 에러 발생 시 → Claude Code가 수정 후 재테스트
- 정상 작동 확인 → 다음 단계 진행

### 3. 코드 품질 검사 (커밋 전)
- [ ] `npm run lint` 실행 (에러 0개)
- [ ] `npm run format` 실행
- [ ] import 경로 확인 (대소문자)
- [ ] SCSS만 수정했는지 확인

### 4. 커밋 단계
- 사용자 최종 확인 완료 후 커밋
- 적절한 커밋 메시지 작성 (feat/fix/refactor 등)
- 필요시 PR 생성

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