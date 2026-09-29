---
title: "Handoff: Supabase 기준선 1단계(운영 DB 증빙) 완료"
tags:
  - type/docs
  - component/database
  - external/supabase
  - progress/in-progress
created: 2026-09-29
updated: 2026-09-29
lifecycle: active
related:
  - ../supabase-migration-baseline.md
  - ../../ROADMAP.md
---

# Handoff: Supabase 기준선 1단계(운영 DB 증빙) 완료 (2026-09-29)

## 직전 완료

- 로드맵 T3의 첫 실행 단위 T001 완료: 운영 DB에서 migration 이력 2회와 스키마 백업 2회를 읽기 전용으로 받고, 저장소 SQL 72개와 대조했다
- 작업 관리 도구(OMO runtime) 기록: T001 `COMPLETE`, FINAL `PASS`, 독립 검토 INTENT_PASS와 ADVERSARIAL_PASS(6개 관점 + 반박 투표 + 완결성 점검)
- 공개 증빙: `docs/work-plans/evidence/supabase-migration-baseline/`(receipt, intent, adversarial). 원본 증빙 8개는 git 제외 폴더 `docs/artifacts/supabase-baseline/`에만 있다
- 운영 DB 조회용 읽기 전용 계정 `readonly_user`를 사용자가 SQL Editor에서 만들었다. 접속 주소 형식은 `.env`(git 제외)에 주석으로만 적혀 있다

## 핵심 발견

- 운영 DB의 migration 이력은 4건이고, 저장소 SQL 72개 중 번호가 정확히 맞는 파일은 0개다(분류: 일치 0, 로컬만 17, 원격만 4, 모호 55)
- 운영 스키마 대부분(표 37개, 정책 67개, 함수 34개)이 이력 밖에서 적용됐다. 기준선은 저장소 SQL이 아니라 운영 스키마 백업에서 출발해야 한다
- 두 루트 밖 SQL 6개(`supabase/*.sql` 4개, `docs/testing/checkout-test-sql.sql`, `scripts/seed-enrollments.sql`)는 72개 대조에 들어 있지 않다

## 이번 작업의 예외와 부작용 (사용자에게 공개됨)

- 비공식 선행 실행: 공식 절차 전에 같은 읽기 명령 4개를 한 번 실행했다. 결과는 지우고 3차 시도에서 절차대로 다시 받았다. 이때 `supabase/.temp/cli-latest`가 생겼다
- 접속 주소를 앱에 넘기려고 Windows 사용자 환경변수에 잠시 저장했다가 지웠다
- 시도 이력: 1차 인증 실패(28P01, SQL 실행 없음), 2차 Docker 꺼짐으로 원격 명령 전 중단, 3차 성공
- npm 진단 로그 11개가 삭제됐다(되돌릴 수 없음, 저장소 밖). Supabase CLI가 사용자 폴더의 사용 기록 시각을 갱신했다
- 로드맵 T3 진행 표시는 계획서의 Completion unit보다 먼저, 사용자 승인으로 갱신했다. 그래서 계획서의 시점 고정 확인(T001 확인 4번, 최종 확인 2·5번)은 지금 다시 돌리면 로드맵 변경 때문에 실패한다. 실행 시점의 통과 기록은 runtime 이벤트 로그와 receipt 해시에 있다
- 계획서는 체크 표시만 바꿨다. 상태·날짜 줄을 바꾸면 runtime이 계획 변경(`WORKFLOW_PLAN_DRIFT`)으로 판정하므로 원문을 유지한다
- 계획서 archive 이관은 보류했다. 다음 기준선 계획이 이 계획서와 증빙을 직접 참조하기 때문이다
- HiStudy 브랜치는 사용자 결정으로 main에 머지하지 않았다. 다음 작업 브랜치 `chore/supabase-migration-baseline`은 HiStudy 브랜치 위에 쌓여 있다
- 이전 `session.md`의 미커밋 내용(HiStudy Phase 3 안내)은 이미 지난 내용이라 새 안내로 교체했다. HiStudy 진행 기준은 `docs/work-plans/histudy-demo-*.md`다

## 다음 작업: T3 기준선 전환 계획 수립

### 경위

T001 증빙이 생겼으므로, 계획서의 `Later Work` 절에 있는 Baseline construction unit을 별도 Work Plan으로 구체화할 차례다. 운영 DB를 바꾸는 단계는 아직 없다.

### 확정된 것

- 운영 DB가 기준의 원천이다(ADR 0003)
- 다음 계획도 운영 DB는 읽기만 한다. 이력 정렬(`migration repair`)과 로컬 재구축은 이후 단위에서 별도 승인으로 다룬다
- 운영 DB 조회는 가능하면 `readonly_user`로 한다

### 계획에 반영할 검토 지적

- 백업 제외 범위를 CLI 실제 제외 목록(내부 스키마 약 29개)으로 정확히 적는다
- receipt의 안전 표시 값을 고정값이 아니라 측정값으로 채운다
- 공개 증빙에 읽은 시각과 한정 문구(history_scope, mutation_evidence)를 넣는다
- 무결성 고정 범위를 npm shim에서 실제 실행 파일까지 넓힐지 정한다
- 계획서의 CLI 근거를 실제 실행된 TS/Bun 빌드 기준으로 고친다("14자리 아닌 파일명은 건너뛴다" 문장 정정 포함)
- 두 루트 밖 SQL 6개를 목록에 넣을지 정한다

### 선결

- `readonly_user`로 migration 이력 읽기와 스키마 백업이 되는지 먼저 시험한다. 권한이 모자라면 필요한 권한만 추가한다
- 운영 DB 접속 주소는 세션 시작 전에 환경변수로 넣는다. 채팅이나 `.env` 본문에 실제 값을 넣지 않는다
- Docker Desktop을 켜 둔다(스키마 백업에 필요)

## 다음 작업 시작 절차

1. 브랜치 `chore/supabase-migration-baseline`에서 시작하고 `session.md`의 `지금 작업`을 확인한다
2. `docs/work-plans/supabase-migration-baseline.md`의 `Later Work` 절과 이 문서의 검토 지적을 읽는다
3. 프로젝트 Work Plan 절차(`/plan`)로 Baseline construction unit 계획을 만들고 사용자 승인을 받는다
4. 승인 뒤 첫 단계로 `readonly_user` 권한 시험을 한다
