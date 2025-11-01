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

### Commit Messages
Use Conventional Commits: `<type>(<scope>): <description>`

Types:
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `refactor` - Code restructure
- `test` - Tests
- `chore` - Maintenance

Link to issues: Add `Closes #123` in message

Example:
```bash
git commit -m "feat(auth): add Google OAuth - Closes #10"
git commit -m "fix(cart): resolve checkout bug - Fixes #11"
```

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

### CI Checks
Required passes:
- `npm run type-check`
- `npm run lint`
- `npm run build`
- `npm test` (if exists)

Trigger: PR to main, push to main

### Troubleshooting
CI fails: `npm run lint` → `npm run format` → retry
Branch conflict: Merge main → resolve → commit

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
6. Delete Work Plan
7. Create PR

Documentation:
- Work Plan: Yes (technical decisions)
- Library doc: Yes (required)

Example:
```bash
gh issue create --title "[Feature] PayPal" --milestone "Phase 1"
# Create Work Plan
git checkout -b feature/paypal-checkout
# Coding...
# Create Library doc
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
- [ ] Create `docs/library/<feature>.md`
  - [ ] Include front-matter
  - [ ] Architecture description
  - [ ] ADR-lite decisions
  - [ ] Implementation points
  - [ ] Related files list
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
