# PayPal Webhook Setup Guide

이 가이드는 PayPal 결제 안정성을 위해 필수적인 웹훅 설정 방법을 설명합니다.
**배포 전(Production Deployment)** 단계에서 반드시 수행해야 합니다. 로컬 개발 중에는 선택 사항입니다.

## 🚀 배포 전 필수 체크리스트 (Pre-Deployment)

라이브 서버(Vercel 등)에 배포한 후, 다음 절차를 따라 웹훅을 반드시 등록해 주세요.

## 1. PayPal Developer Dashboard 접속

1. [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)에 접속하여 로그인합니다.
2. 상단 메뉴에서 **Apps & Credentials**로 이동합니다.

## 2. 앱 선택 (Sandbox 또는 Live)

1. **Sandbox** (테스트용) 또는 **Live** (실제 서비스용) 모드를 선택합니다.
2. 사용 중인 **App Name**을 클릭하여 상세 페이지로 들어갑니다.

## 3. Webhook 추가

1. 화면을 아래로 스크롤하여 **Webhooks** 섹션을 찾습니다.
2. **Add Webhook** 버튼을 클릭합니다.

## 4. Webhook URL 입력

**Webhook URL** 필드에 다음 형식으로 주소를 입력합니다:

```
https://<YOUR_DOMAIN>/api/webhooks/paypal
```

### ⚠️ 로컬 개발 환경 (Localhost)에서 테스트 시
PayPal은 `localhost` 주소로 직접 요청을 보낼 수 없습니다. `ngrok` 같은 터널링 도구를 사용하여 로컬 서버를 외부로 노출해야 합니다.

1. `ngrok` 실행 (포트 3000번 예시):
   ```bash
   ngrok http 3000
   ```
2. 생성된 HTTPS 주소 사용 (예: `https://a1b2-c3d4.ngrok-free.app`):
   - 입력할 URL: `https://a1b2-c3d4.ngrok-free.app/api/webhooks/paypal`

## 5. 이벤트 구독 (Event Types)

수신할 이벤트를 선택합니다. 다음 두 가지 이벤트는 **필수**입니다:

1. **Checkout order approved** (`CHECKOUT.ORDER.APPROVED`)
   - 중요: 사용자가 결제를 승인했을 때 발생합니다.
2. **Payment capture completed** (`PAYMENT.CAPTURE.COMPLETED`)
   - 중요: 결제가 최종적으로 완료되었을 때 발생합니다.

> **Tip**: 검색창(Ctrl+F)을 이용하거나 목록에서 해당 항목을 찾아 체크박스를 선택하세요.

## 6. 저장

맨 아래 **Save** 버튼을 클릭하여 웹훅을 생성합니다.

## 7. Webhook ID 확인 (선택 사항)

웹훅이 생성되면 **Webhook ID**가 발급됩니다. 나중에 웹훅 서명 검증(Security)을 강화할 때 이 ID를 환경 변수 `PAYPAL_WEBHOOK_ID`에 추가하면 됩니다.

---

## ✅ 완료 확인

이제 PayPal에서 결제가 발생하면, 설정한 URL로 이벤트가 전송되며 `app/api/webhooks/paypal/route.ts`에서 이를 처리하게 됩니다.
