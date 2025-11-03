---
title: "Git 자동화 시스템 가이드"
tags:
  - phase/1
  - type/docs
  - status/completed
created: 2025-08-08
updated: 2025-11-03
status: active
category: workflow
related:
  - workflows/work-plan-guide.md
  - WORKFLOW_EXAMPLES.md
---

# 🚀 Git 자동화 시스템 가이드

## 📋 개요

이 프로젝트는 GitHub Flow와 완벽하게 호환되는 자동화 시스템을 사용합니다.
코드 품질 검사와 자동 푸시가 수행됩니다.

## 🔧 시스템 구성

### 1. Pre-commit Hook (모든 브랜치)
커밋 전에 자동으로 실행되는 검사:
- **ESLint**: JavaScript/TypeScript 코드 품질 검사
- **Prettier**: 코드 포맷팅 검사
- **TypeScript**: 타입 체크 (경고만)

### 2. Post-commit Hook (feature 브랜치만)
feature 브랜치에서 커밋 후 조건부로 자동으로 실행:
- 변경사항을 자동으로 원격 저장소에 푸시 (코드 파일 변경 시)
- 문서만 변경 시 자동 푸시 스킵
- 환경 변수 `AUTO_PUSH=1` 설정 필요
- 스크립트: `scripts/automation/auto-push.js`

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

2. **feature 브랜치에서 자동 푸시**
```bash
# 환경 변수 설정 (한 번만)
export AUTO_PUSH=1

# 코드 작업 후 커밋
git add .
git commit -m "feat: 결제 기능 추가"
# Post-commit hook이 자동으로 원격 저장소에 푸시
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

#### GitHub Issue 자동 닫기 (PR 머지 시)
Pull Request가 main 브랜치에 머지될 때 커밋 메시지 또는 PR 제목에 패턴을 포함하면 자동으로 Issue가 닫힙니다:

```bash
# 단일 Issue 닫기
git commit -m "feat: 결제 시스템 구현 - Closes #123"

# 여러 Issue 동시 닫기
git commit -m "fix: 여러 버그 수정 - Closes #10, #12, #15"
```

지원되는 키워드:
- `Closes #123` - Issue 닫기
- `Fixes #456` - 버그 수정
- `Resolves #789` - 일반 완료

## 🛠️ 수동 실행

### 코드 품질 검사
```bash
npm run lint          # ESLint 실행
npm run format:check  # Prettier 체크
npm run format        # Prettier 자동 포맷팅
```

### 자동 푸시 활성화
```bash
# Windows (PowerShell)
$env:AUTO_PUSH=1

# macOS/Linux
export AUTO_PUSH=1
```

## 📁 파일 구조

```
프로젝트/
├── .husky/
│   ├── pre-commit        # Pre-commit hook (코드 품질 검사)
│   ├── post-commit       # Post-commit hook (자동 푸시)
│   └── pre-push          # Pre-push hook (최종 검증)
├── scripts/
│   └── automation/
│       ├── auto-push.js           # 자동 푸시
│       ├── pre-commit-checks.ts   # 코드 품질 검사
│       ├── pre-push-guard.js      # Push 전 검증
│       ├── security-scan.js       # 보안 스캔
│       └── test-automation.ts     # 테스트 자동화
├── .lintstagedrc.json    # lint-staged 설정
└── docs/
    ├── work-plans/       # 진행 중인 작업 계획
    └── library/          # 완료된 기능 문서
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

### Post-commit (자동 푸시)이 작동하지 않는 경우

1. **환경 변수 확인**
```bash
# Windows (PowerShell)
echo $env:AUTO_PUSH

# macOS/Linux
echo $AUTO_PUSH
```

2. **브랜치 확인** (main 브랜치에서는 자동 푸시 안 됨)
```bash
git branch --show-current
```

3. **수동 푸시**
```bash
git push origin feature/your-branch
```

4. **자동 푸시 스크립트 직접 실행 (디버깅)**
```bash
node scripts/automation/auto-push.js
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

## 📊 작업 추적 (GitHub Milestones)

이 프로젝트는 **GitHub Milestones**와 **Issues**를 사용하여 작업을 추적합니다.

### Milestone 기반 워크플로우

#### 1. Issue 생성 및 Milestone 할당
```bash
# 새 기능 Issue 생성
gh issue create \
  --title "[Feature] 결제 시스템 구현" \
  --milestone "Phase 1: Core Platform"

# 버그 수정 Issue 생성
gh issue create \
  --title "[Bug] 로그인 오류 수정" \
  --milestone "Phase 1: Core Platform"
```

#### 2. 진행 상황 확인
```bash
# 특정 Milestone의 모든 Issue 조회
gh issue list --milestone "Phase 1: Core Platform"

# 열린 Issue만 조회
gh issue list --milestone "Phase 1: Core Platform" --state open

# 닫힌 Issue만 조회
gh issue list --milestone "Phase 1: Core Platform" --state closed
```

#### 3. 커밋 메시지로 Issue 자동 닫기
Pull Request가 main 브랜치에 머지되면 커밋 메시지의 키워드로 자동으로 Issue가 닫힙니다:

```bash
# 단일 Issue 닫기
git commit -m "feat: 결제 시스템 구현 완료 - Closes #123"

# 여러 Issue 동시 닫기
git commit -m "fix: 여러 버그 수정 - Closes #10, #12, #15"

# PR 제목에 포함
gh pr create --title "feat: 새 기능 - Closes #67"
```

**지원 키워드**:
- `Closes #123` - 일반 완료
- `Fixes #123` - 버그 수정
- `Resolves #123` - 일반 해결

### 작업 계획 문서 (Work Plans)

#### 진행 중 작업
`docs/work-plans/` 폴더에서 관리:
- 체크리스트 기반 진행 상황 추적
- 기술 결정 및 리스크 기록
- 테스트 계획 포함

#### 완료된 기능
완료 후 `docs/library/`로 승격:
- 아키텍처 및 구현 가이드
- 주요 의사결정 기록 (ADR-lite)
- 테스트 및 검증 방법
- 관련 파일 경로 및 PR 링크

#### Milestone 진행률 확인
GitHub 웹 대시보드에서 시각적으로 확인:
```
https://github.com/Hulkeinstein/dvs-template01/milestones
```

### 현재 활성 Milestones
- **Phase 1: Core Platform** (2025-08-31) - 학생/교사 핵심 기능
- **Phase 2: Admin System** (2025-09-15) - PreSkool 통합
- **Phase 3: Enhancement** (Open) - 성능 최적화, AI 기능

## 🚀 고급 설정

### 커스텀 검사 추가
`scripts/automation/pre-commit-checks.ts` 파일을 수정하여 추가 검사를 설정할 수 있습니다.

### 자동 푸시 조건 커스터마이징
`scripts/automation/auto-push.js` 파일에서 다음을 설정할 수 있습니다:
- 푸시 대상 파일 확장자 (현재: `.js`, `.jsx`, `.ts`, `.tsx`, `.json`)
- 제외할 브랜치 (현재: `main`, `master`)
- 문서 전용 커밋 판단 로직

## 📝 참고사항

- Pre-commit hook은 ESLint/Prettier 오류 시 커밋을 차단합니다
- Post-commit hook(자동 푸시)은 feature 브랜치에서만 작동합니다
- 문서만 변경된 경우 자동 푸시가 스킵됩니다
- 시스템은 Windows/Mac/Linux 모두 호환됩니다
- GitHub Issue 자동 닫기는 PR이 main에 머지될 때만 작동합니다