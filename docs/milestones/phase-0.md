---
title: "Phase 0: Tech Debt"
tags:
  - phase/0
  - type/chore
  - component/workflow
  - progress/in-progress
created: 2025-11-09
updated: 2025-11-09
lifecycle: active
related:
  - ../ROADMAP.md
  - ../PROJECT_VISION.md
  - ../work-plans/agile-restructure.md
---

# Phase 0: Tech Debt

**GitHub Milestone**: Phase 1: Core Platform (→ `Phase 0: Tech Debt`로 이름 변경 예정)
**Duration**: 2주 (2025-11-09 ~ 2025-11-22)
**Due Date**: 2025-11-22
**Status**: 📋 계획됨

---

## 📋 Overview

### Purpose

**Primary Goal**: Vision 작업 전 기술 부채 해소
- TypeScript 마이그레이션으로 타입 안정성 확보
- Assignment 템플릿으로 교사 UX 개선

### Why Phase 0?

**기존 Phase 1 Milestone을 Phase 0로 재정의**:
- Vision 작업은 대규모 개발 (40-60시간)
- 안정적인 코드베이스 필요
- 기존 Milestone Issues (#19, #10)와 Vision은 무관

**전략적 의도**:
- Tech Debt를 먼저 해소하여 Phase 1 (MVP) 작업 시 안정성 확보
- TypeScript로 전환하여 대규모 리팩토링에 대비
- 교사 UX 개선으로 사용자 피드백 준비

---

## 🎯 Goals

### Primary Goals

1. **타입 안정성 확보**
   - 133개 핵심 파일을 TypeScript로 변환
   - `tsc --noEmit` 통과
   - 런타임 타입 에러 방지

2. **교사 UX 개선**
   - Assignment 템플릿 시스템 구축
   - 과제 생성 시간 50% 단축

### Success Metrics

- ✅ TypeScript 변환 100% 완료 (133/133 파일)
- ✅ `npm run build` 0 에러
- ✅ Assignment 템플릿 사용률 >70% (교사 대상)
- ✅ 회귀 테스트 통과율 100%

---

## 🚀 Features

### Feature 1: TypeScript 마이그레이션 (#19)

**Purpose**: 타입 안전성, 개발자 경험 개선

**Scope**: 133개 핵심 파일 변환
- Foundation (30개 - 1h)
- Server Actions (13개 - 1.5h)
- Components (60개 - 2h)
- App Routes (30개 - 1h)

**Total Estimate**: 5.5시간

**Phases**:
1. **Phase 1: Foundation** - 유틸리티, 타입 정의
2. **Phase 2: Server Actions** - Database 작업, Supabase
3. **Phase 3: Components** - React 컴포넌트 (.tsx)
4. **Phase 4: App Routes** - Next.js 페이지 라우트

**Acceptance Criteria**:
- `tsc --noEmit` 통과
- `npm run build` 성공
- 기존 기능 정상 작동 (회귀 테스트)
- `any` 사용 최소화 (불가피한 경우 `TODO(ANY-TODO)` 태그)

**Deliverables**:
- 133개 파일 `.js` → `.ts/.tsx` 변환
- `tsconfig.json` 업데이트 (strict mode)

**Related**:
- Issue: #19
- Track: Standard (5.5h)
- Owner: Development Team

---

### Feature 2: Assignment 템플릿 시스템 (#10)

**Purpose**: 교사가 자주 사용하는 과제를 템플릿으로 저장/재사용

**Scope**:
- DB: `assignment_templates` 테이블
- Server Actions: `assignmentTemplateActions.ts`
- UI: AssignmentModal 확장

**User Story**:
- **As a** 교사
- **I want to** 자주 사용하는 과제를 템플릿으로 저장
- **So that** 매번 처음부터 작성하지 않고 빠르게 과제를 생성할 수 있다

**Features**:
1. **템플릿 저장**
   - 과제 생성 시 "템플릿으로 저장" 버튼
   - 템플릿 이름 입력
   - 기본 템플릿 설정 (자동 선택)

2. **템플릿 불러오기**
   - "내 템플릿" 드롭다운
   - 템플릿 선택 → 자동 입력
   - 편집 후 저장

3. **템플릿 관리**
   - 템플릿 목록 조회
   - 템플릿 수정/삭제
   - 기본 템플릿 변경

**Total Estimate**: 3-4시간

**Acceptance Criteria**:
- 교사가 과제를 템플릿으로 저장 가능
- 템플릿 불러와서 새 과제 생성 가능
- 템플릿 관리 (수정/삭제) 가능
- 템플릿 사용 시 과제 생성 시간 50% 단축

**Deliverables**:
- Migration: `20251109_create_assignment_templates.sql`
- Server Actions: `app/lib/actions/assignmentTemplateActions.ts`
- UI: `components/Assignment/AssignmentModal.tsx` (수정)
- UI: `components/Assignment/TemplateManager.tsx` (신규)

**Related**:
- Issue: #10
- Track: Standard (3-4h)
- Owner: Development Team

---

## 📋 Issues

### Open Issues (2개)

| Issue | Title | Estimate | Priority | Status |
|-------|-------|----------|----------|--------|
| #19 | TypeScript 마이그레이션 Phase 1-4 실행 | 5.5h | P2 | Open |
| #10 | Assignment 템플릿 시스템 | 3-4h | P1 | Open |

**Total Estimate**: 8.5-9.5시간 (약 1-2주)

### Closed Issues (10개)

**Note**: Phase 1 Milestone의 기존 Closed Issues (10개)는 Phase 0 완료 후에도 유지됩니다.

---

## ✅ Exit Criteria

**완료 조건** (모두 충족 시 Milestone Close):

1. **TypeScript 변환 완료**
   - ✅ 133개 파일 100% 변환
   - ✅ `tsc --noEmit` 통과
   - ✅ `npm run build` 성공
   - ✅ 빌드 에러 0건

2. **Assignment 템플릿 작동**
   - ✅ 템플릿 저장/불러오기 작동
   - ✅ 템플릿 관리 기능 작동
   - ✅ 교사 사용 테스트 완료

3. **품질 검증**
   - ✅ 기존 기능 회귀 테스트 통과
   - ✅ ESLint/Prettier 통과
   - ✅ 로컬 테스트 완료

4. **문서화**
   - ✅ Work Plan 완료
   - ✅ Library 문서 작성 (`docs/library/assignment-template.md`)
   - ✅ PR 설명 작성

**Milestone Close 기준**: Exit Criteria 100% 충족 시

---

## 📦 Deliverables

### Database Migrations
- `20251109_create_assignment_templates.sql`
  - `assignment_templates` 테이블 생성
  - RLS 정책 (교사 본인만 CRUD)
  - Indexes (user_id, created_at)

### Server Actions
- `app/lib/actions/assignmentTemplateActions.ts`
  - `createTemplate()`
  - `getTemplates()`
  - `updateTemplate()`
  - `deleteTemplate()`

### UI Components (TypeScript 변환)
- 133개 파일 `.js` → `.ts/.tsx`
  - 30개: Foundation (types, utils)
  - 13개: Server Actions
  - 60개: Components
  - 30개: App Routes

### UI Components (Assignment 템플릿)
- `components/Assignment/AssignmentModal.tsx` (수정)
  - "템플릿으로 저장" 버튼 추가
  - "내 템플릿" 드롭다운 추가
- `components/Assignment/TemplateManager.tsx` (신규)
  - 템플릿 목록 표시
  - 템플릿 수정/삭제 UI

---

## 🗓️ Timeline

**Week 1 (2025-11-09 ~ 11-15): TypeScript 마이그레이션**
- **Day 1-2**: Phase 1-2 (Foundation + Server Actions, 2.5h)
- **Day 3-5**: Phase 3 (Components, 2h)
- **Day 6-7**: Phase 4 (App Routes, 1h) + 검증

**Week 2 (2025-11-16 ~ 11-22): Assignment 템플릿**
- **Day 1-2**: DB + Server Actions (1-1.5h)
- **Day 3-4**: UI 컴포넌트 (1.5-2h)
- **Day 5-7**: 테스트 + 디버깅 + 문서 작성 (0.5-1h)

**Flexibility**: 일정은 유연하게 조정 가능 (Solo Dev)

---

## 🔗 Dependencies

### Prerequisites
- ❌ 없음 (독립 실행 가능)

### Blocking Dependencies
- ❌ 없음

### External Dependencies
- ✅ TypeScript 5.x
- ✅ Next.js 14 (App Router)
- ✅ Supabase (assignments 테이블 존재)

**Note**: Phase 0는 독립적으로 실행 가능하며, Phase 1 (MVP)의 선행 조건입니다.

---

## ⚠️ Risks & Mitigation

### Risk 1: TypeScript 변환 중 타입 에러 대량 발생
**Probability**: Medium
**Impact**: Medium
**Mitigation**:
- Phase별 점진적 변환 (Foundation → Server Actions → Components → App Routes)
- `any` 임시 사용 허용 (`TODO(ANY-TODO)` 태그로 추적)
- `tsc --noEmit` 매 Phase 완료 시 실행

### Risk 2: 기존 기능 회귀 (Regression)
**Probability**: Low
**Impact**: High
**Mitigation**:
- 변환 전 스모크 테스트 실행
- 변환 후 동일 테스트 재실행
- 주요 기능 수동 체크 (로그인, 코스 생성, 결제)

### Risk 3: Assignment 템플릿 복잡도 증가
**Probability**: Low
**Impact**: Low
**Mitigation**:
- MVP 범위로 축소 (저장/불러오기만)
- 고급 기능은 Phase 2로 연기 (공유, 카테고리)

---

## 🔗 Related Documents

**Roadmap**:
- [Product Roadmap](../ROADMAP.md)
- [Product Vision](../PROJECT_VISION.md)

**Work Plans**:
- [Agile Restructure](../work-plans/agile-restructure.md)

**Issues**:
- #19: TypeScript 마이그레이션
- #10: Assignment 템플릿

**Library** (완료 후 작성):
- `docs/library/assignment-template.md`

---

**Last Updated**: 2025-11-09
**Owner**: Development Team
**Status**: 📋 Planned
