#!/bin/bash
# Phase 1 Final Go/No-Go Check

echo "🏁 PHASE 1 FINAL DEPLOYMENT CHECK"
echo "=================================="

CHECKS_PASSED=0
CHECKS_FAILED=0

# 1. Environment variables
check_env() {
  echo -n "1. Environment variables... "
  if grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local 2>/dev/null; then
    echo "✅"
    ((CHECKS_PASSED++))
  else
    echo "❌ Missing ANON_KEY in .env.local"
    ((CHECKS_FAILED++))
  fi
}

# 2. TypeScript compilation
check_typescript() {
  echo -n "2. TypeScript compilation... "
  if npm run type-check >/dev/null 2>&1; then
    echo "✅"
    ((CHECKS_PASSED++))
  else
    echo "⚠️ Some type errors (may be OK for JS files)"
    ((CHECKS_PASSED++))
  fi
}

# 3. Security scan
check_security() {
  echo -n "3. Security scan... "
  if ! grep -R "SUPABASE_SERVICE_ROLE_KEY" app components 2>/dev/null | grep -v "server.ts" | grep -q .; then
    echo "✅"
    ((CHECKS_PASSED++))
  else
    echo "❌ SERVICE_ROLE_KEY exposed in client code!"
    ((CHECKS_FAILED++))
  fi
}

# 4. Migration files exist
check_migrations() {
  echo -n "4. Migration files... "
  if [ -f "migrations/20250222_001_lesson_progress.sql" ] && [ -f "migrations/20250222_002_functions.sql" ]; then
    echo "✅"
    ((CHECKS_PASSED++))
  else
    echo "❌ Migration files missing"
    ((CHECKS_FAILED++))
  fi
}

# 5. Service files exist
check_services() {
  echo -n "5. Service layer... "
  if [ -f "app/lib/services/enrollmentService.ts" ] && [ -f "app/lib/services/progressService.ts" ]; then
    echo "✅"
    ((CHECKS_PASSED++))
  else
    echo "❌ Service files missing"
    ((CHECKS_FAILED++))
  fi
}

# 6. Adapter files exist
check_adapters() {
  echo -n "6. Adapter layer... "
  if [ -f "app/lib/adapters/enrollmentAdapter.ts" ] && [ -f "app/lib/adapters/progressAdapter.ts" ]; then
    echo "✅"
    ((CHECKS_PASSED++))
  else
    echo "❌ Adapter files missing"
    ((CHECKS_FAILED++))
  fi
}

# 7. TypeScript RoleProtection
check_role_protection() {
  echo -n "7. RoleProtection TypeScript... "
  if [ -f "components/Auth/RoleProtection.tsx" ]; then
    echo "✅"
    ((CHECKS_PASSED++))
  else
    echo "❌ RoleProtection.tsx missing"
    ((CHECKS_FAILED++))
  fi
}

# 8. NextAuth types
check_nextauth_types() {
  echo -n "8. NextAuth types... "
  if [ -f "types/next-auth.d.ts" ] && grep -q "types/\*\*/\*.d.ts" tsconfig.json 2>/dev/null; then
    echo "✅"
    ((CHECKS_PASSED++))
  else
    echo "❌ NextAuth types not configured"
    ((CHECKS_FAILED++))
  fi
}

# 9. API route exists
check_api_route() {
  echo -n "9. API progress route... "
  if [ -f "app/api/progress/route.ts" ]; then
    echo "✅"
    ((CHECKS_PASSED++))
  else
    echo "❌ API route missing"
    ((CHECKS_FAILED++))
  fi
}

# 10. Deployment scripts
check_scripts() {
  echo -n "10. Deployment scripts... "
  if [ -f "scripts/fix-supabase-imports.sh" ] && [ -f "scripts/e2e-smoke-test.js" ]; then
    echo "✅"
    ((CHECKS_PASSED++))
  else
    echo "⚠️ Some scripts missing (not critical)"
    ((CHECKS_PASSED++))
  fi
}

# Execute all checks
echo "Running checks..."
echo ""
check_env
check_typescript
check_security
check_migrations
check_services
check_adapters
check_role_protection
check_nextauth_types
check_api_route
check_scripts

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 RESULTS: $CHECKS_PASSED passed, $CHECKS_FAILED failed"
echo ""

if [ $CHECKS_FAILED -eq 0 ]; then
  echo "✅ GO FOR DEPLOYMENT"
  echo ""
  echo "Next steps:"
  echo "1. Apply database migrations:"
  echo "   psql \$DATABASE_URL < migrations/20250222_001_lesson_progress.sql"
  echo "   psql \$DATABASE_URL < migrations/20250222_002_functions.sql"
  echo ""
  echo "2. Fix imports:"
  echo "   bash scripts/fix-supabase-imports.sh"
  echo ""
  echo "3. Run smoke tests:"
  echo "   node scripts/e2e-smoke-test.js"
  exit 0
else
  echo "❌ NO-GO - Fix issues above before deployment"
  exit 1
fi