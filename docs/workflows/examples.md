---
title: "Workflow Examples"
tags:
  - phase/1
  - type/docs
  - progress/completed
created: 2025-08-08
updated: 2025-11-06
lifecycle: active
aliases: [WORKFLOW_EXAMPLES, workflow-examples]
category: workflow
related:
  - work-plan-guide.md
  - milestone-workplan-adr-relationship.md
  - ../../modules/workflow.md
---

# Workflow Examples

실제 개발 시나리오별 Work Plan/ADR 시스템 사용 예시입니다.

---

## Scenario 1: 간단한 버그 수정 (Simple)

### 상황
CSS 버튼 정렬이 깨져있습니다.

### 복잡도
**Simple** (<30분, Milestone만)

### Workflow
```bash
# 1. Issue 생성 (Milestone 할당)
gh issue create \
  --title "[Bug] Submit button misaligned" \
  --milestone "Active"

# 2. Branch 생성
git checkout -b fix/button-alignment

# 3. 수정
# public/scss/components/_button.scss 수정

# 4. Commit
git commit -m "fix(ui): align submit button to center"

# 5. PR & Merge
gh pr create --title "fix: button alignment - Closes #21"
# Auto-merge after checks pass

# 6. Branch 정리
git checkout main && git pull && git branch -d fix/button-alignment
```

**Docs**: None (Milestone only)

---

## Scenario 2: 북마크 기능 (Standard)

### 상황
학생 대시보드에 북마크 기능을 추가해야 합니다.

### 복잡도
**Standard** (3시간, Milestone + Work Plan)

### Workflow

#### 1. Issue & Milestone
```bash
gh issue create \
  --title "[Feature] Bookmark system" \
  --milestone "Phase 2: Enhancement"
# Created: Issue #30
```

#### 2. Work Plan 생성
```bash
# File: docs/work-plans/bookmark-system.md
```
```markdown
# Bookmark System - Work Plan

**Status**: Active
**Issue**: #30

## Phases
- [ ] P0: 설계 (DB 스키마, API)
- [ ] P1: Backend (bookmarkActions.js)
- [ ] P2: Frontend (BookmarkButton.js)
- [ ] P3: 테스트 & 완료
```

#### 3. 개발
```bash
# Branch
git checkout -b feature/bookmark-system

# Phase 0: 설계
# - Work Plan 업데이트
# - DB 스키마 정의

# Phase 1: Backend
git commit -m "feat(bookmark): add bookmark actions"

# Phase 2: Frontend
git commit -m "feat(bookmark): add bookmark button component"

# Phase 3: 테스트
npm run test
npm run typecheck
npm run build
```

#### 4. Library 문서 작성
```bash
# File: docs/library/bookmark.md
```
```markdown
# Bookmark System

## 아키텍처
- Table: `bookmarks (user_id, course_id)`
- RLS: 자신의 북마크만 조회/수정

## 구현
- Server Action: `app/lib/actions/bookmarkActions.js`
- Component: `components/Student/BookmarkButton.js`

## 참고
- PR: #123
- Issue: #30
```

#### 5. Work Plan 삭제 & PR
```bash
git rm docs/work-plans/bookmark-system.md
git commit -m "docs: add bookmark library doc"

gh pr create --title "feat: bookmark system - Closes #30"
```

**Docs Created**:
- `docs/work-plans/bookmark-system.md` (임시, 삭제됨)
- `docs/library/bookmark.md` (영구)

---

## Scenario 3: 인증 시스템 개선 (Complex)

### 상황
소셜 로그인과 이메일 로그인을 모두 지원해야 합니다.

### 복잡도
**Complex** (1주+, Milestone + Work Plan + ADR)

### Workflow

#### 1. Issue & Milestone
```bash
gh issue create \
  --title "[Feature] Hybrid authentication" \
  --milestone "Phase 1: MVP"
# Created: Issue #25
```

#### 2. Work Plan 생성
```bash
# File: docs/work-plans/auth-improvement.md
```
```markdown
# Authentication Improvement - Work Plan

**Status**: Active
**Issue**: #25

## Phases
- [ ] P0: 현황 분석
- [ ] P1: 설계 (중요 결정 필요)
- [ ] P2: OAuth 구현
- [ ] P3: Email 구현
- [ ] P4: 통합 & 테스트
- [ ] P5: 완료
```

#### 3. 개발 (Phase 0-1)
```bash
git checkout -b feature/hybrid-auth

# Phase 0: 현황 분석
# - Work Plan 업데이트
# - 기존 auth 시스템 조사

# Phase 1: 설계
# - 중요 결정: "OAuth + Email 하이브리드"
```

#### 4. ADR 작성 (Phase 1에서)
```bash
# File: docs/adr/0003-hybrid-authentication.md
```
```markdown
# 0003. Hybrid Authentication

**Date**: 2025-11-06
**Status**: Accepted

## Context
사용자 편의성과 기존 계정 유지를 위해 다양한 인증 방법 필요

## Considered Options
- Option 1: OAuth only (Google, GitHub)
- Option 2: Email/Password only
- Option 3: Hybrid (OAuth + Email)

## Decision Outcome
**Chosen**: Option 3 - Hybrid

### Positive Consequences
- 사용자 선택권
- 기존 이메일 사용자 유지
- 소셜 로그인 편의성

### Negative Consequences
- 구현 복잡도 증가
- 유지보수 부담

## Links
- Issue: #25
- Implementation: library/authentication.md
```

#### 5. Work Plan에 Decision 기록
```markdown
## Decisions Log

### D1: 인증 방식 선택 (2025-11-06)
**결정**: OAuth + Email 하이브리드

**상세**: [ADR-0003](../adr/0003-hybrid-authentication.md) 참조
```

#### 6. 개발 계속 (Phase 2-4)
```bash
# Phase 2: OAuth
git commit -m "feat(auth): add Google OAuth"

# Phase 3: Email
git commit -m "feat(auth): add email/password auth"

# Phase 4: 통합
git commit -m "feat(auth): integrate hybrid auth"

# 테스트
npm run test && npm run typecheck && npm run build
```

#### 7. Library 문서 작성
```bash
# File: docs/library/authentication.md
```
```markdown
# Authentication System

## 아키텍처
하이브리드 인증 시스템

**설계 결정**: [ADR-0003: Hybrid Authentication](../adr/0003-hybrid-authentication.md)

### OAuth (Google, GitHub)
- NextAuth.js
- Social login

### Email/Password
- Bcrypt (saltRounds: 10)
- SHA-256 token (reset password)

## 참고
- ADR: 0003
- PR: #123
- Issue: #25
```

#### 8. Work Plan 삭제 & PR
```bash
git rm docs/work-plans/auth-improvement.md
git commit -m "docs: add authentication library doc"

gh pr create --title "feat: hybrid authentication - Closes #25"
```

**Docs Created**:
- `docs/work-plans/auth-improvement.md` (임시, 삭제됨)
- `docs/adr/0003-hybrid-authentication.md` (영구, 불변)
- `docs/library/authentication.md` (영구, ADR 참조)

---

## Scenario 4: Hotfix (긴급 보안 패치)

### 상황
프로덕션에서 SQL Injection 취약점 발견

### 복잡도
**Simple** (긴급, Work Plan 없음)

### Workflow
```bash
# 1. Hotfix branch (main에서 직접)
git checkout main
git checkout -b hotfix/sql-injection

# 2. 긴급 수정
# app/lib/actions/courseActions.js 수정
# Parameterized query로 변경

# 3. Commit
git commit -m "fix(security): prevent SQL injection in course search"

# 4. PR (긴급, 즉시 머지)
gh pr create \
  --title "HOTFIX: SQL injection vulnerability - Closes #99" \
  --label "security,hotfix"

# 5. 즉시 배포
# Vercel auto-deploy after merge

# 6. 사후 조치
# - 보안 감사 실시
# - 다른 endpoint 점검
# - 문서 업데이트 (troubleshooting/)
```

**Docs**: `docs/troubleshooting/sql-injection-prevention.md` (사후)

---

## Scenario 5: 문서 업데이트

### 상황
ADR 시스템을 프로젝트에 도입했습니다.

### 복잡도
**Standard** (1시간, Work Plan)

### Workflow
```bash
# 1. Issue
gh issue create \
  --title "[Docs] Add ADR system" \
  --milestone "Active"
# Created: Issue #49

# 2. Work Plan
# docs/work-plans/workflow-improvement.md

# 3. Branch
git checkout -b docs/workflow-improvement

# 4. 작업
# - docs/adr/ 폴더 생성
# - TEMPLATE.md, INDEX.md 작성
# - CLAUDE.md 업데이트

# 5. Commit
git commit -m "feat(docs): add ADR system"

# 6. PR
gh pr create --title "feat: improve workflow with ADR system - Closes #49"
```

**Docs**: Work Plan만 (library 불필요, docs 자체가 산출물)

---

## Scenario 6: 여러 작업 동시 진행

### 상황
3개 기능을 병렬로 개발 중입니다.

### Workflow
```bash
# Feature 1: 북마크 (Standard)
git checkout -b feature/bookmark
# Work Plan: bookmark-system.md

# Feature 2: 배지 시스템 (Complex)
git checkout main
git checkout -b feature/badges
# Work Plan: badge-system.md
# ADR: 0004-badge-gamification.md

# Feature 3: 알림 (Standard)
git checkout main
git checkout -b feature/notifications
# Work Plan: notifications.md

# 각 브랜치에서 독립적으로 작업
# 완료 순서대로 PR 생성
```

**Tips**:
- Work Plan으로 각 작업 진행 상황 추적
- Milestone으로 전체 진행률 확인
- 브랜치 간 conflict 최소화

---

## Complexity Decision Guide

### Simple (<1h)
- CSS 수정, typo 수정
- 간단한 텍스트 변경
- 설정 파일 수정

**Actions**: Branch → Fix → PR

### Standard (2-4h)
- 새 컴포넌트 추가
- API endpoint 추가
- 폼 validation 구현

**Actions**: Issue → Work Plan → Code → Library → PR

### Complex (1주+)
- 인증 시스템
- 결제 통합
- 대규모 리팩토링

**Actions**: Issue → Work Plan → ADR (if arch) → Code → Library → PR

---

## Common Patterns

### Pattern 1: Feature Development
```
Milestone → Issue → Work Plan → Code → Library → Delete WP → PR
```

### Pattern 2: Bug Fix
```
Milestone → Issue → Branch → Fix → PR
```

### Pattern 3: Architecture Change
```
Milestone → Issue → Work Plan → ADR → Code → Library → Delete WP → PR
```

### Pattern 4: Hotfix
```
Hotfix Branch → Fix → PR → Deploy → Post-action
```

---

## Related Guides

- **Work Plan**: [work-plan-guide.md](./work-plan-guide.md)
- **ADR**: [../adr/INDEX.md](../adr/INDEX.md)
- **Relationship**: [milestone-workplan-adr-relationship.md](./milestone-workplan-adr-relationship.md)
- **Workflow**: [../../modules/workflow.md](../../modules/workflow.md)
