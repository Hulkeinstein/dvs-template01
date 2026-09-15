---
title: "T1. 저장소 위생·CI 복구 Work Plan"
tags:
  - type/docs
  - progress/in-progress
created: 2026-09-16
updated: 2026-09-16
lifecycle: draft
related:
  - ../ROADMAP.md
  - ../adr/0003-continue-existing-codebase.md
---

# T1. 저장소 위생·CI 복구 - Work Plan

**Status**: Active (승인 대기)
**Created**: 2026-09-16
**Last Updated**: 2026-09-16
**Branch**: `chore/repo-hygiene-ci`

---

## Overview

**목표**: 저장소를 새로 받아도 가짜 변경이 없고, main에 대한 PR에서 CI Checks가 통과한다

**변경 규모**: 줄바꿈 정규화 138 파일(내용 변경 0) + 서식 37 파일 + 추적 해제·삭제 약 10 파일 + 의존성 2개 패치 버전 + 문서 3개

**복잡도**: Standard (medium) · 보안·비가역 요소 없음

**배경**:

- 커밋된 파일 138개가 CRLF인데 `.gitattributes`는 LF를 요구해서, 새로 받으면 108개가 수정됨으로 보인다
- CI Checks는 Prettier 단계(37 파일)에서 멈춰, 그 뒤의 build·test 단계가 수개월간 실행되지 않았다
- 빌드 로그, tsbuildinfo, Supabase CLI 캐시가 추적되고 있다
- Next.js 14.2.32 → 14.2.35에서 알려진 취약점 일부가 수정됐다 (14.x 안의 최신 패치)

## Success Criteria (DoD)

1. 새로 clone한 저장소에서 `git status`의 수정된 파일이 0개다
2. PR의 CI Checks job(type-check · lint · format:check · guards · build · test:ci)이 통과한다
3. `build_log.txt`, `tsconfig.tsbuildinfo`, `supabase/.temp/`가 추적 해제되고 `.gitignore`에 있다. `check_quiz.sql`은 삭제된다
4. `next` 14.2.35, `next-auth` 4.24.15로 올린 뒤 로컬 type-check · lint · test가 통과한다
5. 구현이 끝난 work-plan 2개(`youtube-ai-summarization.md`, `youtube-description-fetching.md`)가 삭제된다

**범위 밖**: Docs Validation 복구(T6), 데모 삭제(T2), 인가(T4), Next 15 전환(T5), `npm test`의 Windows 호환

---

## Phases

- [x] **P0: 기준값 기록** (CRLF 수, Prettier 목록, 로컬 검사 결과)
- [x] **P1: 줄바꿈 정규화** (단독 커밋)
- [ ] **P2: 추적 산출물 정리**
- [ ] **P3: 서식 정리** (단독 커밋)
- [ ] **P4: Next·NextAuth 패치 버전**
- [ ] **P5: PR과 CI 확인**
- [ ] **P6: 문서 정리** (완료 work-plan 삭제, 로드맵 갱신, 이 plan 삭제)

---

## Phase Details

### P0: 기준값 기록

- [x] `git ls-files --eol | grep -c i/crlf` = 138 확인
- [x] `npx prettier --check .` 경고 파일 37개 목록 저장
- [x] 로컬 `tsc --noEmit` · `eslint .` · jest 결과 기록 — 오류 0 · 경고 167 · 17 묶음 133개 통과

### P1: 줄바꿈 정규화

- [x] `git add --renormalize .` 후 이 변경만 커밋 — 138 파일
- [x] 검증: 내용 변경 0 (`--ignore-cr-at-eol` 기준), 이진 파일 0, 색인의 CRLF 138 → 0
- [x] 검증: 작업 트리 수정 파일 0개 (새 clone 확인은 P5에서)

### P2: 추적 산출물 정리

- [ ] `git rm --cached build_log.txt tsconfig.tsbuildinfo` 및 `supabase/.temp/`
- [ ] `.gitignore`에 `build_log.txt`, `supabase/.temp/` 추가 (`tsconfig.tsbuildinfo`는 이미 있음)
- [ ] `check_quiz.sql` 삭제 (참조 0건 확인됨)

### P3: 서식 정리

- [ ] P0 목록 37개에만 `prettier --write` 적용 후 이 변경만 커밋
- [ ] 검증: `git diff -w`로 공백 외 변경이 서식 규칙(따옴표·줄바꿈·쉼표)뿐인지 확인
- [ ] 검증: type-check · lint · jest 결과가 P0와 같다

### P4: Next·NextAuth 패치 버전

- [ ] `npm install next@14.2.35 next-auth@4.24.15` (package.json 범위 표기 유지)
- [ ] 검증: type-check · lint · jest 통과, `npm audit` 수 기록(참고용)

### P5: PR과 CI 확인

- [ ] PR 생성 → CI Checks 결과 확인
- [ ] build·test 단계가 실패하면 원인을 기록하고, T1 범위(설정·위생) 안이면 고치고 밖이면 멈추고 보고한다

### P6: 문서 정리

- [ ] `docs/work-plans/youtube-ai-summarization.md`, `docs/work-plans/youtube-description-fetching.md` 삭제 (구현 확인: `lilys-summary.md`, `youtubeActions.ts`의 description 처리)
- [ ] `docs/ROADMAP.md` T1 상태 갱신
- [ ] 완료 시 이 plan 삭제

---

## Decisions Log

- **D1**: 줄바꿈 정규화와 서식 정리는 각각 단독 커밋으로 둔다 — 내용 변경 커밋과 섞이면 리뷰가 불가능해진다
- **D2**: `progress.json`은 유지한다 — `.claude/agents/typescript-migrator.md`가 참조한다. `check_quiz.sql`은 참조가 없어 삭제한다
- **D3**: Docs Validation(문서 lint 62 파일 2311건, front-matter 실패 32건)은 T6로 분리한다 — 규모가 커서 T1 리뷰를 흐린다
- **D4**: Next는 14.x 최신 패치까지만 올린다 — 메이저 전환은 T5

## Risks & Mitigation

| 리스크 | 완화 |
|--------|------|
| CI의 build·test 단계가 수개월간 실행되지 않아 새 실패가 나올 수 있다 | P5에서 원인 기록, 범위 밖이면 멈추고 보고 |
| 줄바꿈 정규화 커밋이 `git blame`을 흐린다 | 단독 커밋으로 두고 커밋 메시지에 명시 |
| 서식 정리가 제품 코드 파일을 건드린다 | 서식 규칙 외 변경 없음을 diff와 검사로 확인 |
| 로컬 빌드는 Google 글꼴 다운로드가 끊겨 실패한 적이 있다 | 빌드 검증은 CI(ubuntu) 결과를 기준으로 한다 |

## Verification

- Tier 1(기계): 각 Phase 뒤 type-check · lint · jest, P5에서 CI Checks 전체
- Tier 2(의도): 완료 후 validator-agent로 DoD 5개 대조 (변경 100줄 이상)
