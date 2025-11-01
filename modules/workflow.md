# Project Workflow

## Overview

Components:
- **GitHub Milestones** - Progress tracking
- **docs/work-plans/** - Temporary plans (complex features)
- **docs/library/** - Permanent knowledge (completed features)

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
Current phases:
- **Phase 1: Core Platform** (2025-08-31) - Student/Teacher core
- **Phase 2: Admin System** (2025-09-15) - PreSkool integration
- **Phase 3: Enhancement** (Open) - Performance, AI

Create issue with milestone:
```bash
gh issue create --title "[Feature] Name" --milestone "Phase 1: Core Platform"
gh issue list --milestone "Phase 1: Core Platform"
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
  --milestone "Phase 1: Core Platform"
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

## Progress Tracking
```bash
gh issue list --milestone "Phase 1: Core Platform"
gh issue list
```
Dashboard: https://github.com/Hulkeinstein/dvs-template01/milestones

---

## Checklists
**Before**: Issue (assign Milestone), branch, Work Plan (complex only)
**During**: Conventional Commits, update Work Plan, regular commits
**Complete**: Library doc, delete Work Plan, PR (`Closes #XX`)
**After**: Clean branches, check Milestone, plan next
