# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Language Preference
- 사용자는 한국인이므로 모든 대화는 한국어로 진행하세요
- 기술 용어나 코드 관련 용어는 영어를 그대로 사용해도 됩니다
- 설명과 응답은 한국어로 작성하세요

## UI Development Rules
- **템플릿 UI를 반드시 유지하고 사용하세요** - 기존 UI 컴포넌트와 스타일을 그대로 활용
- **모든 기능을 완전히 구현하세요** - UI에 있는 모든 버튼, 입력 필드, 기능을 작동하도록 구현
- **절대 UI 요소를 삭제하지 마세요** - 사용자의 명시적 지시 없이는 어떤 UI 요소도 제거 금지
- **기존 템플릿의 디자인 패턴을 따르세요** - 새로운 기능 추가 시에도 템플릿의 스타일 가이드 준수
- **하드코딩된 데이터는 동적으로 변경하되, UI 구조는 유지하세요**

## Important Notes
- The development server is already running on port 3000. DO NOT start a new dev server.
- If you need to restart the server, ask the user first.
- When committing, always run lint and typecheck commands first if available.

## Dashboard Implementation Status (2025-01-25)

### 교사 대시보드 (90% 완성)
**구현됨:**
- 통합 대시보드 리다이렉트
- 통계 표시 (등록 코스, 학생 수, 수익)
- 학생 관리 페이지
- 코스 생성 페이지 (파일 업로드 Base64 처리)
- 내 코스 목록 페이지 (실시간 데이터 연동)
- 코스 편집 페이지 (`/instructor/courses/[id]/edit`)
- 레슨 관리 UI (추가/수정/삭제/드래그앤드롭 재정렬)

**필요함:**
- 코스 삭제 기능 (P2)
- 코스 미리보기 기능 (P2)

### 학생 대시보드 (30% 완성)
**구현됨:**
- 기본 통계 표시 (하드코딩)
- 사이드바 메뉴 구조

**필요함:**
- 코스 등록 기능 (P0)
- 실제 등록 코스 표시 (P1)
- 진도 추적 시스템 (P1)
- 퀴즈/과제 현황 (P2)

### 코스 시스템 (70% 완성)
**구현됨:**
- 데이터베이스 스키마
- 코스 CRUD 서버 액션 (생성/읽기/수정/삭제)
- 파일 업로드 기능 (Base64 변환 방식)
- 코스 목록 페이지 실제 데이터 연동
- 레슨 관리 시스템 (CRUD + 순서 재정렬)
- CourseWidget 컴포넌트 import 오류 수정

**필요함:**
- 코스 등록/결제 프로세스
- 리뷰 시스템
- 코스 상세 페이지 (학생용)

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
- **File uploads**: Use Base64 conversion for server actions, then upload to Supabase Storage

## TDD Development Guidelines

### When to Use TDD
**Use TDD for:**
- Complex business logic (authentication, authorization)
- Data validation and transformation
- Server actions with multiple steps
- Payment processing
- Critical algorithms

**Skip TDD for:**
- Simple UI components
- Basic CRUD operations
- Styling changes
- Static pages
- Simple form inputs

### Token Efficiency Strategy
1. **Core Logic First**: Write tests only for complex logic
2. **Integration Tests**: Combine multiple unit tests into one
3. **Manual Testing**: Use for UI and visual components
4. **Selective Coverage**: 80/20 rule - test 20% that covers 80% of critical paths

### Test Priority Levels
- **P0**: Authentication, Authorization, Payment
- **P1**: Data validation, File uploads, Core business logic
- **P2**: UI components with complex state
- **P3**: Simple CRUD, Static components

## Recently Implemented Features (2025-01-25)

### 1. File Upload System
**Problem**: Server actions cannot receive File objects directly
**Solution**: Base64 conversion in client, decode in server
```javascript
// Client: Convert file to Base64
const base64 = await fileToBase64(file)
// Server: Convert Base64 to Blob
const blob = base64ToBlob(base64Data)
```
**Files**:
- `/app/lib/utils/fileUpload.js` - Utility functions
- `/app/lib/actions/uploadActions.js` - Modified for Base64

### 2. Course Edit Page
**Route**: `/instructor/courses/[id]/edit`
**Features**:
- Course information editing
- Lesson management (CRUD)
- Drag-and-drop lesson reordering
- Real-time save with success feedback
**Files**:
- `/components/Instructor/EditCourse.js` - Main component
- `/components/Instructor/LessonItem.js` - Draggable lesson
- `/components/Instructor/AddLessonModal.js` - Add lesson
- `/components/Instructor/EditLessonModal.js` - Edit lesson

### 3. Lesson Management System
**Server Actions**: `/app/lib/actions/lessonActions.js`
- `createLesson` - Add new lesson with auto-ordering
- `updateLesson` - Edit lesson details
- `deleteLesson` - Remove and reorder remaining
- `reorderLessons` - Drag-and-drop reordering
- `getLessonsByCourse` - Fetch ordered lessons

### 4. Import Fixes
**Issue**: `CourseWidgets` (plural) → `CourseWidget` (singular)
**Fixed Files**:
- `/components/Instructor/MyCourses.js`
- `/components/Instructor/Eenrolled-Course.js`
- `/components/Instructor/Wishlist.js`

### 5. Role-based UI Enhancement (2025-01-26)
**Feature**: CourseWidget에 역할별 UI 차별화
**Implementation**:
- `userRole` prop 추가 (student/instructor)
- 학생: 북마크 버튼 + Hot 배지 표시
- 교사: Hot 배지만 표시
**Files**:
- `/components/Instructor/Dashboard-Section/widgets/CourseWidget.js`
- `/components/Instructor/MyCourses.js`

## Admin Features Guidelines (To Be Implemented)

### Admin 구현 시 필요한 체크리스트

#### 1. 권한 시스템
- [ ] Admin role 정의 및 데이터베이스 스키마 업데이트
- [ ] 역할 기반 접근 제어(RBAC) 시스템 설계
- [ ] Admin 전용 미들웨어/가드 구현

#### 2. Admin 전용 기능
- [ ] 모든 코스 상태에서 편집 권한
- [ ] 일반 워크플로우 우회 권한
- [ ] 사용자 관리 (role 변경, 계정 활성화/비활성화)
- [ ] 시스템 전체 통계 및 모니터링
- [ ] 긴급 콘텐츠 수정 권한

#### 3. 보안 고려사항
- [ ] 서버 사이드 권한 검증 필수
- [ ] Admin 액션 로깅 시스템
- [ ] 2단계 인증 고려
- [ ] IP 화이트리스트 고려

#### 4. UI/UX 고려사항
- [ ] Admin 전용 대시보드 필요 여부
- [ ] 일반 사용자 UI에서 Admin 기능 표시 방법
- [ ] Admin 모드 토글 기능
- [ ] 위험한 액션에 대한 확인 다이얼로그

#### 5. 데이터베이스 고려사항
- [ ] Admin 액션 로그 테이블
- [ ] 권한 관리 테이블 구조
- [ ] 감사(Audit) 추적 기능

## Testing Guide

### Manual Testing Checklist
1. **Course Creation**
   - [ ] All required fields validation
   - [ ] Thumbnail upload with preview
   - [ ] File size limit (5MB)
   - [ ] File type validation (images only)
   - [ ] Success redirect to dashboard

2. **Course Editing**
   - [ ] Load existing course data
   - [ ] Update course information
   - [ ] Add/Edit/Delete lessons
   - [ ] Reorder lessons via drag-drop
   - [ ] Save changes confirmation

3. **Error Handling**
   - [ ] Invalid course ID (404)
   - [ ] Unauthorized access
   - [ ] Network errors
   - [ ] Validation errors

### Common Issues & Solutions

**File Upload Fails**
- Check file size < 5MB
- Verify file type is image
- Check Supabase bucket exists
- Verify bucket permissions

**Lesson Reorder Not Working**
- Check `@dnd-kit` packages installed
- Verify lesson IDs are unique
- Check order_index values in DB

**Edit Button Not Working**
- Verify course ID is passed correctly
- Check route exists: `/instructor/courses/[id]/edit`
- Verify user owns the course

## Development Roadmap (2025-01-26)

### Phase 1: Core Platform Completion (Week 1-2) - CURRENT PRIORITY
**목표**: 학생과 교사가 실제로 사용할 수 있는 핵심 기능 완성

#### Week 1: Student Core Features
- **Day 1-2**: Course Enrollment Process
  - [ ] Course detail page for students (`/courses/[id]`)
  - [ ] **Bookmark functionality (add/remove)**
  - [ ] Enrollment/Purchase flow
  - [ ] Payment integration (Stripe/Local payment)
  
- **Day 3-4**: Learning System
  - [ ] Lesson viewer page (`/lesson/[id]`)
  - [ ] Video player with progress tracking
  - [ ] Lesson completion logic
  
- **Day 5**: Student Dashboard Completion
  - [ ] Display enrolled courses (real data)
  - [ ] **Display bookmarked courses section**
  - [ ] Progress tracking UI
  - [ ] Next lesson recommendations

#### Week 2: Supporting Features
- **Day 1-2**: Review & Rating System
  - [ ] Review submission form
  - [ ] Rating display on courses
  - [ ] Instructor review management
  
- **Day 3**: Search & Discovery
  - [ ] Course search functionality
  - [ ] Category/Level filters
  - [ ] Featured courses section
  
- **Day 4-5**: Testing & Bug Fixes
  - [ ] Full user journey testing
  - [ ] Payment flow verification
  - [ ] Performance optimization

### Phase 2: Admin System Integration (Week 3)
**목표**: PreSkool 템플릿을 활용한 관리자 대시보드 구축

- **Day 1**: PreSkool Setup
  - [ ] Install PreSkool React TS version
  - [ ] Configure subdomain (admin.domain.com)
  
- **Day 2-3**: Authentication Integration
  - [ ] Implement SSO between main app and PreSkool
  - [ ] Admin role verification
  
- **Day 4-5**: Data Integration
  - [ ] API endpoints for PreSkool
  - [ ] **Badge management system (Hot/New/Featured)**
  - [ ] **Database fields for badge states**
  - [ ] Data synchronization
  
- **Day 6-7**: Testing & Deployment
  - [ ] Integration testing
  - [ ] Production deployment

### Phase 3: Enhancement & Optimization (Week 4+)
- Mobile app consideration
- Advanced analytics
- AI-powered recommendations
- Multi-language support

## Priority Matrix

### P0 - Critical (Must have for launch)
- [ ] Student course enrollment
- [ ] Payment processing
- [ ] Lesson viewing
- [ ] Progress tracking
- [ ] Basic admin dashboard

### P1 - Important (Should have)
- [ ] Review system
- [ ] Course search
- [ ] Email notifications
- [ ] Certificate generation
- [ ] Advanced analytics

### P2 - Nice to have
- [ ] Social features
- [ ] Mobile app
- [ ] AI recommendations
- [ ] Gamification
- [ ] Multi-language

## Technical Decisions

### Admin Dashboard Strategy
**Decision**: Use PreSkool template as separate admin system
**Rationale**: 
- Faster implementation (1 week vs 4-6 weeks)
- Professional UI/UX out of the box
- Cost-effective ($59 one-time)
- Focus on core platform first

### Integration Approach
- Subdomain deployment (admin.domain.com)
- Shared Supabase database
- JWT-based SSO
- API-based data sync

## Overall Project Status (2025-01-26)

### Completed ✅
- Instructor dashboard (90%)
- Course creation/editing
- Lesson management
- Basic authentication
- Database schema

### In Progress 🚧
- Student enrollment system
- Payment integration
- Learning experience

### Not Started ❌
- Admin dashboard
- Review system
- Mobile app
- Advanced analytics

### Estimated Completion
- **Core Platform**: 2 weeks
- **Admin System**: 1 week
- **Full MVP**: 3-4 weeks

## Planned Features

### Badge System (Week 3)
**Database Changes**:
```sql
ALTER TABLE courses 
ADD COLUMN is_hot BOOLEAN DEFAULT false,
ADD COLUMN is_new BOOLEAN DEFAULT false,
ADD COLUMN is_featured BOOLEAN DEFAULT false,
ADD COLUMN badge_text VARCHAR(50);
```

**Admin Features**:
- Toggle badges on course list
- Bulk badge operations
- Auto-badge rules (e.g., new courses < 7 days)

### Bookmark System (Week 1)
**Database Changes**:
```sql
CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);
```

**Features**:
- Add/Remove bookmark API
- My Bookmarks section in student dashboard
- Bookmark count on courses