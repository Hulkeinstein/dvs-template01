# Hybrid Authentication Implementation Plan

**Date:** 2025-12-15
**Status:** Planning
**Goal:** Enable Email/Password login for Google-authenticated users while maintaining Google-first registration.

## Goal Description
Allow users who have initially authenticated via Google to set a password and subsequently log in using Email/Password.
**Constraint**: Initial account creation must still happen via Google (enforced by "Set Password" requiring an active session).

## Proposed Changes

### Authentication Configuration
#### `app/api/auth/[...nextauth]/auth.config.ts`
- Add a production `CredentialsProvider`.
- Implement `authorize` function:
    - Fetch user from Supabase 'user' table.
    - Verify `password_hash` using `bcrypt.compare`.
    - Return user object on success.

### User Interface
#### `components/Login/Login.js`
- Add an "Email/Password Login" form section below or beside the Google button.
- Use `signIn('credentials', ...)` for the form submission.
- Maintain existing styling (input fields, buttons) to match project theme.

### Backend/Database
- **Existing**: `passwordActions.ts` already implements `setPassword` and `validatePassword`.
- **Existing**: `Settings.tsx` already implements the UI to call these actions.
- **No Changes Needed** for backend actions.

## Verification Plan

### Manual Verification
1.  **Setup**:
    - Login with Google (if not already).
    - Go to Settings -> Password tab.
    - Set a new password.
2.  **Login Test**:
    - Logout.
    - Use the NEW Email/Password form on the login page.
    - Enter Google email and the new password.
    - Verify successful login.
3.  **Constraint Check**:
    - Try to register a NEW account via the password form (should fail as registration logic is absent in `authorize`).

---

# Claude Code 보완 계획 (프로젝트 원칙 준수)

**Status:** Active
**Created:** 2025-12-15
**Last Updated:** 2025-12-15 19:00
**복잡도:** Standard
**예상 시간:** 2-3h

## Overview

목표: Google OAuth 사용자가 이메일/비밀번호로도 로그인할 수 있도록 하이브리드 인증 구현

## 현재 상태 분석

### 이미 구현된 것 ✅
| 항목 | 파일 | 상태 |
|------|------|------|
| Password Actions | `app/lib/actions/passwordActions.ts` | ✅ 6개 함수 완료 |
| Settings 비밀번호 탭 | `components/Student/Settings.tsx` | ✅ 3가지 상태 UI |
| User 테이블 스키마 | `password_hash`, `auth_provider` 등 | ✅ 마이그레이션 완료 |
| 비밀번호 재설정 페이지 | `app/(auth)/reset-password/page.tsx` | ✅ 완료 |
| Test CredentialsProvider | `auth.config.ts` | ✅ 테스트용만 |

### 누락된 것 ❌
| 항목 | 필요 작업 |
|------|----------|
| 프로덕션 CredentialsProvider | `auth.config.ts`에 추가 필요 |
| Login.js → Login.tsx | TypeScript 변환 필수 |
| Forgot Password 페이지 | `app/(auth)/forgot-password/page.tsx` 생성 필요 |
| 이메일 로그인 폼 | Login 컴포넌트에 추가 필요 |

## 원칙 위반 분석

| 원칙 | Antigravity 계획 | 수정 방향 |
|------|------------------|----------|
| TypeScript Migration | `Login.js` 수정 | `Login.tsx`로 변환 필수 |
| Work Plan 형식 | Phases 없음 | Phases 체크리스트 추가 |
| 완전성 | Forgot Password 누락 | 페이지 생성 추가 |

## Phases

- [ ] P0: Setup - 현재 상태 확인, 브랜치 생성
- [ ] P1: CredentialsProvider - 프로덕션용 자격증명 제공자 추가
- [ ] P2: Login Component - Login.js → Login.tsx 변환 + 이메일 폼 추가
- [ ] P3: Forgot Password - 비밀번호 찾기 페이지 생성
- [ ] P4: Verification - 테스트 및 검증

## 상세 변경사항

### P1: CredentialsProvider 추가

#### `app/api/auth/[...nextauth]/auth.config.ts`
```typescript
// 기존 테스트용 CredentialsProvider 아래에 추가
CredentialsProvider({
  id: 'credentials',
  name: 'Email',
  credentials: {
    email: { label: 'Email', type: 'email' },
    password: { label: 'Password', type: 'password' }
  },
  async authorize(credentials) {
    if (!credentials?.email || !credentials?.password) {
      return null;
    }

    const supabase = await createClient();
    const { data: user } = await supabase
      .from('user')
      .select('id, email, name, role, password_hash, auth_provider')
      .eq('email', credentials.email)
      .single();

    if (!user || !user.password_hash) {
      return null; // 비밀번호 미설정 사용자
    }

    const isValid = await bcrypt.compare(credentials.password, user.password_hash);
    if (!isValid) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    };
  }
})
```

### P2: Login Component 변환

#### `components/Login/Login.js` → `Login.tsx`
- TypeScript 변환
- 이메일/비밀번호 폼 추가
- 구분선으로 Google/Email 선택

**스타일 원칙 준수:**
- 기존 HiStudy 템플릿 클래스 재사용
- `public/scss/` 수정 금지 (템플릿 원본)
- 필요시 `public/scss/custom/` 또는 인라인이 아닌 별도 SCSS 파일
- WCAG AA: 터치 타겟 44px 이상, 대비 4.5:1
- 모바일 우선 반응형

**사용할 기존 클래스:**
```
.rbt-contact-form        - 폼 컨테이너
.contact-form-style-1    - 폼 스타일
.rbt-btn                 - 버튼 기본
.btn-md                  - 버튼 크기
.btn-gradient            - 그라데이션 버튼
.hover-icon-reverse      - 호버 효과
.form-group              - 폼 그룹
.rbt-modern-select       - 입력 필드
```

**UI 구조:**
```
┌─────────────────────────────────┐
│  [Google로 시작하기]             │  ← 기존 (Primary)
│                                 │
│  ───────── 또는 ─────────       │  ← 구분선 (Bootstrap divider)
│                                 │
│  이메일                          │
│  [________________________]     │  ← input[type="email"]
│                                 │
│  비밀번호                        │
│  [________________________]     │  ← input[type="password"]
│                                 │
│  [이메일로 로그인]               │  ← Secondary 버튼
│                                 │
│  비밀번호를 잊으셨나요?          │  ← Link to forgot-password
└─────────────────────────────────┘
```

**코드 예시:**
```tsx
// 추가할 상태
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState('');

// 이메일 로그인 핸들러
const handleEmailLogin = async (e: FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  setError('');

  const result = await signIn('credentials', {
    email,
    password,
    redirect: false
  });

  if (result?.error) {
    setError('이메일 또는 비밀번호가 올바르지 않습니다.');
  } else {
    router.push('/');
  }
  setIsLoading(false);
};
```

**JSX 추가:**
```tsx
{/* 구분선 */}
<div className="d-flex align-items-center my-4">
  <hr className="flex-grow-1" />
  <span className="px-3 text-muted">또는</span>
  <hr className="flex-grow-1" />
</div>

{/* 이메일 로그인 폼 */}
<form onSubmit={handleEmailLogin}>
  {error && (
    <div className="alert alert-danger mb-3" role="alert">
      {error}
    </div>
  )}

  <div className="form-group mb-3">
    <label htmlFor="email" className="form-label">이메일</label>
    <input
      type="email"
      id="email"
      className="form-control"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      placeholder="example@email.com"
      required
    />
  </div>

  <div className="form-group mb-3">
    <label htmlFor="password" className="form-label">비밀번호</label>
    <input
      type="password"
      id="password"
      className="form-control"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      placeholder="비밀번호 입력"
      required
    />
  </div>

  <button
    type="submit"
    className="rbt-btn btn-md btn-border hover-icon-reverse w-100"
    disabled={isLoading}
  >
    <span className="icon-reverse-wrapper">
      <span className="btn-text">
        {isLoading ? '로그인 중...' : '이메일로 로그인'}
      </span>
      <span className="btn-icon"><i className="feather-arrow-right"></i></span>
      <span className="btn-icon"><i className="feather-arrow-right"></i></span>
    </span>
  </button>

  <div className="text-center mt-3">
    <Link href="/forgot-password" className="rbt-btn-link">
      비밀번호를 잊으셨나요?
    </Link>
  </div>
</form>
```

### P3: Forgot Password 페이지

#### `app/(auth)/forgot-password/page.tsx` (신규 생성)
- 이메일 입력 폼
- `requestPasswordReset(email)` 호출
- 성공 메시지 표시

**스타일 원칙 준수:**
- 기존 `reset-password/page.tsx` 스타일 패턴 참조
- HiStudy 템플릿 클래스 재사용
- 반응형 레이아웃 (모바일 우선)

**UI 구조:**
```
┌─────────────────────────────────┐
│  비밀번호 찾기                   │
│                                 │
│  가입하신 이메일 주소를 입력하세요. │
│  비밀번호 재설정 링크를 보내드립니다.│
│                                 │
│  이메일                          │
│  [________________________]     │
│                                 │
│  [재설정 링크 보내기]            │
│                                 │
│  로그인으로 돌아가기             │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  ✅ 이메일 전송 완료             │  ← 성공 상태
│                                 │
│  입력하신 이메일로 비밀번호 재설정 │
│  링크를 보내드렸습니다.          │
│                                 │
│  [로그인으로 돌아가기]           │
└─────────────────────────────────┘
```

**참고 파일:**
- `app/(auth)/reset-password/page.tsx` - 레이아웃/스타일 참조
- `app/lib/actions/passwordActions.ts` - `requestPasswordReset()` 함수

### P4: Verification

1. **Google 로그인 → 비밀번호 설정**
   - Settings에서 비밀번호 추가
   - `auth_provider`가 `'both'`로 변경 확인

2. **이메일 로그인 테스트**
   - 로그아웃 후 이메일/비밀번호로 로그인
   - 정상 세션 생성 확인

3. **비밀번호 찾기 테스트**
   - 이메일 전송 확인
   - 토큰 링크로 비밀번호 재설정

4. **빌드 확인**
   ```bash
   npm run typecheck && npm run build
   ```

## 수정 파일 목록

| 파일 | 작업 |
|------|------|
| `app/api/auth/[...nextauth]/auth.config.ts` | CredentialsProvider 추가 |
| `components/Login/Login.js` → `Login.tsx` | TypeScript 변환 + 이메일 폼 |
| `app/(auth)/forgot-password/page.tsx` | 신규 생성 |

## 보안 고려사항

- ✅ bcrypt 비밀번호 해싱 (saltRounds=10)
- ✅ 사용자 열거 방지 (동일 메시지 반환)
- ✅ 토큰 만료 (30분)
- ⚠️ 세션 무효화 (TODO - 비밀번호 재설정 후)

## Progress Log

### 2025-12-15 - Planning
- Antigravity 계획 검토
- 현재 구현 상태 분석 완료
- 누락 사항 식별: Forgot Password 페이지, Login.tsx 변환
- 프로젝트 원칙 준수 계획 작성

---

# Claude Code 보완 계획 (TestSprite 피드백)

**Status:** Planned
**Created:** 2025-12-15
**Goal:** 해결되지 않은 TestSprite 리포트의 이슈(내비게이션, React 경고) 해결

## TestSprite 리포트 분석

### 발견된 문제
1.  **Settings 내비게이션 오류 (Critical)**
    - 증상: 사이드바의 'Settings' 링크 클릭 시 'Order History' 페이지로 리다이렉트됨.
    - 원인 추정: `sidebar-items.json`의 키 매핑 오류 또는 `roleRoutes.ts`의 `resolveUrl` 로직 확인 필요.
    - 영향: 사용자가 비밀번호 설정 페이지(`/student-settings`)에 접근할 수 없어 하이브리드 인증 흐름이 차단됨.

2.  **React Warning (Improvement)**
    - 증상: `CourseFilterOneToggle.tsx`에서 "Maximum update depth exceeded" 경고 발생.
    - 원인: `useEffect`의 의존성 배열에 `courses` 등이 포함되어 있어 무한 렌더링 루프 발생 가능성.
    - 영향: 잠재적인 성능 저하 및 브라우저 크래시 위험.

## 상세 해결 계획

### P5: Settings Navigation 수정

#### 1. 데이터 소스 확인
- **Target:** `components/Student/StudentDashboardSidebar.tsx`가 참조하는 `data/dashboard/sidebar-items.json`
- **Action:** `sidebar-items.json`에서 Settings 항목의 `key`가 올바르게 설정되어 있는지 확인 (오타 확인).

#### 2. 라우팅 로직 검증
- **Target:** `app/lib/utils/roleRoutes.ts`
- **Action:** `resolveUrl` 함수에서 `case 'settings':`가 정확히 `getSettingsUrl(role)`을 호출하고, 이 함수가 `/student-settings`를 반환하는지 재확인.

#### 3. 수정 및 검증
- `key`나 라우팅 로직 중 잘못된 부분을 수정.
- 수정 후 로컬 환경에서 사이드바 링크 클릭 테스트.

### P6: React Warning 수정

#### 1. 문제 코드 분석
- **Target:** `components/Category/CategoryProps/CourseFilterOneToggle.tsx` (위치 추정, 파일 찾기 필요)
- **Action:** `useEffect` 훅을 찾아 의존성 배열(`dependency array`) 분석.

#### 2. 의존성 최적화
- **Solution:**
    - 객체나 배열을 의존성으로 직접 사용하는 대신, `JSON.stringify`된 값이나 길이(`length`)를 사용.
    - 또는 `useMemo`나 `useCallback`을 사용하여 참조 안정성 확보.
    - 불필요한 의존성 제거.

### Verification (P5 & P6)
- **Settings Link:** `/student-settings` 페이지로 정상 이동 확인.
- **Console Log:** 브라우저 콘솔에서 "Maximum update depth exceeded" 경고가 사라졌는지 확인.

---

# Claude Code 검증 결과 (P5 & P6 타당성 분석)

**Status:** Verified
**Created:** 2025-12-15
**Verified by:** Claude Code

## P5: Settings Navigation - ⚠️ 코드 정상, 추가 조사 필요

### 검증 결과

| 파일 | 검증 항목 | 결과 |
|------|----------|------|
| `data/dashboard/sidebar-items.json:78` | `"key": "settings"` | ✅ 올바름 |
| `app/lib/utils/roleRoutes.ts:197-198` | `case 'settings': return getSettingsUrl(role)` | ✅ 올바름 |
| `app/lib/utils/roleRoutes.ts:48-60` | `getSettingsUrl()` → `/student-settings` 반환 | ✅ 올바름 |

### 분석

**코드 자체는 정상입니다.** TestSprite가 보고한 "Order History로 리다이렉트" 문제의 가능한 원인:

1. **사이드바 컴포넌트 문제**: `StudentDashboardSidebar.tsx`에서 `resolveUrl`을 올바르게 호출하지 않을 가능성
2. **role prop 미전달**: `role`이 `undefined`로 전달되어 예기치 않은 fallback 발생
3. **TestSprite 환경 특수 상황**: 세션 없는 상태에서 테스트 실행

### 권장 액션

- `StudentDashboardSidebar.tsx`에서 `role` prop 전달 확인 필요
- 실제 로컬 환경에서 Settings 링크 클릭 테스트로 재현 여부 확인
- **우선순위**: High (하이브리드 인증 흐름 차단 가능성)

---

## P6: React Warning - ✅ 타당, 간단 수정 가능

### 검증 결과

**파일 위치 정정**: `components/Category/Filter/CourseFilterOneToggle.tsx` (계획의 `CategoryProps` 아님)

**문제 코드 (`CourseFilterOneToggle.tsx:38-40`):**
```typescript
useEffect(() => {
  setTotalPages(Math.ceil(course.length / 6));
}, [course]); // ⚠️ 배열 참조 비교 문제
```

### 분석

- `course`는 배열이므로 **참조가 변경될 때마다** effect 실행
- 부모 컴포넌트 리렌더링 시 새 배열 참조 생성 → 불필요한 리렌더링
- 현재 코드는 `setTotalPages`만 호출하므로 **무한 루프 가능성은 낮음**
- "Maximum update depth exceeded" 경고는 다른 컴포넌트에서 발생했을 수 있음

### 권장 수정

```typescript
useEffect(() => {
  setTotalPages(Math.ceil(course.length / 6));
}, [course.length]); // ✅ primitive 값으로 변경
```

### 우선순위: Low
- 성능 개선 목적
- 즉각적인 기능 문제 없음

---

## 최종 판단 요약

| 항목 | 타당성 | 우선순위 | 권장 액션 |
|------|--------|----------|----------|
| P5: Settings Navigation | ⚠️ 부분적 | High | 사이드바 컴포넌트 추가 조사 |
| P6: React Warning | ✅ 타당 | Low | `course.length`로 수정 |

**결론**: 계획 방향은 올바르지만, P5는 코드가 정상이므로 실제 문제 원인 추가 조사 필요. P6는 간단한 한 줄 수정으로 해결 가능.
