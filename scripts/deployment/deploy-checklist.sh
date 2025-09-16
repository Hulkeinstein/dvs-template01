#!/usr/bin/env bash
# Production Deployment Checklist Script
# Run this before deploying to production to ensure everything is ready

set -euo pipefail

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counter for issues
ISSUES=0

# Function to check required environment variable
check_env() {
    local key="$1"
    local description="${2:-}"
    
    if [[ -z "${!key:-}" ]]; then
        echo -e "${RED}✗ Missing:${NC} $key${description:+ - $description}"
        ((ISSUES++))
    else
        # Mask sensitive values in output
        local value="${!key}"
        if [[ "$key" == *"SECRET"* ]] || [[ "$key" == *"KEY"* ]] || [[ "$key" == *"PASSWORD"* ]]; then
            value="***${value: -4}"
        fi
        echo -e "${GREEN}✓${NC} $key: $value"
    fi
}

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Production Deployment Checklist${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# ===========================================
# 1. ENVIRONMENT VARIABLES CHECK
# ===========================================
echo -e "${YELLOW}[1/6] Checking Required Environment Variables...${NC}"

# Core Settings
echo -e "\n${BLUE}Core Settings:${NC}"
check_env "NODE_ENV" "Should be 'production'"
check_env "NEXTAUTH_URL" "Production URL with https://"
check_env "NEXTAUTH_SECRET" "64+ character secret"

# Supabase
echo -e "\n${BLUE}Supabase Configuration:${NC}"
check_env "NEXT_PUBLIC_SUPABASE_URL" "Production Supabase URL"
check_env "NEXT_PUBLIC_SUPABASE_ANON_KEY" "Anon/Public key"
check_env "SUPABASE_SERVICE_ROLE_KEY" "Service role key (server-only)"

# Email Service
echo -e "\n${BLUE}Email Service (Resend):${NC}"
check_env "RESEND_API_KEY" "Production API key"
check_env "EMAIL_FROM" "Verified sender address"

# Google OAuth
echo -e "\n${BLUE}Google OAuth:${NC}"
check_env "GOOGLE_CLIENT_ID" "Production OAuth client ID"
check_env "GOOGLE_CLIENT_SECRET" "Production OAuth secret"

# ===========================================
# 2. CODE QUALITY CHECK
# ===========================================
echo -e "\n${YELLOW}[2/6] Running Code Quality Checks...${NC}"

# TypeScript check
echo -e "\n${BLUE}TypeScript Check:${NC}"
if npm run type-check > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} No TypeScript errors"
else
    echo -e "${RED}✗${NC} TypeScript errors found"
    ((ISSUES++))
fi

# ESLint check
echo -e "\n${BLUE}ESLint Check:${NC}"
if npm run lint > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} No linting errors"
else
    echo -e "${RED}✗${NC} Linting errors found"
    ((ISSUES++))
fi

# ===========================================
# 3. BUILD TEST
# ===========================================
echo -e "\n${YELLOW}[3/6] Testing Production Build...${NC}"

echo -e "${BLUE}Running build...${NC}"
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Build successful"
else
    echo -e "${RED}✗${NC} Build failed"
    ((ISSUES++))
fi

# ===========================================
# 4. SECURITY AUDIT
# ===========================================
echo -e "\n${YELLOW}[4/6] Security Audit...${NC}"

echo -e "${BLUE}Checking npm vulnerabilities:${NC}"
audit_output=$(npm audit 2>&1 || true)
if echo "$audit_output" | grep -q "found 0 vulnerabilities"; then
    echo -e "${GREEN}✓${NC} No known vulnerabilities"
else
    vuln_count=$(echo "$audit_output" | grep -oE "[0-9]+ vulnerabilities" | head -1 || echo "Some vulnerabilities")
    echo -e "${YELLOW}⚠${NC} $vuln_count found (run 'npm audit' for details)"
fi

# ===========================================
# 5. CONFIGURATION CHECK
# ===========================================
echo -e "\n${YELLOW}[5/6] Configuration Verification...${NC}"

# Check if next.config.mjs exists and has security headers
echo -e "\n${BLUE}Security Headers:${NC}"
if [ -f "next.config.mjs" ]; then
    if grep -q "Content-Security-Policy" next.config.mjs; then
        echo -e "${GREEN}✓${NC} CSP header configured"
    else
        echo -e "${YELLOW}⚠${NC} CSP header not found in next.config.mjs"
    fi
    
    if grep -q "X-Frame-Options" next.config.mjs; then
        echo -e "${GREEN}✓${NC} X-Frame-Options configured"
    else
        echo -e "${YELLOW}⚠${NC} X-Frame-Options not found"
    fi
    
    if grep -q "Strict-Transport-Security" next.config.mjs || grep -q "HSTS" next.config.mjs; then
        echo -e "${GREEN}✓${NC} HSTS configured"
    else
        echo -e "${YELLOW}⚠${NC} HSTS not configured (add for production)"
    fi
else
    echo -e "${RED}✗${NC} next.config.mjs not found"
    ((ISSUES++))
fi

# Check production mode
echo -e "\n${BLUE}Production Mode:${NC}"
if [[ "${NODE_ENV:-}" == "production" ]]; then
    echo -e "${GREEN}✓${NC} NODE_ENV is set to production"
else
    echo -e "${YELLOW}⚠${NC} NODE_ENV is not 'production' (currently: ${NODE_ENV:-not set})"
fi

# ===========================================
# 6. FINAL CHECKLIST
# ===========================================
echo -e "\n${YELLOW}[6/6] Manual Verification Checklist...${NC}"

echo -e "\n${BLUE}Before deployment, manually verify:${NC}"
echo -e "  [ ] Supabase RLS policies are enabled on all tables"
echo -e "  [ ] Google OAuth is in production mode (not testing)"
echo -e "  [ ] Email domain SPF/DKIM/DMARC records are configured"
echo -e "  [ ] SSL certificate is ready (auto-handled by Vercel)"
echo -e "  [ ] Database backup has been created"
echo -e "  [ ] Monitoring tools are configured (Sentry, etc.)"
echo -e "  [ ] Rate limiting is implemented"
echo -e "  [ ] All console.log statements are removed"
echo -e "  [ ] API keys are set in Vercel dashboard (not in code)"
echo -e "  [ ] Rollback procedure is documented and tested"

# ===========================================
# SUMMARY
# ===========================================
echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}              SUMMARY${NC}"
echo -e "${BLUE}========================================${NC}"

if [ $ISSUES -eq 0 ]; then
    echo -e "${GREEN}✓ All automated checks passed!${NC}"
    echo -e "${GREEN}Ready for production deployment.${NC}"
    echo -e "\n${YELLOW}Remember to:${NC}"
    echo -e "1. Complete manual verification checklist above"
    echo -e "2. Set environment variables in Vercel dashboard"
    echo -e "3. Test on staging environment first"
    echo -e "4. Have rollback plan ready"
    exit 0
else
    echo -e "${RED}✗ Found $ISSUES issue(s) that need attention.${NC}"
    echo -e "${YELLOW}Please fix the issues above before deploying to production.${NC}"
    echo -e "\n${BLUE}Tips:${NC}"
    echo -e "• Run 'npm run lint -- --fix' to auto-fix some linting issues"
    echo -e "• Run 'npm audit fix' to fix some vulnerabilities"
    echo -e "• Check .env.production.example for required variables"
    exit 1
fi