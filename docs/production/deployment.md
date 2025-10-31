# 프로덕션 배포 가이드

## 📋 목차
- [환경변수 전환](#환경변수-전환)
- [보안 체크리스트](#보안-체크리스트)
- [서비스별 프로덕션 설정](#서비스별-프로덕션-설정)
- [배포 체크리스트](#배포-체크리스트)
- [모니터링 및 유지보수](#모니터링-및-유지보수)
- [롤백 계획](#롤백-계획)
- [비용 최적화](#비용-최적화)

## 🔄 환경변수 전환

### 환경변수 전환 매핑 (Dev → Prod)
| 항목 | 개발 값 | 프로덕션 값 | 주의사항 |
|------|---------|-------------|----------|
| NODE_ENV | development | production | 빌드/최적화/로그 영향 |
| NEXTAUTH_URL | http://localhost:3000 | https://yourdomain.com | **HTTPS 필수**, OAuth 콜백 |
| NEXTAUTH_SECRET | dev 시크릿 | **64자 신규 생성** | 절대 재사용 금지 |
| EMAIL_FROM | noreply@dvs-education.com | noreply@yourdomain.com | 도메인 검증(SPF/DKIM/DMARC) |
| Supabase URL | Dev 프로젝트 | Prod 프로젝트 | 프로젝트 분리 권장 |
| Supabase Anon Key | Dev anon key | Prod anon key | 클라이언트 노출 가능 |
| Supabase Service Key | Dev service key | Prod service key | **서버만**, 절대 노출 금지 |
| Google Client ID | 테스트 앱 ID | 프로덕션 앱 ID | OAuth 앱 분리 권장 |
| Google Client Secret | 테스트 시크릿 | 프로덕션 시크릿 | 절대 노출 금지 |
| Resend API Key | 테스트 키 | 프로덕션 키 | 발송 한도/요금 확인 |

### 필수 환경변수 체크리스트
```bash
# 프로덕션 필수 환경변수
✅ NODE_ENV=production
✅ NEXTAUTH_URL=https://yourdomain.com
✅ NEXTAUTH_SECRET=<64자 이상 강력한 시크릿>
✅ NEXT_PUBLIC_SUPABASE_URL=https://prod.supabase.co
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY=<prod-anon-key>
✅ SUPABASE_SERVICE_ROLE_KEY=<prod-service-key>
✅ GOOGLE_CLIENT_ID=<prod-client-id>
✅ GOOGLE_CLIENT_SECRET=<prod-client-secret>
✅ RESEND_API_KEY=re_production_xxxxx
✅ EMAIL_FROM="DVS Education <noreply@yourdomain.com>"
```

### 시크릿 생성 가이드
```bash
# NEXTAUTH_SECRET 생성 (64자)
openssl rand -base64 64

# JWT 키페어 생성 (SSO용, 선택)
openssl genrsa -out private.pem 2048
openssl rsa -in private.pem -pubout -out public.pem
cat private.pem | base64  # JWT_PRIVATE_KEY_B64
cat public.pem | base64   # JWT_PUBLIC_KEY_B64
```

## 🔒 보안 체크리스트

### 필수 보안 설정
- [x] **HTTPS 강제** - 모든 HTTP 트래픽을 HTTPS로 리다이렉트
- [x] **HSTS 헤더** - `Strict-Transport-Security` 설정
- [x] **CSP 헤더** - Content Security Policy 설정
- [x] **XSS 방어** - 입력값 검증 및 이스케이프
- [x] **SQL Injection 방지** - 파라미터 바인딩, Supabase 쿼리 빌더 사용
- [x] **CSRF 보호** - NextAuth 자동 처리
- [x] **Rate Limiting** - 로그인/비밀번호 재설정 제한
- [x] **CORS 설정** - 허용된 도메인만 API 접근
- [x] **보안 헤더** - X-Frame-Options, X-Content-Type-Options 등

### API 키 보안
- ⚠️ **절대 커밋 금지**: `.env.local`, `.env.production.local`
- ✅ **환경변수 사용**: process.env로만 접근
- ✅ **서버/클라이언트 분리**: 
  - 클라이언트: `NEXT_PUBLIC_*` 접두사만
  - 서버: SERVICE_ROLE_KEY 등 민감한 키
- ✅ **키 순환 정책**: 
  - 분기별 API 키 교체
  - 유출 의심 시 즉시 교체
  - 이전 키 폐기 확인

### Supabase RLS (Row Level Security)
```sql
-- RLS 활성화 필수
ALTER TABLE user ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- 정책 예시
CREATE POLICY "Users can only see own data" ON user
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Instructors manage own courses" ON courses
  FOR ALL USING (auth.uid() = instructor_id);

CREATE POLICY "Students see enrolled courses" ON enrollments
  FOR SELECT USING (auth.uid() = user_id);
```

## 🚀 서비스별 프로덕션 설정

### 1. Supabase
#### 프로덕션 체크리스트
- [ ] 별도 프로덕션 프로젝트 생성
- [ ] RLS 정책 모든 테이블 활성화
- [ ] 백업 자동화 설정 (Pro 플랜)
- [ ] Connection Pooling 활성화
- [ ] 로그 레벨 조정 (에러만)
- [ ] 스토리지 버킷 정책 검토

#### 권장 설정
```sql
-- Connection Pool 설정 (Supabase Dashboard)
Pool Mode: Transaction
Pool Size: 25 (기본)
Statement Timeout: 60s

-- 인덱스 최적화
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_enrollments_user ON enrollments(user_id);
CREATE INDEX idx_lessons_course ON lessons(course_id);
```

### 2. Google OAuth
#### 프로덕션 전환
1. **Google Cloud Console** 접속
2. **OAuth 동의 화면** → "게시 상태"를 "프로덕션"으로 변경
3. **승인된 도메인** 추가:
   - `yourdomain.com`
   - `www.yourdomain.com`
4. **리다이렉트 URI** 업데이트:
   ```
   https://yourdomain.com/api/auth/callback/google
   https://www.yourdomain.com/api/auth/callback/google
   ```
5. **검증 프로세스** (도메인 소유권 확인)

#### 보안 설정
- [ ] OAuth 앱 검증 완료
- [ ] 민감한 스코프 최소화
- [ ] 리프레시 토큰 안전 저장

### 3. Resend (이메일)
#### 도메인 설정
1. **도메인 추가** (Resend Dashboard)
2. **DNS 레코드 설정**:
   ```
   # SPF 레코드
   TXT  @  "v=spf1 include:amazonses.com ~all"
   
   # DKIM 레코드 (Resend 제공)
   CNAME  resend._domainkey  xxxxx.dkim.amazonses.com
   
   # DMARC 레코드
   TXT  _dmarc  "v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com"
   ```
3. **도메인 검증** 대기 (최대 72시간)
4. **발신자 주소 설정**:
   ```env
   EMAIL_FROM="DVS Education <noreply@yourdomain.com>"
   ```

#### 이메일 템플릿 최적화
- [ ] 반응형 HTML 템플릿
- [ ] 플레인 텍스트 대체 버전
- [ ] 수신거부 링크 포함
- [ ] 발신자 정보 명확히 표시

### 4. Vercel
#### 환경변수 설정
1. **Vercel Dashboard** → Project Settings → Environment Variables
2. **Production** 환경 선택
3. 모든 환경변수 입력 (`.env.production.example` 참조)
4. **암호화된 저장** 자동 처리

#### 도메인 설정
```
# 도메인 추가
yourdomain.com
www.yourdomain.com (리다이렉트)

# SSL 인증서
자동 발급 및 갱신 (Let's Encrypt)

# DNS 설정
A     @      76.76.21.21
CNAME www    cname.vercel-dns.com
```

#### 최적화 설정
- [ ] Edge Functions 리전 선택
- [ ] 이미지 최적화 활성화
- [ ] Analytics 활성화
- [ ] Speed Insights 활성화

### 5. NextAuth
#### 프로덕션 설정
```javascript
// app/api/auth/[...nextauth]/route.ts
export const authOptions = {
  // ... 기존 설정
  cookies: {
    secure: true, // HTTPS only
    sameSite: 'lax',
    httpOnly: true
  },
  session: {
    maxAge: 30 * 24 * 60 * 60, // 30일
    updateAge: 24 * 60 * 60, // 24시간
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  }
}
```

## 📋 배포 체크리스트

### 🔍 Pre-deployment (배포 전)
#### 코드 준비
- [ ] 모든 console.log 제거
- [ ] 디버그 코드 제거
- [ ] TODO 주석 해결
- [ ] TypeScript 에러 0개
- [ ] ESLint 경고 해결
- [ ] 테스트 통과

#### 환경 준비
- [ ] `.env.production.local` 파일 생성
- [ ] 모든 환경변수 프로덕션 값 설정
- [ ] `deploy-checklist.sh` 실행 통과
- [ ] 데이터베이스 백업
- [ ] 도메인 준비

#### 서비스 설정
- [ ] Supabase RLS 정책 활성화
- [ ] Google OAuth 프로덕션 모드
- [ ] Resend 도메인 검증 완료
- [ ] Vercel 프로젝트 생성

### 🚀 Deployment (배포 중)
#### Vercel 배포
```bash
# 1. Vercel CLI 설치 (선택)
npm i -g vercel

# 2. 프로젝트 연결
vercel link

# 3. 환경변수 설정 (Dashboard 권장)
vercel env pull .env.production.local

# 4. 프로덕션 배포
vercel --prod

# 또는 Git Push (자동 배포)
git push origin main
```

#### 배포 확인
- [ ] 빌드 성공
- [ ] 환경변수 적용
- [ ] 도메인 연결
- [ ] SSL 인증서 활성화
- [ ] HTTPS 리다이렉트 작동

### ✅ Post-deployment (배포 후)
#### 기능 테스트
- [ ] 홈페이지 로딩
- [ ] Google OAuth 로그인
- [ ] 비밀번호 설정/변경
- [ ] 비밀번호 재설정 이메일
- [ ] 코스 생성/수정
- [ ] 파일 업로드
- [ ] 레슨 재정렬
- [ ] 퀴즈 생성

#### 성능 검증
- [ ] Lighthouse 점수 확인
- [ ] Core Web Vitals 측정
- [ ] 로딩 속도 테스트
- [ ] 모바일 반응성

#### 보안 검증
- [ ] HTTPS 강제 확인
- [ ] 보안 헤더 확인 (securityheaders.com)
- [ ] CSP 정책 테스트
- [ ] API 엔드포인트 보호

## 📊 모니터링 및 유지보수

### 모니터링 도구
#### Vercel Analytics (기본)
- 페이지 뷰, 방문자 수
- 성능 메트릭
- 에러 추적

#### Sentry (권장)
```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

```javascript
// sentry.client.config.js
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1, // 10% 샘플링
});
```

#### Uptime 모니터링
- **UptimeRobot** (무료)
- **Pingdom** (유료)
- **Better Uptime** (중간)

### 정기 유지보수
#### 일일
- [ ] 에러 로그 확인
- [ ] 성능 메트릭 확인
- [ ] 사용자 피드백 확인

#### 주간
- [ ] 백업 확인
- [ ] 보안 알림 확인
- [ ] 의존성 업데이트 확인

#### 월간
- [ ] 의존성 업데이트 (`npm audit`)
- [ ] 성능 최적화 검토
- [ ] 비용 분석
- [ ] 용량 모니터링

#### 분기별
- [ ] API 키 순환
- [ ] 보안 감사
- [ ] 백업 복구 테스트
- [ ] 재해 복구 훈련

## 🔄 롤백 계획

### 즉시 롤백 (Vercel)
```bash
# Vercel Dashboard에서
1. Deployments 탭 이동
2. 이전 성공 배포 선택
3. "Promote to Production" 클릭

# CLI 사용
vercel rollback
```

### 데이터베이스 롤백
```sql
-- Supabase 백업에서 복원
1. Dashboard → Backups
2. 복원 지점 선택
3. "Restore" 실행

-- 수동 백업 (배포 전 실행)
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

### 긴급 대응 절차
1. **문제 감지** → 모니터링 알림
2. **영향 평가** → 사용자 수, 기능 범위
3. **즉시 조치**:
   - 작은 문제: 핫픽스 배포
   - 큰 문제: 이전 버전 롤백
4. **원인 분석** → 로그, 에러 추적
5. **수정 배포** → 테스트 후 재배포
6. **사후 분석** → 재발 방지 대책

## 💰 비용 최적화

### 예상 월 비용
| 서비스 | 무료 티어 | 프로덕션 | 비고 |
|--------|----------|----------|------|
| Vercel | Hobby (무료) | Pro ($20/월) | 팀 협업, 분석 |
| Supabase | Free (500MB) | Pro ($25/월) | 8GB DB, 백업 |
| Resend | 100통/월 | $20/월 | 50,000통 |
| **총계** | **$0** | **~$65/월** | MAU 5,000 기준 |

### 비용 절감 팁
#### 초기 단계 (MAU < 1,000)
- Vercel Hobby 플랜 유지
- Supabase Free 티어 활용
- Resend 무료 100통 내 운영

#### 성장 단계 (MAU 1,000-5,000)
- Vercel Pro 전환 (분석 필요)
- Supabase Pro (백업 필수)
- Resend 유료 전환

#### 확장 단계 (MAU 5,000+)
- Vercel Enterprise 검토
- Supabase 전용 인스턴스
- SendGrid/SES 비교 검토

### 리소스 최적화
```javascript
// 이미지 최적화
import Image from 'next/image';

// 동적 임포트
const HeavyComponent = dynamic(() => import('./Heavy'), {
  loading: () => <Skeleton />,
  ssr: false
});

// API 응답 캐싱
export const revalidate = 3600; // 1시간
```

## 📝 트러블슈팅

### 일반적인 문제

#### HTTPS 리다이렉트 안 됨
```javascript
// middleware.ts
export function middleware(request: NextRequest) {
  if (!request.headers.get('x-forwarded-proto')?.includes('https')) {
    return NextResponse.redirect(
      `https://${request.headers.get('host')}${request.nextUrl.pathname}`,
      301
    );
  }
}
```

#### 환경변수 인식 안 됨
- Vercel Dashboard에서 직접 설정
- 재배포 필요 (환경변수 변경 시)
- `NEXT_PUBLIC_` 접두사 확인

#### Supabase 연결 실패
- Connection string 확인
- RLS 정책 확인
- IP 화이트리스트 (필요시)

#### 이메일 발송 실패
- 도메인 검증 상태
- SPF/DKIM/DMARC 레코드
- API 키 유효성
- 발송 한도 확인

## 🔗 유용한 리소스

### 공식 문서
- [Next.js 배포 가이드](https://nextjs.org/docs/deployment)
- [Vercel 문서](https://vercel.com/docs)
- [Supabase 프로덕션 체크리스트](https://supabase.com/docs/guides/platform/going-into-prod)
- [Resend 도메인 설정](https://resend.com/docs/dashboard/domains)

### 보안 검증 도구
- [Security Headers](https://securityheaders.com)
- [SSL Labs](https://www.ssllabs.com/ssltest)
- [Observatory](https://observatory.mozilla.org)
- [Lighthouse](https://pagespeed.web.dev)

### 성능 모니터링
- [GTmetrix](https://gtmetrix.com)
- [WebPageTest](https://www.webpagetest.org)
- [Core Web Vitals](https://web.dev/vitals)

---

**마지막 업데이트**: 2025-02-11  
**작성자**: 개발팀  
**검토 주기**: 월별  
**다음 검토**: 2025-03-11