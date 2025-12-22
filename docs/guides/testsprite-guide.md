---
title: "TestSprite MCP 가이드"
tags:
  - type/guide
  - external/testsprite
created: 2025-12-22
updated: 2025-12-22
status: active
---

# TestSprite MCP 가이드

AI 기반 자동 테스트 도구 TestSprite의 설치, 사용법, Best Practices 가이드.

## 공식 문서

| 문서 | URL |
|------|-----|
| 메인 문서 | https://docs.testsprite.com |
| 설치 | https://docs.testsprite.com/mcp/getting-started/installation |
| 첫 테스트 | https://docs.testsprite.com/mcp/getting-started/first-test |
| 새 프로젝트 테스트 | https://docs.testsprite.com/mcp/core/create-tests-new-project |
| 변경사항 테스트 | https://docs.testsprite.com/mcp/core/create-tests-new-feature |
| MCP Tools | https://docs.testsprite.com/mcp/core/tools |
| 트러블슈팅 | https://docs.testsprite.com/mcp/troubleshooting/test-execution-issues |

---

## 설치

### 사전 요구사항

- **Node.js 22+**: `node --version`으로 확인
- **TestSprite 계정**: https://www.testsprite.com 에서 가입
- **API Key**: Dashboard > Settings > API Keys에서 생성

### IDE별 설치

#### Claude Code
```bash
claude mcp add TestSprite --env API_KEY=your_api_key -- npx @testsprite/testsprite-mcp@latest
```

확인:
```bash
claude mcp list
```

#### Cursor
Settings (Cmd+Shift+J) > Tools & Integration > Add custom MCP:
```json
{
  "mcpServers": {
    "TestSprite": {
      "command": "npx",
      "args": ["@testsprite/testsprite-mcp@latest"],
      "env": {
        "API_KEY": "your-api-key"
      }
    }
  }
}
```

**중요**: Settings > Chat > Auto-Run을 "Ask Everytime"으로 변경 (Sandbox 비활성화)

#### VS Code
Command Palette (Cmd+Shift+P) > MCP: Add Server > stdio 선택

---

## MCP Tools (7개)

| Tool | 용도 |
|------|------|
| `testsprite_bootstrap_tests` | 테스트 환경 초기화 |
| `testsprite_generate_code_summary` | 코드 분석 |
| `testsprite_generate_standardized_prd` | PRD 정규화 |
| `testsprite_generate_frontend_test_plan` | 프론트엔드 테스트 플랜 |
| `testsprite_generate_backend_test_plan` | 백엔드 테스트 플랜 |
| `testsprite_generate_code_and_execute` | 테스트 생성 및 실행 |
| `testsprite_rerun_tests` | 기존 테스트 재실행 (beta) |

---

## 워크플로우 (9단계)

```
1. Bootstrap (환경 초기화)
   ↓
2. PRD 읽기 (사용자 문서)
   ↓
3. 코드 분석 (testsprite_generate_code_summary)
   ↓
4. PRD 정규화 (testsprite_generate_standardized_prd)  ← 필수!
   ↓
5. 테스트 플랜 생성 (frontend/backend)
   ↓
6. 테스트 코드 생성 및 실행
   ↓
7. 결과 분석 및 리포트
   ↓
8. AI 수정 제안
   ↓
9. 재테스트
```

**중요**: PRD 정규화 단계(4)를 건너뛰면 잘못된 테스트가 생성됨

---

## 주요 파라미터

### Bootstrap
```typescript
testsprite_bootstrap_tests({
  projectPath: "/absolute/path/to/project",  // 프로젝트 경로 (필수)
  localPort: 3000,                           // 앱 포트 (필수)
  type: "frontend" | "backend",              // 테스트 유형 (필수)
  testScope: "codebase" | "diff"             // 테스트 범위 (필수)
})
```

### 테스트 실행
```typescript
testsprite_generate_code_and_execute({
  projectPath: "/absolute/path/to/project",  // 프로젝트 경로 (필수)
  projectName: "my-project",                 // 프로젝트 이름 (필수)
  testIds: [],                               // 빈 배열 = 전체 테스트
  additionalInstruction: "Focus on..."       // 추가 지시 (선택)
})
```

---

## 테스트 스코프

| 스코프 | 테스트 수 | 시간 | 용도 |
|--------|----------|------|------|
| `codebase` | 20-50개 | 10-20분 | 초기 설정, 릴리즈 전 |
| `diff` | 3-10개 | 3-5분 | 개발 중, PR 검증 |

### codebase (전체 테스트)
```
"Help me test this project with TestSprite"
```

### diff (변경사항만)
```
"Test only the changes I made with TestSprite"
```

---

## 출력 파일

테스트 실행 후 `testsprite_tests/` 폴더 생성:

```
testsprite_tests/
├── standard_prd.json              # 정규화된 PRD
├── testsprite_frontend_test_plan.json  # 프론트엔드 테스트 플랜
├── testsprite_backend_test_plan.json   # 백엔드 테스트 플랜
├── TC001_*.py                     # 생성된 테스트 코드
├── TC002_*.py
├── tmp/
│   ├── config.json               # 설정
│   ├── code_summary.json         # 코드 분석 결과
│   └── test_results.json         # 테스트 결과
└── testsprite-mcp-test-report.md # 최종 리포트
```

---

## Best Practices

### 테스트 전
- 앱이 `localPort`에서 실행 중인지 확인
- 로그인 필요 시 테스트 계정 준비
- README에 프로젝트 설명 명확히 작성

### 테스트 중
- PRD 생성 결과 확인 (정확한지)
- 테스트 플랜 범위 검토
- 실행 진행 상황 모니터링

### 테스트 후
- 실패 패턴 분석
- 수정 후 재테스트
- 교훈 문서화

### 새 기능 테스트 시
- **이전 테스트 파일 정리**: `/testsprite_tests` 폴더 삭제 후 재생성
- **PRD 단계 필수**: 건너뛰면 이전 기능 테스트가 섞임

---

## 알려진 한계

| 한계 | 설명 |
|------|------|
| **클라우드 전용** | 로컬 실행 불가, TestSprite 서버에서만 실행 |
| **모달/복잡한 UI** | 아코디언 → 모달 네비게이션 어려움 |
| **Server Actions** | REST API만 지원, Next.js Server Actions 미지원 |
| **테스트 겹침** | 이전 테스트 플랜이 삭제되지 않고 누적됨 |

---

## 관련 문서

- [TestSprite 트러블슈팅](../troubleshooting/testsprite-issues.md)
- [테스트 전략](../testing/strategy.md)
