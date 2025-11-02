# Docs Folder Improvement - Work Plan

**Status**: Active
**Created**: 2025-02-11
**Last Updated**: 2025-02-11 (Phase 0 완료)

---

## Overview

**목표**: docs 폴더 문서화를 현업 기준 수준으로 개선 (45/100 → 80/100)

**예상 시간**: 4-6 hours

**복잡도**: Standard

**배경**:
- 현재 docs 폴더에 메모리 오류 발견 (AUTOMATION_GUIDE.md, CLAUDE.md)
- 파일명 kebab-case 미준수 (8개 파일)
- Front-matter 누락 (6개 파일)
- 중복/불필요 파일 존재

---

## Phases

- [x] **P0: Work Plan 시스템 구축** (완료)
- [ ] **P1: 메모리 파일 오류 수정** (AUTOMATION_GUIDE.md, CLAUDE.md)
- [ ] **P2: 파일명 kebab-case 변환** (8개 파일)
- [ ] **P3: Front-matter 추가** (6개 파일)
- [ ] **P4: 품질 개선** (README, 중복 제거, 섹션 보완)

---

## Phase Details

### Phase 0: Work Plan 시스템 구축 ✅

**목표**: Work Plan 워크플로우 도입으로 맥락 유지 문제 해결

**완료 항목**:
- [x] 현업 Best Practices 조사 (Git hooks, Task management)
- [x] 3-파일 구조 설계
  - Global memory: `~/.claude/modules/work-plan-protocol.md`
  - Project reference: `docs/workflows/work-plan-guide.md`
  - Active work plan: `docs/work-plans/docs-improvement.md`
- [x] 파일 생성

**결정사항**:
- **D1**: modules/ 폴더는 이동하지 않음 (프로젝트별 AI 메모리용)
- **D2**: 참고 문서는 1개로 통합 (Solo dev 최적화)
- **D3**: workflows/ 폴더 신규 생성 (guides/와 분리)

**성과**:
- 세션 간 맥락 유지 시스템 확보
- AI-Human 협업 프로토콜 정립

---

### Phase 1: 메모리 파일 오류 수정

**목표**: AUTOMATION_GUIDE.md와 CLAUDE.md의 잘못된 정보 수정

#### 1.1 AUTOMATION_GUIDE.md 수정

**현재 문제**:
- Lines 16-100: 존재하지 않는 "Task archiving" 시스템 문서화 (~85줄)
- DEVELOPMENT_PLAN.md, COMPLETED_TASKS.md 파일 없음
- 실제 기능(auto-push)과 문서화된 기능(task archiving) 불일치

**수정 내용**:
- [ ] 삭제: Task archiving 관련 섹션 (~85줄)
- [ ] 추가: 실제 Auto-push 기능 문서화
  - `scripts/automation/auto-push.js` 동작 방식
  - 조건부 실행 로직 (feature 브랜치 전용)
  - 환경 변수 `AUTO_PUSH=1` 설정 방법
- [ ] 추가: GitHub Milestones 워크플로우
  - 현재 사용 중인 실제 시스템
  - Issue → Milestone 연결 방법

**참고 파일**:
- `.husky/post-commit`
- `scripts/automation/auto-push.js` (182 lines)

---

#### 1.2 CLAUDE.md 수정

**현재 문제**:
- Line 9-11, 37-41: 잘못된 폴더명 `integrations/` 사용
- 실제 폴더명: `external-services/`

**수정 내용**:
- [ ] 전체 파일에서 `integrations/` → `external-services/` 변경
- [ ] 폴더 구조 섹션 검증
- [ ] 예시 경로 업데이트

**검증 명령**:
```bash
rg "integrations/" docs/CLAUDE.md
```

---

### Phase 2: 파일명 kebab-case 변환

**목표**: 8개 파일을 kebab-case로 변환

**파일 목록**:
1. `ENROLLED_STUDENTS_MIGRATION.md` → `enrolled-students-migration.md`
2. `GOOGLE_OAUTH_SETUP.md` → `google-oauth-setup.md`
3. `TEST_QUALITY_GUIDE.md` → `test-quality-guide.md`
4. `WORKFLOW_EXAMPLES.md` → `workflow-examples.md`
5. `external-services/REGISTRY.md` → `external-services/registry.md`
6. `testing/TEST_REPORT.md` → `testing/test-report.md`
7. (추가 2개 확인 필요)

**작업 순서**:
- [ ] Git mv 명령으로 변경
- [ ] 참조하는 파일에서 링크 업데이트
- [ ] CLAUDE.md 메모리 파일 업데이트

**검증**:
```bash
# Uppercase 파일명 확인
find docs -name "*[A-Z]*" -type f
```

---

### Phase 3: Front-matter 추가

**목표**: 6개 파일에 YAML front-matter 추가

**Front-matter 템플릿**:
```yaml
---
title: "문서 제목"
category: guide | workflow | reference | architecture
tags: [tag1, tag2, tag3]
created: YYYY-MM-DD
updated: YYYY-MM-DD
status: active | deprecated | draft
---
```

**파일 목록**:
1. `admin-sso-setup.md`
2. `ENROLLED_STUDENTS_MIGRATION.md` (or delete)
3. `GOOGLE_OAUTH_SETUP.md`
4. `external-services/external-services.md`
5. `TEST_QUALITY_GUIDE.md` (or delete)
6. `WORKFLOW_EXAMPLES.md` (or delete)

**추가 작업**:
- [ ] 각 파일별 적절한 category 설정
- [ ] tags 3-5개 추가
- [ ] created/updated 날짜 기록

---

### Phase 4: 품질 개선

**목표**: 문서 완성도 향상 및 불필요한 파일 정리

#### 4.1 docs/README.md 생성

**내용**:
- [ ] 폴더 구조 설명
- [ ] 각 폴더의 목적
- [ ] 문서 작성 가이드라인 링크
- [ ] 기여 방법

---

#### 4.2 중복 파일 처리

**검토 대상**:
- `WORKFLOW_EXAMPLES.md` - workflow.md와 중복 가능성
- `TEST_QUALITY_GUIDE.md` - testing/strategy.md와 중복 가능성
- `ENROLLED_STUDENTS_MIGRATION.md` - 일회성 마이그레이션 문서

**작업**:
- [ ] 각 파일 내용 분석
- [ ] 중복 확인 및 통합 or 삭제 결정
- [ ] 필요시 내용 병합

---

#### 4.3 external-services 문서 보완

**추가 필요 섹션**:
- [ ] Rate Limits (각 서비스별)
- [ ] Error Codes 참조
- [ ] Webhook 설정 (PayPal, Stripe)
- [ ] 테스트 환경 설정

---

#### 4.4 최종 검증

- [ ] 모든 내부 링크 동작 확인
- [ ] Front-matter 일관성 체크
- [ ] 파일명 규칙 준수 확인
- [ ] 품질 점수 재평가 (목표: 80/100)

---

## Progress Log

### 2025-02-11 14:30 - Phase 0 Started
- Work Plan 시스템 필요성 인식
- 기존 방식의 맥락 손실 문제 식별

### 2025-02-11 15:45 - Phase 0 Completed ✅
- 3-파일 구조 생성 완료
  - `~/.claude/modules/work-plan-protocol.md` (30 lines)
  - `docs/workflows/work-plan-guide.md` (100+ lines)
  - `docs/work-plans/docs-improvement.md` (this file)
- 브랜치 생성: `docs/add-work-plan-system`
- **Next**: Phase 1 시작 대기 (사용자 승인 필요)

---

## Decisions Log

### D1: modules/ 폴더 유지 (2025-02-11)
**질문**: modules/ 폴더를 docs/workflows/로 이동할까?

**결정**: 유지

**이유**:
- modules/는 프로젝트별 AI 메모리 파일
- docs/는 사용자 참고 문서
- 용도가 다르므로 분리 유지

---

### D2: 참고 문서 1개 통합 (2025-02-11)
**질문**: Quick Reference와 Detailed Guide를 분리할까?

**결정**: 1개 파일로 통합

**이유**:
- Solo dev 환경 (팀 확장 시 분리 고려)
- 100줄 이내로 충분히 표현 가능
- 현업 Solo dev 사례 조사 결과 단일 문서 선호

---

### D3: workflows/ 폴더 신규 생성 (2025-02-11)
**질문**: Work Plan 가이드를 어디에 위치시킬까?

**결정**: `docs/workflows/` 신규 생성

**이유**:
- guides/ = "어떻게 (How-to)"
- workflows/ = "어떤 순서로 (Process)"
- 현업 표준 (Microsoft Docs, Atlassian 등)

---

## Risks & Mitigations

### R1: 파일명 변경 시 참조 깨짐
**완화 방안**:
- Git mv 사용 (히스토리 보존)
- 변경 전 참조 파일 검색
- 변경 후 빌드 및 링크 검증

### R2: Front-matter 추가 시 기존 도구 호환성
**완화 방안**:
- Front-matter는 표준 YAML (대부분 도구 지원)
- 추가 전 로컬 빌드 테스트
- 문제 발생 시 롤백 가능

### R3: 중복 파일 삭제 시 정보 손실
**완화 방안**:
- 삭제 전 내용 병합
- Git 히스토리에 보존
- 필요 시 복구 가능

---

## Next Steps

**Immediate**:
1. CLAUDE.md 업데이트 (Work Plan 가이드 참조 추가)
2. Phase 0 커밋 및 사용자 확인
3. Phase 1 승인 대기

**After Phase 1**:
- AUTOMATION_GUIDE.md 수정 완료
- CLAUDE.md 폴더명 수정 완료
- Phase 2 진행 여부 결정

---

## Completion Criteria

**Phase 0**: ✅
- [x] 3개 파일 생성
- [x] CLAUDE.md 참조 추가
- [x] 사용자 승인

**Phase 1**:
- [ ] AUTOMATION_GUIDE.md 85줄 삭제 + 새 내용 추가
- [ ] CLAUDE.md 폴더명 수정
- [ ] `npm run typecheck && npm run build` 통과

**Phase 2**:
- [ ] 8개 파일명 변경
- [ ] 모든 참조 링크 업데이트
- [ ] 빌드 통과

**Phase 3**:
- [ ] 6개 파일 front-matter 추가
- [ ] 일관성 검증

**Phase 4**:
- [ ] docs/README.md 생성
- [ ] 중복 파일 처리
- [ ] 품질 점수 80/100 달성

---

## Reference

- Work Plan Protocol: `~/.claude/modules/work-plan-protocol.md`
- Work Plan Guide: `docs/workflows/work-plan-guide.md`
- Project Workflow: `modules/workflow.md`
- Development Guide: `modules/development-guide.md`
