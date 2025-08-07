# 🎯 워크플로우 예시

실제 개발 시나리오별 자동화 시스템 사용 예시입니다.

## 📌 시나리오 1: 새 기능 개발

### 상황
학생 대시보드에 북마크 기능을 추가해야 합니다.

### 워크플로우

1. **DEVELOPMENT_PLAN.md에 태스크 추가**
```markdown
### Phase 1: Core Platform
3. **북마크 기능**
   - 북마크 추가/제거 API
   - UI 컴포넌트 구현
   - 상태 관리 통합
```

2. **feature 브랜치 생성 및 개발**
```bash
# 브랜치 생성
git checkout -b feature/bookmark-system

# 개발 작업...
# components/Student/BookmarkButton.js 생성
# app/lib/actions/bookmarkActions.js 생성

# 커밋 (Pre-commit hook 자동 실행)
git add .
git commit -m "feat: 북마크 버튼 컴포넌트 구현"
# ✅ ESLint 체크 통과
# ✅ Prettier 체크 통과
# 커밋 성공!

git commit -m "feat: 북마크 API 액션 추가"
# 자동 검사 후 커밋...
```

3. **PR 생성 및 머지**
```bash
git push origin feature/bookmark-system
# GitHub에서 PR 생성 및 리뷰

# main으로 머지
git checkout main
git pull origin main
git merge feature/bookmark-system
```

4. **태스크 완료 커밋**
```bash
git commit -m "Closes: Phase 1, Task 3 - 북마크 기능 구현 완료"
# 🎯 Post-commit hook 실행!
# ✅ DEVELOPMENT_PLAN.md에서 태스크 제거
# ✅ COMPLETED_TASKS.md로 이동
# ✅ 메타데이터 추가 (날짜, 작업자, 파일 목록)
```

## 📌 시나리오 2: 긴급 버그 수정

### 상황
프로덕션에서 결제 오류가 발생했습니다.

### 워크플로우

1. **hotfix 브랜치 생성**
```bash
git checkout -b hotfix/payment-error
```

2. **버그 수정 및 커밋**
```bash
# 버그 수정...
git add app/lib/actions/paymentActions.js
git commit -m "fix: Stripe 결제 오류 수정"
# Pre-commit hook이 코드 품질 검사
```

3. **main에 직접 머지**
```bash
git checkout main
git merge hotfix/payment-error
git push origin main
```

## 📌 시나리오 3: 코드 품질 문제 해결

### 상황
커밋 시 ESLint 오류가 발생합니다.

### 오류 예시
```bash
git commit -m "feat: 새 기능"
# ❌ ESLint 체크 실패
# 
# components/NewFeature.js
#   12:5  error  'useState' is defined but never used
#   25:10 error  Missing semicolon
```

### 해결 방법

1. **자동 수정 시도**
```bash
npm run lint -- --fix
# 자동으로 수정 가능한 오류 해결
```

2. **수동 수정**
```javascript
// components/NewFeature.js
// 12번 줄: 사용하지 않는 import 제거
- import { useState } from 'react';

// 25번 줄: 세미콜론 추가
- const data = fetchData()
+ const data = fetchData();
```

3. **다시 커밋**
```bash
git add .
git commit -m "feat: 새 기능"
# ✅ 모든 검사 통과!
```

## 📌 시나리오 4: 여러 태스크 동시 완료

### 상황
한 번의 작업으로 여러 태스크를 완료했습니다.

### 워크플로우

1. **첫 번째 태스크 완료**
```bash
git commit -m "Closes: Phase 1, Task 4 - 코스 검색 기능 완료"
# Task 4 아카이빙
```

2. **두 번째 태스크 완료**
```bash
git commit -m "Closes: Phase 1, Task 5 - 필터링 기능 완료"
# Task 5 아카이빙
```

## 📌 시나리오 5: 팀 협업

### 상황
여러 개발자가 동시에 작업하고 있습니다.

### Developer A 워크플로우
```bash
# feature 브랜치에서 작업
git checkout -b feature/user-profile
git commit -m "feat: 사용자 프로필 페이지 추가"
git push origin feature/user-profile
```

### Developer B 워크플로우
```bash
# 다른 feature 브랜치에서 작업
git checkout -b feature/notification-system
git commit -m "feat: 알림 시스템 구현"
git push origin feature/notification-system
```

### Team Lead 워크플로우
```bash
# PR 리뷰 및 머지
git checkout main
git pull origin main

# Developer A 작업 머지
git merge origin/feature/user-profile
git commit -m "Closes: Phase 2, Task 1 - 사용자 프로필 완료"

# Developer B 작업 머지
git merge origin/feature/notification-system
git commit -m "Closes: Phase 2, Task 2 - 알림 시스템 완료"

# 모든 태스크가 자동으로 COMPLETED_TASKS.md로 이동
```

## 📌 시나리오 6: 롤백 필요 시

### 상황
잘못된 커밋을 되돌려야 합니다.

### 워크플로우

1. **커밋 되돌리기**
```bash
# 마지막 커밋 취소 (파일은 유지)
git reset --soft HEAD~1

# 수정 후 다시 커밋
git commit -m "fix: 수정된 구현"
```

2. **이미 push한 경우**
```bash
# revert 커밋 생성
git revert HEAD
git push origin main
```

## 📌 시나리오 7: CI/CD 통합

### GitHub Actions와 함께 사용
```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
    branches: [ main ]

jobs:
  quality-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npm run lint
      - run: npm run format:check
      - run: npm run test
```

## 💡 베스트 프랙티스

### 1. 커밋 메시지 작성
```bash
# 좋은 예 ✅
git commit -m "feat: 사용자 인증 시스템 구현

- JWT 토큰 기반 인증 추가
- 리프레시 토큰 로직 구현
- 로그아웃 기능 추가"

# 나쁜 예 ❌
git commit -m "update"
git commit -m "fix"
```

### 2. 태스크 관리
```markdown
# DEVELOPMENT_PLAN.md
### Phase 1: Core Platform
1. **명확한 태스크 제목**
   - 구체적인 작업 내용
   - 예상 완료 기준
   - 관련 파일 목록
```

### 3. 브랜치 네이밍
```bash
# 좋은 예 ✅
feature/user-authentication
fix/payment-validation
chore/update-dependencies

# 나쁜 예 ❌
feature/new
fix/bug
my-branch
```

## 🔧 트러블슈팅

### 케이스 1: Hook이 실행되지 않음
```bash
# husky 재설치
npm run prepare
```

### 케이스 2: 권한 오류 (Unix/Mac)
```bash
chmod +x .husky/pre-commit
chmod +x .husky/post-commit
```

### 케이스 3: Windows에서 스크립트 오류
```bash
# Git Bash 사용 권장
# 또는 PowerShell에서:
npm config set script-shell "C:\\Program Files\\git\\bin\\bash.exe"
```

## 📊 통계 확인

### 완료된 태스크 수 확인
```bash
grep -c "## Phase" COMPLETED_TASKS.md
```

### 이번 주 완료된 태스크
```bash
grep "완료일: $(date +%Y-%m)" COMPLETED_TASKS.md | wc -l
```

## 🎉 성공 사례

### 프로젝트 진행 상황 시각화
COMPLETED_TASKS.md를 분석하여:
- 주별/월별 완료 태스크 수
- 개발자별 기여도
- 가장 많이 수정된 파일
- 평균 태스크 완료 시간

이러한 데이터를 대시보드로 만들어 팀 생산성을 추적할 수 있습니다.