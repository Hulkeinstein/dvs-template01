---
title: "Test Quality Guide"
tags:
  - phase/1
  - type/docs
  - status/completed
created: 2025-08-21
updated: 2025-11-03
status: active
category: guide
related:
  - testing/strategy.md
---

# Test Quality Guide

## 🎯 목표
"형식적 품질 게이트"를 "실제 품질 게이트"로 전환

## ✅ 품질 기준

### 1. 테스트 스킵 금지
- `test.skip`, `describe.skip`, `it.skip` 사용 금지
- `xit`, `xdescribe` 사용 금지
- ESLint가 자동으로 검출

### 2. 커버리지 임계값
```javascript
// jest.config.js
coverageThreshold: {
  global: {
    branches: 50,    // 50% 분기 커버리지
    functions: 60,   // 60% 함수 커버리지
    lines: 65,       // 65% 라인 커버리지
    statements: 65   // 65% 구문 커버리지
  },
  // 중요 모듈은 더 높은 기준
  './app/lib/actions/*.js': {
    branches: 70,
    functions: 80,
    lines: 80,
    statements: 80
  }
}
```

### 3. 네트워크 격리
- 모든 외부 API 호출 차단
- Supabase 직접 호출 금지
- Repository Pattern 사용 의무화

### 4. Node 버전
- 20.11.1 이상 필수
- .nvmrc 파일로 버전 고정

## 🛠️ 품질 체크 명령어

### 수동 실행
```bash
# 품질 체크만
npm run quality:check

# Push 전 전체 체크 (테스트 + 품질)
npm run quality:pre-push

# 커버리지 확인
npm run test:coverage
```

### 자동 실행
- **Pre-commit**: 코드 포맷팅, ESLint
- **Pre-push**: 테스트 품질 체크
- **CI/CD**: 모든 체크 + 커버리지 게이트

## 📊 품질 체크 항목

### `npm run quality:check` 실행 시:
1. ✅ Node 버전 확인 (>=20.11)
2. ✅ 스킵된 테스트 검출
3. ✅ Supabase 직접 호출 검출
4. ✅ 커버리지 임계값 확인
5. ✅ console.log 사용 확인

### 출력 예시:
```
🚀 Running test quality checks...

🔍 Checking Node version...
🔍 Checking for skipped tests...
🔍 Checking for direct Supabase calls in tests...
🔍 Checking test coverage...
🔍 Checking for console.log in production code...

📊 Results:
──────────────────────────────────────────────────
✅ Node v20.11.1 is compatible
✅ No skipped tests found
✅ No direct Supabase calls in tests
✅ Coverage meets all thresholds
✅ Minimal console.log usage
──────────────────────────────────────────────────

✅ All quality checks passed!
```

## 🚨 문제 해결

### 스킵된 테스트 발견
```bash
❌ Found skipped tests:
components/Quiz.test.js:45: test.skip('should handle edge case')
```
**해결**: 테스트를 수정하거나 삭제

### 커버리지 미달
```bash
❌ Coverage below thresholds
lines: 45.23% (threshold: 65%)
functions: 52.10% (threshold: 60%)
```
**해결**: 테스트 추가 작성

### Supabase 직접 호출
```bash
⚠️ Found direct Supabase imports in tests
__tests__/actions/courseActions.test.js:5: import { supabase } from '@/app/lib/supabase/client'
```
**해결**: Repository Pattern 사용
```javascript
// ❌ Bad
import { supabase } from '@/app/lib/supabase/client';

// ✅ Good
import { courseRepository } from '@/app/lib/repositories';
```

## 🔄 Repository Pattern

### 테스트에서 Mock 사용
```javascript
import { MockCourseRepository } from '@/tests/mocks/repositories/mock.repository';
import { RepositoryFactory } from '@/app/lib/repositories';

beforeEach(() => {
  const mockRepo = new MockCourseRepository();
  RepositoryFactory.register('course', mockRepo);
});
```

### 실제 코드
```javascript
import { courseRepository } from '@/app/lib/repositories';

// Repository를 통한 데이터 접근
const courses = await courseRepository.findByInstructor(instructorId);
```

## 📈 점진적 개선

### Phase 1 (현재)
- [x] 네트워크 차단
- [x] 타이머 정리
- [x] 브라우저 API 폴리필
- [x] Repository Pattern 도입
- [x] 커버리지 게이트 설정

### Phase 2 (다음)
- [ ] 모든 action을 repository로 마이그레이션
- [ ] E2E 테스트 추가
- [ ] 성능 테스트 추가

### Phase 3 (미래)
- [ ] 커버리지 80% 달성
- [ ] Mutation Testing 도입
- [ ] Visual Regression Testing

## 💡 팁

### 긴급 Push (권장하지 않음)
```bash
git push --no-verify  # pre-push hook 건너뛰기
```

### 로컬 테스트 환경
```bash
# .env.test 파일 생성
cp .env.example .env.test

# 테스트 실행
npm test
```

### CI 디버깅
```bash
# CI 환경 시뮬레이션
CI=true npm run test:ci
```

## 📚 관련 문서
- [Jest Configuration](../jest.config.js)
- [ESLint Rules](../.eslintrc.json)
- [CI Workflow](../.github/workflows/lint-check.yml)
- [Repository Pattern](../app/lib/repositories/README.md)