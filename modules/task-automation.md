# 태스크 및 코드 품질 자동화 시스템

## 개요
GitHub Flow와 완벽하게 호환되는 완전한 자동화 시스템으로, 태스크 관리, 코드 품질 검사, PR 관리를 자동화합니다.

## 1. 태스크 아카이빙 시스템

### 1.1 동작 원리
- **DEVELOPMENT_PLAN.md**: 진행 중인 태스크 관리
- **COMPLETED_TASKS.md**: 완료된 태스크 아카이브
- **자동 이동**: main 브랜치에서 특정 패턴 커밋 시 자동 처리

### 1.2 Closes 패턴
지원되는 패턴:
- `Closes: Phase 1, Task 2` (표준)
- `Closes: P1, T2` (축약형)
- `완료: Phase 1, Task 2` / `완료: P1, T2` (한국어)
- `Done: Phase 1, Task 2` (영어)
- `Completed: Phase 1, Task 2` (영어)
- `Finished: Phase 1, Task 2` (영어)
- `Closes: 1-2` / `Done: 1-2` (축약형)
- `Fixes: Phase 1, Task 2` (GitHub 스타일)
- `Resolves: Phase 1, Task 2` (GitHub 스타일)

예시:
```bash
git commit -m "Closes: Phase 1, Task 2 - 결제 시스템 구현 완료"
```

### 1.3 자동 추가되는 메타데이터
- 완료 날짜 (KST)
- 작업자 이름
- 커밋 해시
- 변경된 파일 목록 (최대 5개)

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

### 2.2 Post-commit Hook (main 브랜치만)
**자동 실행 내용:**
1. 브랜치 확인 (main인지)
2. 커밋 메시지에서 Closes 패턴 검색
3. DEVELOPMENT_PLAN.md에서 해당 태스크 찾기
4. COMPLETED_TASKS.md로 이동
5. 메타데이터 추가

## 3. 파일 구조

### 3.1 Hook 파일
```
.husky/
├── pre-commit        # lint-staged 실행
└── post-commit       # 태스크 아카이빙 실행
```

### 3.2 자동화 스크립트
```
scripts/automation/
├── update-development-plan.ts  # 태스크 아카이빙 로직
├── pre-commit-checks.ts        # 코드 품질 검사
├── test-automation.ts           # 시스템 테스트
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
  "task:archive": "tsx scripts/automation/update-development-plan.ts",
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

### 5.2 태스크 완료 (main 브랜치)
```bash
# main 브랜치에서
git commit -m "Closes: Phase 1, Task 2 - 기능 완료"
# ✅ Pre-commit hook 실행 (코드 품질)
# ✅ Post-commit hook 실행 (태스크 아카이빙)
```

### 5.3 수동 실행
```bash
# 태스크 아카이빙 수동 실행
npm run task:archive

# 코드 품질 검사
npm run lint          # ESLint
npm run format        # Prettier 포맷팅
npm run format:check  # Prettier 체크만
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

### 6.3 Post-commit 작동 안 함
체크리스트:
1. 현재 브랜치가 main인지 확인
2. 커밋 메시지에 Closes 패턴이 있는지 확인
3. DEVELOPMENT_PLAN.md에 해당 태스크가 있는지 확인

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
- **main 브랜치만**: Post-commit hook (태스크 아카이빙)

### 8.2 커밋 차단 조건
- ESLint 오류 발견 시
- Prettier 포맷팅 오류 시
- **TypeScript 오류는 경고만** (차단하지 않음)

### 8.3 플랫폼 호환성
- Windows, Mac, Linux 모두 지원
- Git Bash 권장 (Windows)

## 9. 개선 사항 (2025-02-08)
- Pre-commit hook 개선: 사용자 친화적 메시지 추가
- Post-commit hook 개선: 브랜치 확인 로직 강화
- Closes 패턴 확장: 11가지 패턴 지원
- GitHub PR 헬퍼: 대화형 PR 생성/머지 도구 추가
- 테스트 자동화: 색상 코드, 시뮬레이션, 진행도 표시
- 문서화: 상세한 가이드 및 워크플로우 예시 추가

## 10. 관련 문서
- Git 워크플로우: `modules/git-workflow.md`
- 사용 가이드: `docs/AUTOMATION_GUIDE.md`
- 워크플로우 예시: `docs/WORKFLOW_EXAMPLES.md`
- PR 헬퍼 스크립트: `scripts/automation/gh-pr-helper.ts`