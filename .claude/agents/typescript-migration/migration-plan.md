# TypeScript Migration Plan

## Objective
Gradually migrate the project from JavaScript to TypeScript while ensuring:
- No runtime regression
- Stable DTOs and API contracts
- SSR compatibility in Next.js App Router

---

## Migration Strategy

### Phase 0: Foundation (✅ Completed)
- Setup `tsconfig.json` with proper path alias (`@/*`)
- ESLint + Prettier integration with `@typescript-eslint`
- Add `types/shims.d.ts` for missing types

### Phase 1: Critical Path (🚧 In Progress)
Must be migrated first to unlock the rest of the system:
- `app/lib/services/enrollmentService.ts`
- `app/lib/services/progressService.ts`
- `app/(student)/**/actions.ts`
- `app/api/progress/**`
- `components/Auth/RoleProtection.tsx`

### Phase 2: Remaining Server Actions
- All `app/(instructor)/**/actions.js`
- `app/api/**` except progress
- Shared validation logic

### Phase 3: Core UI Components
- Presentational components only
- No business logic

### Phase 4: Non-critical Routes
- All other `app/(...)` routes
- Legacy pages and utilities

---

## Boundary Rules
- JS must not import TS server/domain directly  
  → Use `app/lib/adapters/*` as a compatibility layer
- DTOs and service function signatures are immutable once migrated

---

## Safety Guidelines
- **Supabase Key Separation**
  - `app/lib/supabase/server.ts` → `SERVICE_ROLE_KEY`
  - `app/lib/supabase/client.ts` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Never import server-only modules in client components
- Always verify SSR/dev runtime after each migration step

---

## Definition of Done (DoD)
- `npm run type-check` passes
- `npm run lint` passes with no warnings
- E2E smoke tests succeed:
  1. Login → Course detail
  2. Enrollment → Student dashboard
  3. Lesson progress → Update reflected
- SSR routes render correctly

---

## Rollback Procedure
If migration breaks production:
1. Revert the latest migration commit
2. Verify DTOs and action signatures are unchanged
3. Re-run type check + smoke tests
4. Resume migration with smaller scoped PRs

---

## Current Status
- Foundation complete
- Enrollment & Progress migration started
- RoleProtection guard queued
- Target: Complete Phase 1 before moving to instructor actions