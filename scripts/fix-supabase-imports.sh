#!/bin/bash

# Detect OS for sed compatibility
detect_sed_inplace() {
  if sed --version >/dev/null 2>&1; then
    # GNU sed (Linux)
    SED_INPLACE="-i.bak"
  else
    # BSD sed (macOS)
    SED_INPLACE="-i ''"
  fi
}

detect_sed_inplace

echo "🔧 Fixing Supabase imports (OS: $(uname))..."

# 1. Server-side files (no "use client")
echo "  → Updating server files to use server.ts..."
for file in $(grep -L "\"use client\"" $(find app -name "*.js" -o -name "*.ts" 2>/dev/null) | grep -E "(actions|repositories|services)"); do
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s|@/app/lib/supabase/client|@/app/lib/supabase/server|g" "$file"
  else
    sed -i.bak "s|@/app/lib/supabase/client|@/app/lib/supabase/server|g" "$file"
  fi
done

# 2. Client-side files (with "use client")
echo "  → Ensuring client files use client.ts..."
for file in $(grep -l "\"use client\"" $(find app components -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" 2>/dev/null)); do
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s|@/app/lib/supabase/server|@/app/lib/supabase/client|g" "$file"
  else
    sed -i.bak "s|@/app/lib/supabase/server|@/app/lib/supabase/client|g" "$file"
  fi
done

# 3. Update action imports to adapters
echo "  → Migrating action imports to adapters..."
for file in $(find app -name "*.js" -o -name "*.jsx"); do
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' \
      -e "s|from '@/app/lib/actions/enrollmentActions'|from '@/app/lib/adapters/enrollmentAdapter'|g" \
      -e "s|from '@/app/lib/actions/lessonActions'|from '@/app/lib/adapters/progressAdapter'|g" \
      "$file"
  else
    sed -i.bak \
      -e "s|from '@/app/lib/actions/enrollmentActions'|from '@/app/lib/adapters/enrollmentAdapter'|g" \
      -e "s|from '@/app/lib/actions/lessonActions'|from '@/app/lib/adapters/progressAdapter'|g" \
      "$file"
  fi
done

# 4. Clean up backup files
find . -name "*.bak" -delete 2>/dev/null

echo "✅ Import fixes complete!"