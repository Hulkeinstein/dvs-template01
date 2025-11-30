# Assignment Modal 개선 - Work Plan

**Status**: Active
**Created**: 2025-11-29
**Branch**: `feature/assignment-template-system`
**Issue**: #10

---

## Overview
목표: Assignment 모달 UX 개선 및 버그 수정
예상 시간: 2-3시간
복잡도: Standard

---

## Phases

### P0: 완료된 작업
- [x] QuillWrapper 에디터 적용
- [x] 자동저장 UI 미니멀화
- [x] LessonModal 디버그 패널 삭제

### P1: Static Backdrop 적용 ✅
- [x] AssignmentModal.tsx - `data-bs-backdrop="static"` 추가
- [x] LessonModal.tsx - `data-bs-backdrop="static"` 추가
- [x] QuizModal.tsx - `data-bs-backdrop="static"` 추가
- [x] TopicModal.tsx - `data-bs-backdrop="static"` 추가

### P2: Assignment 타입 통일 & 수정 기능 ✅
- [x] `AssignmentLesson` 타입으로 통일
- [x] `as any` 제거 (Lesson.tsx)
- [x] Question.js → Question.tsx 변환
- [x] 저장 버그 수정 (handleSubmit result 체크)

### P3: 템플릿 팝업 개선 (MEDIUM) ⏳
- [ ] `prompt()` 제거
- [ ] 인라인 템플릿 이름 입력 UI
- 별도 브랜치로 분리 가능

### 🟢 LOW - 추후 (다른 브랜치)
- [ ] Time Limit: Date picker 추가 검토
- [ ] Supabase Storage 파일 업로드 연동

---

## 파일 목록

| 파일 | 작업 |
|------|------|
| `components/create-course/QuizModals/AssignmentModal.tsx` | P1, P3 |
| `components/create-course/QuizModals/LessonModal.tsx` | P1 |
| `components/create-course/QuizModals/QuizModal.tsx` | P1 |
| `components/create-course/TopicModal.tsx` | P1 |
| `components/create-course/CreateCourse.tsx` | P2 |

---

## 커밋 계획

```bash
# P1 완료 후
git commit -m "fix(modals): add static backdrop to prevent accidental close"

# P2 완료 후
git commit -m "feat(assignment): enable editing saved assignments"

# P3 완료 후
git commit -m "feat(assignment): replace prompt with custom modal for template save"

# PR 생성
gh pr create --title "feat: Assignment 모달 개선 - Closes #10"
```

---

## Progress Log

### 2025-11-30 - P1, P2 완료
- Static Backdrop 모든 모달에 적용
- AssignmentLesson 타입 통일, `as any` 제거
- Question.js → Question.tsx 변환
- 저장 버그 수정 (handleSubmit void return 처리)
- 다음: P3 또는 PR 생성

### 2025-11-29 - P0 완료
- QuillWrapper 적용 완료
- 자동저장 UI 미니멀화 완료
- 디버그 패널 삭제 완료
