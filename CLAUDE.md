# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important Notes
- The development server is already running on port 3000. DO NOT start a new dev server.
- If you need to restart the server, ask the user first.
- When committing, always run lint and typecheck commands first if available.

## Dashboard Implementation Status (2025-01-24)

### 교사 대시보드 (65% 완성)
**구현됨:**
- 통합 대시보드 리다이렉트
- 통계 표시 (등록 코스, 학생 수, 수익)
- 학생 관리 페이지
- 코스 생성 페이지

**필요함:**
- 내 코스 목록 페이지 (P0)
- 코스 편집 페이지 (P0)
- 레슨 관리 UI (P1)
- 코스 삭제 기능 (P2)

### 학생 대시보드 (30% 완성)
**구현됨:**
- 기본 통계 표시 (하드코딩)
- 사이드바 메뉴 구조

**필요함:**
- 코스 등록 기능 (P0)
- 실제 등록 코스 표시 (P1)
- 진도 추적 시스템 (P1)
- 퀴즈/과제 현황 (P2)

### 코스 시스템 (40% 완성)
**구현됨:**
- 데이터베이스 스키마
- 코스 생성 서버 액션
- 파일 업로드 기능

**필요함:**
- 코스 목록 페이지 실제 데이터 연동
- 코스 등록/결제 프로세스
- 리뷰 시스템

## Critical Development Rules
- **NEVER modify CSS files directly**. This project uses SCSS exclusively.
- **ALWAYS use SCSS files** for styling. CSS files are generated automatically from SCSS.
- When making style changes:
  1. Find or create the appropriate SCSS file in `/public/scss/`
  2. Import new SCSS files in `/public/scss/styles.scss`
  3. Remove any CSS imports from component files
- Do NOT import CSS files in `app/layout.js` or component files

## Development Commands

### Core Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run Next.js linting (run before commit)
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

### Database Migrations
```bash
# Run migrations in Supabase SQL Editor in this order:
1. create_courses_tables.sql (if not already created)
2. 20250124_create_enrollment_tables.sql
3. 20250124_create_storage_bucket.sql
```

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

### Database Schema (Supabase)
Current tables:
- `user` - User profiles with role field
- `courses` - Course information with instructor_id
- `lessons` - Course lessons with order_index
- `course_settings` - Course configuration
- `enrollments` - Student course enrollments with progress
- `orders` - Payment/enrollment records
- `lesson_progress` - Individual lesson completion tracking
- `phone_verifications` - Phone number verification

### Key Architecture Patterns

#### Authentication & Authorization
- **NextAuth.js** handles OAuth with Google
- **Role-based access control** (instructor/student roles)
- **Phone verification** required for certain actions
- Users are automatically created in Supabase on first login with 'student' role

#### Data Flow
- **Server Components** for data fetching
- **Server Actions** in `app/lib/actions/` for Supabase operations
- **Client Components** for interactive features
- **Named exports** for Supabase client (`export { supabase }`)

#### API Response Format
- `/api/user/profile` returns user object directly (not wrapped)

### Environment Variables Required
```
NEXTAUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

### Common Issues & Solutions

#### Supabase Warnings
- "@supabase/realtime-js" warnings are normal and can be ignored
- They don't affect functionality

#### Course Creation
- Ensure user role is 'instructor' in Supabase
- Check `/api/user/profile` is returning correct format

### Development Notes
- **Hydration error prevention**: Use `useState` with `useEffect` for client-only features
- **Theme management**: Cookie-based persistence with server-side detection
- **Role-based routing**: Protected routes redirect based on user role
- **Performance**: Server components for data fetching, client components minimized
- **File uploads**: Use Supabase Storage for course thumbnails and lesson videos