# Session

## 지금 작업

**Goal**: T001 증빙을 바탕으로 로드맵 T3의 기준선 전환 계획(Baseline construction unit)을 세우고 사용자 승인을 받는다

**DoD 요지**:

- `readonly_user`로 migration 이력 읽기와 스키마 백업이 되는지 확인하고, 부족한 권한만 추가한다
- 기준선 범위·제외 목록·산출물 형식·legacy SQL 보존 방식이 정해진 Work Plan이 승인된다
- 인계 문서의 검토 지적 6개가 계획에 반영된다

**현재 위치**: 운영 DB 읽기 전용 증빙(T001)은 완료됐다. 운영 이력 4건과 저장소 SQL 72개 중 번호 일치 0개이며, 운영 스키마가 기준의 원천이다. 운영 DB를 바꾸는 단계는 아직 없다.

**선결**: 운영 DB 접속 주소를 세션 시작 전에 환경변수로 넣고(채팅·`.env` 본문 금지), Docker Desktop을 켜 둔다. 이 브랜치는 머지되지 않은 HiStudy 브랜치 위에 쌓여 있다.

**근거**: `docs/work-plans/handoff/2026-09-29-supabase-baseline-evidence.md` · `docs/work-plans/supabase-migration-baseline.md` Later Work 절 · `docs/adr/0003-continue-existing-codebase.md`
