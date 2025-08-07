# Quiz System Documentation

## Overview
퀴즈 시스템은 Quill 에디터를 기반으로 9가지 문제 유형을 지원하는 포괄적인 학습 평가 도구입니다.

## 지원하는 문제 유형
1. **True/False** - 참/거짓 선택
2. **Single Choice** - 단일 선택 (라디오 버튼)
3. **Multiple Choice** - 다중 선택 (체크박스)
4. **Open Ended** - 서술형 답변
5. **Fill in the Blanks** - 빈칸 채우기
6. **Sort Answer** - 순서 정렬
7. **Matching** - 짝 맞추기
8. **Image Matching** - 이미지-텍스트 매칭
9. **Essay** - 에세이 작성

## 기술적 구현

### 주요 컴포넌트
- `/components/Lesson/CreateLessonQuiz.js` - 퀴즈 생성 메인 컴포넌트
- `/components/Lesson/QuillQuizEditor.js` - Quill 에디터 통합
- `/components/Lesson/QuizQuestionTypes/` - 각 문제 유형별 컴포넌트

### 서버 액션
- `/app/lib/actions/quizActions.js` - 퀴즈 CRUD 작업
  - `createQuizLesson` - 새 퀴즈 레슨 생성
  - `updateQuizLesson` - 퀴즈 업데이트
  - `getQuizByLessonId` - 퀴즈 데이터 조회
  - `startQuizAttempt` - 퀴즈 시작
  - `submitQuizAttempt` - 퀴즈 제출 및 채점

### 데이터 검증
- **Zod v3.25.76** 사용 (v4와의 호환성 문제로 다운그레이드)
- 각 문제 유형별 스키마 정의
- 설정 및 메타데이터 검증

## Quill 에디터 통합

### 기본 설정
```javascript
const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['link', 'image', 'video'],
    ['clean']
  ]
};
```

### 비디오 Placeholder 시스템
YouTube와 Vimeo 영상을 편집 중에는 placeholder로 표시하고, 저장 시 실제 iframe으로 변환

**유틸리티 함수** (`/app/lib/utils/videoUtils.js`):
- `convertPlaceholdersToIframes` - 저장 시 변환
- `convertIframesToPlaceholders` - 편집 시 변환

### 비디오 삽입 과정
1. 사용자가 YouTube/Vimeo URL 입력
2. 편집기에 placeholder div 삽입 (회색 박스 + 아이콘)
3. 저장 시 실제 iframe으로 자동 변환
4. 재편집 시 다시 placeholder로 변환

## 데이터 구조

### 퀴즈 레슨 스키마
```javascript
{
  course_id: UUID,
  topic_id: UUID,
  title: string,
  description: string,
  content_type: 'quiz',
  content_data: {
    questions: [...],
    settings: {...},
    metadata: {...}
  }
}
```

### 문제 구조 예시
```javascript
{
  id: string,
  type: 'Single Choice',
  question: string,
  points: number,
  required: boolean,
  options: [
    { id: '1', text: 'Option A' },
    { id: '2', text: 'Option B' }
  ],
  correctAnswer: '1',
  explanation: string
}
```

## 데이터베이스 테이블

### lessons 테이블
- `content_type` = 'quiz'로 퀴즈 레슨 구분
- `content_data` JSONB 컬럼에 퀴즈 데이터 저장

### quiz_attempts 테이블
```sql
- id UUID PRIMARY KEY
- lesson_id UUID REFERENCES lessons(id)
- user_id UUID REFERENCES user(id)
- course_id UUID REFERENCES courses(id)
- started_at TIMESTAMPTZ
- completed_at TIMESTAMPTZ
- score INTEGER
- total_points INTEGER
- passed BOOLEAN
- answers JSONB
```

## 채점 로직

### 자동 채점 지원
- True/False: 정답 일치 확인
- Single Choice: 선택한 답안 검증
- Multiple Choice: 모든 정답 선택 확인
- Fill in the Blanks: 부분 점수 지원
- Sort Answer: 순서 정확도에 따른 부분 점수
- Matching: 매칭 정확도에 따른 부분 점수

### 수동 채점 필요
- Open Ended: 교사의 평가 필요
- Essay: 교사의 평가 필요

## 알려진 이슈 및 해결책

### Zod 버전 이슈
- **문제**: Zod v4.0.14에서 "_zod" 에러 발생
- **해결**: v3.25.76으로 다운그레이드
- **영향**: 검증 로직은 정상 작동

### Course Topics 정렬
- **문제**: `order_index` 컬럼 없음
- **해결**: `sort_order` 컬럼 사용
- **위치**: `/app/lib/actions/courseActions.js`

### 페이지 새로고침
- **문제**: `revalidatePath` 사용 시 불필요한 새로고침
- **해결**: 퀴즈 액션에서 `revalidatePath` 제거
- **대안**: 클라이언트 사이드 업데이트 사용

## 테스트 방법

### 샘플 퀴즈 데이터
`/constants/sampleQuizData.js`에 9가지 문제 유형 샘플 포함

### 테스트 절차
1. 교사 대시보드 로그인
2. 코스 편집 페이지 이동
3. 토픽 선택 후 "Add Quiz" 버튼 클릭
4. 샘플 데이터 로드 또는 새 문제 생성
5. 저장 후 레슨 목록에서 확인

## 향후 개선 사항
- [ ] 문제 은행 기능
- [ ] 문제 재사용 시스템
- [ ] AI 기반 문제 생성
- [ ] 실시간 협업 편집
- [ ] 고급 통계 및 분석
- [ ] 문제별 난이도 설정
- [ ] 적응형 퀴즈 (난이도 자동 조절)