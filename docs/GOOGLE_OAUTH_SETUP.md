# Google OAuth 설정 가이드

## 1. Google Cloud Console 설정

### 1.1 프로젝트 생성/선택
1. [Google Cloud Console](https://console.cloud.google.com) 접속
2. 프로젝트 선택 또는 새 프로젝트 생성

### 1.2 OAuth 동의 화면 구성
1. 좌측 메뉴에서 "APIs & Services" → "OAuth consent screen" 선택
2. User Type 선택:
   - **External**: 모든 Google 계정 사용자 (추천)
   - **Internal**: 조직 내부 사용자만 (G Suite 필요)
3. 앱 정보 입력:
   - App name: DVS Education Platform
   - User support email: 지원 이메일 주소
   - Developer contact information: 개발자 이메일
4. 스코프 추가:
   - email
   - profile
   - openid
5. 테스트 사용자 추가 (External 선택 시):
   - 테스트할 Google 계정 이메일 추가

### 1.3 OAuth 2.0 클라이언트 ID 생성
1. "APIs & Services" → "Credentials" 선택
2. "Create Credentials" → "OAuth client ID" 클릭
3. Application type: "Web application" 선택
4. 이름: "DVS Education Platform"
5. Authorized JavaScript origins:
   ```
   http://localhost:3000
   ```
6. Authorized redirect URIs:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
7. "Create" 클릭
8. Client ID와 Client Secret 복사

## 2. 환경 변수 설정

`.env.local` 파일에 다음 내용 추가:
```env
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here
```

## 3. 프로덕션 배포 시 추가 설정

### 3.1 OAuth 동의 화면
- Publishing status를 "In production"으로 변경
- 앱 검증 프로세스 완료 (필요한 경우)

### 3.2 Authorized URLs 추가
- JavaScript origins:
  ```
  https://yourdomain.com
  ```
- Redirect URIs:
  ```
  https://yourdomain.com/api/auth/callback/google
  ```

## 4. 일반적인 문제 해결

### "Access Denied" 에러
1. **OAuth 동의 화면이 구성되지 않음**
   - OAuth consent screen 설정 확인
   - 앱 이름, 이메일 등 필수 정보 입력 확인

2. **테스트 사용자 미등록 (External + Testing 상태)**
   - OAuth consent screen → Test users에 사용할 Google 계정 추가

3. **Redirect URI 불일치**
   - Credentials → OAuth 2.0 Client ID → Authorized redirect URIs 확인
   - 정확히 `/api/auth/callback/google` 경로 포함 필요

4. **Client ID/Secret 오류**
   - 환경 변수에 올바른 값이 설정되었는지 확인
   - 공백이나 특수문자가 포함되지 않았는지 확인

### "Configuration" 에러
- NEXTAUTH_SECRET이 설정되었는지 확인
- NEXTAUTH_URL이 올바른지 확인 (http://localhost:3000)

## 5. 테스트 방법

1. 개발 서버 시작:
   ```bash
   npm run dev
   ```

2. 브라우저에서 http://localhost:3000/login 접속

3. "Google 계정으로 로그인" 클릭

4. Google 계정 선택 및 권한 승인

5. 성공 시 홈페이지로 리디렉션

## 6. 보안 주의사항

- **Client Secret은 절대 공개하지 마세요**
- `.env.local` 파일은 `.gitignore`에 포함되어야 합니다
- 프로덕션 환경에서는 HTTPS 필수
- 정기적으로 Client Secret 재생성 권장

## 7. 추가 리소스

- [NextAuth.js Google Provider 문서](https://next-auth.js.org/providers/google)
- [Google OAuth 2.0 문서](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com)