---
title: "Collab Instruction: T3 기준선 구축 단위 Work Plan 작성"
tags:
  - type/docs
  - component/database
  - external/supabase
  - progress/in-progress
created: 2026-10-01
updated: 2026-10-01
lifecycle: active
---

# Collab Instruction: t3-baseline-construction-plan - T3 기준선 구축 단위 Work Plan 작성

## Meta

- **Slug**: t3-baseline-construction-plan
- **Created**: 2026-10-01
- **PRE_SHA**: af77b655bc264f3f46e6a500aad9563a347f8f4a
- **Plan Stem**: collab-t3-baseline-construction-plan
- **Size**: 신규 파일 3개만 만든다. 산출 Work Plan 1개(`docs/work-plans/supabase-baseline-construction.md`), Codex 작성 계획 1개(`.omo/plans/collab-t3-baseline-construction-plan.md`), 결과 보고 1개(`02-result.md`). 코드·SQL·설정 변경 없음, 운영 DB 접속 없음

## 용어

- **작성 계획**: Codex가 이번 순환에서 세우는 계획(`.omo/plans/collab-t3-baseline-construction-plan.md`). 이번 순환에서 사용자 승인을 받는 대상이다.
- **산출 Work Plan**: 작성 계획을 실행해 만드는 문서(`docs/work-plans/supabase-baseline-construction.md`). 이번 순환의 결과물이며, 그 안의 task는 실행하지 않는다.
- 이번 순환의 작성 계획 승인은 산출 Work Plan의 **실행 승인이 아니다**. 산출 Work Plan의 실행 승인은 Claude 검토 뒤 별도 순환에서 받는다.

## 목표

로드맵 T3의 다음 단위(Baseline construction unit)를 T001 증빙과 검토 지적을 반영한 실행 가능한 산출 Work Plan으로 만들어, 사용자 실행 승인을 기다리는 상태로 둔다.

## 배경

- T001(운영 DB 읽기 전용 증빙)은 완료됐다. 운영 migration 이력은 4건이고, 저장소 SQL 72개 중 번호가 정확히 맞는 파일은 0개다. 운영 스키마의 대부분은 이력 밖에서 적용됐다.
- 기준의 원천: ADR 0003(현 코드베이스를 정리하며 지속)과 직전 plan의 판단, T001 증빙을 근거로 운영 DB 스키마를 기준선의 출발점으로 삼는다. ADR 0003 본문에 "운영 DB가 기준"이라는 결정이 직접 적혀 있지는 않으므로, 산출 Work Plan에서 ADR의 직접 결정처럼 인용하지 않는다.
- 다음 단위는 `docs/work-plans/supabase-migration-baseline.md`의 `Later Work` 절 첫 항목이다. 정할 것은 검증된 스키마 범위와 제외 목록, 기준선 산출물 형식, legacy SQL 바이트 보존 방식, archive 소유권이다.
- 운영 DB 조회용 읽기 전용 계정 `readonly_user`가 만들어져 있다. 이 계정으로 migration 이력 읽기와 스키마 백업이 되는지는 아직 확인하지 않았다. 인계 문서의 "부족한 권한만 추가한다" 문구보다 이 지시서가 우선한다(아래 항목 1).

## 산출 Work Plan에 들어가야 할 것

1. 첫 실행 task로 `readonly_user` 권한 시험: 이력 읽기와 스키마 백업이 되는지 확인한다. 운영 DB 접근은 읽기 전용 명령만 허용하고, 실행 전 사용자 승인 게이트를 명시한다. 권한이 부족하면 필요한 권한을 문장으로 **제안만** 한다. 운영 DB 권한·role 변경(GRANT 등)은 이 단위의 OUT이며, 적용은 사용자가 직접 하는 별도 결정 항목으로 둔다.
2. 기준선 범위·제외 목록: Supabase CLI v2.118.0 기본 `db dump`가 제외하는 내부 스키마 전체를 실제 실행된 TS 빌드 기준으로 확정하는 task를 둔다. 이번 순환에서는 근거 출처와 "미확인" 표시만 적는다(Go 소스 기준 약 29개 패턴이라는 검토 보고가 있으나 TS 빌드 기준은 미확인). 근거 확인은 GitHub의 supabase/cli `v2.118.0` 태그 소스를 읽기 전용으로 열람하거나 로컬 npx cache의 패키지 파일을 읽는 방법만 쓴다. T001 증빙의 `dump_excludes`가 4개 범주(auth, storage, data, custom roles)로만 적혀 있던 문제를 바로잡는 방법을 적는다.
3. 기준선 산출물 형식과 legacy SQL 바이트 보존·archive 소유권 결정. 이동·삭제는 이 단위에서 실행하지 않는 설계로 둔다.
4. 증빙 위생 개선: receipt의 안전 표시 값(production_mutation, long_running_process, forbidden_commands 등)을 고정값이 아니라 측정값으로 채우는 방식, 공개 증빙에 읽은 시각과 한정 문구(`history_scope`, `mutation_evidence`)를 넣는 방식.
5. 무결성 고정 범위 결정: npm shim(`supabase@2.118.0`)뿐 아니라 실제 실행 파일 패키지(`@supabase/cli-windows-x64`)까지 고정할지와 그 확인 방법.
6. CLI 근거 정정: T001의 `db dump`·`migration list`는 TS/Bun 빌드(소스 경로 `apps/cli`)가 직접 처리했다. 직전 plan은 Go 소스(`apps/cli-go`)를 인용했고, "14자리가 아닌 파일명은 건너뛴다"는 문장이 부정확했다(실제 패턴 `^([0-9]+)_(.*)\.sql$`). 산출 Work Plan은 실제 실행 경로 기준으로 적는다.
7. 두 루트(`supabase/migrations`, `migrations`) 밖 SQL 6개를 inventory에 넣을지 결정: `supabase/` 바로 아래 4개, `docs/testing/checkout-test-sql.sql`, `scripts/seed-enrollments.sql`.

형식: 직전 plan과 같은 구조(Objective, Success Criteria, Verified Inputs, Scope IN/OUT, Prerequisites and Gates, 실행 task, Final Verification, `omo-workflow` JSON 블록)를 따른다. 직전 plan의 "Host-Owned OMO Runtime Review Binding" 절처럼 기계 절대 경로가 들어간 부분은 그대로 옮기지 않고, runtime CLI는 "설치된 start-work skill에서 resolve"라고만 적는다. 운영 DB에 닿는 task와 원격 변경(`migration repair`, `db push`, `db reset`)은 OUT 또는 별도 승인 게이트로 명시한다.

front-matter: 프로젝트 검사 스크립트가 받는 값만 쓴다. 이 지시서와 같은 `type/docs`, `component/database`, `external/supabase`, `progress/in-progress`를 권장한다. `phase/0`, `phase/planning`은 스크립트가 오류로 보므로 쓰지 않는다. 파일은 LF 줄바꿈으로 저장한다(CRLF면 front-matter를 인식하지 못한다).

## DoD

- `Test-Path docs/work-plans/supabase-baseline-construction.md` → `True`
- `Test-Path .omo/plans/collab-t3-baseline-construction-plan.md` → `True`
- 설치된 start-work skill에서 resolve한 Codex OMO runtime의 `inspect-plan`을 `docs/work-plans/supabase-baseline-construction.md`에 실행 → `"status":"INSPECTED"`
- `(Select-String -Path docs/work-plans/supabase-baseline-construction.md -Pattern 'readonly_user').Count -ge 1` → `True`
- `(Select-String -Path docs/work-plans/supabase-baseline-construction.md -Pattern 'dump_excludes').Count -ge 1` → `True`
- `(Select-String -Path docs/work-plans/supabase-baseline-construction.md -Pattern 'history_scope').Count -ge 1` → `True`
- `(Select-String -Path docs/work-plans/supabase-baseline-construction.md -Pattern 'cli-windows-x64').Count -ge 1` → `True`
- `(Select-String -Path docs/work-plans/supabase-baseline-construction.md -Pattern 'apps/cli(?![-\w])').Count -ge 1` → `True`(`apps/cli-go`만 인용하면 통과하지 않는다)
- `(Select-String -Path docs/work-plans/supabase-baseline-construction.md -Pattern 'checkout-test-sql.sql').Count -ge 1` → `True`
- `(Select-String -Path docs/work-plans/supabase-baseline-construction.md -Pattern '^\s*CREATE (OR REPLACE )?(TABLE|POLICY|FUNCTION|TRIGGER|VIEW)').Count` → `0`(스키마 원문을 옮기지 않는다)
- `(Select-String -Path docs/work-plans/supabase-baseline-construction.md -Pattern '[A-Za-z]:\\Users|AppData').Count` → `0`(기계 절대 경로 없음)
- `(Select-String -Path docs/work-plans/supabase-baseline-construction.md,.omo/plans/collab-t3-baseline-construction-plan.md,docs/work-plans/collab/t3-baseline-construction-plan/02-result.md -Pattern 'postgres(ql)?://[^\s@]+:[^\s@]+@|sbp_[A-Za-z0-9]{20,}|eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}|password\s*=').Count` → `0`
- `(npm run docs:verify-frontmatter 2>&1 | Select-String -SimpleMatch 'supabase-baseline-construction.md').Count` → `0`(저장소 전체의 기존 오류 때문에 명령 종료 코드는 1일 수 있다. 종료 코드는 판정에 쓰지 않는다)
- `git status --porcelain=v1 --untracked-files=all -- supabase migrations docs/work-plans/evidence docs/work-plans/supabase-migration-baseline.md docs/ROADMAP.md session.md package.json package-lock.json .gitignore docs/testing scripts docs/work-plans/handoff` → 출력 없음(수정·신규 파일 모두 없음)
- `02-result.md`를 쓴 뒤 `git status --porcelain=v1 --untracked-files=all -- docs .omo | Select-String -NotMatch 'histudy-demo-|/reviews/'` → 정확히 3줄: `?? .omo/plans/collab-t3-baseline-construction-plan.md`, `?? docs/work-plans/collab/t3-baseline-construction-plan/02-result.md`, `?? docs/work-plans/supabase-baseline-construction.md`
- `git diff --exit-code HEAD -- docs/work-plans/collab/t3-baseline-construction-plan/01-instruction.md` → 종료 코드 0(이 지시서는 수정하지 않는다)
- 비공개 증빙·기존 작업 기록·HiStudy 계획서 묶음 지문(git이 보지 않는 파일 보호 확인): `node -e "const f=require('fs'),p=require('path'),c=require('crypto');const L=[];const w=d=>{for(const e of f.readdirSync(d,{withFileTypes:true})){const q=p.posix.join(d,e.name);e.isDirectory()?w(q):L.push(q)}};w('docs/artifacts/supabase-baseline');w('.omo/workflows/supabase-migration-baseline-evidence');for(const e of f.readdirSync('docs/work-plans'))if(/^histudy-demo-.*\.md$/.test(e))L.push('docs/work-plans/'+e);L.sort();const h=c.createHash('sha256');for(const x of L)h.update(x+'\0').update(f.readFileSync(x));console.log(L.length+' '+h.digest('hex'))"` → `34 eebf379db9866dfd0409543686a353995cd9dcb31655f83a80fd9d05e68ccdef`
- `git rev-list --count af77b655bc264f3f46e6a500aad9563a347f8f4a..HEAD` → `1`(이 지시서를 올린 commit 하나뿐이다. Codex는 commit하지 않는다)

키워드 검사(`readonly_user`, `dump_excludes` 등)는 항목이 다뤄졌는지만 확인한다. 내용이 맞는지는 Claude가 `03-review.md`에서 판정한다. `docs/`와 `*.md`는 프로젝트 `.prettierignore`가 서식 검사에서 제외하므로 prettier 검사는 DoD에 넣지 않는다.

## 제약

- 따라야 할 패턴: `docs/work-plans/supabase-migration-baseline.md`의 문서 구조와 `omo-workflow` JSON 형식(schema_version 2, retry_policy, ownership, acceptance, checks), 한국어 본문, kebab-case 파일명, 상대 경로 링크.
- `.codex/**`, `.agents/**`는 열지 않는다(비밀값 포함). `rg --hidden/-uu/--no-ignore`, `git grep --untracked`는 쓰지 않는다.
- 작성 계획의 독립 검토 결과 파일이 필요하면 `docs/work-plans/collab/t3-baseline-construction-plan/reviews/`에만 둔다(아래 "정확히 3줄" 검사에서 이 폴더는 제외한다).
- 운영 DB 접속 금지: `supabase` CLI는 `--version`을 포함해 실행하지 않는다(저장소 파일을 다시 쓰고 네트워크에 접속한다). `--db-url`·`--linked`, `psql`, `pg_dump`, 그 밖에 네트워크로 DB에 닿는 명령을 실행하지 않는다. 환경변수에 DB 접속 주소가 있어도 읽거나 출력하지 않는다.
- 비밀 파일 열람 금지: `.env`, `.env.local` 같은 비밀 파일은 열거나 검색하지 않는다(`.env.example`만 예외). 저장소 검색은 git 제외 규칙을 따르는 `git grep` 또는 `rg`만 쓰고, `Select-String`·`Get-ChildItem -Recurse`로 저장소 전체를 훑지 않는다(위 DoD처럼 지정한 파일 검사는 허용). 산출 Work Plan에서 접속 정보는 환경변수 이름 자리표시(예: `<DVS_SUPABASE_READONLY_DB_URL>`)로만 적는다.
- 로컬 Supabase stack, dev server, Docker container를 띄우지 않는다.
- 산출 Work Plan의 task는 하나도 실행하지 않는다.
- 공개 문서 최소화: 산출 Work Plan에 스키마 DDL, 함수 본문, 정책 정의, 접속 주소, 비밀번호를 옮겨 적지 않는다. 비공개 증빙(`docs/artifacts/supabase-baseline/`)은 읽기만 하고 수·범주·해시만 인용한다.
- commit, push, branch 전환·생성, merge를 하지 않는다. 작업 브랜치는 `chore/supabase-migration-baseline` 그대로 둔다(이 브랜치는 머지되지 않은 HiStudy 브랜치 위에 쌓여 있다).
- 건드리면 안 되는 파일: `supabase/**`(바로 아래 SQL 4개 포함), `migrations/**`, `docs/testing/checkout-test-sql.sql`, `scripts/seed-enrollments.sql`, `docs/work-plans/supabase-migration-baseline.md`, `docs/work-plans/evidence/**`, `docs/work-plans/handoff/**`, `docs/artifacts/**`, `docs/ROADMAP.md`, `session.md`, `.env`, `.gitignore`, `package.json`, `package-lock.json`, `docs/work-plans/histudy-demo-*.md`, 이 지시서.
- `.omo/workflows/`: 기존 디렉터리(특히 `supabase-migration-baseline-evidence/`)는 건드리지 않는다. Codex OMO runtime이 이번 순환용으로 새 work 디렉터리를 만드는 것은 허용한다.

## 참조

- `docs/work-plans/handoff/2026-09-29-supabase-baseline-evidence.md` - T001 결과, 핵심 발견, 예외·부작용, 다음 작업의 확정 사항과 검토 지적
- `docs/work-plans/supabase-migration-baseline.md` - 직전 plan. `Later Work` 절(다음 단위 정의), `Artifact Contracts`, `omo-workflow` JSON 형식의 본보기
- `docs/work-plans/evidence/supabase-migration-baseline/T001-receipt.json` - 공개 증빙의 현재 형태(개선 대상 필드 확인용)
- `docs/artifacts/supabase-baseline/T001-reconciliation.json` - 비공개 대조 결과(분류·경계 확인용, 읽기만)
- `docs/artifacts/supabase-baseline/T001-local-migrations.json` - 72개 SQL manifest(읽기만)
- `docs/artifacts/supabase-baseline/T001-remote-schema-a.sql` - 운영 스키마 백업(범위 통계 산출용, 읽기만, 내용 인용 금지)
- `docs/adr/0003-continue-existing-codebase.md` - 현 코드베이스를 정리하며 지속한다는 결정
- `docs/ROADMAP.md` - T3·T4 행과 순서 근거(T4 DB 권한 재정비가 T3 기준선에 의존)
- `docs/workflows/work-plan-guide.md` - 프로젝트 Work Plan 운영 규칙

모든 경로는 리포 루트 기준으로 해석하라

## 진행 규칙

- 계획을 먼저 세워라. 계획은 실행하기 전에 반드시 사용자 승인을 받아야 한다.
- 생성할 plan 파일의 stem은 `collab-t3-baseline-construction-plan`으로 명시 지정한다.
- 판단이 갈리는 결정(예: SQL 6개 포함 여부, 무결성 고정 범위, 기준선 산출물 형식)은 산출 Work Plan 안에 선택지와 추천을 적고 사용자 결정 항목으로 남긴다. 임의로 확정하지 않는다.

## 보고 규칙

구현이 완료되면 최종 보고를 같은 폴더의 `02-result.md` 파일에 그대로(생략 없이) 기록하라. 아래 골격을 그대로 02-result.md로 옮겨 각 항목을 빠짐없이 채워라. 이 지시서 파일에는 쓰지 마라.

<!-- RESULT-SKELETON -->

````
# Collab Result: t3-baseline-construction-plan - T3 기준선 구축 단위 Work Plan 작성

> 이 파일은 Codex 전용이다. Claude는 이 파일에 쓰지 않는다.

## Meta
- **Slug**: t3-baseline-construction-plan
- **작성 주체**: Codex
- **완료 시각**: YYYY-MM-DD HH:MM
- **Plan Stem**: collab-t3-baseline-construction-plan

## 완료 보고 원문
아래 펜스 안에는 구현 완료 시점에 출력한 최종 완료 보고를 요약하거나 다시 쓰지 말고, 생략 없이 그대로 붙여넣는다.

```
[여기에 완료 보고 원문을 그대로 붙여넣는다]
```

## 변경 파일

| 경로 | 신규/수정/삭제 |
|------|----------------|
| [경로] | [신규 / 수정 / 삭제] |

## 실행 검증

| 명령 원문 | 종료 코드 | 결과 요약 |
|-----------|-----------|-----------|
| [명령] | [종료 코드] | [결과 요약] |

실행하지 않은 항목은 공란으로 두지 말고 `미실행`으로 표기한다.

## 미해결·판단 보류
미해결 항목이나 판단을 보류한 사항을 적는다. 없으면 공란으로 두지 말고 반드시 `없음`으로 명시한다.
````
