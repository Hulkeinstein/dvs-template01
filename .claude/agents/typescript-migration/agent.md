# TypeScript Migration Agent

## 🎯 목적
DVS-TEMPLATE01 프로젝트를 JavaScript에서 TypeScript로 안전하게 마이그레이션

## 📋 Agent 정보
- **이름**: typescript-migration
- **전략**: Bottom-up + Sequential
- **범위**: 793개 JS/JSX 파일 중 핵심 200개
- **제외**: /data/ 폴더의 26개 데모 템플릿

## 🏗️ 마이그레이션 전략

### Bottom-up + Sequential 접근법
1. **의존성 그래프 분석**: 파일 간 의존 관계 파악
2. **Leaf 노드부터 시작**: 의존성 없는 파일부터 변환
3. **순차적 진행**: 한 번에 하나씩, 충돌 방지
4. **즉시 검증**: 각 파일 변환 후 타입 체크

## 📂 파일 변환 순서

### Phase 0: TypeScript 환경 설정
```bash
# 필요 패키지 설치
npm install --save-dev typescript @types/react @types/node @types/react-dom
npm install --save-dev @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

**tsconfig.json 설정**:
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules", "data/demo-*/**/*"]
}
```

### Phase 1: Foundation Layer (30 파일)

#### 1.1 Supabase Client (최우선)
```typescript
// app/lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export { supabase };
```

#### 1.2 Utils (app/lib/utils/)
- fileUpload.js → fileUpload.ts
- formatters.js → formatters.ts
- validators.js → validators.ts
- videoUtils.js → videoUtils.ts
- 기타 유틸리티 파일들

#### 1.3 공통 타입 정의
```typescript
// types/index.ts
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'instructor' | 'admin';
  phone?: string;
  avatar_url?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor_id: string;
  price: number;
  thumbnail_url?: string;
  // ... 기타 필드
}

export interface Lesson {
  id: string;
  course_id: string;
  topic_id?: string;
  title: string;
  content_type: 'video' | 'quiz' | 'assignment' | 'text';
  content_data?: any;
  order_index: number;
}
```

### Phase 2: Server Actions (13 파일, 55 함수)

#### 2.1 변환 패턴
```typescript
// Before (JS)
'use server';
export async function getCourseById(courseId) {
  // ...
}

// After (TS)
'use server';
import type { Course } from '@/types';

export async function getCourseById(courseId: string): Promise<Course | null> {
  // ...
}
```

#### 2.2 파일 목록 (우선순위 순)
1. courseActions.js (7 functions)
2. lessonActions.js (5 functions)
3. quizActions.js (6 functions)
4. userActions.js (4 functions)
5. enrollmentActions.js (5 functions)
6. uploadActions.js (3 functions)
7. orderActions.js (4 functions)
8. phoneActions.js (2 functions)
9. authActions.js (3 functions)
10. dashboardActions.js (5 functions)
11. topicActions.js (4 functions)
12. announcementActions.js (4 functions)
13. certificateActions.js (3 functions)

### Phase 3: Core Components (50 파일)

#### 3.1 Instructor Components (25)
- InstructorDashboard.jsx → InstructorDashboard.tsx
- CourseManagement 관련 컴포넌트
- LessonManagement 관련 컴포넌트
- QuizBuilder 관련 컴포넌트

#### 3.2 Student Components (15)
- StudentDashboard.jsx → StudentDashboard.tsx
- CourseEnrollment 관련 컴포넌트
- LessonViewer 관련 컴포넌트
- ProgressTracking 관련 컴포넌트

#### 3.3 Common Components (10)
- Header.jsx → Header.tsx
- Footer.jsx → Footer.tsx
- Navigation 관련 컴포넌트
- UI 공통 컴포넌트

### Phase 4: App Routes (30 파일)

#### 4.1 Dashboard Routes (15)
- app/(dashboard)/instructor/page.jsx → page.tsx
- app/(dashboard)/student/page.jsx → page.tsx
- 기타 대시보드 관련 라우트

#### 4.2 Course Routes (10)
- app/(courses)/courses/page.jsx → page.tsx
- app/(courses)/courses/[id]/page.jsx → page.tsx
- 기타 코스 관련 라우트

#### 4.3 API Routes (5)
- app/api/auth/[...nextauth]/route.js → route.ts
- 기타 API 라우트

## 🔍 변환 규칙

### 1. 'use server'/'use client' 지시문 유지
```typescript
'use server'; // 항상 파일 최상단
// 또는
'use client'; // 항상 파일 최상단
```

### 2. any 타입 점진적 제거
```typescript
// Step 1: 초기 변환 (any 허용)
const data: any = await supabase.from('courses').select();

// Step 2: 타입 정의 후 교체
const { data }: { data: Course[] | null } = await supabase.from('courses').select();
```

### 3. Props 타입 정의
```typescript
// 컴포넌트 Props
interface CourseCardProps {
  course: Course;
  onEnroll?: (courseId: string) => void;
  isEnrolled?: boolean;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onEnroll, isEnrolled = false }) => {
  // ...
};
```

### 4. 이벤트 핸들러 타입
```typescript
const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  // ...
};

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  // ...
};
```

## 📊 진행 추적

### 메트릭
- 총 파일: 793개
- 목표 파일: 200개
- 제외 파일: 593개 (데모, 정적 파일)

### 검증 체크리스트
- [ ] 타입 체크 통과 (tsc --noEmit)
- [ ] ESLint 검사 통과
- [ ] 빌드 성공 (npm run build)
- [ ] 개발 서버 정상 작동
- [ ] 기능 테스트 통과

## 🚨 주의사항

### 1. Service Role Key 보안
```typescript
// ❌ 잘못된 예: 클라이언트에서 사용
const supabase = createClient(url, SERVICE_ROLE_KEY); // 위험!

// ✅ 올바른 예: 서버에서만 사용
'use server';
const supabase = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!);
```

### 2. Next.js App Router 호환성
- Server Components는 기본적으로 async
- Client Components는 'use client' 지시문 필수
- Server Actions는 'use server' 지시문 필수

### 3. 점진적 마이그레이션
- allowJs: true로 JS/TS 공존 허용
- 한 번에 한 파일씩 변환
- 각 변환 후 즉시 테스트

## 📚 참고 자료

### Supabase 타입 생성
```bash
npx supabase gen types typescript --project-id "your-project-id" > types/database.types.ts
```

### ESLint 설정 (.eslintrc.json)
```json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "rules": {
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": "error"
  }
}
```

## 🔄 재개 지점
진행 상황은 progress.json 파일에 자동 저장되며, 중단된 지점부터 재개 가능합니다.

## 📝 로그
모든 변환 작업은 .claude/agents/typescript-migration/logs/ 폴더에 기록됩니다.