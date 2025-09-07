# DVS-TEMPLATE01

온라인 교육 플랫폼 (Next.js 14 + Supabase)

## 🏗️ 시스템 아키텍처

이 프로젝트는 두 개의 독립된 애플리케이션으로 구성됩니다:

### 1. 메인 애플리케이션 (이 저장소)
- **역할**: 학생 및 교사 플랫폼
- **포트**: 3000
- **기능**:
  - 학생 대시보드
  - 교사 대시보드
  - 코스 관리
  - 퀴즈 시스템
  - 과제 관리
  - 실시간 진도 추적

### 2. Admin 대시보드 (별도 저장소: dvs-admin)
- **역할**: 시스템 관리자 플랫폼
- **포트**: 3001
- **URL**: admin.yourdomain.com
- **기능**:
  - 사용자 관리
  - 시스템 분석
  - 플랫폼 설정
  - 감사 로그

## 🚀 Quick Start

```bash
# 메인 앱
npm install
npm run dev          # http://localhost:3000

# Admin 앱 (별도 저장소)
cd ../dvs-admin
npm install
npm run dev -- -p 3001  # http://localhost:3001
```

## 📋 주요 기능

- 교사/학생 대시보드
- 코스 관리 시스템
- 퀴즈 빌더 (9가지 문제 유형)
- 실시간 진도 추적
- 비디오 레슨
- 과제 관리

## 🛠 기술 스택

- **Frontend**: Next.js 14, React 18
- **Database**: Supabase (두 앱 공유)
- **Auth**: NextAuth.js (Google OAuth)
- **Styling**: Bootstrap 5, SCSS
- **State**: Redux + Context API

## 🔐 보안 아키텍처

### 인증 흐름
1. **메인 앱**: NextAuth.js (Google OAuth)
2. **Admin 리다이렉트**: SSR 기반, 화이트리스트 검증
3. **SSO 토큰**: 5분 만료, 1회용 (jti), POST 전송만 허용

### 데이터베이스 보안
- **Public Schema**: RLS 정책으로 역할별 접근 제어
- **Admin Schema**: 클라이언트 완전 차단, 서비스 롤만 접근
- **감사 로그**: 모든 관리자 작업 기록

### 보안 헤더
- CSP (Content Security Policy)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: 카메라/마이크/위치 비활성화

### 환경 변수 관리
- 서버 전용: `ADMIN_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- 클라이언트 허용: `NEXT_PUBLIC_*` 접두사만
- 절대 커밋 금지: `.env.local`

## 📁 프로젝트 구조

```
dvs-template01/         # 메인 앱
├── app/                # Next.js App Router
│   ├── (dashboard)/    # 역할별 대시보드
│   ├── lib/           # 서버 액션 및 유틸리티
│   └── api/           # API 라우트
├── components/         # React 컴포넌트
├── public/scss/       # SCSS 스타일 (CSS 직접 수정 금지!)
└── supabase/          # DB 마이그레이션
    └── migrations/    # SQL 마이그레이션 파일

dvs-admin/             # Admin 앱 (별도 저장소)
├── app/
├── components/
└── lib/
```

## 📝 환경 변수 설정

```env
# 메인 앱 (.env.local)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Admin 관련
ADMIN_URL=http://localhost:3001
NEXT_PUBLIC_ADMIN_URL=http://localhost:3001
JWT_SECRET=your-secure-random-string-at-least-32-chars

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## ⚠️ 프로덕션 체크리스트

- [ ] JWT 서명 구현 (jose 라이브러리)
- [ ] CSP에서 'unsafe-eval' 제거
- [ ] HTTPS 전용 쿠키 설정
- [ ] Rate Limiting 구현
- [ ] 감사 로그 모니터링
- [ ] 환경 변수 보안 검토
- [ ] RLS 정책 검증
- [ ] 백업 및 복구 전략

## 🔧 개발 가이드

자세한 내용은 [DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md) 참조

## 📝 라이센스

Private Repository
