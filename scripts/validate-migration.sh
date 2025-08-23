#!/bin/bash
set -euo pipefail

echo "🔍 Migration Validation Report"
echo "=============================="
echo ""

echo "== Env keys presence =="
ENV_COUNT=$(grep -E "NEXT_PUBLIC_SUPABASE_URL|NEXT_PUBLIC_SUPABASE_ANON_KEY|SUPABASE_SERVICE_ROLE_KEY" .env.local 2>/dev/null | wc -l)
echo "Found $ENV_COUNT/3 required keys"
echo ""

echo "== Server-side bad imports (should be none) =="
BAD_IMPORTS=$(grep -R "from '@/app/lib/supabase/client'" app/lib/actions app/api 2>/dev/null || true)
if [ -z "$BAD_IMPORTS" ]; then
  echo "✅ OK: no client imports in server"
else
  echo "❌ ERROR: Found client imports in server files:"
  echo "$BAD_IMPORTS"
fi
echo ""

echo "== Client files importing server (should be none) =="
CLIENT_SERVER_IMPORTS=""
for file in $(find app components -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" \) 2>/dev/null); do
  if grep -q '"use client"' "$file" 2>/dev/null && grep -q "@/app/lib/supabase/server" "$file" 2>/dev/null; then
    CLIENT_SERVER_IMPORTS="${CLIENT_SERVER_IMPORTS}$(grep -n "@/app/lib/supabase/server" "$file" | sed "s/^/$file:/")\n"
  fi
done

if [ -z "$CLIENT_SERVER_IMPORTS" ]; then
  echo "✅ OK: client files clean"
else
  echo "❌ ERROR: Client files importing server:"
  echo -e "$CLIENT_SERVER_IMPORTS"
fi
echo ""

echo "== authOptions export =="
if grep -q "export const authOptions" app/api/auth/\[...nextauth\]/auth.config.js 2>/dev/null; then
  echo "✅ OK: authOptions exported from auth.config.js"
elif grep -q "export const authOptions" app/api/auth/\[...nextauth\]/route.js 2>/dev/null; then
  echo "✅ OK: authOptions exported from route.js"
else
  echo "❌ WARN: authOptions not found"
fi
echo ""

echo "== next-auth types included in tsconfig =="
if grep -q "types/\*\*/\*.d.ts" tsconfig.json 2>/dev/null; then
  echo "✅ OK: ts types included"
else
  echo "⚠️  WARN: add types/**/*.d.ts to tsconfig include"
fi
echo ""

echo "== Summary =="
echo "Server files checked: $(find app/lib/actions app/api -type f \( -name '*.js' -o -name '*.ts' \) 2>/dev/null | wc -l)"
echo "Client files checked: $(find app components -type f \( -name '*.js' -o -name '*.jsx' -o -name '*.ts' -o -name '*.tsx' \) 2>/dev/null | grep -c '"use client"' || echo "0")"