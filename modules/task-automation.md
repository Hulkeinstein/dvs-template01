# 코드 품질 자동화 시스템

## 개요
GitHub Flow와 호환되는 코드 품질 자동화 시스템으로, 코드 품질 검사와 GitHub Issues를 활용한 프로젝트 관리를 지원합니다.

## 1. GitHub Issues를 활용한 작업 관리

### 1.1 작업 관리 체계
- **DEVELOPMENT_PLAN.md**: 전체 로드맵 및 마일스톤 관리
- **GitHub Issues**: 실제 작업 추적 및 관리
- **자동 연동**: PR 머지 시 Issue 자동 닫기

### 1.2 GitHub Issue 자동 닫기
커밋 메시지에 특정 키워드와 Issue 번호를 포함하면 PR 머지 시 자동으로 Issue가 닫힙니다.

지원되는 키워드:
- `Closes #123`
- `Fixes #123`
- `Resolves #123`

예시:
```bash
# 단일 이슈 닫기
git commit -m "feat: 결제 시스템 구현 - Closes #10"

# 여러 이슈 동시 닫기
git commit -m "refactor: 인증 시스템 개선 - Closes #12, #13"

# PR 제목에도 사용 가능
gh pr create --title "feat: 새 기능 추가 - Closes #15"
```

### 1.3 Issue 관리 모범 사례
- 작업 시작 전 Issue 생성
- 적절한 라벨 사용 (bug, feature, enhancement 등)
- 마일스톤 설정으로 진행 상황 추적
- PR과 Issue 연결로 작업 내역 추적

## 2. 코드 품질 자동화

### 2.1 Pre-commit Hook (모든 브랜치)
**자동 실행 내용:**
- **ESLint**: JavaScript/TypeScript 코드 품질 검사
- **Prettier**: 코드 포맷팅 자동 적용
- **lint-staged**: 스테이징된 파일만 검사 (성능 최적화)

**실패 시 동작:**
- ESLint 오류: 커밋 차단
- Prettier 오류: 커밋 차단
- TypeScript 오류: 경고만 표시


## 3. 파일 구조

### 3.1 Hook 파일
```
.husky/
└── pre-commit        # lint-staged 실행 (ESLint + Prettier)
```

### 3.2 자동화 스크립트
```
scripts/automation/
├── pre-commit-checks.ts        # 코드 품질 검사
├── test-automation.ts           # 시스템 테스트
├── gh-pr-helper.ts             # GitHub PR 헬퍼
└── lib/
    ├── git-utils.ts            # Git 명령어 유틸리티
    └── file-utils.ts           # 파일 조작 유틸리티
```

### 3.3 설정 파일
```
.lintstagedrc.json              # lint-staged 설정
package.json                     # npm 스크립트
```

## 4. 설정

### 4.1 .lintstagedrc.json
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

### 4.2 npm 스크립트
```json
{
  "prepare": "husky",
  "pre-commit": "tsx scripts/automation/pre-commit-checks.ts",
  "automation:test": "tsx scripts/automation/test-automation.ts",
  "pr:create": "tsx scripts/automation/gh-pr-helper.ts create",
  "pr:merge": "tsx scripts/automation/gh-pr-helper.ts merge",
  "pr:help": "tsx scripts/automation/gh-pr-helper.ts"
}
```

## 5. 사용법

### 5.1 일반 개발 (feature 브랜치)
```bash
# 개발 작업
git add .
git commit -m "feat: 새 기능 구현"
# ✅ Pre-commit hook만 실행 (코드 품질 검사)
```

### 5.2 Issue 자동 닫기
```bash
# feature 브랜치에서
git commit -m "feat: 새 기능 구현 - Closes #10"
# ✅ Pre-commit hook 실행 (코드 품질)
# PR 머지 시 Issue #10 자동으로 닫힘
```

### 5.3 수동 실행
```bash
# 코드 품질 검사
npm run lint          # ESLint
npm run format        # Prettier 포맷팅
npm run format:check  # Prettier 체크만

# GitHub PR 관리
npm run pr:create     # PR 생성
npm run pr:merge      # PR 머지
```

## 6. 문제 해결

### 6.1 Hook 비활성화 (긴급 시)
```bash
# 모든 hook 건너뛰기
git commit --no-verify -m "emergency: 긴급 수정"
```

### 6.2 Pre-commit 실패 시
```bash
# ESLint 자동 수정
npm run lint -- --fix

# Prettier 자동 포맷팅
npm run format
```

### 6.3 Issue 자동 닫기 작동 안 함
체크리스트:
1. 커밋 메시지에 올바른 키워드 사용 (Closes, Fixes, Resolves)
2. Issue 번호 형식 확인 (#123)
3. Issue가 실제로 존재하는지 확인
4. PR이 main 브랜치로 머지되는지 확인

### 6.4 Windows 경로 문제
```bash
# GitHub CLI 전체 경로 사용
"C:\\Program Files\\GitHub CLI\\gh.exe" pr create
```

## 7. 팀 온보딩

### 7.1 초기 설정
```bash
# 1. 저장소 클론
git clone <repository>

# 2. 의존성 설치 (husky 자동 설정)
npm install

# 3. 자동화 테스트
npm run automation:test
```

### 7.2 GitHub CLI 설정 (선택사항)
```bash
# 설치 (Windows)
winget install --id GitHub.cli

# 인증
gh auth login

# PR 자동 생성/머지
gh pr create
gh pr merge --squash
```

## 8. 주의사항

### 8.1 브랜치별 동작
- **모든 브랜치**: Pre-commit hook (코드 품질)
- **GitHub**: PR 머지 시 Issue 자동 닫기

### 8.2 커밋 차단 조건
- ESLint 오류 발견 시
- Prettier 포맷팅 오류 시
- **TypeScript 오류는 경고만** (차단하지 않음)

### 8.3 플랫폼 호환성
- Windows, Mac, Linux 모두 지원
- Git Bash 권장 (Windows)

## 9. 개선 사항 (2025-02-10)
- 태스크 관리 시스템을 GitHub Issues로 일원화
- 중복 파일 제거 (COMPLETED_TASKS.md, work-logs)
- Post-commit hook 제거로 시스템 간소화
- GitHub 표준 워크플로우 채택

## 10. 관련 문서
- Git 워크플로우: `modules/git-workflow.md`
- 사용 가이드: `docs/AUTOMATION_GUIDE.md`
- 워크플로우 예시: `docs/WORKFLOW_EXAMPLES.md`
- PR 헬퍼 스크립트: `scripts/automation/gh-pr-helper.ts`