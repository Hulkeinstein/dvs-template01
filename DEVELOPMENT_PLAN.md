# Development Plan & Progress

## 📊 현재 구현 상태

### 대시보드 구현 현황
- **교사 대시보드**: 95% 완성
  - ✅ 통계 위젯, 코스 CRUD, 레슨/퀴즈/과제 관리
  - ✅ 배지 시스템 (Hot, New, Featured, Bestseller 등)
  - ✅ Create Course 버튼 연결
  - ✅ 프리뷰 비디오 시스템
  - ❌ 코스 삭제 기능
  
- **학생 대시보드**: 30% 완성
  - ✅ 기본 UI 구조
  - ❌ 코스 등록, 진도 추적, 실제 데이터 연동

- **코스 시스템**: 85% 완성
  - ✅ 코스 CRUD, 썸네일 업로드, 레슨/퀴즈/과제 관리
  - ✅ Course Intro Video → Preview 연동
  - ✅ YouTube URL 자동 변환 (youtu.be → youtube.com)
  - ✅ 레슨 타입별 배지 표시 (Quiz, Assignment, Lesson)
  - ❌ 등록/결제, 리뷰 시스템

## 🚀 현재 작업 중인 기능
- 학생 코스 등록 시스템
- 결제 통합 (Stripe/Local payment)
- 레슨 뷰어 구현

## ✅ 최근 완료된 작업 (2025-02-13)
- 배지 시스템 구현 (자동 계산 및 수동 설정)
- Course Intro Video를 프리뷰로 사용하도록 개선
- YouTube URL 형식 자동 변환 (모든 형식 지원)
- Create Course 버튼 라우팅 수정
- 레슨 타입별 UI 통일 (교사/학생 페이지)
- 디버그 코드 정리 및 코드 품질 개선

> 전체 완료 작업은 GitHub Issues (Closed)에서 확인할 수 있습니다.

## 🐛 현재 이슈

### 학생 대시보드 RPC 타입 불일치
- **위치**: `/student-enrolled-course` 페이지
- **에러 코드**: `42804`
- **상세**: `getEnrolledCoursesRPC` 함수 반환 타입 불일치
  - Column 5: `character varying(50)` → `text` 불일치
- **우선순위**: P2 (중요 - checkout 완료 후 처리)
- **영향**: 학생 등록 코스 목록 조회 실패
- **해결 방법**:
  1. Supabase 함수 `getEnrolledCoursesRPC` 정의 확인
  2. 반환 타입을 `text`로 통일 또는 `::text` 캐스팅
  3. TypeScript 타입 정의 동기화

---

## 📅 개발 로드맵

### Phase 1: Core Platform (Week 1-2) - 진행 중
**목표**: 학생과 교사가 실제로 사용할 수 있는 핵심 기능 완성

#### Week 1: Student Core Features
**Day 1-2: Course Enrollment Process**
- [x] Course detail page (`/course-details/[courseId]`) ✅
- [ ] Bookmark functionality (add/remove) 🟡 (Server Actions 완료, UI 버튼만 추가 필요)
- [x] Enrollment/Purchase flow ✅
- [x] Payment integration (PayPal) ✅

**Day 3-4: Learning System**
- [ ] Lesson viewer page (`/lesson/[id]`)
- [ ] Video player with progress tracking
- [ ] Quiz taking interface
- [ ] Lesson completion logic

**Day 5: Student Dashboard Completion**
- [ ] Display enrolled courses (real data)
- [ ] Display bookmarked courses section
- [ ] Progress tracking UI
- [ ] Next lesson recommendations

#### Week 2: Supporting Features
**Day 1-2: Review & Rating System**
- [ ] Review submission form
- [ ] Rating display on courses
- [ ] Instructor review management

**Day 3: Search & Discovery**
- [ ] Course search functionality
- [ ] Category/Level filters
- [ ] Featured courses section

**Day 4-5: Testing & Bug Fixes**
- [ ] Full user journey testing
- [ ] Payment flow verification
- [ ] Performance optimization

### Assignment 템플릿 시스템 (선택사항)
**목표**: 선생님들이 자주 사용하는 과제를 템플릿으로 저장

- [ ] "템플릿으로 저장" 버튼 추가
- [ ] "내 템플릿" 목록에서 불러오기
- [ ] 템플릿 삭제 기능

---

## 🧪 테스트 & 품질 보증

### 테스트 인프라 상태
**현재 달성도**: 60% 완료
- ✅ 유닛 테스트: 24개 (전체 통과)
- ✅ 통합 테스트: 4개 (전체 통과)
- ✅ E2E 인프라: Playwright 설치 완료
- 🟡 E2E 테스트: 5개 시나리오 작성 (4개 실패, 1개 스킵)
- ❌ 커버리지: ~65% (목표 70%)
- ❌ CI/CD: 미구축

### A. 테스트 인프라 완성 (부분 완료)
**예상 소요 시간**: Redux 상태 문제 해결 필요 (2-3시간)

- [x] 유닛 테스트 구조 완성 (24개 테스트)
- [x] 통합 테스트 추가 (4개 테스트)
- [x] E2E 테스트 인프라 구축 (Playwright)
- [x] E2E 테스트 시나리오 작성 (5개)
- [x] E2E 테스트 첫 실행 및 분석 (10-16)
- [x] E2E 테스트 경로 수정 (`/courses` → `/all-courses`)
- [x] E2E 테스트 selector 수정 (10-19: `button` → `text`)
- [x] TEST_REPORT.md 업데이트 (2025-10-19)
- [x] E2E 테스트 재실행 (10-19: 1 pass, 3 fail, 1 skip)
- [ ] Redux cart state E2E 환경 이슈 해결

**E2E 테스트 현황 (2025-10-19)**:
- ✅ 경로 문제 해결: `/courses` → `/all-courses` 수정 완료
- ✅ Selector 문제 해결: `getByRole('button')` → `getByText('Add to Cart')`
- ✅ 1개 테스트 통과: "Display correct total with tax calculation"
- ❌ **남은 문제**: Redux cart state가 E2E 환경에서 persist되지 않음
  - 수동 테스트는 정상 작동
  - E2E 테스트에서 "Add to Cart" 클릭 후 장바구니 비어있음
  - 근본 원인: Redux store 초기화 또는 state persistence 이슈
- 📝 다음 단계: Redux E2E 환경 설정 점검 또는 localStorage 확인
- 우선순위: P2 (중기)

### B. 테스트 커버리지 향상
**예상 소요 시간**: 4-5시간
**우선순위**: P2 (중기)

- [ ] `app/lib/actions/orderActions.ts` 테스트 작성
- [ ] `app/lib/actions/userActions.ts` 테스트 작성
- [ ] `hooks/useCart.ts` 훅 테스트 작성
- [ ] `components/Cart/` 컴포넌트 테스트 추가
- [ ] 커버리지 70% 달성 확인
- [ ] 커버리지 리포트 HTML 생성

**대상 파일**:
```
우선순위 순:
1. orderActions.ts (주문 생성 로직)
2. userActions.ts (사용자 관리)
3. useCart.ts (장바구니 훅)
4. Cart 컴포넌트들
```

### C. CI/CD 파이프라인 구축
**예상 소요 시간**: 완료 ✅
**우선순위**: P1 (완료)
**현재 달성도**: 100% (배지 추가 완료)

- [x] GitHub Actions workflow 생성 (`.github/workflows/lint-check.yml`) ✅
- [x] 자동 테스트 실행 설정 (PR 생성/업데이트 시) ✅
- [x] 테스트 실패 시 머지 차단 설정 ✅
- [x] 커버리지 리포트 자동 생성 ✅
- [x] 커버리지 임계값 검증 (Lines 65%, Functions 60%, Branches 50%) ✅
- [x] PR 자동 커버리지 댓글 ✅
- [x] 테스트 아티팩트 업로드 (7일 보관) ✅
- [x] 커스텀 가드 규칙 3개 ✅
  - 폰트 하드코딩 금지
  - react-pdf 격리 검증
  - test.skip 금지
- [x] 빌드 상태 배지 README에 추가 ✅
- [ ] E2E 테스트 CI 통합 (선택 - Phase 1 완료 후)

**GitHub Actions 체크**:
- ✅ Type check (npm run type-check)
- ✅ Lint (npm run lint)
- ✅ Format check (npm run format:check)
- ✅ Unit tests (npm run test:unit)
- ✅ Integration tests (npm run test:integration)
- ✅ Build (npm run build)
- ✅ Coverage thresholds (65/60/50%)
- ❌ E2E tests (보류 - `/courses` 페이지 완성 후)

**워크플로우 최적화**:
- ✅ Concurrency 그룹 (중복 실행 방지)
- ✅ npm 캐시 활용
- ✅ 실패 시 npm 로그 자동 업로드
- ✅ Manual dispatch 지원

### D. 실제 기능 완성 (E2E 통과 조건)
**예상 소요 시간**: 2-3주
**우선순위**: P0 (필수 - Phase 1 핵심)

**E2E 테스트가 요구하는 기능들**:
- [ ] `/courses` 페이지 생성 (코스 목록)
- [ ] 코스 목록 표시 (DB에서 실시간 로드)
- [ ] 코스 카드 컴포넌트 (`.rbt-course` 클래스)
- [ ] "장바구니에 추가" 버튼 기능
- [ ] `/cart` 페이지 (장바구니 아이템 표시)
- [ ] `/checkout` 페이지 (결제 폼)
- [ ] 결제 플로우 완성 (PayPal/Stripe)
- [ ] 주문 완료 페이지
- [ ] E2E 테스트 재실행 및 전체 통과 확인

**참고**: 이 작업들은 Phase 1 Week 1-2 작업과 동일

---

### Phase 2: Admin System Integration (Week 3)
**목표**: PreSkool 템플릿을 활용한 관리자 대시보드 구축

**Day 1: PreSkool Setup**
- [ ] Install PreSkool React TS version
- [ ] Configure subdomain (admin.domain.com)

**Day 2-3: Authentication Integration**
- [ ] Implement SSO between main app and PreSkool
- [ ] Admin role verification

**Day 4-5: Data Integration**
- [ ] API endpoints for PreSkool
- [ ] Badge management system (Hot/New/Featured)
- [ ] Database fields for badge states
- [ ] Data synchronization

**Day 6-7: Testing & Deployment**
- [ ] Integration testing
- [ ] Production deployment

### Phase 3: Enhancement & Optimization (Week 4+)
- Mobile app consideration
- Advanced analytics
- AI-powered recommendations
- Multi-language support

## 🐛 현재 이슈
- [ ] 포트 충돌 문제 (3000-3003)
- [ ] package-lock.json 동기화 필요

## 📝 작업 브랜치
- **현재**: `main`
- **최근 머지**: `chore/quality-and-devplan-automation`

## 🎯 마일스톤
- **MVP 완성 목표**: 2025년 9월 말
- **Phase 1 완료**: 2025년 8월 31일 (약 3주)
- **Phase 2 완료**: 2025년 9월 15일 (약 5주)
- **Phase 3 시작**: 2025년 9월 중순 이후

## 우선순위 매트릭스

### P0 - 필수 (출시에 반드시 필요)
- [ ] 학생 코스 등록
- [ ] 결제 처리
- [ ] 레슨 보기
- [ ] 진도 추적
- [ ] 기본 관리자 대시보드

### P1 - 중요 (있어야 함)
- [ ] 리뷰 시스템
- [ ] 코스 검색
- [ ] 이메일 알림
- [ ] 수료증 생성
- [ ] 고급 분석

### P2 - 있으면 좋음
- [ ] 소셜 기능
- [ ] 모바일 앱
- [ ] AI 추천
- [ ] 게이미피케이션
- [ ] 다국어 지원