# Git Workflow Guide (GitHub Flow)

## 브랜치 전략
- **main**: 항상 배포 가능한 상태 유지
- **feature branches**: 모든 새 작업은 main에서 분기

## 브랜치 네이밍 규칙
- `feature/*` - 새로운 기능 (예: feature/certificate-templates)
- `fix/*` - 버그 수정 (예: fix/enrollment-error)  
- `hotfix/*` - 긴급 수정 (예: hotfix/payment-critical)
- `chore/*` - 유지보수 작업 (예: chore/update-dependencies)
- `docs/*` - 문서 작업 (예: docs/api-documentation)
- `refactor/*` - 코드 리팩토링 (예: refactor/course-actions)

## Claude Code 작업 규칙
- **IMPORTANT**: main 브랜치에서 새로운 작업을 시작하기 전에 항상 새 브랜치 생성 여부를 확인
- main 브랜치에서는 직접 작업하지 않음
- 브랜치 머지 후 main으로 돌아왔을 때, 다음 작업 시작 전 반드시 새 브랜치 생성 프롬프트 표시

## 워크플로우 단계

### 1. 브랜치 생성
```bash
git checkout main
git pull origin main
git checkout -b feature/your-feature-name
```

### 2. 작업 & 커밋
```bash
git add .
git commit -m "feat: Your feature description"
```

### 3. main 브랜치와 동기화
```bash
git checkout main
git pull origin main
git checkout feature/your-feature-name
git merge main
```

### 4. 푸시 & PR 생성
```bash
git push origin feature/your-feature-name
# GitHub에서 Pull Request 생성
```

### 5. 머지 후 정리
```bash
git checkout main
git pull origin main
git branch -d feature/your-feature-name
git push origin --delete feature/your-feature-name
```

## 커밋 메시지 컨벤션
- `feat:` 새로운 기능
- `fix:` 버그 수정
- `docs:` 문서 수정
- `style:` 코드 스타일 변경 (기능 변경 없음)
- `refactor:` 코드 리팩토링
- `test:` 테스트 추가/수정
- `chore:` 빌드, 패키지 등 기타 작업

### 예시
- `feat: Add certificate template selection UI`
- `fix: Resolve course enrollment error`
- `docs: Update README with setup instructions`

## 커밋 메시지 작성 가이드
**자세한 커밋 메시지를 작성하세요** - 미래의 디버깅과 코드 리뷰를 위해 충분한 맥락을 포함

### 추천 형식
```
<type>: <짧은 요약> (50자 이내)

<왜 이 변경이 필요했는지> (선택사항)

<무엇을 변경했는지> (상세 내용)
- 변경사항 1
- 변경사항 2
- ...

<어떤 문제를 해결했는지>
```

### 실제 예시
```
fix: 퀴즈 시스템 _zod 에러 및 데이터 로드 문제 해결

사용자가 샘플 퀴즈를 저장할 때 _zod 에러가 발생하고,
퀴즈가 레슨 목록에 표시되지 않는 문제가 있었습니다.

변경사항:
- Zod v4.0.14 → v3.25.76 다운그레이드
- 샘플 퀴즈 True/False correctAnswer 타입 수정
- course_topics 정렬 컬럼 수정 (order_index → sort_order)
- 퀴즈 로드 로직 개선

해결된 이슈:
- 퀴즈 저장 시 "_zod" 에러
- 토픽 로드 실패
- 퀴즈가 레슨 목록에 표시되지 않음
```

## GitHub Actions CI/CD

### Prettier 체크
- 모든 PR에서 자동 실행
- `npm run format:check` 사용
- 실패 시 PR 머지 불가

### ESLint 체크
- 모든 PR에서 자동 실행
- `npm run lint` 사용
- Error는 반드시 수정, Warning은 선택적

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