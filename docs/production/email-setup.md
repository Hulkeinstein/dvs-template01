# 프로덕션 이메일 설정 가이드

## 📋 현재 상태 (개발/임시)

### 현재 설정
- **발신자**: `onboarding@resend.dev` (Resend 제공 검증된 도메인)
- **용도**: 개발 및 테스트 환경
- **제한사항**:
  - 전문적이지 않은 발신자 주소
  - Resend 브랜딩 포함
  - 스팸 필터에 걸릴 가능성

### 변경 이력
- **2025-10-25**: `dvs-education.com` 도메인 미인증으로 403 오류 발생
- **임시 조치**: `onboarding@resend.dev`로 변경하여 즉시 복구

---

## 🎯 프로덕션 전환 계획

### 목표
- 자체 도메인 `dvs-education.com` 인증 완료
- 전문적인 발신자 주소 사용 (`no-reply@dvs-education.com`)
- 이메일 전달률 향상 (SPF/DKIM/DMARC)

---

## 🚀 프로덕션 전환 단계

### 1단계: Resend 도메인 추가

#### Resend Dashboard 접속
1. [Resend Dashboard](https://resend.com) 로그인
2. 좌측 메뉴에서 **Domains** 클릭
3. **Add Domain** 버튼 클릭

#### 도메인 정보 입력
- **Domain**: `dvs-education.com`
- **Region**: `us-east-1` (또는 가장 가까운 리전)

---

### 2단계: DNS 레코드 설정

Resend가 제공하는 DNS 레코드를 도메인 등록업체(GoDaddy, Namecheap 등)에 추가해야 합니다.

#### 필수 DNS 레코드 (예시)

**⚠️ 실제 값은 Resend Dashboard에서 확인하세요!**

```dns
# SPF 레코드 (발신자 인증)
Type: TXT
Name: @
Value: v=spf1 include:amazonses.com ~all
TTL: 3600

# DKIM 레코드 1 (이메일 서명)
Type: CNAME
Name: resend._domainkey
Value: resend1._domainkey.amazonses.com
TTL: 3600

# DKIM 레코드 2
Type: CNAME
Name: resend2._domainkey
Value: resend2._domainkey.amazonses.com
TTL: 3600

# DMARC 레코드 (정책 설정)
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=quarantine; rua=mailto:dmarc@dvs-education.com
TTL: 3600
```

#### DNS 레코드 추가 절차
1. 도메인 등록업체 DNS 관리 페이지 접속
2. 위 레코드들을 하나씩 추가
3. 모든 레코드 저장

#### 검증 대기
- DNS 전파 시간: **24-72시간** (보통 1-2시간 내 완료)
- Resend Dashboard에서 자동으로 검증 상태 업데이트

---

### 3단계: 도메인 검증 확인

#### Resend Dashboard 확인
1. **Domains** 페이지에서 `dvs-education.com` 상태 확인
2. **Status**:
   - ⏳ `Pending` → DNS 전파 대기 중
   - ✅ `Verified` → 인증 완료!
   - ❌ `Failed` → DNS 레코드 재확인 필요

#### DNS 전파 확인 도구
```bash
# SPF 레코드 확인
nslookup -type=TXT dvs-education.com

# DKIM 레코드 확인
nslookup -type=CNAME resend._domainkey.dvs-education.com

# DMARC 레코드 확인
nslookup -type=TXT _dmarc.dvs-education.com
```

또는 온라인 도구:
- [MXToolbox](https://mxtoolbox.com/)
- [Google Admin Toolbox](https://toolbox.googleapps.com/apps/dig/)

---

### 4단계: 환경변수 변경

#### .env.production.local 수정
```env
# 기존 (임시)
EMAIL_FROM="DVS Education <onboarding@resend.dev>"

# 프로덕션 (변경 후)
EMAIL_FROM="DVS Education <no-reply@dvs-education.com>"
```

#### Vercel 환경변수 업데이트
1. Vercel Dashboard → Project Settings → Environment Variables
2. `EMAIL_FROM` 찾기
3. Production 환경 값 수정:
   ```
   DVS Education <no-reply@dvs-education.com>
   ```
4. **Redeploy** 필수 (환경변수 변경 시)

---

### 5단계: 코드 변경 (필요 시)

#### orderActions.ts 기본값 업데이트

**파일**: `app/lib/actions/orderActions.ts`

```typescript
// 현재 (임시)
const EMAIL_FROM =
  process.env.EMAIL_FROM || 'DVS Education <onboarding@resend.dev>';

// 프로덕션 (권장)
const EMAIL_FROM =
  process.env.EMAIL_FROM || 'DVS Education <no-reply@dvs-education.com>';
```

**주의**: 환경변수로 관리하는 것이 더 좋으므로, 코드 변경은 선택사항입니다.

---

## ✅ 테스트 체크리스트

### 프로덕션 배포 전
- [ ] Resend에서 도메인 상태 `Verified` 확인
- [ ] DNS 레코드 전파 완료 확인
- [ ] 환경변수 `EMAIL_FROM` 업데이트
- [ ] Vercel 프로덕션 환경에 배포

### 프로덕션 배포 후
- [ ] 테스트 주문 생성 (PayPal Sandbox 또는 실제 결제)
- [ ] Resend Dashboard > Emails 탭에서 발송 확인
- [ ] 실제 이메일 수신 확인 (Inbox)
- [ ] 스팸 폴더 확인 (없어야 정상)
- [ ] 이메일 헤더 확인:
  ```
  From: DVS Education <no-reply@dvs-education.com>
  To: customer@example.com
  Subject: Order Confirmation - ORD-20251025-XXXX
  ```

### 이메일 품질 검증
- [ ] [Mail Tester](https://www.mail-tester.com/)에서 점수 확인 (8점 이상)
- [ ] SPF/DKIM/DMARC 통과 확인
- [ ] 주요 이메일 제공자 테스트:
  - [ ] Gmail
  - [ ] Outlook/Hotmail
  - [ ] Yahoo Mail
  - [ ] Naver Mail (한국)

---

## 📊 모니터링

### Resend Dashboard
- **Emails** 탭: 발송 내역 및 상태
- **Logs** 탭: API 호출 및 오류
- **Analytics** 탭: 전달률, 오픈율 등

### 주요 메트릭
- **Delivery Rate** (전달률): 95% 이상 목표
- **Bounce Rate** (반송률): 5% 이하 유지
- **Spam Rate** (스팸 신고율): 0.1% 이하

### 알림 설정 (권장)
- Resend Webhooks를 통한 실시간 알림
- 배달 실패 시 Slack/Discord 알림
- 일일 발송 리포트

---

## 🔧 트러블슈팅

### 도메인 인증 실패
**증상**: Resend에서 도메인 상태가 `Failed`로 표시

**해결책**:
1. DNS 레코드 정확성 재확인
2. TTL 값 확인 (3600초 권장)
3. DNS 전파 대기 (최대 72시간)
4. Resend Support 문의

### 이메일 스팸 처리
**증상**: 이메일이 스팸 폴더로 분류

**해결책**:
1. DMARC 정책 강화 (`p=reject` 고려)
2. 이메일 콘텐츠 개선 (스팸 키워드 제거)
3. 발송 패턴 정상화 (급격한 발송량 증가 방지)
4. 구독자 관리 (수신 거부 처리)

### 403 오류 재발
**증상**: 다시 403 오류 발생

**해결책**:
1. 도메인 상태 확인 (Expired/Suspended 여부)
2. API 키 유효성 확인
3. Resend 계정 결제 상태 확인

---

## 📝 유지보수

### 월간 체크리스트
- [ ] Resend 대시보드 메트릭 검토
- [ ] 반송 이메일 주소 정리
- [ ] DNS 레코드 유효성 확인

### 분기별 체크리스트
- [ ] 이메일 템플릿 개선
- [ ] 전달률 분석 및 최적화
- [ ] DMARC 리포트 검토

### 연간 체크리스트
- [ ] 도메인 갱신 확인
- [ ] DNS 레코드 재검증
- [ ] 이메일 서비스 비용 최적화

---

## 📚 참고 자료

### Resend 공식 문서
- [도메인 인증 가이드](https://resend.com/docs/dashboard/domains)
- [DNS 레코드 설정](https://resend.com/docs/dashboard/domains/dns)
- [이메일 API](https://resend.com/docs/api-reference/emails/send-email)

### 이메일 전달률 가이드
- [SPF 설정](https://www.dmarcanalyzer.com/spf/)
- [DKIM 설정](https://www.dmarcanalyzer.com/dkim/)
- [DMARC 설정](https://www.dmarcanalyzer.com/dmarc/)

### 관련 문서
- [프로덕션 배포 가이드](../../modules/production-deployment.md)
- [환경 설정 가이드](../../modules/environment-setup.md)

---

## ⚠️ 중요 참고사항

### 개발/스테이징 환경
- 계속 `onboarding@resend.dev` 사용 (변경 불필요)
- 환경변수로 분리하여 관리

### 비용
- Resend 무료 플랜: 월 100통
- 프로덕션: $20/월 (50,000통)
- 도메인 인증 자체는 무료

### 보안
- `RESEND_API_KEY`는 절대 노출 금지
- `.env` 파일은 Git에 커밋하지 않기
- Production 키는 별도 관리

---

**마지막 업데이트**: 2025-10-25
**작성자**: 개발팀
**검토 주기**: 분기별
