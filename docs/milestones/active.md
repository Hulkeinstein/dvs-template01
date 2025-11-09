---
title: "Active Milestone: Quick Wins"
tags:
  - type/docs
  - type/chore
  - component/workflow
  - progress/active
created: 2025-11-09
updated: 2025-11-09
lifecycle: active
related:
  - ../ROADMAP.md
  - ../PROJECT_VISION.md
---

# Active Milestone: Quick Wins

**GitHub Milestone**: Active
**Duration**: 지속적 (No due date)
**Status**: 🟢 Active

---

## 📋 Overview

### Purpose

**Quick Wins**: 긴급 작업, 문서, Hotfix를 빠르게 처리하는 Milestone

**Characteristics**:
- **단시간**: <2시간 소요
- **독립적**: 특정 Phase와 무관
- **즉시 처리**: Issue 생성 → 즉시 작업 → 빠른 PR → Close

**Why Active Milestone?**

**Phase Milestone의 한계**:
- Phase 1, 2, 3는 대규모 기능 개발
- 작은 버그 수정, 문서 작업은 Phase에 적합하지 않음
- Active Milestone으로 신속한 처리 가능

**Business Value**:
- 빠른 문제 해결 (Hotfix)
- 문서 최신화 (Documentation)
- 린트/포맷팅 (Code Quality)
- 환경 변수 추가 (Configuration)

---

## 🎯 Goals

### Primary Goals

1. **빠른 응답**
   - Hotfix 즉시 처리 (<2h)
   - 문서 즉시 업데이트

2. **Phase 무관**
   - Phase 1-3과 독립적
   - 언제든지 처리 가능

3. **품질 유지**
   - 작은 작업도 PR 필수
   - 코드 리뷰 (Solo Dev는 자가 검토)

---

## 🚀 Use Cases

### 1. 문서 작성/수정

**Examples**:
- `docs/library/` 문서 업데이트
- `README.md` 수정
- `CHANGELOG.md` 추가
- Front-matter 수정 (tags, updated 날짜)

**Process**:
```bash
# Issue 생성
gh issue create --title "[Docs] Update README" --milestone "Active"

# Branch 생성
git checkout -b docs/update-readme

# 문서 수정
edit docs/README.md

# Commit
git commit -m "docs: update README with new structure"

# PR 생성
gh pr create --title "docs: update README - Closes #XX"

# Merge & Close
```

**Estimate**: <1h

---

### 2. 버그 수정 (Hotfix)

**Examples**:
- Typo 수정
- 링크 깨짐 수정
- 환경 변수 오타 수정
- RLS 정책 오류 수정 (간단한 경우)

**Process**:
```bash
# Issue 생성 (긴급)
gh issue create --title "[Hotfix] Fix broken link" --milestone "Active" --label "priority/P0"

# Hotfix branch 생성
git checkout -b hotfix/broken-link

# 수정
edit docs/README.md

# Commit
git commit -m "fix: broken link in README"

# PR 생성 (Emergency)
gh pr create --title "fix: broken link - Closes #XX" --label "priority/P0"

# Merge & Deploy
```

**Estimate**: <1h

---

### 3. 린트/포맷팅

**Examples**:
- ESLint 에러 수정
- Prettier 포맷 적용
- TypeScript 타입 에러 수정 (간단한 경우)

**Process**:
```bash
# Issue 생성
gh issue create --title "[Chore] Fix lint errors" --milestone "Active"

# Branch 생성
git checkout -b chore/lint-fix

# Lint 수정
npm run lint -- --fix
npm run format

# Commit
git commit -m "chore: fix lint errors"

# PR 생성
gh pr create --title "chore: fix lint errors - Closes #XX"
```

**Estimate**: <1h

---

### 4. 환경 변수 추가

**Examples**:
- `.env.example` 업데이트
- 새 API 키 추가
- Feature Flag 추가

**Process**:
```bash
# Issue 생성
gh issue create --title "[Config] Add new env var" --milestone "Active"

# Branch 생성
git checkout -b config/add-env-var

# .env.example 수정
echo "NEW_API_KEY=" >> .env.example

# Commit
git commit -m "config: add NEW_API_KEY to .env.example"

# PR 생성
gh pr create --title "config: add new env var - Closes #XX"
```

**Estimate**: <30min

---

### 5. 의존성 업데이트

**Examples**:
- `package.json` 버전 업데이트
- Security patch 적용
- Supabase CLI 업데이트

**Process**:
```bash
# Issue 생성
gh issue create --title "[Chore] Update dependencies" --milestone "Active"

# Branch 생성
git checkout -b chore/update-deps

# 업데이트
npm update
npm audit fix

# Commit
git commit -m "chore: update dependencies"

# PR 생성
gh pr create --title "chore: update dependencies - Closes #XX"
```

**Estimate**: <1h

---

## 📋 Criteria

### Inclusion Criteria (Active에 포함)

**✅ 포함**:
- **시간**: <2시간 소요
- **타입**: docs, chore, fix (Hotfix), config
- **독립성**: Phase와 무관
- **긴급성**: 즉시 처리 필요

**Examples**:
- 문서 작성/수정
- Typo 수정
- 링크 깨짐 수정
- 린트/포맷팅
- 환경 변수 추가
- 의존성 업데이트 (Security patch)
- README 업데이트

---

### Exclusion Criteria (Active 제외, Phase로 이동)

**❌ 제외 (Phase로 이동)**:
- **시간**: 2시간 이상 소요
- **타입**: feature, refactor (대규모)
- **복잡도**: 여러 파일 수정, DB 마이그레이션
- **Phase 관련**: Phase 1-3의 기능 개발

**Examples**:
- 새 기능 추가 (YouTube API, 좋아요 시스템)
- 대규모 리팩토링 (TypeScript 마이그레이션)
- DB 스키마 변경 (테이블 추가)
- UI 컴포넌트 신규 개발

**→ Phase Milestone로 이동**

---

## ✅ Exit Criteria

**Milestone Close 조건**: 없음 (지속적 Milestone)

**Note**: Active Milestone은 절대 Close하지 않습니다. 작은 작업을 계속 처리하는 Inbox 역할입니다.

---

## 📦 Deliverables

**다양한 타입** (Issue마다 다름):
- Documentation 파일 (`.md`)
- Configuration 파일 (`.env.example`, `package.json`)
- Code fixes (`.ts`, `.tsx`)
- Migration 파일 (간단한 경우)

---

## 🗓️ Timeline

**지속적** (No specific timeline)

**Process**:
1. Issue 생성 → Active Milestone 할당
2. Branch 생성
3. 작업 (<2h)
4. PR 생성
5. Merge & Close
6. 다음 Issue

**Flexibility**: Solo Dev 특성상 언제든지 처리 가능

---

## 🔗 Dependencies

### Prerequisites
- ❌ 없음 (독립적)

### Blocking Dependencies
- ❌ 없음

**Note**: Active Milestone은 모든 Phase와 독립적으로 실행 가능합니다.

---

## ⚠️ Risks & Mitigation

### Risk 1: Active Milestone이 Backlog화
**Probability**: Medium
**Impact**: Low
**Mitigation**:
- 주 1회 Active Milestone 정리
- 2시간 이상 소요 예상 Issue → Phase로 이동
- Closed Issue는 Milestone에서 제거하지 않음 (기록 유지)

### Risk 2: Hotfix 누락
**Probability**: Low
**Impact**: High
**Mitigation**:
- Priority Label 사용 (P0: Critical)
- Hotfix는 즉시 처리 (<1h)
- Slack/Email 알림 (프로덕션 에러 시)

---

## 📊 Current Status

**Open Issues**: 2개 (예시)
- #53: 애자일 프로젝트 구조 재정립 (Work Plan)
- #XX: Update CLAUDE.md

**Closed Issues**: 13개 (예시)
- #51: feat: global docs Phase 1 (templates)
- #49: feat: workflow improvement
- ...

**Total**: 15개 (Open 2 + Closed 13)

---

## 🔗 Related Documents

**Roadmap**:
- [Product Roadmap](../ROADMAP.md)
- [Project Workflow](../../modules/workflow.md)

**Milestones**:
- [Phase 0: Tech Debt](./phase-0.md)
- [Phase 1: MVP](./phase-1.md)
- [Phase 2: Enhancement](./phase-2.md)
- [Phase 3: Scale](./phase-3.md)

---

**Last Updated**: 2025-11-09
**Owner**: Development Team
**Status**: 🟢 Active
