# 일반적인 문제 & 해결방법

## Supabase 문제

### Supabase 경고
- "@supabase/realtime-js" 경고는 정상이며 무시해도 됩니다
- 기능에 영향을 주지 않습니다

### 코스 생성 실패
- Supabase에서 사용자 역할이 'instructor'인지 확인
- `/api/user/profile`이 올바른 형식을 반환하는지 확인
- RLS 정책이 제대로 구성되었는지 확인

### 데이터베이스 연결 문제
- 환경 변수가 올바르게 설정되었는지 확인
- Supabase 프로젝트가 일시 중지되지 않았는지 확인
- Service role key가 적절한 권한을 가지고 있는지 확인

## 파일 업로드 문제

### 파일 업로드 실패
- 파일 크기가 5MB 미만인지 확인
- 파일 타입이 이미지(jpg, png, webp)인지 확인
- Supabase bucket이 존재하고 public 접근이 가능한지 확인
- Supabase 대시보드에서 bucket 권한 확인

### Base64 변환 오류
- 변환 전에 파일이 제대로 선택되었는지 확인
- 브라우저 콘솔에서 특정 오류 메시지 확인
- `/app/lib/utils/fileUpload.js` 함수 확인

## 레슨 관리 문제

### 레슨 재정렬 작동 안함
- `@dnd-kit` 패키지가 설치되었는지 확인
- 레슨 ID가 고유한지 확인
- DB의 order_index 값 확인
- 드래그 핸들이 제대로 구현되었는지 확인

### 편집 버튼 작동 안함
- 코스 ID가 올바르게 전달되었는지 확인
- 경로가 존재하는지 확인: `/instructor/courses/[id]/edit`
- 사용자가 해당 코스를 소유하고 있는지 확인
- 브라우저 콘솔에서 라우팅 오류 확인

## 퀴즈 시스템 문제

### Zod 검증 오류 (_zod)
- **문제**: Zod v4.0.14가 "_zod" 속성을 생성함
- **해결책**: Zod v3.25.76 사용
- **확인**: `package.json`에서 올바른 버전 확인

### 레슨에 퀴즈가 표시되지 않음
- `content_type`이 'quiz'로 설정되었는지 확인
- topic_id가 올바르게 할당되었는지 확인
- course_topics 테이블에 올바른 sort_order가 있는지 확인
- getLessonsByCourseAndTopic 쿼리 확인

### 비디오 플레이스홀더 작동 안함
- videoUtils.js가 올바르게 import되었는지 확인
- Quill 에디터 모듈 설정 확인
- 저장 전에 변환이 일어나는지 확인
- HTML 컨텐츠에 placeholder div가 있는지 확인

## 인증 문제

### Google OAuth 작동 안함
- Google Client ID와 Secret 확인
- Google Console에서 승인된 redirect URI 확인
- NEXTAUTH_URL이 올바르게 설정되었는지 확인
- NextAuth 설정 확인

### 역할 기반 리디렉트 문제
- Supabase 데이터베이스에서 사용자 역할 확인
- middleware.js에서 라우팅 로직 확인
- 세션에 역할 정보가 포함되어 있는지 확인
- 브라우저 쿠키 삭제 후 다시 로그인

## 스타일링 문제

### CSS 변경사항이 적용되지 않음
- **CSS 파일을 직접 수정하지 마세요**
- 항상 `/public/scss/`의 SCSS 파일을 편집하세요
- `styles.scss`에 새 SCSS를 import
- SCSS를 CSS로 컴파일하기 위해 build 실행

### Bootstrap 충돌
- 충돌하는 클래스 이름 확인
- Bootstrap 버전 확인 (5.x)
- 올바른 import 순서 확인
- 커스텀 오버라이드 확인

## 성능 문제

### 느린 페이지 로드
- 불필요한 client components 확인
- 이미지 최적화 확인 (WebP, lazy loading)
- `npm run analyze`로 번들 크기 검토
- useEffect에서 메모리 누수 확인

### 느린 데이터베이스 쿼리
- Supabase에 적절한 인덱스 추가
- 특정 커럼 선택으로 쿼리 최적화
- 대용량 데이터셋에 페이지네이션 사용
- 캐싱 전략 고려

## GitHub Actions CI 문제

### Prettier 검사 실패
- 로컬에서 `npm run format` 실행
- `.prettierrc.json` 설정 확인
- `endOfLine: "auto"` 설정 확인
- 모든 파일이 포맷팅되었는지 확인

### ESLint 오류
- 로컬에서 `npm run lint` 실행
- 모든 오류 수정 (경고는 제외)
- 사용하지 않는 변수 확인
- import 문 확인

### 빌드 실패
- TypeScript 오류 확인
- 모든 의존성이 설치되었는지 확인
- CI의 환경 변수 확인
- 특정 오류에 대한 빌드 로그 검토

## 개발 환경 문제

### 3000번 포트가 이미 사용 중
- 기존 Next.js 프로세스 확인
- 프로세스 종료: `taskkill /F /IM node.exe` (Windows)
- 또는 다른 포트 사용: `npm run dev -- -p 3001`

### 모듈을 찾을 수 없음 오류
- `npm install` 실행
- `node_modules` 삭제 후 재설치
- import 경로에 오타 확인
- 파일 확장자 확인 (.js vs .jsx)

### Hot Reload 작동 안함
- `.next` 폴더 권한 확인
- Next.js 캐시 삭제: `rm -rf .next`
- 개발 서버 재시작
- 구문 오류 확인

## 빠른 수정 체크리스트

1. **모든 캐시 삭제**
   ```bash
   rm -rf .next
   rm -rf node_modules
   npm install
   ```

2. **데이터베이스 연결 재설정**
   - Supabase 프로젝트 재시작
   - 새 service role key 생성
   - 환경 변수 업데이트

3. **포맷팅 문제 해결**
   ```bash
   npm run format
   npm run lint -- --fix
   ```

4. **환경 확인**
   ```bash
   node -v  # 18+ 이상이어야 함
   npm -v   # 9+ 이상이어야 함
   ```