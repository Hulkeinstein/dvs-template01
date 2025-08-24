#!/bin/bash
set -euo pipefail

# Detect GNU/BSD sed
if sed --version >/dev/null 2>&1; then 
  SED_INPLACE=(-i.bak)
else 
  SED_INPLACE=(-i '')
fi

echo "🔧 Starting Supabase import migration..."
echo "========================================"

echo "1) Finding server-side files..."
SERVER_FILES=$(find app/lib/actions app/api -type f \( -name '*.js' -o -name '*.jsx' -o -name '*.ts' -o -name '*.tsx' \) 2>/dev/null | while read file; do
  if ! grep -q '"use client"' "$file" 2>/dev/null; then
    echo "$file"
  fi
done)

if [ -n "$SERVER_FILES" ]; then
  echo "   Found $(echo "$SERVER_FILES" | wc -l) server files"
  echo "$SERVER_FILES" | while read file; do
    if [ -f "$file" ]; then
      # Replace client imports with server
      sed "${SED_INPLACE[@]}" \
        -e "s|from '@/app/lib/supabase/client'|from '@/app/lib/supabase/server'|g" \
        -e "s|from \"@/app/lib/supabase/client\"|from \"@/app/lib/supabase/server\"|g" \
        "$file"
      
      # Fix import statement to use supabaseServer as supabase
      sed "${SED_INPLACE[@]}" \
        "s|import { supabase }|import { supabaseServer as supabase }|g" \
        "$file"
      
      # Fix authOptions import path (auth.config.js not route)
      sed "${SED_INPLACE[@]}" \
        "s|from '@/app/api/auth/\[...nextauth\]/route'|from '@/app/api/auth/[...nextauth]/auth.config'|g" \
        "$file"
    fi
  done
  echo "   ✅ Server files updated"
else
  echo "   No server files found to update"
fi

echo "2) Checking client files for accidental server imports..."
CLIENT_FILES=$(find app components -type f \( -name '*.js' -o -name '*.jsx' -o -name '*.ts' -o -name '*.tsx' \) 2>/dev/null | while read file; do
  if grep -q '"use client"' "$file" 2>/dev/null; then
    echo "$file"
  fi
done)

if [ -n "$CLIENT_FILES" ]; then
  echo "$CLIENT_FILES" | while read file; do
    if [ -f "$file" ] && grep -q "@/app/lib/supabase/server" "$file" 2>/dev/null; then
      sed "${SED_INPLACE[@]}" \
        -e "s|from '@/app/lib/supabase/server'|from '@/app/lib/supabase/client'|g" \
        -e "s|from \"@/app/lib/supabase/server\"|from \"@/app/lib/supabase/client\"|g" \
        "$file"
      echo "   Fixed client file: $file"
    fi
  done
  echo "   ✅ Client files checked"
else
  echo "   No client files to check"
fi

echo "3) Cleaning up backup files..."
find app scripts -name "*.bak" -delete 2>/dev/null || true
echo "   ✅ Cleanup complete"

echo ""
echo "✅ Migration complete!"