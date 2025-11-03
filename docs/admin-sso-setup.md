---
title: "Admin 앱 SSO 설정 가이드"
tags:
  - phase/2
  - type/docs
  - component/auth
  - external/nextauth
  - status/completed
created: 2025-09-07
updated: 2025-11-03
status: active
category: guide
related:
  - external-services/mcp.md
---

# Admin 앱 SSO 설정 가이드

이 문서는 별도의 Admin 프로젝트(dvs-admin)를 생성하여 메인 앱과 SSO로 연동하는 방법을 설명합니다.

## 1. Admin 프로젝트 생성

```bash
# 별도 폴더에서
npx create-next-app@latest dvs-admin --typescript --tailwind --app
cd dvs-admin
npm install jose
```

## 2. 환경변수 설정 (.env.local)

```env
# SSO JWT 검증용 공개키 (메인 앱에서 생성한 키)
ADMIN_JWT_PUBLIC_KEY_B64=LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUlJQklqQU5CZ2txaGtpRzl3MEJBUUVGQUFPQ0FROEFNSUlCQ2dLQ0FRRUEwWnphVGQzRlpPL0hFVlF5OGN0YgpCRFZEeFNBUHpiSEVsVUFCbFVsNzZFb3hBS3ZwZW1CTmp3bnBiOVEveXk0WHo0SVRTRlNKNkpwVUQvRFV0WW1HClhzeSt6YjRCbTJ0RmlFYTJYQk5RYXZmYUNjK05Wei9lUml5dk5QbkVUWHNvb2xxMmh3TEZ0MGhwSnJYL2VZL0QKNEw4R2dqbTN1MlROZVZpQUdPYWZ3UE0xZFZkSnNwMHpEWmNFK0kzekpYN25SNDdIYTBvNm5OKy9ISGZhWlVieQpyVjFZVW9SazJYQTJxUk1jelZneGlIOHpNemR6ZlRzS2lUSVVYYzhYOHNmYUhPUzUxTnZjT3Z5YTc4d1U2SEZmCkFQWFd6aWpWZUdYUDJqbGJoSlpmL1o1aXlHN2x1NnlBMTVnRWNrMGwySTVZcHhrWjJoQmtZYk1FY1hBbXc5ZmEKMFFJREFRQUIKLS0tLS1FTkQgUFVCTElDIEtFWS0tLS0tCg==

# NextAuth 설정
NEXTAUTH_URL=http://localhost:3002
NEXTAUTH_SECRET=your-admin-app-secret-32-chars-minimum

# 메인 앱 URL
MAIN_APP_URL=http://localhost:3000

# Supabase (메인 앱과 동일)
NEXT_PUBLIC_SUPABASE_URL=https://datvqaemqzhgitxxfvar.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<메인 앱과 동일한 SERVICE_ROLE_KEY>
```

## 3. JWT 검증 유틸리티

### `app/lib/auth/verify.ts`

```typescript
import { jwtVerify, importSPKI } from 'jose';

interface SSOPayload {
  sub: string;
  email: string;
  role: string;
  name?: string;
  jti: string;
  iss: string;
  aud: string;
  exp: number;
  iat: number;
}

/**
 * SSO 토큰 검증
 */
export async function verifyAdminSSOCode(code: string): Promise<SSOPayload> {
  const publicKeyB64 = process.env.ADMIN_JWT_PUBLIC_KEY_B64;
  if (!publicKeyB64) {
    throw new Error('ADMIN_JWT_PUBLIC_KEY_B64 not configured');
  }

  // Base64 → PEM 변환
  const publicKeyPem = Buffer.from(publicKeyB64, 'base64').toString('utf-8');
  
  // jose 라이브러리용 키 import
  const publicKey = await importSPKI(publicKeyPem, 'RS256');

  // JWT 검증
  const { payload } = await jwtVerify(code, publicKey, {
    issuer: 'dvs-template01',
    audience: 'dvs-admin',
  });

  return payload as SSOPayload;
}

// JTI 중복 체크 (메모리 저장 - 개발용)
const usedTokens = new Set<string>();

export function markTokenAsUsed(jti: string) {
  if (usedTokens.has(jti)) {
    throw new Error('Token already used');
  }
  usedTokens.add(jti);
  
  // 10분 후 자동 삭제
  setTimeout(() => usedTokens.delete(jti), 10 * 60 * 1000);
}
```

## 4. SSO Receive 엔드포인트

### `app/api/auth/sso/receive/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAdminSSOCode, markTokenAsUsed } from '@/app/lib/auth/verify';

export async function POST(request: NextRequest) {
  try {
    // POST body에서 코드와 목적지 추출
    const formData = await request.formData();
    const code = formData.get('code') as string;
    const to = formData.get('to') as string || '/admin-dashboard';

    if (!code) {
      return NextResponse.json({ error: 'Missing code' }, { status: 400 });
    }

    // JWT 검증
    const payload = await verifyAdminSSOCode(code);
    
    // JTI 중복 체크
    markTokenAsUsed(payload.jti);

    // 세션 생성 (간단한 쿠키 방식)
    const sessionData = {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      name: payload.name,
      loginAt: new Date().toISOString(),
    };

    cookies().set('admin-session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24시간
      path: '/',
    });

    // 목적지로 리다이렉트
    return NextResponse.redirect(new URL(to, request.url));

  } catch (error) {
    console.error('SSO verification failed:', error);
    return NextResponse.redirect(
      new URL('/auth/error?error=sso_failed', request.url)
    );
  }
}

// GET 요청은 거부 (보안)
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST.' },
    { status: 405 }
  );
}
```

## 5. 미들웨어 설정

### `middleware.ts`

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 보호된 경로
const protectedPaths = ['/admin-dashboard', '/api/admin'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 보호된 경로 확인
  const isProtectedPath = protectedPaths.some(path => 
    pathname.startsWith(path)
  );

  if (isProtectedPath) {
    // 세션 확인
    const session = request.cookies.get('admin-session');
    
    if (!session) {
      // 메인 앱 SSO로 리다이렉트
      const mainAppUrl = process.env.MAIN_APP_URL || 'http://localhost:3000';
      const currentUrl = request.url;
      
      const ssoUrl = new URL('/auth/sso/start', mainAppUrl);
      ssoUrl.searchParams.set('return', `${new URL(request.url).origin}/api/auth/sso/receive`);
      ssoUrl.searchParams.set('to', pathname);
      
      return NextResponse.redirect(ssoUrl);
    }
    
    // 세션 검증 (선택사항)
    try {
      const sessionData = JSON.parse(session.value);
      if (sessionData.role !== 'admin') {
        return NextResponse.redirect(new URL('/auth/unauthorized', request.url));
      }
    } catch {
      return NextResponse.redirect(new URL('/auth/error', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|auth/sso).*)',
  ],
};
```

## 6. Admin 대시보드 페이지

### `app/admin-dashboard/page.tsx`

```typescript
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

interface SessionData {
  userId: string;
  email: string;
  role: string;
  name?: string;
  loginAt: string;
}

async function getSession(): Promise<SessionData | null> {
  const sessionCookie = cookies().get('admin-session');
  if (!sessionCookie) return null;
  
  try {
    return JSON.parse(sessionCookie.value);
  } catch {
    return null;
  }
}

export default async function AdminDashboard() {
  const session = await getSession();
  
  if (!session) {
    redirect('/auth/login');
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">환영합니다!</h2>
          <div className="space-y-2">
            <p><strong>이름:</strong> {session.name || session.email}</p>
            <p><strong>이메일:</strong> {session.email}</p>
            <p><strong>역할:</strong> {session.role}</p>
            <p><strong>로그인 시간:</strong> {new Date(session.loginAt).toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">관리 메뉴</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 bg-blue-500 text-white rounded hover:bg-blue-600">
              사용자 관리
            </button>
            <button className="p-4 bg-green-500 text-white rounded hover:bg-green-600">
              코스 관리
            </button>
            <button className="p-4 bg-purple-500 text-white rounded hover:bg-purple-600">
              시스템 설정
            </button>
          </div>
        </div>

        <div className="mt-8">
          <a 
            href="/api/auth/logout"
            className="inline-block px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            로그아웃
          </a>
        </div>
      </div>
    </div>
  );
}
```

## 7. 로그아웃 엔드포인트

### `app/api/auth/logout/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  // 세션 쿠키 삭제
  cookies().delete('admin-session');
  
  // 메인 앱으로 리다이렉트
  const mainAppUrl = process.env.MAIN_APP_URL || 'http://localhost:3000';
  return NextResponse.redirect(`${mainAppUrl}/dashboard`);
}
```

## 8. 테스트 방법

1. **Admin 프로젝트 실행**
```bash
cd dvs-admin
npm run dev -- -p 3002
```

2. **메인 앱 실행** (별도 터미널)
```bash
cd DVS-TEMPLATE01
npm run dev
```

3. **SSO 플로우 테스트**
- http://localhost:3002/admin-dashboard 접속
- 자동으로 메인 앱 로그인 페이지로 리다이렉트
- Admin 계정으로 로그인
- 자동으로 Admin 대시보드로 리다이렉트

## 9. 보안 체크리스트

- ✅ RS256 서명 (비대칭 키)
- ✅ JTI로 1회용 토큰 보장
- ✅ 10분 짧은 만료 시간
- ✅ POST body로 토큰 전달
- ✅ HttpOnly 쿠키 사용
- ✅ CSRF 방지 (SameSite)
- ⚠️ 프로덕션에서는 HTTPS 필수
- ⚠️ 프로덕션에서는 Redis/DB로 JTI 관리

## 10. 트러블슈팅

### "Token already used" 에러
- JTI 중복 체크가 작동 중
- 새로고침이나 뒤로가기 방지됨
- 정상적인 동작

### "Invalid signature" 에러
- 공개키가 올바른지 확인
- Base64 인코딩이 정확한지 확인
- 메인 앱과 Admin 앱의 키 쌍이 일치하는지 확인

### 무한 리다이렉트
- 미들웨어 matcher 설정 확인
- `/api/auth/sso/receive` 경로 제외 확인
- 쿠키 설정 확인