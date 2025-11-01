# MCP (Model Context Protocol) Integration Guide

## Purpose & Scope

MCP는 Claude Code가 Supabase, Chrome, Filesystem 등의 도구와 통신하기 위한 프로토콜입니다.
현재 프로젝트에서 사용 중인 MCP 서버:
- **supabase-dvs**: 데이터베이스 쿼리, 마이그레이션, 로그 조회
- **chrome**: 브라우저 자동화, 스크린샷, 스냅샷
- **filesystem**: 파일 읽기/쓰기, 디렉토리 탐색
- **shadcn**: UI 컴포넌트 레지스트리 검색

---

## Versions & Ownership

| 항목 | 값 |
|------|-----|
| **MCP Protocol** | v1.0 |
| **supabase-dvs** | Latest (npx) |
| **Owners** | @dev-team |
| **Last Updated** | 2025-10-01 |

---

## Setup / Config

### 1. MCP 서버 설치 확인

Claude Code는 MCP 서버를 자동으로 관리합니다. 설치 상태 확인:

```bash
# Claude Code 설정 확인
claude config get mcp
```

### 2. Supabase MCP 서버 설정

**환경변수** (`.env.local`):
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # 서버 전용
```

**MCP 명령어 예시**:
```typescript
// Supabase 테이블 조회
mcp__supabase-dvs__execute_sql({
  query: "SELECT * FROM courses WHERE is_public = true"
});

// 마이그레이션 적용
mcp__supabase-dvs__apply_migration({
  name: "add_stripe_fields",
  query: "ALTER TABLE orders ADD COLUMN stripe_session_id TEXT;"
});
```

### 3. 권한 설정

MCP 서버는 다음 권한이 필요합니다:
- **supabase-dvs**: `SUPABASE_SERVICE_ROLE_KEY` (전체 DB 접근)
- **filesystem**: 프로젝트 루트 디렉토리 읽기/쓰기
- **chrome**: 로컬 Chrome 프로세스 제어

---

## Usage

### Supabase MCP - 일반 워크플로우

#### 1. **테이블 조회**
```typescript
// 공개 코스 목록
const { data } = await mcp__supabase-dvs__execute_sql({
  query: `
    SELECT id, title, is_free
    FROM courses
    WHERE is_public = true AND status = 'published'
  `
});
```

#### 2. **마이그레이션 적용**
```typescript
// SQL 파일 내용 실행
await mcp__supabase-dvs__apply_migration({
  name: "stripe_integration",
  query: `
    CREATE TABLE IF NOT EXISTS order_events (
      id BIGSERIAL PRIMARY KEY,
      stripe_event_id TEXT UNIQUE NOT NULL,
      order_id UUID NOT NULL REFERENCES orders(id)
    );
  `
});
```

#### 3. **로그 조회** (디버깅)
```typescript
// API 로그 확인 (최근 1분)
const logs = await mcp__supabase-dvs__get_logs({
  service: "api"
});
```

### Chrome MCP - 브라우저 자동화

```typescript
// 페이지 스냅샷
await mcp__chrome__take_snapshot();

// 스크린샷
await mcp__chrome__take_screenshot({
  format: "png",
  fullPage: true
});
```

### Filesystem MCP - 파일 작업

```typescript
// 파일 읽기
const content = await mcp__filesystem__read_text_file({
  path: "/path/to/file.md"
});

// 파일 쓰기
await mcp__filesystem__write_file({
  path: "/path/to/new-file.md",
  content: "# Title\n\nContent"
});
```

---

## Security & Compliance

### 🔒 보안 원칙

1. **Service Role Key 보호**
   - `.env.local`에만 저장 (Git에 커밋 금지)
   - 클라이언트 코드에서 절대 사용 금지
   - MCP 서버는 서버 측에서만 실행

2. **쿼리 검증**
   - 사용자 입력은 파라미터 바인딩 사용
   - SQL Injection 방지

3. **권한 최소화**
   - 읽기 전용 작업은 `ANON_KEY` 사용
   - 쓰기 작업만 `SERVICE_ROLE_KEY` 사용

### 키 회전 정책

- **분기별**: Service Role Key 재생성 권장
- **유출 의심 시**: 즉시 키 폐기 및 재생성

---

## Runbooks

### 문제: MCP 서버 연결 실패

**증상**:
```
Error: Could not connect to MCP server supabase-dvs
```

**해결**:
1. 환경변수 확인:
   ```bash
   echo $NEXT_PUBLIC_SUPABASE_URL
   echo $SUPABASE_SERVICE_ROLE_KEY
   ```

2. MCP 서버 재시작:
   ```bash
   # Claude Code 재시작
   ```

3. 네트워크 확인:
   ```bash
   curl https://your-project.supabase.co/rest/v1/
   ```

### 문제: 권한 오류 (Permission Denied)

**증상**:
```
Error: permission denied for table orders
```

**해결**:
1. **RLS 정책 확인**:
   ```sql
   -- Supabase Dashboard > Authentication > Policies
   SELECT * FROM pg_policies WHERE tablename = 'orders';
   ```

2. **Service Role Key 사용 확인**:
   - MCP는 자동으로 `SERVICE_ROLE_KEY` 사용
   - 직접 쿼리 시 올바른 클라이언트 사용 확인

---

## References

### 외부 문서
- [MCP Protocol Spec](https://modelcontextprotocol.io/)
- [Supabase MCP Server](https://github.com/supabase/mcp-server-supabase)

### 내부 문서
- Supabase 설정: [supabase.md](./supabase.md)
- 데이터베이스 가이드: [../modules/database-migration-guide.md](../../modules/database-migration-guide.md)
- 보안 원칙: [../modules/security-principles.md](../../modules/security-principles.md)

---

## CHANGELOG

### 2025-10-01
- ✅ 초기 문서 작성
- ✅ supabase-dvs MCP 서버 설정 완료
- ✅ 보안 원칙 및 런북 추가

---

**마지막 업데이트**: 2025-10-01
**Status**: 🟢 Active
