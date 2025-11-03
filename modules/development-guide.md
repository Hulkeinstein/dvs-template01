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

## Commit Messages
Use Conventional Commits: `<type>(<scope>): <description>`

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`
Link issues: Add `Closes #123` in message

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

Config: `.lintstagedrc.json` (ESLint + Prettier on staged files)
Scripts: `pr:create`, `pr:merge`, `automation:test`

Troubleshooting:
- Hook bypass (emergency): `git commit --no-verify`
- Pre-commit fails: `npm run lint -- --fix && npm run format`
- Auto-close not working: Check keywords (`Closes #123`), verify issue exists, PR targets `main`

## Server Rules
- Port 3000 fixed for dev server
- **AI agents NEVER start/restart servers** (human only)
- Port conflict: Kill existing process, use 3000

## Track Selection
**Decision tree**: Text/typo → Lite | Component/API → Standard | Auth/Payment/DB → Risky
- **Lite** (<1h): `lint && format` → commit
- **Standard** (1-4h): DoR → code → test → `typecheck && lint && build` → PR
- **Risky** (4h+): Standard + POC + feature flags + rollback + security checklist

## DoR/DoD
**DoR**: Story, Acceptance (3-5), Impact, Risk (1 edge case), Test (2-3)
**DoD**: `typecheck && lint && build` pass, accessible, no errors, responsive, PR description, rollback plan

## File Paths
- Server Actions: `/app/lib/actions/`
- Components: `/components/`
- SCSS: `/public/scss/` (never edit `/public/css/`)
- Migrations: `/supabase/migrations/`

## 문서 작성 규칙

### 파일명 (docs/ 폴더)
- **신규 문서**: kebab-case.md 필수
  - 예: `payment-integration.md`, `deployment-guide.md`
  - 금지: PascalCase, camelCase, snake_case, 공백
- **기존 문서**: "Touch It, Type It" 전략
  - 수정할 때 kebab-case로 리네임
  - Git history 보존: `git mv OLD.md new.md`
  - aliases 필드에 이전 이름 추가
- **예외**: README.md, LICENSE, CHANGELOG.md (관례)
- **코드 파일**: 프로젝트 컨벤션 우선 (PascalCase.tsx, camelCase.ts)

### Front-matter (필수)
모든 문서에 YAML front-matter 추가:
```yaml
---
title: "문서 제목"                    # 필수
tags:                                # 필수 (네임스페이스: phase/, type/, component/, external/, status/)
  - phase/1
  - type/docs
  - component/auth
created: 2025-11-03                  # 필수
updated: 2025-11-03                  # 필수
status: active                       # 필수 (active|deprecated|draft)
aliases: []                          # 선택 (파일명 변경 시)
---
```

### 태그 규칙
- **네임스페이스 필수**: phase/, type/, component/, external/, status/
- **각 카테고리 1개 태그만** (예외: external/* 다중 허용)
- **정의된 태그만 사용** (docs/README.md의 태그 카탈로그 참고)
- 새 태그 추가는 docs/README.md 업데이트 필요

### 파일명 변경 시
```bash
# 1. Git으로 리네임 (히스토리 보존)
git mv docs/OLD_NAME.md docs/new-name.md

# 2. Front-matter에 aliases 추가
aliases: [OLD_NAME, old-name]

# 3. 참조 링크 검색 및 업데이트
rg "OLD_NAME" docs/
```

### 링크
- 상대 경로만 사용: `[text](../path/file.md)`
- 절대 경로 금지: `[text](/docs/file.md)`
- 파일명 변경 후 `npm run build`로 검증

## Code Reuse (DISCOVER)
Before creating files: Search → Reuse (80%+) / Extend (50-80%) / New (<50%)
```bash
rg -n "keyword|pattern" --glob "*.{js,ts,tsx}"
```
**3-3-3**: 3 sec (stop), 3 min (search), 30 min (re-evaluate)

## TypeScript Migration
"Touch It, Type It" - New → `.ts/.tsx` | Editing → Convert (no exceptions) | Refactor → Best time
Order: Create `.ts/.tsx` → Update imports → `typecheck && build` → Test → Delete `.js` → Commit
`any`: Tag `TODO(ANY-TODO)` (temporary), use `unknown`/generics in new code

## Checkpoints
- Courses: Base64 (5MB), auto `instructor_id`
- Lessons: DnD reorder, delete cascade
- Quizzes: Zod v3.25.76, 9 types

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
