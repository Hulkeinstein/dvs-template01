# 환경 설정 가이드

## 🚀 Quick Start

### 1. 환경변수 파일 생성
```bash
# 프로젝트 루트에서
cp .env.example .env.local
# 또는 직접 생성
touch .env.local
```

### 2. 필수 환경변수 설정

#### Supabase (필수)
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...  # anon/public key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...      # service_role key (서버 전용)
```
> 📍 **Supabase Dashboard > Settings > API**에서 확인

#### Google OAuth (필수)
```env
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx
```
> 📍 **Google Cloud Console > APIs & Services > Credentials**에서 발급

#### NextAuth / 앱 기본 URL (필수)
```env
NEXTAUTH_URL=http://localhost:3000    # 개발환경
# NEXTAUTH_URL=https://yourdomain.com  # 프로덕션
NEXTAUTH_SECRET=xxxxx                 # openssl rand -base64 32
```

#### Email Service (필수)
```env
RESEND_API_KEY=re_xxxxx               # Resend.com에서 발급
EMAIL_FROM="DVS Education <no-reply@yourdomain.com>"
```
> 📍 **[Resend.com](https://resend.com) > API Keys**에서 발급

#### Admin Dashboard (선택)
```env
ADMIN_URL=http://localhost:3002
NEXT_PUBLIC_ADMIN_URL=http://localhost:3002
```

#### 기타 설정 (선택)
```env
# 인증서 기능 활성화 여부
NEXT_PUBLIC_CERTIFICATE_ENABLED=false

# PDF 생성 기능 활성화 여부  
PDF_ENABLED=false

# JWT 설정 (Admin SSO용)
JWT_SECRET=your-secure-random-string-at-least-32-chars
COOKIE_DOMAIN=localhost
```

## 💻 개발 환경

### 시스템 요구사항
```json
{
  "node": ">=18.0.0 <21",
  "npm": ">=9.0.0",
  "git": ">=2.0.0"
}
```

### 현재 권장 버전
- **Node.js**: 20.11 LTS
- **npm**: 10.x
- **Git**: 최신 버전

### 개발 서버 포트
- **메인 앱**: 3000 (고정)
- **Admin Dashboard**: 3002 (선택)
- ⚠️ **3001, 3003 포트 사용 금지** (충돌 방지)

## 📦 설치 및 실행

### 1. 저장소 클론
```bash
git clone https://github.com/your-org/dvs-template01.git
cd dvs-template01
```

### 2. 의존성 설치
```bash
npm install

# 또는 pnpm 사용 시
pnpm install
```

### 3. 환경변수 설정
```bash
# .env.local 파일 생성 후 위의 환경변수들 입력
```

### 4. DB 마이그레이션
**Supabase Dashboard > SQL Editor**에서 순서대로 실행:

```sql
-- 1. 기본 테이블 생성
\i supabase/migrations/create_courses_tables.sql

-- 2. 등록 시스템
\i supabase/migrations/20250124_create_enrollment_tables.sql

-- 3. 스토리지 설정
\i supabase/migrations/20250124_create_storage_bucket.sql

-- 4. 비밀번호 인증 필드 (최신)
\i supabase/migrations/20250210_add_password_auth_fields.sql
```

### 5. 개발 서버 시작
```bash
npm run dev
```

### 6. 빌드 및 프로덕션
```bash
# 빌드
npm run build

# 프로덕션 서버
npm run start
```

## ✅ 환경 설정 체크리스트

### 🔧 초기 설정
- [ ] Node.js 18+ 설치 확인
- [ ] 프로젝트 클론 및 의존성 설치
- [ ] `.env.local` 파일 생성
- [ ] `.env.local`을 `.gitignore`에 추가 확인

### 🔑 서비스 계정 생성
- [ ] Supabase 프로젝트 생성
- [ ] Google Cloud Console OAuth 앱 생성
- [ ] Resend API 키 발급
- [ ] NextAuth Secret 생성 (`openssl rand -base64 32`)

### 🗄️ 데이터베이스 설정
- [ ] Supabase 마이그레이션 파일들 순서대로 실행
- [ ] Storage 버킷 생성 확인
  - [ ] `course-materials`
  - [ ] `profiles` 
  - [ ] `attachments`
- [ ] RLS (Row Level Security) 정책 활성화 확인

### 🔍 기능 검증
- [ ] 개발 서버 정상 실행 (http://localhost:3000)
- [ ] Google OAuth 로그인 테스트
- [ ] 비밀번호 설정/변경 기능 테스트
- [ ] 비밀번호 재설정 이메일 수신 테스트
- [ ] 파일 업로드/다운로드 테스트

## 🌍 환경별 설정

### 개발 환경 (Development)
```env
NODE_ENV=development
NEXTAUTH_URL=http://localhost:3000
# 개발용 API 키들 사용
```

### 스테이징 환경 (Staging)
```env
NODE_ENV=production
NEXTAUTH_URL=https://staging.yourdomain.com
# 스테이징용 별도 Supabase 프로젝트
```

### 프로덕션 환경 (Production)
```env
NODE_ENV=production
NEXTAUTH_URL=https://yourdomain.com
# 프로덕션용 API 키들
# 더 강력한 보안 설정 적용
```

## 🔒 보안 주의사항

### 환경변수 관리
- ✅ `.env.local`은 절대 커밋하지 않음
- ✅ `SUPABASE_SERVICE_ROLE_KEY`는 서버에서만 사용
- ✅ 프로덕션에서는 HTTPS 필수
- ✅ API 키는 주기적으로 순환

### Google OAuth 설정
```javascript
// Google Cloud Console에서 설정해야 할 리다이렉트 URI
Authorized redirect URIs:
- http://localhost:3000/api/auth/callback/google  (개발용)
- https://yourdomain.com/api/auth/callback/google (프로덕션)
```

### Supabase 보안
```sql
-- RLS 정책 예시
CREATE POLICY "Users can only see own data" ON user
  FOR SELECT USING (auth.uid() = id);
  
CREATE POLICY "Course owners can manage courses" ON courses
  FOR ALL USING (auth.uid() = instructor_id);
```

## 🚨 트러블슈팅

### 포트 충돌
```bash
# 포트 사용 중인 프로세스 확인
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :3000
kill -9 <PID>
```

### Supabase 연결 실패
**증상**: "Failed to connect to Supabase"
**해결책**:
1. Supabase 프로젝트 일시정지 여부 확인
2. API 키 재생성 및 교체
3. 네트워크 방화벽 확인

### Google OAuth 오류
**증상**: "OAuth error" 또는 redirect URI mismatch
**해결책**:
1. Google Cloud Console에서 OAuth 설정 확인
2. `NEXTAUTH_URL` 값 정확성 확인
3. 승인된 리다이렉트 URI 목록 확인

### 이메일 발송 실패
**증상**: 비밀번호 재설정 이메일이 오지 않음
**해결책**:
1. Resend API 키 유효성 확인
2. 발신자 도메인 검증 상태 확인
3. 스팸 폴더 확인
4. Resend Dashboard에서 전송 로그 확인

### 빌드 오류
```bash
# 타입 검사
npm run type-check

# 린트 검사
npm run lint

# 종속성 문제 해결
rm -rf node_modules package-lock.json
npm install
```

## 🔧 고급 설정

### 환경변수 검증
```typescript
// lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  GOOGLE_CLIENT_ID: z.string().min(1),
  NEXTAUTH_SECRET: z.string().min(32),
  RESEND_API_KEY: z.string().startsWith('re_'),
});

export const env = envSchema.parse(process.env);
```

### 개발 도구 설정
```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

### Docker 환경 (선택)
```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

## 📊 모니터링 설정

### 성능 모니터링
```typescript
// next.config.js
module.exports = {
  experimental: {
    instrumentationHook: true,
  },
  // Vercel Analytics
  analyticsId: process.env.VERCEL_ANALYTICS_ID,
};
```

### 에러 추적
```bash
# Sentry 설치 (선택)
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

## 📝 체크리스트 템플릿

새 환경 설정 시 사용:

```markdown
## 환경 설정 완료 체크리스트

### 기본 설정
- [ ] Node.js 18+ 설치
- [ ] 저장소 클론
- [ ] `npm install` 실행
- [ ] `.env.local` 생성

### 서비스 연동
- [ ] Supabase 프로젝트 생성
- [ ] Google OAuth 앱 생성
- [ ] Resend API 키 발급
- [ ] 환경변수 입력 완료

### 데이터베이스
- [ ] 마이그레이션 실행
- [ ] Storage 버킷 생성
- [ ] RLS 정책 확인

### 기능 테스트
- [ ] 로그인/로그아웃
- [ ] 파일 업로드
- [ ] 이메일 발송
- [ ] API 엔드포인트

### 배포 준비
- [ ] 빌드 성공
- [ ] 환경변수 보안 확인
- [ ] 모니터링 설정

배포일: ___________
담당자: ___________
```

---

**마지막 업데이트**: 2025-02-11  
**관리 팀**: 개발팀  
**지원 채널**: #dev-support