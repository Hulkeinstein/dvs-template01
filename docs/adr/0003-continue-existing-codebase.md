---
title: "0003. Continue and Clean Up the Existing Codebase"
tags:
  - type/docs
  - external/supabase
  - external/nextauth
created: 2026-09-16
updated: 2026-09-16
lifecycle: active
related:
  - ../ROADMAP.md
  - ../work-plans/handoff/2026-09-16-resume-decision.md
---

# 0003. Continue and Clean Up the Existing Codebase

**Date**: 2026-09-16
**Status**: Accepted
**Deciders**: @Hulkeinstein, Claude Code

## Context

프로젝트가 2026-01-23 이후 멈춘 뒤 재개 점검을 했다. 점검 결과 다음 부채가 확인됐다.

- 인가: 서버가 service_role 키로 DB에 접근하고 로그인은 NextAuth라 RLS가 앱 요청에 적용되지 않는다. 세션 확인 코드가 없는 server action 파일이 30개 중 18개다
- DB: 마이그레이션 72개 파일로는 스키마를 처음부터 재현할 수 없고, 운영 DB와 어긋나 있다
- 프레임워크: Next.js 14와 Node 20이 지원 종료됐다
- 코드: `app/`의 page 173개 중 약 47개만 실제 기능이고 나머지는 HiStudy 데모다. JS 파일이 TS보다 많고 .js/.tsx 중복, redux 래퍼 중복이 있다

이 상태에서 현 코드베이스를 이어갈지, 핵심 기능만 새 프로젝트로 옮길지 정해야 한다.

## Decision Drivers

- Solo developer: 동작하는 버전을 유지하며 단계적으로 고칠 수 있는가
- 이식·재작성 범위: 제품 코드 약 260 파일, 약 50k줄
- UI 결합: 제품 컴포넌트 92개 중 80개가 HiStudy 클래스(`rbt-`)를 사용한다
- 두 선택지 모두에 필요한 공통 작업의 크기

## Considered Options

- **Option A**: 현 코드베이스를 정리하며 지속
- **Option B**: 핵심 기능만 새 프로젝트로 이관

두 선택지 모두 인가 재설계, DB 기준선 재수립, Next 15 이상·React 19·Node 22 전환이 필요하다.

## Decision Outcome

**Chosen**: Option A - 현 코드베이스를 정리하며 지속

가장 비싼 작업(인가 재설계, DB 기준선, 프레임워크 전환)은 두 선택지에 공통이다. 남는 차이는 A의 삭제·정리 비용과 B의 이식·재스타일 비용인데, 제품 코드 규모와 HiStudy 스타일 결합 때문에 이식 비용이 더 크다. A는 작업 중에도 앱이 동작하는 상태를 유지할 수 있다.

### Positive Consequences

- 동작하는 기능, 테스트 133개, DB 스키마·데이터, Docker·CI 설정, 커밋 이력을 그대로 유지한다
- 삭제·수정 위주라 단계마다 검증하며 되돌릴 수 있다
- 인증 방식(NextAuth)을 바꾸는 추가 결정이 당장 필요하지 않다

### Negative Consequences

- 데모 삭제 중 공용 컴포넌트(Header 등) 연결이 끊길 수 있다
- 정리 과정에서 숨은 결함이 계속 발견될 수 있다
- 레거시 구조(redux, .js 파일, HiStudy SCSS)를 단계적으로 걷어내야 한다

## Pros and Cons of the Options

### Option A: 현 코드베이스 정리 후 지속

- ✅ Good, because 동작 기능과 테스트를 유지하며 단계적으로 진행할 수 있다
- ✅ Good, because 필요한 작업이 삭제·수정 위주다 (데모 179+ 파일, 인가 추가 action 18개, 비동기 전환 page/layout 45개)
- ❌ Bad, because 레거시 구조와 중복을 하나씩 걷어내야 한다
- ❌ Bad, because 업그레이드 중 연쇄 호환 문제가 생길 수 있다

### Option B: 핵심 기능만 새 프로젝트로 이관

- ✅ Good, because 새 골격에서 인가·타입을 처음부터 적용할 수 있다
- ✅ Good, because 데모·레거시·마이그레이션 이력을 한 번에 버린다
- ❌ Bad, because 이식이 끝날 때까지 동작하는 버전이 없다
- ❌ Bad, because HiStudy 스타일 이식 또는 UI 재작성, 세부 기능 누락 위험이 있다

## Revisit When

- UI를 HiStudy에서 벗어나기로 하거나, 인증을 Supabase Auth로 바꾸기로 하면 Option B를 다시 검토한다

## Links

- Roadmap: [ROADMAP.md 재개 점검](../ROADMAP.md)
- Handoff: [2026-09-16-resume-decision.md](../work-plans/handoff/2026-09-16-resume-decision.md)
- PR: #74 (유출 키 제거)
