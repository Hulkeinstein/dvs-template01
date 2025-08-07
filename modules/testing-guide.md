# Testing Guide

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

## Manual Testing Checklist

### 1. Course Creation
- [ ] All required fields validation
- [ ] Thumbnail upload with preview
- [ ] File size limit (5MB)
- [ ] File type validation (images only)
- [ ] Success redirect to dashboard

### 2. Course Editing
- [ ] Load existing course data
- [ ] Update course information
- [ ] Add/Edit/Delete lessons
- [ ] Reorder lessons via drag-drop
- [ ] Save changes confirmation

### 3. Quiz System
- [ ] Create quiz with all 9 question types
- [ ] Video placeholder conversion
- [ ] Save and load quiz data
- [ ] Update existing quiz
- [ ] Delete quiz lesson

### 4. Error Handling
- [ ] Invalid course ID (404)
- [ ] Unauthorized access
- [ ] Network errors
- [ ] Validation errors

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
1. create_courses_tables.sql
2. 20250124_create_enrollment_tables.sql
3. 20250124_create_storage_bucket.sql
4. 20250207_add_course_topics.sql
5. 20250207_create_quiz_tables.sql
```

## Test Data

### 샘플 퀴즈 데이터
위치: `/constants/sampleQuizData.js`
- 9가지 문제 유형 모두 포함
- 즉시 테스트 가능한 데이터
- 유효성 검증 통과 확인됨

### 테스트 계정
- **교사**: instructor@test.com
- **학생**: student@test.com
- Google OAuth 로그인 사용

## 디버깅 팁

### Console 로그 확인 위치
1. 브라우저 개발자 도구 (클라이언트 에러)
2. VS Code 터미널 (서버 액션 로그)
3. Supabase 대시보드 (데이터베이스 쿼리)

### 자주 발생하는 에러
- **Hydration Error**: `useEffect` 사용 확인
- **Zod Validation Error**: 스키마와 데이터 타입 확인
- **Supabase Permission Error**: RLS 정책 확인
- **CORS Error**: API 엔드포인트 설정 확인