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

### Git Workflow Config
`.git-workflow.json`:
```json
{
  "autoPush": false,
  "requirePR": true,
  "squashMerge": true,
  "deleteAfterMerge": true,
  "securityScan": true
}
```

### Quick Branch Decisions
No branch needed:
- Doc edits (README, CLAUDE.md)
- Typo fixes
- Comment additions

Branch required:
- Code logic changes
- New features
- Bug fixes
- Schema changes

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

Create Library document (`docs/library/<feature>.md`):
```yaml
---
title: Feature Name
milestone: Phase 1: Core Platform
date_completed: 2025-10-29
status: stable
tags: [tag1, tag2]
related:
  - library/other-feature.md
  - work-plans/next-feature.md
---

# Feature Name

## Overview
- Purpose
- Background
- Release date

## Architecture
- Database schema
- Components
- API endpoints

## Key Decisions (ADR-lite)
- Decision title → Conclusion
  - Rationale
  - Alternatives
  - Impact

## Implementation Points
- Core implementation details

## Tests & Validation
- Test scenarios

## Related Files
- List of files

## Related PRs
- #XX - Description

## Related Docs
- Links to related docs
```

Delete Work Plan (if exists):
```bash
git rm docs/work-plans/<feature>.md
git commit -m "docs: promote work-plan to library"
```

Create PR:
```bash
gh pr create \
  --title "feat: feature description - Closes #XX" \
  --body "Summary + Tests + Docs + Related"
```

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

### Scenario A: Simple (UI bug fix, typo)

Flow: Issue (optional) → Branch → Fix → PR
Docs: No Work Plan, No Library

Example:
```bash
git checkout -b fix/button-alignment
git commit -m "fix(ui): align buttons"
gh pr create --title "fix: button alignment - Fixes #XX"
```

### Scenario B: Standard (New feature, DB/API changes)

Flow: Issue + Milestone → Work Plan → Branch → Develop → Library doc → Delete Work Plan → PR
Docs: Work Plan (decisions), Library (required)

Example:
```bash
gh issue create --title "[Feature] PayPal" --milestone "Phase 1"
# Create docs/work-plans/paypal.md
git checkout -b feature/paypal-checkout
# Develop + update Work Plan
# Create docs/library/paypal.md
git rm docs/work-plans/paypal.md
gh pr create --title "feat: PayPal - Closes #XX"
```

### Scenario C: Hotfix (Production bug, security)

Flow: Hotfix branch → Minimal fix → Local test → Emergency PR → Deploy → Monitor
Docs: No Work Plan, Library optional (later)

Example:
```bash
git checkout -b hotfix/payment-timeout
# Minimal fix
npm run dev  # Test locally
gh pr create --title "hotfix: fix timeout - Fixes #XX"
# Monitor deployment
```

---

## Documentation Rules

### Front-matter Standard

All library documents:
```yaml
---
title: Feature Name              # Required
milestone: Phase 1               # GitHub Milestone
date_completed: 2025-10-29       # Completion date
status: stable                   # stable | deprecated | experimental
tags: [tag1, tag2]              # Search/classification
related:                         # Related documents
  - library/other.md
  - work-plans/next.md
---
```

### Bidirectional Links

Cross-reference documents:
```markdown
## Related Docs
- [Feature A](./feature-a.md) - Connection reason
- [Feature B Work Plan](../work-plans/feature-b.md) - Usage plan
```

---

## Progress Tracking

Use GitHub directly for real-time progress:

```bash
# View milestones
gh issue list --milestone "Phase 1: Core Platform"

# View all issues
gh issue list

# View project board
gh project list
```

Dashboard: https://github.com/Hulkeinstein/dvs-template01/milestones

---

## Checklists

### Before Starting
- [ ] Create GitHub Issue (assign Milestone)
- [ ] Create feature branch
- [ ] (Complex only) Create Work Plan

### During Development
- [ ] Use Conventional Commits
- [ ] Update Work Plan (if exists)
- [ ] Regular commits

### On Completion
- [ ] Create `docs/library/<feature>.md` (front-matter, architecture, ADR, files)
- [ ] Delete Work Plan (if exists)
- [ ] Create PR (`Closes #XX`)

### After PR Merge
- [ ] Clean local branches
- [ ] Check Milestone progress
- [ ] Plan next task

---

## Directory Structure

```
docs/
├── work-plans/                # In-progress (temporary)
│   └── feature.md             # Complex features only
│
├── library/                   # Completed (permanent)
│   ├── checkout.md
│   └── bookmark.md
│
├── integrations/              # External tools
├── troubleshooting/
├── architecture/
└── testing/
```

Progress tracking: Use GitHub Milestones directly
