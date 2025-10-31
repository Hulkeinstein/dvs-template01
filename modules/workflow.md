# Workflow System

## Core Workflow Components

### Project Workflow (Hybrid System)
- @./workflow/hybrid-system.md

Issue → Work Plan → Library lifecycle, front-matter rules, DEVELOPMENT_PLAN.md management

### Git Workflow
- @./workflow/git-workflow.md

Branch naming, Conventional Commits, TypeScript migration commits, Issue linking, Milestones

### Task Automation
- @./workflow/task-automation.md

Issue auto-close, pre-commit hooks (ESLint, Prettier), PR templates

### Development Guide
- @./workflow/development-guide.md

Essential commands, track selection (Lite/Standard/Risky), TypeScript migration, DISCOVER process

---

## Quick Reference

### Start Feature
1. Create issue + milestone
2. Create branch: `git checkout -b feature/name`
3. (Complex only) Create Work Plan
4. Develop

Details: @./workflow/hybrid-system.md

### Hotfix
1. Create branch: `git checkout -b hotfix/issue`
2. Minimal fix + test
3. Emergency PR
4. Deploy + monitor

Details: @./workflow/hybrid-system.md (Scenario C)

### Git Commands
Branch/commit/PR: @./workflow/git-workflow.md
