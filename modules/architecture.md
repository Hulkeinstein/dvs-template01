# 아키텍처 개요

## 프로젝트 개요
- **프로젝트명**: DVS-TEMPLATE01
- **목적**: 온라인 교육 플랫폼 (교사/학생 대시보드, 코스 관리, 퀴즈 시스템)
- **개발 방식**: Solo Developer + Claude Code 협업
- **GitHub**: https://github.com/Hulkeinstein/dvs-template01

## 기술 스택
- **Next.js 14** with App Router
- **Supabase** for database and authentication
- **NextAuth.js** for OAuth (Google) authentication
- **Bootstrap 5** with custom SCSS (HiStudy 템플릿 기반)
- **Redux + Context API** for state management

## 템플릿 특징 (HiStudy 기반)
- **다중 데모 지원**: 다양한 교육 기관 레이아웃 변형 가능
- **테마 시스템**: Dark/Light 모드 완벽 지원
- **반응형 디자인**: 4+ 컬럼 레이아웃 지원
- **역할별 대시보드**: 교사/학생/관리자 전용 UI/UX
- **퀴즈 시스템**: 9가지 문제 유형 지원

## 프로젝트 구조
```
app/                    # Next.js App Router pages
├── (dashboard)/        # Role-based dashboard routes
├── (courses)/          # Course and lesson management
├── (pages)/            # General pages
├── lib/                # Server actions and utilities
│   └── actions/        # Server actions for Supabase
└── api/                # API routes (NextAuth)

components/             # React components organized by feature
├── Instructor/         # Instructor dashboard components
├── Student/           # Student dashboard components
├── Lesson/            # Quiz and lesson components
├── Auth/              # Authentication components
└── create-course/     # Course creation components

supabase/              # Database files
└── migrations/        # SQL migration files
```

## 데이터베이스 스키마 (Supabase)
현재 테이블:
- `user` - 역할 필드가 있는 사용자 프로필
- `courses` - instructor_id가 있는 코스 정보
- `lessons` - order_index가 있는 코스 레슨
- `course_settings` - 코스 설정
- `enrollments` - 진도가 포함된 학생 코스 등록
- `orders` - 결제/등록 기록
- `lesson_progress` - 개별 레슨 완료 추적
- `phone_verifications` - 전화번호 인증
- `course_topics` - 코스 주제/챕터
- `quiz_attempts` - 퀴즈 시도 기록

## 핵심 아키텍처 패턴

### 인증 & 권한
- **NextAuth.js** Google OAuth 처리
- **역할 기반 접근 제어** (instructor/student 역할)
- 특정 작업에 **전화 인증** 필요
- 사용자는 첫 로그인 시 Supabase에 'student' 역할로 자동 생성

### 데이터 흐름
- 데이터 가져오기를 위한 **Server Components**
- Supabase 작업을 위한 `app/lib/actions/`의 **Server Actions**
- 상호작용 기능을 위한 **Client Components**
- Supabase 클라이언트를 위한 **Named exports** (`export { supabase }`)

### API 응답 형식
- `/api/user/profile`은 사용자 객체를 직접 반환 (래핑 없음)

## 필수 환경 변수
```
NEXTAUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

## 핵심 개발 규칙

### 스타일링 가이드라인 (2025년 업데이트)
- **CSS 파일을 직접 수정하지 마세요**. CSS는 SCSS 또는 Tailwind에서 자동 생성됩니다.
  - **예외**: `app/globals.css`는 Tailwind 엔트리 포인트 소스 파일이므로 수정 가능

- **기존 템플릿 영역 (Instructor/Student Dashboard)**:
  1. SCSS 파일 사용 (`/public/scss/`)
  2. Bootstrap 5 클래스와 호환
  3. CSS 파일은 SCSS에서 자동 생성

- **새로운 Admin 영역 (Admin Dashboard)**:
  1. Tailwind CSS 클래스 우선 사용
  2. shadcn/ui 컴포넌트 활용
  3. Admin 전용 SCSS (`/public/scss/admin/`)로 Bootstrap 토큰 재정의
  4. ❌ 인라인 스타일 사용 금지 (디버깅 외)
  5. ❌ CSS-in-JS 사용 금지

### 스타일 충돌 해결 방법 (우선순위)
1. Admin 루트 토큰 스코프로 기본값 통일
2. SCSS에서 구체적 선택자 사용
3. !important는 최후 수단 (가급적 사용 안 함)

### 파일 구조
- `/public/scss/` - 모든 커스텀 스타일 (SCSS)
- `/public/scss/admin/` - Admin 전용 토큰 및 스타일
- `/app/globals.css` - Tailwind 지시문 및 CSS 변수 (수정 가능한 소스 파일)
- `/public/css/` - SCSS 컴파일 결과물 (직접 수정 금지)

## 개발 노트
- **Hydration 오류 방지**: 클라이언트 전용 기능에 `useState`와 `useEffect` 사용
- **테마 관리**: 서버 측 감지와 함께 쿠키 기반 지속성
- **역할 기반 라우팅**: 사용자 역할에 따른 보호된 경로 리디렉트
- **성능**: 데이터 가져오기에 Server Components, Client Components 최소화
- **파일 업로드**: Server Actions에 Base64 변환 사용, 그 후 Supabase Storage에 업로드
- **테이블 정렬**: 현업 표준 UX를 위한 데이터 타입별 최적화된 헤더 정렬 시스템 (`table-header-align` 클래스)