# TS Migration Agent Manual

## Purpose
Guide the **practical TypeScript migration** with minimal disruption - migrate only what you're actively working on.

---

## Core Principle: "Touch It, Type It"
**작업하는 파일만 TS로 전환** - 전체 마이그레이션은 비효율적. 기능 개발과 병행하여 점진적 전환.

---

## Practical Migration Strategy

### 1. Immediate Conversion Rules
- **Working on a file?** → Convert to `.ts/.tsx`
- **New feature?** → Always TypeScript
- **Bug fix in JS file?** → Keep JS (unless major changes)
- **Refactoring?** → Perfect time to convert to TS

### 2. Minimal Type-First Approach
```typescript
// Step 1: Function signatures only
function processQuiz(data: any): QuizResult  // Start here

// Step 2: Replace any with specific types
function processQuiz(data: QuizData): QuizResult  // Then refine

// Step 3: Full typing (later)
function processQuiz(data: Readonly<QuizData>): Promise<QuizResult>  // Eventually
```

### 3. Type File Organization
```
types/
├── quiz.ts        # Only types you need NOW for Quiz feature
├── course.ts      # Add when working on Course features
└── common.ts      # Shared types (User, Response, etc.)
```
Don't pre-create types. Add them as needed.

---

## Safety Guidelines
- **Supabase Key Separation** (unchanged)
  - `app/lib/supabase/server.ts` → uses `SERVICE_ROLE_KEY`
  - `app/lib/supabase/client.ts` → uses `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Never import server-only modules in client components
- **Import Boundaries**
  - JS can import from TS (works fine)
  - TS importing JS needs proper typing or `// @ts-ignore`

---

## Safe Migration Process (필수 - NEVER SKIP!)

### ⚠️ NEVER delete the original JS file immediately!

#### The Golden Rule:
**Keep both JS and TS files during migration until fully tested and approved**

#### Step-by-Step Process:
1. **Create new TS/TSX file** alongside the JS file
2. **Keep both files** during testing phase
3. **Update imports** to use the new TS file explicitly
4. **Test thoroughly** - build, features, type-check
5. **Get user approval** before deleting JS file
6. **Delete JS file** only after confirmation

#### Example Directory Structure During Migration:
```
components/
├── QuizAttempts.js     # ✅ KEEP (fallback)
└── QuizAttempts.tsx    # ✅ NEW (testing)
```

#### Import Update Strategies:
```javascript
// Option 1: Explicit extension (recommended during migration)
import QuizAttempts from '@/components/Instructor/QuizAttempts.tsx';

// Option 2: After JS deletion
import QuizAttempts from '@/components/Instructor/QuizAttempts';
```

---

## Quick Migration Checklist

### For Each File You Convert:
- [ ] Copy JS file to TS/TSX (keep original)
- [ ] Add minimal types (props, return types)
- [ ] Fix immediate TS errors (or use `// @ts-ignore` temporarily)
- [ ] Update imports in parent components
- [ ] Run `npm run type-check` - should pass
- [ ] Run `npm run dev` - should work
- [ ] Test all features thoroughly
- [ ] Get approval before deleting JS file
- [ ] Commit with message like: `refactor(quiz): add TypeScript version of QuizAttempts`
- [ ] Delete JS file in separate commit after approval

### Common Quick Fixes:
```typescript
// Missing module types
declare module 'sal.js'  // Add to types/shims.d.ts

// Quick prop typing
interface Props {
  data: any  // Start with any, refine later
}

// Event handlers
onClick: (e: React.MouseEvent) => void
onChange: (value: string) => void
```

---

## Definition of Done (Simplified)
- ✅ File converted to TS
- ✅ No implicit any in NEW code
- ✅ `npm run dev` works
- ✅ Feature still functions correctly

---

## When NOT to Convert
- Hotfix/urgent bugs - fix in JS first
- Third-party integration files that work fine
- Files scheduled for deletion
- Complex legacy code without tests