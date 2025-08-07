# 🚀 Git 자동화 시스템 가이드

## 📋 개요

이 프로젝트는 GitHub Flow와 완벽하게 호환되는 자동화 시스템을 사용합니다.
코드 품질 검사와 태스크 아카이빙이 자동으로 수행됩니다.

## 🔧 시스템 구성

### 1. Pre-commit Hook (모든 브랜치)
커밋 전에 자동으로 실행되는 검사:
- **ESLint**: JavaScript/TypeScript 코드 품질 검사
- **Prettier**: 코드 포맷팅 검사
- **TypeScript**: 타입 체크 (경고만)

### 2. Post-commit Hook (main 브랜치만)
main 브랜치에서 커밋 후 자동으로 실행:
- 커밋 메시지에서 "Closes: Phase X, Task Y" 패턴 감지
- DEVELOPMENT_PLAN.md에서 해당 태스크를 COMPLETED_TASKS.md로 이동
- 완료 메타데이터 추가 (날짜, 작업자, 커밋 정보 등)

## 📚 사용법

### 기본 워크플로우

1. **feature 브랜치에서 작업**
```bash
git checkout -b feature/new-feature
# 코드 작업...
git add .
git commit -m "feat: 새로운 기능 구현"
# Pre-commit hook이 자동으로 코드 품질 검사
```

2. **main 브랜치에 머지 후 태스크 완료**
```bash
git checkout main
git merge feature/new-feature
git commit -m "Closes: Phase 1, Task 2 - 결제 시스템 구현 완료"
# Post-commit hook이 자동으로 태스크 아카이빙
```

### 커밋 메시지 패턴

#### 일반 커밋 (feature 브랜치)
```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 업데이트
style: 코드 스타일 변경
refactor: 코드 리팩토링
test: 테스트 추가
chore: 기타 작업
```

#### 태스크 완료 커밋 (main 브랜치)
```
Closes: Phase 1, Task 2 - 설명
```

지원되는 패턴:
- `Closes: Phase 1, Task 2`
- `Closes: P1, T2`
- `완료: Phase 1, Task 2`
- `Done: Phase 1, Task 2`

## 🛠️ 수동 실행

### 코드 품질 검사
```bash
npm run lint          # ESLint 실행
npm run format:check  # Prettier 체크
npm run format        # Prettier 자동 포맷팅
```

### 태스크 아카이빙 (수동)
```bash
npm run task:archive  # 마지막 커밋에서 태스크 아카이빙 실행
```

## 📁 파일 구조

```
프로젝트/
├── .husky/
│   ├── pre-commit        # Pre-commit hook
│   └── post-commit       # Post-commit hook
├── scripts/
│   └── automation/
│       ├── update-development-plan.ts  # 태스크 아카이빙
│       ├── pre-commit-checks.ts        # 코드 품질 검사
│       └── lib/
│           ├── git-utils.ts            # Git 유틸리티
│           └── file-utils.ts           # 파일 조작 유틸리티
├── .lintstagedrc.json    # lint-staged 설정
├── DEVELOPMENT_PLAN.md   # 진행 중인 태스크
└── COMPLETED_TASKS.md    # 완료된 태스크 아카이브
```

## 🔍 문제 해결

### Pre-commit이 실패하는 경우

1. **ESLint 오류**
```bash
npm run lint -- --fix  # 자동 수정 시도
```

2. **Prettier 오류**
```bash
npm run format  # 자동 포맷팅
```

3. **Hook 비활성화 (긴급 시)**
```bash
git commit --no-verify -m "emergency: 긴급 수정"
# 주의: 코드 품질 검사를 건너뜁니다
```

### Post-commit이 작동하지 않는 경우

1. **브랜치 확인**
```bash
git branch --show-current  # main 브랜치인지 확인
```

2. **수동 실행**
```bash
npm run task:archive  # 수동으로 아카이빙 실행
```

## 🎯 팀 협업 가이드

### 새 팀원 온보딩
```bash
# 1. 저장소 클론
git clone <repository>

# 2. 의존성 설치 (자동으로 husky 설정)
npm install

# 3. 테스트
npm run automation:test
```

### 브랜치 전략
- `main`: 배포 가능한 안정 버전
- `feature/*`: 새 기능 개발
- `fix/*`: 버그 수정
- `chore/*`: 유지보수 작업

## 📊 태스크 추적

### DEVELOPMENT_PLAN.md 형식
```markdown
### Phase 1: Core Platform
1. **학생 코스 상세 페이지**
   - 코스 정보 표시
   - 커리큘럼 보기
   
2. **결제 시스템**
   - Stripe 통합
   - 주문 확인
```

### COMPLETED_TASKS.md 형식
```markdown
## Phase 1, Task 2
**완료일**: 2025-02-07 14:30 KST
**작업자**: Your Name
**커밋**: abc1234

### 설명
2. **결제 시스템**
   - Stripe 통합
   - 주문 확인

### 변경된 파일
- app/payment/page.js
- lib/stripe.js
```

## 🚀 고급 설정

### 커스텀 검사 추가
`scripts/automation/pre-commit-checks.ts` 파일을 수정하여 추가 검사를 설정할 수 있습니다.

### 태스크 패턴 커스터마이징
`scripts/automation/lib/git-utils.ts`의 `parseClosesPattern` 함수를 수정하여 새로운 패턴을 추가할 수 있습니다.

## 📝 참고사항

- 모든 hook은 커밋을 차단하지 않도록 설계되었습니다 (ESLint/Prettier 제외)
- 태스크 아카이빙은 main 브랜치에서만 작동합니다
- 시스템은 Windows/Mac/Linux 모두 호환됩니다