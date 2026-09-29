---
title: Supabase Migration Baseline 읽기 전용 Evidence Work Plan
work_id: supabase-migration-baseline-evidence
schema_version: 2
status: awaiting-execution-approval
risk: high
created: 2026-09-28
updated: 2026-09-28
source_commit: bf53724ceee700e14766dd0b215bbfbec548d07c
parent_roadmap: docs/ROADMAP.md
---

# Supabase Migration Baseline 읽기 전용 Evidence Work Plan

## Objective

활성 운영 Supabase 프로젝트의 migration history와 schema를 읽기 전용으로 두 번 수집하고, 저장소의 legacy SQL 72개와 대조한 immutable evidence를 만들어 다음 baseline 전환 계획의 exact inputs·ownership·decision gate를 확정한다.

이 문서는 Product Roadmap T3 전체가 아니라 rolling-wave 방식의 CURRENT EXECUTABLE UNIT만 다룬다. 현재 unit은 production Supabase를 변경하지 않는 evidence tranche이며, baseline 생성·legacy archive·local rebuild·remote migration-history 정렬은 새 evidence를 바탕으로 별도 refinement와 승인을 받은 뒤에만 실행한다.

## Success Criteria

1. Dashboard에서 확인된 활성 대상 `dvs_nc`의 project ref `datvqaemqzhgitxxfvar`와 실제 connection target이 일치하며, credential을 노출하지 않는 sanitized target fingerprint가 receipt와 두 independent review에 hash로 결속된다.
2. Supabase CLI는 `npx --yes supabase@2.118.0`으로만 실행되고 npm integrity `sha512-0aPIlzBSBLwbJZCMZKD1QAwlc4xNnNvvk07QuSuuKBKzGLSeV3GovgTLlMKFTJ4JWfJubWF0URPLuPUr0kZr5g==`가 확인되며, repository dependency·lockfile·global install을 만들거나 변경하지 않는다.
3. 허용된 네 remote read가 정해진 순서와 argv로 성공하고, history before/after가 byte-identical이며 schema A/B가 non-empty이면서 byte-identical이다. dump nondeterminism을 포함한 차이는 실패로 처리하고 다른 비교 방식으로 대체하지 않는다.
4. `supabase/migrations`와 root `migrations`의 executable-candidate SQL manifest가 정확히 72개 unique path를 포함하고 각 파일의 measured SHA256·byte size가 현재 source bytes와 일치하며, 실행 전후 source bytes가 동일하다.
5. reconciliation은 remote history의 timestamp-only 한계 아래 local/remote matched·unmatched·ambiguous 항목을 모두 분류하고, default schema-only dump가 managed `auth`/`storage` schema·data·custom roles를 제외한다는 경계와 full schema closure가 `UNVERIFIED`임을 기록한다.
6. raw history/schema/state evidence는 ignored private path에만 존재하고, durable public evidence는 count·classification·hash·verdict·env-var placeholder가 적용된 command name만 포함하며 secret·function body·security-detail dump를 포함하지 않는다.
7. source migrations, Roadmap, ADR, 운영 문서, package files와 실행 전 unrelated dirty state가 byte/status 기준으로 보존되고, production mutation과 long-running process가 발생하지 않는다.
8. 현재 artifact hash를 검토한 worker-independent INTENT reviewer와 ADVERSARIAL reviewer가 서로 다른 identity로 exact seven-field 결과를 남기며, 두 review가 wrong-project 및 history 밖 schema drift counterexample를 명시적으로 판정한다.

## Verified Inputs

- Git identity: branch `chore/histudy-demo-removal`, HEAD `bf53724ceee700e14766dd0b215bbfbec548d07c`, origin branch는 현재 local branch보다 40 commits 뒤에 있다.
- 실행 전 보존 대상 user state: modified `session.md`; untracked `.agents/`, `.codex/`, `AGENTS.md`, 여러 Phase 3-7 Work Plans.
- local tool/config 상태: `.env.local`, `.env`, `supabase/config.toml`, `supabase/.temp` 없음; Supabase CLI와 `psql` 없음; Docker CLI `29.7.2` 있음.
- SQL inventory: `supabase/migrations` 72 files = 70 SQL + 2 Markdown; SQL 중 timestamped 56, non-timestamped 14. root `migrations`에 SQL 2개가 있어 combined executable-candidate SQL은 정확히 72개다.
- legacy risk markers: 반복 date prefix, `DROP` 78 statements, `DELETE` 12 statements가 있으며 기존 문서는 Dashboard 수동 실행을 설명하고 서로 충돌한다. 이 tranche에서는 어느 legacy SQL도 실행하지 않는다.
- 기존 migration files와 T3 canonical source docs는 clean이지만 전체 worktree는 dirty다.
- 공식 CLI contract: `migration list`는 timestamp만 비교하고, default `db dump`는 schema-only이며 managed schema·data·custom roles를 제외한다. `db pull`은 remote history를 쓸 수 있고 `migration repair`는 remote history를 변경하며 `db reset --linked`는 destructive다. `db dump`는 one-shot Docker `pg_dump` container를 요구한다.
- Supabase CLI v2.118.0 source contract: `migration list`는 process cwd의 `supabase/migrations`를 읽고, directory 부재는 허용하며, 14-digit가 아닌 filename은 skip하고 duplicate valid version은 reject하지 않는다. 따라서 legacy repository cwd 실행은 remote history evidence를 왜곡할 수 있다. 근거: https://github.com/supabase/cli/blob/70b42b8/apps/cli-go/pkg/migration/list.go#L17-L59.
- production authority: ADR 0003에 따라 기존 codebase를 계속 사용하고 production DB를 authoritative source로 취급한다.

## Scope

### IN

- Supabase CLI package version/integrity와 repository 비설치 상태 검증.
- process-scoped `DVS_SUPABASE_DB_URL`의 sanitized target fingerprint 검증.
- task-owned isolated empty cwd에서 remote-only migration history 2회와 workspace cwd에서 default schema-only dump 2회 수집.
- combined 72 SQL manifest와 remote history의 timestamp-only reconciliation.
- 실행 전후 protected bytes 및 unrelated dirty state 비교.
- credential-literal scan을 통과한 private raw artifacts, minimal public receipt, independent INTENT/ADVERSARIAL review 결과 생성.

### OUT

- baseline SQL 생성, legacy SQL 이동·삭제·rename·내용 변경 또는 실행.
- production schema, data, role, extension, bucket, policy, migration history의 모든 mutation.
- `db pull`, `db diff`, `db push`, `migration repair`, `db reset`, `migration up`, `migration down`, `migration squash`, `psql` DDL/DML, `--data-only` dump, `--role-only` dump.
- local Supabase stack, dev server 또는 long-running container/process 기동.
- package dependency/lockfile/global CLI install.
- commit, push, PR, `session.md` update, Product Roadmap 수정 또는 T3 완료 표시.
- baseline/archive/local-rebuild/remote-history 작업의 실행.

## Prerequisites and Gates

1. Host가 이 exact plan의 hash와 `inspect-plan` 결과를 확인한 뒤 사용자 execution approval을 기록해야 한다. planning completion은 execution approval이 아니다.
2. 실행 시작 시 HEAD와 workflow observations가 그대로여야 한다. 하나라도 다르면 T001을 시작하지 않고 stale input으로 refinement한다.
3. `DVS_SUPABASE_DB_URL`은 process scope에만 존재하고 non-empty임을 값 출력 없이 확인해야 한다. `.env*`, shell history, command log, artifact에 실제 값을 쓰지 않는다.
4. raw artifact 8개 모두가 쓰기 전에 `git check-ignore --no-index`로 ignored임을 확인해야 한다. 하나라도 ignored가 아니면 `.gitignore`를 이 plan에서 수정하지 않고 실패·refinement한다.
5. `npm view supabase@2.118.0 dist.integrity` 결과가 pinned integrity와 같고, `npx --yes supabase@2.118.0 --version` 결과가 `2.118.0`이어야 한다. repository dependency, `package-lock.json`, global install을 만들지 않는다.
6. `docs/artifacts/supabase-baseline/T001-cli-workdir`는 시작 시 없어야 한다. 각 `migration list` 직전에 directory를 새로 만들거나 비워 exact empty 상태를 확인하고, `config.toml`과 `supabase/migrations`가 모두 없음을 확인한다.
7. direct target은 hostname에서 project ref `datvqaemqzhgitxxfvar`가 exact match해야 한다. credential을 제거한 host record의 SHA256와 host class `direct`만 durable receipt에 남긴다.
8. direct DNS/TCP preflight가 관찰 가능한 IPv6/direct connectivity failure를 보일 때만 session pooler를 사용할 수 있다. 이때 명시적인 session-pooler host record와 port `5432`, connection identity의 project ref 일치를 private evidence에서 확인하고 durable receipt에는 host record SHA256와 host class `session-pooler`만 남긴다. transaction pooler와 port `6543`은 금지한다. 조건을 충족하지 못하면 fallback하지 않고 실패한다.
9. Docker는 두 `db dump`가 필요로 하는 one-shot container에만 사용할 수 있다. 실행 후 해당 invocation에서 시작된 container/process가 남지 않아야 한다.
10. 위 gate는 새로운 scope 결정을 요구하지 않는다. 이 exact plan의 execution approval이 one-shot Docker 사용을 포함한다.

## Approach

T001은 한 high-risk atomic unit으로 실행한다. 먼저 source와 dirty state를 byte/status snapshot으로 고정하고, target fingerprint와 pinned CLI를 확인한다. `migration list`용 task-owned isolated empty cwd를 준비한 뒤 history-before → schema-A → schema-B → history-after 순서로 네 remote read를 수행한다. history pair와 schema pair를 각각 raw bytes로 비교하고 raw credential-literal scan을 통과한 뒤에만 local 72-SQL manifest와 remote-only reconciliation을 만든다. 마지막으로 isolated cwd를 제거하고 source/unrelated state를 다시 측정해 동일성을 확인한 뒤 secret-free receipt를 발행한다. Receipt가 완성된 뒤 별도 identity의 INTENT reviewer와 ADVERSARIAL reviewer가 실제 terminal verdict를 반환하고, host가 current attempt·identity·artifact hashes를 exact review result files와 OMO review input에 결속한다.

remote DB command allowlist는 다음 네 successful invocations뿐이다. `<DVS_SUPABASE_DB_URL>`은 receipt용 placeholder이며 실행기는 shell command string을 만들지 않고 process environment에서 값을 spawn boundary에 전달한다.

1. `npx --yes supabase@2.118.0 migration list --db-url <DVS_SUPABASE_DB_URL>` → `T001-remote-history-before.txt`; process cwd class는 `isolated-empty`.
2. `npx --yes supabase@2.118.0 db dump --db-url <DVS_SUPABASE_DB_URL> --file docs/artifacts/supabase-baseline/T001-remote-schema-a.sql`; process cwd class는 `workspace`.
3. `npx --yes supabase@2.118.0 db dump --db-url <DVS_SUPABASE_DB_URL> --file docs/artifacts/supabase-baseline/T001-remote-schema-b.sql`; process cwd class는 `workspace`.
4. `npx --yes supabase@2.118.0 migration list --db-url <DVS_SUPABASE_DB_URL>` → `T001-remote-history-after.txt`; process cwd class는 `isolated-empty`.

두 `migration list`는 실제 repository cwd에서 실행하지 않는다. 각 호출 직전에 `T001-cli-workdir`가 empty이고 `config.toml` 및 `supabase/migrations`가 없음을 검사한다. 두 번째 history capture 뒤 해당 directory를 제거하고 absent를 확인한다. `db dump` 두 호출은 workspace cwd를 유지한다. DNS/TCP target preflight, npm integrity 조회, CLI version 확인, local Git/Node 검증은 DB command가 아니다. 이들도 secret을 인자로 기록하지 않고 shell interpolation 없이 argv 기반 process runner로 실행한다.

## Security, Safety, and Recovery

- URL, password, token, cookie, connection string은 stdout/stderr, artifacts, review prompt, receipt에 출력하지 않는다. 실제 DB URL이 포함될 수 있는 exception과 process diagnostics는 redaction한 뒤에만 요약한다.
- target parser는 credential을 버리고 project ref·host class·sanitized host-record hash만 공개한다. project ref가 다르면 remote command를 한 번도 실행하지 않는다.
- remote evidence는 read-only allowlist로 제한한다. schema/history pair equality는 mutation 부재의 보조 evidence이며 완전한 audit log라고 주장하지 않는다.
- `db dump`의 default exclusion 때문에 managed `auth`/`storage`, data, custom roles는 `UNVERIFIED`로 남긴다. Raw schema detail은 private path 밖으로 복사하지 않으며 raw history/schema/JSON 8개 모두 credential-literal scan을 통과해야 한다.
- Raw scan은 값을 출력하지 않고 credential-bearing PostgreSQL URL, `sbp_` token, JWT-shaped literal, PEM private key, common live API-key prefix, SQL `CREATE/ALTER ROLE ... PASSWORD` literal, exact `secret`/`token`/`api_key`/`password` literal assignment을 최소 탐지한다. `password_hash`처럼 identifier가 더 이어지는 safe identifier만으로는 실패하지 않는다.
- Raw secret가 감지되면 match나 값을 출력하지 않고 이 task가 만든 raw artifacts만 삭제하며 receipt/review 전에 실패한다. legacy SQL, source docs, user dirty state는 건드리지 않는다. remote rollback은 read-only이므로 필요하지 않다.
- command failure, real repository cwd의 `migration list`, isolated cwd contamination/잔존, pairwise byte mismatch, wrong target, ignore failure, protected-state drift, raw/public secret scan failure, review FAIL 중 하나라도 발생하면 T001은 실패한다. silent fallback이나 normalized/reformatted 비교로 성공 처리하지 않는다.
- final cleanup은 이 작업이 시작한 one-shot Docker process만 대상으로 하며 관련 없는 process를 종료하지 않는다.

## Current Executable Unit

- [x] T001 운영 Supabase baseline evidence를 읽기 전용으로 수집·대조한다

### T001 Contract

- Dependencies: 없음.
- Risk: `high`.
- Independent acceptance owners: 구현 worker와 다른 INTENT reviewer 1명, 구현 worker 및 INTENT reviewer와 다른 ADVERSARIAL reviewer 1명. Host는 runtime의 independent review binding과 final checks를 별도로 확인한다.
- Ownership은 아래 artifact 11개를 정확한 순서로 포함하고, temporary process cwd인 `docs/artifacts/supabase-baseline/T001-cli-workdir`를 non-artifact ownership으로 추가한다. Inspected plan path는 T001 ownership·artifact·review target에서 제외하며, 승인된 plan bytes는 runtime 동안 변경하지 않는다.
  1. `docs/artifacts/supabase-baseline/T001-worktree-before.json`
  2. `docs/artifacts/supabase-baseline/T001-remote-history-before.txt`
  3. `docs/artifacts/supabase-baseline/T001-remote-schema-a.sql`
  4. `docs/artifacts/supabase-baseline/T001-remote-schema-b.sql`
  5. `docs/artifacts/supabase-baseline/T001-remote-history-after.txt`
  6. `docs/artifacts/supabase-baseline/T001-local-migrations.json`
  7. `docs/artifacts/supabase-baseline/T001-reconciliation.json`
  8. `docs/artifacts/supabase-baseline/T001-worktree-after.json`
  9. `docs/work-plans/evidence/supabase-migration-baseline/T001-receipt.json`
  10. `docs/work-plans/evidence/supabase-migration-baseline/T001-intent.json`
  11. `docs/work-plans/evidence/supabase-migration-baseline/T001-adversarial.json`
- Additional non-artifact ownership: `docs/artifacts/supabase-baseline/T001-cli-workdir`. 두 history call의 isolated empty cwd로만 사용하고 T001 종료 전에 제거한다.
- Concrete work:
  - `T001-worktree-before.json`에 branch, HEAD, `git status --porcelain=v1 -z --untracked-files=all` 기반 unrelated state, protected files, 72 SQL의 path/SHA256/byte size를 deterministic sorted form으로 저장한다. Task-owned artifacts와 `T001-cli-workdir`만 unrelated-state 비교에서 제외하며 plan path는 bytes/status 보존 대상이다.
  - target fingerprint, npm integrity, CLI version, raw path ignore를 gate로 확인한다.
  - 각 history call 직전에 `T001-cli-workdir`를 exact empty directory로 확인하고 `config.toml`/`supabase/migrations` 부재를 확인한다. 두 `migration list` process cwd를 이 directory로 고정하고, 두 `db dump` process cwd는 workspace로 고정한다. 실제 repository cwd로 history command를 fallback하지 않는다.
  - allowlist 네 command를 정해진 순서로 실행하고 raw stdout/file bytes를 normalization 없이 보존한다. Receipt의 각 `remote_reads` row는 sanitized `cwd_class`를 기록하며 순서는 `isolated-empty`, `workspace`, `workspace`, `isolated-empty`다.
  - Raw artifacts 1-8을 credential-literal pattern set으로 scan한다. Match 시 값을 출력하지 않고 task-created raw artifacts만 삭제한 뒤 receipt/review 전에 실패한다.
  - `T001-local-migrations.json`을 두 source directory에서 `.sql` extension만 모아 relative path 기준 lexicographic sort로 작성한다. 각 row는 `path`, `sha256`, `size_bytes`, `timestamp_kind`, `timestamp_token`을 가진다.
  - `T001-reconciliation.json`은 isolated cwd에서 얻은 migration-list output을 remote-only timestamp evidence로 해석한다. 동일 token에 local 또는 remote 후보가 하나씩일 때만 `matched`, 후보 없음은 `local_unmatched`/`remote_unmatched`, duplicate·non-unique·parse uncertainty는 `ambiguous`로 분류한다. 모든 local 72 path와 모든 parsed remote row가 정확히 한 classification에 포함되어야 한다.
  - 실행 후 같은 방식으로 `T001-worktree-after.json`을 만들고 before/after의 branch, HEAD, unrelated state, protected files, local SQL bytes를 비교한다.
  - 두 번째 history capture 뒤 `T001-cli-workdir`를 제거하고 absent를 확인한다. 모든 gate가 통과한 뒤 receipt를 작성한다. Receipt는 raw artifacts 1-8의 current hash/size, sanitized target fingerprint, executor identity, toolchain pin, redacted allowlist ledger와 cwd class, equality verdict, count/classification summary, exclusion/UNVERIFIED boundary, `raw_secret_scan=true`, no-mutation/no-long-running-process verdict만 담는다.
  - Receipt 완료 후 host가 artifacts 1-9의 current SHA256를 측정하고, 실제 terminal completion과 explicit verdict를 반환한 reviewers의 identity를 사용해 각 review JSON의 `reviewed_artifacts`에 결속한다. Review result 자체는 reviewed target에서 제외한다.
- Acceptance conditions:
  - target fingerprint는 `project_ref=datvqaemqzhgitxxfvar`와 `host_class=direct|session-pooler`를 포함하고 credential은 포함하지 않는다. `session-pooler`이면 direct failure observation과 explicit host-record hash가 있어야 한다.
  - CLI version과 npm integrity가 pin과 같고 repository/global install이 없으며 package files의 pre/post 상태가 같다.
  - remote read ledger는 exact four-command allowlist와 순서, exit code 0 및 cwd class `isolated-empty, workspace, workspace, isolated-empty`를 기록하고 금지 command는 0개다. 종료 시 `T001-cli-workdir`는 absent다.
  - history before/after SHA256가 같고 raw bytes가 동일하다. schema A/B는 각각 non-empty이고 SHA256와 raw bytes가 동일하다.
  - local manifest는 72 unique SQL paths를 가지며 각 hash/size가 live source와 before/after snapshot에 일치한다.
  - reconciliation의 local/remote coverage count가 각각 source count와 같고 matched/local-unmatched/remote-unmatched/ambiguous가 누락 없이 채워진다. Migration-list input은 remote-only이며 timestamp-only와 dump exclusion 경계 및 full schema closure `UNVERIFIED`가 기록된다.
  - raw artifacts 1-8은 모두 ignored이고 credential-literal scan을 통과하며, durable artifacts 9-11은 secret-free/detail-minimal이다. Receipt safety는 `raw_secret_scan=true`다.
  - current source migrations, Roadmap, ADR, docs, package files, unrelated dirty state가 before/after byte/status 기준으로 같다.
  - INTENT review는 approved objective/scope, exact target fingerprint binding, four-read bracketing, 72-file reconciliation, exclusions를 판정한다. ADVERSARIAL review는 wrong-project target과 history-stable/schema-drift counterexample, dump nondeterminism, secret leakage, state drift, forbidden command 가능성을 판정한다.
  - review JSON은 각각 정확히 `work_id`, `task_id`, `attempt`, `axis`, `reviewer_id`, `reviewed_artifacts`, `verdict` 일곱 field만 가지며 current artifact hashes, current attempt, distinct non-worker identities와 `INTENT_PASS`/`ADVERSARIAL_PASS`를 사용한다.
  - production mutation과 long-running process가 없고 temporary CLI workdir가 남지 않는다.
- Checks and expected results:
  - Artifact consistency check: JSON contract, pairwise raw-byte equality, non-empty dumps, 72-file unique live-byte manifest, remote-only reconciliation coverage, receipt ledger/hash/cwd binding, absent CLI workdir를 검사하며 exit code 0이어야 한다.
  - Privacy check: private artifact ignore, raw credential-literal absence, `raw_secret_scan=true`, durable receipt allowlisted fields, placeholder-only commands, public secret/forbidden-command absence를 match 출력 없이 검사하며 exit code 0이어야 한다.
  - Protected diff check: clean canonical source paths의 Git diff가 비어 있어야 한다. 기존 dirty state는 before/after snapshot equality로 별도 보존한다.
  - Task checks는 independent review 전에 실행되므로 reserved review result files를 요구하지 않는다.

### Host-Owned OMO Runtime Review Binding

이 절차는 task worker나 reviewer가 아니라 host가 소유한다. Installed `start-work` skill에서 runtime CLI를 resolve하며, 이 plan이 사용하는 current resolved CLI는 `C:\Users\jangk\.codex\omo-runtime\windows-npm-fa2a6658ff26bf30\scripts\omo-workflow.mjs`다. Runtime이 달라졌다면 shared source나 다른 CLI로 대체하지 않고 installed `start-work` runtime을 다시 resolve해 plan refinement 대상으로 반환한다.

1. Host는 worker 자기보고가 아니라 actual worker terminal observation으로 T001 worker 종료를 먼저 확인한다. 그 뒤 아래 두 command를 실행한다.
   - `node C:\Users\jangk\.codex\omo-runtime\windows-npm-fa2a6658ff26bf30\scripts\omo-workflow.mjs status --workspace C:\Users\jangk\Projects\Coding\dvs-template01 --work supabase-migration-baseline-evidence`
   - `node C:\Users\jangk\.codex\omo-runtime\windows-npm-fa2a6658ff26bf30\scripts\omo-workflow.mjs next --workspace C:\Users\jangk\Projects\Coding\dvs-template01 --work supabase-migration-baseline-evidence`
2. `status`/`next`에서 T001의 current attempt를 읽고 `native_agent.status=COMPLETED`, actual worker `native_agent_id`, actual dispatch `worker_id`를 요구한다. 누락, non-terminal status 또는 attempt 불일치는 즉시 실패다.
3. Host는 review result files를 제외한 artifacts 1-9만 current bytes에서 SHA256로 측정해 동일한 ordered receipt set을 만든다.
4. Host는 실제 independent reviewer 두 명을 dispatch한다. INTENT reviewer ID와 ADVERSARIAL reviewer ID는 actual worker `native_agent_id`/`dispatch worker_id` 어느 것과도 달라야 하고 서로도 달라야 한다. 각 reviewer의 terminal completion과 explicit `INTENT_PASS`/`ADVERSARIAL_PASS`를 actual observation으로 확인한다. Non-terminal, missing identity, duplicate identity 또는 FAIL은 중단 조건이다.
5. Host는 실제 `work_id`, `task_id=T001`, current attempt, axis, actual reviewer ID, current artifacts 1-9 receipts, explicit verdict를 사용해 `docs/work-plans/evidence/supabase-migration-baseline/T001-intent.json`과 `T001-adversarial.json`을 작성한다. 각 파일은 정확히 `work_id`, `task_id`, `attempt`, `axis`, `reviewer_id`, `reviewed_artifacts`, `verdict` 일곱 field만 가진다.
6. Host는 `.omo/workflows/supabase-migration-baseline-evidence/inputs/T001-host-review.json`을 작성한다. Top-level은 `source=HOST_REVIEW`, `task_id=T001`, `criteria`, `independent_reviews`를 가진다. `criteria`에는 workflow JSON의 exact T001 acceptance criterion마다 하나씩 `criterion`, `passed=true`, actual artifact evidence를 담은 `evidence` row를 둔다. `independent_reviews`는 정확히 두 row이며 각 row는 `axis`, `source=HOST_OBSERVED`, `status=COMPLETED`, actual `reviewer_id`, actual `observed_at`, 동일한 current artifacts 1-9 `reviewed_artifacts`, 해당 `result_path`를 가진다.
7. Host는 task verification을 exact invocation으로 실행한다: `node C:\Users\jangk\.codex\omo-runtime\windows-npm-fa2a6658ff26bf30\scripts\omo-workflow.mjs verify --workspace C:\Users\jangk\Projects\Coding\dvs-template01 --work supabase-migration-baseline-evidence --task T001 --input .omo/workflows/supabase-migration-baseline-evidence/inputs/T001-host-review.json`.
8. Expected task result는 verification `PASS`, T001 status `COMPLETE`, 두 `independent_reviews`가 current attempt·actual IDs·current hashes와 일치한 passed 상태, next action `FINAL_VERIFICATION_REQUIRED`다. 하나라도 다르면 실패하고 FINAL 단계로 진행하지 않는다.
9. Task verification PASS 뒤 host는 같은 inputs directory의 `.omo/workflows/supabase-migration-baseline-evidence/inputs/FINAL-host-review.json`을 작성한다. Top-level은 `source=HOST_REVIEW`, `task_id=FINAL`, `criteria`를 가지며, workflow JSON의 exact invariant마다 하나씩 `criterion`, `passed=true`, actual artifact evidence를 담은 `evidence` row를 둔다.
10. Host는 final verification을 exact invocation으로 실행한다: `node C:\Users\jangk\.codex\omo-runtime\windows-npm-fa2a6658ff26bf30\scripts\omo-workflow.mjs verify --workspace C:\Users\jangk\Projects\Coding\dvs-template01 --work supabase-migration-baseline-evidence --task FINAL --input .omo/workflows/supabase-migration-baseline-evidence/inputs/FINAL-host-review.json`.
11. Expected final result는 verification `PASS`, workflow status `COMPLETE`, `reason=null`, 모든 `final_checks` PASS다. 이 결과를 실제로 관찰한 뒤에만 completion을 보고한다.

`.omo/workflows/supabase-migration-baseline-evidence/**`의 inputs와 runtime files는 host-owned protected state다. Task ownership/artifacts에 넣지 않고 reviewer evidence 또는 `reviewed_artifacts`로 사용하지 않는다. Runtime `verify` contract가 actual worker와 reviewer의 독립성, axis 간 reviewer uniqueness, current attempt, result-file hash binding, terminal reviewer observation을 강제한다. Plan의 Node final check만으로 이 binding을 대체하거나 PASS로 판정하지 않는다.

- Failure scenario: project ref mismatch, direct failure 근거 없는 pooler 사용, remote command 추가/변형, real repository cwd의 `migration list`, cwd class 순서 불일치, isolated cwd contamination/잔존, command nonzero, history/schema pair mismatch, dump empty/nondeterministic, 72-count 또는 hash mismatch, reconciliation coverage gap, raw path non-ignored, raw/public credential literal 발견, protected/unrelated state drift, container 잔존 중 하나라도 발생하면 task-created raw artifacts만 삭제하고 receipt/review 단계로 진행하지 않는다. 이미 receipt가 만들어진 뒤 발견되면 PASS artifact로 취급하지 않고 T001 실패로 반환해 plan refinement를 요구한다.

## Artifact Contracts

- `T001-worktree-before.json`, `T001-worktree-after.json`: `schema_version`, `captured_at`, `branch`, `head`, `unrelated_state`, `protected_files`, `local_sql`, `package_state`, `long_running_processes_started_by_task`를 가진다. `captured_at` 외 비교 대상은 byte-for-byte equivalent JSON value여야 하고 마지막 배열은 after에서 비어 있어야 한다.
- history `.txt`: CLI stdout raw bytes다. stderr와 credential은 저장하지 않는다.
- schema `.sql`: default schema-only `db dump` raw file bytes다. normalization, comment removal, reformatting을 하지 않는다.
- `T001-local-migrations.json`: `schema_version`, `roots`, `count`, `files`를 가지며 `count=72`, `roots=["supabase/migrations","migrations"]`다.
- `T001-reconciliation.json`: `schema_version`, `target_fingerprint`, `history`, `local_inventory`, `classifications`, `coverage`, `boundaries`를 가진다. `classifications`에는 `matched`, `local_unmatched`, `remote_unmatched`, `ambiguous` 네 배열이 모두 존재한다. SQL body나 function/policy definition을 포함하지 않는다.
- `T001-receipt.json`: public minimal evidence다. exact top-level fields는 `schema_version`, `work_id`, `task_id`, `attempt`, `executor_id`, `target_fingerprint`, `toolchain`, `remote_reads`, `evidence`, `comparisons`, `classification_counts`, `boundaries`, `safety`다. `target_fingerprint`의 host record는 SHA256만 공개한다. `remote_reads`는 sanitized `cwd_class`를 결속하고 `safety.raw_secret_scan`은 `true`다. `evidence`는 private artifacts 1-8의 path/hash/size를 순서대로 결속한다.
- `T001-intent.json`, `T001-adversarial.json`: 각각 exact seven-field review JSON이다. 두 파일의 `reviewed_artifacts`는 review result files를 제외한 artifacts 1-9를 같은 current path/hash 집합으로 포함한다. Receipt hash가 포함되므로 sanitized target fingerprint가 두 review에 결속된다.
- `T001-cli-workdir`: non-artifact temporary directory다. 각 history read 직전에 exact empty 상태이며 `config.toml`/`supabase/migrations`가 없고, evidence capture 후 absent여야 한다.

```omo-workflow
{
  "schema_version": 2,
  "work_id": "supabase-migration-baseline-evidence",
  "observations": [
    {"path":"session.md","sha256":"c08abdd620c142d0319b832e13f84891b1165d7e209576434793e06d41fd2ceb"},
    {"path":"docs/ROADMAP.md","sha256":"ef576eadb56ed19276bd8445648df8172e341dea240916da48eba526a6ecb7a0"},
    {"path":"docs/adr/0003-continue-existing-codebase.md","sha256":"bb96aad899b5fead055495feadc460cc8e9336fb1a967f8b67cb3520b7d4dd4e"},
    {"path":"modules/workflow.md","sha256":"a3905e280fbf3f213975111aa3558718e693027d2ee281ed19a8fdce21b9ac16"},
    {"path":"modules/development-guide.md","sha256":"18e4147f5376883a4a56d017a95c1e432acfe21a595fd82a8605dfd64a49cad4"},
    {"path":"docs/workflows/work-plan-guide.md","sha256":"2019e1faa8b9fc6f3842170c4dc31b564e0da57c7fdf19c6df8d21ce1aa3ae2b"},
    {"path":"docs/artifacts/dvs-resume-audit.html","sha256":"6f26cfe1d101d747b29642faa0ec45d71748809754c67a6321d201bca1e1ed72"},
    {"path":"supabase/migrations/README.md","sha256":"244f4adde22a4d1c8fd65ccee7fcafca7a465157bdff0b0e86d403ce3796f31d"},
    {"path":"supabase/migrations/MIGRATION_GUIDE.md","sha256":"5c4cfb0e3de1aa8e9d2bb27e02093514fd7c3ee3ef242259a7a6486b5511be63"},
    {"path":"RUN_MIGRATIONS.md","sha256":"82521984f52e33307ac2a15289c4c24ab04725d0b1c670bf946e243c201b0142"},
    {"path":"docs/architecture/database-schema.md","sha256":"758f95fca12edf76c9c89ea328aa987a941b52f6c6c6a1c5829c34227133b78f"},
    {"path":"package.json","sha256":"4dee2898f2801d5260a631141804374e583655844360d44eb5a181e8766b2173"},
    {"path":".gitignore","sha256":"6ccff09c2e1089d1f11c7c47c5432af64b59dfc041c928d52b935637c4710b51"},
    {"path":"supabase/migrations/20250124_create_enrollment_tables.sql","sha256":"2ea0cedd58238cfb8ed43ace3d34ff795075345f5d92f88e47da5c14af8a36fc"},
    {"path":"supabase/migrations/20250301_implement_soft_delete.sql","sha256":"98dad3b41ac16a072df802bf67fb89f7eaade1c6ec2d888bacc439f52ffde213"},
    {"path":"migrations/20250222_001_lesson_progress.sql","sha256":"048c37047e31949ce7e1202033f08bf8a5e003b27a61e7180fee993ef8d53db2"},
    {"path":"migrations/20250222_002_functions.sql","sha256":"b34ed072e46c7a3137a2f876e87da52428207a37cb5aee0c4e58817910db0013"}
  ],
  "decisions": [
    "ADR 0003에 따라 existing codebase를 계속 사용하고 production DB를 authoritative source로 취급한다.",
    "현재 executable unit은 read-only evidence tranche 하나이며 legacy SQL을 이동, 삭제, rename, 수정 또는 실행하지 않는다.",
    "remote DB command는 pinned Supabase CLI의 migration list 2회와 default schema-only db dump 2회만 허용한다.",
    "Direct connection을 우선하고 관찰된 IPv6/direct connectivity failure와 explicit host record가 있을 때만 session pooler를 허용하며 transaction pooler는 금지한다.",
    "Raw evidence는 ignored private path에 두고 durable public evidence는 secret-free minimal metadata로 제한한다.",
    "Supabase migration list는 task-owned isolated empty cwd에서만 실행하고 그 output을 remote-only history evidence로 취급한다.",
    "Raw private artifacts는 credential-literal scan을 통과해야 하며 detection 시 task-created raw artifacts만 삭제하고 receipt/review 전에 실패한다.",
    "Default db dump exclusions 때문에 full schema closure는 UNVERIFIED이며 이 tranche에서 baseline이나 Roadmap 완료를 만들지 않는다.",
    "현재 evidence tranche에는 추가 material fork가 없고 이 exact plan의 별도 execution approval만 필요하다."
  ],
  "invariants": [
    "Production schema, data, role, extension, bucket, policy와 migration history는 변경되지 않는다.",
    "DVS_SUPABASE_DB_URL의 실제 값은 저장, 출력 또는 review input에 포함되지 않는다.",
    "두 migration list process cwd는 isolated empty directory이고 remote_reads cwd_class 순서는 isolated-empty, workspace, workspace, isolated-empty다.",
    "Raw private artifacts 8개는 credential literal을 포함하지 않고 receipt safety.raw_secret_scan은 true다.",
    "Combined legacy SQL 72개의 path와 bytes는 실행 전후 동일하다.",
    "기존 unrelated dirty state와 protected canonical files는 실행 전후 동일하다.",
    "Repository dependency, package lockfile와 global Supabase CLI install은 생성 또는 변경되지 않는다.",
    "Long-running local DB stack, dev server 또는 잔존 Docker process를 만들지 않는다.",
    "Review result files는 reviewed targets에서 제외하고 두 reviewer는 worker 및 서로에게서 독립적이다."
  ],
  "tasks": [
    {
      "id": "T001",
      "title": "운영 Supabase baseline evidence를 읽기 전용으로 수집·대조한다",
      "depends_on": [],
      "risk": "high",
      "ownership": [
        "docs/artifacts/supabase-baseline/T001-worktree-before.json",
        "docs/artifacts/supabase-baseline/T001-remote-history-before.txt",
        "docs/artifacts/supabase-baseline/T001-remote-schema-a.sql",
        "docs/artifacts/supabase-baseline/T001-remote-schema-b.sql",
        "docs/artifacts/supabase-baseline/T001-remote-history-after.txt",
        "docs/artifacts/supabase-baseline/T001-local-migrations.json",
        "docs/artifacts/supabase-baseline/T001-reconciliation.json",
        "docs/artifacts/supabase-baseline/T001-worktree-after.json",
        "docs/work-plans/evidence/supabase-migration-baseline/T001-receipt.json",
        "docs/work-plans/evidence/supabase-migration-baseline/T001-intent.json",
        "docs/work-plans/evidence/supabase-migration-baseline/T001-adversarial.json",
        "docs/artifacts/supabase-baseline/T001-cli-workdir"
      ],
      "acceptance": [
        "Sanitized target fingerprint가 project ref datvqaemqzhgitxxfvar와 direct 또는 조건부 session-pooler host class를 증명하고 receipt 및 두 review에 hash로 결속된다.",
        "Supabase CLI 2.118.0과 pinned npm integrity를 npx cache-only 방식으로 확인하고 repository dependency, package lockfile, global install을 변경하지 않는다.",
        "정해진 순서의 exact allowlist remote reads 4개만 exit code 0으로 완료하고 cwd_class 순서는 isolated-empty, workspace, workspace, isolated-empty이며 forbidden command는 실행하지 않는다.",
        "History before/after raw bytes가 같고 schema A/B가 non-empty이며 raw bytes가 같다.",
        "Local manifest가 exactly 72 unique SQL paths와 current SHA256/size를 포함하고 before/after source bytes가 같다.",
        "Reconciliation이 isolated migration-list output을 remote-only evidence로 사용해 local 및 remote entry 전체를 matched, local_unmatched, remote_unmatched, ambiguous로 분류하고 dump exclusions와 UNVERIFIED boundaries를 기록한다.",
        "Raw evidence는 ignored/private이고 credential-literal scan을 통과하며 receipt safety.raw_secret_scan은 true이고 durable evidence는 secret-free/detail-minimal이다.",
        "Source migrations, Roadmap, ADR, docs, package files와 unrelated dirty state가 실행 전후 같다.",
        "Current artifacts를 검토한 distinct non-worker INTENT와 ADVERSARIAL reviewer가 exact seven-field PASS results를 남긴다.",
        "Production mutation과 long-running process가 없고 temporary CLI workdir가 종료 시 absent다."
      ],
      "checks": [
        {
          "argv": [
            "node",
            "-e",
            "const f=require('node:fs'),a=require('node:assert/strict'),B='docs/artifacts/supabase-baseline/',R='docs/work-plans/evidence/supabase-migration-baseline/',r=JSON.parse(f.readFileSync(R+'T001-receipt.json','utf8'));a.deepEqual(r.remote_reads.map(v=>v.cwd_class),['isolated-empty','workspace','workspace','isolated-empty']);a.equal(f.existsSync(B+'T001-cli-workdir'),false);a.equal(r.safety.raw_secret_scan,true);const raw=['T001-worktree-before.json','T001-remote-history-before.txt','T001-remote-schema-a.sql','T001-remote-schema-b.sql','T001-remote-history-after.txt','T001-local-migrations.json','T001-reconciliation.json','T001-worktree-after.json'].map(v=>B+v),p=[/postgres(?:ql)?:\\/\\/[^\\s:@/]+:[^@\\s/]+@/i,/\\bsbp_[A-Za-z0-9_-]{8,}\\b/,/\\beyJ[A-Za-z0-9_-]{5,}\\.[A-Za-z0-9_-]{5,}\\.[A-Za-z0-9_-]{5,}\\b/,/-----BEGIN (?:RSA |EC |OPENSSH |ENCRYPTED )?PRIVATE KEY-----/,/\\b(?:sk_live_|pk_live_|sk-proj-|AIza|AKIA|ASIA|ghp_|github_pat_|xox[baprs]-)[A-Za-z0-9_-]{8,}\\b/,/\\b(?:CREATE|ALTER)\\s+ROLE\\b[\\s\\S]{0,512}?\\bPASSWORD\\s+(?:E)?'[^'\\r\\n]+'/i,/(?:^|[\\s,{(])['\\x22]?(?:secret|token|api_key|password)['\\x22]?\\s*(?:=|:)\\s*['\\x22][^'\\x22\\r\\n]{4,}['\\x22]/im];for(const x of raw){const t=f.readFileSync(x,'utf8');if(p.some(q=>q.test(t)))process.exit(42)}"
          ],
          "cwd": ".",
          "timeout_ms": 30000
        },
        {
          "argv": [
            "node",
            "-e",
            "const f=require('node:fs'),c=require('node:crypto'),a=require('node:assert/strict');const J=p=>JSON.parse(f.readFileSync(p,'utf8')),H=p=>c.createHash('sha256').update(f.readFileSync(p)).digest('hex'),B='docs/artifacts/supabase-baseline/',R='docs/work-plans/evidence/supabase-migration-baseline/';const wb=J(B+'T001-worktree-before.json'),wa=J(B+'T001-worktree-after.json'),m=J(B+'T001-local-migrations.json'),x=J(B+'T001-reconciliation.json'),r=J(R+'T001-receipt.json');for(const k of ['branch','head','unrelated_state','protected_files','local_sql','package_state'])a.deepEqual(wa[k],wb[k]);a.equal(wb.head,'bf53724ceee700e14766dd0b215bbfbec548d07c');a.deepEqual(wa.long_running_processes_started_by_task,[]);a.equal(m.count,72);a.equal(m.files.length,72);const ps=m.files.map(v=>v.path);a.equal(new Set(ps).size,72);a.deepEqual(ps,[...ps].sort());for(const v of m.files){a.match(v.path,/^(supabase\\/migrations|migrations)\\/.+\\.sql$/);a.equal(v.sha256,H(v.path));a.equal(v.size_bytes,f.statSync(v.path).size)}a.deepEqual(m.files,wb.local_sql);a.deepEqual(m.files,wa.local_sql);a.ok(f.statSync(B+'T001-remote-schema-a.sql').size>0);a.equal(H(B+'T001-remote-schema-a.sql'),H(B+'T001-remote-schema-b.sql'));a.equal(H(B+'T001-remote-history-before.txt'),H(B+'T001-remote-history-after.txt'));a.deepEqual(Object.keys(x.classifications).sort(),['ambiguous','local_unmatched','matched','remote_unmatched']);a.equal(x.coverage.local_total,72);a.equal(x.coverage.local_classified,72);a.equal(x.coverage.remote_total,x.coverage.remote_classified);a.equal(x.boundaries.full_schema_closure,'UNVERIFIED');a.equal(r.work_id,'supabase-migration-baseline-evidence');a.equal(r.task_id,'T001');a.equal(r.target_fingerprint.project_ref,'datvqaemqzhgitxxfvar');a.ok(['direct','session-pooler'].includes(r.target_fingerprint.host_class));a.match(r.target_fingerprint.host_record_sha256,/^[a-f0-9]{64}$/);if(r.target_fingerprint.host_class==='session-pooler')a.equal(r.target_fingerprint.direct_failure_observed,true);a.equal(r.toolchain.supabase_cli_version,'2.118.0');a.equal(r.toolchain.npm_integrity,'sha512-0aPIlzBSBLwbJZCMZKD1QAwlc4xNnNvvk07QuSuuKBKzGLSeV3GovgTLlMKFTJ4JWfJubWF0URPLuPUr0kZr5g==');a.equal(r.toolchain.repo_dependency_changed,false);a.equal(r.toolchain.global_install_used,false);const exp=[['migration list','docs/artifacts/supabase-baseline/T001-remote-history-before.txt'],['db dump','docs/artifacts/supabase-baseline/T001-remote-schema-a.sql'],['db dump','docs/artifacts/supabase-baseline/T001-remote-schema-b.sql'],['migration list','docs/artifacts/supabase-baseline/T001-remote-history-after.txt']];a.equal(r.remote_reads.length,4);r.remote_reads.forEach((v,i)=>{a.equal(v.sequence,i+1);a.equal(v.operation,exp[i][0]);a.equal(v.artifact,exp[i][1]);a.equal(v.exit_code,0);a.ok(v.argv.includes('<DVS_SUPABASE_DB_URL>'))});const raw=['T001-worktree-before.json','T001-remote-history-before.txt','T001-remote-schema-a.sql','T001-remote-schema-b.sql','T001-remote-history-after.txt','T001-local-migrations.json','T001-reconciliation.json','T001-worktree-after.json'].map(v=>B+v);a.deepEqual(r.evidence.map(v=>v.path),raw);for(const v of r.evidence){a.equal(v.sha256,H(v.path));a.equal(v.size_bytes,f.statSync(v.path).size)}a.equal(r.comparisons.history_equal,true);a.equal(r.comparisons.schema_equal,true);a.equal(r.comparisons.source_bytes_unchanged,true);a.equal(r.comparisons.unrelated_state_unchanged,true);a.equal(r.safety.production_mutation,false);a.equal(r.safety.long_running_process,false);a.deepEqual(r.safety.forbidden_commands,[])"
          ],
          "cwd": ".",
          "timeout_ms": 30000
        },
        {
          "argv": [
            "node",
            "-e",
            "const f=require('node:fs'),p=require('node:child_process'),a=require('node:assert/strict');const base='docs/artifacts/supabase-baseline/',rp='docs/work-plans/evidence/supabase-migration-baseline/T001-receipt.json',r=JSON.parse(f.readFileSync(rp,'utf8')),keys=['schema_version','work_id','task_id','attempt','executor_id','target_fingerprint','toolchain','remote_reads','evidence','comparisons','classification_counts','boundaries','safety'];a.deepEqual(Object.keys(r).sort(),keys.sort());const raw=['T001-worktree-before.json','T001-remote-history-before.txt','T001-remote-schema-a.sql','T001-remote-schema-b.sql','T001-remote-history-after.txt','T001-local-migrations.json','T001-reconciliation.json','T001-worktree-after.json'].map(v=>base+v);for(const v of raw)a.equal(p.spawnSync('git',['check-ignore','--no-index','-q','--',v],{cwd:'.'}).status,0);const t=f.readFileSync(rp,'utf8'),s=t.replaceAll('<DVS_SUPABASE_DB_URL>','');a.doesNotMatch(s,/(postgres(?:ql)?:\\/\\/|password|service[_-]?role|anon[_-]?key|sbp_[A-Za-z0-9]|eyJ[A-Za-z0-9_-]{16})/i);const all=r.remote_reads.flatMap(v=>v.argv).join(' ').toLowerCase();for(const q of ['db pull','db diff','db push','migration repair','db reset','migration up','migration down','migration squash','psql','--data-only','--role-only'])a.equal(all.includes(q),false);for(const v of r.remote_reads){a.deepEqual(v.argv.slice(0,3),['npx','--yes','supabase@2.118.0']);a.equal(v.argv.filter(x=>x==='<DVS_SUPABASE_DB_URL>').length,1)}"
          ],
          "cwd": ".",
          "timeout_ms": 30000
        },
        {
          "argv": [
            "git",
            "diff",
            "--exit-code",
            "--",
            "docs/ROADMAP.md",
            "docs/adr/0003-continue-existing-codebase.md",
            "modules/workflow.md",
            "modules/development-guide.md",
            "docs/workflows/work-plan-guide.md",
            "docs/artifacts/dvs-resume-audit.html",
            "supabase/migrations",
            "migrations",
            "RUN_MIGRATIONS.md",
            "docs/architecture/database-schema.md",
            "package.json",
            "package-lock.json",
            "npm-shrinkwrap.json",
            ".gitignore"
          ],
          "cwd": ".",
          "timeout_ms": 30000
        }
      ],
      "artifacts": [
        "docs/artifacts/supabase-baseline/T001-worktree-before.json",
        "docs/artifacts/supabase-baseline/T001-remote-history-before.txt",
        "docs/artifacts/supabase-baseline/T001-remote-schema-a.sql",
        "docs/artifacts/supabase-baseline/T001-remote-schema-b.sql",
        "docs/artifacts/supabase-baseline/T001-remote-history-after.txt",
        "docs/artifacts/supabase-baseline/T001-local-migrations.json",
        "docs/artifacts/supabase-baseline/T001-reconciliation.json",
        "docs/artifacts/supabase-baseline/T001-worktree-after.json",
        "docs/work-plans/evidence/supabase-migration-baseline/T001-receipt.json",
        "docs/work-plans/evidence/supabase-migration-baseline/T001-intent.json",
        "docs/work-plans/evidence/supabase-migration-baseline/T001-adversarial.json"
      ]
    }
  ],
  "final_checks": [
    {
      "argv": [
        "node",
        "-e",
        "const f=require('node:fs'),a=require('node:assert/strict'),B='docs/artifacts/supabase-baseline/',R='docs/work-plans/evidence/supabase-migration-baseline/',r=JSON.parse(f.readFileSync(R+'T001-receipt.json','utf8'));a.deepEqual(r.remote_reads.map(v=>v.cwd_class),['isolated-empty','workspace','workspace','isolated-empty']);a.equal(f.existsSync(B+'T001-cli-workdir'),false);a.equal(r.safety.raw_secret_scan,true);const raw=['T001-worktree-before.json','T001-remote-history-before.txt','T001-remote-schema-a.sql','T001-remote-schema-b.sql','T001-remote-history-after.txt','T001-local-migrations.json','T001-reconciliation.json','T001-worktree-after.json'].map(v=>B+v),p=[/postgres(?:ql)?:\\/\\/[^\\s:@/]+:[^@\\s/]+@/i,/\\bsbp_[A-Za-z0-9_-]{8,}\\b/,/\\beyJ[A-Za-z0-9_-]{5,}\\.[A-Za-z0-9_-]{5,}\\.[A-Za-z0-9_-]{5,}\\b/,/-----BEGIN (?:RSA |EC |OPENSSH |ENCRYPTED )?PRIVATE KEY-----/,/\\b(?:sk_live_|pk_live_|sk-proj-|AIza|AKIA|ASIA|ghp_|github_pat_|xox[baprs]-)[A-Za-z0-9_-]{8,}\\b/,/\\b(?:CREATE|ALTER)\\s+ROLE\\b[\\s\\S]{0,512}?\\bPASSWORD\\s+(?:E)?'[^'\\r\\n]+'/i,/(?:^|[\\s,{(])['\\x22]?(?:secret|token|api_key|password)['\\x22]?\\s*(?:=|:)\\s*['\\x22][^'\\x22\\r\\n]{4,}['\\x22]/im];for(const x of raw){const t=f.readFileSync(x,'utf8');if(p.some(q=>q.test(t)))process.exit(42)}"
      ],
      "cwd": ".",
      "timeout_ms": 30000
    },
    {
      "argv": [
        "node",
        "-e",
        "const f=require('node:fs'),c=require('node:crypto'),a=require('node:assert/strict');const H=p=>c.createHash('sha256').update(f.readFileSync(p)).digest('hex'),E={'session.md':'c08abdd620c142d0319b832e13f84891b1165d7e209576434793e06d41fd2ceb','docs/ROADMAP.md':'ef576eadb56ed19276bd8445648df8172e341dea240916da48eba526a6ecb7a0','docs/adr/0003-continue-existing-codebase.md':'bb96aad899b5fead055495feadc460cc8e9336fb1a967f8b67cb3520b7d4dd4e','modules/workflow.md':'a3905e280fbf3f213975111aa3558718e693027d2ee281ed19a8fdce21b9ac16','modules/development-guide.md':'18e4147f5376883a4a56d017a95c1e432acfe21a595fd82a8605dfd64a49cad4','docs/workflows/work-plan-guide.md':'2019e1faa8b9fc6f3842170c4dc31b564e0da57c7fdf19c6df8d21ce1aa3ae2b','docs/artifacts/dvs-resume-audit.html':'6f26cfe1d101d747b29642faa0ec45d71748809754c67a6321d201bca1e1ed72','supabase/migrations/README.md':'244f4adde22a4d1c8fd65ccee7fcafca7a465157bdff0b0e86d403ce3796f31d','supabase/migrations/MIGRATION_GUIDE.md':'5c4cfb0e3de1aa8e9d2bb27e02093514fd7c3ee3ef242259a7a6486b5511be63','RUN_MIGRATIONS.md':'82521984f52e33307ac2a15289c4c24ab04725d0b1c670bf946e243c201b0142','docs/architecture/database-schema.md':'758f95fca12edf76c9c89ea328aa987a941b52f6c6c6a1c5829c34227133b78f','package.json':'4dee2898f2801d5260a631141804374e583655844360d44eb5a181e8766b2173','.gitignore':'6ccff09c2e1089d1f11c7c47c5432af64b59dfc041c928d52b935637c4710b51','supabase/migrations/20250124_create_enrollment_tables.sql':'2ea0cedd58238cfb8ed43ace3d34ff795075345f5d92f88e47da5c14af8a36fc','supabase/migrations/20250301_implement_soft_delete.sql':'98dad3b41ac16a072df802bf67fb89f7eaade1c6ec2d888bacc439f52ffde213','migrations/20250222_001_lesson_progress.sql':'048c37047e31949ce7e1202033f08bf8a5e003b27a61e7180fee993ef8d53db2','migrations/20250222_002_functions.sql':'b34ed072e46c7a3137a2f876e87da52428207a37cb5aee0c4e58817910db0013'};for(const [p,h] of Object.entries(E))a.equal(H(p),h)"
      ],
      "cwd": ".",
      "timeout_ms": 30000
    },
    {
      "argv": [
        "node",
        "-e",
        "const f=require('node:fs'),c=require('node:crypto'),a=require('node:assert/strict');const J=p=>JSON.parse(f.readFileSync(p,'utf8')),H=p=>c.createHash('sha256').update(f.readFileSync(p)).digest('hex'),B='docs/artifacts/supabase-baseline/',R='docs/work-plans/evidence/supabase-migration-baseline/';const wb=J(B+'T001-worktree-before.json'),wa=J(B+'T001-worktree-after.json'),m=J(B+'T001-local-migrations.json'),x=J(B+'T001-reconciliation.json'),r=J(R+'T001-receipt.json');for(const k of ['branch','head','unrelated_state','protected_files','local_sql','package_state'])a.deepEqual(wa[k],wb[k]);a.equal(wb.head,'bf53724ceee700e14766dd0b215bbfbec548d07c');a.deepEqual(wa.long_running_processes_started_by_task,[]);a.equal(m.count,72);a.equal(m.files.length,72);const ps=m.files.map(v=>v.path);a.equal(new Set(ps).size,72);a.deepEqual(ps,[...ps].sort());for(const v of m.files){a.equal(v.sha256,H(v.path));a.equal(v.size_bytes,f.statSync(v.path).size)}a.deepEqual(m.files,wb.local_sql);a.deepEqual(m.files,wa.local_sql);a.ok(f.statSync(B+'T001-remote-schema-a.sql').size>0);a.equal(H(B+'T001-remote-schema-a.sql'),H(B+'T001-remote-schema-b.sql'));a.equal(H(B+'T001-remote-history-before.txt'),H(B+'T001-remote-history-after.txt'));a.equal(x.coverage.local_total,72);a.equal(x.coverage.local_classified,72);a.equal(x.coverage.remote_total,x.coverage.remote_classified);a.equal(x.boundaries.full_schema_closure,'UNVERIFIED');a.equal(r.target_fingerprint.project_ref,'datvqaemqzhgitxxfvar');a.ok(['direct','session-pooler'].includes(r.target_fingerprint.host_class));a.match(r.target_fingerprint.host_record_sha256,/^[a-f0-9]{64}$/);a.equal(r.remote_reads.length,4);r.remote_reads.forEach((v,i)=>{a.equal(v.sequence,i+1);a.equal(v.exit_code,0);a.ok(v.argv.includes('<DVS_SUPABASE_DB_URL>'))});const raw=['T001-worktree-before.json','T001-remote-history-before.txt','T001-remote-schema-a.sql','T001-remote-schema-b.sql','T001-remote-history-after.txt','T001-local-migrations.json','T001-reconciliation.json','T001-worktree-after.json'].map(v=>B+v);a.deepEqual(r.evidence.map(v=>v.path),raw);for(const v of r.evidence){a.equal(v.sha256,H(v.path));a.equal(v.size_bytes,f.statSync(v.path).size)}a.equal(r.comparisons.history_equal,true);a.equal(r.comparisons.schema_equal,true);a.equal(r.comparisons.source_bytes_unchanged,true);a.equal(r.comparisons.unrelated_state_unchanged,true);a.equal(r.safety.production_mutation,false);a.equal(r.safety.long_running_process,false);a.deepEqual(r.safety.forbidden_commands,[])"
      ],
      "cwd": ".",
      "timeout_ms": 30000
    },
    {
      "argv": [
        "node",
        "-e",
        "const f=require('node:fs'),c=require('node:crypto'),p=require('node:child_process'),a=require('node:assert/strict');const H=x=>c.createHash('sha256').update(f.readFileSync(x)).digest('hex'),J=x=>JSON.parse(f.readFileSync(x,'utf8')),B='docs/artifacts/supabase-baseline/',R='docs/work-plans/evidence/supabase-migration-baseline/',receipt=R+'T001-receipt.json',r=J(receipt),targets=['T001-worktree-before.json','T001-remote-history-before.txt','T001-remote-schema-a.sql','T001-remote-schema-b.sql','T001-remote-history-after.txt','T001-local-migrations.json','T001-reconciliation.json','T001-worktree-after.json'].map(v=>B+v).concat(receipt),K=['work_id','task_id','attempt','axis','reviewer_id','reviewed_artifacts','verdict'].sort();for(const v of targets.slice(0,8))a.equal(p.spawnSync('git',['check-ignore','--no-index','-q','--',v],{cwd:'.'}).status,0);const reviews=[J(R+'T001-intent.json'),J(R+'T001-adversarial.json')];a.notEqual(reviews[0].reviewer_id,reviews[1].reviewer_id);for(let i=0;i<2;i++){const v=reviews[i],axis=i===0?'INTENT':'ADVERSARIAL';a.deepEqual(Object.keys(v).sort(),K);a.equal(v.work_id,'supabase-migration-baseline-evidence');a.equal(v.task_id,'T001');a.equal(v.attempt,r.attempt);a.equal(v.axis,axis);a.equal(v.verdict,axis+'_PASS');a.notEqual(v.reviewer_id,r.executor_id);a.deepEqual(v.reviewed_artifacts.map(z=>z.path).sort(),[...targets].sort());for(const z of v.reviewed_artifacts)a.equal(z.sha256,H(z.path))}const pub=[receipt,R+'T001-intent.json',R+'T001-adversarial.json'].map(x=>f.readFileSync(x,'utf8')).join('\\n').replaceAll('<DVS_SUPABASE_DB_URL>','');a.doesNotMatch(pub,/(postgres(?:ql)?:\\/\\/|password|service[_-]?role|anon[_-]?key|sbp_[A-Za-z0-9]|eyJ[A-Za-z0-9_-]{16})/i)"
      ],
      "cwd": ".",
      "timeout_ms": 30000
    },
    {
      "argv": [
        "git",
        "diff",
        "--exit-code",
        "--",
        "docs/ROADMAP.md",
        "docs/adr/0003-continue-existing-codebase.md",
        "modules/workflow.md",
        "modules/development-guide.md",
        "docs/workflows/work-plan-guide.md",
        "docs/artifacts/dvs-resume-audit.html",
        "supabase/migrations",
        "migrations",
        "RUN_MIGRATIONS.md",
        "docs/architecture/database-schema.md",
        "package.json",
        "package-lock.json",
        "npm-shrinkwrap.json",
        ".gitignore"
      ],
      "cwd": ".",
      "timeout_ms": 30000
    }
  ],
  "retry_limit": 2,
  "retry_policy": {
    "build_limit": 3,
    "intent_limit": 2,
    "intent_requires_user": true
  }
}
```

## Final Verification

Host는 task checks가 통과한 뒤 위 Host-Owned OMO Runtime Review Binding 절차로 actual worker terminal state, current attempt, actual reviewer terminal observations와 artifacts 1-9 current hashes를 결속한다. T001 `verify` PASS와 `FINAL_VERIFICATION_REQUIRED`를 관찰한 뒤에만 FINAL host review input을 만들고 `verify --task FINAL`을 실행한다. 성공 조건은 다음과 같다.

1. Workflow observations의 current SHA256가 계획 입력과 모두 일치한다.
2. Four-read bracketing이 history equality와 schema equality를 동시에 증명하고, history reads의 cwd class가 `isolated-empty`이며, migration-list output은 remote-only evidence로 72-file manifest와 reconciliation coverage에 대조된다.
3. Private raw evidence ignore와 credential-literal scan, `safety.raw_secret_scan=true`, public evidence secret scan, receipt-to-review current hash binding, exact seven-field review shape, distinct reviewer identity와 runtime worker independence가 모두 통과한다.
4. Protected Git diff는 비어 있고 before/after unrelated state가 동일하며, task가 시작한 long-running process와 `T001-cli-workdir`가 남아 있지 않다.
5. INTENT와 ADVERSARIAL verdict가 각각 `INTENT_PASS`, `ADVERSARIAL_PASS`다. Review FAIL이나 runtime binding failure는 사용자 개입이 필요한 intent failure로 처리한다.
6. Runtime task verification은 T001 `COMPLETE`와 `FINAL_VERIFICATION_REQUIRED`를 반환하고, runtime final verification은 workflow `COMPLETE`, `reason=null`, 모든 final check PASS를 반환한다. `.omo` host input/runtime files는 task artifact나 reviewer evidence에 포함되지 않는다.

구체적 counterexample gate는 세 가지다. 첫째, 모든 file/hash check가 통과해도 다른 Supabase project를 읽었다면 실패다. Receipt의 sanitized target fingerprint와 그 receipt hash를 포함한 두 review로 이를 막는다. 둘째, migration history가 안정적이어도 history에 기록되지 않은 schema drift가 있을 수 있다. history before/after 사이에서 schema A/B를 두 번 수집해 raw bytes equality를 요구하며, dump nondeterminism으로 equality를 얻지 못하면 실패·refinement하고 대체 비교로 우회하지 않는다. 셋째, legacy repository cwd에서 `migration list`를 실행하면 invalid filename skip과 duplicate version 허용 때문에 remote history evidence가 local state에 의해 왜곡될 수 있다. 두 history read를 exact empty isolated cwd에 고정하고 receipt cwd class와 final directory absence로 이를 막는다.

이 Final Verification은 default dump가 제외한 managed `auth`/`storage`, data, custom roles의 closure를 증명하지 않는다. 그 범위는 계속 `UNVERIFIED`다. 성공해도 baseline file을 만들거나 Roadmap T3를 완료 처리하지 않는다.

## Later Work — Non-Executable Skeleton

다음 unit들은 이 plan의 executable task set에 포함되지 않으며, T001 receipt와 reviews가 실제로 존재한 뒤 별도 Work Plan으로 refinement하고 새 execution approval을 받아야 한다.

- Baseline construction unit: verified schema scope와 exclusions를 결정하고 canonical baseline artifact 형식, legacy-byte preservation 방식, archive ownership을 확정한다.
- Legacy archive unit: 72 SQL의 immutable manifest를 기준으로 move/archive mapping과 reversible recovery를 설계한다. 현재 path를 변경하기 전 별도 승인과 collision 검사가 필요하다.
- Local rebuild unit: 새 baseline에서 빈 local DB를 재구축하는 검증을 설계한다. local stack 기동과 destructive local-only guard는 별도 approval 대상이다.
- Remote history alignment unit: production migration history와 새 baseline의 관계를 결정한다. `migration repair` 등 remote mutation은 새 high-risk plan, exact target 재검증, recovery decision과 별도 승인이 없으면 실행하지 않는다.
- Completion unit: 모든 후속 evidence가 닫힌 뒤에만 `session.md`, Product Roadmap T3 progress/completion, commit, push, PR 필요 여부를 각각 승인된 scope로 다룬다.
