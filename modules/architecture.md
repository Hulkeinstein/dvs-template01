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

## 템플릿 특징
- HiStudy 기반 (Dark/Light 모드, 반응형)
- 역할별 대시보드 (교사/학생/관리자)
- 퀴즈 시스템 (9가지 문제 유형)

## 프로젝트 구조
```
app/
├── (dashboard)/        # Role-based routes
├── lib/actions/        # Server actions (Supabase)
└── api/                # API routes (NextAuth)

components/
├── Instructor/Student/ # Dashboard components
└── Lesson/            # Quiz components

supabase/migrations/    # SQL migrations
```

## 데이터베이스 스키마
주요 테이블: `user`, `courses`, `lessons`, `enrollments`, `orders`, `lesson_progress`, `quiz_attempts`

## 핵심 아키텍처 패턴

### 인증 & 권한
- 하이브리드: Google OAuth (NextAuth.js) + Email/Password (Bcrypt saltRounds 10)
- SHA-256 토큰 (비밀번호 재설정, 30분 만료)
- 역할 기반 접근: instructor/student
- 구현: `app/lib/actions/passwordActions.ts`

### 컴포넌트 패턴
- **Server Components**: 데이터 가져오기, SEO
- **Client Components**: 상호작용 (use client)
- **Server Actions**: Supabase 작업 (`app/lib/actions/`)

### RLS 정책 패턴
```sql
-- 기본 패턴: 자신의 데이터만 접근
CREATE POLICY "Users can view own data"
ON table_name FOR SELECT
USING (auth.uid() = user_id);

-- 역할 기반: instructor만 생성
CREATE POLICY "Instructors can create"
ON courses FOR INSERT
WITH CHECK ((SELECT role FROM user WHERE id = auth.uid()) = 'instructor');
```

### API 라우트 컨벤션
- 응답: 객체 직접 반환 (래핑 없음)
- 예: `/api/user/profile` → `{ id, email, role }`
- NextAuth: `/api/auth/[...nextauth]`

### Zod 검증 패턴
```typescript
import { z } from 'zod';

const CourseSchema = z.object({
  title: z.string().min(1).max(100),
  price: z.number().nonnegative(),
  instructor_id: z.string().uuid()
});

// Server Action에서 사용
export async function createCourse(data: unknown) {
  const validated = CourseSchema.parse(data); // 실패 시 throw
  // ... Supabase 작업
}
```

### 에러 처리 표준
```typescript
// Server Actions: Try-catch + 명시적 반환
export async function getCourse(id: string) {
  try {
    const { data, error } = await supabase.from('courses').select().eq('id', id).single();
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  } catch (error) {
    return { success: false, error: '서버 오류' };
  }
}

// 클라이언트: 응답 체크
const result = await getCourse(id);
if (!result.success) {
  toast.error(result.error);
  return;
}
```

## 필수 환경 변수
`NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

## 핵심 개발 규칙

### 스타일링
- **Never edit** `/public/css/` (auto-generated from SCSS)
- **Instructor/Student**: SCSS (`/public/scss/`) + Bootstrap 5
- **Admin**: Tailwind + shadcn/ui + Admin SCSS (`/public/scss/admin/`)
- **Exception**: `app/globals.css` (Tailwind entry point)
- **Forbidden**: Inline styles (except debugging), CSS-in-JS

### 공통 Imports
```typescript
// Supabase 클라이언트
import { createClient } from '@/app/lib/supabase/server'; // Server Component
import { supabase } from '@/app/lib/supabase/client'; // Client Component

// Server Actions
import { createCourse, updateCourse } from '@/app/lib/actions/courseActions';
import { createLesson } from '@/app/lib/actions/lessonActions';

// 검증
import { z } from 'zod';
```

## 개발 노트
- Hydration 방지: Client 전용 기능에 `useState`/`useEffect`
- 테마: 쿠키 기반 지속성
- 파일 업로드: Base64 → Supabase Storage
- 테이블 정렬: `.table-header-align` 클래스 사용