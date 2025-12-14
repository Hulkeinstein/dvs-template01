---
title: "Dark Mode Header Flash - Work Note"
tags:
  - type/docs
  - topic/ui
  - ux/flash
created: 2025-12-14
updated: 2025-12-14
lifecycle: active
---

# Dark Mode Header Flash

**현상**  
다크 모드 쿠키가 설정된 사용자가 처음 페이지를 열면 헤더/로고가 잠시 라이트 테마로 보였다가 다크로 전환되는 플래시가 발생.

**원인**  
`context/Context.js`에서 `isLightTheme` 초기값이 `true`로 고정되어 최초 렌더를 라이트로 그린 뒤, `useEffect`에서 쿠키/로컬스토리지 값을 읽어 다크로 전환함. `mounted` 게이트 때문에 적용도 한 템포 늦어짐.

**해결 전략**  
- 초기 테마를 쿠키(`theme`), 로컬스토리지(`histudy-theme`), `document.documentElement`의 `data-theme`에서 즉시 읽어 설정한다.  
- 테마 적용 `useEffect`에서 `mounted` 게이트를 제거하고, 초기값이 정확하므로 바로 `body` 클래스/`data-theme`/쿠키/로컬스토리지를 동기화한다.

**제안 패치 요약 (`context/Context.js`)**
1) 초기값 헬퍼 추가
```js
const getInitialTheme = () => {
  if (typeof document === 'undefined') return true; // SSR 안전장치
  const cookieTheme = getCookie('theme');
  const storedTheme = localStorage?.getItem('histudy-theme') ?? null;
  const htmlTheme = document.documentElement.getAttribute('data-theme');
  if (cookieTheme === 'dark' || storedTheme === 'dark' || htmlTheme === 'dark') {
    return false; // dark
  }
  return true; // light
};
```

2) 상태 초기화 변경
```js
const [isLightTheme, setLightTheme] = useState(getInitialTheme);
```

3) 테마 적용 시 `mounted` 게이트 제거
```js
useEffect(() => {
  if (isLightTheme) {
    document.body.classList.remove('active-dark-mode');
    document.documentElement.setAttribute('data-theme', 'light');
    setCookie('theme', 'light');
    localStorage?.setItem('histudy-theme', 'light');
  } else {
    document.body.classList.add('active-dark-mode');
    document.documentElement.setAttribute('data-theme', 'dark');
    setCookie('theme', 'dark');
    localStorage?.setItem('histudy-theme', 'dark');
  }
}, [isLightTheme]);
```

**테스트 체크리스트**
- 쿠키 `theme=dark` 상태에서 새로고침 시 첫 렌더부터 다크 로고/헤더가 보이는지 확인.
- 라이트 모드에서도 초기 렌더 플래시가 없는지 확인.
- 테마 토글 시 쿠키/로컬스토리지/`data-theme`가 모두 동기화되는지 확인.

**영향 범위**
- `context/Context.js` 테마 초기화 및 적용 로직
- 헤더/로고 컴포넌트의 초기 렌더 상태 (다크/라이트 자산 로드)

**리스크/완화**
- SSR 환경에서 `document` 접근: 헬퍼에서 `typeof document === 'undefined'` 가드로 완화.
- 로컬스토리지 미가용 환경: 옵셔널 체이닝 사용.

**다음 단계**
- 위 패치를 적용 후 다크/라이트 전환 및 초기 렌더를 수동 QA로 검증.
- 필요한 경우 테마 관련 E2E 스냅샷/시각회귀 테스트 추가 고려.


---

## 💡 AI Review & Improved Strategy (2025-12-14)

기존 계획을 검토한 결과, 더 나은 해결 방법(Server-Side Prop Passing)이 확인되어 추가합니다. 기존 계획(클라이언트 감지)은 Hydration Mismatch 경고를 유발할 수 있습니다.

### 개선된 해결 전략 (SSR Prop Passing)

1. **원리**: `app/layout.tsx`에서 이미 읽은 쿠키 값(`theme`)을 `Providers`를 통해 `Context`까지 전달합니다.
2. **장점**: 서버가 렌더링한 초기 상태와 클라이언트의 초기 상태가 완벽히 일치하여 **깜빡임(Flash)이 전혀 없고**, Hydration Warning도 발생하지 않습니다.

### 구현 계획

#### 1. `app/Providers.js`
`initialTheme` prop을 받아 `Context`에 전달하도록 수정합니다.

```javascript
export default function Providers({ children, initialTheme }) {
  // ...
        <Context initialTheme={initialTheme}>{children}</Context>
  // ...
}
```

#### 2. `app/layout.tsx`
`Providers` 컴포넌트에 `theme` 값을 prop으로 전달합니다.

```tsx
// ...
const theme = cookies().get('theme')?.value || 'light';
// ...
<Providers initialTheme={theme}>{children}</Providers>
```

#### 3. `context/Context.js`
`initialTheme` prop을 받아 `useState`의 초기값으로 사용합니다.

```javascript
const Context = ({ children, initialTheme }) => {
  // initialTheme이 'dark'이면 false(dark), 아니면 true(light)
  // undefined일 경우(기타 페이지 등)를 대비해 기본값 true 설정
  const [isLightTheme, setLightTheme] = useState(initialTheme !== 'dark');

  // ...
```

---

## 🔍 Code Review (Claude Code - 2025-12-14)

### 현재 코드 상태 분석

**검토 파일**:
- `app/layout.tsx` (Server Component)
- `app/Providers.js` (Client Component)
- `context/Context.js` (Client Component)

### 발견된 문제

| 위치 | 현재 코드 | 문제 |
|------|----------|------|
| `layout.tsx:43-55` | 서버에서 쿠키 읽어 `data-theme`, `active-dark-mode` 설정 | ✅ 정상 |
| `Context.js:41` | `useState(true)` 하드코딩 | ❌ 서버와 불일치 |
| `Context.js:64` | `if (!mounted) return` 게이트 | ❌ 적용 지연 |

**문제 흐름**:
```
[서버] layout.tsx: <body class="active-dark-mode"> (다크 모드)
    ↓
[클라이언트] Context.js: isLightTheme = true (라이트 모드)
    ↓
[Hydration 후] useEffect → isLightTheme = false
    ↓
깜빡임 발생!
```

### 계획 평가

| 전략 | 판정 | 이유 |
|------|------|------|
| 기존 계획 (클라이언트 감지) | ⚠️ 비권장 | Hydration Mismatch 경고 유발 가능 |
| **개선된 계획 (SSR Prop Passing)** | ✅ 권장 | 서버/클라이언트 초기값 일치, 깜빡임 완전 제거 |

### 구현 체크리스트

- [ ] `app/layout.tsx`: `<Providers initialTheme={theme}>` 수정
- [ ] `app/Providers.js`: `initialTheme` prop 받아서 `Context`에 전달
- [ ] `context/Context.js`: `initialTheme` prop으로 `useState` 초기값 설정
- [ ] `context/Context.js`: `mounted` 게이트 제거 (초기값이 정확하므로 불필요)
- [ ] 테스트: 다크 모드 쿠키 설정 후 새로고침 시 깜빡임 없음 확인
- [ ] 테스트: 라이트 모드에서도 깜빡임 없음 확인

### 예상 수정량

```
app/layout.tsx      : 1줄 (prop 추가)
app/Providers.js    : 2줄 (prop 전달)
context/Context.js  : 3줄 (prop 받기, 초기값, mounted 게이트 제거)
총합                : ~6줄
```

### 최종 의견

**✅ "개선된 해결 전략 (SSR Prop Passing)" 승인**

이유:
1. `layout.tsx`에서 이미 쿠키를 읽고 있어 추가 로직 불필요
2. 서버/클라이언트 초기값 일치로 Hydration Warning 방지
3. 구현 복잡도 낮음 (~6줄)
4. 테스트 용이 (수동 QA로 충분)

**추가 권장사항**:
- `Context.js`의 `mounted` 상태와 관련 useEffect 정리 고려
- 향후 테마 관련 로직이 늘어나면 별도 `ThemeContext` 분리 고려
