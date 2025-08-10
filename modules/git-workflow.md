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

## 커밋 메시지 컨벤션

### 기본 타입
- `feat:` 새로운 기능
- `fix:` 버그 수정
- `docs:` 문서 수정
- `style:` 코드 스타일 변경 (기능 변경 없음)
- `refactor:` 코드 리팩토링
- `test:` 테스트 추가/수정
- `chore:` 빌드, 패키지 등 기타 작업

### 특수 패턴 (태스크 완료)
- `Closes: Phase X, Task Y` - 태스크 자동 아카이빙 (main 브랜치에서만 작동)
- 지원 형식: `Closes: P1, T2`, `완료: Phase 1, Task 2`, `Done: Phase 1, Task 2`

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

## 트러블슈팅

### PR이 CI에서 막힐 때
1. GitHub Actions 로그 확인
2. `npm run lint` 및 `npm run format:check` 실행
3. 자동 수정: `npm run format`

### 브랜치 충돌 해결
main과 merge 후 충돌 해결하고 커밋

## 관련 문서
- 자동화 시스템: `modules/task-automation.md`