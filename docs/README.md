---
title: "Documentation Index"
tags:
  - type/docs
created: 2025-11-02
updated: 2025-11-05
lifecycle: active
---

# Documentation Index

이 프로젝트의 모든 문서는 이 디렉토리에서 관리됩니다.

## 📂 디렉토리 구조

### 🎯 시작하기
- **[CLAUDE.md](./CLAUDE.md)** - 워크플로우 & 문서 가이드 (AI/개발자 협업 규칙)
- **[workflows/](./workflows/)** - 워크플로우 상세 가이드
  - [work-plan-guide.md](./workflows/work-plan-guide.md) - Work Plan 작성법

### 🔄 작업 문서
- **[work-plans/](./work-plans/)** - 진행 중 작업 (임시)
  - [TEMPLATE.md](./work-plans/TEMPLATE.md) - Work Plan 템플릿
- **[library/](./library/)** - 완료된 기능 문서 (영구)

### 🏛️ 아키텍처 결정
- **[adr/](./adr/)** - Architecture Decision Records (ADR)
  - [INDEX.md](./adr/INDEX.md) - 모든 ADR 목록
  - [TEMPLATE.md](./adr/TEMPLATE.md) - ADR 작성 템플릿
  - [0001-record-architecture-decisions.md](./adr/0001-record-architecture-decisions.md) - 메타 ADR

### 🛠️ 기술 문서
- **[architecture/](./architecture/)** - 시스템 설계
- **[testing/](./testing/)** - 테스트 전략 & 가이드
- **[troubleshooting/](./troubleshooting/)** - 문제 해결 런북

### 📚 참고 자료
- **[guides/](./guides/)** - 설정 & 배포 가이드
- **[external-services/](./external-services/)** - 외부 서비스 연동
- **[production/](./production/)** - 운영 관련 문서

## 🚀 빠른 시작

### 새로운 기능 개발
1. [CLAUDE.md](./CLAUDE.md) - 전체 워크플로우 확인
2. [workflows/work-plan-guide.md](./workflows/work-plan-guide.md) - Work Plan 템플릿 확인
3. `work-plans/` 폴더에 새 Work Plan 생성

### 아키텍처 결정 기록
- [adr/INDEX.md](./adr/INDEX.md) - 모든 아키텍처 결정 보기
- [adr/TEMPLATE.md](./adr/TEMPLATE.md) - 새 ADR 작성하기
- 중요 결정 시 ADR 작성 (DB 선택, 인증 방식, 프레임워크 등)

### 완료된 기능 참고
- [library/](./library/) - 구현된 기능 아키텍처 & 결정사항

### 문제 해결
- [troubleshooting/](./troubleshooting/) - 일반적인 이슈 해결법

## 📝 문서 작성 규칙

### 파일명
- **필수**: kebab-case.md (예: `payment-integration.md`)
- **금지**: PascalCase, snake_case, 공백
- **예외**: README.md, LICENSE, CHANGELOG.md

### Front-matter (필수)
모든 문서는 YAML front-matter를 포함해야 합니다:

```yaml
---
title: "문서 제목"                    # 필수
tags:                                # 필수 (네임스페이스 방식)
  - phase/1                          # phase/1|2|3
  - type/docs                        # feature|bug|docs|security|performance
  - component/auth                   # auth|payment|ui|database|api
  - external/stripe                  # stripe|paypal|supabase|nextauth
  - progress/completed               # completed|in-progress|backlog|blocked
created: 2025-11-03                  # 필수 (Git 히스토리에서 확인)
updated: 2025-11-03                  # 필수 (작업 날짜)
lifecycle: active                    # 필수 (active|deprecated|draft)
aliases: []                          # 선택 (파일명 변경 시 이전 이름)
category: guide                      # 선택 (guide|library|reference|workflow)
related: []                          # 선택 (관련 문서 경로)
owners: []                           # 선택 (담당자)
---
```

### 태그 카탈로그 (네임스페이스)
모든 태그는 다음 5개 카테고리 중 하나를 사용합니다:

**phase/** (프로젝트 단계)
- `phase/1` - Phase 1: Core Platform
- `phase/2` - Phase 2: Admin System
- `phase/3` - Phase 3: Enhancement

**type/** (문서 유형)
- `type/feature` - 새 기능
- `type/bug` - 버그 수정
- `type/docs` - 문서
- `type/security` - 보안
- `type/performance` - 성능

**component/** (시스템 컴포넌트)
- `component/auth` - 인증/권한
- `component/payment` - 결제
- `component/ui` - UI/UX
- `component/database` - 데이터베이스
- `component/api` - API

**external/** (외부 서비스, 다중 허용)
- `external/stripe` - Stripe 결제
- `external/paypal` - PayPal 결제
- `external/supabase` - Supabase
- `external/nextauth` - NextAuth.js

**progress/** (작업 진행 상태)
- `progress/completed` - 완료
- `progress/in-progress` - 진행 중
- `progress/backlog` - 백로그
- `progress/blocked` - 차단됨

### 문서 검색 방법
```bash
# Phase 1 관련 문서 찾기
rg "tags:.*phase/1" docs/

# 결제 관련 문서 찾기
rg "tags:.*(component/payment|external/stripe|external/paypal)" docs/

# Deprecated 문서 찾기
rg "lifecycle: deprecated" docs/

# 진행 중인 작업 찾기
rg "tags:.*progress/in-progress" docs/

# 특정 컴포넌트 문서 찾기
rg "tags:.*component/auth" docs/
```

### 링크
- **상대 경로** 사용 (예: `[link](../path/file.md)`)
- 파일명 변경 시 `aliases` 필드에 이전 이름 추가

### 템플릿
- CLAUDE.md의 템플릿 섹션 참고

## 🔗 관련 문서

- 프로젝트 메인 문서: [../CLAUDE.md](../CLAUDE.md)
- 개발 가이드: [../modules/development-guide.md](../modules/development-guide.md)
- 워크플로우: [../modules/workflow.md](../modules/workflow.md)
