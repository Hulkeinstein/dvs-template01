---
title: "Handoff: 재개 방향 결정"
tags:
  - type/docs
  - progress/in-progress
created: 2026-09-16
updated: 2026-09-16
lifecycle: active
related:
  - ../../ROADMAP.md
---

# Handoff: 재개 방향 결정 (2026-09-16)

## 직전 완료

- 8개월 멈춘 저장소 전체 점검: 진행 상태, 보안, DB·마이그레이션, 코드 품질, 도구·의존성
- 유출된 Supabase 자격 증명 폐기: 계정 access token 삭제, legacy API keys(anon, service_role) 비활성화, legacy JWT secret Revoke
- 저장소에서 키 제거 병합(#74), 로드맵에 재개 점검 결과 등재(v2.1)

## 다음 작업: 이어갈지 새로 할지 결정

### 경위

지금 코드를 이어 쓰려면 보안 후속 조치, DB 마이그레이션 기준선 재수립, Next.js 14·Node 20 지원 종료 대응, 저장소 정리가 모두 필요하다. 반면 `app/`의 page 파일 173개 중 실제 기능 페이지는 약 47개이고 나머지는 HiStudy 데모다. 방향이 정해지기 전에는 로드맵의 후속 항목을 시작하지 않는다.

### 확정된 것

- 코드 변경이 없는 결정 작업이다
- 로드맵 Phase 0~3 일정은 이 결정 전까지 보류한다
- 결정은 ADR로 남긴다(기술 스택·아키텍처 결정은 ADR 대상)

### 목표와 DoD 요지

**Goal**: 현 코드베이스를 이어갈지, 핵심 기능만 새 프로젝트로 옮길지 결정하고 기록한다

1. 두 선택지의 비교표가 있다: 필요한 작업, 위험, 유지되는 자산, 버려지는 것
2. 사용자가 하나를 선택하고 `docs/adr/0003-*.md`로 기록되며 `docs/adr/INDEX.md`가 갱신된다
3. `docs/ROADMAP.md` 재개 점검 표의 보류 항목(⏸️ 5개)이 결정에 맞게 갱신된다

### 볼 자료

- 점검 보고서(비공개, 보안 상세 포함): <https://claude.ai/artifact/JFrAm2UuUExJjpEgwLxkHx>
  - 보안 상세는 공개 저장소로 옮기지 않는다
  - 로컬 사본 `docs/artifacts/dvs-resume-audit.html`은 gitignore 대상이라 점검한 PC에만 있다
- `docs/ROADMAP.md`의 재개 점검 절
- 열린 이슈: #12(다중 배지), #19(TypeScript 전환)

### 선결·주의

- Supabase `dvs_nc`는 legacy 키가 꺼져 있어, 새 publishable·secret 키를 발급해 `.env.local`에 넣기 전까지 앱이 DB에 연결되지 않는다
- 점검한 PC의 Node는 v22, 프로젝트 요구는 v20(지원 종료)
- 새로 받은 저장소에서 줄바꿈 차이로 가짜 변경 108개가 보인다. 내용 변경이 아니므로 커밋하지 않는다(정리는 결정 후 항목)

## 시작 절차

1. `git switch docs/resume-decision && git pull`
2. 루트 `session.md`의 지금 작업 확인
3. 점검 보고서와 로드맵 재개 점검 절을 읽고 비교표 초안 작성
4. 사용자에게 선택 요청 → `docs/adr/TEMPLATE.md`로 ADR 작성 → `docs/adr/INDEX.md` 갱신
5. 로드맵 표 갱신 → `npm run docs:check` → PR
