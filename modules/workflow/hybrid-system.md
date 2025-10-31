# Project Workflow (Hybrid System)

## Overview

Components:
- **GitHub Milestones** - Progress tracking
- **docs/work-plans/** - Temporary plans (complex features)
- **docs/library/** - Permanent knowledge (completed features)
- **DEVELOPMENT_PLAN.md** - Project dashboard (snapshot + links)

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

Update DEVELOPMENT_PLAN.md:
```markdown
Completed Features:
- [Feature Name](./docs/library/feature.md) (2025-10-29)
  - Key highlights
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

## DEVELOPMENT_PLAN.md Management

Role: **Project dashboard** (snapshot + links only)

Structure:
```markdown
## Milestones Progress

### Phase 1: Core Platform [████████░░] 80%
Goal: 2025-08-31 | Progress: 4 closed / 2 open

Completed Features:
- [Feature Name](./docs/library/feature.md) (2025-10-29)
  - Highlights

In Progress:
- Feature B (Day 3-4)
  - Tasks

Pending:
- Feature C (Day 5)
```

Update When:
- Feature complete + library doc written
- Milestone progress changes
- NOT during development (use GitHub Issues)

---

## Scenarios

### Scenario A: Simple (UI bug fix)

Characteristics: Bug fix, style adjustment, typo

Flow:
1. Create issue (optional)
2. Create branch (or direct on main)
3. Fix and commit
4. Create PR

Documentation:
- Work Plan: No
- Library doc: No
- DEVELOPMENT_PLAN.md: No

Example:
```bash
git checkout -b fix/button-alignment
git commit -m "fix(ui): align buttons"
gh pr create --title "fix: button alignment - Fixes #XX"
```

### Scenario B: Standard (Payment system)

Characteristics: New feature, DB changes, external API

Flow:
1. Issue + Milestone
2. Work Plan (`docs/work-plans/feature.md`)
3. Create branch
4. Develop + update Work Plan
5. Library doc (`docs/library/feature.md`)
6. Update DEVELOPMENT_PLAN.md
7. Delete Work Plan
8. Create PR

Documentation:
- Work Plan: Yes (technical decisions)
- Library doc: Yes (required)
- DEVELOPMENT_PLAN.md: Yes (update)

Example:
```bash
gh issue create --title "[Feature] PayPal" --milestone "Phase 1"
# Create Work Plan
git checkout -b feature/paypal-checkout
# Coding...
# Create Library doc
# Update DEVELOPMENT_PLAN.md
git rm docs/work-plans/checkout-improvement.md
gh pr create --title "feat: PayPal - Closes #XX"
```

### Scenario C: Hotfix (Emergency fix)

Characteristics: Production bug, security issue

Flow:
1. Create hotfix branch
2. Minimal fix only
3. Local test (required)
4. Emergency PR (review optional)
5. Merge and deploy immediately
6. Monitor
7. (Later) Update library doc (optional)

Documentation:
- Work Plan: No
- Library doc: Optional (later)
- DEVELOPMENT_PLAN.md: No

Example:
```bash
git checkout main
git pull origin main
git checkout -b hotfix/payment-timeout
# Minimal fix
npm run dev  # Test
gh pr create --title "hotfix: fix timeout - Fixes #XX"
# Quick merge
# Monitor deployment
# (Later) Update docs/library/checkout.md
```

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
- [ ] Create `docs/library/<feature>.md`
  - [ ] Include front-matter
  - [ ] Architecture description
  - [ ] ADR-lite decisions
  - [ ] Implementation points
  - [ ] Related files list
- [ ] Update `DEVELOPMENT_PLAN.md`
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

DEVELOPMENT_PLAN.md            # Progress dashboard
```
