# Integrations Registry

**목적**: 프로젝트에서 사용 중인 모든 외부 도구/서비스의 버전, 오너, 상태를 한눈에 파악

---

## 📋 도구 목록

| 도구 | 버전 | 상태 | 오너 | 문서 | 업데이트 |
|------|------|------|------|------|----------|
| **MCP (Model Context Protocol)** | supabase-dvs, chrome, filesystem, shadcn | 🟢 Active | @dev-team | [mcp.md](./mcp.md) | 2025-10-01 |
| **Stripe** | API v2023-10-16 | 🟢 Active | @dev-team | [stripe.md](./stripe.md) | 2025-10-01 |
| **Supabase** | PostgreSQL 15.x | 🟢 Active | @dev-team | [supabase.md](./supabase.md) | 2025-10-01 |
| **NextAuth.js** | v4.24.x | 🟢 Active | @dev-team | - | 2025-10-01 |
| **Resend** | v1.x | 🟢 Active | @dev-team | - | 2025-10-01 |
| **Vercel** | Platform | 🟢 Active | @dev-team | - | 2025-10-01 |

---

## 🔑 상태 코드

- 🟢 **Active**: 프로덕션 사용 중
- 🟡 **Beta**: 테스트 중
- 🔴 **Deprecated**: 단계적 폐기 예정
- ⚫ **Sunset**: 더 이상 사용 안 함

---

## 📝 추가 규칙

### 새 도구 추가 시
1. 이 Registry에 항목 추가
2. `external-services/<tool>.md` 문서 생성 (템플릿 사용)
3. PR에 "New Integration: <tool>" 라벨 추가

### 버전 업데이트 시
1. Registry 버전 컬럼 업데이트
2. 해당 도구 문서의 CHANGELOG 섹션 업데이트
3. 주요 변경사항은 `troubleshooting/` 런북 추가 고려

### 폐기(Sunset) 절차
1. 상태를 🔴 Deprecated로 변경 + 폐기 예정일 명시
2. 마이그레이션 가이드 작성
3. 완전 제거 후 상태를 ⚫ Sunset으로 변경 (6개월 후 Registry에서 삭제)

---

## 🔗 관련 문서

- 전체 워크플로우: [../CLAUDE.md](../CLAUDE.md)
- 시스템 구조: [../architecture/system-design.md](../architecture/system-design.md)

---

**마지막 업데이트**: 2025-10-01
