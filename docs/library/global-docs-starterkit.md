---
title: "Global Docs Phase 1: Templates"
tags:
  - phase/1
  - type/docs
  - component/workflow
created: 2025-11-08
updated: 2025-11-08
lifecycle: active
---

# Global Docs - Phase 1: Templates

## 📊 Overview

**목적**: 전역 문서 시스템 구축 - 모든 프로젝트에서 재사용 가능한 템플릿 제공

**범위**:
- `~/.claude/docs/templates/` (4개 템플릿)
- `~/.claude/docs/` 기본 문서 (README, CLAUDE, CHANGELOG)
- `~/.claude/modules/template-workflow.md` (AI 작업 규칙)

**릴리즈**: 2025-11-08

**핵심 가치**:
- 재사용성: 80% 이상 재사용 가능한 패턴
- 일관성: 모든 프로젝트에서 동일한 표준 적용
- 효율성: 반복 작업 최소화, 빠른 프로젝트 시작
- 품질: 검증된 Best Practices 기반

---

## 🏗️ Architecture

### 최종 구조

```
~/.claude/
├── modules/                    # AI 작업 규칙
│   ├── work-plan-protocol.md
│   └── template-workflow.md    # ← 신규 추가
│
└── docs/                       # 전역 문서 시스템
    ├── README.md               # 사용자용 허브
    ├── CLAUDE.md               # AI용 메모리
    ├── CHANGELOG.md            # 버전 추적
    │
    └── templates/              # 4개 템플릿
        ├── work-plan-template.md
        ├── adr-template.md
        ├── library-template.md
        ├── api-doc-template.md
        └── template-usage-guide.md  # 사용자 가이드
```

### 문서 분리 전략

**modules/ (AI 작업 규칙)**:
- 간결한 불릿 포인트
- 규칙/명령어 중심
- 빠른 스캔 가능
- 예: template-workflow.md (107줄)

**docs/ (사용자 가이드)**:
- 상세 설명 포함
- 예시 및 Decision Tree
- FAQ 포함
- 예: template-usage-guide.md (356줄)

---

## 🔑 주요 결정

### D4: 폴더 구조 (RULD Test 기반)

**결정**: `~/.claude/docs/` 통합 구조 채택

**근거**:
- RULD Test 통과 (templates/workflows 4 Yes)
- 현업 패턴 준수 (GitLab docs/ 통합, Microsoft 전역 templates)
- 사용자 의도 충족 (프로젝트 시작 + 개발 중 참조 + 전반적 문서)
- YAGNI 원칙 (단계적 확장)

**대안**:
- Option A: 프로젝트 내 유지 (`project/docs/templates/`) - 전역 의도 불충족
- Option B: 단일 폴더 (`~/.claude/templates/`) - 확장성 제한
- Option C: 통합 구조 (`~/.claude/docs/`) - 채택 ✅

**영향**:
- modules/ (원칙) vs docs/ (문서) 명확히 구분
- 단계적 구현 가능 (Phase 1: templates → Phase 7: workflows → Phase 8: checklists/playbooks)

### D5: Workflow 문서화 (사용자/AI 분리)

**결정**: 사용자 가이드와 AI 규칙을 별도 파일로 분리

**근거**:
- 사용자는 상세 설명 필요 (예시, Decision Tree, FAQ)
- AI는 간결한 규칙만 필요 (빠른 스캔, 불릿 포인트)
- 중복 방지 (README는 간단한 링크만)

**구현**:
- `~/.claude/docs/templates/template-usage-guide.md` (356줄, 사용자용)
- `~/.claude/modules/template-workflow.md` (107줄, AI용)
- `~/.claude/docs/README.md` (간단한 링크만)

**패턴 일관성**:
- work-plan-protocol.md와 동일 구조 (modules/ 위치, import 방식)
- CLAUDE.md에 import 추가: `@~/.claude/modules/template-workflow.md`

### D6: Template Front-matter 표준화

**결정**: 5개 필수 필드 + 3개 확장 필드

**필수 필드** (모든 문서):
- title, tags, created, updated, lifecycle

**확장 필드** (템플릿만):
- template_version: 1.0.0
- sot: ~/.claude/docs/templates/<name>.md
- required_fields: [...]

**근거**:
- 템플릿 버전 추적 (CHANGELOG 연동)
- Single Source of Truth 명시
- 사용자에게 필수 입력 필드 가이드

---

## 🧩 Implementation

### 생성된 파일 (7개)

**1. 전역 문서 기본 (3개)**:
- `~/.claude/docs/README.md` (180줄) - 사용자용 허브
- `~/.claude/docs/CLAUDE.md` (242줄) - AI용 메모리
- `~/.claude/docs/CHANGELOG.md` (77줄) - 버전 추적

**2. 템플릿 (5개)**:
- `~/.claude/docs/templates/work-plan-template.md` (173줄)
- `~/.claude/docs/templates/adr-template.md` (156줄)
- `~/.claude/docs/templates/library-template.md` (259줄)
- `~/.claude/docs/templates/api-doc-template.md` (289줄)
- `~/.claude/docs/templates/template-usage-guide.md` (356줄)

**3. AI 작업 규칙 (1개)**:
- `~/.claude/modules/template-workflow.md` (107줄)

**4. 프로젝트 문서 (1개)**:
- `docs/library/global-docs-starterkit.md` (이 파일)

### 핵심 패턴

**메모리 작성 원칙**:
- 설명 제거, 규칙/명령어만
- 불릿 포인트 사용
- 구체적 예시 포함
- Quick Reference 형식

**파일명 규칙**:
- kebab-case.md 필수
- 예외: README.md, CHANGELOG.md (관례)

**링크 규칙**:
- 상대 경로만 사용
- 예: `[Template Usage Guide](./templates/template-usage-guide.md)`

---

## 🧪 Test & Validation

### Definition of Done (DoD)

**문서 품질**:
- ✅ 모든 파일 kebab-case
- ✅ Front-matter 필수 5개 필드
- ✅ Template Front-matter 확장 3개 필드
- ✅ 상대 경로 링크
- ✅ 메모리 작성 원칙 준수

**검증 결과** (Phase 4):
- ✅ 파일명 kebab-case (5개 템플릿 + README/CLAUDE/CHANGELOG)
- ✅ Front-matter 필수 필드 (title, tags, created, updated, lifecycle)
- ✅ Template Front-matter 확장 (template_version, sot, required_fields)
- ✅ 상대 경로 링크 (README.md, template-usage-guide.md)
- ✅ 메모리 작성 원칙 (template-workflow.md: 간결, 불릿, 예시)
- ✅ Claude Code 스캔 테스트 (README.md 구조 명확, 빠른 스캔 가능)

### 테스트 시나리오

**1. 템플릿 복사 테스트**:
```bash
# Work Plan 복사
cp ~/.claude/docs/templates/work-plan-template.md \
   project/docs/work-plans/feature-name.md

# 필수 필드 확인
grep "required_fields" ~/.claude/docs/templates/work-plan-template.md
```

**2. AI 스캔 테스트**:
- README.md 읽어서 5초 내 핵심 파악 가능
- template-workflow.md에서 Quick Decision 즉시 확인 가능

**3. 링크 유효성 테스트**:
```bash
# README 링크 확인
cat ~/.claude/docs/README.md | grep "\[.*\](\./"

# 파일 존재 확인
ls ~/.claude/docs/templates/template-usage-guide.md
ls ~/.claude/docs/CHANGELOG.md
```

---

## 📦 관련 파일

### 코드 경로
- 없음 (문서 전용 프로젝트)

### 마이그레이션
- 없음 (파일 시스템만 사용)

### 테스트
- 수동 검증 (Phase 4)

---

## 🔗 참고 문서

### Work Plans (삭제 예정)
- `docs/work-plans/global-docs-memory.md` (Work Plan)
- `docs/work-plans/_TEMP_research-global-docs.md` (리서치)

### 현업 Best Practices 참고
- Google: "코드와 문서를 같은 커밋에", 링크 참조 (복사 금지)
- GitLab: 중앙 허브 + 분산 소스, docs/ 통합 구조
- Spotify: "문서를 코드 가까이", mkdocs-monorepo-plugin
- Microsoft: Docs as Code, 전역 스타일 가이드 + 프로젝트별 콘텐츠

---

## 🔮 향후 Phase

### Phase 7 (2번째 프로젝트): Workflows 작성
**위치**: `~/.claude/docs/workflows/`
- git-workflow.md
- feature-lifecycle.md
- project-setup.md
- documentation-setup.md

### Phase 8 (3번째 프로젝트): Checklists & Playbooks
**위치**: `~/.claude/docs/checklists/`, `~/.claude/docs/playbooks/`
- checklists/code-review-checklist.md
- checklists/deployment-checklist.md
- checklists/project-setup-checklist.md
- playbooks/oauth-integration.md
- playbooks/payment-integration.md
- playbooks/database-migration.md

**YAGNI 원칙**: 단계적 확장, 실제 필요 시점에 추가

---

## 📋 Links

- **Issue**: #51
- **Branch**: feature/global-docs-memory
- **PR**: (생성 예정)
- **Work Plan**: docs/work-plans/global-docs-memory.md (삭제 예정)
- **리서치**: docs/work-plans/_TEMP_research-global-docs.md (삭제 예정)

---

**마지막 업데이트**: 2025-11-08
**상태**: Active
**버전**: 1.0.0
