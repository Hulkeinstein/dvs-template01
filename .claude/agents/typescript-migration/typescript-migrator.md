# TypeScript Incremental Migration Guide (Operational Standard)

## Core Principles
1. All new files must be `.ts/.tsx`.
2. Legacy JS files should only be migrated when modified for new features.
3. **Boundary Rule:** JS must never directly import from TS domain/server layers (`app/lib/services/**`, `types/**`). Use adapters under `app/lib/adapters/*` instead.
4. DTOs and server action signatures must remain stable once published.

## Critical Path Exceptions (Top-down)
Default strategy is Bottom-up, but the following must be migrated to TS immediately:
- Enrollment service/actions (`app/lib/actions/enrollmentActions.js`)
- Lesson progress service/actions (`app/lib/actions/lessonActions.js`)
- Role/Access guards (`components/Auth/RoleProtection.js`)

## Definition of Done (DoD) and Quality Gates
- `npm run type-check` passes
- `npm run lint` passes (`@typescript-eslint/no-explicit-any: error`)
- E2E smoke tests pass:
  1) Login → Course detail
  2) Enrollment → Student dashboard
  3) Lesson access → Progress upsert
- Runtime sanity check on dev server and SSR routes

## Recommended tsconfig (complete)
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    },
    "typeRoots": ["./types", "./node_modules/@types"]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules", "data/demo-*/**/*"]
}
```

## ESLint Core Rules
```javascript
module.exports = {
  extends: ["next/core-web-vitals", "plugin:@typescript-eslint/recommended"],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "import"],
  rules: {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/consistent-type-imports": "error",
    "import/no-cycle": "error",
    "no-restricted-imports": ["error", {
      "patterns": [
        { 
          "group": ["app/lib/services/**", "types/**"], 
          "importTypes": ["value"],
          "message": "JS cannot import server/domain directly. Use legacy adapters." 
        }
      ]
    }]
  }
};
```

## Adapter Pattern

Legacy JS calling TS services must go through a thin adapter inside `app/lib/adapters/*`, passing only values, not types.

### Example Adapter
```typescript
// app/lib/adapters/enrollment.adapter.ts
'use server';

import { EnrollmentService } from '../services/enrollment.service';
import type { EnrollmentData } from '@/types';

// Adapter for legacy JS to call TS service
export async function enrollStudent(courseId: string, userId: string) {
  const service = new EnrollmentService();
  const result = await service.enroll({ courseId, userId });
  
  // Return plain object, not typed
  return {
    success: result.success,
    data: result.data ? { ...result.data } : null,
    error: result.error || null
  };
}
```

## Rollback Checklist (if issues arise)

1. **Revert the latest TS migration commit**
   ```bash
   git revert HEAD
   git push
   ```

2. **Verify DTO/action signatures have not changed**
   - Check that server action parameters and return types remain consistent
   - Ensure no breaking changes in API contracts

3. **Check for common issues:**
   - Missing `types/shims.d.ts` declarations
   - Path alias resolution errors (`@/*`)
   - Server/client module mixups
   - `'use server'` / `'use client'` directive issues

## Migration Phases

### Phase 0: Environment Setup ✅
- TypeScript packages installed
- tsconfig.json configured
- ESLint rules updated
- types/shims.d.ts created

### Phase 1: Foundation Layer + Critical Path
**Priority files to migrate:**
1. `app/lib/supabase/client.ts` (already done)
2. `app/lib/repositories/*.ts` (already done)
3. `app/lib/actions/enrollmentActions.js` → `.ts`
4. `app/lib/actions/lessonActions.js` → `.ts`
5. `components/Auth/RoleProtection.js` → `.tsx`

### Phase 2: Server Actions
Convert remaining server actions in `app/lib/actions/*.js`:
- `courseActions.js`
- `quizActions.js`
- `userActions.js`
- `dashboardActions.js`
- etc.

### Phase 3: Core Components
Migrate critical UI components:
- Student dashboard components
- Instructor dashboard components
- Course enrollment flow
- Lesson viewer

### Phase 4: App Routes
Convert page routes to TypeScript:
- `app/(dashboard)/**/*.jsx`
- `app/(courses)/**/*.jsx`
- `app/api/**/*.js`

## Safety Guidelines

### Supabase Key Separation
- **Server-only** (`app/lib/supabase/server.ts`):
  ```typescript
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Server only!
  );
  ```

- **Client-side** (`app/lib/supabase/client.ts`):
  ```typescript
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // Public safe
  );
  ```

### Import Rules
- Server-only modules must never be imported from client components
- Use `'use server'` directive for server actions
- Use `'use client'` directive for interactive components

## Monitoring & Metrics

Track migration progress:
- Total JS/JSX files: 793
- Target for migration: 200 (core files)
- Current progress: Check `.claude/agents/typescript-migration/progress.json`

## Notes

- This guide prioritizes **incremental migration** over big-bang conversion
- Focus on **critical path** (enrollment, progress, auth) first
- Maintain **backward compatibility** at all times
- Use **adapters** for JS→TS boundaries
- Keep **types/shims.d.ts** for temporary type declarations