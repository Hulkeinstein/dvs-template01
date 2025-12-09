# Project Workflow

## Overview

### Documentation System
- **Milestone**: Progress tracking (Active, Backlog)
- **Work Plan**: Execution plan (`docs/work-plans/`, temporary)
- **ADR**: Decision record (`docs/adr/`, permanent)
- **Library**: Feature docs (`docs/library/`, permanent)

관계 상세: [docs/workflows/milestone-workplan-adr-relationship.md](../docs/workflows/milestone-workplan-adr-relationship.md)

---

## Git Workflow (GitHub Flow)

### Branch Strategy
- `main` branch: Always deployable
- Feature branches: Branch from main, merge back
- No `develop` branch
- Short-lived branches (1-3 days max)

### Branch Naming
- `feature/<name>` - New features
- `fix/<name>` - Bug fixes
- `hotfix/<name>` - Production emergencies
- `chore/<name>` - Maintenance
- `docs/<name>` - Documentation
- `refactor/<name>` - Code restructure
Never: `my-branch`, `test`, `temp`

### Claude Code Rules
- Always create new branch before work (never on main)
- After PR merge → prompt user for new branch before next task
- Commit/PR only after user approval
- Use TodoWrite for task tracking

### Milestones

**Current structure**:
- **Active** (no due date): Quick Wins (<2h tasks, docs, hotfixes)
- **Phase 0: Tech Debt** (2025-11-22): TypeScript 마이그레이션, Assignment 템플릿
- **Phase 1: MVP** (2025-12-14): YouTube 큐레이션 핵심 (API, 좋아요, Quality Control)
- **Phase 2: Enhancement** (2025-12-28): 다중 배지, 신고 시스템, 광고 연동
- **Phase 3: Scale** (2026-01-25): 검색 최적화, 추천 알고리즘, ML 품질 분석

**Exit Criteria**: All issues closed → Milestone closed → (Optional) Release note

**Routing Rules**:
- <2h tasks (docs, hotfix, lint, config) → **Active**
- Tech Debt (#19 TypeScript, #10 Assignment) → **Phase 0**
- Vision features (YouTube API, 좋아요, Quality Control, Premium Domain) → **Phase 1**
- Enhancement (배지 #12, 신고, 광고, 금지어, 완료율) → **Phase 2**
- Future (검색, 추천, ML, 조작 방지) → **Phase 3**

**Milestone 정의 문서**: `docs/milestones/*.md` 참조

Create issue with milestone:
```bash
gh issue create --title "[Feature] Name" --milestone "Phase 1: MVP"
gh issue list --milestone "Active"
gh issue list --milestone "Phase 0: Tech Debt"
```

### PR Merge Cleanup
```bash
# GitHub: Delete branch button
# Local:
git checkout main
git pull origin main
git remote prune origin
git branch -d feature/branch-name
```

### Branch Protection (GitHub Settings)
- Require PR before merge: ON
- Required checks: type-check, lint, build
- Squash merge only
- Auto-delete branches: ON
- Force-push: OFF

Required checks: `typecheck && lint && build`

### Security (Never Commit)
- API keys, tokens, passwords
- `.env` files (`.env.example` OK)
- PII, credentials, SSH keys

### Quick Branch Decisions
No branch: Doc edits, typos, comments
Branch required: Code logic, features, bugs, schema

---

## Lifecycle: Issue → Work Plan → Library

### Stage 1: Start Feature

Create issue:
```bash
gh issue create \
  --title "[Feature] Name" \
  --milestone "Phase 1: MVP"
```

Create branch:
```bash
git checkout main
git pull origin main
git checkout -b feature/name
```

Work Plan (complex features only):
- Location: `docs/work-plans/<feature>.md`
- Include: Purpose, phases, decisions, test plan
- Simple features: Skip Work Plan

### Stage 2: During Development

Coding:
```bash
git commit -m "feat(feature): add component"
git commit -m "feat(feature): integrate with page"
```

Update Work Plan (if exists):
- Phase checklist
- Technical decisions
- Issues discovered

### Stage 3: Complete Feature

Library doc: `docs/library/<feature>.md` (front-matter, architecture, ADR, related)
Delete Work Plan: `git rm docs/work-plans/<feature>.md`
PR: `gh pr create --title "feat: description - Closes #XX"`

### Stage 4: After PR Merge

Cleanup:
```bash
git checkout main
git pull origin main
git branch -d feature/name
git remote prune origin
```

---

## Scenarios

**Simple** (UI fix, typo): Branch → Fix → PR (no docs)
**Standard** (Feature, DB/API): Issue+Milestone → Work Plan → Branch → Develop → Library → PR
**Hotfix** (Production, security): Hotfix branch → Minimal fix → Test → Emergency PR → Monitor

---

## Work Plan Protocol

### 사용 시점
- 3+ phases 필요
- 다중 파일 수정
- 여러 세션으로 나뉨
- 간단 작업 (UI fix, typo): 불필요

### 파일 위치
`docs/work-plans/<feature>.md` (임시, Library 승격 후 삭제)

### 복잡도별 문서화
| 복잡도 | 기준 | Work Plan | ADR | Library |
|--------|------|-----------|-----|---------|
| Simple | 1-2 phases | ❌ | ❌ | ❌ |
| Standard | 3+ phases | ✅ | ❌ | ✅ |
| Complex | 아키텍처 결정 | ✅ | ✅ | ✅ |

### AI 응답 규칙 (Work Plan 진행 시)
1. One phase at a time
2. Phase 완료 후 Work Plan 체크리스트 업데이트
3. 명시적 승인 없이 다음 Phase 금지
4. 불명확하면 질문 (가정 금지)
5. **모든 응답 끝**: `다음: [승인] [수정] [질문] [보류]`

### 수명주기
Milestone/Issue → Work Plan 생성 → Phase 실행 → Library 작성 → Work Plan 삭제 → PR

상세 가이드: [docs/workflows/work-plan-guide.md](../docs/workflows/work-plan-guide.md)

## Progress Tracking
```bash
gh issue list --milestone "Phase 0: Tech Debt"
gh issue list --milestone "Phase 1: MVP"
gh issue list --milestone "Active"
gh issue list
```
Dashboard: https://github.com/Hulkeinstein/dvs-template01/milestones

---

## Checklists
**Before**: Issue (assign Milestone), branch, Work Plan (complex only)
**During**: Conventional Commits, update Work Plan, regular commits
**Complete**: Library doc, delete Work Plan, PR (`Closes #XX`)
**After**: Clean branches, check Milestone, plan next
