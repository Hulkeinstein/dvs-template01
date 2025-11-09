---
title: "Milestone, Work Plan, ADR - DVS Relationship Guide"
tags:
  - type/docs
  - phase/1
created: 2025-11-06
updated: 2025-11-06
lifecycle: active
category: workflow
related:
  - work-plan-guide.md
  - ../adr/INDEX.md
  - ../../modules/workflow.md
---

# Milestone, Work Plan, ADR - DVS Project Guide

**전역 개념**: 모든 프로젝트 공통 원칙은 전역 메모리 참조
**이 문서**: DVS 프로젝트의 구체적 적용 예시

---

## DVS Project Specifics

### Current Milestones

- **Active** (no due date): Quick Wins (<2h tasks, docs, hotfixes)
- **Phase 0: Tech Debt** (2025-11-22): TypeScript 마이그레이션, Assignment 템플릿
- **Phase 1: MVP** (2025-12-14): YouTube 큐레이션 핵심 (API, 좋아요, Quality Control)
- **Phase 2: Enhancement** (2025-12-28): 다중 배지, 신고 시스템, 광고 연동
- **Phase 3: Scale** (2026-01-25): 검색 최적화, 추천 알고리즘, ML 품질 분석

**GitHub Milestone 매핑**:
| GitHub Milestone | Docs Milestone | 상태 |
|------------------|---------------|------|
| Active | Active | 활성 |
| Phase 1: Core Platform | Phase 0: Tech Debt | 이름 변경 예정 |
| Phase 2: Admin System | Phase 2: Enhancement | 이름 변경 예정 |
| (신규 생성 필요) | Phase 1: MVP | 생성 예정 |
| (신규 생성 필요) | Phase 3: Scale | 생성 예정 |

**Routing Rules**:
- <2h tasks (docs, hotfix, lint, config) → **Active**
- Tech Debt (#19 TypeScript, #10 Assignment) → **Phase 0**
- Vision features (YouTube API, 좋아요, Quality Control, Premium Domain) → **Phase 1**
- Enhancement (배지 #12, 신고, 광고, 금지어, 완료율) → **Phase 2**
- Future (검색, 추천, ML, 조작 방지) → **Phase 3**

**Milestone 정의 문서**: `docs/milestones/*.md` 참조

### Work Plan Template
**Location**: `docs/work-plans/TEMPLATE.md`

**DVS-specific sections**:
- Issue: #XX
- Delete By: YYYY-MM-DD (30일 후)
- Response Template (AI Protocol)
- Decisions Log
- Risks & Mitigations

### ADR Template
**Format**: MADR (Markdown ADR)
**Location**: `docs/adr/TEMPLATE.md`
**Numbering**: Sequential 4-digit (0001, 0002, 0003...)

---

## Decision Tree (DVS)

```
작업 시작
  ↓
Q1: Milestone 선택
  ├─ <2h (docs, hotfix, lint) → Active
  ├─ Tech Debt (#19, #10) → Phase 0
  ├─ Vision features (YouTube API, 좋아요) → Phase 1
  ├─ Enhancement (배지, 신고, 광고) → Phase 2
  └─ Future (검색, 추천, ML) → Phase 3
  ↓
Q2: 복잡도 판단
  ├─ Simple (<1h)
  │   └─ Milestone만
  │       └─ Branch → Fix → PR
  │
  ├─ Standard (2-4h)
  │   └─ Milestone + Work Plan
  │       └─ Issue → Work Plan → Code → Library → Delete WP → PR
  │
  └─ Complex (1주+)
      └─ Milestone + Work Plan + ADR (if architecture)
          └─ Issue → Work Plan → ADR → Code → Library → Delete WP → PR
```

---

## DVS Workflow Examples

### Example 1: CSS Bug Fix (Simple)
**Complexity**: <30분
**Milestone**: Active

```
Milestone: Active
  └─ Issue #21: CSS 버튼 정렬 버그
       └─ Branch: fix/button-alignment
            └─ Commit: "fix(ui): align submit button"
                 └─ PR & Merge (Closes #21)
```

**Docs Created**: None

---

### Example 2: Assignment Template (Standard)
**Complexity**: 2-4시간
**Milestone**: Phase 0: Tech Debt

```
Milestone: Phase 0: Tech Debt
  └─ Issue #10: Assignment 템플릿 시스템
       └─ Work Plan: assignment-template.md
            ├─ Phase 0: 설계
            ├─ Phase 1: 구현
            ├─ Phase 2: 테스트
            └─ Phase 3: 완료
                 └─ Library: assignment-template.md
                      └─ Delete Work Plan
                           └─ PR & Merge (Closes #10)
```

**Docs Created**:
- `docs/work-plans/assignment-template.md` (임시, 삭제됨)
- `docs/library/assignment-template.md` (영구)

---

### Example 3: Authentication Improvement (Complex)
**Complexity**: 1주+
**Milestone**: Phase 1: MVP

```
Milestone: Phase 1: MVP
  └─ Issue #25: 인증 시스템 개선
       └─ Work Plan: auth-improvement.md
            ├─ Phase 0: 현황 분석
            ├─ Phase 1: 설계
            │    └─ Decision: "OAuth + Email 하이브리드"
            │         └─ ADR-0003: Hybrid Authentication
            │              - Context: 소셜 + 이메일 모두 지원 필요
            │              - Options: OAuth만 vs Email만 vs 하이브리드
            │              - Decision: 하이브리드 (사용자 선택권)
            ├─ Phase 2-4: 구현 & 테스트
            └─ Phase 5: 완료
                 └─ Library: authentication.md
                      └─ References ADR-0003
                           └─ Delete Work Plan
                                └─ PR & Merge (Closes #25)
```

**Docs Created**:
- `docs/work-plans/auth-improvement.md` (임시, 삭제됨)
- `docs/adr/0003-hybrid-authentication.md` (영구, 불변)
- `docs/library/authentication.md` (영구, ADR 참조)

---

## Cross-Reference Patterns (DVS)

### Work Plan → ADR
```markdown
# auth-improvement.md (Work Plan)

## Decisions Log

### D1: 인증 방식 선택 (2025-11-05)
**결정**: OAuth + Email 하이브리드

**이유**:
- 사용자 선택권 제공
- 기존 이메일 사용자 유지
- 소셜 로그인 편의성

**상세 분석**: [ADR-0003](../adr/0003-hybrid-authentication.md) 참조

**영향**: auth 컴포넌트 전체 리팩토링
```

---

### Library → ADR
```markdown
# authentication.md (Library)

## 📊 개요
하이브리드 인증 시스템 (OAuth + Email/Password)

## 🏗️ 아키텍처

**설계 결정**: [ADR-0003: Hybrid Authentication](../adr/0003-hybrid-authentication.md)

### 인증 방식
1. **OAuth** (Google, GitHub)
   - NextAuth.js 사용
   - 소셜 로그인

2. **Email/Password**
   - Bcrypt (saltRounds: 10)
   - SHA-256 토큰 (비밀번호 재설정)
```

---

### ADR → Library & Issue
```markdown
# 0003-hybrid-authentication.md (ADR)

## Links
- **Implementation**: [library/authentication.md](../library/authentication.md)
- **Issue**: #25
- **PR**: #123
- **Related Work Plan**: Deleted (auth-improvement.md)
```

---

## File Lifecycle (DVS)

### Work Plan
```bash
# 생성
docs/work-plans/assignment-template.md

# 진행 중 (실시간 업데이트)
- Phase 0 완료 ✅
- Phase 1 진행 중 🔄
- Decision D1, D2 기록

# 완료 후
git rm docs/work-plans/assignment-template.md  # 삭제
```

### ADR
```bash
# 생성 (Work Plan Phase 1에서)
docs/adr/0003-hybrid-authentication.md

# 상태 변화
Status: Proposed → Accepted → (Superseded)

# 절대 삭제하지 않음 (영구 보존)
# 변경 필요 시 새 ADR 작성 (Supersede)
```

### Library
```bash
# 생성 (Work Plan 완료 시)
docs/library/authentication.md

# 업데이트 (기능 변경 시)
git commit -m "docs: update authentication library"

# ADR 참조 추가
[ADR-0003](../adr/0003-hybrid-authentication.md)
```

---

## When to Create Each (DVS Checklist)

### Milestone
- [x] 프로젝트 시작 시
- [x] 새 Phase 시작 시
- [ ] 모든 Issue 할당

### Work Plan
- [ ] 작업 2시간 이상 예상?
- [ ] 3개 이상 Phase 필요?
- [ ] 여러 세션으로 나뉠 것 같은가?
- [ ] 복잡한 결정 필요?

**Yes → Work Plan 생성**

### ADR
- [ ] 데이터베이스/백엔드 선택?
- [ ] 프레임워크/라이브러리 선택?
- [ ] 인증/보안 방식 결정?
- [ ] 아키텍처 패턴 채택?
- [ ] 프로젝트 전체 영향?

**Yes → ADR 작성**

### Library
- [ ] 기능 완료?
- [ ] Work Plan 있었으면 삭제?
- [ ] ADR 있으면 참조 추가?
- [ ] 구현 가이드 작성?

**Yes → Library 작성**

---

## DVS Naming Conventions

### Work Plans
- Format: `<feature-name>.md`
- Example: `assignment-template.md`, `checkout-improvement.md`
- Lifecycle: Temporary (delete after completion)

### ADRs
- Format: `XXXX-decision-name.md`
- Example: `0003-hybrid-authentication.md`
- Numbering: Sequential (0001, 0002, 0003...)
- Lifecycle: Permanent (immutable)

### Library
- Format: `<feature-name>.md`
- Example: `authentication.md`, `checkout.md`
- Lifecycle: Permanent (update as needed)

---

## Related Documentation

- **Work Plan Guide**: [work-plan-guide.md](./work-plan-guide.md)
- **ADR Index**: [../adr/INDEX.md](../adr/INDEX.md)
- **Project Workflow**: [../../modules/workflow.md](../../modules/workflow.md)
- **CLAUDE.md**: [../CLAUDE.md](../CLAUDE.md) (Docs memory)

---

**Last Updated**: 2025-11-06
**Author**: Development Team
**Status**: Active
