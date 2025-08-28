# Git 워크플로우 가이드 (GitHub Flow)

## 브랜치 전략
- **main**: 항상 배포 가능한 상태 유지
- **feature branches**: 모든 새 작업은 main에서 분기

## 브랜치 네이밍 규칙
- `feature/*` - 새로운 기능
- `fix/*` - 버그 수정
- `hotfix/*` - 긴급 수정
- `chore/*` - 유지보수 작업
- `docs/*` - 문서 작업
- `refactor/*` - 코드 리팩토링

## Claude Code 작업 규칙
- **IMPORTANT**: main 브랜치에서 새로운 작업을 시작하기 전에 항상 새 브랜치 생성 여부를 확인
- main 브랜치에서는 직접 작업하지 않음
- 브랜치 머지 후 main으로 돌아왔을 때, 다음 작업 시작 전 반드시 새 브랜치 생성 프롬프트 표시
- **커밋 및 PR 규칙**: 모든 테스트 완료 후 사용자의 명시적 승인을 받은 후에만 커밋 및 PR 생성 진행

## 커밋 메시지 컨벤션

### 기본 타입
- `feat:` 새로운 기능
- `fix:` 버그 수정
- `docs:` 문서 수정
- `style:` 코드 스타일 변경 (기능 변경 없음)
- `refactor:` 코드 리팩토링
- `test:` 테스트 추가/수정
- `chore:` 빌드, 패키지 등 기타 작업

### TypeScript 마이그레이션 커밋 규칙
**중요: JS 삭제와 TS 추가를 절대 한 커밋에서 하지 마세요!**

#### 올바른 커밋 순서:
```bash
# 1단계: TS 버전 추가 (JS 파일 유지)
git add Component.tsx
git commit -m "refactor(ts): add TypeScript version of Component"

# 2단계: Import 업데이트
git add parentComponent.js
git commit -m "refactor(ts): update imports to use TypeScript Component"

# 3단계: 테스트 및 검증 (커밋 없음, 테스트만)
npm run dev
npm run type-check

# 4단계: 사용자 승인 후 JS 삭제
git rm Component.js
git commit -m "refactor(ts): remove JS version after verification"
```

#### ❌ 잘못된 예시:
```bash
# 한 커밋에서 JS 삭제와 TS 추가를 동시에
git rm Component.js
git add Component.tsx
git commit -m "refactor: migrate Component to TypeScript"  # 위험!
```

### GitHub Issue 연동
- `Closes #123` - PR 머지 시 Issue 자동 닫기
- `Fixes #123` - 버그 수정 시 사용
- `Resolves #123` - 일반 작업 완료 시

예시:
```bash
git commit -m "feat: 새 기능 구현 - Closes #10"
git commit -m "fix: 로그인 버그 수정 - Fixes #11"
git commit -m "refactor: 인증 시스템 개선 - Closes #12, #13"
```

## Milestones 체계 (2025년 1월 11일 도입)

### 현재 Milestones
- **Phase 1: Core Platform** (목표: 2025년 8월 31일)
  - 학생/교사 핵심 기능 완성
  - 코스 등록, 결제, 레슨 뷰어, 진도 추적
  
- **Phase 2: Admin System** (목표: 2025년 9월 15일)
  - PreSkool 템플릿 활용 관리자 대시보드
  - SSO 통합, Badge 관리 시스템
  
- **Phase 3: Enhancement & Optimization** (오픈)
  - 성능 최적화, AI 기능, 다국어 지원

### Issue 생성 시 Milestone 지정
```bash
# Issue 생성 시 Milestone 지정
gh issue create --title "[Feature] 기능명" --milestone "Phase 1: Core Platform"

# Milestone별 Issue 확인
gh issue list --milestone "Phase 1: Core Platform"
```

### Issue 템플릿
```markdown
## 📋 개요
[기능 설명]

## ✅ Tasks
- [ ] 작업 1
- [ ] 작업 2

## 🎯 Acceptance Criteria
- 조건 1
- 조건 2

## 📅 예상 작업 시간
- 총 X시간
```

### 💡 Solo Developer + Claude Code 협업 방식

이 프로젝트는 Solo Developer + Claude Code 협업으로 진행됩니다.

#### Claude Code 작업 가이드
1. **작업 시작 전**
   - GitHub Issues 확인 (`gh issue list --state open`)
   - 해당 Issue에 맞는 브랜치 생성
   - TodoWrite 도구로 작업 계획 수립

2. **작업 진행 중**
   - Issue의 Tasks 체크리스트 기반 작업
   - 각 Task 완료 시 TodoWrite로 진행 상황 추적
   - 중요 변경사항은 커밋으로 기록

3. **작업 완료 후**
   - 커밋 메시지에 `Closes #번호` 포함
   - PR 생성 또는 직접 push (브랜치에 따라)
   - Issue 자동 종료 확인

#### Projects Board 활용 (선택)
- **To Do**: 새로 생성된 Issues
- **In Progress**: 작업 중인 Issues
- **Done**: 완료된 Issues
- GitHub Projects로 전체 진행 상황 시각화

## Hotfix 프로세스

긴급 수정이 필요한 경우:

### 1. Hotfix 브랜치 생성
```bash
git checkout main
git pull origin main
git checkout -b hotfix/<issue>-<description>
```

### 2. 수정 및 테스트
- 긴급 수정 구현
- 로컬 테스트 필수
- 커밋 메시지: `hotfix: <설명> - Fixes #<issue>`

### 3. PR 생성 및 머지
- **PR 생성 → CI 통과 → 신속 머지** (리뷰 생략 가능, PR은 필수)
- 머지 즉시 배포(Promote) 및 모니터링
- GitHub Flow에서는 **backport 대상 브랜치가 없음** (그냥 끝)

## 릴리스/태깅 (선택)

- 릴리스 노트 자동화 사용 시 Release Drafter 또는 Changesets/standard-version 중 택1
- 태그 형식: `v1.2.3` 혹은 `app@<git-sha>` (Sentry 등 연동 시 편리)

## 롤백

### 코드 롤백
- PR 화면의 **Revert** 버튼 사용
- 또는 `git revert <merge-commit-sha>`

### 배포 롤백
- Vercel/플랫폼에서 이전 빌드 **Promote/rollback**

### DB 롤백
- 다운 마이그레이션 또는 후속 마이그레이션으로 복구

## 브랜치 생명주기

- 작업 브랜치는 **작게, 짧게**. 1~3일 내 머지 목표
- 2주 이상 정체 브랜치는 정리 또는 분할 권고
- 장기 브랜치 사용 금지 (GitHub Flow의 핵심 원칙)

## 간단한 작업의 브랜치 전략

### 브랜치 생성이 필요 없는 경우
- 문서 수정 (CLAUDE.md, README.md)
- 설정 파일 간단한 수정
- 오타 수정
- 주석 추가/수정

### 브랜치 생성이 필요한 경우
- 코드 로직 변경
- 새 기능 추가
- 버그 수정
- 패키지 업데이트
- 데이터베이스 스키마 변경

## PR 머지 후 체크리스트

### 1. GitHub에서 브랜치 삭제
- PR 머지 화면에서 "Delete branch" 버튼 클릭
- 또는 Settings > General > "Automatically delete head branches" 활성화 권장

### 2. 로컬 환경 정리
```bash
# main 브랜치로 전환
git checkout main
git pull origin main

# 머지된 원격 브랜치 참조 정리
git remote prune origin

# 머지된 로컬 브랜치 확인
git branch --merged main

# 안전한 로컬 브랜치 삭제
git branch -d feature/branch-name
```

### 3. 원격 브랜치 수동 삭제 (필요시)
```bash
# 원격 브랜치 확인
git branch -r --merged origin/main

# 특정 원격 브랜치 삭제
git push origin --delete branch-name
```

## 브랜치 보호 규칙 (GitHub 설정)

### 필수 설정
- **Require pull request before merging**: ON
- **Required status checks**: 
  - ci (type-check, lint, build, test)
  - semantic-pr (또는 commitlint)
- **Require conversation resolution**: ON
- **Allow merge type**: Squash only
- **Force-push**: 금지
- **머지 후 브랜치 자동 삭제**: ON

이 설정만 지켜도 main 브랜치가 더럽혀지는 일은 없습니다.

## CI/CD 워크플로우

### CI 트리거
```yaml
# .github/workflows/ci.yml
name: CI Checks
on:
  pull_request:
    branches: [main]
  push:
    branches: [main]  # main 머지 시 배포 워크플로우 트리거
```

### 필수 체크 항목
1. `npm run type-check` - TypeScript 타입 검사
2. `npm run lint` - ESLint 검사
3. `npm run build` - 빌드 성공 확인
4. `npm test` (있으면) - 테스트 통과

프리뷰/프로덕션 배포는 Vercel 연동이면 PR/머지 이벤트만으로 충분합니다.

## 트러블슈팅

### PR이 CI에서 막힐 때
1. GitHub Actions 로그 확인
2. `npm run lint` 및 `npm run format:check` 실행
3. 자동 수정: `npm run format`

### 브랜치 충돌 해결
main과 merge 후 충돌 해결하고 커밋

## 주의사항

### GitHub Flow 핵심 원칙
- **develop 브랜치 없음** - main에서 직접 분기
- **장기 브랜치 금지** - 모든 브랜치는 단기간 내 머지
- **항상 PR 필수** - hotfix도 PR을 통해 머지
- **main은 항상 배포 가능** - 불안정한 코드 머지 금지

## 관련 문서
- 코드 품질 자동화: `modules/task-automation.md`
- PR 템플릿: `.github/pull_request_template.md`
- CI 설정: `.github/workflows/lint-check.yml`