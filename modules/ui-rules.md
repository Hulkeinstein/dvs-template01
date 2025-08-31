# UI 개발 규칙

## 핵심 원칙
- **템플릿 UI를 반드시 유지하고 사용하세요** - 기존 UI 컴포넌트와 스타일을 그대로 활용
- **모든 기능을 완전히 구현하세요** - UI에 있는 모든 버튼, 입력 필드, 기능을 작동하도록 구현
- **절대 UI 요소를 삭제하지 마세요** - 사용자의 명시적 지시 없이는 어떤 UI 요소도 제거 금지
- **기존 템플릿의 디자인 패턴을 따르세요** - 새로운 기능 추가 시에도 템플릿의 스타일 가이드 준수
- **하드코딩된 데이터는 동적으로 변경하되, UI 구조는 유지하세요**

## 언어 선호
- 사용자는 한국인이므로 모든 대화는 한국어로 진행하세요
- 기술 용어나 코드 관련 용어는 영어를 그대로 사용해도 됩니다
- 설명과 응답은 한국어로 작성하세요

## 🎨 스타일 파일 수정 가이드라인

### ✅ 수정 가능한 파일
- **app/globals.css** - 전역 스타일 엔트리 포인트 (소스 파일)
  - Tailwind 지시문 (@tailwind base/components/utilities)
  - CSS 변수 정의 (:root, .dark)
  - 커스텀 유틸리티 클래스
  - 런타임 테마는 CSS 변수로 관리 (Tailwind와 호환)

### ❌ 수정 금지 파일
- **/public/css/\*\*.css** - SCSS 컴파일 결과물 (자동 생성)
- **산출물 CSS** - SCSS에서 생성된 모든 CSS 파일

### 스타일 관리 원칙
1. **globals.css 수정 OK** - app/layout.tsx에서 import하는 소스 파일
2. **CSS 변수 우선** - 런타임 테마는 CSS 변수로 관리 (Tailwind와 호환)
3. **SCSS 소스 수정** - /public/scss/ 폴더의 SCSS 파일만 수정
4. **컴파일된 CSS 수정 금지** - 빌드 시 자동 생성되므로 직접 수정 금지

### 수정 체크리스트
- [ ] app/layout.tsx에서 `import "./globals.css"` 확인
- [ ] 파일 내 `@tailwind base; components; utilities;` 존재 확인
- [ ] :root/.dark 변수 토큰 정의 (배경, 전경, 보더, 카드 등)
- [ ] (선택) globals.scss로 전환 시 import 경로 수정

## 🏢 현업 표준 테이블 정렬 가이드

### 테이블 헤더 정렬 원칙 (UX 모범사례)
현업에서 널리 사용되는 데이터 타입별 최적화된 정렬:

- **텍스트 데이터**: `text-start` (좌측 정렬)
  - 예: Assignment Name, Course Name, Student Name, Due Date
- **숫자/점수 데이터**: `text-end` (우측 정렬) 
  - 예: Total Marks, Score, Price - 숫자 비교가 용이함
- **카운트/상태 데이터**: `text-center` (가운데 정렬)
  - 예: Total Submit, Status Badge, Progress
- **액션 버튼**: `text-center` (가운데 정렬)
  - 예: Edit, Delete, View 버튼

### 구현 방법
```tsx
// 1. 테이블에 정렬 시스템 활성화
<table className="rbt-table table table-borderless table-header-align">

// 2. 각 헤더에 적절한 정렬 클래스 적용
<thead>
  <tr>
    <th className="text-start">Assignment Name</th>    {/* 텍스트 */}
    <th className="text-end">Total Marks</th>         {/* 숫자 */}
    <th className="text-center">Total Submit</th>     {/* 카운트 */}
    <th className="text-start">Due Date</th>          {/* 날짜 */}
    <th className="text-center"></th>                 {/* 액션 */}
  </tr>
</thead>
```

### 참고 사례
- **Google Admin Console**: 숫자는 우측, 텍스트는 좌측, 액션은 가운데
- **AWS Management Console**: 동일한 패턴 사용
- **Stripe Dashboard**: 금액은 우측, 상태는 가운데 정렬

## 중요 사항
- 개발 서버가 이미 3000번 포트에서 실행 중입니다. 새 개발 서버를 시작하지 마세요.
- 서버를 재시작해야 하는 경우, 먼저 사용자에게 물어보세요.
- 커밋할 때는 항상 lint와 typecheck 명령어를 먼저 실행하세요 (사용 가능한 경우).