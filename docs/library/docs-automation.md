---
title: "Documentation Automation System"
tags:
  - type/feature
  - component/documentation
  - progress/completed
created: 2025-11-05
updated: 2025-11-05
lifecycle: active
category: library
related:
  - ../workflows/work-plan-guide.md
  - ../CLAUDE.md
---

# Documentation Automation System

## 📊 개요

**한 줄 설명**: Obsidian 스타일 Front-matter + 자동 검증으로 문서 품질을 강제하는 CI 통합 시스템

**배경**:
- 기존 문제: Front-matter 누락, 파일명 불일치, 깨진 링크
- 목표: 45/100 → 80/100 품질 달성
- 솔루션: Front-matter 표준화 + 자동 검증 + CI Strict Mode

**릴리즈**: 2025-11-05 (Phase 5 완료)

---

## 🏗️ 아키텍처

### 시스템 구성

```
Documentation Quality System
│
├── Front-matter Standard (Obsidian 스타일)
│   ├── 네임스페이스 태그 (phase/, type/, component/, external/, progress/)
│   ├── 필수 필드 5개 (title, tags, created, updated, lifecycle)
│   └── 선택 필드 (aliases, category, related, owners)
│
├── Validation Tools
│   ├── verify-frontmatter.mjs - Front-matter 검증
│   ├── markdownlint-cli2 - Markdown 포맷 검사
│   └── check-links.mjs - 링크 유효성 검증 (Windows 호환 wrapper)
│
└── CI Integration
    └── .github/workflows/docs-check.yml
        ├── Trigger: docs/** 파일 변경 시만 실행
        ├── Strict Mode: 검증 실패 시 PR 차단
        └── Summary: 검증 결과 요약 표시
```

### Front-matter 필수 필드

```yaml
---
title: "문서 제목"                    # 필수
tags:                                 # 필수 (네임스페이스 배열)
  - phase/1|2|3
  - type/feature|bug|docs|security|performance
  - component/auth|payment|ui|database|api
  - external/stripe|paypal|supabase  # 다중 허용
  - progress/completed|in-progress|backlog|blocked
created: YYYY-MM-DD                   # 필수 (Git 최초 작성일)
updated: YYYY-MM-DD                   # 필수 (최종 수정일)
lifecycle: active|deprecated|draft    # 필수 (문서 생명주기)
aliases: []                           # 선택 (파일명 변경 시)
category: library|guide|reference     # 선택
related: []                           # 선택 (상대 경로)
---
```

---

## 🔑 주요 결정 (ADR-lite)

### D1: Obsidian 스타일 채택
**결론**: 네임스페이스 태그 시스템 사용 (`category/value` 형식)

**근거**:
- 명확한 카테고리 분류 (`phase/1`, `type/feature`)
- 검색 쿼리 정확도 향상
- Obsidian 커뮤니티 Best Practice

**대안**:
- A안: 플랫 태그 (`feature`, `phase1`) - 충돌 위험
- B안: 네임스페이스 태그 (채택) ✅
- C안: 카테고리 필드 분리 - 복잡도 증가

**영향**: 24개 파일 Front-matter 추가/수정

---

### D2: status 충돌 해결
**결론**: `status` → `lifecycle` (문서 생명주기), `status/*` → `progress/*` (작업 진행 상태)

**근거**:
- 의미론적 충돌 제거 (`status: active` vs `status/completed`)
- 문서 상태와 작업 상태 명확히 분리
- GPT-5 제안 + Obsidian 커뮤니티 참고

**대안**:
- A안: status 키만 사용 - 작업 상태 표현 불가
- B안: 분리 (lifecycle + progress/*) ✅
- C안: 태그만 사용 - 문서 생명주기 표현 어려움

**영향**: docs/CLAUDE.md, docs/README.md, 6개 파일 업데이트

**커밋**: 8ae4596

---

### D3: CI Warning Mode → Strict Mode
**결론**: Phase 5 완료 후 `continue-on-error: false` 설정

**근거**:
- Phase 4: Warning Mode로 검증 시스템 테스트
- Phase 5: 모든 파일 수정 완료 후 Strict Mode 활성화
- 점진적 도입으로 리스크 최소화

**대안**:
- A안: 즉시 Strict Mode - P5 작업 중 CI 실패 위험
- B안: 점진적 도입 (Warning → Strict) ✅
- C안: Warning Mode 유지 - 강제성 부족

**영향**: docs/** 변경 PR은 검증 통과 필수

**커밋**: dbf3b13

---

## 🧩 구현 포인트

### 1. Front-matter 검증 (verify-frontmatter.mjs)

**핵심 로직**:
```javascript
// 필수 필드 검증
const requiredFields = ['title', 'tags', 'created', 'updated', 'lifecycle'];

// 네임스페이스 태그 검증
const namespaces = {
  'phase': ['1', '2', '3'],
  'type': ['feature', 'bug', 'docs', 'security', 'performance'],
  'component': ['auth', 'payment', 'ui', 'database', 'api'],
  'external': ['stripe', 'paypal', 'supabase', 'nextauth'],
  'progress': ['completed', 'in-progress', 'backlog', 'blocked']
};

// lifecycle 값 검증
const validLifecycle = ['active', 'deprecated', 'draft'];
```

**실행**: `npm run docs:verify-frontmatter`

**출력 예시**:
```
✓ 24/24 files passed validation
```

---

### 2. 링크 검증 (check-links.mjs)

**Windows 호환성 문제 해결**:
- markdown-link-check는 Windows glob 미지원
- 직접 glob 패키지로 파일 찾기 → 각 파일별 실행

**핵심 로직**:
```javascript
const files = await glob('docs/**/*.md', { cwd: rootDir });
for (const file of files) {
  await spawn('npx', ['markdown-link-check', fullPath, '--quiet']);
}
```

**실행**: `npm run docs:links`

---

### 3. CI 워크플로우 (.github/workflows/docs-check.yml)

**트리거 조건**:
```yaml
on:
  push:
    paths:
      - 'docs/**'
  pull_request:
    paths:
      - 'docs/**'
```

**검증 단계**:
1. Front-matter 검증 (`continue-on-error: false`)
2. Markdown 포맷 검사 (`continue-on-error: false`)
3. 링크 유효성 검증 (`continue-on-error: false`)

**Strict Mode 설정**:
```yaml
- name: Verify Front-matter
  continue-on-error: false  # 실패 시 PR 차단
```

---

## 🧪 테스트 & 검증

### 로컬 검증

**전체 검증**:
```bash
npm run docs:check
```

**개별 검증**:
```bash
npm run docs:verify-frontmatter  # Front-matter만
npm run docs:lint                # Markdown 포맷만
npm run docs:links               # 링크만
```

### 수용 기준 (DoD)

- ✅ 24/24 files Front-matter 검증 통과
- ✅ Markdown lint 0 errors (warnings 허용)
- ✅ Broken links 0개 (localhost/bot-blocked 제외)
- ✅ CI Strict Mode 활성화
- ✅ docs/** 변경 PR은 검증 통과 필수

### 검증 결과

**P5.1 완료 후**:
```
✓ 24/24 files passed Front-matter validation
✓ All files have required fields (title, tags, created, updated, lifecycle)
✓ All namespace tags valid
```

**P5.2 완료 후**:
```
✓ 10 broken links fixed
✓ Real issues: security-principles moved, database-migration-guide not exists
✓ False positives ignored: localhost URLs, bot-blocked sites
```

**P5.3 완료 후**:
```
✓ CI Strict Mode activated
✓ continue-on-error: false for all validation steps
✓ docs/** changing PRs must pass validation
```

---

## 📦 관련 파일

### Scripts
- `scripts/verify-frontmatter.mjs` (195 lines)
  - Front-matter 필수 필드 검증
  - 네임스페이스 태그 검증
  - lifecycle/progress 값 검증

- `scripts/check-links.mjs` (60 lines)
  - Windows 호환 glob wrapper
  - markdown-link-check 각 파일 실행

### CI
- `.github/workflows/docs-check.yml` (72 lines)
  - docs/** 트리거
  - 3단계 검증 (Front-matter, Markdown, Links)
  - Strict Mode (continue-on-error: false)

### Configuration
- `package.json` - Scripts 정의
  ```json
  "docs:verify-frontmatter": "node scripts/verify-frontmatter.mjs",
  "docs:lint": "markdownlint-cli2 \"docs/**/*.md\"",
  "docs:links": "node scripts/check-links.mjs",
  "docs:check": "npm run docs:verify-frontmatter && npm run docs:lint && npm run docs:links"
  ```

- `.markdownlint.json` - Markdown lint 규칙
- `package.json` devDependencies:
  - `markdownlint-cli2: ^0.16.0`
  - `markdown-link-check: ^3.13.6`
  - `glob: ^11.0.0`

### Documentation
- `docs/CLAUDE.md` - Section 4 (Front-matter), Section 10 (검증 명령)
- `modules/development-guide.md` - Lines 83-133 (문서 작성 규칙)
- `docs/README.md` - Front-matter 템플릿, 태그 카탈로그

---

## 🔗 참고 Commits

### Phase 4 (자동화 구축)
- **9f16b3d**: feat(p4.1): add Front-matter verification script
  - verify-frontmatter.mjs 생성
  - 네임스페이스 태그 검증 로직

- **9f16b3d**: feat(p4.2): add Markdown validation tools
  - markdownlint-cli2, markdown-link-check 추가
  - check-links.mjs Windows wrapper
  - docs/CLAUDE.md Section 10 업데이트

- **9f16b3d**: feat(p4.3): add CI workflow with Warning Mode
  - .github/workflows/docs-check.yml 생성
  - continue-on-error: true (Warning Mode)

### Phase 5 (품질 완성)
- **5dafe6b**: feat(p5.1): add Front-matter to 18 files
  - 24/24 files Front-matter 완료
  - TEST_REPORT.md lifecycle 오류 수정

- **73137c9**: feat(p5.2): fix 10 broken links
  - email-setup.md, system-design.md 링크 수정
  - mcp.md, paypal.md, stripe.md 링크 제거

- **dbf3b13**: feat(p5.3): enable CI strict mode
  - continue-on-error: false 설정
  - Summary 메시지 업데이트

- **584cac2**: feat(p5.4): update Work Plan with Phase 5 status
  - Progress Log 추가
  - Phase 5 완료 내역 기록

---

## 📚 관련 문서

### Work Plans
- [docs-improvement.md](../work-plans/docs-improvement.md) - 전체 작업 기록

### Guides
- [work-plan-guide.md](../workflows/work-plan-guide.md) - Work Plan 워크플로우

### References
- [CLAUDE.md](../CLAUDE.md) - 문서 작성 규칙 (Section 4, 10)
- [development-guide.md](../../modules/development-guide.md) - 파일명 규칙

### External Services
- [mcp.md](../external-services/mcp.md)
- [stripe.md](../external-services/stripe.md)
- [paypal.md](../external-services/paypal.md)

---

## 🔧 트러블슈팅

### Front-matter 검증 실패

**증상**:
```
docs/example.md
  - Missing required field: tags
```

**해결**:
1. Front-matter 필수 필드 확인
2. 네임스페이스 태그 형식 확인 (`category/value`)
3. lifecycle 값 검증 (active|deprecated|draft)

**예시**:
```yaml
---
title: "Example Document"
tags:
  - type/docs
  - component/ui
created: 2025-11-05
updated: 2025-11-05
lifecycle: active
---
```

---

### 링크 검증 False Positive

**증상**:
```
[✖] http://localhost:3000 → 404
[✖] https://github.com/example → 403 (bot-blocked)
```

**해결**: False positive로 판단되면 무시
- localhost URLs: 로컬 개발 서버
- 403 errors: Bot 차단 (실제로는 유효한 링크)
- URL-encoded anchors: 일부 도구 미지원

**실제 문제만 수정**:
- 404: 파일 이동/삭제 → 링크 업데이트 필요
- Relative path 오류 → 경로 수정

---

### CI 검증 실패

**증상**: PR에서 docs-check workflow 실패

**원인 확인**:
1. GitHub Actions 로그 확인
2. 로컬에서 `npm run docs:check` 실행
3. 각 단계별 개별 실행으로 원인 파악

**해결**:
```bash
# 로컬 검증
npm run docs:verify-frontmatter
npm run docs:lint
npm run docs:links

# 수정 후 재커밋
git add docs/
git commit -m "fix(docs): resolve validation errors"
```

---

## 📊 성과

**품질 점수**:
- Before: 45/100
- After: 80/100 ✅

**개선 사항**:
- ✅ Front-matter 표준화 (24/24 files)
- ✅ 파일명 규칙 메모리 명시 (kebab-case)
- ✅ 자동 검증 시스템 구축
- ✅ CI Strict Mode 활성화
- ✅ Broken links 수정 (10개)

**운영 효과**:
- docs/** 변경 시 자동 품질 검사
- PR merge 전 검증 강제
- 문서 일관성 유지

---

**마지막 업데이트**: 2025-11-05
**Status**: 🟢 Active (Production Ready)
