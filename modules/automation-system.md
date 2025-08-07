# Git 자동화 시스템

## 개요
GitHub Flow와 완벽하게 호환되는 자동화 시스템으로, 코드 품질 검사와 태스크 아카이빙을 자동화합니다.

## 핵심 기능

### 1. Pre-commit Hook (모든 브랜치)
- **ESLint**: JavaScript/TypeScript 코드 품질 검사
- **Prettier**: 코드 포맷팅 검사  
- **lint-staged**: 스테이징된 파일만 검사

### 2. Post-commit Hook (main 브랜치만)
- 커밋 메시지에서 "Closes: Phase X, Task Y" 패턴 감지
- DEVELOPMENT_PLAN.md → COMPLETED_TASKS.md 자동 이동
- 완료 메타데이터 자동 추가

## 파일 구조
```
.husky/
├── pre-commit        # lint-staged 실행
└── post-commit       # 태스크 아카이빙

scripts/automation/
├── update-development-plan.ts  # 태스크 아카이빙 로직
├── pre-commit-checks.ts        # 코드 품질 검사
└── lib/
    ├── git-utils.ts            # Git 유틸리티
    └── file-utils.ts           # 파일 조작 유틸리티

docs/
├── AUTOMATION_GUIDE.md         # 사용 가이드
└── WORKFLOW_EXAMPLES.md        # 실제 예시
```

## 사용법

### 일반 커밋 (feature 브랜치)
```bash
git commit -m "feat: 새 기능 구현"
# Pre-commit hook만 실행
```

### 태스크 완료 (main 브랜치)
```bash
git commit -m "Closes: Phase 1, Task 2 - 설명"
# Pre-commit + Post-commit 실행
```

## 지원되는 Closes 패턴
- `Closes: Phase 1, Task 2`
- `Closes: P1, T2`
- `완료: Phase 1, Task 2`
- `Done: Phase 1, Task 2`

## npm 스크립트
```json
{
  "task:archive": "tsx scripts/automation/update-development-plan.ts",
  "pre-commit": "tsx scripts/automation/pre-commit-checks.ts",
  "automation:test": "echo 'Testing automation system...'"
}
```

## 설정 파일

### .lintstagedrc.json
```json
{
  "*.{js,jsx,ts,tsx}": [
    "eslint --fix --max-warnings 0",
    "prettier --write"
  ],
  "*.{json,md,scss,css}": [
    "prettier --write"
  ]
}
```

## 문제 해결

### Hook 비활성화 (긴급 시)
```bash
git commit --no-verify -m "emergency: 긴급 수정"
```

### 수동 실행
```bash
npm run task:archive  # 태스크 아카이빙
npm run lint          # ESLint
npm run format        # Prettier
```

## 팀 온보딩
```bash
# 1. 저장소 클론
git clone <repository>

# 2. 의존성 설치 (husky 자동 설정)
npm install

# 3. 테스트
npm run automation:test
```

## 주의사항
- Post-commit은 main 브랜치에서만 작동
- ESLint/Prettier 오류는 커밋 차단
- TypeScript 오류는 경고만 표시
- 모든 플랫폼 호환 (Windows/Mac/Linux)