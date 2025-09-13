# 인증 시스템 아키텍처

## 🏗️ 시스템 개요
- **하이브리드 인증**: Google OAuth + Email/Password
- **DB**: Supabase (PostgreSQL)
- **세션**: NextAuth.js + Server Actions
- **보안**: Bcrypt 해싱, SHA-256 토큰, Rate Limiting

## 🔐 지원 인증 방식

### 1. Google OAuth
- NextAuth.js 통합
- 첫 로그인 시 자동 회원가입
- `auth_provider = 'google'`

### 2. Email/Password
- 커스텀 구현
- Bcrypt 해싱 (saltRounds: 10)
- `auth_provider = 'email'`

### 3. Hybrid (Both)
- OAuth 사용자가 비밀번호 추가 설정
- 두 방식 모두로 로그인 가능
- `auth_provider = 'both'`

## 📊 데이터베이스 스키마

### 핵심 필드
```sql
-- user 테이블 핵심 인증 필드
user.password_hash VARCHAR(255)                    -- Bcrypt 해시
user.auth_provider VARCHAR(50) DEFAULT 'google'    -- 'google'|'email'|'both'
user.password_set_at TIMESTAMPTZ                   -- 최초 비밀번호 설정 시각
user.password_changed_at TIMESTAMPTZ               -- 마지막 비밀번호 변경 시각
user.password_reset_token VARCHAR(255)             -- SHA-256 해시 저장
user.password_reset_expires TIMESTAMPTZ            -- 토큰 만료 시각
```

### 인덱스
```sql
-- 성능 및 보안을 위한 인덱스
CREATE INDEX idx_user_auth_provider ON "user"(auth_provider);
CREATE UNIQUE INDEX idx_user_password_reset_token_unique 
  ON "user"(password_reset_token) 
  WHERE password_reset_token IS NOT NULL;
CREATE INDEX idx_user_password_reset_expires 
  ON "user"(password_reset_expires) 
  WHERE password_reset_expires IS NOT NULL;
```

### 트리거
```sql
-- 비밀번호 변경 시 자동 타임스탬프 업데이트
CREATE OR REPLACE FUNCTION update_password_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.password_hash IS DISTINCT FROM NEW.password_hash THEN
    NEW.password_changed_at = NOW();
    
    IF OLD.password_hash IS NULL THEN
      NEW.password_set_at = NOW();
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_user_password_ts
  BEFORE UPDATE ON "user"
  FOR EACH ROW
  EXECUTE FUNCTION update_password_timestamps();
```

## 🔄 사용자 플로우

### 비밀번호 설정 (OAuth 사용자)
```mermaid
graph TD
    A[Google 로그인] --> B[Settings > Password 탭]
    B --> C[새 비밀번호 입력]
    C --> D[비밀번호 검증]
    D --> E[setPassword() 호출]
    E --> F[auth_provider: google → both]
    F --> G[이후 두 방식 모두 사용 가능]
```

### 비밀번호 변경
```mermaid
graph TD
    A[Settings > Password 탭] --> B[현재 비밀번호 입력]
    B --> C[새 비밀번호 입력]
    C --> D[changePassword() 호출]
    D --> E[현재 비밀번호 검증]
    E --> F[새 비밀번호 해싱]
    F --> G[DB 업데이트]
    G --> H[세션 유지/무효화 선택]
```

### 비밀번호 재설정 (Magic Link)
```mermaid
graph TD
    A[/auth/forgot-password] --> B[이메일 입력]
    B --> C[requestPasswordReset()]
    C --> D[토큰 생성 & SHA-256 해싱]
    D --> E[DB에 해시 저장]
    E --> F[원본 토큰으로 이메일 발송]
    F --> G[사용자가 링크 클릭]
    G --> H[/auth/reset-password?token=xxx]
    H --> I[토큰 검증]
    I --> J[새 비밀번호 설정]
    J --> K[토큰 무효화 & 세션 초기화]
```

## 🔒 보안 정책

### 비밀번호 정책
```typescript
function validatePassword(password: string) {
  return {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  };
}
```

### 토큰 보안
- **생성**: `crypto.randomBytes(32).toString('hex')` (64자)
- **저장**: SHA-256 해시만 DB에 저장 (원문 저장 금지)
- **만료**: 30분 (1800초)
- **사용**: 1회 사용 후 즉시 무효화

### Rate Limiting (계획)
```typescript
// 구현 예정
const rateLimits = {
  loginFailure: '5 attempts per 15 minutes per IP',
  passwordReset: '3 requests per hour per email',
  passwordChange: '5 attempts per hour per user'
};
```

### 세션 관리
- **OAuth 세션**: NextAuth.js 관리
- **비밀번호 변경 시**: 기존 세션 유지 (선택 가능)
- **비밀번호 재설정 시**: 모든 세션 무효화 권장

## 📁 파일 구조

```
app/
├── lib/actions/
│   └── passwordActions.ts          # 비밀번호 관련 Server Actions
├── api/auth/[...nextauth]/
│   ├── route.ts                    # NextAuth 핸들러
│   └── auth.config.ts              # NextAuth 설정
└── (auth)/
    ├── forgot-password/
    │   └── page.tsx                # 이메일 입력 페이지
    └── reset-password/
        └── page.tsx                # 새 비밀번호 설정 페이지

components/
└── Instructor/
    └── Settings.tsx                # 비밀번호 설정/변경 UI

supabase/migrations/
└── 20250210_add_password_auth_fields.sql  # 인증 필드 마이그레이션
```

## 🛠️ 주요 함수

### Server Actions (`passwordActions.ts`)
```typescript
// OAuth 사용자 첫 비밀번호 설정
export async function setPassword(data: SetPasswordData)

// 기존 비밀번호 변경
export async function changePassword(data: ChangePasswordData)

// 비밀번호 설정 상태 확인
export async function checkPasswordStatus()

// 비밀번호 재설정 요청 (이메일 발송)
export async function requestPasswordReset(email: string)

// 재설정 토큰 검증
export async function validateResetToken(rawToken: string)

// 토큰으로 비밀번호 재설정
export async function resetPasswordWithToken(rawToken: string, newPassword: string)
```

### 이메일 템플릿
```html
<!-- 비밀번호 재설정 이메일 -->
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2>비밀번호 재설정</h2>
  <p>안녕하세요 {name}님,</p>
  <p>비밀번호 재설정을 요청하셨습니다.</p>
  
  <div style="margin: 30px 0;">
    <a href="{resetLink}" style="background-color: #4CAF50; color: white; 
       padding: 12px 24px; text-decoration: none; border-radius: 4px;">
      비밀번호 재설정하기
    </a>
  </div>
  
  <p style="color: #666;">
    이 링크는 30분간 유효합니다.<br>
    요청하지 않으셨다면 이 메일을 무시하세요.
  </p>
</div>
```

## ✅ 구현 상태

### 완료된 기능
- [x] DB 스키마 및 마이그레이션
- [x] `setPassword` - OAuth 사용자 비밀번호 설정
- [x] `changePassword` - 기존 비밀번호 변경
- [x] `checkPasswordStatus` - 비밀번호 설정 상태 확인
- [x] `requestPasswordReset` - 재설정 요청 및 이메일 발송
- [x] `validateResetToken` - 토큰 유효성 검증
- [x] `resetPasswordWithToken` - 토큰으로 비밀번호 재설정
- [x] `/auth/forgot-password` 페이지
- [x] `/auth/reset-password` 페이지
- [x] Settings UI에 "Forgot password?" 링크

### 미완료 기능 (향후 계획)
- [ ] `/auth/login` Email 탭 구현
- [ ] `/auth/register` 회원가입 페이지
- [ ] Rate Limiting 구현
- [ ] 세션 무효화 로직 강화
- [ ] 감사 로그 시스템
- [ ] 2FA (이중 인증) 지원

## 🔍 테스트 시나리오

### 기본 플로우
1. **Google 로그인** → 자동 회원가입 확인
2. **비밀번호 설정** → auth_provider 변경 확인
3. **비밀번호 변경** → 검증 및 해싱 확인
4. **비밀번호 재설정** → 이메일 수신 및 재설정 확인

### 에러 케이스
- 잘못된 현재 비밀번호
- 만료된 재설정 토큰
- 중복 토큰 사용
- 약한 비밀번호 입력

### 보안 테스트
- SQL Injection 시도
- XSS 공격 시도
- 무차별 대입 공격 (Brute Force)
- 토큰 추측 공격

## 📝 운영 가이드

### 일상 모니터링
- 실패한 로그인 시도 추적
- 비밀번호 재설정 요청 빈도 모니터링
- 이상한 패턴의 계정 생성 감지

### 보안 사고 대응
1. **의심스러운 활동 감지** → 즉시 계정 잠금
2. **대량 재설정 요청** → Rate Limiting 강화
3. **데이터 유출 의심** → 전체 비밀번호 재설정 강제

### 정기 보안 점검 (분기별)
- [ ] 비밀번호 해싱 강도 점검
- [ ] 토큰 생성 알고리즘 검토
- [ ] 의존성 보안 업데이트
- [ ] 침투 테스트 실시

---

**마지막 업데이트**: 2025-02-11  
**작성자**: 개발팀  
**검토자**: 보안팀  
**다음 검토**: 2025-05-11