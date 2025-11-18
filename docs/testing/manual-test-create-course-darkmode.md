# Create Course 다크모드 + TypeScript 변환 수동 테스트

**테스트 일자**: 2025-11-18
**커밋**: e90c2cf - style(create-course): fix dark mode + migrate to TypeScript
**테스트 대상**:
- 다크모드 스타일 수정 (Checkbox, Select, Modal, Jodit Editor)
- TypeScript 변환 (7개 파일)

---

## 🚀 테스트 시작

### 1. 서버 실행
```bash
npm run dev
```
포트 3000에서 개발 서버가 실행되어야 합니다.

### 2. 페이지 접근
- URL: http://localhost:3000/create-course
- F12 → Console 탭에서 에러 확인

---

## 📋 테스트 체크리스트

### Phase 1: 다크모드 전환 (5분)

**테마 전환**: 우측 상단 테마 토글 버튼으로 라이트 ↔ 다크 모드 전환

#### 1.1 Checkbox/Radio 버튼
- [ ] **라이트 모드**: 체크박스 배경색이 흰색/연한색
- [ ] **다크 모드**: 체크박스 배경색이 어두운 색 (`var(--color-bodyest)`)
- [ ] **체크 시**: 파란색 배경 + 체크 표시 보임
- [ ] **라디오 버튼**: 동일하게 작동

**테스트 위치**: Course Info 섹션의 "Enable Course Review" 등 체크박스

---

#### 1.2 Select Dropdown
- [ ] **"Select Video Sources"** 드롭다운
  - 다크 모드: 배경색 어두움, 텍스트 흰색
  - 화살표 아이콘 보임 (흰색)
- [ ] **Category 드롭다운**: 동일
- [ ] **Course Level**: 동일
- [ ] **Course Language**: 동일
- [ ] **드롭다운 열기**: 옵션 목록도 어두운 배경

**테스트 방법**: 각 드롭다운 클릭하여 열어보기

---

#### 1.3 Modal 요소

##### TopicModal
- [ ] "Add Topic" 버튼 클릭
- [ ] **Modal 헤더**: "Add Topic" 텍스트가 흰색
- [ ] **Modal Body**: 입력 필드 레이블과 placeholder 읽기 가능
- [ ] **Modal Footer**: "Cancel", "Add Topic" 버튼 텍스트 보임

##### LessonModal
- [ ] Topic 하나 추가 후 "Lesson" 버튼 클릭
- [ ] Modal 헤더 "Add Lesson" 흰색
- [ ] Jodit Editor 툴바 아이콘들 보임 (Bold, Italic, Link 등)
- [ ] Editor hover 시 배경색 변경 확인

##### QuizModal
- [ ] "Quiz" 버튼 클릭
- [ ] Step 1, 2, 3 모두 진행하며 텍스트 가독성 확인
- [ ] Question Type 드롭다운 (True/False, Single Choice 등)
- [ ] Modal Footer 버튼들 보임

##### AssignmentModal
- [ ] "Assignment" 버튼 클릭
- [ ] Modal 헤더, Body, Footer 모두 다크 모드에서 읽기 가능
- [ ] Jodit Editor 툴바 확인

---

### Phase 2: TypeScript 변환 기능 테스트 (10분)

#### 2.1 Topic 관리
- [ ] **추가**: "Add Topic" → 이름 "React Basics", 요약 입력 → "Add Topic" 버튼
  - 결과: Topic이 Curriculum 섹션에 추가됨
- [ ] **확장/축소**: Topic 제목 클릭 시 Accordion 열림/닫힘
- [ ] **삭제**: Topic 우측 휴지통 아이콘 클릭 → 삭제됨
- [ ] **편집**: Topic 연필 아이콘 클릭 → UpdateModal 열림 → 수정 가능

---

#### 2.2 Lesson 추가 (LessonModal.tsx)
- [ ] Topic 하나 추가 후 "Lesson" 버튼 클릭
- [ ] **입력**:
  - Lesson Title: "Introduction to React"
  - Video URL: `https://www.youtube.com/watch?v=example`
  - Video Source: "Youtube" 선택
  - Duration: 10
- [ ] **파일 첨부**: "Attachments" 섹션에서 파일 업로드 (선택)
- [ ] **저장**: "Add Lesson" 버튼 클릭
- [ ] **결과**: Topic 아래에 "Introduction to React" 레슨 표시됨
  - 아이콘: 비디오 아이콘
  - 시간: "10 min"

---

#### 2.3 Quiz 추가 (QuizModal.tsx)
- [ ] Topic의 "Quiz" 버튼 클릭

**Step 1: Quiz Info**
- [ ] Quiz Title: "React Fundamentals Quiz"
- [ ] Quiz Summary: "Test your React knowledge"
- [ ] "Save & Next" 클릭

**Step 2: Questions**
- [ ] "Add Question" 버튼 클릭 (토글 OFF → 질문 입력 폼 표시)
- [ ] Question Type: "True/False" 선택
- [ ] Question: "React is a JavaScript library?"
- [ ] Correct Answer: True 선택
- [ ] Points: 10
- [ ] "Add Question" 버튼 클릭
  - 결과: Question No.01 카드 표시됨
- [ ] 추가 질문 1개 더 입력 (Single Choice 타입 시도)
- [ ] "Save & Next" 클릭

**Step 3: Settings**
- [ ] Passing Score: 70 (기본값 확인)
- [ ] Feedback Mode, Max Attempts 등 설정 확인
- [ ] "Add Quiz" 버튼 클릭

**결과 확인**:
- [ ] Topic 아래에 "React Fundamentals Quiz" 표시됨
- [ ] 아이콘: 퀴즈 아이콘
- [ ] 질문 개수 표시

---

#### 2.4 Assignment 추가 (AssignmentModal.tsx)
- [ ] Topic의 "Assignment" 버튼 클릭
- [ ] **입력**:
  - Title: "Build a Todo App"
  - Instructions: "Create a simple todo application using React"
  - Total Points: 100
  - Passing Points: 70
  - Max Uploads: 1
  - Max File Size: 10 MB
- [ ] **Time Limit**: 1 Week 설정
- [ ] "Add Assignment" 버튼 클릭
- [ ] **결과**: Topic 아래에 "Build a Todo App" 표시됨
  - 아이콘: 과제 아이콘
  - 점수 표시

---

#### 2.5 Drag-and-Drop (Lesson.tsx)
- [ ] 하나의 Topic에 여러 개 추가 (Lesson 2개 + Quiz 1개)
- [ ] **드래그**: 레슨/퀴즈 카드를 드래그하여 순서 변경
- [ ] **드롭**: 드롭 후 순서가 유지되는지 확인
- [ ] **다시 드래그**: 여러 번 반복해서 순서 변경 가능

---

#### 2.6 자동 저장 (CreateCourse.tsx)
- [ ] 페이지 상단 우측에 **자동 저장 상태** 표시 확인
  - "Saved" (녹색) 또는 "Saving..." (노란색)
- [ ] 입력 필드 수정 시 자동으로 "Saving..." 표시
- [ ] **수동 저장**: `Ctrl + S` (Windows) / `Cmd + S` (Mac) 눌러서 저장
- [ ] **복구 기능**: 페이지 새로고침 후 "Recover Draft" 메시지 뜨는지 (있을 경우)

---

### Phase 3: 에러 검증 (2분)

#### 3.1 브라우저 콘솔
- [ ] **F12** → Console 탭
- [ ] **에러 없음**: 빨간색 에러 메시지 없어야 함
- [ ] **경고 확인**: 노란색 경고는 있을 수 있음 (심각하지 않음)

#### 3.2 Network 탭
- [ ] **F12** → Network 탭
- [ ] 페이지 새로고침 후 **Failed 요청 없음**
- [ ] API 요청들이 모두 200 OK 응답

#### 3.3 TypeScript 런타임 에러
- [ ] 모달 열기/닫기 시 에러 없음
- [ ] 폼 제출 시 에러 없음
- [ ] Drag-and-drop 시 에러 없음

---

## ✅ 테스트 결과 요약

### 다크모드 (5개 항목)
- [ ] Checkbox/Radio: ⭕ / ❌
- [ ] Select Dropdown: ⭕ / ❌
- [ ] Modal (헤더/푸터): ⭕ / ❌
- [ ] Jodit Editor UI: ⭕ / ❌
- [ ] 전체 가독성: ⭕ / ❌

### TypeScript 기능 (7개 컴포넌트)
- [ ] TopicModal.tsx: ⭕ / ❌
- [ ] UpdateModal.tsx: ⭕ / ❌
- [ ] LessonModal.tsx: ⭕ / ❌
- [ ] QuizModal.tsx: ⭕ / ❌
- [ ] AssignmentModal.tsx: ⭕ / ❌ (테스트 안 함)
- [ ] Lesson.tsx (Drag-and-Drop): ⭕ / ❌
- [ ] CreateCourse.tsx (자동 저장): ⭕ / ❌

### 에러 확인
- [ ] Console 에러 없음: ⭕ / ❌
- [ ] Network 에러 없음: ⭕ / ❌
- [ ] TypeScript 런타임 에러 없음: ⭕ / ❌

---

## 🐛 발견된 이슈

이슈가 있다면 아래에 기록:

### Issue 1:
- **현상**:
- **재현 방법**:
- **우선순위**: High / Medium / Low

### Issue 2:
...

---

## 📝 테스트 완료 후
- [ ] 이슈 있으면 GitHub Issue 생성
- [ ] 테스트 통과 시 다음 Phase로 진행 (Library 문서화)
- [ ] 이 파일은 참고용으로 보관
