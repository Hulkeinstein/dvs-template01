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

> **Status**: Active — Phase 2 상세화 완료, 실행 대기
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
- `components/Header/Offcanvas/Cart.js:65,84` `/event-details/${data.id}`(2026-09-16 Phase 2 refine에서 `:63,82` 정정), `components/Footer/CopyRight.js:29` `/subscription`, `data/footer.json:11-49,82-120` 데모 홈·블로그 링크 + 기존 불일치(`/pages/faqs`, `/elements/team`, `/pages/event-list`)
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

### Decisions (2026-09-16 Phase 2 refine 추가)

- **D12 메뉴 항목 처리**: 헤더·푸터 메뉴 데이터(`data/MegaMenu.json`, `data/footer.json`)의 삭제 라우트 항목은 R1 치환 대신 항목째 삭제한다. 근거: Q2("Courses·Pages는 남는 항목만")가 R1보다 우선이고, 제목은 R5로 못 바꾸므로 경로만 `/all-courses`로 바꾸면 "Filter One Toggle" 같은 데모 레이아웃 이름 10개가 같은 목적지로 남는다(`/all-courses`는 이미 `components/Header/Nav.js:132` Courses 최상위 링크). 기존 불일치(missing, D9)는 제목과 뜻이 1:1로 맞는 유지 라우트가 있으면 R1(`/pages/faqs` → `/faqs`), 없으면 삭제. JSX의 한 줄짜리 링크 목록 항목(`components/Footer/CopyRight.js:28-30`의 `<li>`)도 같다. 렌더 코드가 더 이상 읽지 않는 데이터 묶음(`home`·`grid-item-3`·`grid-item-5` 객체, `gridMenuItems4` 키)은 통째로 삭제(R4)
- **D13 JSX 링크의 R2**: `Link`와 그 안의 요소·클래스는 그대로 두고 `href`만 `"#"`로 바꾼다(원안 R2의 "`Link`를 벗긴다"를 대체). 근거: (1) 같은 컴포넌트의 옆 링크 관례가 `href="#"`(`Course-Breadcrumb.js:115`, `Card.js:106`, `RelatedCourse.js:110`, `SimilarCourses.js:96`, `CourseFilterOneToggle.tsx:111`) (2) 벗기면 `className="px-1"` 간격(`Course-Breadcrumb.js:112`, `Card.js:103`)과 `a`에 걸린 SCSS(`public/scss/template/_course-details.scss:19-25` — 커리큘럼 행 flex 배치)가 빠져 유지 화면 렌더가 바뀐다(R3 취지 위반) (3) "표시 텍스트 유지"는 그대로 충족
- **D14 `courseData.json`의 `linkTwo`**: `"linkTwo": "/profile",` 줄 171개를 필드째 삭제한다. 근거: `linkTwo`를 읽는 코드는 `components/Cards/Card-Three.js:68,78`(`data/elements/card.json`을 읽음)과 `components/Blogs/BlogDetails.js:173,201`(블로그 데이터)뿐이라 `courseData.json`의 이 필드를 읽는 코드는 데모 화면까지 포함해 0 → 렌더 영향 0, 되살린 데모에도 영향 0. 같은 파일에 "링크 없음" 관례값이 없어(`"link…": "#"` 0건) R2의 관례값 규칙을 적용할 수 없다. `"#"` 치환도 렌더 영향은 0이지만 읽는 곳 없는 필드를 남긴다
- **D15 장바구니 항목 링크**: `components/Header/Offcanvas/Cart.js:63-67,82-86`과 `components/Cart/CartItems.tsx:43-51`은 코스 상세 주소 하나로 합친다(R1). 근거: 유지 화면에서 장바구니에 담기는 것은 코스뿐(`Viedo.tsx:92-100`이 `kind: 'course'`로 정규화). `Cart.js`의 `data.product.title` 조건은 DB 코스에서도 참이라(`app/lib/course-providers/DatabaseCourseProvider.ts:176-177`이 `title`을 채움) 지금 실제 코스를 이벤트 상세로 보낸다 — 이벤트 분기만 `"#"`로 바꾸면 실제 코스 링크가 죽는다. 이벤트·상품(데모 화면에서만 담김)은 코스 상세 조회 실패 뒤 `/all-courses`로 이동(T007 이후)
- **D16 검사기 개수 비교**: T003 Spec 6의 `new-missing`((파일, 리터럴) 집합 비교)을 T022에서 (파일, 리터럴)별 개수 비교로 바꾼다(validator 주의 (가)). T003 본문은 완료 기록이라 고치지 않고 T022 Spec이 그 계약을 대체한다
- **D17 복구 문서 표시 범위(validator 주의 (마))**: Phase 2가 고치는 `app/` 파일(`app/(courses)/course-details/index.js`, `app/01-main-demo/page.js`, `app/01-main-demo/(main-demo)/index.tsx`, U1=A면 `app/lib/constants/routes.ts`)은 `.tmp/demo-removal/route-map.json`의 어느 삭제 섹션 `reachFiles`에도 없다(2026-09-16 검색 0건) → `render-doc.mjs`의 `T2에서 수정됨` 표시 범위(`components/`·`data/`) 확장 불필요. Phase 2 Checkpoint 8이 명령으로 다시 확인하고, 0이 아니면 Implementation Log에 "T018 착수 전 표시 범위 확장 결정 필요"를 적는다

### 사용자 결정 (2026-09-16 확정)

- **Q1 홈 블로그 섹션 → A 확정**: 홈의 "Blog Post" 섹션과 `getAllPostsMeta` 호출을 지우고 `mdx/index.js`·`data/blog/**`·블로그 전용 컴포넌트까지 삭제(PRD "블로그 없음"과 일치). T009·T016에 반영
- **Q2 헤더 메뉴 모양 → 빈 메뉴 제거 확정**: 항목이 모두 삭제되는 Elements·Blog 메뉴는 `<li>`째 제거. **Home은 드롭다운 없이 메인 홈(`/`)으로 바로 가는 단일 링크**로 바꾼다(사용자가 승인한 문구 기준 — 이전 기본안의 "Home 드롭다운 구조 유지"를 대체). Courses·Pages는 남는 항목만. T005에 반영

### 사용자 결정 (Phase 2 refine에서 발견 — 2026-09-16 확정)

- **U1 → A 확정(2026-09-16, 한 줄 수정 + F5 예외 1줄)** — `app/lib/constants/routes.ts:62` `ABOUT: '/about'`**: 삭제 라우트(`app/(elements)/about`)를 가리켜 Phase 2 Checkpoint의 `del-route=0`을 막는데, `app/lib`은 F5 불변 목록에 있다. 사용처는 0(`ROUTES.PUBLIC.ABOUT`은 같은 파일 `:156` 타입 합집합에만 나온다). **A(권장)**: 1줄 R1 치환 `'/about-us-01'`(유지 라우트 `app/(pages)/about-us-01/page.js`) + 승인 시 오케스트레이터가 F5 명령에 `':!app/lib/constants/routes.ts'` 예외를 추가 · **B**: 고치지 않음 → Phase 2 Checkpoint 1과 F2가 `del-route=1`(이 줄만)을 허용하도록 승인 시 F2 수정. T010의 이 항목이 대기
- **U2 → A 확정(2026-09-16, 변화 받아들이고 기록)** — 실제 레슨 화면 사이드바 모양 변화**: `data/lesson.json`의 `"/lesson"` 값이 실제 주소 `/lesson/<id>`와 접두어로 맞아(`components/Lesson/LessonSidebar.js:13` `startsWith`) 지금 실제 레슨 화면에서 가짜 항목 "Course Intro"·"Hello World!"가 활성 표시되고 "Welcome Lessons" 묶음이 펼쳐지며 배지가 `1/3`이다. R2로 `"#"`를 넣고 배지 식의 삭제 경로 항을 지우면 이 셋이 사라진다(활성 0·전부 접힘·`0/3`) — R3 "유지 경로 결과 불변"의 유일한 예외. 테스트는 사이드바를 mock해(`__tests__/components/LessonContent.test.tsx:19`) 이 변화를 못 본다. **A(권장)**: 변화를 수용하고 T008 R3 표에 예외로 기록(사이드바 내용은 가짜 정적 데이터 — 실데이터 교체는 OUT) · **B**: T008 보류 → 성공 기준 2를 못 채워 T2 완료 불가, 레슨 사이드바 실데이터화를 별도 트랙으로. T008 전체가 대기

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
| 2 | ultrabrain(T007·T022) 외 | 아니오 — 인증·인가·API 파일 변경 없음 | 아니오 — 수정만, 되돌리기 쉬움 | 예 — 공유 Header·Footer·Course-Sections·Category·Lesson | 예 | **ON** — T011, 사용자 opt-in 필요. T022(검사 도구)는 변이 검사로 확인하고 적대 대상은 런타임 파일로 고정 |
| 3~6 | quick | 아니오 | **예 — 파일 삭제**. 완화: 원격 태그, 복구 문서, 배포 워크플로 없음 | 아니오 | 아니오 | 삭제 자체는 `verify`·build 기계 판정. 삭제 목록 판정은 Phase 7 라운드에 포함 |
| 7 | quick·writing | 아니오 | 예 — 고아 삭제 | 아니오 | 아니오 | **ON** — T021 조립 후 1회, 사용자 opt-in 필요 |

- **plan 전체 판정: 적대축 ON** — 비가역(삭제) 행과 다중 모듈 행에 해당. 태그로 복구 가능해도 fail-safe 기본값을 유지한다
- 실행 형식: `adversarial-round` workflow만(에이전트 직접 호출 금지). `targets` = 그 시점까지 **수정(M)**된 런타임 파일(`git diff --name-only --diff-filter=M 'pre-demo-removal^{commit}' HEAD -- app components data`), Phase 7 라운드는 여기에 삭제 목록 판정(`.tmp/demo-removal/plan.json`)을 더한다. `constraints` = 이 문서의 D1~D17·R1~R5·OUT 목록·Q1/Q2 답·U1/U2 답(D12~D17·U1/U2는 Phase 2 refine에서 추가). 재개 시 같은 `args`를 다시 싣고, 종료·중단 뒤 첫 동작은 `git status`
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
- [ ] **Phase 2 추가 검사**: (a) 영역 한정 링크 검사 — `--baseline .tmp/demo-removal/links-baseline.txt` 출력에서 task 영역의 `del-route`·`missing-new` 0줄 (b) R3 전/후 평가 — 태그 트리 유지 진입점의 URL 목록에 편집 전·후 조건식을 `node -e`로 평가(컴포넌트를 순수 함수로 빼지 않는다, Phase 2 공통 절차의 R3 명령) (c) JSON 데이터는 `JSON.parse` 통과 (d) 레슨 사이드바는 테스트가 mock하므로(`__tests__/components/LessonContent.test.tsx:19`) 렌더 변화는 R3 표·U2·T011 validator로 본다
- [ ] **도구 자체 검증 (Phase 1)**: known-answer(알려진 파일:줄이 기대 분류로 나옴) · negative control(유지 경로는 안 나옴) · 변이 검사(import를 지운 임시 worktree에서 고아가 잡힘)
- [ ] **제3자 검증**: validator(항상) + 적대축(opt-in) — T011, T020·T021
- **하지 않는 것**: dev server 기동·E2E(Playwright는 서버 필요 — AI 서버 기동 금지). 화면 육안 확인은 사용자가 원할 때만

## 기준선 (T001·T002·T003이 채움)

| 항목 | 값 |
|---|---|
| 태그 대상 커밋 | `91d9fd9541217e68312dd6f8c0cca4eb1b80991c` — `git rev-parse 'pre-demo-removal^{commit}' origin/main` 두 줄 동일 |
| 태그 원격 존재 | 있음 — `git ls-remote --tags origin refs/tags/pre-demo-removal \| wc -l` → `1` |
| 코드 트리 == 태그 | 같음 — `git diff --stat 'pre-demo-removal^{commit}' HEAD -- app components data mdx public scripts .prettierignore package.json package-lock.json` 출력 없음 |
| husky 훅(`git config --get core.hooksPath`) | 미설치 — hooksPath 빈 값, `.git/hooks/pre-commit` 없음 (2026-09-16 확인) |
| type-check / lint / format:check / build | 전부 exit 0 — lint 0 errors/167 warnings(any·exhaustive-deps, 기존 결함), build는 폰트 오류 없이 1회 만에 성공 |
| jest Test Suites / Tests | `Test Suites: 17 passed, 17 total` / `Tests: 133 passed, 133 total`, exit 0 — 기대값과 일치 |
| Docs Validation 최근 결론 | 최근 3건 모두 failure — main(2026-09-16) 1건, `chore/repo-hygiene-ci`(2026-09-15~16) 2건. 기존 문서 결함(T6 범위)로 판단 |
| 이 계획서 git 최초 작성일 | 2026-01-01 (`git log --follow --diff-filter=A`, front-matter 반영 완료) |
| `route-map.mjs map` entries / keep / del / sections | `entries=190 keep=71 del=119 sections=99` — 기대값과 일치 |
| `check-route-links.mjs` del-route / missing / nav-missing | `del-route=378 missing=51 nav-missing=7` — `--report-only` exit 0, 스캔 389파일(KEEP 도달 − 소비자 − 삭제 대상), 같은 줄의 같은 리터럴은 1건으로 셈 |
| `Content.js`·`LessonAssignmentsSubmit.js` 판정 | `components/Course-Details/Course-Sections/Content.js` 유지 — `deleteFiles` 미포함(KEEP `app/(courses)/course-details/[courseId]/page.js`가 닿음) · `components/Lesson/LessonAssignmentsSubmit.js` 삭제 — `deleteFiles` 포함, phase 5 |

## Gap Probe (역검증 — DoD를 100% 채웠는데 Goal에 못 미치는 시나리오)

- **G1 실제 화면 오삭제**: 분류 정규식이 유지 진입점을 삭제로 잡으면 build·링크 검사는 통과해도(그 화면으로 가는 링크까지 같이 지워짐) 실제 기능이 사라진다 → 성공 기준 1에 "유지 71개 전부 존재", T002 known-answer에 유지 진입점 10개 고정, F1이 `keep-entries-present=71/71` 확인
- **G2 import 밖 참조**: `fs` 읽기(`mdx/index.js:5`)·`jest.mock` 문자열처럼 import 그래프에 안 보이는 참조를 놓쳐 "아무도 안 씀"으로 잘못 판정하면, 동적 렌더 화면은 build를 통과하고 실행 때 깨진다 → T002 Spec에 런타임 읽기 규칙·`jest.mock` 인식, F2에 삭제한 `data/blog`·`mdx` 경로 문자열의 유지 코드 참조 0건 검사
- **G3 빈 메뉴**: JSON 항목만 지우면 링크 검사 0건·build 통과인데 실제 화면 헤더에 빈 Elements·Blog 드롭다운이 남는다(`Nav.js:284-447`) → R4 + Phase 2 Checkpoint에 `grep -cE 'ElementsLayout|grid-item-5' components/Header/Nav.js` → `0`(Q2 확정안 기준 — Home도 드롭다운 없는 단일 링크)
- **G4 분기 단순화 오류**: `CategoryHead.js:147-153`처럼 삭제 경로와 유지 경로(`/all-courses`)가 OR로 섞인 조건에서 유지 경로 쪽 결과가 바뀌면, 링크 검사·build는 통과해도 코스 목록 화면 모양이 바뀐다 → R3(유지 경로 평가 결과 불변 + 편집 전후 표 기록) + T011 validator·적대축 targets에 포함
- **G5 홈↔블로그 결합**: 블로그 폴더만 지우면 홈이 `data/blog`를 못 읽어 build(정적 홈 렌더) 또는 실행이 깨진다 → Q1, T009를 삭제(T016)보다 앞 Phase에 배치
- **G6 레슨 사이드바 접두어 결합 (Phase 2 refine)**: `data/lesson.json`을 `"#"`로 바꾸면 링크 검사·build·jest(사이드바 mock)는 통과해도 실제 레슨 화면의 활성 항목·펼침·배지가 바뀐다 → U2 + T008 R3 표에 예외 명시 + T011 validator
- **G7 링크 벗기기 렌더 회귀 (Phase 2 refine)**: R2 원안대로 `Link`를 벗기면 검사·build는 통과해도 `px-1` 간격·`a` 대상 SCSS가 빠져 코스 상세·카드 배치가 바뀐다 → D13(`href="#"`) + T007·T023 QA의 `<Link` 개수 보존 검사
- **G8 기준선 집합 비교 가림 (Phase 2 refine)**: 같은 파일에 이미 있던 missing 리터럴을 하나 더 만들면 `new-missing=0`으로 통과한다(validator 재현) → D16·T022(개수 비교 + 변이 검사)
- **G9 메뉴 인덱스 범위 (Phase 2 refine)**: `components/Header/NavProps/CourseLayout.js:21,47`이 `innerIndex < num`·`> num`으로 열을 나눠, Courses 항목 18개를 지우면 링크 검사·build는 통과해도 둘째 열이 빈다 → T005가 둘째 `CourseLayout` 제거 + `<CourseLayout` 1개 검사
- **G10 도달 끊김으로 빠지는 줄 (Phase 2 refine)**: `course-head.js` 편집으로 `CourseBreadcrumb-Two/Three/Four/Six.js`의 del-route 5줄, 홈 편집으로 `BlogGrid-Top.js` 6줄이 파일 수정 없이 검사에서 빠진다. 파일이 안 지워지면 링크가 남은 코드가 트리에 남는다 → T007·T009 QA와 Phase 2 Checkpoint 4가 `plan --phase 7/6 --list` 포함을 확인, 최종은 F1
- **G11 `app/lib` 불변과 삭제 라우트 상수 충돌 (Phase 2 refine)**: `app/lib/constants/routes.ts:62` `/about`은 고치면 F5, 안 고치면 Checkpoint·F2가 실패한다 → U1
- G1~G5(계획 시)와 G6~G11(Phase 2 refine)을 반영한 뒤 새 반례를 구성하지 못했다

---

# 섹션 3 — 할 일 (Tasks)

> **task 라인 규격**: `- [ ] T001 [P] 설명 — 파일경로` (T는 3자리·마침표 없음, `[P]`는 선택, `— 경로` 필수)
> **상세도 차등 (ADR 0001 D2)**: Phase 1(완료)·Phase 2 완벽본, Phase 3~7은 skeleton — 착수 직전 refine(`grep -n`으로 file:line stale 재확인)해 완벽본으로 채운다

## Phase 1: 기준선·검증 도구·복구 기록 초안 (Foundational)

- [x] T001 [P] 기준선 확인과 기록 — `docs/work-plans/histudy-demo-cleanup.md` `category:quick`
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

- [x] T002 [P] 라우트·파일 판정 스크립트 — `scripts/demo-removal/graph.mjs`, `scripts/demo-removal/route-map.mjs` `category:ultrabrain`
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
  - Happy path: `node scripts/demo-removal/route-map.mjs map` → exit 0, 첫 줄 `entries=190 keep=71 del=119 sections=99`(값이 다르면 기준선 표에 적고 멈춘다 — 분류 규칙이나 진입점 정의 오류 신호). 이어서 `unresolvedNonAsset=4` 출력(2026-09-16 T002 확정 기준값: 주석 처리된 import 2건[`app/lib/auth/adminTokenProd.js:88`, `redux/store.js:5`] · 해석 폴더 밖 루트 `package.json` 1건[`scripts/automation/pre-push-guard.js:73`] · TS식 `.js` 표기 1건[`tests/utils/test-helpers.ts:6` → 로컬 import 없는 `test-providers.tsx`] — 모두 삭제 판정 영향 없음을 오케스트레이터가 원문 확인. `@/mdx` 28건은 사라짐)
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

- [x] T003 경로 문자열 검사 스크립트와 링크 기준선 — `scripts/demo-removal/check-route-links.mjs` (depends on T002) `category:ultrabrain`
  **Goal**: 작업 트리에서 KEEP 진입점이 닿는 파일의 경로 문자열 중 삭제(예정) 라우트를 가리키는 것과 어느 라우트에도 없는 것을 `파일:줄 분류 문자열`로 모두 내고, Phase 1 기준선 수치를 기록한다. 이 출력이 Phase 2 작업 목록이다.
  **Spec**:
  1. **라우트 표**: 작업 트리의 `page.*`·`route.*` 진입점 → URL 패턴(`(group)` 세그먼트 제거, `[x]` = 동적 1세그먼트, `[...x]`·`[[...x]]` = 나머지 전부). T002 분류로 DEL 진입점은 삭제 라우트, 나머지는 유지 라우트(`graph.mjs` 재사용 — 유지 라우트를 손으로 적지 않는다). 삭제 라우트는 태그 트리의 DEL 진입점에서 만든다(화면 파일을 지운 뒤에도 그 주소로 가는 링크가 `missing`이 아닌 `del-route`로 남게).
  2. **스캔 범위**: KEEP 진입점이 닿는 코드 파일(`.js .jsx .ts .tsx .mjs .json`). 소비자 루트(테스트·scripts)는 제외
  3. **추출**: 따옴표·백틱 문자열 리터럴 중 `/`로 시작하고 `//`로 시작하지 않으며 공백이 없는 것. `?`·`#` 뒤는 버리고, `${…}`와 `[x]`는 동적 세그먼트로 본다. 제외: `/` 한 글자, 자산(확장자 `png jpg jpeg gif svg webp ico css scss mp4 pdf woff woff2 ttf json txt xml` 또는 `/images/` `/fonts/` `/_next/` 접두), 앞 공백 제거 후 `//`·`*`·`/*`로 시작하는 주석 줄
  4. **판정**: 유지 라우트와 일치하면 보고 안 함 · 삭제 라우트와만 일치하면 `del-route` · 어느 라우트와도 불일치하면 `missing`. 세그먼트 수가 다르면 불일치(`/lesson` ≠ `/lesson/[id]`)
  5. **출력**: 첫 줄 `del-route=<n> missing=<m> nav-missing=<k>`(`nav-missing` = `data/MegaMenu.json`·`data/footer.json`의 missing), 이후 정렬된 `<file>:<line> <del-route|missing> <원문 리터럴>`
  6. **exit**: `del-route>0` 또는 `nav-missing>0`이면 1. `--report-only`면 항상 0(스크립트 오류 제외). `--root DIR` 지원. `--baseline FILE`(기준선 출력 형식)을 주면 `missing` 중 (파일 경로, 리터럴) 쌍이 기준선에 없는 것을 본문에 `missing-new`로 표시하고 첫 줄 끝에 공백 한 칸과 `new-missing=<n>`을 붙이며, `new-missing>0`이면 1이다.
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

- [x] T004 매핑 문서 생성기와 복구 기록 초안 — `scripts/demo-removal/render-doc.mjs`, `docs/library/histudy-demo-removal.md` (depends on T002, T003) `category:writing`
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
- **R2 제거**: 없으면 링크를 없앤다 — JSX는 `Link`·안의 요소·클래스를 그대로 두고 `href="#"`로(D13 — 원안의 "`Link`를 벗긴다"를 대체). 데이터 파일은 같은 파일의 기존 관례값을 따르고(`data/lesson.json`은 `"#"` — `:42,50`), 관례값이 없고 읽는 코드도 없는 필드는 필드째 삭제(D14), 메뉴 데이터와 한 줄짜리 링크 목록 항목은 항목째 삭제(D12)
- **R3 경로 분기**: `pathname` 비교에서 삭제 경로 항만 지우고, 유지 경로에서의 평가 결과는 바꾸지 않는다. 조건이 항상 거짓이 되면 그 분기 블록을 지운다. 편집한 조건마다 "유지 경로별 편집 전/후 결과" 표를 Implementation Log에 남긴다
- **R4 메뉴 구조**: 항목이 0개가 되는 메뉴 묶음은 렌더 코드에서 제거(Q2). 편집으로 안 쓰이게 된 import·변수는 같은 커밋에서 제거
- **R5 금지**: 컴포넌트 안 정적 데이터(문항·제목·설명)는 바꾸지 않는다 — 경로 값만. 삭제 대상 파일(`plan` 목록)은 고치지 않는다

**작업 목록 배정 (links-baseline 전수 — 2026-09-16 원문 확인)**:

| Task | 영역 | 편집 파일 수 | del-route | nav-missing | 편집 없이 사라지는 줄 |
|---|---|---|---|---|---|
| T022 | 검사 도구 | 1 | 0 | 0 | - |
| T005 | 헤더 메뉴·장바구니 | 6 | 102 | 1 | - |
| T006 | 푸터 | 2 | 11 | 6 | - |
| T007 | 코스 상세·목록 분기 | 10 | 44 | 0 | Breadcrumb Two·Three·Four·Six 5줄(도달 끊김) |
| T023 | 강사 프로필 링크 | 7 | 182 | 0 | - |
| T008 | 레슨 | 3 | 28 | 0 | - |
| T009 | 홈 블로그 결합 | 3 | 6 | 0 | `BlogGrid-Top.js` 6줄(도달 끊김) |
| T010 | 나머지 | 2(U1=A면 3) | 5 | 0 | - |
| 합계 | | 34(U1=A면 35) — `app`·`components`·`data`만 33(34) | 378 | 7 | |

- 기준선 분포 보정: 오케스트레이터 집계(합 372)에 없던 del-route 6줄 — `app/lib/constants/routes.ts:62`, `components/Abouts/About-Two.js:121`, `components/Category/CategoryOne.js:21`, `components/Category/Filter/CourseFilterOneToggle.tsx:122`, `Breadcrumb/CourseBreadcrumb-Four.js:72`, `Breadcrumb/CourseBreadcrumb-Six.js:34` — 을 위 표에 배정했다
- 헤더·푸터 밖 missing은 기록만(D9). 이번 편집으로 함께 없어지는 missing 4줄(`CategoryHead.js:127,177`, `LessonSidebar.js:83`, `01-Main-Demo.js:188`)은 분기·섹션 삭제의 부수 결과다
- 파일은 task끼리 겹치지 않는다. 다만 한 작업 트리에서 lint·링크 검사가 다른 task의 미커밋 편집까지 보므로 실행은 순차를 권장한다

**Phase 2 공통 절차 (T005~T010·T023 — 각 task QA가 참조)**:

1. **원문 재확인**: 착수 직전 편집 목록의 `파일:줄`마다 `sed -n '<줄>p' <파일>` → 목록의 원문과 같아야 한다. 다르면 편집하지 말고 Implementation Log에 정정 줄을 적은 뒤 새 줄 번호로 진행
2. **편집 → 포맷 → add**: 편집 → `npx prettier@3.5.3 --write -- <편집 파일>` → `git add -- <편집 파일>`(검사는 add 뒤 — validator 주의 (나))
3. **링크 검사 저장**: `node scripts/demo-removal/check-route-links.mjs --report-only --baseline .tmp/demo-removal/links-baseline.txt > .tmp/demo-removal/links-<task>.txt` → exit 0, `head -n 1` 끝이 `new-missing=0`
4. **영역 한정 검사**: `grep -E "^(<task의 AREA>):" .tmp/demo-removal/links-<task>.txt | grep -cE ' (del-route|missing-new) '` → `0`
5. **Tier 1**: `npm run type-check` → exit 0 · `npm run lint > .tmp/demo-removal/lint-<task>.txt 2>&1; echo $?` → `0`, `grep -E '^✖' .tmp/demo-removal/lint-<task>.txt` → `(0 errors, N warnings)`에서 N ≤ 167 · `npm run format:check` → exit 0. build·jest 전체는 Phase 2 Checkpoint에서 1회(T009는 task에서도 build)
6. **기록**: Implementation Log `### YYYY-MM-DD — Phase 2 <task>`에 (a) R1 치환 표 `| 파일:줄(편집 전) | 편집 전 경로 | 편집 후 경로 | 근거 |`(validator 주의 (라) — T011이 대조) (b) R3 표 `| 파일:줄(편집 전) | 편집 전 조건 | 편집 후 | 유지 경로 결과(전→후) |` + 아래 R3 명령의 마지막 줄 (c) 원문 정정 줄
7. **커밋**: task당 1커밋, `git commit -m "chore(demo): <task별 메시지>"`(2에서 add한 경로만, `--no-verify` 금지) → `git status --porcelain -- app components data scripts` → 출력 없음

**R3 평가 명령 (T005·T007·T008·T010)** — 태그 트리 유지 진입점(page)의 URL에 `[x]` → `x1`, 나머지 세그먼트 → `a/b`를 넣고, task가 주는 `C`(`[이름, 편집 전 식, 편집 후 식, router.pathname이면 1]`)를 평가한다. 편집 전 식이 `startsWith`·동적 id 비교면 접두어 비교로 넓혀(상위 집합) 적는다 — 넓힌 식이 거짓이면 원식도 거짓:

```bash
node -e '
const m = require("./.tmp/demo-removal/route-map.json");
const P = [...new Set(m.entries.filter((e) => e.class === "keep" && /\/page\.[jt]sx?$/.test(e.path)).map((e) => (e.route || "/").replace(/\[\[?\.\.\.[^\]]+\]\]?/g, "a/b").replace(/\[[^\]]+\]/g, "x1")))];
const C = [ /* task의 C 항목 */ ];
let d = 0;
for (const [n, b, a, u] of C) for (const p of u ? [...P, undefined] : P) { const x = b(p); const y = a(p); if (x !== y) { d += 1; console.log("DIFF", n, p, x, y); } }
console.log("keep-paths", P.length, "conds", C.length, "diff", d); process.exit(d ? 1 : 0);'
```

- [x] T022 기준선 비교를 (파일, 리터럴)별 개수로 보완 — `scripts/demo-removal/check-route-links.mjs` (depends on T003) `category:ultrabrain`
  **Goal**: `--baseline` 비교가 같은 파일에 이미 있던 missing 리터럴이 하나 더 생긴 경우도 `new-missing`으로 잡는다. 지금 트리의 출력은 `--baseline` 유무 모두 바이트 단위로 그대로다.
  **Spec (D16 — T003 Spec 6의 비교 방식을 대체)**:
  1. `readBaseline`은 missing 줄의 (파일, 리터럴)별 개수와 (파일, 줄, 리터럴) 집합을 함께 돌려준다. 첫 줄 수치·줄 형식 검사는 그대로
  2. 판정: 현재 missing을 (파일, 리터럴)로 묶어 기준선 개수 b와 현재 개수 c를 비교한다. `new-missing` = 묶음마다 max(0, c − b)의 합
  3. 표시: 묶음 안에서 기준선에 같은 (파일, 줄, 리터럴)이 있는 줄부터 기존 몫 b를 채우고, 남은 몫은 줄 번호 오름차순으로 채운 뒤 나머지 줄을 `missing-new`로 표시한다 → 본문 `missing-new` 줄 수 = `new-missing`
  4. 첫 줄 형식·정렬·exit 규칙·`--baseline` 없는 출력은 바꾸지 않는다. 머리 주석의 계약 위치 문장에 "`--baseline` 비교는 T022 Spec" 한 줄을 더한다
  **References**:
  - `scripts/demo-removal/check-route-links.mjs:219-261` — `pairKey`·`readBaseline`(지금 `Set` — 개수가 사라지는 지점)
  - `scripts/demo-removal/check-route-links.mjs:329-341` — `isNew`·출력 조립. 정렬은 원래 분류로 한 뒤 표시만 바꾼다(`.omo/notepads/histudy-demo-cleanup/learnings.md` T003 보완)
  - Implementation Log validator 2회차 주의 (가) — 재현: `LessonSidebar.js:87`을 같은 파일의 기존 missing `/quiz-passing-grade`로 바꾸면 `new-missing=0`
  **Must NOT do**: `graph.mjs`·`route-map.mjs`·`render-doc.mjs` 수정 금지. `.tmp/demo-removal/links-baseline.txt` 재생성 금지. 줄 번호를 개수 비교 키에 넣지 않는다(편집으로 줄이 밀린다). npm 의존성 추가 금지. 앱 코드 수정 금지.
  **QA Scenarios**:
  - 준비(Checkpoint 7의 기준값): `node scripts/demo-removal/route-map.mjs map > .tmp/demo-removal/map-out.txt && sha1sum .tmp/demo-removal/route-map.json` → 해시를 Implementation Log에 기록
  - Happy path (무회귀): `node scripts/demo-removal/check-route-links.mjs --report-only | cmp - .tmp/demo-removal/links-baseline.txt && echo SAME` → `SAME` · `node scripts/demo-removal/check-route-links.mjs --report-only --baseline .tmp/demo-removal/links-baseline.txt | head -n 1` → `del-route=378 missing=51 nav-missing=7 new-missing=0`
  - Negative (변이 — 검증자 재현. `978c63c`는 T022 전 검사기가 들어 있는 커밋이라 대조군이 된다): 아래 출력 줄이 차례로 `del-route=377 missing=52 nav-missing=7 new-missing=0`(구판 — 못 잡음) · `del-route=377 missing=52 nav-missing=7 new-missing=1` · `1` · `1` · `1`

    ```bash
    WT="$(cygpath -m "$(mktemp -d)")/wt"
    git worktree add --detach "$WT" 978c63c
    sed -i "87s#/lesson-quiz-result#/quiz-passing-grade#" "$WT/components/Lesson/LessonSidebar.js"
    node "$WT/scripts/demo-removal/check-route-links.mjs" --report-only --root "$WT" --baseline .tmp/demo-removal/links-baseline.txt | head -n 1
    node scripts/demo-removal/check-route-links.mjs --report-only --root "$WT" --baseline .tmp/demo-removal/links-baseline.txt > .tmp/demo-removal/t022-mut.txt
    head -n 1 .tmp/demo-removal/t022-mut.txt
    grep -c ' missing-new ' .tmp/demo-removal/t022-mut.txt
    grep -cxF 'components/Lesson/LessonSidebar.js:87 missing-new /quiz-passing-grade' .tmp/demo-removal/t022-mut.txt
    node scripts/demo-removal/check-route-links.mjs --root "$WT" --baseline .tmp/demo-removal/links-baseline.txt > /dev/null; echo $?
    ```

  - Edge case (줄 밀림은 새것이 아니다 — 같은 `$WT`): `git -C "$WT" checkout -- components/Lesson/LessonSidebar.js && sed -i '1s/^/\n/' "$WT/components/Lesson/LessonSidebar.js"` 후 새 검사기 `--report-only --root "$WT" --baseline …` 첫 줄 → `del-route=378 missing=51 nav-missing=7 new-missing=0`
  - Edge case (감소는 허용): `git -C "$WT" checkout -- components/Lesson/LessonSidebar.js && sed -i "83s#/quiz-passing-grade#/all-courses#" "$WT/components/Lesson/LessonSidebar.js"` 후 같은 명령 첫 줄 → `del-route=378 missing=50 nav-missing=7 new-missing=0`
  - 정리: `git worktree remove --force "$WT"` → `git worktree list | wc -l` → `1`
  - Format: `npx prettier@3.5.3 --check scripts/demo-removal` → exit 0 · `npm run type-check` → exit 0
  - 커밋: `git add -- scripts/demo-removal/check-route-links.mjs && git commit -m "chore(demo): count repeated missing links in baseline comparison"`

- [x] T005 헤더 메뉴·장바구니 링크 정리 — `data/MegaMenu.json`, `components/Header/Nav.js`, `components/Header/HeaderStyle-Ten.js`, `components/Header/Header-Top/HeaderTop-Eight.js`, `components/Header/Offcanvas/Cart.js`, `components/Cart/CartItems.tsx` (depends on T022; Q2) `category:visual-engineering`
  **Goal**: 헤더(데스크톱·모바일 공용 `Nav.js`)·장바구니에 삭제 라우트 링크 0, `data/MegaMenu.json` missing 0, 빈 메뉴 0, Home은 드롭다운 없는 `/` 단일 링크(Q2). 남는 메뉴 링크와 유지 경로 렌더 조건은 그대로.
  **편집 목록 (AREA = `data/MegaMenu\.json|components/Header/[^:]*|components/Cart/CartItems\.tsx`)**:
  1. `data/MegaMenu.json` (D12·Q2)
     - `:3-187` `"menuType": "home"` 객체 삭제 — Home 단일 링크라 렌더 코드가 안 읽음(del-route 24줄 `:19`~`:169`)
     - `grid-item-2` `menuItems`에서 `:220-259` 필터·카드·탭 10개, `:264-297` `course-detail-2~8` 7개, `:298-302` `/lesson` 삭제 → 남는 항목 `/course-details/1`, `/create-course`
     - `grid-item-4`: `gridMenuItems1` `:330-357` 7개 삭제(남음 `/about-us-01`) · `gridMenuItems2` `:360-363` `/profile`, `:372-375` `/team`, `:384-387` `/404`(nav-missing) 삭제(남음 5개) · `gridMenuItems3` `:394-402` `/shop`·`/single-product`, `:415-418` `/my-account`, `:423-426` `/subscription` 삭제(남음 4개) · `gridMenuItems4` `:428-453` 키 삭제(5개 전부 `/course-filter-one-toggle`)
     - `:455-601` Elements(`grid-item-3`) 객체, `:602-686` Blog(`grid-item-5`) 객체 삭제
  2. `components/Header/Nav.js` (Q2·R4)
     - import 삭제: `:3` `usePathname`, `:5` `Image`, `:10` `ElementsLayout`, `:12` `addImage` · `:16-17` `pathname`·`isActive` 삭제(Blog 메뉴 `:370,410`에서만 씀)
     - `:25-127` Home `<li>` 전체 → `<li>` 안에 `<Link href="/">Home</Link>` 하나(`components/Header/DashboardNav.js:52-59` 단일 링크 패턴)
     - `:175-181` 둘째 `CourseLayout`(`courseType={false}`, `num={9}`) 삭제 — G9
     - `:243-279` Pages의 `gridMenuItems4` 열 `div` 삭제 · `:284-341` Elements `<li>`, `:342-447` Blog `<li>` 삭제
  3. `components/Header/HeaderStyle-Ten.js:33` `'/16-udemy-affiliate' &&` 줄 삭제(R3 — 참값 상수 항이라 결과 불변)
  4. `components/Header/Header-Top/HeaderTop-Eight.js` (R3) — `:55-64` 삼항 → `:58-63` `<li>`만, `:95-122` 삼항 → `:98-121` `div`만, `:123-127` 삼항 → `rbt-separator` `div`만 · 안 쓰이게 된 `:3` `useRouter` import와 `:16` `router` 삭제(R4)
  5. `components/Header/Offcanvas/Cart.js:63-67`, `:82-86` — 삼항 식 전체를 `/course-details/${data.id}` 템플릿 리터럴 하나로(D15·R1)
  6. `components/Cart/CartItems.tsx:43-51` — `getProductLink` 본문을 `/course-details/${id}` 템플릿 리터럴 반환 한 줄로(D15·R1)
  **References**:
  - `components/Header/NavProps/CourseLayout.js:21,47` — 인덱스 범위로 열을 나눔(G9) · `components/Header/NavProps/PageLayout.js:17,42,67` — `gridMenuItems1~3`만 읽음(`gridMenuItems4`는 `Nav.js:248`만)
  - `data/MegaMenu.json` 소비자는 `components/Header/Nav.js:7` 하나(app·components 검색) — 객체째 삭제 근거
  - `components/Header/HeaderStyle-Ten.js:4,17`, `components/Header/Header-Top/HeaderTop-Eight.js:3,16` — `next/navigation`의 `useRouter()`에는 `pathname`이 없어 `router.pathname`은 늘 `undefined`(R3 평가에 `undefined` 포함)
  - D12·D15·Q2, Gap Probe G3·G9
  **Must NOT do**: `NavProps/*.js`·`MobileMenu.js`·`DashboardNav.js` 수정 금지(`DashboardNav.js:21,33` `/admin` missing은 헤더·푸터 데이터 밖 — D9 기록만). `ElementsLayout.js` 삭제 금지(T017 몫). 메뉴 제목·이미지·배지 문구와 남는 항목 순서 변경 금지(R5). `public/` 수정 금지. `.js`→TS 전환 금지(D6).
  **QA Scenarios** (공통 절차 1~7, task 이름 `T005`):
  - Happy path (영역·nav): 공통 절차 4 → `0` · `grep -c '^data/MegaMenu\.json:' .tmp/demo-removal/links-T005.txt` → `0`
  - Happy path (JSON 구조): 아래 → `grid-item-2,default-dropdown,grid-item-4 | /course-details/1,/create-course | 1 5 4 false`

    ```bash
    node -e '
    const m = JSON.parse(require("fs").readFileSync("data/MegaMenu.json", "utf8")).menuData;
    const g = m.find((x) => x.menuType === "grid-item-4");
    console.log(m.map((x) => x.menuType).join(","), "|", m.find((x) => x.menuType === "grid-item-2").menuItems.map((x) => x.link).join(","), "|", g.gridMenuItems1.length, g.gridMenuItems2.length, g.gridMenuItems3.length, "gridMenuItems4" in g);'
    ```

  - Happy path (G3·Q2·G9 구조): `grep -cE 'ElementsLayout|grid-item-5' components/Header/Nav.js` → `0` · `grep -c 'feather-chevron-down' components/Header/Nav.js` → `2`(Courses·Pages) · `grep -c '<CourseLayout' components/Header/Nav.js` → `1` · `grep -c 'gridMenuItems4' components/Header/Nav.js` → `0` · `grep -c '<Link href="/">Home</Link>' components/Header/Nav.js` → `1`
  - R3: 공통 R3 명령의 `C`에 아래 → `conds 4 diff 0`

    ```js
    ["HeaderStyle-Ten:32-34", (p) => p === "/01-main-demo" && "/16-udemy-affiliate" && "/01-main-demo", (p) => p === "/01-main-demo" && "/01-main-demo", 1],
    ["HeaderTop-Eight:55", (p) => p === "/10-online-course", () => false, 1],
    ["HeaderTop-Eight:95", (p) => p === "/10-online-course", () => false, 1],
    ["HeaderTop-Eight:123", (p) => p === "/10-online-course", () => false, 1],
    ```

  - Edge case (렌더 요소 보존): `grep -c 'router' components/Header/Header-Top/HeaderTop-Eight.js` → `0` · `grep -cE 'feather-phone|social-share-transparent|rbt-separator' components/Header/Header-Top/HeaderTop-Eight.js` → `3`
  - Edge case (고아 예고, 커밋 후): `node scripts/demo-removal/route-map.mjs plan --phase 7 --list | grep -cx 'components/Header/NavProps/ElementsLayout.js'` → `1`
  - Negative (유지 링크 보존): `grep -c 'href="/all-courses"' components/Header/Nav.js` → `1` · `grep -cE '"/(contact|become-a-teacher|faqs|privacy-policy|maintenance|cart|checkout|wishlist|login|about-us-01|dashboard|create-course)"' data/MegaMenu.json` → `12` · `grep -c '/course-details/' components/Header/Offcanvas/Cart.js` → `2` · `cat components/Header/Offcanvas/Cart.js components/Cart/CartItems.tsx | grep -cE 'event-details|single-product'` → `0`
  - 기록: R1 표 4행(`Cart.js` 2, `CartItems.tsx` 분기 2 — 입력 종류별 전/후: DB 코스·JSON 코스·이벤트·상품), R3 표 4행
  - 커밋 메시지: `chore(demo): drop demo menus and cart demo links from header`

- [x] T006 푸터 링크 정리 — `data/footer.json`, `components/Footer/CopyRight.js` (depends on T022) `category:quick`
  **Goal**: 푸터 데이터·저작권 줄에 삭제 라우트 링크 0, `data/footer.json` missing 0(D9). 소셜 링크·연락처 문구는 그대로.
  **편집 목록 (AREA = `data/footer\.json|components/Footer/[^:]*`)**:
  1. `data/footer.json` — `footerOne`(`:8-51`)·`footerTwo`(`:79-122`) 같은 구조, D12
     - `usefulLinks` `:9-24`, `:80-95` 데모 홈 4개씩 삭제 · `:27`, `:98` `"/pages/faqs"` → `"/faqs"`(R1 — 유지 라우트 `app/(pages)/faqs`, 제목 `FAQ`와 1:1)
     - `ourCompany` `:39-50`, `:110-121` `Blog`(`/blog-list`)·`Instructor`(`/elements/team`)·`Events`(`/pages/event-list`) 삭제 — 같은 뜻 유지 라우트 없음(`/team`·`/event-list`도 삭제 라우트)
  2. `components/Footer/CopyRight.js:28-30` — `/subscription` 링크 `<li>` 3줄 삭제(D12)
  **References**:
  - `components/Footer/Footer-One.js:69,129`, `Footer-Three.js:20,70`, `FooterFour.js:20,78`, `FooterProps/SingleFooter.js:11` — 배열을 그대로 map하므로 항목을 지워도 렌더 코드 수정 불필요
  - D9·D12, Gap Probe G3(빈 묶음 없음 — 각 목록에 1개 이상 남음)
  **Must NOT do**: `description`·`phone`·`mail`·`address`·`socialLink` 수정 금지(R5). `Footer-*.js`·`FooterProps/*` 수정 금지. 남는 항목 순서 변경 금지.
  **QA Scenarios** (공통 절차 1~7, task 이름 `T006`):
  - Happy path (영역·nav): 공통 절차 4 → `0` · `grep -c '^data/footer\.json:' .tmp/demo-removal/links-T006.txt` → `0`
  - Happy path (JSON): `node -e 'const f = JSON.parse(require("fs").readFileSync("data/footer.json", "utf8")); console.log(["footerOne", "footerTwo"].map((k) => f[k][0].usefulLinks.map((x) => x.link).join(",") + "|" + f[k][0].ourCompany.map((x) => x.link).join(",")).join(" "))'` → `/faqs|/contact,/become-a-teacher /faqs|/contact,/become-a-teacher`
  - Negative (문구 불변): `git diff --cached -U0 -- data/footer.json | grep -cE '^[-+] +"(description|descriptionTwo|phone|mail|address|icon)"'` → `0` · `grep -c 'https://www' data/footer.json` → `8`
  - Negative (저작권 줄): `grep -c '<li>' components/Footer/CopyRight.js` → `3` · `grep -cE 'href="/(privacy-policy|login)"' components/Footer/CopyRight.js` → `2`
  - 커밋 메시지: `chore(demo): drop demo and broken links from footer`

- [x] T007 코스 상세·목록의 리다이렉트·경로 분기 정리 — `app/(courses)/course-details/index.js`, `components/Course-Details/Course-Sections/{course-head.js,Viedo.tsx,Overview.js,Featured.js,Course-Menu.js,Course-Action-Bottom.js,Content.js}`, `components/Category/{CategoryHead.js,CategoryOne.js}` (depends on T022) `category:ultrabrain`
  **Goal**: 실제 코스 상세(`/course-details/[courseId]`)·목록(`/all-courses`)·홈 카테고리가 삭제 라우트로 이동·링크·분기하지 않고, 유지 경로에서 모든 조건의 평가 결과가 그대로다(R3 명령 `diff 0`). 데모 전용 브레드크럼 6개는 도달이 끊겨 Phase 7 고아가 된다.
  **편집 목록 (AREA = `app/\(courses\)/course-details/index\.js|components/Course-Details/Course-Sections/(course-head\.js|Viedo\.tsx|Overview\.js|Featured\.js|Course-Menu\.js|Course-Action-Bottom\.js|Content\.js|Breadcrumb/CourseBreadcrumb-(Two|Three|Four|Five|Six|Seven)\.js)|components/Category/(CategoryHead|CategoryOne)\.js`)**:
  1. `app/(courses)/course-details/index.js:71`, `:79` `router.push('/course-filter-one-toggle')` → `router.push('/all-courses')`(R1)
  2. `components/Course-Details/Course-Sections/course-head.js` (R3·R4) — `:25-36`와 `:62-164`의 `/course-detail-N/${path.courseId}` 분기 블록 7개 삭제(`:38-60` `/course-details/…` 블록만 남음) · `:9-10` `bgImage2`·`bgImage3`, `:12-17` `CourseBreadcrumbTwo~Seven` import 삭제
  3. `components/Course-Details/Course-Sections/Viedo.tsx` (R3·R4 — TS `no-unused-vars`가 error라 필수) — `:68-80` `disableVideo`·`isVideo` 선언 삭제 · `:247`의 `{!disableVideo ? (`와 `:275`의 `) : null}`를 걷어 `:248-274` 미리보기 `Link`를 무조건 렌더 · `:277-294` `isVideo` 블록 삭제 · `:228-239` `getEmbedUrl` 삭제(`:286`에서만 씀) · `:57` `pathname` 삭제, `:6` import에서 `usePathname`만 제거
  4. `Overview.js` — `:11-13` `addClass` 삭제, `:18` className의 `${addClass ? 'rbt-border-with-box' : 'mt--30'}` 자리를 `mt--30`으로 · `:7` `pathname`, `:3` import 삭제
  5. `Featured.js` — `:13-15` 삭제, `:20` 자리의 삼항을 `rbt-shadow-box`로 · `:10` `pathname`, `:7` import 삭제
  6. `Course-Menu.js` — `:11-13` `menuClass` 삭제, `:54-58` className을 `"mainmenu"`로(편집 전 결과는 끝에 공백 1칸이 붙은 "mainmenu" 문자열 — 클래스 토큰 동일, R3 표에 적는다) · `:8` `pathname`, `:3` import 삭제
  7. `Course-Action-Bottom.js` — `:15-20`을 `const isHide = ScrollPosition > 4365;` 한 줄로 · `:9` `path` 삭제, `:30` 의존성 `[path]` → `[]`, `:4` import에서 `usePathname`만 제거(`useRouter`는 원래 미사용 — 그대로)
  8. `Content.js:45` `<Link href="/lesson">` → `<Link href="#">`(D13 — `a`에 flex 배치)
  9. `components/Category/CategoryHead.js` (R3·R4, 유일한 유지 사용처 `app/(courses)/all-courses/index.tsx:10`)
     - `:44-47`·`:88` 삼항 제거 → `:48-87` 레이아웃 전환 `div` 무조건 렌더
     - `:52-59` → 클래스 `rbt-grid-view` 뒤 `${toggle ? 'active' : ''}` · `:70-77` → `${!toggle ? 'active' : ''}`
     - `:107-109`·`:124` 삼항 제거 → `:110-123` 검색 폼 무조건 렌더 · `:126-146` "Short By" 블록 삭제
     - `:147-153` 조건 → `pathname === '/all-courses'` 하나(G4)
     - `:170-174` → `<CourseFilter filterToggle={filterToggle} />` · `:176-224` 탭 블록 삭제 → 안 쓰이게 된 `:19` `activeTab`, `:21-25` `handleButtonClick`, 구조분해 `:12` `filterItem`·`:14` `setCourseFilter` 삭제(`:13` `courseFilter`는 원래 미사용 — 그대로)
  10. `components/Category/CategoryOne.js:21` — `/course-filter-one-toggle/${item.category}` 템플릿 리터럴 `href` → `href="/all-courses"`(R1 — 카테고리 필터는 사라진다, R1 표에 적는다)
  **References**:
  - `components/Course-Details/Course-Sections/course-head.js:12-17` — `CourseBreadcrumb-Two~Seven`의 유일한 import 지점(app·components 검색) → 편집 후 Phase 7 고아(G10)
  - `app/(courses)/course-details/index.js:19-22`, `components/Course-Details/CourseDetails-One.js:4-13` — 유지 상세가 쓰는 섹션 컴포넌트
  - `public/scss/template/_course-details.scss:19-25` — `.rbt-course-main-content li a` flex(D13)
  - `.eslintrc.json:14,23` — `.ts/.tsx`는 `@typescript-eslint/no-unused-vars` error, `.js`는 끔
  - Gap Probe G4·G7·G10, D13
  **Must NOT do**: `CourseBreadcrumb-*.js`·`Course-Breadcrumb.js`·`Instructor.js`·`RelatedCourse.js`·`SimilarCourses.js`·`Card.js` 수정 금지(T023·T017 몫). `CategoryHeadTwo.js` 수정 금지(검사 범위 밖). 유지 블록(`course-head.js:38-60`)의 마크업 변경 금지. 조건식을 순수 함수·공용 유틸로 빼지 않는다. `.js`→TS 전환 금지(D6).
  **QA Scenarios** (공통 절차 1~7, task 이름 `T007`):
  - Happy path (영역): 공통 절차 4 → `0`(브레드크럼 5줄은 도달 끊김으로 빠짐) · `grep -cF 'app/(courses)/course-details/index.js:' .tmp/demo-removal/links-T007.txt` → `0` · `grep -c "router.push('/all-courses')" 'app/(courses)/course-details/index.js'` → `2`
  - R3: 공통 R3 명령의 `C`에 아래 20개 → `conds 20 diff 0`(실행 중 links-T007에 남는 분기 줄이 있으면 조건을 추가하고 숫자를 갱신)

    ```js
    ...[2, 3, 4, 5, 6, 7, 8].map((k) => ["course-head:detail-" + k, (p) => p.startsWith("/course-detail-" + k + "/"), () => false]),
    ["Viedo:68-76", (p) => [2, 3, 4, 5, 6, 7, 8].some((k) => p.startsWith("/course-detail-" + k)), () => false],
    ["Viedo:78-80", (p) => p.startsWith("/course-detail-6"), () => false],
    ["Overview:11-13", (p) => p.startsWith("/course-detail-8"), () => false],
    ["Featured:13-15", (p) => p.startsWith("/course-detail-8"), () => false],
    ["Course-Menu:11-13", (p) => p.startsWith("/course-detail-8"), () => false],
    ["Course-Action-Bottom:16", (p) => p === "/course-detail-2/[courseId]", () => false],
    ["CategoryHead:44-45", (p) => p === "/course-card-3" || p === "/course-masonry", () => false],
    ["CategoryHead:53,71", (p) => p === "/course-card-2", () => false],
    ["CategoryHead:107", (p) => p === "/course-with-sidebar", () => false],
    ["CategoryHead:126-128", (p) => ["/course-with-tab", "/course-with-tab-two", "/course-with-sidebar"].includes(p), () => false],
    ["CategoryHead:147-153", (p) => ["/course-filter-two-open", "/course-filter-two-toggle", "/course-filter-one-toggle", "/all-courses", "/course-card-2", "/course-card-3", "/course-masonry"].includes(p), (p) => p === "/all-courses"],
    ["CategoryHead:170", (p) => p === "/course-filter-one-open", () => false],
    ["CategoryHead:176-178", (p) => ["/course-with-tab", "/course-with-tab-two", "/course-masonry"].includes(p), () => false],
    ```

  - Happy path (구조): `grep -c 'pathname' components/Course-Details/Course-Sections/Viedo.tsx` → `0` · `grep -cE 'CourseBreadcrumb(Two|Three|Four|Five|Six|Seven)|bgImage[23]' components/Course-Details/Course-Sections/course-head.js` → `0` · `grep -cF '/course-details/${path.courseId}' components/Course-Details/Course-Sections/course-head.js` → `1` · `grep -c 'pathname ===' components/Category/CategoryHead.js` → `1` · `grep -cE 'activeTab|handleButtonClick' components/Category/CategoryHead.js` → `0`
  - Edge case (D13 `Link` 보존): `grep -c '<Link' components/Course-Details/Course-Sections/Content.js` → `1` · `grep -c '<Link href="#">' components/Course-Details/Course-Sections/Content.js` → `1`
  - Edge case (고아 예고, 커밋 후): `node scripts/demo-removal/route-map.mjs plan --phase 7 --list > .tmp/demo-removal/p7-T007.txt` → `grep -cE '^components/Course-Details/Course-Sections/Breadcrumb/CourseBreadcrumb-(Two|Three|Four|Five|Six|Seven)\.js$' .tmp/demo-removal/p7-T007.txt` → `6`
  - Negative (유지 파일은 고아가 아니다): `grep -cE 'Breadcrumb/Course-Breadcrumb\.js$|Course-Sections/(course-head|Viedo|Content)\.' .tmp/demo-removal/p7-T007.txt` → `0`
  - 기록: R1 표 3행(`index.js` 2, `CategoryOne.js` 1), R3 표 20행 + 명령 마지막 줄
  - 커밋 메시지: `chore(demo): remove demo route branches from course detail and list`

- [x] T023 강사 프로필(`/profile`) 링크 정리 — `data/course-details/courseData.json`, `components/Cards/Card.js`, `components/Category/Filter/CourseFilterOneToggle.tsx`, `components/Course-Details/Course-Sections/{Breadcrumb/Course-Breadcrumb.js,Instructor.js,RelatedCourse.js,SimilarCourses.js}` (depends on T022) `category:quick`
  **Goal**: 삭제되는 `/profile` 화면을 가리키는 값 182줄이 0이 되고, 화면의 `Link`·클래스·표시 텍스트는 그대로다(D13·D14).
  **편집 목록 (AREA = `data/course-details/courseData\.json|components/Cards/Card\.js|components/Category/Filter/CourseFilterOneToggle\.tsx|components/Course-Details/Course-Sections/(Breadcrumb/Course-Breadcrumb|Instructor|RelatedCourse|SimilarCourses)\.js`)**:
  1. `data/course-details/courseData.json` — `"linkTwo": "/profile",` 171줄 삭제(D14, `similarCourse` 항목 안, 줄 목록은 `links-baseline.txt` 230~400행)
  2. `/profile/${…}` 템플릿 리터럴 `href` 10곳 → `href="#"`(D13): `components/Cards/Card.js:83,103` · `components/Category/Filter/CourseFilterOneToggle.tsx:122` · `Breadcrumb/Course-Breadcrumb.js:99,112` · `Instructor.js:15,29` · `RelatedCourse.js:99,109` · `SimilarCourses.js:83,94`

     ```bash
     sed -i '/^ *"linkTwo": "\/profile",$/d' data/course-details/courseData.json
     sed -i -E 's|href=\{`/profile/\$\{[A-Za-z.]+\}`\}|href="#"|' components/Cards/Card.js components/Category/Filter/CourseFilterOneToggle.tsx components/Course-Details/Course-Sections/Breadcrumb/Course-Breadcrumb.js components/Course-Details/Course-Sections/Instructor.js components/Course-Details/Course-Sections/RelatedCourse.js components/Course-Details/Course-Sections/SimilarCourses.js
     ```

  **References**:
  - `components/Cards/Card-Three.js:68,78`, `components/Blogs/BlogDetails.js:173,201` — `linkTwo`를 읽는 코드 전부(다른 데이터 파일을 읽음 — D14)
  - `Course-Breadcrumb.js:115`, `Card.js:106`, `RelatedCourse.js:110`, `SimilarCourses.js:96` — 옆 링크 `href="#"` 관례 · `Course-Breadcrumb.js:112`, `Card.js:103` — `className="px-1"`(D13)
  - `CourseFilterOneToggle.tsx:122`의 `data.id`는 코스 id라 원래도 강사 프로필이 아니었다 — 대체 주소를 찾지 않는 근거
  **Must NOT do**: `courseData.json`의 다른 필드·값 수정 금지(R5). `Link`를 벗기거나 클래스를 바꾸지 않는다(D13). `data/elements/card.json` 수정 금지(검사 범위 밖, 데모 삭제 대상). T007 파일 수정 금지.
  **QA Scenarios** (공통 절차 1~7, task 이름 `T023`):
  - Happy path (영역): 공통 절차 4 → `0`
  - Happy path (삭제 수·JSON): `git diff --cached --numstat -- data/course-details/courseData.json | cut -f1,2 | tr '\t' ' '` → `0 171` · `node -e 'const s = require("fs").readFileSync("data/course-details/courseData.json", "utf8"); JSON.parse(s); console.log(s.includes("linkTwo") ? "BAD" : "ok")'` → `ok`
  - Edge case (D13 `Link` 수 보존, 커밋 전): 아래 → `0`

    ```bash
    for f in components/Cards/Card.js components/Category/Filter/CourseFilterOneToggle.tsx components/Course-Details/Course-Sections/Breadcrumb/Course-Breadcrumb.js components/Course-Details/Course-Sections/Instructor.js components/Course-Details/Course-Sections/RelatedCourse.js components/Course-Details/Course-Sections/SimilarCourses.js; do [ "$(git show "HEAD:$f" | grep -c '<Link')" = "$(grep -c '<Link' "$f")" ] || echo "DIFF $f"; done | wc -l
    ```

  - Negative (남은 참조 0·간격 클래스 보존): `git grep -c '/profile/' -- components/Cards/Card.js components/Category/Filter components/Course-Details/Course-Sections` → 출력 없음 · `cat components/Cards/Card.js components/Course-Details/Course-Sections/Breadcrumb/Course-Breadcrumb.js | grep -c 'className="px-1" href="#"'` → `2`
  - 커밋 메시지: `chore(demo): unlink removed profile route from course cards and data`

- [ ] T008 레슨 영역 링크 정리 — `data/lesson.json`, `components/Lesson/LessonSidebar.js`, `components/Lesson/LessonQuiz.js` (depends on T022; U2) `category:quick`
  **선행**: U2 답. A면 아래대로, B면 이 task를 보류하고 Implementation Log에 적는다
  **Goal**: 실제 레슨 화면(`lesson/[id]`)의 사이드바·퀴즈가 삭제 라우트를 가리키지 않는다. 가짜 문항·사이드바 제목은 그대로이고, 유지 경로 결과 변화는 U2가 승인한 3가지(활성 항목·펼침·"Welcome Lessons" 배지)뿐이다.
  **편집 목록 (AREA = `data/lesson\.json|components/Lesson/[^:]*`)**:
  1. `data/lesson.json` — `lssonLink` 13줄(`:9,18,34,65,74,83,92,101,110,119,128,144,153`) → `"#"`(R2 — 같은 파일 관례 `:42,50`). 명령: `sed -i -E 's|"lssonLink": "/[^"]*"|"lssonLink": "#"|' data/lesson.json`
  2. `components/Lesson/LessonSidebar.js` 배지 식 4곳(R3) — `:71-89`, `:94-98`, `:103-107`, `:112-116`의 `isActive(…)` 삼항 사슬 전체를 `0`으로(렌더는 `0/` + 항목 수). `:13` `isActive`·`:11` `pathname`·`:4` import는 `:20,137,168,175`에서 계속 쓰므로 유지
  3. `components/Lesson/LessonQuiz.js:179` `href="/lesson-quiz-result"` → `href="#"`(D13 — `rbt-btn` 버튼형 `Link`)
  **References**:
  - `app/(courses)/(lessons)/lesson/[id]/LessonContent.js:6,10,122,140` — 실제 레슨 화면이 두 컴포넌트를 렌더
  - `components/Lesson/LessonSidebar.js:13,19-26` — `startsWith` 접두어 비교와 활성 묶음 계산(G6·U2)
  - `__tests__/components/LessonContent.test.tsx:19,60` — 두 컴포넌트 mock(테스트는 렌더 변화를 못 본다)
  **Must NOT do**: `lessonName`·`title`·`time`·`lessonQuiz` 등 정적 값 수정 금지(R5). 배지 삼항 구조를 넘어서 사이드바를 재작성하지 않는다. `LessonQuiz.js`의 하드코딩 문항 수정 금지(OUT). `components/Lesson/LessonQuizResult.js` 등 삭제 대상 수정 금지.
  **QA Scenarios** (공통 절차 1~7, task 이름 `T008`):
  - Happy path (영역): 공통 절차 4 → `0`
  - Happy path (데이터): `grep -c '"lssonLink": "#"' data/lesson.json` → `15` · `grep -c '"lssonLink": "/' data/lesson.json` → `0` · `git diff --cached -U0 -- data/lesson.json | grep -E '^[-+] ' | grep -vc 'lssonLink'` → `0`
  - Happy path (식): `grep -cE "isActive\('/" components/Lesson/LessonSidebar.js` → `0` · `grep -c 'isActive(' components/Lesson/LessonSidebar.js` → `4`
  - R3 (U2 예외 확인): 공통 R3 명령의 `C`에 아래 5개 → exit 1, `DIFF` 정확히 3줄(`Welcome History /lesson/x1 1 0` — 제목이 데이터에 없어 렌더 안 됨, `Welcome Lessons /lesson/x1 1 0`, `lesson.json-isActive /lesson/x1 true false`), 마지막 줄 `conds 5 diff 3`. 이 밖의 `DIFF`가 있으면 멈춘다

    ```js
    ["Histudy Quiz", (p) => ["/questions-types", "/all-questions", "/pagination-quiz", "/single-question", "/quiz-with-point", "/quiz-with-custom-timer", "/quiz-passing-grade", "/lesson-quiz", "/lesson-quiz-result"].findIndex((s) => p.startsWith(s)) + 1, () => 0],
    ["Welcome History", (p) => (p.startsWith("/lesson") ? 1 : p.startsWith("/lesson-intro") ? 2 : 0), () => 0],
    ["Welcome Lessons", (p) => (p.startsWith("/lesson") ? 1 : p.startsWith("/lesson-intro") ? 2 : 0), () => 0],
    ["Histudy Assignments", (p) => (p.startsWith("/lesson-assignments") ? 1 : p.startsWith("/lesson-assignments-submit") ? 2 : 0), () => 0],
    ["lesson.json-isActive", (p) => ["/lesson", "/lesson-intro", "/questions-types", "/all-questions", "/pagination-quiz", "/single-question", "/quiz-with-point", "/quiz-with-custom-timer", "/lesson-quiz", "/lesson-quiz-result", "/lesson-assignments", "/lesson-assignments-submit"].some((s) => p.startsWith(s)), (p) => p.startsWith("#")],
    ```

  - Happy path (테스트): `set -o pipefail; CI=true NODE_ENV=test NODE_OPTIONS=--experimental-vm-modules npx jest --ci --runInBand __tests__/components/LessonContent.test.tsx 2>&1 | grep -E '^(Test Suites|Tests):'` → exit 0, `Test Suites: 1 passed, 1 total` / `Tests: 3 passed, 3 total`(개수가 다르면 관측값 기록 — 통과 여부가 판정)
  - Negative (레슨 라우트 파일 불변): `git diff --cached --name-only -- app` → 출력 없음
  - 기록: R3 표 5행 — U2 예외 3행에 "U2=A 승인(날짜)" 표시
  - 커밋 메시지: `chore(demo): unlink demo lesson and quiz routes`

- [ ] T009 홈의 블로그 결합·`/blog` 링크 정리 — `app/01-main-demo/page.js`, `app/01-main-demo/(main-demo)/index.tsx`, `components/01-Main-Demo/01-Main-Demo.js` (depends on T022; Q1) `category:visual-engineering`
  **Goal (Q1 확정안 A)**: 홈이 `@/mdx`를 import하지 않고 블로그 섹션이 없으며 `/blog` 링크 0. 나머지 홈 섹션 9개는 그대로이고 build가 통과한다. `BlogGrid-Top.js`·`mdx/index.js`·`data/blog/**`는 Phase 6 삭제 목록으로 넘어간다.
  **편집 목록 (AREA = `app/01-main-demo/[^:]*|components/01-Main-Demo/[^:]*|components/Blogs/[^:]*`)**:
  1. `app/01-main-demo/page.js` — `:2` import 삭제 · `:9-10` → `const HomePage = () => {`(기다릴 대상이 없어져 `async`·`blog` 삭제) · `:13` → `<HomePageLayout />`
  2. `app/01-main-demo/(main-demo)/index.tsx` — `:13-21` `BlogPost`·`HomePageLayoutProps` 삭제 · `:23` → `const HomePageLayout = () => {` · `:28` → `<MainDemo />`(TS `no-unused-vars` error라 남기면 lint 실패)
  3. `components/01-Main-Demo/01-Main-Demo.js` — `:16` `BlogGridTop` import 삭제 · `:175-205` 블로그 섹션 `div`(`rbt-rbt-blog-area`, `/blog` missing 줄 포함) 삭제 · `:21` → `const MainDemo = () => {`(`Link`는 `:82`에서 계속 씀)
  **References**:
  - `app/page.js:2,12` — 루트가 `01-main-demo/page.js`를 동기 JSX로 렌더(`async` 제거 영향 없음)
  - `mdx/index.js:5,28` — `data/blog` `fs` 읽기(G5) · `components/Blogs/BlogGrid.js:8` — 블로그 데모가 `BlogGrid-Top.js`를 계속 import → Phase 6
  - Research Findings 첫 줄, Gap Probe G5·G10
  **Must NOT do**: `mdx/index.js`·`data/blog/**`·`components/Blogs/**` 수정·삭제 금지(Phase 6 T016). 다른 홈 섹션·문구·`metadata` 수정 금지(OUT). `EventCarouse.js`·`About-Two.js`·`CategoryOne.js`·`Card.js` 수정 금지(T010·T007·T023 몫).
  **QA Scenarios** (공통 절차 1~7, task 이름 `T009`):
  - Happy path (결합 제거): `git grep -nE "@/mdx|getAllPostsMeta|BlogGridTop|getBlog|blogs" -- app/01-main-demo components/01-Main-Demo` → 출력 없음
  - Happy path (영역): 공통 절차 4 → `0` · `grep -c '^components/01-Main-Demo/' .tmp/demo-removal/links-T009.txt` → `0`(`/blog` missing 포함)
  - Happy path (build 필수 — 홈 RSC 데이터 흐름 변경): `npm run build > .tmp/demo-removal/build-T009.txt 2>&1; echo $?` → `0`
  - Edge case (Phase 6 이관, 커밋 후): `node scripts/demo-removal/route-map.mjs plan --phase 6 --list > .tmp/demo-removal/p6-T009.txt` → `grep -cxE 'components/Blogs/Blog-Sections/BlogGrid-Top\.js|mdx/index\.js' .tmp/demo-removal/p6-T009.txt` → `2` · `grep -c '^data/blog/' .tmp/demo-removal/p6-T009.txt` → `git ls-files data/blog | wc -l`와 같은 값
  - Negative (다른 홈 섹션 보존): `grep -cE '<(CategoryOne|Card|AboutTwo|CallToAction|Counter|TestimonialSeven|EventCarouse|TeamTwo|NewsletterTwo)\b' components/01-Main-Demo/01-Main-Demo.js` → `9`
  - 커밋 메시지: `chore(demo): remove blog section from main home`

- [ ] T010 나머지 영역 정리 — `components/Abouts/About-Two.js`, `components/Events/EventCarouse.js`, `app/lib/constants/routes.ts` (depends on T022; U1) `category:quick`
  **선행**: U1 답(routes.ts 항목만 대기 — 답이 오기 전에는 task 전체를 시작하지 않는다, 1커밋 유지)
  **Goal**: T005~T009·T023 영역 밖 유지 코드의 삭제 라우트 참조 5줄이 0(U1=B면 `routes.ts:62` 1줄만 남음). 홈 소개 섹션 버튼과 이벤트 카드 렌더는 그대로.
  **편집 목록 (AREA = `components/Abouts/About-Two\.js|components/Events/EventCarouse\.js|app/lib/constants/routes\.ts`)**:
  1. `components/Abouts/About-Two.js` (R3·R4) — `:121-123`·`:140` 삼항 제거 → `:124-139` `about-btn` `div` 무조건 렌더 · `:16` `pathname`, `:13` `usePathname` import 삭제
  2. `components/Events/EventCarouse.js:44,67,75` — `/event-details/${data.id}` 템플릿 리터럴 `href` → `href="#"`(D13)
  3. `app/lib/constants/routes.ts:62` — U1=A: `ABOUT: '/about',` → `ABOUT: '/about-us-01',`(R1) · U1=B: 수정 안 함
  **References**:
  - `components/01-Main-Demo/01-Main-Demo.js:10,14` — 두 컴포넌트의 유지 사용처(홈)
  - `app/lib/constants/routes.ts:61-66,156` — `ROUTES.PUBLIC`은 타입 합집합 외 참조 없음(U1)
  - `app/(pages)/about-us-01/page.js` — R1 대체 라우트
  **Must NOT do**: `routes.ts`의 다른 줄(기존 missing 14줄 포함 — D9 기록만) 수정 금지. `data/events.json` 수정 금지. 이벤트 섹션 제거 금지(Q1은 블로그만 결정).
  **QA Scenarios** (공통 절차 1~7, task 이름 `T010`):
  - Happy path (영역): 공통 절차 4 → `0`(U1=B면 `1`, 그 줄은 `app/lib/constants/routes.ts:62 del-route /about`)
  - R3: 공통 R3 명령의 `C`에 `["About-Two:121", (p) => p === "/17-online-academy", () => false],` → `conds 1 diff 0`
  - Happy path (구조): `grep -c 'pathname' components/Abouts/About-Two.js` → `0` · `grep -c 'More About Us' components/Abouts/About-Two.js` → `1` · `grep -c 'href="#"' components/Events/EventCarouse.js` → `3` · `grep -c 'event-details' components/Events/EventCarouse.js` → `0`
  - Edge case (U1=A 범위): `git diff --cached -U0 -- app/lib/constants/routes.ts | grep -cE '^[-+] '` → `2` · `git grep -nE 'PUBLIC\.ABOUT|ROUTES\.PUBLIC' -- app components` → `app/lib/constants/routes.ts:156:` 한 줄
  - Negative: `git diff --cached --name-only -- app/lib` → U1=A면 `app/lib/constants/routes.ts`만, U1=B면 출력 없음
  - 기록: R1 표(U1=A면 1행), R3 표 1행
  - 커밋 메시지: `chore(demo): unlink remaining demo routes`

- [ ] T011 Phase 2 제3자 검증 (validator 항상 + 적대축 opt-in) — `docs/work-plans/histudy-demo-cleanup.md` (depends on T005, T006, T007, T023, T008, T009, T010) `category:quick`
  **Goal**: Phase 2 수정 파일에 validator `INTENT_PASS`, 적대축은 사용자 opt-in 시 `adversarial-round` 결과 반영 또는 거절 기록, 반영이 있었으면 Tier 1과 Phase 2 Checkpoint를 다시 통과한다.
  **절차**:
  1. **입력 준비**: `git diff --name-only --diff-filter=M 'pre-demo-removal^{commit}' HEAD -- app components data > .tmp/demo-removal/p2-modified.txt; wc -l < .tmp/demo-removal/p2-modified.txt` → U1=A `34` / U1=B `33`, 목록 = T005~T010·T023 편집 목록의 합집합 · `git diff --name-only --diff-filter=AD 'pre-demo-removal^{commit}' HEAD -- app components data mdx` → 출력 없음
  2. **validator 호출 (opus, 판정과 무관하게 항상)**: `Agent(subagent_type="validator-agent", model="opus", prompt=…)`. prompt에 넣을 것 — (a) 수정 파일 목록 `.tmp/demo-removal/p2-modified.txt`와 `git diff 'pre-demo-removal^{commit}' HEAD -- <그 목록>`으로 직접 읽으라는 지시 (b) 도구 변경 `git diff 978c63c HEAD -- scripts/demo-removal/check-route-links.mjs`(T022) (c) Implementation Log의 R1 치환 표 전부 — 대체 주소의 뜻이 맞는지 대조(주의 (라)) (d) R3 전/후 표 전부와 U2 예외 (e) 이 문서 R1~R5·D1~D17·OUT·Q1/Q2·U1/U2 답 (f) 질문 — 유지 화면의 렌더·이동이 R3 표 밖에서 바뀐 곳이 있나, 뜻이 틀린 대체 주소가 있나, F5 불변 목록 파일이 U1 예외 밖에서 바뀌었나, 편집으로 생긴 고아가 삭제 허용 루트 밖에 있나
  3. **판정 기록**: Implementation Log에 `- validator T011 — INTENT_PASS` 또는 `- validator T011 — INTENT_FAIL: <지적 요약>`. FAIL이면 해당 task 규칙대로 고쳐 커밋(`chore(demo): …`) → Tier 1 + Phase 2 Checkpoint 재실행 → validator 재호출. 같은 유형 지적으로 2회 FAIL이면 멈추고 사용자에게 보고(ADR 0001 D6 bounded repair — 실패 검사 완화·DoD 완화 금지)
  4. **적대축 opt-in (사용자에게 질문 1개)**: "Phase 2 수정 파일 <N>개에 적대 검증(adversarial-round) 1회를 돌릴까요?"
     - 수락: `adversarial-round` workflow만 실행(에이전트 직접 호출 금지). `targets` = 섹션 2 위험 판정 문구대로 `.tmp/demo-removal/p2-modified.txt`의 경로(= 그 시점까지 수정된 런타임 파일), `constraints` = 섹션 2 문구대로 D1~D17·R1~R5·OUT 목록·Q1/Q2·U1/U2 답(U2 예외 포함). 재개 시 같은 `args`를 다시 싣고, 종료·중단 뒤 첫 동작은 `git status`, 회차 보고 첫 줄 "이번 회차 실코드 N줄 / 누적 M줄", 연속 2회차 실코드 0줄이면 종료. Implementation Log에 `- 적대축 T011 — 회차 <n>, 실코드 누적 <m>줄, <반영 커밋 또는 없음>`
     - 거절: Implementation Log에 `- 적대축 T011 — OFF(사용자 거절, YYYY-MM-DD)`
  5. **재검증**: 3·4에서 코드 반영이 있었으면 Tier 1 + Phase 2 Checkpoint 전부 재실행, 결과를 Implementation Log에 기록
  **References**: 섹션 2 위험 판정 표·그 아래 실행 형식 목록, Implementation Log Phase 1 validator 기록(형식), `~/.claude/rules/coding-workflow.md` 다중 적대검증 운영 규칙 ①~⑥
  **Must NOT do**: validator·적대축 지적을 검사 완화·기준선 재생성으로 통과시키지 않는다. 적대축을 사용자 답 없이 실행하거나 건너뛰지 않는다. `constraints` 없이 workflow를 실행하지 않는다(훅이 차단).
  **QA Scenarios**:
  - Happy path: `grep -cE '^- validator T011 — INTENT_PASS$' docs/work-plans/histudy-demo-cleanup.md` → `1` · `grep -c '^- 적대축 T011 — ' docs/work-plans/histudy-demo-cleanup.md` → `1`
  - Negative (workflow 잔여 변이 없음): `git status --porcelain -- app components data mdx scripts` → 출력 없음
  - Edge case: validator가 INTENT_FAIL을 2회 낸 경우 → 이 task는 체크하지 않고 사용자 보고 기록만 남긴다

**Checkpoint** (T011 전에 1회, T011에서 반영이 있으면 다시):

1. 링크 게이트: `node scripts/demo-removal/check-route-links.mjs --baseline .tmp/demo-removal/links-baseline.txt > .tmp/demo-removal/links-phase2.txt; echo $?` → `0` · `head -n 1 .tmp/demo-removal/links-phase2.txt` → `del-route=0 missing=40 nav-missing=0 new-missing=0`(51 − 11: 푸터 6·`/404` 1·`/course-with-tab-two` 2·`/quiz-passing-grade` 1·`/blog` 1. 남은 40은 기준선의 헤더·푸터 밖 항목 그대로 — 비링크 21 포함, 증가 금지). U1=B면 exit 1·`del-route=1`(그 줄만) — F2 조정 승인 기록이 있어야 통과로 본다. 값이 다르면 차이 줄을 Implementation Log에 적고 멈춘다
2. `grep -cE ' (del-route|missing-new) ' .tmp/demo-removal/links-phase2.txt` → `0`(U1=B면 `1`)
3. 삭제 전 상태: `node scripts/demo-removal/route-map.mjs verify; echo $?` → `del-entries-remaining=119`, `keep-entries-present=71/71`, exit `1`. `delete-candidates-remaining` 값(504 이상)을 기록
4. 편집으로 생긴 고아: `node scripts/demo-removal/route-map.mjs plan --phase 7 --list > .tmp/demo-removal/p2-phase7.txt` → `grep -cE '^components/(Header/NavProps/ElementsLayout|Course-Details/Course-Sections/Breadcrumb/CourseBreadcrumb-(Two|Three|Four|Five|Six|Seven))\.js$' .tmp/demo-removal/p2-phase7.txt` → `7`. 전체 목록을 Implementation Log에 기록(T017 입력, 허용 루트 밖 경로 0 확인)
5. G3: `grep -cE 'ElementsLayout|grid-item-5' components/Header/Nav.js` → `0`
6. Tier 1 전체: `npm run type-check` → exit 0 · lint → `(0 errors, N warnings)` N ≤ 167 · `npm run format:check` → exit 0 · `npm run build` → exit 0 · Test Strategy의 jest 명령 → exit 0, `Test Suites: 17 passed, 17 total` / `Tests: 133 passed, 133 total`
7. 매핑 불변(태그 기준): `node scripts/demo-removal/route-map.mjs map > .tmp/demo-removal/map-out.txt; head -n 1 .tmp/demo-removal/map-out.txt` → `entries=190 keep=71 del=119 sections=99` · `sha1sum .tmp/demo-removal/route-map.json` → T022 준비 단계 기록값과 같음
8. 복구 문서 표시(D17): 아래 → `SAME`, `app-in-sections 0`(0이 아니면 Implementation Log에 "T018 착수 전 표시 범위 확장 결정 필요"). 생성물은 `.tmp`에만 쓰고 `docs/library/histudy-demo-removal.md`는 T018에서 재생성한다

   ```bash
   git diff --name-only --diff-filter=M 'pre-demo-removal^{commit}' HEAD -- app components data > .tmp/demo-removal/p2-modified.txt
   node scripts/demo-removal/render-doc.mjs --date 2026-09-16 --links .tmp/demo-removal/links-baseline.txt --out .tmp/demo-removal/doc-phase2.md
   node -e '
   const fs = require("fs");
   const m = require("./.tmp/demo-removal/route-map.json");
   const mod = fs.readFileSync(".tmp/demo-removal/p2-modified.txt", "utf8").split("\n").filter(Boolean);
   const reach = new Set(m.sections.flatMap((s) => s.reachFiles));
   const exp = mod.filter((p) => /^(components|data)\//.test(p) && reach.has(p)).sort();
   const doc = fs.readFileSync(".tmp/demo-removal/doc-phase2.md", "utf8");
   const got = [...new Set([...doc.matchAll(/^- (\S+) — T2에서 수정됨$/gm)].map((x) => x[1]))].sort();
   const app = mod.filter((p) => p.startsWith("app/") && reach.has(p));
   console.log("expected", exp.length, "marked", got.length, JSON.stringify(exp) === JSON.stringify(got) ? "SAME" : "DIFF", "app-in-sections", app.length);'
   ```

9. 작업 트리: `git status --porcelain -- app components data mdx scripts docs/library` → 출력 없음

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
| T022 | T003 | 개수 비교가 Phase 2 모든 task QA(`--baseline`)의 전제 |
| T005 | T022 | 링크 검사 출력이 작업 목록·판정 (+ Q2 답) |
| T006 | T022 | 같음 |
| T007 | T022 | 같음 |
| T023 | T022 | 같음 |
| T008 | T022 | 같음 (+ U2 답) |
| T009 | T022 | 같음 (+ Q1 답) |
| T010 | T022 | 같음 (+ U1 답) |
| T011 | T005, T006, T007, T023, T008, T009, T010 | Phase 2 수정 전체를 검증 |
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

Phase 2 (Phase 1 완료 + Q1·Q2 답 후, T008은 U2·T010은 U1 답 후):
├── T022: 검사기 개수 비교 (deps: T003)               → [P] 없음, 가장 먼저
├── T005: 헤더 메뉴·장바구니 (deps: T022)             → T022 후 순차
├── T006: 푸터 (deps: T022)                           → T022 후 순차
├── T007: 코스 상세·목록 분기 (deps: T022)            → T022 후 순차
├── T023: 강사 프로필 링크 (deps: T022)               → T022 후 순차
├── T008: 레슨 영역 (deps: T022)                      → T022 후 순차
├── T009: 홈 블로그 결합 (deps: T022)                 → T022 후 순차
├── T010: 나머지 영역 (deps: T022)                    → T022 후 순차
└── T011: 제3자 검증 (deps: T005~T010, T023)          → 순차
    ※ 파일은 겹치지 않지만 T022(개수 비교 검사기)에 의존하고, 한 작업 트리의 lint·링크 검사가 서로의 미커밋 편집을 보므로 [P] 없이 순차 실행(momus 1회차 지적 반영)

Phase 3: T012 (deps: T011) → T013 (deps: T012)
Phase 4: T014 (deps: T013)
Phase 5: T015 (deps: T014)
Phase 6: T016 (deps: T015, T009)
Phase 7: T017 (deps: T016) → T018 (deps: T017, T004) → T019 → T020 → T021

Critical Path: T002 → T003 → T022 → T007 → T011 → T012 → T013 → T014 → T015 → T016 → T017 → T018 → T019 → T020 → T021
```

---

## Category + Skills

| Task | Category | Category Reason | Skills Included | Skills Omitted (Why) |
|------|----------|----------------|-----------------|----------------------|
| T001 | quick | 명령 실행·기록만 | - | - |
| T002 | ultrabrain | 삭제 완결성을 좌우하는 그래프·Phase 배정 로직 | - | frontend-ui-ux: UI 없음 |
| T003 | ultrabrain | 라우트 패턴 매칭·동적 세그먼트 판정 | - | - |
| T004 | writing | 문서 구조가 핵심인 생성기 | - | - |
| T022 | ultrabrain | 게이트 판정 로직 — 틀리면 Phase 2~6 검사가 조용히 샌다 | - | frontend-ui-ux: UI 없음 |
| T005 | visual-engineering | 헤더 메뉴 렌더 구조 변경 | frontend-ui-ux | - |
| T006 | quick | 데이터 항목·링크 목록 1곳 | - | - |
| T007 | ultrabrain | 유지 경로 결과를 보존하는 조건식 단순화 | - | - |
| T023 | quick | 같은 형태의 값 치환·필드 줄 삭제 | - | - |
| T008 | quick | 데이터 값·배지 식·링크 1곳 | - | - |
| T009 | visual-engineering | 홈 섹션 제거 | frontend-ui-ux | - |
| T010 | quick | 잔여 링크 값·분기 1곳 | - | - |
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
- [ ] F2. 참조 0건 — `node scripts/demo-removal/check-route-links.mjs --baseline .tmp/demo-removal/links-baseline.txt` → exit 0, 첫 줄 `del-route=0`·`nav-missing=0`·`new-missing=0`, `missing` ≤ 기준선. 그리고 `git grep -nE "data/blog|@/mdx|mdx/index" -- app components scripts __tests__ tests ':!scripts/demo-removal'` → 0줄(Q1 A 기준)
- [ ] F3. Tier 1 — `npm run type-check && npm run lint && npm run format:check && npm run build` → exit 0, Test Strategy의 jest 명령 → 기준선과 같은 `Test Suites`·`Tests` 수
- [ ] F4. CI 가드 — `.github/workflows/lint-check.yml:63-110`(글꼴·react-pdf)과 `:130-144`(skip 금지)의 run 스크립트를 Bash로 그대로 실행 → 각 exit 0
- [ ] F5. 범위 밖 불변 — `git diff --name-only 'pre-demo-removal^{commit}' HEAD -- public progress.json app/lib app/api 'app/(dashboard)' 'app/(auth)' package.json package-lock.json` → `app/lib/constants/routes.ts` 1줄만(U1=A 사용자 승인 예외 — 그 파일의 diff는 `ABOUT` 한 줄 변경뿐: `git diff -U0 'pre-demo-removal^{commit}' HEAD -- app/lib/constants/routes.ts | grep -cE '^[-+] '` → `2`), 그 밖 0줄
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

### 2026-09-16 — Phase 1 완료 (T001~T004)

- 기준선: type-check·lint(0/167)·format·build·jest(17/133) 통과, 태그 = main 91d9fd9
- T002 `map`: entries=190 keep=71 del=119 sections=99, deleteFiles=504(p3 138/p4 305/p5 22/p6 39). `unresolvedNonAsset` 기대값 0 → 4로 정정(주석 import 2·루트 package.json 1·tests 재export 1, 판정 영향 없음)
- T003 링크 기준선: `del-route=378 missing=51 nav-missing=7`. 기준선 파일을 잃으면 태그 worktree에서 `node scripts/demo-removal/check-route-links.mjs --report-only --root <wt>`로 같은 파일을 다시 만든다
- **validator 1회차 INTENT_FAIL** — (1) 삭제 후 링크 검사기가 삭제 라우트 링크를 `missing`으로 분류 (2) 복구 문서가 공유 파일 수정 영향을 알리지 않음 (3) 실데이터 코드 `QuizResultContent.js`가 조용히 삭제됨. 사용자 결정: 지금 수정 + 재검증, `QuizResultContent.js`는 삭제하되 문서에 별도 표시
  - 조치: 1795de1(삭제 라우트를 태그 DEL 진입점에서 분류, `--baseline`의 `new-missing`), 6dd7a55(섹션별 `T2에서 수정됨` 표시, `## 실데이터 코드가 들어 있던 삭제 파일`, 폴더 안 미사용 파일 라벨)
- **validator 2회차 INTENT_PASS** (HEAD 6dd7a55) — 비차단 주의: (가) `new-missing`이 (파일, 리터럴) 집합 비교라 같은 파일의 기존 missing 리터럴이 새로 늘어나면 가려짐 → Phase 2 착수 전 개수 비교로 보완 권장 (나) git add 안 한 파일은 검사 대상 밖 → 검사는 add·커밋 후 (다) Phase 2~6 Checkpoint에도 `--baseline` 권장 (라) 뜻이 틀린 대체 주소는 검사기 한계 → R1·T011 validator 몫 (마) `T2에서 수정됨` 표시는 `components/`·`data/`만 봄 — `context`·`redux`·`hooks`·`types`는 F5 불변 목록 밖

### 2026-09-16 — Phase 2 진행 기록

**T022** (6064581): `--baseline` 비교를 (파일, 리터럴)별 개수로 변경. 변이 검사 — 구판(978c63c) `new-missing=0` / 신판 `new-missing=1`. 무회귀: 삭제 전 출력 == 기준선(바이트 동일)

**T005** (a991e01): 헤더 메뉴·장바구니. 링크 검사 `del-route=276 missing=50 nav-missing=6 new-missing=0`(배정 del-route 102·nav-missing 1 해소). G3 0, Home `/` 단일 링크 1, `CourseLayout` 1개(G9), R3 `keep-paths 54 conds 4 diff 0`

R1 치환 표 (T005):

| 파일:줄(편집 전) | 편집 전 경로 | 편집 후 경로 | 근거 |
|---|---|---|---|
| `components/Header/Offcanvas/Cart.js:63-67` | `data.product.title ? /event-details/${id} : /course-details/${id}` | `/course-details/${id}` | D15 — DB 코스도 `title`이 있어 이벤트로 오판정되던 것을 코스 상세로 통일 |
| `components/Header/Offcanvas/Cart.js:82-86` | 위와 같음 | `/course-details/${id}` | D15 |
| `components/Cart/CartItems.tsx:43-51` 상품 분기 | `/single-product/${id}` | `/course-details/${id}` | D15 — 유지 화면에서 담기는 것은 코스뿐 |
| `components/Cart/CartItems.tsx:43-51` 이벤트 분기 | `/event-details/${id}` | `/course-details/${id}` | D15 |

R3 전/후 표 (T005):

| 파일:줄(편집 전) | 편집 전 조건 | 편집 후 | 유지 경로 결과(전→후) |
|---|---|---|---|
| `HeaderStyle-Ten.js:32-34` | `p === '/01-main-demo' && '/16-udemy-affiliate' && '/01-main-demo'` | `p === '/01-main-demo' && '/01-main-demo'` | 모든 유지 경로 diff 0(상수 문자열은 참) |
| `HeaderTop-Eight.js:55` | `router.pathname === '/10-online-course' ? '' : <li>` | 조건 제거, `<li>` 항상 렌더 | diff 0(App Router `useRouter()`에 `pathname` 없음 → 편집 전에도 항상 else) |
| `HeaderTop-Eight.js:95` | 같은 패턴(social-share) | 조건 제거 | diff 0 |
| `HeaderTop-Eight.js:123` | 같은 패턴(separator) | 조건 제거 | diff 0 |

환경 메모: 저장소 밖 실행 상태 파일 `.omo/boulder.json`(`.git/info/exclude`로만 제외)이 `npm run format:check`에 걸려 prettier로 정렬함 — 코드 결함 아님

**T006** (f7309b7): 푸터. 링크 검사 `del-route=265 missing=44 nav-missing=0 new-missing=0`(배정 del-route 11·nav-missing 6 해소 — 헤더·푸터 없는 주소 0 달성). 푸터 문구·소셜 링크 불변

R1 치환 표 (T006):

| 파일:줄(편집 전) | 편집 전 경로 | 편집 후 경로 | 근거 |
|---|---|---|---|
| `data/footer.json:27` (footerOne FAQ) | `/pages/faqs` | `/faqs` | 유지 라우트 `app/(pages)/faqs` 존재, 제목 FAQ와 1:1(D12·R1) |
| `data/footer.json:98` (footerTwo FAQ) | `/pages/faqs` | `/faqs` | 같음 |

**T007** (e7081a8): 코스 상세·목록 분기. 링크 검사 `del-route=221 missing=42 nav-missing=0 new-missing=0`(배정 del-route 44 + missing 2 해소). R3 `keep-paths 54 conds 20 diff 0`(편집 전·후 모두). type-check 0, lint 0/167

- 편집 9 조정: `CategoryHead.js`의 미사용 인자 `filterItem`·`setCourseFilter`는 **남김** — 지우면 `app/(courses)/all-courses/index.tsx(60,13)` TS2322(JS 컴포넌트 인자 이름이 prop 타입이 됨). `all-courses/index.tsx`는 T007 범위 밖
- **의미 변화(T011 validator 확인 대상)**: `components/Category/CategoryOne.js:21` 카테고리 링크 `/course-filter-one-toggle/${category}` → `/all-courses` — `/all-courses`는 카테고리 인자를 받지 않아 카테고리 필터가 사라진다(원래 필터 화면이 삭제 대상 데모)

R1 치환 표 (T007):

| 파일:줄(편집 전) | 편집 전 경로 | 편집 후 경로 | 근거 |
|---|---|---|---|
| `app/(courses)/course-details/index.js:71` | `/course-filter-one-toggle` | `/all-courses` | R1 코스 목록류 — 코스를 못 찾았을 때 이동 |
| `app/(courses)/course-details/index.js:79` | `/course-filter-one-toggle` | `/all-courses` | R1 — 조회 오류 때 이동 |
| `components/Category/CategoryOne.js:21` | `/course-filter-one-toggle/${item.category}` | `/all-courses` | R1 — 카테고리 필터 소실(위 의미 변화) |

R3 전/후 표 (T007, 유지 경로 54개, `usePathname` 기준):

| 파일:줄(편집 전) | 편집 전 조건 | 편집 후 | 유지 경로 결과(전→후) |
|---|---|---|---|
| `course-head.js:25,62,85,106,118,138,152` | `pathname === /course-detail-N/${courseId}` (N=2~8) | 블록 7개 삭제 | 모두 false→false |
| `Viedo.tsx:68-76` | `disableVideo`(`/course-detail-2~8` startsWith) | 선언 삭제, 미리보기 `Link` 항상 렌더 | false→false |
| `Viedo.tsx:78-80` | `isVideo`(`/course-detail-6`) | 선언·iframe 블록 삭제 | false→false |
| `Overview.js:11-13` | `addClass`(`/course-detail-8`) | `mt--30` 고정 | false→false, className 동일 |
| `Featured.js:13-15` | `addClass`(`/course-detail-8`) | `rbt-shadow-box` 고정 | false→false, className 동일 |
| `Course-Menu.js:11-13` | `menuClass`(`/course-detail-8`) | `className="mainmenu"` | false→false(끝 공백만 빠짐) |
| `Course-Action-Bottom.js:16` | `path === '/course-detail-2/[courseId]'` | `isHide = ScrollPosition > 4365` | false→false(실제 주소에 `[courseId]` 글자가 없어 항상 false) |
| `CategoryHead.js:44-45` | `/course-card-3` ∨ `/course-masonry` | 레이아웃 전환 `div` 항상 렌더 | false→false |
| `CategoryHead.js:53,71` | `=== '/course-card-2'` | `toggle` / `!toggle` | false→false |
| `CategoryHead.js:107` | `=== '/course-with-sidebar'` | 검색 폼 항상 렌더 | false→false |
| `CategoryHead.js:126-128` | tab·tab-two·with-sidebar | "Short By" 블록 삭제 | false→false |
| `CategoryHead.js:147-153` | 7개 OR(`/all-courses` 포함) | `pathname === '/all-courses'` | `/all-courses` true→true, 나머지 false→false |
| `CategoryHead.js:170` | `=== '/course-filter-one-open'` | `<CourseFilter filterToggle={filterToggle} />` | false→false |
| `CategoryHead.js:176-178` | tab·tab-two·masonry | 탭 블록 삭제 | false→false |

R3 명령 마지막 줄: `keep-paths 54 conds 20 diff 0`

**T023** (b8f73bc): 강사 프로필 링크. 링크 검사 `del-route=39 missing=42 nav-missing=0 new-missing=0`(배정 del-route 182 해소, 영역 0). `courseData.json` numstat `0 171`·JSON 유효·`linkTwo` 0. `href="#"` 10곳, `<Link` 개수 6파일 모두 불변, `className="px-1" href="#"` 2. type-check 0, lint 0/167, format 0

- D14 사전 확인 재실행: `linkTwo`를 읽는 코드는 `Card-Three.js:68,78`·`BlogDetails.js:173,201`뿐(다른 데이터 파일) — 계획과 같음
- `Instructor.js:26-29` 여러 줄 `Link`는 `href`가 짧아져 Prettier가 한 줄로 합침(className·텍스트 불변, 형식 변화만)
- R1·R3 해당 없음(D13·D14 치환만)
