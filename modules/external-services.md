# 외부 서비스 통합

## 🔐 인증 서비스

### Google OAuth
- **제공자**: Google Cloud Platform
- **용도**: 소셜 로그인
- **설정 위치**: Google Cloud Console → APIs & Services → Credentials
- **콜백 URL**: `{NEXTAUTH_URL}/api/auth/callback/google`
- **필수 환경변수**:
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`

### NextAuth.js
- **버전**: 최신 (package.json 참조)
- **설정**: `/app/api/auth/[...nextauth]/`
- **세션 전략**: JWT
- **쿠키 설정**: httpOnly, secure(프로덕션)

## 📧 이메일 서비스

### Resend
- **용도**: 트랜잭션 이메일 (비밀번호 재설정, 알림)
- **무료 티어**: 월 100통 (개발/테스트 충분)
- **유료 전환 시점**: MAU 1000+ 또는 월 100통 초과
- **대안**: Amazon SES, SendGrid, Mailgun, Brevo
- **필수 환경변수**:
  - `RESEND_API_KEY`
  - `EMAIL_FROM`

### 발신자 설정 가이드

#### 단계별 접근
1. **MVP 단계**: 단일 EMAIL_FROM 사용
   ```env
   EMAIL_FROM="DVS Education <noreply@dvs-education.com>"
   ```

2. **성장 단계**: 용도별 분리
   ```env
   # 트랜잭션 이메일 (비밀번호 재설정, 계정 인증)
   EMAIL_FROM_TRANSACTIONAL="DVS <noreply@dvs-education.com>"
   
   # 마케팅/프로모션
   EMAIL_FROM_MARKETING="DVS 마케팅팀 <marketing@dvs-education.com>"
   
   # 시스템 알림 (코스 등록, 레슨 완료)
   EMAIL_FROM_SYSTEM="DVS 알림 <notifications@dvs-education.com>"
   
   # 고객 지원
   EMAIL_FROM_SUPPORT="DVS 고객지원 <support@dvs-education.com>"
   ```

3. **엔터프라이즈**: 서브도메인 활용
   ```env
   EMAIL_FROM="DVS <noreply@mail.dvs-education.com>"
   ```

#### 현업 표준 패턴
- **주소 부분**:
  - `no-reply@` 또는 `noreply@` (65% 사용)
  - `notifications@` (시스템 알림용)
  - `support@` (고객 지원용)
  - `marketing@` (프로모션용)

- **Display Name 권장사항**:
  - **간결함**: "DVS" 또는 "DVS Education"
  - **목적 명시**: "DVS 비밀번호 재설정"
  - **부서 표시**: "DVS 보안팀"
  - **신뢰성**: 과도한 느낌표나 대문자 사용 금지

#### 이메일 전달률 향상
- **SPF 설정**: 발신 서버 인증
- **DKIM 서명**: 이메일 변조 방지
- **DMARC 정책**: 위조 방지
- **더블 옵트인**: 수신 동의 확인

## 🗄️ 데이터베이스

### Supabase
- **역할**: PostgreSQL DB, Storage, Auth(선택)
- **버킷**:
  - `course-materials` - 코스 자료 (5MB 제한)
  - `profiles` - 프로필 이미지 (5MB 제한)
  - `attachments` - 첨부파일 (50MB 제한)
- **마이그레이션**: `/supabase/migrations/`
- **주요 테이블**: user, courses, lessons, enrollments, orders, quiz_attempts
- **필수 환경변수**:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (서버 전용)

#### Storage 버킷 정책
```sql
-- course-materials 버킷 (공개 읽기)
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'course-materials');

-- profiles 버킷 (소유자만)
CREATE POLICY "Users can manage own profile images" ON storage.objects
  FOR ALL USING (auth.uid()::text = (storage.foldername(name))[1]);
```

## 🎨 UI 프레임워크

### Bootstrap 5 (HiStudy 템플릿)
- **커스터마이징**: `/public/scss/`
- **컴파일**: SCSS → CSS
- **주의**: CSS 로드 순서, 커스텀 스타일 우선순위

### shadcn/ui + Tailwind CSS
- **용도**: Admin Dashboard, 모던 컴포넌트
- **설정**: `tailwind.config.js`, `components.json`

## 🚀 배포 플랫폼

### Vercel (권장)
- **자동 배포**: main 브랜치 푸시 시
- **프리뷰**: PR 생성 시
- **환경변수**: Vercel Dashboard에서 관리
- **빌드 명령어**: `npm run build`

### 대안 플랫폼
- **Netlify**: JAMstack 특화
- **Railway**: 풀스택 앱 친화적
- **AWS Amplify**: AWS 생태계 통합

## 💰 비용 구조 (예상)

### 개발/테스트 환경 (무료)
- Vercel: Hobby Plan (무료)
- Supabase: Free Tier (500MB DB, 1GB Storage)
- Resend: 100통/월 무료
- Google OAuth: 무료

### 프로덕션 (예상 월 비용)
- Vercel Pro: $20/월
- Supabase Pro: $25/월 (8GB DB, 100GB Storage)
- Resend: $20/월 (50,000통)
- 총 예상: **~$65/월**

## 📊 모니터링 및 로깅

### 에러 추적
- **Sentry** (권장) - 프론트엔드/백엔드 에러 추적
- **LogRocket** (대안) - 사용자 세션 리플레이

### 성능 모니터링
- **Vercel Analytics** - 기본 제공
- **Posthog** - 사용자 행동 분석

### 업타임 모니터링
- **UptimeRobot** - 무료 모니터링
- **Pingdom** - 고급 모니터링

## 🔧 개발 도구

### 코드 품질
- **ESLint** - JavaScript/TypeScript 린팅
- **Prettier** - 코드 포맷팅
- **Husky** - Git hooks 관리

### 테스팅
- **Jest** - 단위 테스트
- **Playwright** - E2E 테스트
- **Storybook** - 컴포넌트 문서화

## 유지보수 규칙

### 서비스 추가 시
1. 이 문서에 새 섹션 추가
2. 환경변수 문서 업데이트
3. 비용 구조 재검토
4. 보안 감사 실시

### 정기 점검 (월 1회)
- [ ] 의존성 보안 업데이트 (`npm audit`)
- [ ] API 키 순환 (분기별)
- [ ] 사용량 모니터링 및 비용 최적화
- [ ] 백업 및 복구 테스트

### 장애 대응
1. **Supabase 장애**: 읽기 전용 모드로 전환
2. **Resend 장애**: 대체 이메일 서비스 활성화
3. **Vercel 장애**: 대체 배포 플랫폼 준비

## 📞 지원 연락처

### 기술 지원
- **Supabase**: [Discord](https://discord.supabase.com)
- **Resend**: [Support](https://resend.com/support)
- **Vercel**: [Support](https://vercel.com/support)

### 보안 이슈
- 즉시 관련 서비스에 보고
- 내부 보안팀에 에스컬레이션
- 사용자 공지 준비

---

**마지막 업데이트**: 2025-02-11  
**담당자**: 개발팀  
**검토 주기**: 분기별