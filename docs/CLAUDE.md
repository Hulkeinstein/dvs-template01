# CLAUDE.md — Docs 메모리 & 워크플로우 가이드 (Final / Library + Integrations)

**목적**: 진행 중 Work Plan은 민첩하게, 완료된 지식은 **Library(영구 기능 문서)**로 승격·보존하고, **Integrations(외부 도구/MCP 등)**를 별도 체계로 관리하여 팀/AI가 반복 없이 재사용하는 단일 지식 체계를 유지한다. (Docs-as-Code 표준)

---

## 1) 운영 원칙 (Single Source of Truth)

- **임시(진행 중)**: `docs/work-plans/` — 실행 체크리스트·기술 메모·리스크/의사결정 초안.
- **영구(완료 기능)**: `docs/library/` — 구현 가이드(아키텍처·주요 결정·테스트·파일 경로·참고 PR).
- **외부 연동/도구**: `docs/external-services/` — MCP/Stripe/Supabase/Canva 등 무엇을/어떻게/보안/런북.
- **문제 해결**: `docs/troubleshooting/` — 자주 발생 이슈의 원인/해결/예방(런북형).
- **전반 구조**: `docs/architecture/` — 시스템 다이어그램, 흐름, 핵심 모듈 관계.
- **PR 본문**: 요약만, 상세는 library/external-services 문서 링크로 연결.
- **참고 폴더(조건부)**: `docs/api/`, `docs/guides/`, `docs/references/`.
  - **api/**: 스펙이 2개↑이거나 공개 문서 필요할 때.
  - **guides/**: 설치·배포·스타일 등 How-to가 3개↑일 때.
  - **references/**: 링크/자료 모음이 커질 때(카탈로그 성격).
    ※ 도구 사용법은 `external-services/`로, 레퍼런스 링크 모음은 `references/`로.

---

## 2) 디렉토리 표준 구조

```
docs/
├── CLAUDE.md                  # 이 파일 (워크플로우 가이드)
│
├── work-plans/                # 진행 중 작업
│   └── <feature>.md
│
├── library/                   # 완료된 기능 문서
│   ├── checkout.md
│   ├── cart-system.md
│   └── stripe-integration.md
│
├── external-services/         # 외부 도구/서비스
│   ├── REGISTRY.md            # 도구 목록표
│   ├── mcp.md
│   ├── stripe.md
│   └── supabase.md
│
├── troubleshooting/           # 문제 해결 런북
│   ├── webhook-retry-idempotency.md
│   └── oauth-blocked.md
│
├── architecture/              # 시스템 설계
│   └── system-design.md
│
├── testing/                   # 테스트 관련
│   ├── checkout-test-snippets.js
│   └── checkout-test-sql.sql
│
├── api/                       # (선택) OpenAPI/내부 스펙
├── guides/                    # (선택) Setup/Deploy/Style/Playbook
└── references/                # (선택) 라이브러리/자료 링크 카탈로그
```

---

## 3) 수명주기 (Work Plan → Library 승격)

1. **시작**: `docs/work-plans/<feature>.md` 생성(체크리스트/리스크/테스트 계획 포함).
2. **진행**: 구현 중 Work Plan 갱신(의사결정 초안·실험 기록·로그 링크 포함).
3. **완료**: 내용 정제 → `docs/library/<feature>.md`로 승격(구조화·영문화 선택).
4. **PR**: 요약·영향·테스트 결과 + library/external-services 링크 첨부.
5. **정리**: Work Plan 삭제(Git 기록 + Library/External Services가 근거 저장소).

---

## 4) 네이밍 & 메타데이터

### 파일명 규칙 (필수)

- **kebab-case.md** (단어 사이 하이픈 `-` 연결)
  - ✅ `checkout-improvement.md`
  - ✅ `stripe-integration.md`
  - ✅ `webhook-retry-idempotency.md`
  - ❌ `CheckoutImprovement.md` (PascalCase)
  - ❌ `checkout_improvement.md` (snake_case)
  - ❌ `Checkout Improvement.md` (공백)

- **이유**:
  - URL 안전 (공백/인코딩 불필요)
  - Git 대소문자 충돌 방지
  - 가독성 (하이픈이 공백 역할)

### 파일명 예시

**Library (기능 문서)**
- `checkout.md` (단일 기능)
- `stripe-integration.md` (외부 연동)
- `cart-system.md` (서브시스템)

**External Services (외부 서비스)**
- `mcp.md` (도구명 단축)
- `stripe.md`
- `supabase.md`

**Work Plans (진행 중)**
- `checkout-improvement.md` (기능명 + 목적)
- `payment-refund.md`
- `admin-dashboard-integration.md`

**Troubleshooting (문제별)**
- `webhook-retry-idempotency.md`
- `oauth-blocked.md`
- `schema-cache-error.md`

### 날짜 접두사 (선택)

- `YYYYMMDD_topic.md` — 릴리즈노트/마이그레이션 성격에 활용
- 예: `20250216_stripe-integration.md`

### Front-matter (필수)

**모든 docs 폴더 내 문서에는 YAML Front-matter가 필수입니다.**

```yaml
---
title: "Stripe Integration"                  # 필수: 문서 제목
tags:                                         # 필수: 네임스페이스 태그 배열
  - phase/1                                   # phase/1|2|3
  - type/feature                              # feature|bug|docs|security|performance
  - component/payment                         # auth|payment|ui|database|api
  - external/stripe                           # stripe|paypal|supabase|nextauth (다중 허용)
  - progress/completed                        # completed|in-progress|backlog|blocked
created: 2025-10-01                           # 필수: Git 최초 작성일 (YYYY-MM-DD)
updated: 2025-11-03                           # 필수: 최종 수정일 (YYYY-MM-DD)
lifecycle: active                             # 필수: 문서 생명주기 (active|deprecated|draft)
aliases: []                                   # 선택: 파일명 변경 시 이전 이름
category: library                             # 선택: guide|library|reference|workflow
related:                                      # 선택: 관련 문서 경로 (상대 경로)
  - library/checkout.md
  - external-services/stripe.md
owners: ["@owner1", "@owner2"]                # 선택: 담당자
---
```

**중요**: `status` 키는 `lifecycle`로, `status/*` 태그는 `progress/*`로 변경되었습니다 (충돌 방지).

### 네임스페이스 태그 시스템 (Obsidian 스타일)

**모든 태그는 네임스페이스 형식(`category/value`)을 사용합니다.**

#### phase/ (프로젝트 단계)
- `phase/1` - Phase 1: Core Platform
- `phase/2` - Phase 2: Admin System
- `phase/3` - Phase 3: Enhancement

#### type/ (문서 유형)
- `type/feature` - 새 기능 구현
- `type/bug` - 버그 수정
- `type/docs` - 문서 작성/개선
- `type/security` - 보안 관련
- `type/performance` - 성능 최적화

#### component/ (시스템 컴포넌트)
- `component/auth` - 인증/권한
- `component/payment` - 결제 시스템
- `component/ui` - UI/UX 컴포넌트
- `component/database` - 데이터베이스
- `component/api` - API 엔드포인트

#### external/ (외부 서비스, 다중 허용)
- `external/stripe` - Stripe 결제
- `external/paypal` - PayPal 결제
- `external/supabase` - Supabase 데이터베이스
- `external/nextauth` - NextAuth.js 인증

#### progress/ (작업 진행 상태)
- `progress/backlog` - 계획됨
- `progress/in-progress` - 진행 중
- `progress/completed` - 완료
- `progress/blocked` - 차단됨

### 필수 Front-matter 필드

**반드시 포함해야 하는 5개 필드:**

1. **title** (string): 문서 제목
2. **tags** (array): 네임스페이스 태그 배열
   - 각 네임스페이스에서 최소 1개 이상 선택
   - `external/*`만 다중 허용 (예: `external/stripe`, `external/supabase`)
3. **created** (YYYY-MM-DD): Git 최초 작성일
   - `git log --follow --diff-filter=A --format=%ai -- <file>` 명령으로 확인
4. **updated** (YYYY-MM-DD): 최종 수정일
   - 작업한 실제 날짜 사용
5. **lifecycle** (string): 문서 생명주기
   - `active` - 현재 사용 중
   - `deprecated` - 더 이상 사용하지 않음
   - `draft` - 작성 중

### 태그 검색 예시

```bash
# 특정 태그로 검색
rg "phase/1" docs/ --type md

# 여러 태그 조합 검색 (AND 조건)
rg "phase/1" docs/ --type md | rg "component/payment"

# 특정 컴포넌트의 모든 문서
rg "component/auth" docs/ --type md

# 진행 중인 작업 찾기
rg "progress/in-progress" docs/ --type md

# 외부 서비스 사용 문서
rg "external/stripe" docs/ --type md
```

### 파일명 변경 시 aliases 활용

```bash
# 파일명 변경 (Git history 보존)
git mv docs/OLD_NAME.md docs/new-name.md

# Front-matter에 aliases 추가
aliases: [OLD_NAME, old-name]

# 기존 참조 확인 및 업데이트
rg "OLD_NAME" docs/
```

---

## 5) 템플릿

### 5.1 Work Plan — `docs/work-plans/<feature>.md`

```markdown
# <Feature> Work Plan

## 목적 / 범위
- 해결하려는 문제, 성공 기준(KPI)

## Phase & 체크리스트
- **Phase 0 — 즉시 수정**
  - [ ] 항목…
- **Phase 1 — 핵심 구현**
  - [ ] 항목…
- **Phase 2 — 품질/테스트**
  - [ ] 항목…
- **Phase 3 — 운영/모니터링(선택)**
  - [ ] 항목…

## 기술 결정(초안)
- 주제: 멱등성 — 대안 A/B, 선택: A(사유)

## 리스크 & 완화
- 리스크: 웹훅 지연 → 완화: 멱등 로그 + 재시도 정책

## 테스트 계획
- 스모크/E2E 시나리오 요약, 시드 데이터

## 산출물
- 코드 경로, 마이그레이션 파일, UI 컴포넌트

## 승격 조건(DoD)
- 사용자 체감 기준 & 품질 문턱(예: 중복 등록 0건)
```

### 5.2 Library(기능) — `docs/library/<feature>.md`

```markdown
# <Feature> 구현 가이드

## 📊 개요
- 한 줄 설명 + 배경 + 릴리즈(날짜)

## 🏗️ 아키텍처
- 다이어그램(mermaid 가능) 및 데이터 모델/RLS 핵심 규칙

## 🔑 주요 결정(ADR-lite)
1. **의사결정 제목** — 결론(한 줄)
   - 근거: … 대안: … 영향: …

## 🧩 구현 포인트
- 핵심 엔드포인트/컴포넌트/훅, 실패/재시도/타임아웃/로그 정책

## 🧪 테스트 & 검증
- 수용 기준(DoD), E2E 시나리오 요약

## 📦 관련 파일
- 코드/마이그레이션/테스트 경로

## 🔗 참고 PR
- #123, #124 … (한 줄 요약 + 링크)

## 📚 관련 문서
- work-plans/<next>.md, external-services/<tool>.md
```

### 5.3 External Services(외부 서비스) — `docs/external-services/<tool>.md`

```markdown
# <Tool> Integration Guide

## Purpose & Scope
- 무엇을 위해, 어디까지 커버하는가(MCP 서버/클라이언트, Stripe 결제/환불 등)

## Versions & Ownership
- 현재 버전/채널, 소유자, 변경 이력(CHANGELOG)

## Setup / Config
- 설치/키/권한, 환경변수, 프로젝트 연결 절차

## Usage
- 주요 명령/워크플로우, 예시(스크린샷/명령어)

## Security & Compliance
- 키 회전, 접근 제어(RLS/권한), 데이터 보존 정책

## Runbooks
- 장애/알림/재시도 절차, SLO/SLA(있다면)

## References
- 외부 문서, 내부 library 문서와의 연결
```

### 5.4 Troubleshooting — `docs/troubleshooting/<issue>.md`

```markdown
# <이슈명>

## Symptoms
- 관찰되는 현상/로그/에러 코드

## Root Cause
- 근본 원인(분석 단계)

## Fix Steps
- 단계별 해결(명령/코드/SQL 포함)

## Verification
- 수정 후 확인 방법(E2E/로그/상태)

## Prevention
- 재발 방지(모니터링 룰/코드 변경/문서 업데이트)
```

---

## 6) 체크아웃 사례(승격 예시, DVS 컨텍스트)

**From**: `work-plans/checkout-improvement.md` → **To**: `library/checkout.md`

### 핵심 아티팩트(요약)

- **Idempotency**: `order_events(stripe_event_id unique)`
- **Webhook**: `/api/payment/stripe/webhook` (서명 검증 필수)
- **RLS**: `orders/enrollments` 본인 조회, 서버는 service-role로 처리
- **RPC**: `activate_paid_order(order_id)` (SECURITY DEFINER)
- **DoD**: 결제 후 ≤3s 내 "내 강의" 반영, 중복 등록 0건
- **참고 PR**: #123 Schema cache fix, #124 Stripe integration
- Stripe 세부 설정/운영은 `external-services/stripe.md`에서 관리

---

## 7) PR 작성 규칙 (간결 + 링크)

- 요약 5줄 이내 / 영향·리스크 3줄 / 테스트 결과 요약 / Docs 링크
- 코드가 결제/인증/외부 도구를 변경하면 `library/` 또는 `external-services/` 업데이트가 PR 요건

### 예시 PR 본문

```markdown
## Summary
- Stripe Checkout 연동(멱등/웹훅/Enroll upsert) 완성

## Impact & Risk
- 웹훅 실패 재시도 필요, 서버 전용 키 사용 강제

## Test
- Playwright 스모크 통과, 테스트 카드 결제 OK

## Docs
- 기능: docs/library/checkout.md
- 도구: docs/external-services/stripe.md
```

---

## 8) 거버넌스 & 자동화(얇고 효과 크게)

- **PR 템플릿**: `.github/PULL_REQUEST_TEMPLATE.md` — Summary/Impact/Test/Docs 링크
- **CODEOWNERS**: `docs/**` 리뷰어 지정
- **CI 게이트**: 결제/인증/도구 관련 코드 변경 시 대응 문서 미변경이면 경고/차단(라이트 룰)
- **문서 린트**: markdownlint, vale
- **Diagram as Code**: Mermaid 권장(변경 추적 용이)

---

## 9) AI 협업 프로토콜

- 새 작업 시작 프롬프트에 관련 `library/external-services` 경로 명시
  (예: 참조: `docs/library/checkout.md`)
- 결정사항은 Library 문서의 ADR-lite에 누적, 도구 변경은 `external-services`에 버전 로그로
- Work Plan에는 실험/로그/초안, Library/External Services에는 정답/운영을 남긴다

---

## 10) 유지보수 규칙

- 릴리즈/분기마다 `library/external-services` 최신화(Updated 날짜 갱신)
- Work Plan은 승격 또는 폐기(방치 금지)
- 링크는 상대경로, 리네이밍 시 PR에서 동시 수정
- **Front-matter 필수**: 모든 docs 폴더 문서는 필수 5개 필드 포함 (title, tags, created, updated, lifecycle)
- 문서 수정 시 Front-matter의 `updated` 날짜 갱신
- 파일명 변경 시 `aliases` 필드에 이전 이름 추가 및 참조 업데이트
- **문서 검증**: 작성/수정 후 `npm run docs:check` 실행 필수
  - Front-matter: `npm run docs:verify-frontmatter`
  - Markdown 포맷: `npm run docs:lint`
  - 링크 유효성: `npm run docs:links`

---

## 11) 빠른 실행 체크리스트

### 새 기능 시작
- [ ] `work-plans/<feature>.md` 생성 (템플릿 사용)
- [ ] Phase 체크리스트 작성
- [ ] 리스크 & 테스트 계획 초안
- [ ] 관련 `library/external-services` 문서 확인

### 작업 완료
- [ ] Work Plan 내용 정제
- [ ] `library/<feature>.md`로 승격 (템플릿 사용)
- [ ] 외부 도구 사용 시 `external-services/<tool>.md` 업데이트
- [ ] PR 작성 (요약 + 문서 링크)
- [ ] Work Plan 삭제

### 문서 품질
- [ ] kebab-case 파일명 준수
- [ ] 상대 경로 링크 사용
- [ ] 날짜/오너 메타데이터 추가
- [ ] markdownlint 통과

---

## 부록 A — DVS 보안/정합성 권장값

- 서비스 키는 서버 전용 경로에서만 사용(클라이언트 금지)
- 결제 직전 서버에서 가격 재검증(신뢰 근원은 DB)
- 멱등: `order_events.stripe_event_id unique`, `enrollments(user_id, course_id unique)`
- 배포 토글: `ENABLE_STRIPE` 등 환경 플래그로 안전 배포

---

## 부록 B — Mermaid 예시(선택)

```mermaid
sequenceDiagram
    participant U as User
    participant W as Web App
    participant S as Stripe
    participant DB as Supabase

    U->>W: Checkout
    W->>S: Create Session (idempotency: orderId)
    S-->>U: Redirect to Stripe
    S-->>W: Webhook (completed)
    W->>DB: orders.status=paid; rpc.activate_paid_order()
    DB-->>W: enrollments upserted
    W-->>U: Success page (My Courses updated)
```

---

**마지막 업데이트**: 2025-10-01
**작성자**: Development Team
**버전**: 1.0.0
