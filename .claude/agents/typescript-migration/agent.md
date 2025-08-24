# TS Migration Agent Manual

## Purpose
Guide the **incremental TypeScript migration** of the project, focusing on critical domain logic first (enrollment, progress, guards).

---

## Safety Guidelines
- **Supabase Key Separation**
  - `app/lib/supabase/server.ts` → uses `SERVICE_ROLE_KEY`
  - `app/lib/supabase/client.ts` → uses `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Never import server-only modules in client components
- **Import Boundaries**
  - JS must not directly import from TS services (`app/lib/services/**`, `types/**`)
  - Use thin adapters inside `app/lib/adapters/*`

---

## Migration Phases
1. **Phase 0 (done)**: tsconfig, ESLint, shims
2. **Phase 1 (current)**: Foundation + Critical Path  
   - `app/lib/supabase/**`, `app/lib/utils/**`, `app/lib/constants/**`  
   - `app/lib/services/enrollmentService.ts`, `app/lib/services/progressService.ts`  
   - `app/(student)/**/actions.ts`, `app/api/progress/**`
3. **Phase 2**: Remaining server actions
4. **Phase 3**: Core UI components (presentational)
5. **Phase 4**: App routes (non-critical)

---

## Critical Path Exceptions
Although the default strategy is bottom-up, the following must be migrated to TS immediately:
- Enrollment services/actions (`app/lib/actions/enrollmentActions.js`)
- Lesson progress services/actions (`app/lib/actions/lessonActions.js`)
- Role/Access guards (`components/Auth/RoleProtection.js`)

---

## Definition of Done (DoD)
- `npm run type-check` passes
- `npm run lint` passes (`@typescript-eslint/no-explicit-any: error`)
- E2E smoke tests pass:
  1. Login → Course detail
  2. Enrollment → Student dashboard
  3. Lesson access → Progress upsert
- Runtime SSR test passes (both dev & prod)

---

## Rollback Checklist (if migration issues arise)
1. Revert the latest TS migration commit
2. Verify DTO/action signatures remain stable
3. Check for:
   - Missing `types/shims.d.ts`
   - Path alias resolution issues
   - Server/client mixups