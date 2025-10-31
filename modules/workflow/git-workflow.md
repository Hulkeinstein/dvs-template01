# Git Workflow (GitHub Flow)

## Branch Strategy
- `main` branch: Always deployable
- Feature branches: Branch from main, merge back
- No `develop` branch
- Short-lived branches (1-3 days max)

## Branch Naming
- `feature/<name>` - New features
- `fix/<name>` - Bug fixes
- `hotfix/<name>` - Production emergencies
- `chore/<name>` - Maintenance
- `docs/<name>` - Documentation
- `refactor/<name>` - Code restructure
Never: `my-branch`, `test`, `temp`

## Claude Code Rules
- Always create new branch before work (never on main)
- After PR merge → prompt user for new branch before next task
- Commit/PR only after user approval
- Use TodoWrite for task tracking

## Commit Messages
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

## TypeScript Migration Commits
Never delete .js and add .ts in same commit

Protocol:
1. Add `.tsx` (keep `.js`): `git commit -m "refactor(ts): add TS version"`
2. Update imports: `git commit -m "refactor(ts): update imports"`
3. Test: `npm run type-check && npm run dev`
4. Get user approval
5. Delete `.js`: `git commit -m "refactor(ts): remove JS after verification"`

## Milestones
Current phases:
- **Phase 1: Core Platform** (2025-08-31) - Student/Teacher core
- **Phase 2: Admin System** (2025-09-15) - PreSkool integration
- **Phase 3: Enhancement** (Open) - Performance, AI

Create issue with milestone:
```bash
gh issue create --title "[Feature] Name" --milestone "Phase 1: Core Platform"
gh issue list --milestone "Phase 1: Core Platform"
```

## Hotfix Process
1. Branch: `git checkout -b hotfix/<issue>-<desc>`
2. Fix + test locally
3. Commit: `hotfix: <description> - Fixes #<issue>`
4. PR → fast merge (review optional, PR required)
5. Deploy immediately
6. Monitor

## PR Merge Cleanup
```bash
# GitHub: Delete branch button
# Local:
git checkout main
git pull origin main
git remote prune origin
git branch -d feature/branch-name
```

## Branch Protection (GitHub Settings)
- Require PR before merge: ON
- Required checks: type-check, lint, build
- Squash merge only
- Auto-delete branches: ON
- Force-push: OFF

## CI Checks
Required passes:
- `npm run type-check`
- `npm run lint`
- `npm run build`
- `npm test` (if exists)

Trigger: PR to main, push to main

## Troubleshooting
CI fails: `npm run lint` → `npm run format` → retry
Branch conflict: Merge main → resolve → commit

## Automation Commands
```bash
npm run git:setup              # Setup hooks
npm run quality:check          # Run quality checks
npm run security:scan          # Security scan
npm run pr:create              # Create PR
npm run pr:merge               # Merge PR
```

## Security (Never Commit)
- API keys, tokens, passwords
- `.env` files (`.env.example` OK)
- PII, credentials, SSH keys

## Git Workflow Config
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

## Quick Branch Decisions
No branch needed:
- Doc edits (README, CLAUDE.md)
- Typo fixes
- Comment additions

Branch required:
- Code logic changes
- New features
- Bug fixes
- Schema changes

## Related
- Automation: `modules/workflow/task-automation.md`
- PR template: `.github/pull_request_template.md`
- CI config: `.github/workflows/lint-check.yml`
