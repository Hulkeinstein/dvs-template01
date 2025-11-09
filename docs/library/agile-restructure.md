---
title: "Agile Project Structure Restructure"
tags:
  - type/docs
  - component/workflow
  - phase/planning
milestone: Active
date_completed: 2025-11-09
created: 2025-11-09
updated: 2025-11-09
lifecycle: active
related:
  - ../PROJECT_VISION.md
  - ../ROADMAP.md
  - ../milestones/active.md
  - ../milestones/phase-0.md
  - ../milestones/phase-1.md
  - ../milestones/phase-2.md
  - ../milestones/phase-3.md
  - ../workflows/milestone-workplan-adr-relationship.md
---

# Agile Project Structure Restructure

## 📊 개요

애자일 프로젝트 구조 재정립 완료 (2025-11-09)

- **목적**: Bottom-up 접근을 Top-down 애자일 구조로 전환
- **범위**: Vision → Roadmap → Milestone 문서 체계 구축
- **Issue**: #53
- **상태**: 완료 ✅

## 🏗️ 문서 아키텍처

### 계층 구조

```
Vision (WHY)
  ↓
Roadmap (WHAT)
  ↓
Milestone (WHEN)
  ↓
Work Plan (HOW - 임시)
  ↓
Issue (DO)
```

### 생성된 문서 (8개)

**Planning Layer**:
- `docs/PROJECT_VISION.md` - 제품 비전 (문제, 솔루션, 목표)
- `docs/ROADMAP.md` - 로드맵 (Phase 0-3 실행 계획)

**Execution Layer**:
- `docs/milestones/active.md` - Active Milestone (Quick Wins)
- `docs/milestones/phase-0.md` - Phase 0: Tech Debt
- `docs/milestones/phase-1.md` - Phase 1: MVP
- `docs/milestones/phase-2.md` - Phase 2: Enhancement
- `docs/milestones/phase-3.md` - Phase 3: Scale

**Workflow Updates**:
- `modules/workflow.md` - Milestone 정의 업데이트
- `docs/workflows/milestone-workplan-adr-relationship.md` - Milestone 매핑 업데이트
- `docs/workflows/examples.md` - Milestone 예시 업데이트
- `docs/CLAUDE.md` - Milestone 현황 업데이트
- `docs/README.md` - 문서 카탈로그 업데이트

## 🔑 주요 결정

### D1: Milestone 명명 규칙
**결정**: Phase 0-3 + Active (5개 Milestone)
- Phase 0: Tech Debt (기술 부채 해소)
- Phase 1: MVP (YouTube 큐레이션 핵심)
- Phase 2: Enhancement (품질 관리 + 수익화)
- Phase 3: Scale (대규모 확장 준비)
- Active: Quick Wins (<2h tasks, 지속적)

**근거**:
- Vision과 일관성 (Phase 구분)
- 명확한 우선순위 (숫자 순서)
- 기존 Milestone 재활용 (Phase 1 → Phase 0, Phase 2 → Phase 2)

**대안**: Sprint 방식 (Week 1-12) → 거부 (Solo Dev에 부적합)

---

### D2: Active Milestone 역할
**결정**: Quick Wins 전용 Milestone (지속적, Close하지 않음)
- <2h tasks
- 문서, Hotfix, Chore
- Phase와 독립적

**근거**:
- Solo Dev 특성 (즉시 처리 필요한 작업 존재)
- Phase Milestone 오염 방지 (대규모 기능만 Phase에)
- Flexibility 확보

**대안**: 모든 작업을 Phase에 할당 → 거부 (관리 복잡도 증가)

---

### D3: Priority Label 규칙
**결정**: priority/P0-P3 (4단계)
- P0: Critical (Hotfix, Production 장애)
- P1: High (Phase의 핵심 기능)
- P2: Medium (Phase의 일반 기능)
- P3: Low (Nice to have)

**근거**:
- 간단하고 명확 (4단계면 충분)
- Solo Dev에 적합 (5단계 이상은 과도)

**대안**: priority/high/medium/low → 채택 (P0-P3 대신)

---

### D4: Milestone Exit Criteria 유연성
**결정**: 80% 완료 시 Milestone Close 허용

**근거**:
- Solo Dev 특성 (완벽주의 방지)
- 빠른 Phase 전환 (블로킹 방지)
- 잔여 작업은 다음 Phase 또는 Active로 이동

**대안**: 100% 완료 강제 → 거부 (Phase 지연 위험)

---

### D5: Issue 생성 방식 - CLI vs Template
**결정**: CLI (`gh issue create`) 우선, Template 제거

**근거**:
- Solo Dev 환경 (빠르고 간단)
- Template은 팀 협업에 적합
- CLI가 AI-friendly (스크립트 자동화 가능)

**대안**: Issue Template (YAML) → 거부 (오버킬)

**Implementation**:
```bash
gh issue create \
  --title "[Feature] 기능명" \
  --milestone "Phase 1: MVP" \
  --label "type/feature,priority/P1,component/api" \
  --body "Problem: ...

Solution: ...

Acceptance:
- [ ] ...
"
```

## 📦 구현 세부사항

### Milestone 문서 표준 구조

각 Milestone 문서는 다음 섹션 포함:

1. **Overview** - 목적, Why 이 Phase?
2. **Goals** - Primary Goals, Success Metrics
3. **Features** - Feature별 상세 (User Story, Estimate, Acceptance)
4. **Issues** - 기존 Issues 매핑, 예상 Issues
5. **Exit Criteria** - 완료 조건 (80% 허용)
6. **Deliverables** - 산출물 (Migrations, Actions, UI)
7. **Timeline** - Flexible 일정 (Solo Dev 특성)
8. **Dependencies** - Prerequisites, Blocking, External
9. **Risks & Mitigation** - 리스크 분석
10. **Related Documents** - Roadmap, ADR, Library 링크

### Front-matter 표준

```yaml
---
title: "Milestone Title"
tags:
  - phase/0  # phase/0|1|2|3|planning
  - type/feature  # feature|bug|docs|chore
  - component/api  # api|ui|database|workflow
  - progress/backlog  # backlog|in-progress|completed
created: YYYY-MM-DD
updated: YYYY-MM-DD
lifecycle: active  # active|deprecated|draft
related:
  - ../ROADMAP.md
---
```

### GitHub Milestone 재구성

**Renamed**:
- "Phase 1: Core Platform" → "Phase 0: Tech Debt"
- "Phase 2: Admin System" → "Phase 2: Enhancement"

**Created**:
- "Phase 1: MVP" (신규)
- "Phase 3: Scale" (신규)

**Maintained**:
- "Active" (Quick Wins, 지속적)

## 🔗 Workflow 통합

### Issue → Milestone 라우팅

**Active로 라우팅**:
- <2h tasks
- type/docs, type/chore, type/hotfix
- Phase 무관 작업

**Phase로 라우팅**:
- 2h+ tasks
- type/feature, type/refactor
- Phase의 Exit Criteria에 명시된 작업

### Milestone → Work Plan → Library

```
Milestone (long-term plan)
  ↓
Work Plan (execution, 임시)
  ↓ 완료 후 승격
Library (knowledge base, 영구)
```

**Rule**: Work Plan 완료 후 즉시 Library 작성 + Work Plan 삭제

## 📈 성과 지표

### 작업 시간

**예상**: 3-4시간
**실제**: ~4시간
- P0: 현황 분석 (15min)
- P1: Vision 작성 (45min)
- P2: Roadmap 작성 (40min + v2.0 재작성 30min)
- P3: Milestone 재정의 (50min)
- P3 후속: 문서 업데이트 (30min)
- P4: Sprint Planning (스킵)
- P5: Label 적용 (25min)
- P6: 문서 검증 (20min)

### 산출물

**문서**: 8개 (Vision, Roadmap, 5 Milestones, README 업데이트)
**GitHub**: 4개 Milestones 재구성, 4개 Issues 재할당
**Code**: 0개 (문서 작업만)

## ⚠️ 교훈

### 성공 요인

1. **As-Is 분석 우선**: 72개 migrations 분석 → Gap Analysis → Roadmap v2.0
2. **Solo Dev 최적화**: Sprint 스킵, Template 제거, CLI 우선
3. **Phase별 명확한 목적**: Tech Debt → MVP → Enhancement → Scale
4. **유연한 Exit Criteria**: 80% 완료 허용 → 블로킹 방지

### 위험 요소

1. **Roadmap v1.0 폐기**: Vision만 기반 → 실제 구현 미확인
   - **교훈**: 항상 As-Is 분석 먼저
2. **Sprint 프로세스 고려**: Solo Dev에 부적합함을 발견
   - **교훈**: 팀 프로세스를 Solo에 적용하지 말 것

### 개선 사항

1. **Front-matter 표준화**: tags 네임스페이스 (phase/, type/, component/)
2. **component 태그 확장**: workflow, admin, ml 추가
3. **related 필드 활용**: 문서 간 링크 명시

## 🔗 Related Documents

**Vision & Strategy**:
- [Product Vision](../PROJECT_VISION.md)
- [Product Roadmap](../ROADMAP.md)

**Milestones**:
- [Active Milestone](../milestones/active.md)
- [Phase 0: Tech Debt](../milestones/phase-0.md)
- [Phase 1: MVP](../milestones/phase-1.md)
- [Phase 2: Enhancement](../milestones/phase-2.md)
- [Phase 3: Scale](../milestones/phase-3.md)

**Workflow**:
- [Milestone-WorkPlan-ADR Relationship](../workflows/milestone-workplan-adr-relationship.md)
- [Workflow Examples](../workflows/examples.md)
- [Project Workflow](../../modules/workflow.md)

**Issues**:
- #53: 애자일 프로젝트 구조 재정립
- #19: TypeScript 마이그레이션 (Phase 0)
- #10: Assignment 템플릿 (Phase 0)
- #12: 다중 배지 시스템 (Phase 2)

---

**Last Updated**: 2025-11-09
**Owner**: Development Team
**Status**: ✅ Completed
