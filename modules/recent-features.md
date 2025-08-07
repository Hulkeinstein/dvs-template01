# Recently Implemented Features

## 1. File Upload System (2025-01-25)
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

## 2. Course Edit Page (2025-01-25)
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

## 3. Lesson Management System (2025-01-25)
**Server Actions**: `/app/lib/actions/lessonActions.js`
- `createLesson` - Add new lesson with auto-ordering
- `updateLesson` - Edit lesson details
- `deleteLesson` - Remove and reorder remaining
- `reorderLessons` - Drag-and-drop reordering
- `getLessonsByCourse` - Fetch ordered lessons

## 4. Import Fixes (2025-01-25)
**Issue**: `CourseWidgets` (plural) → `CourseWidget` (singular)
**Fixed Files**:
- `/components/Instructor/MyCourses.js`
- `/components/Instructor/Eenrolled-Course.js`
- `/components/Instructor/Wishlist.js`

## 5. Role-based UI Enhancement (2025-01-26)
**Feature**: CourseWidget에 역할별 UI 차별화
**Implementation**:
- `userRole` prop 추가 (student/instructor)
- 학생: 북마크 버튼 + Hot 배지 표시
- 교사: Hot 배지만 표시
**Files**:
- `/components/Instructor/Dashboard-Section/widgets/CourseWidget.js`
- `/components/Instructor/MyCourses.js`

## 6. Quiz System Implementation (2025-02-07)
**Major Feature**: Complete quiz system with Quill editor
**Components**:
- 9 question types support
- Quill rich text editor integration
- Video placeholder system
- Auto-grading for objective questions

**Technical Details**:
- Zod v3.25.76 for validation
- JSONB storage in Supabase
- Partial scoring support
- Real-time preview

**Files Created/Modified**:
- `/components/Lesson/CreateLessonQuiz.js`
- `/components/Lesson/QuillQuizEditor.js`
- `/components/Lesson/QuizQuestionTypes/` (9 components)
- `/app/lib/actions/quizActions.js`
- `/app/lib/utils/videoUtils.js`
- `/constants/sampleQuizData.js`

## 7. Certificate System (2025-01-31)
**Status**: Implemented but inactive
**Features**:
- PDF generation with @react-pdf/renderer
- Unique verification codes
- QR code support (planned)
- Multiple templates (planned)

**Activation**: Requires enrollment system completion
**Files**:
- `/app/lib/certificate/` - Complete module
- `/app/(dashboard)/student/certificates/` - UI pages
- `/supabase/migrations/20250131_create_certificates_table.sql`