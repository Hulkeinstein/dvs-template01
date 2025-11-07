---
title: "Workflow Improvement (Milestone System)"
tags:
  - phase/1
  - type/docs
  - component/workflow
  - progress/completed
created: 2025-11-06
updated: 2025-11-07
lifecycle: active
category: library
related:
  - ../workflows/milestone-workplan-adr-relationship.md
  - ../workflows/work-plan-guide.md
  - ../../modules/workflow.md
---

# Workflow Improvement (Milestone System)

## 📊 개요

**목적**: 프로젝트 Milestone 구조를 Solo Developer에 최적화
**배경**: Phase 1/2/3 구조의 마감일이 과거였고, Active/Backlog 없어 작은 작업 관리 어려움
**릴리즈**: 2025-11-07

## 🏗️ Before (문제점)

**기존 구조**:
- Phase 1: Core Platform (2025-08-31 마감 - 과거)
- Phase 2: Admin System (2025-09-15 마감 - 과거)
- Phase 3: Enhancement & Optimization (2025-10-15 마감 - 과거)

**문제**:
1. 모든 마감일이 과거 (혼란)
2. Quick tasks (<=2h) 관리 없음
3. Active/Backlog Milestone 없음
4. Routing Rules 불명확
5. Exit Criteria 없음
6. Hardcoded Milestone ID 사용 (fragile)

## 🏗️ After (개선)

**Hybrid 모델** 채택:
```
Active (no due date)
├─ Quick tasks (<=2h)
├─ Documentation
└─ Hotfixes

Phase 1: Core Platform (2025-11-30)
└─ Student/Teacher core features

Phase 2: Admin System (2025-12-15)
└─ PreSkool integration

Phase 3: Closed
└─ Unused, closed per best practice
```

**개선 사항**:
1. ✅ Active Milestone 추가 (상시 운영)
2. ✅ Phase 1/2 마감일 업데이트 (미래 날짜)
3. ✅ Phase 3 폐쇄 (empty milestone)
4. ✅ Routing Rules 문서화
5. ✅ Exit Criteria 정의
6. ✅ Title-based 쿼리 (ID 대신)

## 🔑 주요 결정

### D1: Hybrid 모델 (Active + Phase 1/2)

**결정**: Active + Phase 1/2 구조 채택 (Phase 3 폐쇄)

**근거**:
- **Industry Best Practices 조사**:
  - Most common: Semantic Versioning (TypeScript, React, Node.js)
  - Second: Single Backlog (Next.js)
  - DVS 적합: Active + Phase-based (hybrid)
- **GPT-5 Feedback**:
  - Max 3 active milestones
  - Delete empty milestones
  - Just-in-time creation
  - Past due dates cause confusion

**대안**:
- Option A: Active + Backlog (pure Agile) - 너무 단순
- Option B: Phase 1/2/3 유지 + 날짜만 수정 - Phase 3 empty
- Option C: Hybrid (선택) - Active + Phase 1/2

**영향**:
- Issue #49를 Active로 이동
- 문서 3개 업데이트 (modules/workflow.md, milestone-workplan-adr-relationship.md)

### D2: Phase 3 폐쇄

**결정**: Phase 3 Milestone 폐쇄

**근거**:
- Empty milestone (이슈 0개)
- Just-in-time creation 원칙
- Best practice: 사용하지 않는 Milestone은 삭제

**대안**:
- 유지 (미래 대비) - 오버 엔지니어링
- 폐쇄 (선택) - 깔끔

**영향**: 없음 (empty 상태였음)

### D3: Title-based Milestone 쿼리

**결정**: Milestone 참조 시 title 사용 (ID 대신)

**근거**:
- Hardcoded ID는 취약 (milestone 재생성 시 변경)
- Title은 안정적 (사용자가 명시적으로 변경)

**대안**:
- Hardcoded ID - fragile
- Title query (선택) - 안정적

**구현**:
```bash
# Before (취약)
gh issue edit 49 --milestone "4"

# After (안정)
gh issue edit 49 --milestone "Active"
```

## 📐 Routing Rules

**명확한 이슈 할당 기준**:

| 작업 유형 | 예상 시간 | Milestone |
|---------|---------|-----------|
| Quick tasks | <=2h | Active |
| Documentation | Any | Active |
| Hotfixes | <=2h | Active |
| Feature development (Phase 1) | 2h+ | Phase 1: Core Platform |
| Feature development (Phase 2) | 2h+ | Phase 2: Admin System |
| Future ideas | N/A | No milestone (Backlog) |

**명령어 예시**:
```bash
# Quick task
gh issue create --title "[Fix] Button alignment" --milestone "Active"

# Feature development
gh issue create --title "[Feature] Assignment Template" --milestone "Phase 1: Core Platform"

# Future idea
gh issue create --title "[Idea] Real-time notifications"  # No milestone
```

## 🎯 Exit Criteria

**Milestone 닫기 기준**:
1. All issues closed (100% 완료)
2. Milestone 목적 달성 확인
3. (Optional) Release note 작성

**프로세스**:
```bash
# 1. 이슈 확인
gh issue list --milestone "Phase 1: Core Platform"

# 2. 모두 닫힘 확인
# 3. Milestone 닫기
gh api repos/Hulkeinstein/dvs-template01/milestones/$ID -X PATCH -f state="closed"

# 4. (Optional) Release note 작성
```

## 🧩 구현 세부사항

### GitHub Milestone API

#### 1. Active Milestone 생성
```bash
gh api repos/Hulkeinstein/dvs-template01/milestones \
  -f title="Active" \
  -f description="Quick tasks (<=2h), documentation, hotfixes"
```
**결과**: ID 4 생성

#### 2. Phase 1/2 마감일 업데이트
```bash
# Phase 1
P1_ID=$(gh api repos/Hulkeinstein/dvs-template01/milestones \
  -q '.[]|select(.title=="Phase 1: Core Platform")|.number')
gh api repos/Hulkeinstein/dvs-template01/milestones/$P1_ID -X PATCH \
  -f due_on="2025-11-30T23:59:59Z"

# Phase 2
P2_ID=$(gh api repos/Hulkeinstein/dvs-template01/milestones \
  -q '.[]|select(.title=="Phase 2: Admin System")|.number')
gh api repos/Hulkeinstein/dvs-template01/milestones/$P2_ID -X PATCH \
  -f due_on="2025-12-15T23:59:59Z"
```

#### 3. Phase 3 폐쇄
```bash
P3_ID=$(gh api repos/Hulkeinstein/dvs-template01/milestones \
  -q '.[]|select(.title=="Phase 3: Enhancement & Optimization")|.number')
gh api repos/Hulkeinstein/dvs-template01/milestones/$P3_ID -X PATCH \
  -f state="closed"
```
**결과**: 2025-11-07T06:32:53Z 폐쇄

#### 4. Issue #49 마일스톤 변경
```bash
gh issue edit 49 --milestone "Active"
```

### 문서 업데이트

#### modules/workflow.md (Lines 38-56)
```markdown
### Milestones

**Current structure**:
- **Active** (no due date): Quick tasks (<=2h), docs, hotfixes
- **Phase 1: Core Platform** (2025-11-30): Student/Teacher core
- **Phase 2: Admin System** (2025-12-15): PreSkool integration

**Exit Criteria**: All issues closed → Milestone closed → (Optional) Release note

**Routing Rules**:
- Quick tasks/docs/hotfixes → Active
- Feature work → Phase 1 or Phase 2
- Future ideas (no milestone) → Backlog
```

#### milestone-workplan-adr-relationship.md (Lines 23-37)
```markdown
## DVS Project Specifics

### Current Milestones

- **Active** (no due date): Quick tasks (<=2h), docs, hotfixes
- **Phase 1: Core Platform** (2025-11-30): Student/Teacher core features
- **Phase 2: Admin System** (2025-12-15): PreSkool integration

**Closed Milestones** (2025-11-07):
- Phase 3: Enhancement & Optimization (unused, closed per best practice)

**Routing Rules**:
- <=2h, docs, hotfixes → Active
- Feature development → Phase 1/2
- No milestone → Future backlog
```

## 🧪 검증

### 최종 상태 확인
```bash
gh api repos/Hulkeinstein/dvs-template01/milestones
```

**결과**:
- ✅ Active (ID: 4, no due date, open issues: 1)
- ✅ Phase 1 (due: 2025-11-30, open issues: 2, closed: 4)
- ✅ Phase 2 (due: 2025-12-15, open issues: 1)
- ✅ Phase 3: Closed (not shown)

## 📦 관련 파일

### 코드
- `modules/workflow.md` (Milestone 섹션 업데이트)
- `docs/workflows/milestone-workplan-adr-relationship.md` (Current Milestones 업데이트)

### 마이그레이션
- GitHub Milestones (API 호출)

### 테스트
- Manual verification (GitHub API)
- Issue #49 migration test

## 🔗 참고 커밋

- **e6dd804**: "docs: document Milestone, Work Plan, ADR system relationship"
  - Milestone/Work Plan/ADR 관계 문서화
  - 전역 vs 프로젝트 문서 분리

- **4e781df**: "feat(p4): adopt hybrid milestone model (Active + Phase1/2)"
  - Active Milestone 생성
  - Phase 1/2 마감일 업데이트
  - Phase 3 폐쇄
  - Routing Rules, Exit Criteria 추가

## 📚 관련 문서

- **Work Plan**: [완료 후 삭제됨] docs/work-plans/workflow-improvement.md
- **Workflow**: [../../modules/workflow.md](../../modules/workflow.md)
- **Relationship**: [../workflows/milestone-workplan-adr-relationship.md](../workflows/milestone-workplan-adr-relationship.md)
- **Work Plan Guide**: [../workflows/work-plan-guide.md](../workflows/work-plan-guide.md)
- **Issue**: [#49](https://github.com/Hulkeinstein/dvs-template01/issues/49)
- **Branch**: `docs/workflow-improvement`

## 🎓 교훈 (Lessons Learned)

### What Went Well
- Industry best practices 조사가 결정에 도움
- GPT-5 feedback로 blind spots 발견
- Title-based 쿼리로 안정성 확보

### What Could Be Improved
- 초기부터 Active Milestone 설정했다면 더 나았을 것
- Phase 3를 미리 만들지 않았다면 (just-in-time)

### Future Recommendations
- 새 Milestone은 just-in-time 생성
- 마감일은 현실적으로 설정 (과거 날짜 방지)
- Routing Rules를 항상 문서화
- Exit Criteria 명확히 정의

---

**Last Updated**: 2025-11-07
**Author**: Development Team
**Status**: Completed
