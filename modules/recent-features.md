# 최근 구현된 기능들

## 1. 파일 업로드 시스템 (2025-01-25)
**문제**: Server actions은 File 객체를 직접 받을 수 없음
**해결책**: 클라이언트에서 Base64 변환, 서버에서 디코드
```javascript
// 클라이언트: 파일을 Base64로 변환
const base64 = await fileToBase64(file)
// 서버: Base64를 Blob으로 변환
const blob = base64ToBlob(base64Data)
```
**파일**:
- `/app/lib/utils/fileUpload.js` - 유틸리티 함수
- `/app/lib/actions/uploadActions.js` - Base64용으로 수정됨

## 2. 코스 편집 페이지 (2025-01-25)
**경로**: `/instructor/courses/[id]/edit`
**기능**:
- 코스 정보 편집
- 레슨 관리 (CRUD)
- 드래그앤드롭 레슨 재정렬
- 실시간 저장 및 성공 피드백
**파일**:
- `/components/Instructor/EditCourse.js` - 메인 컴포넌트
- `/components/Instructor/LessonItem.js` - 드래그 가능한 레슨
- `/components/Instructor/AddLessonModal.js` - 레슨 추가
- `/components/Instructor/EditLessonModal.js` - 레슨 편집

## 3. 레슨 관리 시스템 (2025-01-25)
**Server Actions**: `/app/lib/actions/lessonActions.js`
- `createLesson` - 자동 정렬로 새 레슨 추가
- `updateLesson` - 레슨 상세 편집
- `deleteLesson` - 삭제 및 남은 항목 재정렬
- `reorderLessons` - 드래그앤드롭 재정렬
- `getLessonsByCourse` - 정렬된 레슨 가져오기

## 4. Import 수정 (2025-01-25)
**문제**: `CourseWidgets` (복수) → `CourseWidget` (단수)
**수정된 파일**:
- `/components/Instructor/MyCourses.js`
- `/components/Instructor/Eenrolled-Course.js`
- `/components/Instructor/Wishlist.js`

## 5. 역할 기반 UI 개선 (2025-01-26)
**기능**: CourseWidget에 역할별 UI 차별화
**구현**:
- `userRole` prop 추가 (student/instructor)
- 학생: 북마크 버튼 + Hot 배지 표시
- 교사: Hot 배지만 표시
**파일**:
- `/components/Instructor/Dashboard-Section/widgets/CourseWidget.js`
- `/components/Instructor/MyCourses.js`

## 6. 퀴즈 시스템 구현 (2025-02-07)
**주요 기능**: Quill 에디터를 통한 완전한 퀴즈 시스템
**구성요소**:
- 9가지 문제 유형 지원
- Quill 리치 텍스트 에디터 통합
- 비디오 플레이스홀더 시스템
- 객관식 문제 자동 채점

**기술적 세부사항**:
- 검증을 위한 Zod v3.25.76
- Supabase에 JSONB 저장
- 부분 점수 지원
- 실시간 미리보기

**생성/수정된 파일**:
- `/components/Lesson/CreateLessonQuiz.js`
- `/components/Lesson/QuillQuizEditor.js`
- `/components/Lesson/QuizQuestionTypes/` (9 components)
- `/app/lib/actions/quizActions.js`
- `/app/lib/utils/videoUtils.js`
- `/constants/sampleQuizData.js`

## 7. 수료증 시스템 (2025-01-31)
**상태**: 구현되었지만 비활성화
**기능**:
- @react-pdf/renderer로 PDF 생성
- 고유 인증 코드
- QR 코드 지원 (계획)
- 다양한 템플릿 (계획)

**활성화**: 등록 시스템 완성 필요
**파일**:
- `/app/lib/certificate/` - 완전한 모듈
- `/app/(dashboard)/student/certificates/` - UI 페이지
- `/supabase/migrations/20250131_create_certificates_table.sql`