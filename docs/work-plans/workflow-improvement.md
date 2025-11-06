---
title: "Workflow Improvement Work Plan"
tags:
  - type/docs
  - progress/in-progress
created: 2025-11-05
updated: 2025-11-05
lifecycle: active
---

# Workflow Improvement - Work Plan

**Status**: Active
**Created**: 2025-11-05
**Last Updated**: 2025-11-05 (Phase 0 완료)
**Issue**: #49

---

## Overview

**목표**: 업계 베스트 프랙티스 반영하여 문서화 시스템 개선 (8.5/10 → 9.5/10)

**예상 시간**: 1시간 35분

**복잡도**: Standard

**배경**:
- 현재 워크플로우 평가: 8.5/10 (양호)
- 개선 기회: ADR 없음, Work Plan 템플릿 없음, Milestone 구조 복잡
- 업계 조사 완료 (Spotify, Microsoft, GitHub, 주요 OSS 프로젝트)

---

## Phases

- [x] **P0: 준비 및 Issue 생성** (완료)
- [ ] **P1: ADR 시스템 구축** (30분)
- [ ] **P2: Work Plan 템플릿 표준화** (15분)
- [ ] **P3: 문서 업데이트** (20분)
- [ ] **P4: Milestone 구조 검토** (10분)
- [ ] **P5: 검증 및 완료** (15분)

---

## Phase Details

### Phase 0: 준비 및 Issue 생성 ✅

**목표**: 작업 환경 설정 및 Issue 생성

**완료 항목**:
- [x] Issue #49 생성
- [x] Branch 생성: `docs/workflow-improvement`
- [x] Work Plan 생성: `docs/work-plans/workflow-improvement.md`

**결정사항**:
- **D1**: Phase 3 Milestone 없음 → Milestone 없이 Issue 생성
- **D2**: Work Plan 먼저 생성 → 맥락 유지

---

### Phase 1: ADR 시스템 구축

**목표**: docs/adr/ 폴더 + 템플릿 + 첫 ADR 작성

#### 1.1. 폴더 및 템플릿 생성

**작업**:
- [ ] `docs/adr/` 폴더 생성
- [ ] `docs/adr/TEMPLATE.md` - MADR 형식 템플릿
- [ ] `docs/adr/0001-record-architecture-decisions.md` - 메타 ADR

**템플릿 구조** (MADR 형식):
```markdown
# [number]. [Title]

Date: YYYY-MM-DD
Status: Accepted | Deprecated | Superseded
Deciders: [list]

## Context
문제 설명...

## Decision Drivers
- Driver 1
- Driver 2

## Considered Options
- Option 1
- Option 2

## Decision Outcome
선택: Option X

### Positive Consequences
- ...

### Negative Consequences
- ...

## Pros and Cons of the Options

### Option 1
- Good, because...
- Bad, because...

## Links
- [Related](...)
```

#### 1.2. INDEX 및 가이드

**작업**:
- [ ] `docs/adr/INDEX.md` - 모든 ADR 목록
- [ ] 언제 ADR을 작성하는지 가이드라인

**ADR 작성 기준**:
- ✅ 아키텍처 변경 (DB 선택, 프레임워크 선택)
- ✅ 기술 스택 선택 (Supabase, Next.js, etc.)
- ✅ 보안 결정 (인증 방식, 암호화 방식)
- ✅ 중요한 패턴 채택 (상태 관리, 폴더 구조)
- ❌ 간단한 구현 결정 (컴포넌트 분리, 함수 이름)

---

### Phase 2: Work Plan 템플릿 표준화

**목표**: docs/work-plans/TEMPLATE.md 생성

#### 2.1. 템플릿 생성

**작업**:
- [ ] `docs/work-plans/TEMPLATE.md` 생성
- [ ] Response Template 형식 포함
- [ ] 필수 섹션 정의

**템플릿 필수 섹션**:
1. Front-matter (title, tags, created, updated, lifecycle)
2. Overview (목표, 예상 시간, 복잡도, 배경)
3. Phases (체크리스트)
4. Phase Details (각 Phase별 세부 내용)
5. Progress Log (타임스탬프 + 작업 내역)
6. Decisions Log (결정사항 기록)
7. Risks & Mitigations
8. Next Steps
9. Completion Criteria

#### 2.2. 메타데이터

**추가 필드**:
- Delete By: YYYY-MM-DD (30일 후)
- Issue: #XX
- Status: Active | Paused | Completed

---

### Phase 3: 문서 업데이트

**목표**: CLAUDE.md, development-guide.md, README.md 업데이트

#### 3.1. docs/CLAUDE.md

**추가 내용**:
- Section 추가: ADR 작성 규칙
- Work Plan 템플릿 참조
- 문서 구조 업데이트 (adr/ 폴더)

**위치**: Section 5 (문서 작성 규칙) 확장

#### 3.2. modules/development-guide.md

**추가 내용**:
- ADR 작성 시점 가이드
- Work Plan 사용 기준 명확화
- 예시 추가

**위치**: 문서 작성 규칙 섹션 (Lines 83-133)

#### 3.3. docs/README.md

**업데이트 내용**:
- 새로운 폴더 구조 반영
- ADR 섹션 추가
- 네비게이션 업데이트

---

### Phase 4: Milestone 구조 검토

**목표**: 현황 분석 및 단순화 제안

#### 4.1. 현황 분석

**현재 Milestones**:
- Phase 1: Core Platform (2025-08-31) - 2개 이슈
- Phase 2: Admin System (2025-09-15) - 1개 이슈
- Phase 3: Enhancement (Open) - 0개 이슈 (Milestone 없음)

**업계 패턴**:
- React: Version 기반 (19.0.0)
- Next.js: Backlog 1개
- Supabase: Date 기반

#### 4.2. 제안

**Option A: 현재 유지**
- Phase 1, 2, 3 구조 유지
- Pros: 명확한 구분, 현재 사용 중
- Cons: 복잡도, Phase 3 Milestone 생성 필요

**Option B: 단순화**
- Active + Backlog 2개만
- Pros: 업계 표준, 간결함
- Cons: Phase 개념 상실

**사용자 결정 필요**: Phase 4에서 선택

---

### Phase 5: 검증 및 완료

**목표**: 검증 + Library 문서 + Work Plan 삭제 + PR

#### 5.1. 검증

**검증 명령**:
```bash
npm run docs:verify-frontmatter  # Front-matter 검증
npm run docs:lint                # Markdown 검증
npm run docs:links               # 링크 검증
npm run docs:check               # 전체 검증
```

#### 5.2. Library 문서 작성

**파일**: `docs/library/workflow-improvement.md`

**내용**:
- ADR 시스템 설명
- Work Plan 템플릿 가이드
- Milestone 구조 (최종 결정 반영)
- 관련 커밋 참조

#### 5.3. 정리

**작업**:
- [ ] Work Plan 삭제: `git rm docs/work-plans/workflow-improvement.md`
- [ ] PR 생성: `gh pr create --title "feat: improve workflow with ADR system and templates - Closes #49"`
- [ ] Branch 정리 (PR 머지 후)

---

## Progress Log

### 2025-11-05 17:30 - Phase 0 Completed ✅
- Issue #49 생성: https://github.com/Hulkeinstein/dvs-template01/issues/49
- Branch 생성: docs/workflow-improvement
- Work Plan 생성: docs/work-plans/workflow-improvement.md
- **Decision D1**: Phase 3 Milestone 없어서 Milestone 없이 Issue 생성
- **Next**: Phase 1 시작 (ADR 시스템 구축)

---

## Decisions Log

### D1: Phase 3 Milestone 부재 (2025-11-05)
**문제**: `gh issue create --milestone "Phase 3: Enhancement"` 실패

**결정**: Milestone 없이 Issue 생성

**이유**:
- Phase 3 Milestone이 GitHub에 존재하지 않음
- Phase 4에서 Milestone 구조 재검토 예정
- 작업 진행 차단하지 않기 위해 우선 생성

**영향**: Issue #49는 Milestone 없음

---

### D2: Work Plan 우선 생성 (2025-11-05)
**질문**: Work Plan을 언제 생성할까?

**결정**: Branch 생성 직후, 코딩 전에 생성

**이유**:
- AI 협업을 위한 맥락 유지
- 세션 중단 시 복구 용이
- Response Template 준수

**영향**: 모든 Standard/Risky 작업에 Work Plan 필수

---

## Risks & Mitigations

### R1: ADR 작성 기준 모호함
**완화 방안**:
- 명확한 가이드라인 작성
- 예시 ADR 제공
- "When to Write ADR" 섹션 추가

### R2: Work Plan 템플릿 복잡도
**완화 방안**:
- 필수/선택 섹션 구분
- 간단한 예시 포함
- 기존 Work Plan 참고

### R3: Milestone 구조 변경 시 기존 Issue 영향
**완화 방안**:
- Phase 4에서 사용자 결정 후 진행
- 기존 Issue 이동 방법 문서화
- 점진적 마이그레이션

---

## Next Steps

**Immediate**:
1. Phase 1 시작 (ADR 시스템 구축)
2. docs/adr/ 폴더 생성
3. TEMPLATE.md 작성

**After Phase 1**:
- ADR 시스템 검증
- Phase 2 시작 (Work Plan 템플릿)

---

## Completion Criteria

**Phase 0**: ✅
- [x] Issue #49 생성
- [x] Branch 생성
- [x] Work Plan 생성

**Phase 1**:
- [ ] docs/adr/ 폴더 + 파일 3개 (TEMPLATE, INDEX, 0001)
- [ ] Front-matter 검증 통과

**Phase 2**:
- [ ] docs/work-plans/TEMPLATE.md 생성
- [ ] Response Template 형식 포함

**Phase 3**:
- [ ] CLAUDE.md, development-guide.md, README.md 업데이트
- [ ] npm run docs:check 통과

**Phase 4**:
- [ ] Milestone 현황 분석 완료
- [ ] 제안서 작성
- [ ] 사용자 결정

**Phase 5**:
- [ ] 검증 통과
- [ ] Library 문서 작성
- [ ] Work Plan 삭제
- [ ] PR 생성 및 머지

---

## Reference

- Industry Research: docs/library/docs-automation.md
- Work Plan Guide: docs/workflows/work-plan-guide.md
- Project Workflow: modules/workflow.md
- Development Guide: modules/development-guide.md
