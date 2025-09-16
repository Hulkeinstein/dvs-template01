# Development Guide (Solo AI Dev OS)

## 필수 개발 명령어

### 기본 명령어

```bash
# npm
npm run dev         # 개발 서버 시작(3000 고정)
npm run build       # 프로덕션 빌드
npm run start       # 프로덕션 서버 시작

# pnpm (선호 시)
pnpm dev
pnpm build
pnpm start
```

### ⚠️ 서버/포트 운영 규칙

* **개발 서버는 항상 포트 3000**
* **사람(개발자)만** 서버를 시작/재시작 가능. **AI 에이전트(Claude Code 등)는 서버 제어 금지**
* 포트 충돌 시 기존 프로세스 종료 후 **3000** 사용

### 코드 품질 (커밋 전 필수)

```bash
# npm
npm run lint         # ESLint 검사
npm run format       # Prettier 포맷팅
npm run format:check # 포맷팅 체크만
npm run typecheck    # TypeScript 타입 체크

# pnpm
pnpm lint
pnpm format
pnpm format:check
pnpm typecheck
```

---

## 🎯 트랙 분기 (작업 시작 전 결정)

### Lite Track (1시간 이내)
* **예**: 텍스트 수정, 스타일 조정, 간단한 버그 픽스
* **프로세스**: 바로 코딩 → `lint && format` → 커밋/PR
* **리뷰**: 셀프 검수 → 머지

### Standard Track (1~4시간)
* **예**: 컴포넌트 추가, API 연동, 일반 기능 구현
* **프로세스**: DoR 체크 → 코딩 → 로컬 테스트 → `typecheck && lint && build` → PR
* **리뷰**: AI 검수 + 기능 테스트 → 머지

### Risky Track (4시간+)
* **예**: 인증/결제, DB 마이그레이션, 성능 최적화, 보안(결제/권한/마이그레이션)
* **프로세스**: Standard + **스파이크(POC)** 선행, **피처 플래그**와 **롤백 플랜/백업** 필수
* 보안/개인정보 체크리스트 통과

**빠른 승격 기준(아래 중 1개라도 Yes면 Standard 이상)**
* 라우팅/SEO/i18n 영향? 외부 API/결제/인증/권한/업로드?
* DB 스키마 변경/마이그레이션? 성능/보안 리스크?

---

## Kanban + PDCA(솔로 최적)

* **보드 열**: `Backlog / Doing / Review(AI/자기검수) / Verify(게이트) / Done`
* **WIP=1~2** 유지, 카드 크기는 "한 PR 분량"
* **PDCA(작업마다 1회)**: Plan(수용기준·테스트 초안) → Do(구현) → Check(로컬 검증) → Act(리팩터/문서화)

---

## DoR / DoD 템플릿

**DoR(Definition of Ready)**
```
Story: <무엇/왜>
Acceptance(3~5):
- [ ] …
Impact: <폴더/모듈>
Risk/Edge: <1가지>
Test Plan: <유닛/e2e 2~3개>
```

**DoD(Definition of Done)**
```
- [ ] pnpm typecheck && pnpm lint && pnpm build 통과
- [ ] 접근성 기본 체크 (키보드/스크린리더 가능)
- [ ] 브라우저 콘솔 에러 없음
- [ ] 모바일/데스크톱 반응형 확인
- [ ] PR 설명 작성 (변경 이유, 스크린샷)
- [ ] Risks & Rollback 계획 확인
```

---

## PR 템플릿 (요약)

```markdown
## Summary
<1-2줄 핵심 변경사항>

## Changes
- [ ] Feature: <새 기능>
- [ ] Fix: <버그 수정>
- [ ] Refactor: <리팩터링>
- [ ] Docs: <문서>

## Testing
- [ ] 로컬 테스트 완료
- [ ] 빌드 성공
- [ ] 주요 시나리오: <테스트한 내용>

## Screenshots
<필요시 첨부>

## Related
- Closes #<issue-number>
```

---

## ADR / A3 템플릿

**ADR (장기 결정에만)**
```
Context: <현황/배경/제약/대안>
Decision: <최종 선택>
Consequences: <+ / ->
Links: <이슈/PR/문서>
```

**A3 (막히는 문제에만)**
```
Problem → Goal
Root cause (5 Whys)
Countermeasures
Result → Follow-up
```

---

## 데이터베이스 마이그레이션

### Supabase SQL Editor에서 순서대로 실행:
1. `create_courses_tables.sql`
2. `20250124_create_enrollment_tables.sql`
3. `20250124_create_storage_bucket.sql`
4. `20250207_add_course_topics.sql`
5. `20250207_create_quiz_tables.sql`

---

## 중요 파일 위치

### 자주 수정하는 경로
* **서버 액션**: `/app/lib/actions/`
* **SCSS 파일**: `/public/scss/` (**컴파일된 CSS 직접 수정 금지**)
* **글로벌 스타일**: `/app/globals.css` (Tailwind 엔트리)
* **컴포넌트**: `/components/`
* **대시보드**: `/app/(dashboard)/`
* **테스트 데이터**: `/constants/sampleQuizData.js` (추후 TS 전환 가능)

---

## 🏢 테이블 정렬 시스템

* **SCSS 위치**: `/public/scss/template/_instructor-dashboard.scss`
* **핵심 클래스**: `.rbt-table.table-header-align`
* **정렬 클래스**: `text-start` / `text-end` / `text-center`
* RTL/다크/반응형 지원

---

## 🔍 코드 베이스 탐색(DISCOVER Lite)

### D - Detect
* 예: "Assignment에 파일 업로드 추가(모바일 1초 내 프리뷰)"

### I - Investigate (검색 예시: TS 포함)
```bash
# rg 권장: ts/tsx 포함, 속도 빠름
rg -n "upload|attachment|storage|blob|base64" --glob "*.{js,ts,tsx}"
```

### S - Study
* Course 썸네일/Quiz 이미지 → **Server Action → Supabase** 패턴 재사용

### C - Compare (간단 표)
| 후보 | 방식 | 재사용성 |
|------|------|----------|
| Quiz | Base64+Server | ⭐⭐⭐ |
| 새 구현 | - | ⭐ |

### O/V/E/R (선택)
* **유사도 80%+**: 기존 재사용
* **유사도 50~80%**: 기존 확장
* **유사도 <50%**: 새로 구현(드물어야 함)

---

## 🚨 RED FLAGS (중단 신호)

* 🚩 비슷한 이름의 새 파일 생성 충동
* 🚩 복사-붙여넣기 유혹
* 🚩 "일단 만들고 나중에 정리"
* 🚩 기존 코드 확인 없이 새 파일 생성

**대응**: STOP → 기존 코드 검색 → 재사용/확장 판단

---

## ⏱️ 3-3-3 규칙

* **3초**: "새 파일?" → 멈춤 → "비슷한 거 있나?"
* **3분**: `rg` 검색으로 유사 패턴 탐색
* **30분**: 정말 새로 만들어야 하나 재검토

---

## TypeScript 마이그레이션 지침

### 🎯 핵심: "Touch It, Type It" — 작업하는 파일만 TS 전환

### 실용 규칙

1. **새 기능**: 반드시 TS(.ts/.tsx)
2. **수정 범위 큼**: TS로 전환
3. **간단 버그**: JS 유지 가능
4. **리팩터링**: TS 최적 타이밍

### Next.js 파일 공존 주의(중요)

* **페이지/라우트 파일**(`page.tsx`, `route.ts` 등)은 **동명 .js/.tsx 공존 금지** → **전환 시 JS 제거**
* **일반 컴포넌트**는 공존 가능하나, **가급적 .tsx만 남기고** 임포트를 **확장자 없이 or .tsx로 명시**하여 혼선 방지
* "동일 경로 동일 파일명" 공존 시 번들러/해석 순서로 혼선 가능 → **전환 완료 즉시 JS 제거 권장**

### 전환 순서(권장)

1. TS 파일 생성(.ts/.tsx) → 2) 임포트 경로 교체 → 3) `pnpm typecheck && pnpm build` →
4. 수동 테스트 통과 → 5) **JS 제거(git rm)** → 6) 커밋/PR

> 과거의 "둘 다 오래 유지" 지침은 **페이지/라우트**에서 충돌을 유발할 수 있어 보완했습니다.

### Any 타입 처리

* **임시 허용**: 마이그레이션 속도를 위해
* **점진 개선**: TODO(ANY-TODO) 태그로 관리
* **새 코드**: any 금지, unknown/제네릭 사용

### Quick Fixes
```typescript
// 타입 없는 라이브러리
declare module 'some-lib'

// Props 빠른 정의
interface Props {
  children: React.ReactNode
  data?: any  // TODO(ANY-TODO): 나중에 타입 정의
}
```

### Supabase 클라이언트 분리
* Server: `app/lib/supabase/server.ts`
* Client: `app/lib/supabase/client.ts`

---

## 작업 체크포인트(예시)

* **코스 생성**: Base64 변환, 5MB 제한, 이미지 전용, `instructor_id` 자동
* **레슨 관리**: DnD 후 `order_index` 업데이트, 삭제 시 재정렬
* **퀴즈**: Zod v3.25.76, Quill 비디오 placeholder 변환, 9유형 지원

---

## 환경 변수(필수)

```env
NEXTAUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_CERTIFICATE_ENABLED=false
```

---

## 자주 사용하는 Server Actions

* **코스**: `createCourse`, `updateCourse`, `getCourseById`
* **레슨**: `createLesson`, `updateLesson`, `deleteLesson`, `reorderLessons`
* **퀴즈**: `createQuizLesson`, `updateQuizLesson`, `getQuizByLessonId`

---

## SCSS 주의(추가 팁)

* **논리 속성** 권장: `padding-block / padding-inline` (RTL/반응형에 안전)
* 컴파일된 CSS 직접 수정 금지(`/public/css/`)

---

## 변경 보고(무엇을 고쳤는가)

1. **서버 실행 금지**: AI 에이전트는 서버 제어 불가 명시
2. **DISCOVER 프로세스**: "필수"에서 "Lite" 버전으로 완화
3. **트랙 분기**: Lite/Standard/Risky 3단계 도입
4. **DoR/DoD**: 체크리스트 템플릿 추가
5. **TS 마이그레이션**: Next.js 파일 공존 이슈 명시
6. **Kanban + PDCA**: 솔로 개발자용 워크플로우 추가
7. **3-3-3 규칙**: 실용적으로 단순화

이제 과도한 프로세스 없이 **실용적인 개발**이 가능합니다!