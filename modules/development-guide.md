# Development Guide

## Essential Commands

```bash
# Development
npm run dev          # Start dev server (port 3000 only)
npm run build        # Production build
npm run start        # Production server

# Code Quality (pre-commit)
npm run lint         # ESLint check
npm run format       # Prettier format
npm run format:check # Check only
npm run typecheck    # TypeScript check

# Automation
npm run pr:create         # Create PR
npm run pr:merge          # Merge PR
npm run automation:test   # Test automation system
```

## Automation

### Issue Auto-Close
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

### Pre-commit Hook
Auto-run on all branches:
- **ESLint**: Code quality check
- **Prettier**: Auto-format
- **lint-staged**: Staged files only

Behavior:
- Blocks commit: ESLint/Prettier errors
- TypeScript errors: Warning only (no block)

### File Structure
```
.husky/pre-commit               # lint-staged runner
scripts/automation/
├── pre-commit-checks.ts        # Quality checks
├── gh-pr-helper.ts             # PR helper
└── lib/git-utils.ts            # Git utilities
.lintstagedrc.json              # lint-staged config
```

### Config Files

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

### Troubleshooting

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

Notes:
- Pre-commit runs on all branches
- Blocks commit: ESLint/Prettier errors
- TypeScript errors: Warning only
- Platform: Windows/Mac/Linux
- Windows: Use Git Bash

## Server Rules
- Port 3000 fixed for dev server
- **AI agents NEVER start/restart servers** (human only)
- Port conflict: Kill existing process, use 3000

## Track Selection
Choose before starting work:

**Lite** (<1h): Text/style fixes, typos
- Process: Code → `lint && format` → commit

**Standard** (1-4h): Components, API, features
- Process: DoR → code → test → `typecheck && lint && build` → PR

**Risky** (4h+): Auth, payments, DB migrations, security
- Process: Standard + POC + feature flags + rollback plan
- Security checklist required

Upgrade to Standard if:
- Routing/SEO/i18n impact
- External API/payments/auth
- DB schema changes
- Security/performance risk

## DoR/DoD Templates

**DoR** (Definition of Ready):
```
Story: <what/why>
Acceptance: 3-5 criteria
Impact: <folders/modules>
Risk: <1 edge case>
Test: 2-3 scenarios
```

**DoD** (Definition of Done):
- [ ] `typecheck && lint && build` pass
- [ ] Keyboard/screen reader accessible
- [ ] No console errors
- [ ] Mobile/desktop responsive
- [ ] PR description + screenshots
- [ ] Rollback plan

## PR Template
```markdown
## Summary
<1-2 lines>

## Changes
- [ ] Feature/Fix/Refactor/Docs

## Testing
- [ ] Local tests passed
- [ ] Build succeeded
- [ ] Key scenarios tested

## Related
Closes #<issue>
```

## Database Migrations
Supabase SQL Editor execution order:
1. `create_courses_tables.sql`
2. `20250124_create_enrollment_tables.sql`
3. `20250124_create_storage_bucket.sql`
4. `20250207_add_course_topics.sql`
5. `20250207_create_quiz_tables.sql`

## File Paths

Common locations:
- Server Actions: `/app/lib/actions/`
- SCSS: `/public/scss/` (never edit compiled CSS)
- Global styles: `/app/globals.css` (Tailwind entry)
- Components: `/components/`
- Dashboards: `/app/(dashboard)/`
- Test data: `/constants/sampleQuizData.js`

## Table Alignment System
- SCSS: `/public/scss/template/_instructor-dashboard.scss`
- Class: `.rbt-table.table-header-align`
- Alignment: `text-start` / `text-end` / `text-center`

## DISCOVER Process (Codebase Search)

**D** - Detect: Identify feature need
**I** - Investigate: Search existing code
```bash
rg -n "upload|attachment|storage" --glob "*.{js,ts,tsx}"
```
**S** - Study: Analyze existing patterns
**C** - Compare: Evaluate similarity (80%+ reuse, 50-80% extend, <50% new)

## RED FLAGS (Stop Signals)
- Creating similar file names
- Copy-paste temptation
- "Build now, refactor later" thinking
- Creating files without searching first

Action: STOP → search → reuse/extend decision

## 3-3-3 Rule
- **3 seconds**: "New file?" → Stop → "Exists?"
- **3 minutes**: `rg` search for similar patterns
- **30 minutes**: Re-evaluate if truly needed

## TypeScript Migration
"Touch It, Type It" - Only migrate files you're working on

Rules:
- New features: Always `.ts/.tsx`
- Editing existing: Convert to TS (no exceptions)
- Refactoring: Best time to convert

Next.js files:
- Pages/routes (`page.tsx`): Delete `.js` immediately
- Components: Can coexist but prefer single `.tsx`
- Import without extension or specify `.tsx`

Conversion order:
1. Create `.ts/.tsx` → 2. Update imports → 3. `typecheck && build` → 4. Test → 5. Delete `.js` → 6. Commit

Any type:
- Temporary allowed during migration
- Tag: `TODO(ANY-TODO)`
- New code: Use `unknown` / generics

Quick fixes:
```typescript
declare module 'some-lib'  // No types available
interface Props { data?: any }  // TODO(ANY-TODO): define later
```

Supabase clients:
- Server: `app/lib/supabase/server.ts`
- Client: `app/lib/supabase/client.ts`

## Work Checkpoints
- **Courses**: Base64, 5MB limit, images only, auto `instructor_id`
- **Lessons**: DnD → update `order_index`, delete → reorder
- **Quizzes**: Zod v3.25.76, Quill video placeholder, 9 types

## Environment Variables
Required:
```env
NEXTAUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_CERTIFICATE_ENABLED=false
```

## Common Server Actions
**Courses**: `createCourse`, `updateCourse`, `getCourseById`
**Lessons**: `createLesson`, `updateLesson`, `deleteLesson`, `reorderLessons`
**Quizzes**: `createQuizLesson`, `updateQuizLesson`, `getQuizByLessonId`

## SCSS Guidelines
- Use logical properties: `padding-block` / `padding-inline` (RTL/responsive safe)
- Never edit compiled CSS (`/public/css/`)
- Edit SCSS sources only (`/public/scss/`)

## Testing Guidelines

When writing tests for this project:

**Priorities**:
1. Error handling - Required fields, type validation
2. Money logic - Pricing, tax, rounding (use decimal.js)
3. Edge cases - null, empty strings, special characters
4. Runtime validation - Zod schemas at function entry

**Structure**:
- Co-locate: `components/__tests__/ComponentName.test.tsx`
- Use: Jest + React Testing Library
- Avoid: Snapshot tests (use explicit assertions)
- Focus: Critical paths over coverage numbers

Full strategy: docs/testing/strategy.md
