# Task Automation

## Issue Auto-Close
Keywords in commit message auto-close issues on PR merge:
- `Closes #123` - Close issue
- `Fixes #123` - Bug fix
- `Resolves #123` - General completion

Usage:
```bash
git commit -m "feat: feature name - Closes #10"
git commit -m "fix: bug fix - Closes #12, #13"  # Multiple issues
gh pr create --title "feat: new feature - Closes #15"
```

## Pre-commit Hook
Auto-run on all branches:
- **ESLint**: Code quality check
- **Prettier**: Auto-format
- **lint-staged**: Staged files only

Behavior:
- Blocks commit: ESLint/Prettier errors
- TypeScript errors: Warning only (no block)

## File Structure
```
.husky/pre-commit               # lint-staged runner
scripts/automation/
├── pre-commit-checks.ts        # Quality checks
├── gh-pr-helper.ts             # PR helper
└── lib/git-utils.ts            # Git utilities
.lintstagedrc.json              # lint-staged config
```

## Config Files

`.lintstagedrc.json`:
```json
{
  "*.{js,jsx,ts,tsx}": ["eslint --fix --max-warnings 0", "prettier --write"],
  "*.{json,md,scss,css}": ["prettier --write"]
}
```

npm scripts:
- `prepare`: husky
- `pre-commit`: pre-commit checks
- `automation:test`: test automation
- `pr:create`: create PR
- `pr:merge`: merge PR

## Commands

Manual execution:
```bash
npm run lint              # ESLint check
npm run format            # Prettier format
npm run format:check      # Check only
npm run pr:create         # Create PR
npm run pr:merge          # Merge PR
npm run automation:test   # Test system
```

## Troubleshooting

Hook bypass (emergency only):
```bash
git commit --no-verify -m "emergency: critical fix"
```

Pre-commit fails:
```bash
npm run lint -- --fix     # Auto-fix ESLint
npm run format            # Auto-format Prettier
```

Issue auto-close not working:
- Check keywords: `Closes` / `Fixes` / `Resolves`
- Check format: `#123`
- Verify issue exists
- Confirm PR targets `main` branch

Windows path issues:
```bash
"C:\\Program Files\\GitHub CLI\\gh.exe" pr create
```

## Notes
- Pre-commit runs on all branches
- Blocks commit: ESLint/Prettier errors
- TypeScript errors: Warning only
- Platform: Windows/Mac/Linux
- Windows: Use Git Bash

## Related
- Git workflow: `modules/workflow/git-workflow.md`
- PR template: `.github/pull_request_template.md`
- CI config: `.github/workflows/lint-check.yml`
- PR helper: `scripts/automation/gh-pr-helper.ts`
