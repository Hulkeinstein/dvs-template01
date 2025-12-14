# Assignment System Completion - Work Plan

**Status**: Active
**Created**: 2025-12-14
**Issue**: #10

---

## 남은 작업 정리

### 1. assignment-modal-improvements.md

| Phase | 상태 | 설명 |
|-------|------|------|
| P0 | ✅ 완료 | QuillWrapper, 자동저장 UI, 디버그 패널 |
| P1 | ✅ 완료 | Static Backdrop 모든 모달 적용 |
| P2 | ✅ 완료 | AssignmentLesson 타입 통일, 저장 버그 수정 |
| **P3** | ⏳ 미완료 | `prompt()` 제거 → 인라인 템플릿 이름 입력 UI |

**남은 작업**: P3 (템플릿 팝업 개선) - "별도 브랜치로 분리 가능" 언급됨

---

### 2. assignment-template-system.md

| Phase | 상태 | 설명 |
|-------|------|------|
| P0 | ✅ 완료 | DB 스키마, RLS, 인덱스 |
| P1 | ✅ 완료 | UNIQUE 제약조건 |
| P2 | ✅ 완료 | Server Actions (CRUD, Zod) |
| P3-1 | ✅ 완료 | Rollback Checkpoint |
| **P3-2** | ⏳ 미완료 | AssignmentModal.js → .tsx 변환 |
| **P3-3** | ⏳ 미완료 | 템플릿 저장 UI/로직 |
| **P4** | ⏳ 미완료 | 템플릿 불러오기 기능 |
| **P5** | ⏳ 미완료 | 테스트 및 Library 문서화 |

**남은 작업**: P3-2 ~ P5 (TypeScript 변환, UI 구현, 테스트)

---

## 요약

| Work Plan | 완료율 | 남은 작업량 |
|-----------|--------|-------------|
| assignment-modal-improvements | 66% (P0-P2/P3) | 1 Phase |
| assignment-template-system | 40% (P0-P3.1/P5) | 4 Phases |
