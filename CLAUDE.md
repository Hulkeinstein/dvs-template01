<<<<<<< HEAD
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important Notes
- The development server is already running on port 3000. DO NOT start a new dev server.
- If you need to restart the server, ask the user first.

## Development Commands

### Core Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run Next.js linting
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

### Testing
This project does not currently have a test suite configured. Consider adding testing framework if implementing new features.

## Architecture Overview

### Tech Stack
- **Next.js 14** with App Router
- **Supabase** for database and authentication
- **NextAuth.js** for OAuth (Google) authentication
- **Bootstrap 5** with custom SCSS
- **Redux + Context API** for state management

### Project Structure
```
app/                    # Next.js App Router pages
├── (dashboard)/        # Role-based dashboard routes
├── (courses)/          # Course and lesson management
├── (pages)/            # General pages
├── lib/                # Server actions and utilities
└── api/                # API routes (NextAuth)

components/             # React components organized by feature
├── Instructor/         # Instructor dashboard components
├── Student/           # Student dashboard components
├── Lesson/            # Quiz and lesson components
├── Auth/              # Authentication components
└── [feature]/         # Feature-specific components

data/                  # Static JSON data files
context/               # React Context providers
redux/                 # Redux store and reducers
```

### Key Architecture Patterns

#### Authentication & Authorization
- **NextAuth.js** handles OAuth with Google
- **Role-based access control** (instructor/student roles)
- **RoleProtection component** prevents hydration errors by mounting client-side only
- Users are automatically created in Supabase on first login with 'student' role

#### Data Flow
- **Server Components** for data fetching (instructor dashboard uses server actions)
- **Client Components** for interactive features
- **Server Actions** in `app/lib/actions/` for Supabase operations
- **Named exports** for Supabase client (`export { supabase }`)

#### Theme System
- **Cookie-based theme persistence** prevents dark mode flicker
- **Server-side theme detection** in root layout
- **Context API** manages theme state client-side

### Database Schema (Supabase)
Key tables:
- `user` - User profiles with role field
- `courses` - Course information with instructor_id
- `enrollments` - Course enrollments
- `orders` - Payment/enrollment records

### Component Guidelines

#### Dashboard Components
- **Instructor Dashboard**: Uses dynamic data from server actions
- **Student Dashboard**: Uses static data from JSON files
- **CounterWidget**: Animated statistics using Odometer library

#### Quiz System
- **8 question types**: Single/multiple choice, true/false, fill-in-blanks, ordering, etc.
- **Drag & drop** using @dnd-kit for ordering questions
- **Timer functionality** with configurable time limits
- **Rich text editor** with Jodit React

#### State Management
- **Redux** for cart functionality
- **Context API** for global UI state (theme, mobile menu, etc.)
- **NextAuth session** for authentication state

### Environment Variables Required
```
NEXTAUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

### Import Patterns
- Use `@/` alias for absolute imports (configured in jsconfig.json)
- Server actions use named imports: `import { supabase } from '@/app/lib/supabase/client'`
- Components follow feature-based organization

### Development Notes
- **Hydration error prevention**: Use `useState` with `useEffect` for client-only features
- **Theme management**: Cookie-based persistence with server-side detection
- **Role-based routing**: Protected routes redirect based on user role
- **Performance**: Server components for data fetching, client components minimized

This is a comprehensive educational platform supporting multiple templates (26+ variations) for different educational contexts like universities, language schools, coaching centers, etc.
=======
# CSS를 SCSS로 변환하는 가이드

## 1. 수동 변환 방법

### 기본 변환 규칙

#### 1.1 중첩 구조로 변환
```css
/* CSS */
.header {
  background: #000;
}
.header .logo {
  width: 200px;
}
.header .nav {
  display: flex;
}
.header .nav a {
  color: white;
}

/* SCSS로 변환 */
.header {
  background: #000;
  
  .logo {
    width: 200px;
  }
  
  .nav {
    display: flex;
    
    a {
      color: white;
    }
  }
}
```

#### 1.2 변수 사용
```css
/* CSS (반복되는 값) */
.button {
  background: #007bff;
  border: 1px solid #007bff;
}
.link {
  color: #007bff;
}

/* SCSS로 변환 */
$primary-color: #007bff;

.button {
  background: $primary-color;
  border: 1px solid $primary-color;
}
.link {
  color: $primary-color;
}
```

#### 1.3 &(부모 참조) 사용
```css
/* CSS */
.button {
  background: blue;
}
.button:hover {
  background: darkblue;
}
.button.active {
  background: red;
}

/* SCSS로 변환 */
.button {
  background: blue;
  
  &:hover {
    background: darkblue;
  }
  
  &.active {
    background: red;
  }
}
```

## 2. 온라인 도구 사용

### 추천 온라인 변환기
1. **CSS to SCSS Converter**: https://css2sass.herokuapp.com/
2. **CSS 2 SASS/SCSS Converter**: https://beautifytools.com/css-to-scss-converter.php

## 3. 프로젝트별 변환 스크립트

```javascript
// convert-css-to-scss.js
const fs = require('fs');
const path = require('path');

function convertCssToScss(cssContent) {
  // 간단한 중첩 변환 로직
  let scss = cssContent;
  
  // 1. 미디어 쿼리 처리
  scss = scss.replace(/@media\s+([^{]+)\s*{([^}]+)}/g, (match, query, content) => {
    return `@media ${query} {\n${content}\n}`;
  });
  
  // 2. 주석 스타일 유지
  // CSS 주석은 SCSS에서도 동일하게 작동
  
  return scss;
}

// 사용 예시
const cssFile = './public/css/custom.css';
const scssFile = './public/scss/custom.scss';

if (fs.existsSync(cssFile)) {
  const cssContent = fs.readFileSync(cssFile, 'utf8');
  const scssContent = convertCssToScss(cssContent);
  fs.writeFileSync(scssFile, scssContent);
  console.log(`변환 완료: ${cssFile} → ${scssFile}`);
}
```

## 4. 프로젝트에 적용하기

### 4.1 현재 프로젝트 구조
```
public/
├── css/          # 컴파일된 CSS 파일들
└── scss/         # SCSS 소스 파일들
    ├── styles.scss    # 메인 SCSS 파일
    ├── default/       # 기본 스타일
    ├── elements/      # 컴포넌트 스타일
    ├── header/        # 헤더 관련
    └── ...
```

### 4.2 변환 워크플로우
1. 수정한 CSS 파일 찾기
2. 해당하는 SCSS 파일 찾기
3. CSS 변경사항을 SCSS 문법으로 변환
4. SCSS 파일에 적용
5. `npm run dev`로 확인

## 5. 주의사항

1. **변수 활용**: 반복되는 색상, 크기는 SCSS 변수로 변환
2. **중첩 깊이**: 3단계 이상 중첩은 피하기
3. **믹스인 활용**: 반복되는 스타일 블록은 믹스인으로
4. **파일 분리**: 큰 파일은 기능별로 분리하여 import

## 6. 검증 방법

```bash
# SCSS 컴파일 후 원본 CSS와 비교
sass public/scss/styles.scss public/css/styles-compiled.css
diff public/css/styles.css public/css/styles-compiled.css
```
>>>>>>> c24937f (feat: 통합 대시보드 구현 및 라우팅 개선)
