# DVS-TEMPLATE01 Context & History

## 프로젝트 개요
- **프로젝트명**: DVS-TEMPLATE01
- **기술 스택**: Next.js 14, Supabase, Bootstrap 5, Redux
- **주요 기능**: 온라인 교육 플랫폼 (교사/학생 대시보드, 코스 관리, 퀴즈 시스템)
- **개발 방식**: Solo Developer + Claude Code 협업

## 최근 작업 이력

### 2025-01-31: ESLint 에러 해결
**문제**: GitHub PR #1 생성 시 ESLint 에러로 CI 실패
**원인**: 
1. ESLint가 devDependencies에 없었음
2. HTML entity 사용 안 함 (apostrophe, quotes)

**해결 과정**:
1. ~~hotfix/eslint-critical-errors 브랜치 생성~~ (잘못된 접근)
2. feature/quiz-system-quill-experiment 브랜치에서 직접 수정 (올바른 접근)
3. ESLint 8.57.0 설치
4. HTML entity 에러 5개 파일 수정
5. 성공적으로 푸시 및 CI 통과

**교훈**:
- "Don't Make It Worse" 원칙 중요
- Prettier 자동 포맷팅은 위험할 수 있음 (945개 파일 변경 → 롤백)
- feature 브랜치에서 직접 수정이 올바른 워크플로우

### 2025-01-30: 퀴즈 시스템 구현
**작업 내용**:
- Quill 에디터 통합
- 다양한 퀴즈 타입 지원 (Multiple Choice, True/False, Fill in Blanks 등)
- 퀴즈 생성/편집 모달 구현

**이슈**:
- Zod 버전 충돌 (_zod 에러)
- 해결: v4.0.14 → v3.25.76 다운그레이드

## 주요 파일 구조
```
app/
├── (dashboard)/       # 역할별 대시보드
├── (courses)/        # 코스 관리
├── lib/
│   └── actions/      # Supabase 서버 액션
components/
├── Instructor/       # 교사 컴포넌트
├── Student/         # 학생 컴포넌트
├── create-course/   # 코스 생성
│   ├── QuizTab/    # 퀴즈 관련
│   └── QuizModals/ # 퀴즈 모달
```

## 데이터베이스 스키마 (Supabase)
- `user`: 사용자 프로필 (role: student/instructor)
- `courses`: 코스 정보
- `lessons`: 레슨/퀴즈 (content_type: lesson/quiz)
- `course_topics`: 코스 토픽/챕터
- `enrollments`: 학생 등록 정보
- `certificates`: 수료증 (구현 준비 완료, 비활성화 상태)

## 환경 변수
```env
NEXTAUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_CERTIFICATE_ENABLED=false  # 수료증 기능 토글
```

## 현재 과제
1. **학생 등록 시스템** (P0)
   - 코스 상세 페이지
   - 결제 프로세스
   - 등록 후 학습 시작

2. **레슨 뷰어** (P0)
   - 비디오 플레이어
   - 진도 추적
   - 퀴즈 통합

3. **리뷰 시스템** (P1)
   - 별점 및 리뷰 작성
   - 코스별 평점 표시

## 알려진 버그
1. ESLint 의존성 배열 경고 (약 50개) - 기능상 문제 없음
2. @supabase/realtime-js 경고 - 무시 가능

## 개발 팁
1. **서버 재시작 주의**: 개발 서버가 이미 3000번 포트에서 실행 중
2. **CSS 수정 금지**: SCSS만 사용 (`/public/scss/`)
3. **Server Actions 사용**: API 대신 `/app/lib/actions/` 사용
4. **역할 확인**: 교사 기능 테스트 시 DB에서 role 확인 필요

## 자주 발생하는 문제와 해결법

### 1. "File has not been read yet" 에러
**원인**: Edit/Write 도구 사용 전 Read 도구 미사용
**해결**: 항상 파일을 먼저 읽고 수정

### 2. Supabase 권한 에러
**원인**: RLS 정책 또는 role 불일치
**해결**: Supabase 대시보드에서 정책 확인

### 3. Hydration 에러
**원인**: 서버/클라이언트 렌더링 불일치
**해결**: useEffect + useState로 클라이언트 전용 처리

### 4. Import 에러
**원인**: 파일명 대소문자 불일치 (Windows)
**해결**: 정확한 파일명 사용

## 참고 자료
- [Next.js 14 Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [프로젝트 GitHub](https://github.com/Hulkeinstein/dvs-template01)

## 마지막 업데이트: 2025-01-31