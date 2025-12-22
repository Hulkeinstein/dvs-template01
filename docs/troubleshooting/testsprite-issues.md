---
title: "TestSprite 트러블슈팅"
tags:
  - type/troubleshooting
  - external/testsprite
created: 2025-12-22
updated: 2025-12-22
status: active
---

# TestSprite 트러블슈팅

TestSprite 사용 중 발생하는 문제와 해결 방법.

## 공식 문서

- https://docs.testsprite.com/mcp/troubleshooting/test-execution-issues

---

## 일반 에러 (공식 문서)

### "Command not found"

**원인**: Node.js 미설치 또는 PATH 설정 문제

**해결**:
```bash
# Node.js 버전 확인 (22+ 필요)
node --version

# 설치 안됨 → Node.js 22+ 설치
# https://nodejs.org
```

### Server connection failed

**원인**: 네트워크 또는 API Key 문제

**해결**:
1. 인터넷 연결 확인
2. API Key 형식 확인 (`sk-user-...`)
3. Dashboard에서 Key 재생성

### Permission denied

**원인**: npm 권한 문제

**해결**:
```bash
# 글로벌 설치 대신 npx 사용
npx @testsprite/testsprite-mcp@latest
```

---

## IDE별 해결책

### Cursor

**증상**: MCP 서버 연결 안됨

**해결**:
1. TestSprite MCP 토글 OFF → 5-10초 대기 → ON
2. 또는: Cmd+Shift+P > "Developer: Reload Window"
3. Sandbox 모드 비활성화 확인 (Settings > Chat > Auto-Run)

### VS Code

**해결**:
```bash
# 1. 패키지 삭제 및 캐시 정리
npm uninstall -g @testsprite/testsprite-mcp
npm cache clean --force

# 2. 재설치
npm install -g @testsprite/testsprite-mcp@latest

# 3. 창 리로드
Cmd+Shift+P > "Developer: Reload Window"
```

### Claude Code

**해결**:
```bash
# MCP 제거 후 재추가
claude mcp remove TestSprite
claude mcp add TestSprite --env API_KEY=your_key -- npx @testsprite/testsprite-mcp@latest

# 확인
claude mcp list
```

---

## 대부분의 문제 해결법

> **공식 권장**: `/testsprite_tests` 폴더 전체 삭제 후 처음부터 다시 실행

```bash
rm -rf testsprite_tests/
```

그 후 "Help me test this project with TestSprite" 다시 실행

---

## DVS-TEMPLATE01 프로젝트 경험

### 1. 이전 테스트가 새 테스트와 섞임

**증상**:
- Lilys Summary 기능을 테스트했는데 Student Dashboard 테스트가 실행됨
- 테스트 플랜에 이전 기능 테스트가 포함됨

**원인**:
- `testsprite_frontend_test_plan.json`이 삭제되지 않고 누적됨
- 새 PRD를 생성해도 기존 테스트 플랜이 남아있음

**해결**:
```bash
# testsprite_tests 폴더 전체 삭제
rm -rf testsprite_tests/

# 처음부터 다시 실행
"Help me test this project with TestSprite"
```

---

### 2. PRD 단계 누락으로 잘못된 테스트 생성

**증상**:
- 테스트가 원하는 기능이 아닌 다른 기능을 테스트함
- 코드 분석 결과만으로 테스트 생성됨

**원인**:
- `testsprite_generate_standardized_prd` 단계를 건너뜀
- 워크플로우: bootstrap → code_summary → **PRD 생성** → test_plan → execute

**해결**:
1. `/testsprite_tests` 폴더 삭제
2. 전체 워크플로우 다시 실행 (PRD 단계 포함)

**올바른 순서**:
```
1. testsprite_bootstrap_tests
2. testsprite_generate_code_summary
3. testsprite_generate_standardized_prd  ← 필수!
4. testsprite_generate_frontend_test_plan
5. testsprite_generate_code_and_execute
```

---

### 3. 모달 안의 버튼 접근 실패 (9/10 테스트 실패)

**증상**:
- "AI 요약" 버튼을 찾을 수 없음
- 테스트가 모달 밖에서만 동작
- XPath로 잘못된 요소 선택

**원인**:
- AI 요약 버튼이 모달 안에 있음 (아코디언 → 모달 → 버튼)
- TestSprite가 복잡한 UI 네비게이션을 이해 못함
- 생성된 XPath: `html/body/main/div[2]/ul/li/button` (잘못됨)

**실제 경로**:
```
1. 토픽 아코디언 펼치기
2. "Lesson" 버튼 클릭 → 모달 열림
3. YouTube URL 입력
4. "AI 요약" 버튼 클릭 (모달 안)
```

**해결**: TestSprite로는 해결 불가 → 대안 사용
- 수동 테스트
- Playwright 직접 작성
- Jest 단위 테스트

---

### 4. Server Actions 백엔드 테스트 불가

**증상**:
- 백엔드 테스트 플랜은 생성되지만 실행 안됨
- `test_results.json`에 백엔드 테스트 결과 없음

**원인**:
```
# REST API (TestSprite 지원)
/api/summary → HTTP 요청으로 테스트 가능

# Server Actions (TestSprite 미지원)
generateLilysSummary() → URL 없음, 직접 호출 불가
```

**해결**: TestSprite로는 해결 불가 → 대안 사용

```typescript
// Jest로 Server Actions 직접 테스트
import { generateLilysSummary } from '@/app/lib/actions/summaryActions';

test('Lilys 요약 생성', async () => {
  const result = await generateLilysSummary(mockTranscript);
  expect(result.format).toBe('lilys');
});
```

---

## 알려진 한계

| 한계 | 설명 | 대안 |
|------|------|------|
| **클라우드 전용** | 로컬 실행 불가 | - |
| **모달/아코디언** | 복잡한 UI 네비게이션 실패 | Playwright 직접 작성 |
| **Server Actions** | REST API만 지원 | Jest 단위 테스트 |
| **테스트 겹침** | 이전 플랜 누적 | 폴더 삭제 후 재생성 |
| **PRD 의존** | 단계 누락 시 잘못된 테스트 | 전체 워크플로우 실행 |

---

## 대안 테스트 방법

### 1. 수동 테스트 (가장 빠름)

브라우저에서 직접 기능 확인

### 2. Jest 단위 테스트 (Server Actions)

```typescript
// __tests__/summaryActions.test.ts
import { generateLilysSummary } from '@/app/lib/actions/summaryActions';

describe('Lilys Summary', () => {
  test('generates valid format', async () => {
    const result = await generateLilysSummary(mockData);
    expect(result.format).toBe('lilys');
    expect(result.core_qa).toBeDefined();
  });
});
```

### 3. Playwright E2E (모달 테스트)

```typescript
// e2e/lilys-summary.spec.ts
test('AI 요약 생성', async ({ page }) => {
  await page.goto('/create-course?edit=xxx');

  // 토픽 아코디언 열기
  await page.click('[data-testid="topic-accordion"]');

  // Lesson 버튼 → 모달 열기
  await page.click('button:has-text("Lesson")');

  // 모달 안에서 작업
  await page.fill('#lessonVideoUrl', 'https://youtube.com/...');
  await page.click('button:has-text("AI 요약")');

  // 결과 확인
  await expect(page.locator('.summary-display')).toBeVisible();
});
```

---

## 관련 문서

- [TestSprite 가이드](../guides/testsprite-guide.md)
- [테스트 전략](../testing/strategy.md)
