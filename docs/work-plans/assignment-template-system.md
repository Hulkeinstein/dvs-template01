---
title: "Assignment Template System Work Plan"
tags:
  - type/feature
  - progress/in-progress
  - phase/0
  - component/ui
created: 2025-11-17
updated: 2025-11-17
lifecycle: active
---

# Assignment Template System - Work Plan

**Status**: Active
**Created**: 2025-11-17
**Last Updated**: 2025-11-17 (Phase 3-1 완료)
**Issue**: #10
**Delete By**: 2025-12-17 (30일 후)

---

## Overview

**목표**: 교사들이 자주 사용하는 과제를 템플릿으로 저장하고 재사용할 수 있는 시스템 구현

**예상 시간**: 3-4 hours

**복잡도**: Standard

**배경**:
- 교사들이 유사한 과제를 반복적으로 작성하는 비효율성 해결
- 템플릿 기반 과제 생성으로 생산성 향상
- 기존 AssignmentModal.js 컴포넌트에 템플릿 기능 통합
- "Touch It, Type It" 원칙에 따라 TypeScript 마이그레이션 포함

---

## Phases

- [x] **P0: 설계 및 준비** (DB 스키마 설계, RLS 정책, 인덱스)
- [x] **P1: DB UNIQUE 제약조건 추가** (중복 템플릿명 방지)
- [x] **P2: Server Actions 구현** (CRUD 함수, Zod 검증)
- [x] **P3-1: Rollback Checkpoint** (안전한 진행을 위한 커밋/푸시)
- [ ] **P3-2: TypeScript 변환** (AssignmentModal.js → .tsx)
- [ ] **P3-3: 템플릿 저장 기능** (UI 버튼, 모달, 저장 로직)
- [ ] **P4: 템플릿 불러오기 기능** (드롭다운, 불러오기, usage_count 증가)
- [ ] **P5: 테스트 및 문서화** (E2E 테스트, Library 문서 작성)

---

## Phase Details

### Phase 0: 설계 및 준비 ✅

**목표**: DB 스키마 설계 및 Supabase 마이그레이션 작성

**작업**:
- [x] assignment_templates 테이블 설계
- [x] RLS 정책 설정 (instructor만 본인 템플릿 CRUD)
- [x] 인덱스 생성 (instructor_id, created_at)
- [x] updated_at 트리거 함수 생성
- [x] increment_template_usage RPC 함수 생성

**파일**:
- `supabase/migrations/20251117000000_create_assignment_templates_table.sql`

**완료**: 2025-11-17

---

### Phase 1: DB UNIQUE 제약조건 추가 ✅

**목표**: 중복 템플릿명 방지 (instructor별 unique)

**작업**:
- [x] uq_assignment_templates_owner_name 제약조건 추가
- [x] COMMENT 추가 (문서화)

**파일**:
- `supabase/migrations/20251117100000_add_template_unique_constraint.sql`

**결정사항**:
- **D1**: UNIQUE 제약조건 (instructor_id, name) - GPT-5 피드백 적용

**완료**: 2025-11-17

---

### Phase 2: Server Actions 구현 ✅

**목표**: 템플릿 CRUD Server Actions 구현

#### 2.1. 타입 정의 및 Zod 스키마

**작업**:
- [x] ErrorCode 타입 정의
- [x] ActionResult<T> 타입 정의
- [x] Zod 스키마 작성 (AttachmentMeta, TimeLimit, TemplateContent, SaveTemplate)
- [x] TemplateRow 인터페이스 정의

**파일**:
- `app/lib/actions/assignmentTemplateActions.ts` (Lines 12-83)

#### 2.2. Helper 함수

**작업**:
- [x] getInstructorSession() - DRY 원칙 (세션 검증 재사용)
- [x] Instructor 역할 검증
- [x] ActionResult 반환

**파일**:
- `app/lib/actions/assignmentTemplateActions.ts` (Lines 88-132)

#### 2.3. CRUD 함수

**작업**:
- [x] saveAsTemplate() - 템플릿 저장
- [x] getMyTemplates() - 템플릿 목록 조회
- [x] deleteTemplate() - 템플릿 삭제
- [x] incrementTemplateUsage() - 사용 횟수 증가

**파일**:
- `app/lib/actions/assignmentTemplateActions.ts` (Lines 135-314)

**결정사항**:
- **D2**: Zod safeParse 사용 (GPT-5 피드백 #1)
- **D3**: ActionResult 표준화 (GPT-5 피드백 #2)
- **D4**: getInstructorSession 헬퍼 함수 (GPT-5 피드백 #3, DRY)

**완료**: 2025-11-17

---

### Phase 3-1: Rollback Checkpoint ✅

**목표**: 안전한 진행을 위한 커밋/푸시 (Rollback 가능)

**작업**:
- [x] 변경사항 커밋
- [x] 원격 브랜치에 푸시
- [x] 백업 브랜치 생성 (선택)

**완료**: 2025-11-17

---

### Phase 3-2: TypeScript 변환

**목표**: AssignmentModal.js를 AssignmentModal.tsx로 변환

**작업**:
- [ ] 파일 생성: `components/create-course/QuizModals/AssignmentModal.tsx`
- [ ] Props 인터페이스 정의
- [ ] State 타입 정의
- [ ] Event handler 타입 정의
- [ ] Server Actions import (assignmentTemplateActions.ts)
- [ ] typecheck 통과 확인

**파일**:
- `components/create-course/QuizModals/AssignmentModal.tsx` (신규)
- `components/create-course/QuizModals/AssignmentModal.js` (삭제 예정)

**결정사항**:
- **D5**: "Touch It, Type It" 원칙 준수 (편집 시 TypeScript 변환 필수)

---

### Phase 3-3: 템플릿 저장 기능 구현

**목표**: "템플릿으로 저장" 버튼 및 저장 로직 구현

#### 3.3.1. UI 추가

**작업**:
- [ ] "템플릿으로 저장" 버튼 추가 (모달 footer)
- [ ] 버튼 위치: Modal Footer 우측 ("Add Assignment" 버튼 옆)
- [ ] Bootstrap 클래스 사용 (rbt-btn btn-border)

**파일**:
- `components/create-course/QuizModals/AssignmentModal.tsx`

#### 3.3.2. 템플릿 저장 모달

**작업**:
- [ ] 템플릿 이름 입력 필드 (필수, max 100자)
- [ ] 설명 입력 필드 (선택)
- [ ] 취소/저장 버튼
- [ ] Bootstrap Modal 유지 (타입 처리만)

**파일**:
- `components/create-course/QuizModals/AssignmentModal.tsx`

#### 3.3.3. 저장 로직

**작업**:
- [ ] handleSaveAsTemplate() 함수 구현
- [ ] 현재 폼 데이터 → template_data 변환
- [ ] saveAsTemplate() Server Action 호출
- [ ] 성공/실패 토스트 메시지
- [ ] DUPLICATE_TEMPLATE_NAME 에러 처리

**파일**:
- `components/create-course/QuizModals/AssignmentModal.tsx`

**결정사항**:
- **D6**: Bootstrap Modal 유지 (기존 UI 일관성, 타입 처리만 추가)
- **D7**: 버튼 위치 - Modal Footer 우측 (일관된 UX)

---

### Phase 4: 템플릿 불러오기 기능

**목표**: "내 템플릿" 드롭다운 및 불러오기 구현

#### 4.1. 템플릿 목록 로드

**작업**:
- [ ] useEffect로 getMyTemplates() 호출
- [ ] templates 상태 관리
- [ ] 로딩/에러 상태 처리

**파일**:
- `components/create-course/QuizModals/AssignmentModal.tsx`

#### 4.2. 드롭다운 UI

**작업**:
- [ ] "내 템플릿" 드롭다운 추가 (모달 상단)
- [ ] 템플릿 목록 표시 (이름, 설명, 사용 횟수)
- [ ] 템플릿 없을 시 "템플릿이 없습니다" 메시지

**파일**:
- `components/create-course/QuizModals/AssignmentModal.tsx`

#### 4.3. 불러오기 로직

**작업**:
- [ ] handleLoadTemplate(templateId) 함수
- [ ] template_data → 폼 필드 변환
- [ ] incrementTemplateUsage() 호출
- [ ] 성공 토스트 메시지

**파일**:
- `components/create-course/QuizModals/AssignmentModal.tsx`

---

### Phase 5: 테스트 및 문서화

**목표**: E2E 테스트 및 Library 문서 작성

#### 5.1. 테스트

**테스트 시나리오**:
1. **템플릿 저장**
   - 과제 작성 후 "템플릿으로 저장" 클릭
   - 템플릿 이름/설명 입력
   - 저장 성공 확인
   - 중복 이름 에러 확인

2. **템플릿 불러오기**
   - "내 템플릿" 드롭다운 열기
   - 템플릿 선택
   - 폼 필드 자동 채움 확인
   - usage_count 증가 확인

3. **UNIQUE 제약조건**
   - 동일 이름 템플릿 저장 시도
   - DUPLICATE_TEMPLATE_NAME 에러 확인

**검증 명령**:
```bash
npm run typecheck
npm run lint
npm run build
```

#### 5.2. Library 문서 작성

**작업**:
- [ ] `docs/library/assignment-template-system.md` 생성
- [ ] 개요, 아키텍처, 구현 포인트 작성
- [ ] 테스트 결과 요약
- [ ] 관련 파일 경로 명시
- [ ] PR 링크 추가

**파일**:
- `docs/library/assignment-template-system.md` (신규)

#### 5.3. Work Plan 삭제

**작업**:
- [ ] Library 문서 완성 확인
- [ ] Work Plan 삭제: `git rm docs/work-plans/assignment-template-system.md`
- [ ] PR 생성: "feat: Assignment Template System - Closes #10"

---

## Progress Log

### 2025-11-17 10:00 - Phase 0 Completed ✅
- DB 스키마 설계 완료
- assignment_templates 테이블 생성
- RLS 정책 설정 (instructor 본인만 CRUD)
- 인덱스 생성 (instructor_id, created_at)
- updated_at 트리거 함수 추가
- increment_template_usage RPC 함수 추가
- **Commit**: `20251117000000_create_assignment_templates_table.sql`
- **Next**: Phase 1 시작

### 2025-11-17 11:00 - Phase 1 Completed ✅
- UNIQUE 제약조건 추가 (instructor_id, name)
- GPT-5 피드백 #1 적용 (중복 방지)
- **Commit**: `20251117100000_add_template_unique_constraint.sql`
- **Next**: Phase 2 시작

### 2025-11-17 14:00 - Phase 2 Completed ✅
- Server Actions 구현 완료
- Zod 스키마 정의 (safeParse 사용)
- ActionResult 타입 표준화
- getInstructorSession 헬퍼 함수 (DRY 원칙)
- CRUD 함수 구현 (save, get, delete, increment)
- GPT-5 피드백 #1, #2, #3 모두 적용
- **Commit**: `assignmentTemplateActions.ts`
- **Next**: Phase 3-1 (Rollback Checkpoint)

### 2025-11-17 15:00 - Phase 3-1 Completed ✅
- 변경사항 커밋 및 푸시
- Rollback checkpoint 생성 (SHA: d7862cb)
- **Next**: Phase 3-2 (TypeScript 변환)

---

## Decisions Log

### D1: UNIQUE 제약조건 (instructor_id, name) (2025-11-17)
**질문**: 중복 템플릿명을 어떻게 방지할까?

**결정**: UNIQUE 제약조건 (instructor_id, name) 추가

**이유**:
- DB 레벨 제약조건으로 데이터 무결성 보장
- 동일 instructor의 중복 이름 방지
- 다른 instructor는 같은 이름 사용 가능
- Server Actions에서 23505 에러코드로 처리 가능

**대안**:
- A안: 애플리케이션 레벨 검증만 - 동시성 문제 발생 가능 ❌
- B안: UNIQUE 제약조건 (instructor_id, name) - 선택 ✅
- C안: UNIQUE INDEX - 제약조건과 동일하나 명시성 떨어짐 ❌

**영향**: assignmentTemplateActions.ts - DUPLICATE_TEMPLATE_NAME 에러 처리

**GPT-5 피드백**: #1 적용

---

### D2: Zod safeParse 사용 (2025-11-17)
**질문**: 입력 검증을 어떻게 처리할까?

**결정**: Zod safeParse 사용 (throw 대신 결과 반환)

**이유**:
- try-catch 불필요 (에러 대신 결과 객체)
- ActionResult 패턴과 일관성
- issues 필드로 상세 에러 정보 제공
- GPT-5 Best Practice 준수

**대안**:
- A안: parse() (throw) - 추가 try-catch 필요 ❌
- B안: safeParse() (result) - 선택 ✅
- C안: 수동 검증 - 중복 코드 증가 ❌

**영향**: 모든 Server Actions의 입력 검증 표준화

**GPT-5 피드백**: #1 적용

---

### D3: ActionResult 타입 표준화 (2025-11-17)
**질문**: Server Actions 반환 타입을 어떻게 통일할까?

**결정**: ActionResult<T> 제네릭 타입 사용

**이유**:
- success: boolean으로 타입 가드
- code: ErrorCode로 에러 종류 구분
- message/issues로 상세 정보 제공
- 클라이언트 에러 처리 일관성

**대안**:
- A안: throw Error - Server Actions에서 불안정 ❌
- B안: ActionResult<T> - 선택 ✅
- C안: 직접 data 반환 - 에러 처리 불가 ❌

**영향**: 모든 Server Actions, UI 컴포넌트 에러 처리

**GPT-5 피드백**: #2 적용

---

### D4: getInstructorSession 헬퍼 함수 (2025-11-17)
**질문**: 세션 검증 로직을 어떻게 재사용할까?

**결정**: getInstructorSession() 헬퍼 함수로 DRY 원칙 적용

**이유**:
- 4개 CRUD 함수에서 동일 로직 반복
- 세션 검증 + instructor 역할 확인 통합
- ActionResult 반환으로 일관성
- 유지보수성 향상

**대안**:
- A안: 각 함수에서 직접 검증 - 중복 코드 ❌
- B안: 헬퍼 함수로 추출 - 선택 ✅
- C안: Middleware - 과도한 추상화 ❌

**영향**: assignmentTemplateActions.ts - 모든 CRUD 함수

**GPT-5 피드백**: #3 적용 (DRY 원칙)

---

### D5: "Touch It, Type It" 원칙 (2025-11-17)
**질문**: AssignmentModal.js를 편집할 때 TypeScript 변환을 언제 할까?

**결정**: 템플릿 기능 추가와 동시에 TypeScript 변환

**이유**:
- 프로젝트 컨벤션 "Touch It, Type It" 준수
- 타입 안정성 확보 (Server Actions 타입 연동)
- Phase 0 Tech Debt 마일스톤 목표 부합
- 점진적 마이그레이션 전략

**대안**:
- A안: .js 유지 - 타입 안정성 부족 ❌
- B안: .tsx 변환 - 선택 ✅
- C안: 별도 작업으로 분리 - 컨벤션 위배 ❌

**영향**: AssignmentModal.tsx, Phase 3-2

**참고**: modules/development-guide.md - TypeScript Migration

---

### D6: Bootstrap Modal 유지 (2025-11-17)
**질문**: 템플릿 저장 모달을 어떻게 구현할까?

**결정**: 기존 Bootstrap Modal 유지 (타입 처리만 추가)

**이유**:
- 기존 AssignmentModal과 UI 일관성
- 프로젝트 전반에서 Bootstrap 사용 중
- shadcn/ui는 Admin 전용
- 타입 처리만 추가하면 충분

**대안**:
- A안: shadcn/ui Dialog - Instructor/Student는 Bootstrap 사용 ❌
- B안: Bootstrap Modal - 선택 ✅
- C안: Headless UI - 스타일링 추가 작업 필요 ❌

**영향**: 템플릿 저장/불러오기 모달 UI

**참고**: modules/architecture.md - Styling Rules

---

### D7: 버튼 위치 - Modal Footer 우측 (2025-11-17)
**질문**: "템플릿으로 저장" 버튼을 어디에 배치할까?

**결정**: Modal Footer 우측에 배치 ("Add Assignment" 버튼 옆)

**이유**:
- Backup 브랜치 검증 결과 (footer 위치 확인)
- 사용자 경험 일관성 (예상 위치)
- rbt-btn btn-border 스타일로 통일
- isPremiumDomain() && !editingAssignment 조건

**대안**:
- A안: 모달 상단 - 접근성 떨어짐 ❌
- B안: Modal Footer 우측 - 선택 ✅
- C안: 별도 섹션 - UI 복잡도 증가 ❌

**영향**: AssignmentModal.tsx - 버튼 배치

**참고**: backup-assignment-work 브랜치 검증

---

## Risks & Mitigations

### R1: TypeScript 변환 중 타입 에러
**완화 방안**:
- Phase 3-1에서 Rollback checkpoint 생성 ✅
- typecheck 통과 후에만 다음 Phase 진행
- Server Actions 타입 export 활용

### R2: Bootstrap Modal 타입 처리
**완화 방안**:
- types/shims.d.ts에 window.bootstrap 타입 선언
- Modal, Button 컴포넌트 타입 확인
- 기존 .js 파일에서 사용 패턴 참고

### R3: template_data JSONB 구조 불일치
**완화 방안**:
- Zod 스키마로 구조 강제
- 폼 데이터 → template_data 변환 함수 테스트
- template_data → 폼 데이터 역변환 테스트

### R4: 중복 템플릿명 UX
**완화 방안**:
- DUPLICATE_TEMPLATE_NAME 에러 시 명확한 메시지
- 기존 템플릿 이름 목록 표시 (선택)
- 입력 필드에 validation 피드백

---

## Next Steps

**Immediate**:
1. Work Plan 문서 생성 완료 ✅
2. Phase 3-2 계획 검증
3. Phase 3-2 실행: AssignmentModal.js → .tsx 변환

**After Phase 3-2**:
- Phase 3-3: 템플릿 저장 기능 UI/로직 구현
- Phase 4: 템플릿 불러오기 기능
- Phase 5: 테스트 및 Library 문서 작성

---

## Completion Criteria

**Phase 3-2** (TypeScript 변환):
- [ ] AssignmentModal.tsx 생성
- [ ] Props/State 타입 정의 완료
- [ ] typecheck 통과
- [ ] 기존 기능 동작 확인 (회귀 테스트)

**Phase 3-3** (템플릿 저장):
- [ ] "템플릿으로 저장" 버튼 추가
- [ ] 템플릿 이름/설명 입력 모달
- [ ] saveAsTemplate() 호출 성공
- [ ] 중복 이름 에러 처리

**Phase 4** (템플릿 불러오기):
- [ ] "내 템플릿" 드롭다운 표시
- [ ] 템플릿 선택 시 폼 자동 채움
- [ ] usage_count 증가 확인

**Phase 5** (테스트 및 문서화):
- [ ] E2E 테스트 시나리오 통과
- [ ] Library 문서 작성 완료
- [ ] Work Plan 삭제
- [ ] PR 생성 (Closes #10)

**Overall (DoD)**:
- [ ] All tests pass (E2E)
- [ ] TypeScript type-check passes
- [ ] Build succeeds
- [ ] Documentation updated (library/assignment-template-system.md)
- [ ] PR created and approved

---

## Reference

- **Issue**: #10 - [Feature] Assignment 템플릿 시스템
- **Milestone**: Phase 0: Tech Debt
- **Work Plan Guide**: [../workflows/work-plan-guide.md](../workflows/work-plan-guide.md)
- **Relationship Guide**: [../workflows/milestone-workplan-adr-relationship.md](../workflows/milestone-workplan-adr-relationship.md)
- **Examples**: [../workflows/examples.md](../workflows/examples.md)
- **Related Library Docs**: TBD - `docs/library/assignment-template-system.md` (Phase 5)
- **Related ADRs**: None (기능 구현, 아키텍처 결정 아님)
- **Project Workflow**: [../../modules/workflow.md](../../modules/workflow.md)
- **Development Guide**: [../../modules/development-guide.md](../../modules/development-guide.md)

---

## Response Template (AI Protocol)

When AI is working with this Work Plan, use this format:

```markdown
**[상태 헤더]**
* 목표: Assignment Template System 구현
* 현재 페이즈: P<n>
* 다음 단계: <one line>

**[답변 본문]**
<detailed answer>

**[원래 계획으로 복귀]**
P<n> 핵심: <phase summary>
다음 액션: <specific action>
선택지: [승인] [수정] [질문] [보류]
```

### Operating Rules

1. **One Phase at a Time**: AI executes one phase, updates Work Plan, waits for approval
2. **Always Return to Plan**: After answering questions, return to original plan
3. **Log Everything**: Record all decisions in Decisions Log
4. **Update After Completion**: Mark phases complete, update Progress Log
5. **No Assumptions**: Get explicit approval before next phase

---

## Workflow Integration

```
Milestone: Phase 0 (Tech Debt)
  ↓
Issue #10: Assignment Template
  ↓
Branch: feature/assignment-template-system
  ↓
Work Plan (this file) - Temporary
  ↓
Development (Phase 0-5)
  ↓
Library Doc - Permanent
  ↓
Delete Work Plan
  ↓
PR (Closes #10)
```

**When to Delete**:
- ✅ After PR merge
- ✅ After Library doc created (`docs/library/assignment-template-system.md`)
- ✅ After 30 days (2025-12-17, if stale)

**When to Keep**:
- ⏳ Active development (현재)
- ⏳ Paused (but will resume)
- ⏳ Complex feature in progress
