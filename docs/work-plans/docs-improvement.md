# Docs Folder Improvement - Work Plan

**Status**: Active
**Created**: 2025-02-11
**Last Updated**: 2025-02-11 (Phase 2 완료)

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
- [x] **P1: 메모리 파일 오류 수정** (완료)
- [x] **P2: 파일명 규칙 메모리 명시** (완료 - 기존 파일 유지)
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
- Line 9-11, 37-41: 잘못된 폴더명 `integrations/` 사용 ✅ 수정 완료
- 실제 폴더명: `external-services/`

**수정 내용**:
- [x] 전체 파일에서 `integrations/` → `external-services/` 변경 (13곳)
- [x] 폴더 구조 섹션 검증
- [x] 예시 경로 업데이트

**검증 명령**:
```bash
rg "external-services/" docs/CLAUDE.md
```

---

### Phase 2: 파일명 규칙 메모리 명시 ✅

**목표**: kebab-case 규칙을 메모리에 명시 (현업 표준 근거 포함)

**변경된 접근법**:
- 기존 파일은 유지 (파일명 변경 시 링크 깨짐 리스크)
- "Touch It, Type It" 전략 채택 (파일 수정 시 리네임)
- 신규 문서는 kebab-case 필수

**완료 항목**:
- [x] 현업 표준 조사 (Next.js, React, Vue, Angular, Supabase)
- [x] Google/Microsoft 스타일 가이드 확인
- [x] 개인 메모리 업데이트 (`~/.claude/modules/coding-principles.md`)
  - Lines 98-101: 문서 파일명 규칙 추가
  - 예외 사항: README.md, LICENSE, CHANGELOG.md
- [x] 프로젝트 메모리 업데이트 (`modules/development-guide.md`)
  - Lines 83-93: "문서 작성 규칙" 섹션 추가
  - Git history 보존 방법: `git mv OLD.md new.md`

**현업 근거**:
- 100% kebab-case 채택 (5개 주요 프로젝트 조사)
- SEO 최적화, URL 안전, 크로스 플랫폼 호환성
- Google/Microsoft 공식 권장사항

**커밋**: e80bc28

---

### Phase 3: Obsidian Basic Alignment ✅

**목표**: Front-matter 표준 정의 및 적용, Obsidian 스타일 구현

**완료 항목**:
- [x] P3.1: Front-matter 표준 정의
  - docs/README.md에 완전한 Front-matter 템플릿 추가
  - 네임스페이스 태그 시스템 정의 (phase/, type/, component/, external/, progress/)
  - modules/development-guide.md에 규칙 추가
- [x] P3.2: 파일 조사 및 분류 (6개 파일 유지)
  - admin-sso-setup.md
  - AUTOMATION_GUIDE.md → automation-guide.md
  - ENROLLED_STUDENTS_MIGRATION.md → enrolled-students-migration.md
  - GOOGLE_OAUTH_SETUP.md → google-oauth-setup.md
  - TEST_QUALITY_GUIDE.md → test-quality-guide.md
  - WORKFLOW_EXAMPLES.md → workflow-examples.md
- [x] P3.3: Front-matter 추가 + 파일명 변경
  - 6개 파일에 Front-matter 추가 (네임스페이스 태그 포함)
  - 5개 UPPERCASE 파일을 kebab-case로 리네임 (git mv)
  - aliases 필드로 하위 호환성 유지
- [x] P3.4: status 충돌 해결 + CLAUDE.md 업데이트
  - docs/CLAUDE.md에 Obsidian 원칙 추가 (네임스페이스 태그 시스템)
  - status 키 충돌 해결: status → lifecycle, status/* → progress/*
  - 6개 파일 + CLAUDE.md + README.md 업데이트
  - 검증: typecheck ✓, build ✓ (170 pages)
- [x] P3.5: Work Plan 업데이트 (이 작업)

**Front-matter 최종 형식**:
```yaml
---
title: "문서 제목"
tags:
  - phase/1                          # phase/1|2|3
  - type/docs                        # feature|bug|docs|security|performance
  - component/auth                   # auth|payment|ui|database|api
  - external/stripe                  # stripe|paypal|supabase|nextauth
  - progress/completed               # completed|in-progress|backlog|blocked
created: 2025-11-03
updated: 2025-11-03
lifecycle: active                    # active|deprecated|draft
aliases: []
category: guide
related: []
---
```

**커밋**:
- 73925f5 (P3.1: Front-matter 표준 정의)
- cb9f00c (P3.3-1: Front-matter 추가)
- 0c9b116 (P3.3-2: 파일명 변경)
- 8ae4596 (P3.4: status 충돌 해결 + Obsidian 원칙)

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

### 2025-02-11 16:20 - Phase 1 Completed ✅
- AUTOMATION_GUIDE.md 수정 완료 (~85줄 삭제, 실제 기능 문서화)
- CLAUDE.md 수정 완료 (integrations/ → external-services/, 14개소)
- 관련 파일 5개 수정 (external-services/REGISTRY.md, architecture/system-design.md)
- 커밋: 9ebfafc

### 2025-02-11 16:45 - Phase 2 Completed ✅
- 접근법 변경: 파일 리네임 → 메모리 기반 규칙
- 현업 표준 조사 (5개 프로젝트 100% kebab-case)
- 개인 메모리 업데이트 (coding-principles.md)
- 프로젝트 메모리 업데이트 (development-guide.md)
- "Touch It, Type It" 전략 채택
- 커밋: e80bc28
- **Next**: Phase 3 시작 대기 (사용자 승인 필요)

### 2025-11-03 11:00 - Phase 3.1 Completed ✅
- docs/README.md: Front-matter 템플릿 추가 (Lines 46-122)
- modules/development-guide.md: 문서 작성 규칙 추가 (Lines 83-133)
- 네임스페이스 태그 시스템 정의 (5개 카테고리)
- 커밋: 73925f5

### 2025-11-03 11:30 - Phase 3.2 Completed ✅
- 6개 파일 조사 및 유지 결정
- 삭제 대상 없음 (모두 유효한 문서)

### 2025-11-03 12:00 - Phase 3.3 Completed ✅
- 6개 파일에 Front-matter 추가 (네임스페이스 태그)
- 5개 UPPERCASE 파일 kebab-case로 리네임 (git mv)
- aliases 필드로 하위 호환성 유지
- 커밋: cb9f00c, 0c9b116

### 2025-11-03 12:57 - Phase 3.4 Completed ✅
- docs/CLAUDE.md: Obsidian 원칙 추가 (네임스페이스 태그 시스템)
- 6개 파일 status 충돌 해결 (lifecycle + progress/*)
- docs/README.md 태그 카탈로그 업데이트
- 검증: typecheck ✓, build ✓ (170 pages)
- 커밋: 8ae4596

### 2025-11-03 13:00 - Phase 3.5 In Progress
- Work Plan 업데이트 (Decision D5 추가)
- Phase 3 완료 체크
- **Next**: Phase 4 or 완료 결정

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

### D4: 메모리 기반 파일명 규칙 (2025-02-11)
**질문**: 8개 파일을 즉시 kebab-case로 리네임할까?

**결정**: 메모리에 규칙 명시 + "Touch It, Type It" 전략

**이유**:
- 리스크: 파일명 변경 시 문서 링크 깨짐 (14개소 이상 영향)
- 기존 파일은 동작 중 (Git history 유지 필요)
- 점진적 마이그레이션이 더 안전
- 신규 문서부터 즉시 적용 가능
- 현업 근거: Next.js, React 등 100% kebab-case

**대안 검토**:
- A안: 즉시 리네임 (위험, 다수 링크 업데이트 필요)
- B안: 메모리 규칙 + 점진적 적용 (채택) ✅
- C안: 방치 (규칙 불일치 지속)

---

### D5: Status Field Conflict Resolution (2025-11-03)
**문제**: `status` 키와 `status/*` 태그의 의미론적 충돌
- `status: active` - 문서 생명주기
- `status/completed` - 작업 진행 상태

**결정**: 분리하여 명확화
- `status` (key) → `lifecycle` (active|deprecated|draft)
- `status/*` (tags) → `progress/*` (completed|in-progress|backlog|blocked)

**근거**:
- GPT-5 제안 반영
- 의미론적 충돌 제거 (문서 상태 vs 작업 상태)
- Obsidian 커뮤니티 Best Practice 참고
- 검색 쿼리 명확성 향상

**영향**:
- 6개 파일 업데이트 (admin-sso-setup, automation-guide, enrolled-students-migration, google-oauth-setup, test-quality-guide, workflow-examples)
- docs/CLAUDE.md 업데이트 (Obsidian 원칙 추가)
- docs/README.md 태그 카탈로그 업데이트

**커밋**: 8ae4596

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
