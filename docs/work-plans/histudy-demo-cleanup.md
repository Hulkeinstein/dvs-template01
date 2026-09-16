---
title: "HiStudy 데모 페이지·컴포넌트 삭제 (T2) Work Plan"
tags:
  - type/docs
  - component/ui
  - progress/in-progress
created: 2026-01-01
updated: 2026-09-16
lifecycle: active
---

# Work Plan: HiStudy 데모 페이지·컴포넌트 삭제 (T2)

> **Status**: Active — 계획 승인 대기 (Phase 1 착수 전)
> **Track**: `docs/ROADMAP.md:50` T2 · **Branch**: `chore/histudy-demo-removal` · **기준 태그**: `pre-demo-removal` (main 91d9fd9, 원격 push 완료)
> **이력**: 2025-12-28 원안(Issue #69, 닫힘)은 `CourseDetails-Two~Eight`와 데모 라우트 9개만 다뤘다. 2026-09-16 재개 점검(ADR 0003)과 사용자 확정 답으로 범위를 데모 전체로 넓혀 다시 썼다. 원안의 소요 추정은 뺐다(시간 표현 금지 규칙).
> **검증 명령 실행 환경**: 저장소 루트에서 Bash(git-bash). `npm run test*`는 `NODE_ENV=test` 접두 때문에 Windows cmd에서 돌지 않으므로 jest는 Test Strategy의 명령으로 직접 실행한다.

---

# 섹션 1 — 뭘, 왜 (What & Why)

## Overview

- **Objective**: 제품(YouTube 큐레이션 교육 플랫폼)에 속하지 않는 HiStudy 데모 화면(진입 파일 119개, 라우트 폴더 99개)과 그 화면만 쓰던 컴포넌트·데이터를 지우고, 남는 화면에는 지운 화면으로 가는 링크·이동·경로 분기를 남기지 않으며, 지운 파일은 `pre-demo-removal` 태그와 경로 매핑 문서로 화면 단위 복구가 가능하게 한다.
- **Scope**:
  - **IN**:
    1. 삭제 — 번호 데모 홈 24개(`app/02-course-school` ~ `app/26-islamic-center`, 09 결번) · `app/(elements)` 24개 · `app/(pages)` 데모 11개 폴더(`about-us-02`, `academy-gallery`, `admission-guide`, `event-details`, `event-grid`, `event-list`, `event-sidebar`, `my-account`, `shop`, `single-product`, `subscription`) · `app/(courses)` 데모 17개 폴더(`course-card-2/3`, `course-detail-2~8`, `course-filter-*` 4개, `course-masonry`, `course-with-sidebar`, `course-with-tab`, `course-withtab-two`) · 정적 퀴즈 데모 6개(`all-questions`, `pagination-quiz`, `questions-types`, `quiz-with-custom-timer`, `quiz-with-point`, `single-question`) · lesson 데모 6개(`lesson/page.js` 단일 파일 — `lesson/[id]`는 유지, `lesson-intro`, `lesson-quiz`, `lesson-quiz-result`, `lesson-assignments`, `lesson-assignments-submit`) · `app/(pages)/profile` · `app/(blogs)` 10개 폴더 · (Q1 확정안 A) `mdx/index.js`·`data/blog/**` · 위 화면에서만 닿는 `components/`·`data/` 파일
    2. 참조 정리 — 유지 코드의 삭제 라우트 링크·`router.push`·`pathname` 분기·메뉴 데이터(`data/MegaMenu.json`, `data/footer.json`, `data/lesson.json`), 헤더·푸터 데이터의 기존 불일치 링크
    3. 이번 편집으로 아무도 안 쓰게 된 파일(`components/`·`data/`·`mdx/` 안) 삭제, `.prettierignore`의 삭제 경로 항목 정리
    4. 검증 도구 `scripts/demo-removal/*.mjs` 4개, 영구 기록 `docs/library/histudy-demo-removal.md`, `docs/ROADMAP.md` T2 상태
  - **OUT**: SCSS(`public/scss/`)·`public/css/`·이미지(`public/images/`) · 이미 죽은 위젯(`BlogPostWidget.js`, `EventWidget.js` — 문서에 기록만) · `DemoCourseProvider` 제거와 `app/(courses)/course-details/page.js:11` 리다이렉트 · 컴포넌트 안 정적 데이터의 실데이터 교체(홈·레슨·퀴즈, `LessonQuiz.js`의 하드코딩 문항 포함) · 유지 페이지의 HiStudy 문구 교체 · `progress.json` · npm 의존성 제거(후보만 기록) · `.js`→TS 전환 · `app/lib`·`context`·`redux`·`hooks`·`types`의 미사용 파일 삭제(후보만 기록) · `app/api`·`app/(dashboard)`·`app/(auth)` 변경 · 헤더·푸터 데이터 밖의 기존 링크 결함 수정(기록만) · T3~T6

## Success Criteria

- [ ] 삭제하기로 한 데모 화면 진입 파일 119개가 모두 사라지고, 실제 기능 화면 진입 파일 71개는 하나도 사라지지 않는다
- [ ] 남는 화면의 링크·이동·메뉴·경로 분기 중 지운 화면을 가리키는 것이 0개이고, 헤더·푸터 메뉴에는 없는 주소로 가는 링크가 0개다
- [ ] 지운 화면만 쓰던 파일과 이번 정리로 아무도 안 쓰게 된 파일이 정리 범위(`components/`, `data/`, `mdx/`, 데모 라우트 폴더) 안에 남지 않는다
- [ ] 형식·린트·타입·빌드 검사와 기존 테스트가 정리 전과 같은 결과로 통과한다
- [ ] 복구 문서에 지운 파일 전부가 화면별로 적혀 있고, 문서에 적힌 복구 명령으로 실제로 되살아난다
- [ ] 범위 밖으로 정한 파일(SCSS·이미지·`progress.json`·`DemoCourseProvider`·API·대시보드·인증)은 바뀌지 않는다

## Context

### Project Context (from docs/)

- **Product Goal**: `docs/PROJECT_VISION.md` — YouTube 큐레이션 교육 플랫폼(무료 코스+광고, 프리미엄 서브도메인, 강사 큐레이터, 평점·좋아요). 쇼핑몰·이벤트·블로그 없음
- **ADR Constraints Applied**: ADR 0003(정리하며 지속 → 데모는 삭제, 재작성 아님) · ADR 0002(레슨·AI 요약 실기능 유지 → `lesson/[id]`와 그 컴포넌트는 경로 값만 수정) · ROADMAP T1 결정(`progress.json` 유지, husky 훅 충돌은 TS 전환 정책과 함께 결정 — `docs/ROADMAP.md:56`)
- **Aligned with Existing Plans**: 이 파일이 유일한 진행 계획(원안 확장). 순서 근거 — T2가 T5 전환 범위와 T4 점검 범위를 줄인다(`docs/ROADMAP.md:60`)

### Interview Summary (사용자 확정 — 다시 묻지 않음)

- **실제 레슨·코스 상세에 박힌 데모 링크**: 지금 삭제 + 링크 정리(A안). lesson 데모 6개·profile도 삭제, 컴포넌트 안 정적 데이터는 교체하지 않음
- **블로그**: 삭제(다른 곳에서 안 쓰는지 확인 후) — 확인 결과 유지 홈이 쓴다 → 아래 Q1
- **홈**: `01-main-demo` 유지, 번호 데모 홈 24개 삭제
- **선행**: PR #76 병합, annotated 태그 `pre-demo-removal`(91d9fd9) 원격 push, 브랜치 생성 완료

### Research Findings (결합 지점 — 원문 확인)

- `app/page.js:2` → `app/01-main-demo/page.js:2,10` `getAllPostsMeta()` from `@/mdx` → `mdx/index.js:5,28`이 `data/blog` 폴더를 `fs`로 읽음 → `components/01-Main-Demo/01-Main-Demo.js:16,203` `BlogGridTop` 블로그 섹션. **유지 홈이 블로그 데이터를 쓴다**(import 그래프에는 `data/blog`가 안 보임)
- `components/Header/Nav.js:7-11,284-447` — 메뉴 구조가 코드에 박혀 있다(Elements 메뉴는 `ElementsLayout` 3개를 인덱스 범위로, Blog 메뉴는 `grid-item-5`). JSON 항목만 지우면 **빈 드롭다운**이 남는다. `ElementsLayout`은 `Nav.js:10`만 import
- `app/(courses)/course-details/index.js:71,79` — 조회 실패 시 `router.push('/course-filter-one-toggle')`(삭제 대상)
- `data/lesson.json:9-153` — `lssonLink` 15개 중 13개가 삭제 라우트, 2개는 기존 관례값 `"#"`(`:42,50`). `components/Lesson/LessonQuiz.js:179` `href="/lesson-quiz-result"`, `components/Lesson/LessonSidebar.js:87` `isActive('/lesson-quiz-result')`
- `/profile/${id}` 링크가 유지 가능 컴포넌트 여럿에 있다(`Course-Sections/Instructor.js:15,29`, `RelatedCourse.js:99,109`, `SimilarCourses.js:83,94`, `Breadcrumb/Course-Breadcrumb.js:99,112`, `Cards/Card.js:83,103` 등). 공개 강사 프로필 실제 라우트는 없다(`app/(dashboard)/(instructor)/instructor-profile`은 본인용)
- 경로 분기(`pathname`): `Course-Sections/course-head.js:25-152`, `Viedo.tsx:69-79`, `Overview.js:11`, `Featured.js:13`, `Course-Menu.js:11`, `Course-Action-Bottom.js:16`, `Category/CategoryHead.js:44-178`(유지 경로 `/all-courses`와 OR로 섞임, `:147-153`), `Category/CategoryHeadTwo.js:90,108`, `Abouts/About-Two.js:121`
- `components/Header/Offcanvas/Cart.js:63,82` `/event-details/${id}`, `components/Footer/CopyRight.js:29` `/subscription`, `data/footer.json:11-49,82-120` 데모 홈·블로그 링크 + 기존 불일치(`/pages/faqs`, `/elements/team`, `/pages/event-list`)
- `.prettierignore:51-57` — 삭제될 `components/18~26-*` 폴더 항목
- Next 14 모듈 해석 순서 `.js .mjs .tsx .ts .jsx .json`(`node_modules/next/dist/build/webpack-config.js:510-518`) — 선행 계산용 임시 스크립트의 순서와 다르다 → 새 스크립트는 Next 순서를 쓴다
- `__tests__/components/LessonContent.test.tsx:19,60` — `jest.mock('@/components/Lesson/LessonSidebar')` 등 문자열 경로(import 문이 아니라 그래프가 못 봄)
- CI 워크플로는 `.github/workflows/lint-check.yml`(CI Checks)과 `docs-check.yml`(Docs Validation, `docs/**` 변경 시) 2개뿐 — 배포 자동화 없음. 운영 배포 여부는 미수집
- 선행 그래프 계산(임시 스크립트): 진입점 189개(page·layout·route) = 삭제 95 + 재검토 8 + 블로그 16(→ 사용자 답으로 전부 삭제 = 119) + 유지 70. `app/not-found.js`를 진입점에 더하면 유지 71

### Metis Review

**Identified Gaps** (addressed in plan):

- 범위 확장(고아 이미지·SCSS·죽은 위젯): OUT 고정, 매핑 문서에 후보로만 기록
- 숨은 결합(course-details 리다이렉트, 레슨 사이드바·퀴즈, profile 링크, 공유 컴포넌트 분기, 오프캔버스·저작권 링크, 홈 `/blog`): Phase 2 영역별 task로 흡수. 추가로 홈↔블로그 데이터 결합(Q1)과 빈 메뉴 구조(Q2)를 찾아 반영
- 사용자 답 반영 후 최종 삭제 목록 재산출: T002가 태그 기준으로 재산출, 산출 명령을 task에 고정
- 링크 검사·매핑 정합·복구 가능성 검증: T003·T004, F2·F6~F8
- husky 게이트: T001이 훅 상태를 확인

### Decisions (2026-09-16)

- **D1 순서**: 도구·매핑(Phase 1) → 참조 정리(Phase 2, 삭제 전) → 순수 삭제(Phase 3~6) → 조립 검증(Phase 7). 대안(그룹마다 삭제+참조 수정을 한 커밋에)은 공유 메뉴 파일을 네 번 고치고, 삭제 커밋을 되돌리면 링크 수정까지 되돌아가 기각
- **D2 기준 트리**: 매핑(`map`)은 태그 트리로 계산해 언제 돌려도 같은 결과. 삭제 목록(`plan`)은 작업 트리로 계산 — Phase 2 편집이 새로 만드는 고아까지 잡기 위해
- **D3 삭제 판정**: 유지 진입점(+ 테스트·scripts 소비자)에서 import로 닿지 않는 파일만. 삭제 허용 루트는 데모 라우트 폴더·`components/`·`data/`·`mdx/`. `app/lib`·`context`·`redux`·`hooks`·`types`의 미사용 파일은 기록만(서버 액션·인가 코드는 T4 점검 대상이라 손대지 않음)
- **D4 링크 대체 규칙**: Phase 2 머리의 R1~R5
- **D5 매핑 문서**: `docs/library/histudy-demo-removal.md`, 생성기 산출물(손 편집 금지). 생성 스크립트는 `scripts/demo-removal/`에 커밋해 다시 만들 수 있게 둔다. `package.json`·CI에는 연결하지 않는다
- **D6 `.js` 수정**: TS로 전환하지 않는다 — T1 선례와 `docs/ROADMAP.md:56`(전환 정책 보류)
- **D7 원안 결정 갱신**: 원안의 "`Content.js`·`LessonAssignmentsSubmit.js` 유지"는 D3 규칙으로 대체(판정 결과는 기준선 표에 기록). "`checkMatchCourses` 이름 변경 안 함"은 유지
- **D8 front-matter**: 프로젝트 검사기(`scripts/verify-frontmatter.mjs:39`) 기준 5필드(`lifecycle`)를 쓴다 — 전역 템플릿의 `status` 대신 프로젝트 규칙 우선
- **D9 기존 링크 결함**: 헤더·푸터 데이터(`data/MegaMenu.json`, `data/footer.json`)는 기존 불일치까지 0으로, 그 밖은 기록만(개수 증가 금지)
- **D10 npm 의존성**: 삭제로 안 쓰이게 되는 패키지(예: `next-mdx-remote` — `mdx/index.js:3`만 사용)는 제거하지 않고 매핑 문서에 후보로 기록(T5 참고)
- **D11 적대축**: ON(섹션 2 위험 판정). 실행은 사용자 opt-in 후 `adversarial-round` workflow, Phase 2 끝·Phase 7 끝 각 1회

### 사용자 결정 (2026-09-16 확정)

- **Q1 홈 블로그 섹션 → A 확정**: 홈의 "Blog Post" 섹션과 `getAllPostsMeta` 호출을 지우고 `mdx/index.js`·`data/blog/**`·블로그 전용 컴포넌트까지 삭제(PRD "블로그 없음"과 일치). T009·T016에 반영
- **Q2 헤더 메뉴 모양 → 빈 메뉴 제거 확정**: 항목이 모두 삭제되는 Elements·Blog 메뉴는 `<li>`째 제거. **Home은 드롭다운 없이 메인 홈(`/`)으로 바로 가는 단일 링크**로 바꾼다(사용자가 승인한 문구 기준 — 이전 기본안의 "Home 드롭다운 구조 유지"를 대체). Courses·Pages는 남는 항목만. T005에 반영

### 사람 명세 확인 (계획 승인 시 3개)

- **Valuable**: 데모를 걷어내 T4(인가 점검)·T5(프레임워크 전환)가 다룰 코드를 줄이는 것이 지금 원하는 가치인가
- **Scope 정합**: Success Criteria 6개를 모두 채우면 "남는 화면이 깨지지 않고, 지운 것은 찾아서 되살릴 수 있다"가 달성되는가(역검증은 섹션 2 Gap Probe)
- **OUT 정확**: OUT 목록, 특히 D3(`app/lib` 등은 기록만)·D6(TS 전환 안 함)·D10(npm 의존성 유지)이 의도와 맞는가

---

# 섹션 2 — 어떻게 (How)

## Approach

1. **검증 도구 먼저**(Phase 1): 공용 모듈 `graph.mjs`(트리 읽기·import 해석·분류·도달 계산), 태그 트리로 화면→컴포넌트·데이터 매핑과 삭제 목록을 내는 `route-map.mjs`, 유지 코드의 경로 문자열을 라우트 표와 대조하는 `check-route-links.mjs`, 매핑 문서 생성기 `render-doc.mjs`. 복구 기록 초안을 삭제 전에 만든다
2. **참조 정리**(Phase 2): 데모 화면이 아직 있는 상태에서 유지 코드의 링크·이동·분기를 먼저 없앤다 → 여기서 멈춰도 데모 화면은 링크만 끊긴 채 살아 있고 실제 화면은 정상
3. **순수 삭제**(Phase 3~6): `node scripts/demo-removal/route-map.mjs plan --phase N --list | xargs -d '\n' git rm --quiet --` 형태의 삭제 전용 커밋. 파일이 삭제되는 Phase = 그 파일에 닿는 삭제 진입점 Phase의 최댓값 → 앞 Phase 삭제가 뒤 Phase 데모 화면을 깨지 않는다
4. **조립 검증**(Phase 7): 편집으로 생긴 고아 삭제 → `verify` → 매핑 문서 최종 재생성(실제 `git diff` 기준) → 제3자 검증
5. **커밋**: 1 commit = 1 의도, Conventional Commits(`chore(demo): …`, `docs(demo): …`). 커밋·PR은 사용자 승인 후(`modules/workflow.md` Claude Code Rules). 마무리는 프로젝트 수명주기대로 F-item 전부 통과 → 이 Work Plan 삭제 → PR(squash)

## 위험 판정 (적대축 발화 근거 — plan 기록)

| Phase | 주 category | 보안 | 비가역·외부영향 | 아키텍처(다중 모듈) | ultrabrain | 적대축 |
|---|---|---|---|---|---|---|
| 1 | ultrabrain(T002·T003) | 아니오 | 아니오 — 파일 추가만 | 아니오 | 예 | OFF — 런타임 코드 변경 0. 도구 정확성은 known-answer·변이 검사(QA)로 직접 확인. 적대검증 대상은 런타임 코드로 고정(`coding-workflow.md` 운영 규칙 ②) |
| 2 | ultrabrain(T007) 외 | 아니오 — 인증·인가·API 파일 변경 없음 | 아니오 — 수정만, 되돌리기 쉬움 | 예 — 공유 Header·Footer·Course-Sections·Category | 예 | **ON** — T011, 사용자 opt-in 필요 |
| 3~6 | quick | 아니오 | **예 — 파일 삭제**. 완화: 원격 태그, 복구 문서, 배포 워크플로 없음 | 아니오 | 아니오 | 삭제 자체는 `verify`·build 기계 판정. 삭제 목록 판정은 Phase 7 라운드에 포함 |
| 7 | quick·writing | 아니오 | 예 — 고아 삭제 | 아니오 | 아니오 | **ON** — T021 조립 후 1회, 사용자 opt-in 필요 |

- **plan 전체 판정: 적대축 ON** — 비가역(삭제) 행과 다중 모듈 행에 해당. 태그로 복구 가능해도 fail-safe 기본값을 유지한다
- 실행 형식: `adversarial-round` workflow만(에이전트 직접 호출 금지). `targets` = 그 시점까지 **수정(M)**된 런타임 파일(`git diff --name-only --diff-filter=M 'pre-demo-removal^{commit}' HEAD -- app components data`), Phase 7 라운드는 여기에 삭제 목록 판정(`.tmp/demo-removal/plan.json`)을 더한다. `constraints` = 이 문서의 D1~D11·OUT 목록·Q1/Q2 답. 재개 시 같은 `args`를 다시 싣고, 종료·중단 뒤 첫 동작은 `git status`
- 사용자가 opt-in을 거절하면 "적대축 OFF(사용자 거절, 날짜)"를 Implementation Log에 적고 Tier 1 + validator로 진행한다
- 종료: 연속 2회차가 제품 실코드 0줄이면 종료(운영 규칙 ①). 회차 보고 첫 줄에 "이번 회차 실코드 N줄 / 누적 M줄"
- **의도축(validator)은 판정과 무관하게 항상** — T011·T020

## Prerequisites

- [x] PR #76(T1) squash 병합 — main 91d9fd9
- [x] annotated 태그 `pre-demo-removal` 생성·원격 push
- [x] 브랜치 `chore/histudy-demo-removal` 생성
- [x] 사람 명세 확인 3개 승인(섹션 1) — 2026-09-16
- [x] Q1·Q2 답 — 2026-09-16 (섹션 1 "사용자 결정")
- [x] momus 계획 검토 APPROVE (명확도 약 90%)

## Phase 분할 근거

- **Phase 1 (Foundational)**: 뒤 Phase 전부가 삭제 목록(`plan`)·링크 판정(`check-route-links`)·복구 기록을 기다린다. 앱 코드를 건드리지 않으므로 멈춰도 정상
- **Phase 2**: 링크 제거와 화면 삭제는 짝이지만, 링크를 먼저 지우는 순서만 "멈춰도 정상"이다(반대 순서는 끊긴 링크가 남는다). 데모 화면은 살아 있고 실제 화면은 정상
- **Phase 3~6**: 그룹마다 삭제 후 build 통과. 파일 삭제 Phase를 도달 진입점 Phase의 최댓값으로 정해 남은 데모 화면이 깨지지 않는다
- **Phase 7**: 고아 삭제와 기록 확정. 여기서 멈추면 T2 완료 상태

## Test Strategy

- [ ] **신규 단위 테스트 없음** — 동작 추가가 아니라 삭제·경로 값 정리. 기존 jest 무회귀로 확인
- [ ] **Tier 1 (매 Phase)**: `npm run type-check` → `npm run lint` → `npm run format:check` → `npm run build` → jest — 모두 exit 0, jest 수치는 기준선과 같음

  ```bash
  set -o pipefail; CI=true NODE_ENV=test NODE_OPTIONS=--experimental-vm-modules npx jest --ci --runInBand --detectOpenHandles 2>&1 | grep -E '^(Test Suites|Tests):'
  # pipefail이 없으면 exit code가 grep 것이 된다 — 판정은 exit code와 Tests 수치 둘 다로 한다
  ```

- [ ] **구조 검사 (Phase 2~7)**: `node scripts/demo-removal/check-route-links.mjs`(삭제 라우트 참조·헤더푸터 불일치 0) · `node scripts/demo-removal/route-map.mjs verify`(Phase 7에서 exit 0)
- [ ] **도구 자체 검증 (Phase 1)**: known-answer(알려진 파일:줄이 기대 분류로 나옴) · negative control(유지 경로는 안 나옴) · 변이 검사(import를 지운 임시 worktree에서 고아가 잡힘)
- [ ] **제3자 검증**: validator(항상) + 적대축(opt-in) — T011, T020·T021
- **하지 않는 것**: dev server 기동·E2E(Playwright는 서버 필요 — AI 서버 기동 금지). 화면 육안 확인은 사용자가 원할 때만

## 기준선 (T001·T002·T003이 채움)

| 항목 | 값 |
|---|---|
| 태그 대상 커밋 | 미수집 (기대: `91d9fd9`로 시작, `origin/main`과 같음) |
| 태그 원격 존재 | 미수집 |
| 코드 트리 == 태그 | 미수집 |
| husky 훅(`git config --get core.hooksPath`) | 미설치 — hooksPath 빈 값, `.git/hooks/pre-commit` 없음 (2026-09-16 확인) |
| type-check / lint / format:check / build | 미수집 |
| jest Test Suites / Tests | 미수집 (T1 기록: 17 / 133) |
| Docs Validation 최근 결론 | 미수집 |
| 이 계획서 git 최초 작성일 | 2026-01-01 (`git log --follow --diff-filter=A`, front-matter 반영 완료) |
| `route-map.mjs map` entries / keep / del / sections | 미수집 (기대 190 / 71 / 119 / 99) |
| `check-route-links.mjs` del-route / missing / nav-missing | 미수집 |
| `Content.js`·`LessonAssignmentsSubmit.js` 판정 | 미수집 |

## Gap Probe (역검증 — DoD를 100% 채웠는데 Goal에 못 미치는 시나리오)

- **G1 실제 화면 오삭제**: 분류 정규식이 유지 진입점을 삭제로 잡으면 build·링크 검사는 통과해도(그 화면으로 가는 링크까지 같이 지워짐) 실제 기능이 사라진다 → 성공 기준 1에 "유지 71개 전부 존재", T002 known-answer에 유지 진입점 10개 고정, F1이 `keep-entries-present=71/71` 확인
- **G2 import 밖 참조**: `fs` 읽기(`mdx/index.js:5`)·`jest.mock` 문자열처럼 import 그래프에 안 보이는 참조를 놓쳐 "아무도 안 씀"으로 잘못 판정하면, 동적 렌더 화면은 build를 통과하고 실행 때 깨진다 → T002 Spec에 런타임 읽기 규칙·`jest.mock` 인식, F2에 삭제한 `data/blog`·`mdx` 경로 문자열의 유지 코드 참조 0건 검사
- **G3 빈 메뉴**: JSON 항목만 지우면 링크 검사 0건·build 통과인데 실제 화면 헤더에 빈 Elements·Blog 드롭다운이 남는다(`Nav.js:284-447`) → R4 + Phase 2 Checkpoint에 `grep -cE 'ElementsLayout|grid-item-5' components/Header/Nav.js` → `0`(Q2 확정안 기준 — Home도 드롭다운 없는 단일 링크)
- **G4 분기 단순화 오류**: `CategoryHead.js:147-153`처럼 삭제 경로와 유지 경로(`/all-courses`)가 OR로 섞인 조건에서 유지 경로 쪽 결과가 바뀌면, 링크 검사·build는 통과해도 코스 목록 화면 모양이 바뀐다 → R3(유지 경로 평가 결과 불변 + 편집 전후 표 기록) + T011 validator·적대축 targets에 포함
- **G5 홈↔블로그 결합**: 블로그 폴더만 지우면 홈이 `data/blog`를 못 읽어 build(정적 홈 렌더) 또는 실행이 깨진다 → Q1, T009를 삭제(T016)보다 앞 Phase에 배치
- 위 5개를 반영한 뒤 새 반례를 구성하지 못했다

---

# 섹션 3 — 할 일 (Tasks)

> **task 라인 규격**: `- [ ] T001 [P] 설명 — 파일경로` (T는 3자리·마침표 없음, `[P]`는 선택, `— 경로` 필수)
> **상세도 차등 (ADR 0001 D2)**: Phase 1만 완벽본, Phase 2~7은 skeleton — 착수 직전 refine(`grep -n`으로 file:line stale 재확인)해 완벽본으로 채운다

## Phase 1: 기준선·검증 도구·복구 기록 초안 (Foundational)

- [ ] T001 [P] 기준선 확인과 기록 — `docs/work-plans/histudy-demo-cleanup.md` `category:quick`
  **Goal**: 브랜치 코드가 태그 `pre-demo-removal`과 같고 CI 동등 검사가 통과함을 확인해, 섹션 2 "기준선" 표의 T001 몫(앞 8행)을 실제 값으로 채운다.
  **References**:
  - `.github/workflows/lint-check.yml:54-144` — CI 단계 순서와 가드 스크립트 원문. 로컬 검증을 이와 맞춘다
  - `package.json:13-19` — `format:check`·`type-check`·`test:ci` 원문. `test*`는 `NODE_ENV=test` 접두라 Bash로 jest를 직접 실행
  - `.husky/pre-commit:7` — `--diff-filter=AM` JS/JSX 게이트. 훅이 켜져 있으면 Phase 2의 `.js` 수정 커밋이 막힌다
  - `docs/ROADMAP.md:56` — husky 미설치 상태·`progress.json` 유지 결정
  **Must NOT do**: 소스 파일 수정 금지. 기준선 실패를 T2에서 고치지 않는다(멈추고 보고). `--no-verify`로 훅을 우회하지 않는다. dev server를 띄우지 않는다.
  **QA Scenarios**:
  - Happy path (순서대로, 각 기대값):
    1. `git cat-file -t pre-demo-removal` → `tag`
    2. `git rev-parse 'pre-demo-removal^{commit}' origin/main` → 두 줄이 같고 `91d9fd9`로 시작
    3. `git ls-remote --tags origin refs/tags/pre-demo-removal | wc -l` → `1`
    4. `git diff --stat 'pre-demo-removal^{commit}' HEAD -- app components data mdx public scripts .prettierignore package.json package-lock.json` → 출력 없음
    5. `npm run type-check && npm run lint && npm run format:check && npm run build` → exit 0
    6. Test Strategy의 jest 명령 → exit 0, `Test Suites: 17 passed, 17 total` / `Tests: 133 passed, 133 total` (다르면 관측값을 기준선으로 기록하고 차이를 Implementation Log에 적는다)
    7. `git log --follow --diff-filter=A --format=%ad --date=short -- docs/work-plans/histudy-demo-cleanup.md | tail -n 1` → front-matter `created`와 다르면 그 값으로 고친다
    8. `gh run list --workflow "Docs Validation" --limit 3 --json conclusion,headBranch` → 결론을 기준선에 기록(T2 PR에서 이 검사가 실패할 때 기존 결함인지 가르는 근거)
  - Edge case: `git config --get core.hooksPath` 출력이 `.husky/_`(훅 활성)이면 기준선에 기록하고 Phase 2 착수 전에 사용자에게 처리 방침을 묻는다 — TS 전환 정책은 ROADMAP상 보류라 여기서 정하지 않는다
  - Edge case: 5·6 중 하나라도 실패 → T2 중단, 실패 명령과 exit code를 보고(태그 시점이 이미 깨졌다는 뜻)
  - Negative: `git status --porcelain -- app components data mdx` → 출력 없음(T001은 코드를 건드리지 않는다)

- [ ] T002 [P] 라우트·파일 판정 스크립트 — `scripts/demo-removal/graph.mjs`, `scripts/demo-removal/route-map.mjs` `category:ultrabrain`
  **Goal**: `node scripts/demo-removal/route-map.mjs map`이 태그 트리 기준 분류·매핑을 `.tmp/demo-removal/route-map.json`에 쓰고 `entries=190 keep=71 del=119 sections=99`를 출력하며, `plan`·`verify`가 작업 트리 기준 삭제 목록과 완료 판정을 낸다. 같은 입력이면 출력 JSON이 바이트 단위로 같다.
  **Spec (구현 계약 — 뒤 Phase가 이 출력에 기댄다)**:
  1. **CLI**: `map [--out F]`(기본 `.tmp/demo-removal/route-map.json`, 태그 트리) · `plan [--root DIR] [--out F] [--phase N --list]`(기본 `.tmp/demo-removal/plan.json`, 작업 트리. `--list`는 그 Phase 경로만 한 줄에 하나) · `verify [--root DIR]`. 출력 폴더가 없으면 만든다
  2. **트리 읽기**: `map`은 `git ls-tree -r --name-only pre-demo-removal` + `git cat-file --batch`. `plan`·`verify`는 `--root`(기본 저장소 루트)의 `git ls-files` + 파일 읽기. 두 경우 모두 "태그 시점 도달 여부"는 태그 트리로 계산
  3. **코드 파일**: 확장자 `.js .jsx .ts .tsx .mjs .json`. 해석 대상 폴더 `app components context redux hooks lib constants data types mdx`. 소비자 루트(여기서 닿는 파일은 유지): `scripts/`, `__tests__/`, `tests/`, `jest.setup.*`, `**/__tests__/**`
  4. **import 인식**: 아래 정규식(선행 계산 스크립트와 같음)에 `jest.mock\(\s*['"]([^'"]+)['"]`를 더한다. 해석: `@/` = 루트, 상대 경로, 확장자 순서 `.js .mjs .tsx .ts .jsx .json`(Next 14 webpack과 동일), 다음 `/index.*`. npm 패키지(bare specifier)는 패키지명만 따로 모은다

     ```js
     /(?:import\s[^'"]*?from\s*|import\s*\(\s*|require\s*\(\s*|export\s[^'"]*?from\s*|import\s*)['"]([^'"]+)['"]/g
     ```

  5. **진입점**: `app/**/{page,layout,route,not-found,loading,error,template,default}.{js,jsx,ts,tsx}`
  6. **분류(사용자 확정)**: 아래에 맞으면 DEL, 아니면 KEEP. 괄호 안은 삭제 Phase

     ```js
     /^app\/(0[2-9]|1\d|2\d)-/                                                            // 3
     /^app\/\(elements\)\//                                                              // 4
     /^app\/\(pages\)\/(about-us-02|academy-gallery|admission-guide|event-[^/]+|shop|single-product|subscription|my-account)\// // 4
     /^app\/\(courses\)\/(course-detail-[2-8]|course-card-[23]|course-filter-[^/]+|course-with-tab|course-with-sidebar|course-masonry|course-withtab-two)\// // 4
     /^app\/\(courses\)\/\(lessons\)\/(all-questions|pagination-quiz|questions-types|quiz-with-custom-timer|quiz-with-point|single-question)\// // 4
     /^app\/\(courses\)\/\(lessons\)\/(lesson\/page|lesson-intro|lesson-quiz\/|lesson-quiz-result|lesson-assignments)/ // 5
     /^app\/\(pages\)\/profile\//                                                         // 5
     /^app\/\(blogs\)\//                                                                  // 6
     ```

  7. **삭제 판정(`plan`)**: 파일 f가 삭제 대상 ⇔ (a) f가 DEL 진입점이거나, 지금 KEEP 진입점·소비자 루트에서 도달 불가이면서 태그 시점에 어떤 진입점에서든 도달 가능했던 코드 파일이고, (b) 삭제 허용 루트 안에 있다: DEL 진입점 파일 자체 · KEEP 진입점이 하나도 없는 섹션 폴더(폴더의 추적 파일 전부 — 도달 안 되던 잔여 포함) · KEEP 진입점이 섞인 섹션 폴더(예: `lesson/`와 `lesson/[id]/`)에서는 (a)를 만족하는 코드 파일만 · `components/` · `data/` · `mdx/`. 런타임 읽기 규칙: `mdx/index.js`가 삭제 대상이면 `data/blog/**` 추적 파일 전부도 삭제 대상(`mdx/index.js:5`의 `fs` 읽기). (b) 밖의 미사용 파일은 `notDeletedCandidates`로만 기록
  8. **Phase 배정**: 파일에 닿는 DEL 진입점 Phase의 최댓값. DEL 진입점에서도 닿지 않는 파일(편집으로 생긴 고아)은 7
  9. **`map` 출력 JSON**: `baseCommit`, `entries[]{path,class,group,phase,route}`, `sections[]{dir,route,phase,entries[],reachFiles[]}`(라우트 폴더 단위, 동적 하위 라우트 포함, `reachFiles` = 태그 시점에 섹션 진입점이 닿던 파일 + 런타임 읽기 규칙 파일), `deleteFiles[]{path,phase,reason}`(태그 트리를 작업 트리로 보고 7번 적용), `notDeletedCandidates[]`, `alreadyDead[]`(태그 시점 어느 진입점·소비자에서도 안 닿던 파일 — 기록만), `packagesOnlyInDeleted[]`, `unresolved[]`. `plan` JSON은 `deleteFiles`·`notDeletedCandidates`·`keepEntries[]`
  10. **`verify` 출력**: `del-entries-remaining=<n> delete-candidates-remaining=<n> keep-entries-present=<있음>/<태그의 KEEP 수>`. 앞 둘이 0이고 KEEP이 전부 있을 때만 exit 0
  11. **결정성**: 모든 배열 정렬, 시각·절대 경로·사용자명을 출력에 넣지 않는다. Node 20 내장 모듈만 사용
  **References**:
  - `node_modules/next/dist/build/webpack-config.js:510-518` — 확장자 해석 순서의 근거
  - `mdx/index.js:5,28` — `data/blog` 런타임 읽기(그래프로 안 보임) · `app/01-main-demo/page.js:2` — 유지 홈의 `@/mdx` import(태그 시점에는 `mdx/index.js`가 유지 판정이어야 정상)
  - `__tests__/components/LessonContent.test.tsx:19,60` — `jest.mock` 문자열 경로
  - `app/not-found.js` — page·layout·route 외 진입점이 실제로 있다
  - `.gitignore:61` — `.tmp/`가 이미 무시 대상(출력 JSON이 커밋되지 않음)
  - `tsconfig.json:34` — `scripts/**/*`가 type-check 범위(`allowJs`, `checkJs: false`) · `.eslintignore:10` — `scripts/`는 lint 제외, prettier는 검사
  **Must NOT do**: 스크립트가 파일을 지우거나 고치지 않는다(목록만 출력 — `git rm`은 Phase 3~7 task가 명령으로). npm 의존성 추가·`package.json` scripts 등록·CI 연결 금지. 분류 목록을 손으로 적은 파일 목록으로 바꾸지 않는다(규칙으로만). 출력 JSON 커밋 금지.
  **QA Scenarios**:
  - Happy path: `node scripts/demo-removal/route-map.mjs map` → exit 0, 첫 줄 `entries=190 keep=71 del=119 sections=99`(값이 다르면 기준선 표에 적고 멈춘다 — 분류 규칙이나 진입점 정의 오류 신호). 이어서 `unresolvedNonAsset=0` 출력(이미지·스타일 외 해석 실패 0 — `@/mdx` 28건이 사라져야 함)
  - Happy path (분류 known-answer): 아래 → `ok`

    ```bash
    node -e '
    const m = require("./.tmp/demo-removal/route-map.json");
    const cls = Object.fromEntries(m.entries.map((e) => [e.path, e.class]));
    const keep = ["app/page.js","app/not-found.js","app/01-main-demo/page.js","app/(courses)/(lessons)/lesson/[id]/page.js","app/(courses)/course-details/page.js","app/(courses)/course-details/[courseId]/page.js","app/(courses)/all-courses/page.tsx","app/(courses)/create-course/page.js","app/(pages)/checkout/success/page.tsx","app/instructor/page.tsx"];
    const del = ["app/26-islamic-center/page.js","app/(courses)/(lessons)/lesson/page.js","app/(courses)/(lessons)/lesson-assignments-submit/page.js","app/(pages)/profile/[profileId]/page.js","app/(blogs)/blog-details/[slug]/page.js","app/(courses)/course-detail-2/[courseId]/page.js"];
    const bad = [...keep.filter((p) => cls[p] !== "keep"), ...del.filter((p) => cls[p] !== "del")];
    console.log(bad.length ? "BAD " + bad.join(",") : "ok"); process.exit(bad.length ? 1 : 0);'
    ```

  - Happy path (삭제 known-answer + 허용 루트 가드): 아래 → `bad 0 outside 0`

    ```bash
    node -e '
    const m = require("./.tmp/demo-removal/route-map.json");
    const d = new Set(m.deleteFiles.map((f) => f.path));
    const mustDel = ["components/Course-Details/CourseDetails-Two.js","app/(pages)/profile/index.js"];
    const mustKeep = ["components/Course-Details/CourseDetails-One.js","components/Header/Nav.js","components/Header/NavProps/ElementsLayout.js","components/Lesson/LessonSidebar.js","components/Lesson/LessonQuiz.js","data/MegaMenu.json","data/footer.json","data/lesson.json","data/course-details/courseData.json","data/createCourse.json","app/lib/course-providers/DemoCourseProvider.js","mdx/index.js"];
    const bad = [...mustDel.filter((p) => !d.has(p)), ...mustKeep.filter((p) => d.has(p))];
    const outside = [...d].filter((p) => !/^(app|components|data|mdx)\//.test(p) || /^app\/(api|lib|\(dashboard\)|\(auth\))\//.test(p));
    console.log("bad", bad.length, "outside", outside.length); process.exit(bad.length || outside.length ? 1 : 0);'
    ```

  - Edge case (결정성): `node scripts/demo-removal/route-map.mjs map && sha1sum .tmp/demo-removal/route-map.json`을 두 번 → 해시 동일
  - Edge case (작업 트리 = 태그): `node scripts/demo-removal/route-map.mjs plan` 후 아래 → `same`

    ```bash
    node -e 'const k=(f)=>require(f).deleteFiles.map((x)=>x.path+"@"+x.phase).join("\n");const s=k("./.tmp/demo-removal/route-map.json")===k("./.tmp/demo-removal/plan.json");console.log(s?"same":"diff");process.exit(s?0:1)'
    ```

  - Negative (게이트가 문다): 지금 `node scripts/demo-removal/route-map.mjs verify` → exit 1, `del-entries-remaining=119`
  - Negative (고아 탐지가 문다 — 변이 검사, 저장소 밖 임시 worktree): 아래 → `phase 7`, 마지막 줄 `1`. 대조군: 변이 없는 `.tmp/demo-removal/plan.json`에는 `ElementsLayout.js`가 없다(위 known-answer의 mustKeep)

    ```bash
    WT="$(cygpath -m "$(mktemp -d)")/wt"
    git worktree add --detach "$WT" pre-demo-removal
    sed -i '/^import ElementsLayout/d' "$WT/components/Header/Nav.js"
    node scripts/demo-removal/route-map.mjs plan --root "$WT" --out .tmp/demo-removal/mutation-plan.json
    node -e 'const p=require("./.tmp/demo-removal/mutation-plan.json");const f=p.deleteFiles.find((x)=>x.path==="components/Header/NavProps/ElementsLayout.js");console.log("phase",f&&f.phase);process.exit(f&&f.phase===7?0:1)'
    git worktree remove --force "$WT"
    git worktree list | wc -l
    ```

  - Format: `npx prettier@3.5.3 --check scripts/demo-removal` → exit 0 · `npm run type-check` → exit 0
  - 기록: `map` 첫 줄 값, `Content.js`·`LessonAssignmentsSubmit.js`(`components/Lesson/LessonAssignmentsSubmit.js`)의 판정을 기준선 표에 적는다

- [ ] T003 경로 문자열 검사 스크립트와 링크 기준선 — `scripts/demo-removal/check-route-links.mjs` (depends on T002) `category:ultrabrain`
  **Goal**: 작업 트리에서 KEEP 진입점이 닿는 파일의 경로 문자열 중 삭제(예정) 라우트를 가리키는 것과 어느 라우트에도 없는 것을 `파일:줄 분류 문자열`로 모두 내고, Phase 1 기준선 수치를 기록한다. 이 출력이 Phase 2 작업 목록이다.
  **Spec**:
  1. **라우트 표**: 작업 트리의 `page.*`·`route.*` 진입점 → URL 패턴(`(group)` 세그먼트 제거, `[x]` = 동적 1세그먼트, `[...x]`·`[[...x]]` = 나머지 전부). T002 분류로 DEL 진입점은 삭제 라우트, 나머지는 유지 라우트(`graph.mjs` 재사용 — 유지 라우트를 손으로 적지 않는다)
  2. **스캔 범위**: KEEP 진입점이 닿는 코드 파일(`.js .jsx .ts .tsx .mjs .json`). 소비자 루트(테스트·scripts)는 제외
  3. **추출**: 따옴표·백틱 문자열 리터럴 중 `/`로 시작하고 `//`로 시작하지 않으며 공백이 없는 것. `?`·`#` 뒤는 버리고, `${…}`와 `[x]`는 동적 세그먼트로 본다. 제외: `/` 한 글자, 자산(확장자 `png jpg jpeg gif svg webp ico css scss mp4 pdf woff woff2 ttf json txt xml` 또는 `/images/` `/fonts/` `/_next/` 접두), 앞 공백 제거 후 `//`·`*`·`/*`로 시작하는 주석 줄
  4. **판정**: 유지 라우트와 일치하면 보고 안 함 · 삭제 라우트와만 일치하면 `del-route` · 어느 라우트와도 불일치하면 `missing`. 세그먼트 수가 다르면 불일치(`/lesson` ≠ `/lesson/[id]`)
  5. **출력**: 첫 줄 `del-route=<n> missing=<m> nav-missing=<k>`(`nav-missing` = `data/MegaMenu.json`·`data/footer.json`의 missing), 이후 정렬된 `<file>:<line> <del-route|missing> <원문 리터럴>`
  6. **exit**: `del-route>0` 또는 `nav-missing>0`이면 1. `--report-only`면 항상 0(스크립트 오류 제외). `--root DIR` 지원
  **References** (known-answer 근거 — 모두 원문 확인):
  - `app/(courses)/course-details/index.js:71` — `router.push('/course-filter-one-toggle')` → `del-route`
  - `app/(courses)/course-details/page.js:11` — `router.push('/course-details/1')` → 유지 동적 라우트라 보고되면 안 됨
  - `data/lesson.json:9,18` — `"/lesson"`, `"/lesson-intro"` → 둘 다 `del-route`
  - `components/Course-Details/Course-Sections/course-head.js:25` — 템플릿 리터럴 `/course-detail-2/${path.courseId}` → `del-route`
  - `components/01-Main-Demo/01-Main-Demo.js:188` — `href="/blog"` → 라우트 자체가 없어 `missing`
  - `data/footer.json:11,27` — `"/12-marketplace"` → `del-route`, `"/pages/faqs"` → `missing`(nav)
  - `components/Header/Nav.js:132` — `href="/all-courses"` → 보고되면 안 됨
  **Must NOT do**: 파일 수정 금지(보고만). 유지·삭제 라우트 목록 하드코딩 금지. 삭제 대상 파일(`plan` 목록)을 스캔하지 않는다.
  **QA Scenarios**:
  - Happy path: `node scripts/demo-removal/check-route-links.mjs --report-only > .tmp/demo-removal/links-baseline.txt` → exit 0, `head -n 1 .tmp/demo-removal/links-baseline.txt`의 세 값이 모두 1 이상 → 기준선 표에 기록
  - Happy path (known-answer): 아래 6개 명령이 각각 `1`

    ```bash
    F=.tmp/demo-removal/links-baseline.txt
    grep -cxF 'app/(courses)/course-details/index.js:71 del-route /course-filter-one-toggle' $F
    grep -cxF 'data/lesson.json:9 del-route /lesson' $F
    grep -cxF 'data/lesson.json:18 del-route /lesson-intro' $F
    grep -cF 'components/Course-Details/Course-Sections/course-head.js:25 del-route /course-detail-2/' $F
    grep -cxF 'components/01-Main-Demo/01-Main-Demo.js:188 missing /blog' $F
    grep -cxF 'data/footer.json:27 missing /pages/faqs' $F
    ```

  - Negative (과검출 방지): `grep -c 'course-details/page.js:11' .tmp/demo-removal/links-baseline.txt` → `0` · `grep -c 'components/Header/Nav.js:132 ' .tmp/demo-removal/links-baseline.txt` → `0`
  - Negative (스캔 범위): 아래 → `in-deleted 0`

    ```bash
    node -e '
    const fs = require("fs");
    const d = new Set(require("./.tmp/demo-removal/route-map.json").deleteFiles.map((f) => f.path));
    const lines = fs.readFileSync(".tmp/demo-removal/links-baseline.txt", "utf8").trim().split("\n").slice(1);
    const hit = lines.filter((l) => d.has(l.slice(0, l.lastIndexOf(":", l.indexOf(" ")))));
    console.log("in-deleted", hit.length); process.exit(hit.length ? 1 : 0);'
    ```

  - Edge case (게이트가 문다): `node scripts/demo-removal/check-route-links.mjs > /dev/null; echo $?` → `1`(지금은 `del-route`·`nav-missing`가 0보다 큼)
  - Format: `npx prettier@3.5.3 --check scripts/demo-removal` → exit 0 · `npm run type-check` → exit 0

- [ ] T004 매핑 문서 생성기와 복구 기록 초안 — `scripts/demo-removal/render-doc.mjs`, `docs/library/histudy-demo-removal.md` (depends on T002, T003) `category:writing`
  **Goal**: `node scripts/demo-removal/render-doc.mjs --date 2026-09-16 --links .tmp/demo-removal/links-baseline.txt`가 `docs/library/histudy-demo-removal.md`(계획본, `lifecycle: draft`)를 생성하고, 삭제 진입점 119개와 삭제 파일 전부가 라우트 섹션 99개에 복구 명령과 함께 들어간다. Phase 7(T018)은 같은 생성기를 `--final`로 돌려 실제 삭제 기준으로 확정한다.
  **문서 구조 계약 (생성기가 고정 출력 — 손 편집 금지)**:
  1. **front-matter**: `title: "HiStudy 데모 삭제 기록 (T2)"`, tags `type/docs`·`component/ui`·`progress/in-progress`(`--final`이면 `progress/completed`), `created: 2026-09-16`, `updated: <--date>`, `lifecycle: draft`(`--final`이면 `active`). LF 줄바꿈
  2. **삭제 집합**: 계획본 = `route-map.json`의 `deleteFiles`. `--final` = `git diff --name-only --diff-filter=D 'pre-demo-removal^{commit}' HEAD -- app components data mdx`
  3. **`## 개요`**: 목적 한 문단, 기준 태그와 커밋(`baseCommit`), 생성 명령, "이 문서는 `scripts/demo-removal/render-doc.mjs`의 생성물이다 — 손으로 고치지 말고 다시 생성한다"
  4. **`## 복구 방법`**: 전체 복구 명령(아래 "삭제한 파일 전체 목록" 블록을 읽어 `xargs -d '\n' git checkout pre-demo-removal --`), 화면 하나 복구는 각 섹션의 명령
  5. **`## 되살릴 때 알아둘 점`**: 고정 문구 + 계산값 — (a) 메뉴·링크·경로 분기는 유지 파일에서 지웠으므로 화면 파일만 되살리면 메뉴에 나오지 않는다: 수정한 유지 파일 목록(`--final`: `--diff-filter=M` 결과, 계획본: "Phase 2 이후 채워짐") (b) 섹션 명령에는 다른 삭제 화면과 함께 쓰던 파일도 들어 있다 — 중복 복구는 무해 (c) T5(Next 15·React 19) 이후에는 되살린 파일이 전환되지 않은 상태다 (d) SCSS·이미지는 지우지 않았다 (e) `.prettierignore`에서 뺀 항목
  6. **`## 요약`**: 그룹(삭제 Phase)별 라우트 섹션 수·진입점 수·삭제 파일 수 표
  7. **그룹별 `## <그룹명>` 아래 `### <route>` 섹션**(예: `### /12-marketplace`, 동적 하위 라우트 포함). 섹션 안은 제목이 아닌 굵은 라벨(MD024 중복 제목 방지): **진입 파일** · **함께 삭제한 컴포넌트** · **함께 삭제한 데이터** · **쓰던 유지 파일(삭제 안 함)** = `reachFiles` − 삭제 집합 중 `components/`·`data/` · **복구 명령** = ```` ```bash ```` 블록 1개, `git checkout pre-demo-removal -- \` 다음 줄마다 경로 하나(진입 파일 + 섹션 폴더 아래 삭제 파일 전부 + `reachFiles` ∩ 삭제 집합)
  8. **`## 화면에 속하지 않는 삭제 파일`**: 삭제 집합 중 어느 섹션 복구 명령에도 없는 파일(편집으로 생긴 고아 등)과 그 복구 명령
  9. **`## 삭제하지 않은 후보`**: `notDeletedCandidates`, `alreadyDead`(예: 이미 죽은 위젯), `packagesOnlyInDeleted`(npm 의존성 — T5 참고)
  10. **`## 기존 링크 결함`**: `--links` 파일의 `missing` 중 헤더·푸터 데이터 밖 항목(기록만)
  11. **`## 삭제한 파일 전체 목록`**: ```` ```text ```` 블록, 한 줄에 경로 하나, 정렬 — F6·F7·전체 복구가 이 블록을 읽는다
  12. 결정성: 같은 입력 → 같은 바이트. 시각·절대 경로·사용자명 금지. 본문 H1은 front-matter `title`과 겹쳐 MD025가 날 수 있으므로 markdownlint 결과에 맞춘다
  **References**:
  - `scripts/verify-frontmatter.mjs:27-39,53` — 허용 태그값·필수 5필드, `\n` 기준 파싱(CRLF면 front-matter 인식 실패)
  - `.markdownlint.json` — MD013·MD033·MD041만 끔. MD024(중복 제목)·MD025(H1 하나)·MD040(코드 블록 언어) 등은 켜짐
  - `docs/CLAUDE.md` "3) 수명주기" — Work Plan은 삭제, Library가 영구 근거
  - `docs/library/course-automation.md:1-10` — 기존 library 문서 형식 참고(단 `status` 키·`type/library` 태그는 검사기 기준 위반 사례 — 따르지 않는다)
  **Must NOT do**: 생성된 문서를 손으로 고치지 않는다(생성기를 고친다). 유지 파일 경로를 복구 명령에 넣지 않는다. `docs/work-plans/` 경로를 링크로 걸지 않는다(Work Plan은 삭제 예정 — 링크 검사 실패 원인).
  **QA Scenarios**:
  - Happy path: 위 Goal 명령 → exit 0 · `grep -c '^### /' docs/library/histudy-demo-removal.md` → `99`
  - Happy path (빠짐 없음): 아래 → `missing 0`

    ```bash
    node -e '
    const fs = require("fs");
    const m = require("./.tmp/demo-removal/route-map.json");
    const doc = fs.readFileSync("docs/library/histudy-demo-removal.md", "utf8");
    const miss = [...m.entries.filter((e) => e.class === "del").map((e) => e.path), ...m.deleteFiles.map((f) => f.path)].filter((p) => !doc.includes(p));
    console.log("missing", miss.length); process.exit(miss.length ? 1 : 0);'
    ```

  - Happy path (복구 가능): 아래 → 첫 줄 = `route-map.json`의 `deleteFiles` 개수, 둘째 줄 `0`

    ```bash
    awk '/^## 삭제한 파일 전체 목록/{f=1;next} f&&/^```text/{g=1;next} g&&/^```/{exit} g' docs/library/histudy-demo-removal.md > .tmp/demo-removal/doc-D.txt
    wc -l < .tmp/demo-removal/doc-D.txt
    while IFS= read -r p; do git cat-file -e "pre-demo-removal:$p" 2>/dev/null || echo "MISSING $p"; done < .tmp/demo-removal/doc-D.txt | wc -l
    ```

  - Edge case (결정성): 생성 두 번 → `sha1sum docs/library/histudy-demo-removal.md` 동일
  - Edge case (문서 검사): `npx markdownlint-cli2 docs/library/histudy-demo-removal.md` → exit 0 · `node scripts/verify-frontmatter.mjs | grep -c 'histudy-demo-removal'` → `0`
  - Negative (유지 파일이 복구 명령에 섞이지 않음): `awk '/^```bash/{f=1;next} /^```/{f=0} f' docs/library/histudy-demo-removal.md | grep -cE 'components/Header/Nav\.js|data/MegaMenu\.json|data/lesson\.json|CourseDetails-One\.js'` → `0`
  - Format: `npx prettier@3.5.3 --check scripts/demo-removal` → exit 0

**Checkpoint**: 앱 코드 변경 0 — `git diff --stat 'pre-demo-removal^{commit}' HEAD -- app components data mdx public .prettierignore package.json` → 출력 없음 · 추가 파일 — `git diff --name-only --diff-filter=A 'pre-demo-removal^{commit}' HEAD` → `docs/library/histudy-demo-removal.md`와 `scripts/demo-removal/` 4개(`graph.mjs`, `route-map.mjs`, `check-route-links.mjs`, `render-doc.mjs`)만 · `npm run type-check && npm run lint && npm run format:check` → exit 0 · 기준선 표에 `미수집` 0칸

## Phase 2: 유지 코드의 삭제 예정 경로 참조 정리 (삭제 전)

**링크 대체 규칙 (D4)**:

- **R1 치환**: 같은 뜻의 유지 라우트가 있으면 바꾼다 — 코스 목록류(`/course-filter-*`, `/course-card-*`, `/course-with-*`, `/course-withtab-two`, `/course-masonry`) → `/all-courses`, 코스 상세 데모(`/course-detail-N/<id>`) → `/course-details/<id>`
- **R2 제거**: 없으면 링크를 없앤다 — JSX는 `Link`를 벗기고 표시 텍스트는 남긴다(예: 강사 이름). 데이터 파일은 같은 파일의 기존 관례값을 따르고(`data/lesson.json`은 `"#"` — `:42,50`), 메뉴 데이터는 항목째 삭제
- **R3 경로 분기**: `pathname` 비교에서 삭제 경로 항만 지우고, 유지 경로에서의 평가 결과는 바꾸지 않는다. 조건이 항상 거짓이 되면 그 분기 블록을 지운다. 편집한 조건마다 "유지 경로별 편집 전/후 결과" 표를 Implementation Log에 남긴다
- **R4 메뉴 구조**: 항목이 0개가 되는 메뉴 묶음은 렌더 코드에서 제거(Q2). 편집으로 안 쓰이게 된 import·변수는 같은 커밋에서 제거
- **R5 금지**: 컴포넌트 안 정적 데이터(문항·제목·설명)는 바꾸지 않는다 — 경로 값만. 삭제 대상 파일(`plan` 목록)은 고치지 않는다

- [ ] T005 [P] 헤더 메뉴·오프캔버스 링크 정리 — `data/MegaMenu.json`, `components/Header/**` (depends on T003; Q2) `category:visual-engineering`
  - Goal: 헤더·모바일 메뉴·장바구니 오프캔버스에 삭제 라우트 링크 0, 빈 메뉴 0, Home은 드롭다운 없이 `/` 단일 링크(Q2 확정)
  - DoD 방향: 검사 출력에 `data/MegaMenu.json`·`components/Header/` 줄 0, MegaMenu 몫 `nav-missing` 0, G3 grep 0
  - 영향: `Nav.js:7-447`, `NavProps/*`, `MobileMenu.js:9`, `Offcanvas/Cart.js:63,82`
- [ ] T006 [P] 푸터 링크 정리 — `data/footer.json`, `components/Footer/**` (depends on T003) `category:quick`
  - Goal: 푸터 데이터·저작권 줄에 삭제·불일치 링크 0
  - DoD 방향: 검사 출력에 `data/footer.json`·`components/Footer/` 줄 0
  - 영향: `data/footer.json:11-49,82-120`, `CopyRight.js:29`
- [ ] T007 [P] 코스 상세·목록 영역의 리다이렉트·링크·경로 분기 정리 — `app/(courses)/course-details/**`, `components/Course-Details/**`, `components/Category/**`, `components/Cards/**` (depends on T003) `category:ultrabrain`
  - Goal: 실제 코스 상세·목록 화면이 삭제 라우트로 이동·링크·분기하지 않고, 유지 경로에서의 렌더 결과는 그대로
  - DoD 방향: 검사 출력에 이 영역 줄 0, R3 표 기록, build 통과
  - 영향: `course-details/index.js:71,79`(R1 → `/all-courses`), `Course-Sections/{course-head.js,Viedo.tsx,Overview.js,Featured.js,Course-Menu.js,Course-Action-Bottom.js,Instructor.js,RelatedCourse.js,SimilarCourses.js}`, `Course-Sections/Breadcrumb/*`, `Category/{CategoryHead.js,CategoryHeadTwo.js}`, `Cards/Card.js:83,103` — T003 출력에 나온 파일만
- [ ] T008 [P] 레슨 영역 링크 정리 — `data/lesson.json`, `components/Lesson/**` (depends on T003) `category:quick`
  - Goal: 실제 레슨 화면(`lesson/[id]`)의 사이드바·퀴즈가 삭제 라우트로 링크하지 않는다(가짜 문항·사이드바 제목은 그대로)
  - DoD 방향: 검사 출력에 이 영역 줄 0, `__tests__/components/LessonContent.test.tsx` 통과
  - 영향: `data/lesson.json`의 `lssonLink` 13개(R2 → `"#"`), `LessonQuiz.js:179`, `LessonSidebar.js:87`
- [ ] T009 [P] 홈의 블로그 결합·`/blog` 링크 정리 — `app/01-main-demo/**`, `components/01-Main-Demo/**` (depends on T003; Q1) `category:visual-engineering`
  - Goal (Q1 확정안 A): 홈이 `@/mdx`를 import하지 않고 블로그 섹션이 없으며 `/blog` 링크 0
  - DoD 방향: `git grep -nE "@/mdx|getAllPostsMeta|BlogGridTop" -- app/01-main-demo components/01-Main-Demo` → 0줄, 검사 출력에 이 영역 줄 0, build 통과
  - 영향: `app/01-main-demo/page.js:2,10`, `app/01-main-demo/(main-demo)/index.tsx:13-28`(`getBlog` prop), `components/01-Main-Demo/01-Main-Demo.js:16,175-203`
- [ ] T010 [P] 나머지 영역 정리 — T003 출력 중 T005~T009 영역 밖 파일(예: `components/Abouts/About-Two.js:121`) (depends on T003) `category:quick`
  - Goal: 위 영역 밖 유지 코드의 삭제 라우트 참조 0
  - DoD 방향: 착수 직전 파일 목록을 확정하고(T005~T009 영역과 겹침 0), 검사 출력의 남은 줄 0
- [ ] T011 Phase 2 제3자 검증 (validator 항상 + 적대축 opt-in) — `docs/work-plans/histudy-demo-cleanup.md` (depends on T005, T006, T007, T008, T009, T010) `category:quick`
  - Goal: Phase 2 수정 파일에 validator PASS, 적대축은 사용자 opt-in 시 `adversarial-round` 결과 반영 또는 거절 기록
  - DoD 방향: Implementation Log에 validator 판정·적대축 결과(또는 거절) 기록, 지적 반영 후 Tier 1 재통과

**Checkpoint**: `node scripts/demo-removal/check-route-links.mjs` → exit 0(`del-route=0`, `nav-missing=0`, `missing` ≤ 기준선) · `node scripts/demo-removal/route-map.mjs verify` → `del-entries-remaining=119`(아직 안 지움) · G3 grep → `0` · Tier 1 전부 통과, jest 수치 = 기준선

## Phase 3: 번호 데모 홈 24개 삭제

- [ ] T012 데모 홈 삭제 커밋 — `app/02-course-school/` ~ `app/26-islamic-center/` 외 `plan --phase 3` 목록 (depends on T011) `category:quick`
  - Goal: `plan --phase 3 --list` 목록 전부 `git rm`, 다른 파일 수정 0
  - DoD 방향: 커밋의 변경이 삭제(D)뿐, `verify` → `del-entries-remaining=95`, Tier 1 통과
- [ ] T013 `.prettierignore`의 삭제 경로 항목 정리 — `.prettierignore` (depends on T012) `category:quick`
  - Goal: 존재하지 않게 된 `components/18~26-*` 항목(`.prettierignore:51-57`) 제거
  - DoD 방향: 남은 경로 항목마다 `test -e` 통과, `npm run format:check` exit 0

**Checkpoint**: Tier 1 통과 · `check-route-links.mjs` exit 0 · 남은 데모 화면(Phase 4~6 대상)도 build에 포함되어 통과

## Phase 4: 요소·페이지·코스·퀴즈 데모 삭제

- [ ] T014 데모 삭제 커밋 — `app/(elements)/`, `app/(pages)/` 데모 11개 폴더, `app/(courses)/` 데모 17개 폴더, 퀴즈 데모 6개 외 `plan --phase 4` 목록 (depends on T013) `category:quick`
  - Goal: `plan --phase 4 --list` 목록 전부 `git rm`, 다른 파일 수정 0
  - DoD 방향: `verify` → `del-entries-remaining=24`, `app/(courses)/course-details/[courseId]/page.js`·`app/(courses)/all-courses/page.tsx` 존재, Tier 1 통과

**Checkpoint**: Tier 1 통과 · `check-route-links.mjs` exit 0

## Phase 5: lesson 데모 6개·profile 삭제

- [ ] T015 lesson 데모·profile 삭제 커밋 — `app/(courses)/(lessons)/lesson/page.js`, `app/(courses)/(lessons)/lesson-*/`, `app/(pages)/profile/` 외 `plan --phase 5` 목록 (depends on T014) `category:quick`
  - Goal: `plan --phase 5 --list` 목록 전부 `git rm`, 다른 파일 수정 0
  - DoD 방향: `verify` → `del-entries-remaining=16`, `app/(courses)/(lessons)/lesson/[id]/page.js` 존재, `LessonContent.test.tsx` 포함 Tier 1 통과

**Checkpoint**: Tier 1 통과 · `check-route-links.mjs` exit 0

## Phase 6: 블로그 삭제

- [ ] T016 블로그 삭제 커밋 — `app/(blogs)/`, `mdx/index.js`, `data/blog/**` 외 `plan --phase 6` 목록 (depends on T015, T009; Q1) `category:quick`
  - Goal: `plan --phase 6 --list` 목록 전부 `git rm`, 다른 파일 수정 0
  - DoD 방향: `verify` → `del-entries-remaining=0`, `git grep -nE "data/blog|@/mdx" -- app components` → 0줄(Q1 A), Tier 1 통과

**Checkpoint**: Tier 1 통과 · `check-route-links.mjs` exit 0

## Phase 7: 고아 정리·기록 확정·조립 검증

- [ ] T017 편집으로 생긴 고아 삭제 — `plan --phase 7` 목록(예: `components/Header/NavProps/ElementsLayout.js`) (depends on T016) `category:quick`
  - Goal: Phase 2 편집으로 아무도 안 쓰게 된 파일 삭제
  - DoD 방향: `node scripts/demo-removal/route-map.mjs verify` → exit 0
- [ ] T018 매핑 문서 최종 재생성 — `docs/library/histudy-demo-removal.md` (depends on T017, T004) `category:writing`
  - Goal: `node scripts/demo-removal/check-route-links.mjs --report-only > .tmp/demo-removal/links-final.txt` 후 `render-doc.mjs --final --date <작업일> --links .tmp/demo-removal/links-final.txt`로 실제 `git diff` 기준 재생성, `lifecycle: active`, `progress/completed`
  - DoD 방향: F6~F10 통과
- [ ] T019 ROADMAP T2 상태 갱신 — `docs/ROADMAP.md` (depends on T018) `category:writing`
  - Goal: `docs/ROADMAP.md:50` T2 행을 완료로, 기록 문서 경로 추가, 변경 이력 한 줄, `updated` 갱신
  - DoD 방향: `git diff docs/ROADMAP.md`가 그 행·이력 표·front-matter·버전 줄만
- [ ] T020 조립 후 validator — `docs/work-plans/histudy-demo-cleanup.md` (depends on T019) `category:quick`
  - Goal: 전체 변경(수정 + 삭제 목록)에 validator PASS, Implementation Log 기록
- [ ] T021 조립 후 적대축 1회 (opt-in) — `docs/work-plans/histudy-demo-cleanup.md` (depends on T020) `category:quick`
  - Goal: 사용자 opt-in 시 `adversarial-round` 실행·지적 반영 후 Tier 1 재통과, 거절 시 거절 기록

**Checkpoint**: `route-map.mjs verify` exit 0 · `check-route-links.mjs` exit 0 · Tier 1 통과 · Final Verification 착수 가능

---

## Task Dependency Graph

| Task | Depends On | Reason |
|------|-----------|--------|
| T001 | None | 기준선 확인은 독립 |
| T002 | None | 판정 스크립트는 독립 |
| T003 | T002 | `graph.mjs`의 분류·도달 계산을 재사용 |
| T004 | T002, T003 | `route-map.json`과 링크 기준선을 문서에 넣음 |
| T005 | T003 | 링크 검사 출력이 작업 목록 |
| T006 | T003 | 같음 |
| T007 | T003 | 같음 |
| T008 | T003 | 같음 |
| T009 | T003 | 같음 (+ Q1 답) |
| T010 | T003 | 같음 |
| T011 | T005, T006, T007, T008, T009, T010 | Phase 2 수정 전체를 검증 |
| T012 | T011 | 참조 정리가 끝나야 삭제 |
| T013 | T012 | 폴더가 사라진 뒤 ignore 항목 제거 |
| T014 | T013 | Phase 순서(뒤 그룹 파일 보호) |
| T015 | T014 | 같음 |
| T016 | T015, T009 | Phase 순서 + 홈의 블로그 결합 제거 선행 |
| T017 | T016 | 모든 진입점 삭제 뒤 고아 판정 |
| T018 | T017, T004 | 실제 삭제 확정 후 생성기로 재생성 |
| T019 | T018 | 기록 문서 경로를 로드맵에 적음 |
| T020 | T019 | 조립 완료본을 검증 |
| T021 | T020 | validator 지적 반영 후 적대축 |

- 의존은 더 이른 Phase 또는 같은 Phase의 앞선 task만 가리킨다. 이 표의 행 집합 = Category 표의 행 집합 = Phase 헤더 아래 task 집합

---

## Parallel Execution Graph

```text
Phase 1 (즉시 시작):
├── T001: 기준선 확인과 기록 (deps: 없음)            → [P]
├── T002: 라우트·파일 판정 스크립트 (deps: 없음)      → [P]
├── T003: 경로 문자열 검사 (deps: T002)               → [P] 없음, T002 후 순차
└── T004: 매핑 문서 생성기·초안 (deps: T002, T003)    → [P] 없음, T003 후 순차

Phase 2 (Phase 1 완료 + Q1·Q2 답 후):
├── T005: 헤더 메뉴·오프캔버스 (deps: T003)           → [P]
├── T006: 푸터 (deps: T003)                           → [P]
├── T007: 코스 상세·목록 영역 (deps: T003)            → [P]
├── T008: 레슨 영역 (deps: T003)                      → [P]
├── T009: 홈 블로그 결합 (deps: T003)                 → [P]
├── T010: 나머지 영역 (deps: T003)                    → [P]
└── T011: 제3자 검증 (deps: T005~T010)                → 순차

Phase 3: T012 (deps: T011) → T013 (deps: T012)
Phase 4: T014 (deps: T013)
Phase 5: T015 (deps: T014)
Phase 6: T016 (deps: T015, T009)
Phase 7: T017 (deps: T016) → T018 (deps: T017, T004) → T019 → T020 → T021

Critical Path: T002 → T003 → T007 → T011 → T012 → T013 → T014 → T015 → T016 → T017 → T018 → T019 → T020 → T021
```

---

## Category + Skills

| Task | Category | Category Reason | Skills Included | Skills Omitted (Why) |
|------|----------|----------------|-----------------|----------------------|
| T001 | quick | 명령 실행·기록만 | - | - |
| T002 | ultrabrain | 삭제 완결성을 좌우하는 그래프·Phase 배정 로직 | - | frontend-ui-ux: UI 없음 |
| T003 | ultrabrain | 라우트 패턴 매칭·동적 세그먼트 판정 | - | - |
| T004 | writing | 문서 구조가 핵심인 생성기 | - | - |
| T005 | visual-engineering | 헤더 메뉴 렌더 구조 변경 | frontend-ui-ux | - |
| T006 | quick | 데이터 값·링크 1곳 | - | - |
| T007 | ultrabrain | 유지 경로 결과를 보존하는 조건식 단순화 | - | - |
| T008 | quick | 데이터 값·링크 2곳 | - | - |
| T009 | visual-engineering | 홈 섹션 제거 | frontend-ui-ux | - |
| T010 | quick | 잔여 링크 값 | - | - |
| T011 | quick | 검증 오케스트레이션·기록 | - | - |
| T012 | quick | 목록 기반 삭제 | - | - |
| T013 | quick | 설정 줄 삭제 | - | - |
| T014 | quick | 목록 기반 삭제 | - | - |
| T015 | quick | 목록 기반 삭제 | - | - |
| T016 | quick | 목록 기반 삭제 | - | - |
| T017 | quick | 목록 기반 삭제 | - | - |
| T018 | writing | 생성기 재실행·문서 확정 | - | - |
| T019 | writing | 로드맵 표 갱신 | - | - |
| T020 | quick | 검증 오케스트레이션·기록 | - | - |
| T021 | quick | 검증 오케스트레이션·기록 | - | - |

---

## Final Verification

- [ ] F1. 삭제·보존 판정 — `node scripts/demo-removal/route-map.mjs verify` → exit 0, 출력에 `del-entries-remaining=0`, `delete-candidates-remaining=0`, `keep-entries-present=71/71`
- [ ] F2. 참조 0건 — `node scripts/demo-removal/check-route-links.mjs` → exit 0, 첫 줄 `del-route=0`·`nav-missing=0`, `missing` ≤ 기준선. 그리고 `git grep -nE "data/blog|@/mdx|mdx/index" -- app components scripts __tests__ tests ':!scripts/demo-removal'` → 0줄(Q1 A 기준)
- [ ] F3. Tier 1 — `npm run type-check && npm run lint && npm run format:check && npm run build` → exit 0, Test Strategy의 jest 명령 → 기준선과 같은 `Test Suites`·`Tests` 수
- [ ] F4. CI 가드 — `.github/workflows/lint-check.yml:63-110`(글꼴·react-pdf)과 `:130-144`(skip 금지)의 run 스크립트를 Bash로 그대로 실행 → 각 exit 0
- [ ] F5. 범위 밖 불변 — `git diff --name-only 'pre-demo-removal^{commit}' HEAD -- public progress.json app/lib app/api 'app/(dashboard)' 'app/(auth)' package.json package-lock.json` → 0줄
- [ ] F6. 매핑 문서 == 실제 삭제 — 아래 → `SAME`

  ```bash
  git diff --name-only --diff-filter=D 'pre-demo-removal^{commit}' HEAD -- app components data mdx | sort > .tmp/demo-removal/diff-D.txt
  awk '/^## 삭제한 파일 전체 목록/{f=1;next} f&&/^```text/{g=1;next} g&&/^```/{exit} g' docs/library/histudy-demo-removal.md | sort > .tmp/demo-removal/doc-D.txt
  diff .tmp/demo-removal/diff-D.txt .tmp/demo-removal/doc-D.txt && echo SAME
  ```

- [ ] F7. 문서의 모든 삭제 경로가 태그에 존재 — `while IFS= read -r p; do git cat-file -e "pre-demo-removal:$p" 2>/dev/null || echo "MISSING $p"; done < .tmp/demo-removal/doc-D.txt | wc -l` → `0`
- [ ] F8. 복구 실연(읽기 전용 임시 worktree) — 아래 → `RESTORED`, 마지막 줄 `1`

  ```bash
  WT="$(cygpath -m "$(mktemp -d)")/wt"
  git worktree add --detach "$WT" HEAD
  CMD=$(awk '/^### \/12-marketplace$/{f=1} f&&/^```bash/{g=1;next} g&&/^```/{exit} g' docs/library/histudy-demo-removal.md)
  (cd "$WT" && eval "$CMD") && test -f "$WT/app/12-marketplace/page.js" && echo RESTORED
  git worktree remove --force "$WT"
  git worktree list | wc -l
  ```

- [ ] F9. 문서 검사 — `npx markdownlint-cli2 docs/library/histudy-demo-removal.md` → exit 0 · `node scripts/verify-frontmatter.mjs | grep -cE 'histudy-demo-(removal|cleanup)'` → `0`
- [ ] F10. 생성 결정성 — T018과 같은 인자로 `node scripts/demo-removal/render-doc.mjs --final --date <T018 날짜> --links .tmp/demo-removal/links-final.txt` 재실행 → `git diff --exit-code docs/library/histudy-demo-removal.md` exit 0
- [ ] F11. 제3자 검증 기록 — Read로 Implementation Log 확인: validator 판정 2건(T011, T020) PASS, 적대축 결과 또는 사용자 거절 2건(T011, T021)
- [ ] F12. PR CI (사용자 승인으로 PR 생성 후) — `gh pr checks <PR 번호>` → `ci-checks` pass. `Docs Validation`은 pass이거나, 실패 시 오류 파일 목록에 `docs/library/histudy-demo-removal.md`가 없고 기준선 결론과 같은 기존 원인

---

## Implementation Log

_(Phase 시작 후 누적 — 기준선 차이, R3 편집 전/후 표, validator·적대축 결과, 사용자 답)_
