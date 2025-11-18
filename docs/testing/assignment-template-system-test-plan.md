# Assignment Template System - 테스트 플랜

**기능**: Assignment Template System (Issue #10)
**테스트 날짜**: 2025-11-18
**상태**: 테스트 준비 완료

---

## 테스트 환경 설정

### 사전 준비사항
- ✅ 개발 서버 실행 중 (`npm run dev`)
- ✅ 데이터베이스 마이그레이션 적용 완료 (20250117000000_add_assignment_templates.sql)
- ✅ 테스트 계정 준비:
  - Instructor 계정 (role: 'instructor')
  - Student 계정 (role: 'student')

### 테스트 데이터 준비
1. **Instructor**로 로그인
2. 코스 생성 페이지로 이동
3. Assignment Modal 열기

---

## 테스트 시나리오

### TC-01: 템플릿 저장 - 정상 케이스

**목적**: 템플릿이 정상적으로 저장되는지 확인

**단계**:
1. "Add Assignment" 버튼 클릭 → Assignment Modal 열림
2. 과제 데이터 입력:
   - Title: "Test Assignment"
   - Instructions: "Complete this assignment"
   - Time Limit: 1 week
   - Total Points: 100
   - Passing Points: 70
3. "Save as Template" 버튼 클릭
4. 프롬프트에 템플릿 이름 입력: "My First Template"
5. OK 클릭

**기대 결과**:
- ✅ 성공 토스트 표시: "Template 'My First Template' saved successfully"
- ✅ 데이터베이스에 템플릿 저장됨
- ✅ 모달은 열린 상태 유지
- ✅ 과제 데이터 변경 없음

**데이터베이스 확인**:
```sql
SELECT name, template_data FROM assignment_templates
WHERE instructor_id = '<your_instructor_id>'
ORDER BY created_at DESC LIMIT 1;
```

---

### TC-02: 템플릿 저장 - 유효성 검사 오류

**목적**: 입력 유효성 검사가 정상 작동하는지 확인

#### TC-02-1: 빈 이름
**단계**:
1. 과제 데이터 입력
2. "Save as Template" 클릭
3. 프롬프트를 빈 값으로 두고 OK 클릭

**기대 결과**:
- ✅ 아무 동작 없음
- ✅ API 호출 안함
- ✅ 토스트 메시지 없음

#### TC-02-2: 이름이 너무 긴 경우 (>100자)
**단계**:
1. 과제 데이터 입력
2. "Save as Template" 클릭
3. 프롬프트에 101자 입력
4. OK 클릭

**기대 결과**:
- ✅ 오류 토스트 표시: "Template name must be less than 100 characters"
- ✅ 데이터베이스에 저장 안됨
- ✅ 모달은 열린 상태 유지

#### TC-02-3: 중복된 이름
**단계**:
1. "Test Template" 이름으로 템플릿 저장
2. 같은 이름 "Test Template"으로 다시 저장 시도

**기대 결과**:
- ✅ 오류 토스트 표시: "A template with this name already exists"
- ✅ 데이터베이스에 중복 생성 안됨

#### TC-02-4: 빈 제목 (버튼 비활성화)
**단계**:
1. Assignment Title을 빈 값으로 둠
2. "Save as Template" 버튼 확인

**기대 결과**:
- ✅ 버튼이 비활성화됨 (`disabled` 속성 존재)
- ✅ 버튼 클릭 불가

---

### TC-03: 템플릿 저장 - 편집 모드

**목적**: 기존 과제 편집 시 버튼이 숨겨지는지 확인

**단계**:
1. 과제 생성 (레슨에 저장)
2. 기존 과제의 "Edit" 클릭
3. Assignment Modal이 편집 모드로 열림

**기대 결과**:
- ✅ "Save as Template" 버튼이 보이지 않음
- ✅ "Update Assignment" 버튼만 표시됨
- ✅ `!editingAssignment` 조건 정상 작동

---

### TC-04: 템플릿 불러오기 - Instructor

**목적**: Instructor가 자신의 템플릿을 불러올 수 있는지 확인

**사전 조건**: 최소 2개 이상의 템플릿 저장됨

**단계**:
1. **Instructor**로 로그인
2. "Add Assignment" 클릭
3. "Load Sample Data" 드롭다운 버튼 클릭
4. 드롭다운 메뉴 확인

**기대 UI**:
- ✅ "My Templates" 헤더 표시
- ✅ 템플릿 목록 표시 (저장한 템플릿들)
- ✅ 각 템플릿에 이름 표시
- ✅ 각 템플릿에 휴지통 아이콘 버튼 있음
- ✅ 구분선 (`<hr>`)으로 섹션 분리
- ✅ 구분선 아래 "Sample Data" 헤더
- ✅ 샘플 데이터 항목들 (Basic Project, Final Project 등)

**단계 (계속)**:
5. 첫 번째 템플릿 이름 클릭

**기대 결과**:
- ✅ 과제 데이터가 채워짐:
  - `title` = "" (빈 값, 사용자가 새로 입력)
  - `summary` = 템플릿 instructions
  - `timeLimit` = 템플릿 timeLimit
  - `totalPoints` = 템플릿 totalPoints
  - `passingPoints` = 템플릿 passingPoints
  - `maxUploads` = 템플릿 maxUploads
  - `maxFileSize` = 템플릿 maxFileSize
- ✅ 드롭다운 닫힘
- ✅ 성공 토스트: "Template '<name>' loaded"

**데이터베이스 확인**:
```sql
-- usage_count 증가 확인
SELECT name, usage_count FROM assignment_templates
WHERE instructor_id = '<your_instructor_id>'
ORDER BY created_at DESC;
```

---

### TC-05: 템플릿 불러오기 - Student

**목적**: Student는 템플릿을 볼 수 없는지 확인 (RLS 필터링)

**단계**:
1. **Student**로 로그인
2. Assignment Modal이 있는 페이지로 이동
3. "Add Assignment" 클릭
4. "Load Sample Data" 드롭다운 클릭

**기대 결과**:
- ✅ "My Templates" 섹션 없음
- ✅ "Sample Data" 섹션만 표시
- ✅ `myTemplates` 배열이 비어있음 (RLS 차단)

---

### TC-06: 템플릿 삭제 - 정상 케이스

**목적**: 템플릿을 삭제할 수 있는지 확인

**단계**:
1. **Instructor**로 로그인
2. Assignment Modal 열기
3. "Load Sample Data" 드롭다운 클릭
4. 템플릿의 휴지통 아이콘 클릭
5. 확인 다이얼로그 표시: "Delete this template?"
6. OK 클릭

**기대 결과**:
- ✅ 확인 다이얼로그 표시됨
- ✅ OK 후: 목록에서 템플릿 제거됨
- ✅ 토스트 메시지: "Template deleted"
- ✅ 드롭다운은 열린 상태 유지 (stopPropagation 작동)
- ✅ 데이터베이스에서 템플릿 삭제됨

**데이터베이스 확인**:
```sql
SELECT COUNT(*) FROM assignment_templates
WHERE instructor_id = '<your_instructor_id>';
-- 개수가 1 감소해야 함
```

---

### TC-07: 템플릿 삭제 - 취소

**목적**: 삭제 확인에서 취소가 작동하는지 확인

**단계**:
1. 템플릿의 휴지통 아이콘 클릭
2. 확인 다이얼로그: "Delete this template?"
3. Cancel 클릭

**기대 결과**:
- ✅ 삭제 안됨
- ✅ 목록에 템플릿 여전히 존재
- ✅ 토스트 메시지 없음
- ✅ 드롭다운은 열린 상태 유지

---

### TC-08: UI/UX 검증

**목적**: 스타일링과 반응형 동작 확인

#### TC-08-1: 버튼 스타일
**"Save as Template" 버튼 확인**:
- ✅ 클래스: `rbt-btn btn-border btn-md radius-round-10`
- ✅ 아이콘: `feather-save me-2`
- ✅ 레이아웃: `d-flex gap-2` (Add Assignment 버튼과 함께)
- ✅ 로딩 상태에서 "Saving..." 텍스트 표시
- ✅ `isSavingTemplate` true일 때 비활성화

#### TC-08-2: 드롭다운 스타일
**드롭다운 메뉴 확인**:
- ✅ Bootstrap 5 클래스: `dropdown-menu show`
- ✅ 위치: 래퍼에 `position-relative`
- ✅ Z-index: 1051 (모달 위)
- ✅ 섹션 제목에 `dropdown-header` 클래스
- ✅ 섹션 사이에 `dropdown-divider`

#### TC-08-3: 템플릿 항목 스타일
**템플릿 항목 확인**:
- ✅ 레이아웃: `d-flex justify-content-between align-items-center`
- ✅ 템플릿 이름은 왼쪽
- ✅ 삭제 버튼은 오른쪽
- ✅ 삭제 버튼: `btn btn-sm btn-link text-danger p-0`
- ✅ 휴지통 아이콘: `feather-trash-2`

#### TC-08-4: 반응형 디자인
**다양한 화면 크기에서 테스트**:
- ✅ 데스크톱 (>1200px): 모든 버튼 표시, 적절한 간격
- ✅ 태블릿 (768px-1199px): 버튼들이 올바르게 배치됨
- ✅ 모바일 (<768px): 드롭다운 너비 조정, 버튼 읽기 가능

---

### TC-09: 엣지 케이스

#### TC-09-1: 저장된 템플릿 없음
**단계**:
1. 새 instructor (템플릿 없음)
2. 드롭다운 열기

**기대 결과**:
- ✅ "My Templates" 섹션 없음
- ✅ "Sample Data" 섹션만 표시
- ✅ 구분선 없음

#### TC-09-2: 많은 템플릿 (>10개)
**단계**:
1. 15개 템플릿 저장
2. 드롭다운 열기

**기대 결과**:
- ✅ 15개 템플릿 모두 표시됨
- ✅ 드롭다운 스크롤 가능 (뷰포트 초과 시)
- ✅ 성능 양호 (<500ms 렌더링)

#### TC-09-3: 특수 문자가 포함된 이름
**단계**:
1. 이름으로 템플릿 저장: `Test's "Template" <HTML>`
2. 드롭다운 불러오기

**기대 결과**:
- ✅ 이름이 올바르게 표시됨 (HTML-safe)
- ✅ XSS 취약점 없음
- ✅ 삭제 정상 작동

#### TC-09-4: 네트워크 오류
**단계**:
1. 네트워크 연결 끊기
2. 템플릿 저장 시도
3. 템플릿 삭제 시도

**기대 결과**:
- ✅ 저장: 일반 오류 메시지 토스트
- ✅ 삭제: "Failed to delete template" 오류 토스트
- ✅ 크래시 없음

---

### TC-10: 동시 사용자

**목적**: Instructor 간 RLS 격리 확인

**사전 조건**: 2개의 instructor 계정

**단계**:
1. Instructor A가 "Template A" 저장
2. Instructor B 로그인
3. Instructor B가 드롭다운 열기

**기대 결과**:
- ✅ Instructor B는 "Template A"를 볼 수 없음
- ✅ 자신의 템플릿만 표시됨
- ✅ RLS 정책 정상 작동

---

## 성능 테스트

### PT-01: 템플릿 로드 시간
**측정**: 마운트부터 템플릿 표시까지 시간

**허용 범위**: 20개 템플릿 기준 <500ms

**단계**:
1. DevTools Network 탭 열기
2. Assignment Modal 열기
3. `getMyTemplates()` API 호출 시간 측정

**기대 결과**:
- ✅ 단일 API 호출
- ✅ 응답 시간 <200ms (데이터베이스 쿼리)
- ✅ UI 렌더링 <300ms

---

### PT-02: 템플릿 저장 시간
**측정**: 클릭부터 성공 토스트까지 시간

**허용 범위**: <1000ms

**단계**:
1. 과제 데이터 입력
2. "Save as Template" 클릭
3. 이름 입력, OK 클릭
4. 총 시간 측정

**기대 결과**:
- ✅ API 호출 <500ms
- ✅ 토스트 표시 <1000ms (전체)

---

## 보안 테스트

### ST-01: SQL Injection
**단계**:
1. 악의적인 템플릿 이름 입력: `'; DROP TABLE assignment_templates; --`
2. 템플릿 저장

**기대 결과**:
- ✅ 이름이 그대로 저장됨 (파라미터화된 쿼리)
- ✅ SQL 실행 안됨
- ✅ 테이블 무결성 유지

---

### ST-02: XSS 방지
**단계**:
1. 이름으로 템플릿 저장: `<script>alert('XSS')</script>`
2. 드롭다운 열기

**기대 결과**:
- ✅ 스크립트 실행 안됨
- ✅ 이름이 텍스트로 표시됨 (React 이스케이핑)

---

### ST-03: 무단 접근 (RLS)
**단계**:
1. Student가 instructor의 템플릿 ID에 직접 접근 시도
2. 브라우저 DevTools로 `deleteTemplate('<instructor_template_id>')` 호출

**기대 결과**:
- ✅ RLS가 삭제 차단
- ✅ API에서 오류 반환
- ✅ 템플릿 삭제 안됨

---

## 브라우저 호환성

테스트 대상:
- ✅ Chrome/Edge (최신 버전)
- ✅ Firefox (최신 버전)
- ✅ Safari (macOS)
- ✅ Mobile Safari (iOS)
- ✅ Chrome Mobile (Android)

---

## 알려진 제한사항 (Phase 3-4 TODO)

1. **첨부파일**: 현재 빈 배열로 저장됨
   - Phase 3-4에서 파일 업로드 통합 구현 예정
   - Phase 3-4 이후 첨부파일 테스트

---

## 롤백 테스트

**목적**: 기능 비활성화 시 깨끗한 롤백 확인

**단계**:
1. `Save as Template` 버튼 코드 제거
2. 템플릿 로딩 코드 제거
3. 페이지 리로드

**기대 결과**:
- ✅ 모달이 오류 없이 작동
- ✅ Sample Data 여전히 로드됨
- ✅ 콘솔 오류 없음
- ✅ 데이터베이스 테이블 무결성 유지

---

## 테스트 요약 템플릿

```
## 테스트 실행 보고서

**날짜**: YYYY-MM-DD
**테스터**: [이름]
**빌드**: [Commit SHA]

### 결과

| 테스트 ID | 설명 | 상태 | 비고 |
|---------|-----|------|------|
| TC-01 | 템플릿 저장 - 정상 케이스 | ✅ | |
| TC-02 | 유효성 검사 오류 | ✅ | |
| TC-03 | 편집 모드 버튼 숨김 | ✅ | |
| TC-04 | 템플릿 로드 - Instructor | ✅ | |
| TC-05 | 템플릿 로드 - Student | ✅ | |
| TC-06 | 템플릿 삭제 - 정상 케이스 | ✅ | |
| TC-07 | 템플릿 삭제 - 취소 | ✅ | |
| TC-08 | UI/UX 검증 | ✅ | |
| TC-09 | 엣지 케이스 | ✅ | |
| TC-10 | 동시 사용자 | ✅ | |
| PT-01 | 로드 성능 | ✅ | |
| PT-02 | 저장 성능 | ✅ | |
| ST-01 | SQL Injection | ✅ | |
| ST-02 | XSS 방지 | ✅ | |
| ST-03 | 무단 접근 | ✅ | |

### 발견된 이슈

- [ ] 이슈 1: [설명]
- [ ] 이슈 2: [설명]

### 승인

- [ ] 모든 중요 테스트 통과
- [ ] 블로킹 버그 없음
- [ ] 머지 준비 완료
```

---

## 다음 단계

모든 테스트 통과 후:
1. ✅ Phase 5-1 완료 표시
2. Library 문서 작성
3. Work Plan 삭제
4. PR 생성
