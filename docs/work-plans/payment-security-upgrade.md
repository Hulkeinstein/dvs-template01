# Payment Service Improvement Plan

## Goal
Improve the reliability, security, and type safety of the PayPal payment implementation.

## User Review Required
> [!IMPORTANT]
> The missing webhook implementation is a critical gap. Relying solely on client-side capture means if a user closes the browser after payment approval but before redirection, the order will remain unpaid in our system despite money leaving their account.
> I propose adding a webhook handler for `CHECKOUT.ORDER.APPROVED` and `PAYMENT.CAPTURE.COMPLETED`.

## Proposed Changes

### Webhooks
#### [NEW] [route.ts](file:///d:/kamwoo/6.programing/DEV/Cursor/project/dvs-template01/DVS-TEMPLATE01/app/api/webhooks/paypal/route.ts)
- Implement `POST` handler for PayPal webhooks.
- Validate webhook signature (requires `PAYPAL_WEBHOOK_ID` env var).
- Handle `CHECKOUT.ORDER.APPROVED`: Trigger capture if not already done.
- Handle `PAYMENT.CAPTURE.COMPLETED`: Ensure DB reflects 'completed' status.

### API Routes
#### [MODIFY] [create-order/route.ts](file:///d:/kamwoo/6.programing/DEV/Cursor/project/dvs-template01/DVS-TEMPLATE01/app/api/payment/paypal/create-order/route.ts)
- Remove `any` types.
- Add stricter environment variable checks.
- Add structured logging.

#### [MODIFY] [capture/route.ts](file:///d:/kamwoo/6.programing/DEV/Cursor/project/dvs-template01/DVS-TEMPLATE01/app/api/payment/paypal/capture/route.ts)
- Remove `any` types.
- Add logging for `activate_paid_order` result.

### Lib
#### [MODIFY] [paypal.ts](file:///d:/kamwoo/6.programing/DEV/Cursor/project/dvs-template01/DVS-TEMPLATE01/app/lib/paypal.ts)
- Add stronger typing for the client and environment helpers.

## Verification Plan

### Automated Tests
- Run existing e2e tests: `npx playwright test tests/e2e/checkout.spec.ts`

### Manual Verification
- **Happy Path**: Complete a purchase using PayPal Sandbox. Verify `orders` and `enrollments` tables update correctly.
- **Interrupted Path**:
    1. Click "PayPal" button.
    2. Log in to Sandbox and approve payment.
    3. Close the browser window *immediately* after approval (before redirection to success page).
    4. Wait for Webhook (simulate if local) to trigger capture.
    5. Verify in DB that order becomes 'completed'.

---

## Code Review (2025-12-14)

### Current Implementation Status

#### Already Implemented ✅

**create-order/route.ts**:
- Session authentication check
- DB price vs client price validation (price tampering prevention)
- Duplicate enrollment check
- Order ownership verification
- Structured logging with `console.log/error/warn`

**capture/route.ts**:
- Idempotency check using `order_events` table
- Order ownership verification
- Captured amount validation
- `activate_paid_order` RPC call
- Transaction logging

**paypal.ts**:
- Environment-based branching (Sandbox/Live)
- Environment variable check with `isPayPalEnabled()`
- Proper SDK typing (`SandboxEnvironment`, `LiveEnvironment`)

### Review Summary

| Item | Necessity | Status |
|------|-----------|--------|
| **Webhook Implementation** | ⚠️ Critical | Not implemented - Required for production |
| `any` type removal | Low | Only 1 instance remaining (line 144) |
| Logging enhancement | Not needed | Already sufficient |
| paypal.ts typing | Not needed | Already sufficient |

### Remaining Work

#### High Priority - Webhook Handler
The webhook concern raised in this plan is valid and critical:
> "If a user closes the browser after PayPal approval but before redirection, the order remains unpaid in our system despite money leaving their account."

**Required for production deployment.**

#### Low Priority - Single `any` Type
- Location: `create-order/route.ts:144`
- Code: `(link: any) => link.rel === 'approve'`
- Fix: Add PayPal link type or use type assertion

### Recommendation

1. **Immediate**: Fix the single `any` type (5 min)
2. **Phase 2+**: Implement webhook handler with:
   - `CHECKOUT.ORDER.APPROVED` event handling
   - `PAYMENT.CAPTURE.COMPLETED` event handling
   - Webhook signature validation
   - Local testing setup (ngrok)

### Decision Required
- [x] ~~Proceed with webhook implementation now~~ **Completed**
- [ ] Defer to Phase 2 and close this work plan
- [ ] Only fix the `any` type and close

---

## Implementation Completed (2025-12-14)

### Files Created/Modified

| File | Status | Description |
|------|--------|-------------|
| `app/api/webhooks/paypal/route.ts` | ✅ NEW | Webhook handler for PayPal events |
| `app/lib/services/paymentService.ts` | ✅ NEW | Centralized payment capture logic |
| `app/lib/services/emailService.ts` | ✅ NEW | Order confirmation email service |
| `app/api/payment/paypal/create-order/route.ts` | ✅ MODIFIED | `any` type removed (line 144) |
| `docs/production/deployment.md` | ✅ MODIFIED | PayPal production setup section added |

### Verification

```bash
npm run typecheck  # ✅ Passed
```

### Deployment Checklist (for Production)

Before deploying to production:
1. [ ] Create PayPal Live App at [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. [ ] Register webhook URL: `https://yourdomain.com/api/webhooks/paypal`
3. [ ] Select events: `Checkout order approved`, `Payment capture completed`
4. [ ] Set environment variables:
   - `PAYPAL_CLIENT_ID` (Live)
   - `PAYPAL_CLIENT_SECRET` (Live)
   - `PAYPAL_WEBHOOK_ID` (from webhook registration)

### Next Steps

- [ ] **Close this Work Plan** → Move core docs to Library if needed
- [ ] Manual test with PayPal Sandbox (Happy Path + Interrupted Path)
- [ ] Deploy to production and test Live mode

---

## Git Cleanup Guide (2025-12-14)

### 삭제해야 할 파일들 (임시/테스트 출력)

| 파일 | 이유 |
|------|------|
| `test_output.txt` | 테스트 출력 로그 |
| `test_output_2.txt` | 테스트 출력 로그 |
| `test_output_3.txt` | 테스트 출력 로그 |
| `test-results/.last-run.json` | Playwright 테스트 결과 |
| `scripts/debug-console.js` | 디버그 스크립트 |
| `scripts/simulate-webhook.js` | 테스트용 시뮬레이션 스크립트 |

### 유지해야 할 파일들 (실제 구현)

| 파일 | 이유 |
|------|------|
| `app/api/webhooks/paypal/route.ts` | ✅ Webhook 핸들러 |
| `app/lib/services/paymentService.ts` | ✅ 결제 서비스 |
| `app/lib/services/emailService.ts` | ✅ 이메일 서비스 |
| `tests/e2e/payment-security.spec.ts` | ✅ E2E 테스트 (유지) |
| `docs/guides/paypal-webhook-setup.md` | ✅ 설정 가이드 |

### 권장 명령어

```bash
# 1. 테스트 출력 파일 unstage 및 삭제
git reset HEAD test_output.txt test_output_2.txt test_output_3.txt test-results/.last-run.json scripts/debug-console.js
rm -f test_output.txt test_output_2.txt test_output_3.txt scripts/debug-console.js scripts/simulate-webhook.js
rm -rf test-results/

# 2. .gitignore에 패턴 추가 (향후 방지)
echo "test_output*.txt" >> .gitignore
echo "test-results/" >> .gitignore

# 3. 상태 확인
git status --short

# 4. 나머지 파일 커밋 (amend 또는 새 커밋)
git add .
git commit --amend --no-edit  # 기존 커밋에 추가
# 또는
git commit -m "chore: cleanup test output files"
```

### 현재 Git 상태 요약

- **이미 커밋됨**: `897371e feat(payment): payment security upgrade - Closes #58`
- **추가 staged 파일**: 위 테이블 참조
- **권장 액션**: 테스트 파일 삭제 후 `.gitignore` 업데이트
