# Development Plan & Progress

## 📊 Milestones 진행 상황

### Phase 1: Core Platform [████████░░] 80%
**목표**: 2025-08-31 | **진행**: 4 closed / 2 open

✅ **완료된 기능**:
- [PayPal 결제 시스템](./docs/library/checkout.md) (2025-02-13)
  - createOrder → capture → activate_paid_order RPC
  - Sandbox 검증 완료, idempotency 보장
- [북마크 시스템](./docs/library/bookmark.md) (2025-10-29)
  - 3개 페이지 통합 (all-courses, course-details, enrolled-courses)
  - Optimistic UI, 2 variants (icon, button)

🚧 **진행 중**:
- Lesson Viewer (Day 3-4)
  - Video player with progress tracking
  - Quiz taking interface
  - Lesson completion logic

📋 **대기 중**:
- Student Dashboard completion (Day 5)
- Review & Rating System (Week 2)

---

### Phase 2: Admin System [░░░░░░░░░░] 0%
**목표**: 2025-09-15 | **진행**: 0 closed / 1 open

**계획**:
- PreSkool 템플릿 통합
- SSO 인증 시스템
- Badge 관리 시스템

---

### Phase 3: Enhancement & Optimization [░░░░░░░░░░] 0%
**목표**: 2025-10-31 | **진행**: 0 closed / 0 open

**계획**:
- 성능 최적화
- AI 기능 추가
- 다국어 지원

---

## 🎯 현재 작업 (2025-10-30)

### 이번 주 완료
- ✅ 북마크 시스템 3페이지 완성
- ✅ docs/library/ 문서 정리 (checkout.md, bookmark.md)
- ✅ GitHub Milestones 설정 완료

### 다음 작업
1. **Lesson Viewer 구현** (Phase 1 Day 3-4)
   - `/lesson/[id]` 페이지
   - Video player 통합
   - Quiz 인터페이스
   - Progress tracking

2. **Student Dashboard 완성** (Phase 1 Day 5)
   - 실제 데이터 연동
   - 북마크된 코스 섹션
   - 진도 추적 UI

---

## 🐛 알려진 이슈

### P2 - 중기 해결
- **Student Dashboard RPC 타입 불일치** (#42804)
  - 위치: `/student-enrolled-course`
  - 해결: `getEnrolledCoursesRPC` 타입 통일

- **Redux E2E 환경 이슈**
  - E2E 테스트에서 cart state persist 안 됨
  - 수동 테스트는 정상 작동
  - 우선순위: Phase 1 완료 후

---

## 📚 참고 문서

### 완료된 기능
- [Checkout & PayPal Integration](./docs/library/checkout.md)
- [Bookmark System](./docs/library/bookmark.md)

### 워크플로우
- [CLAUDE.md](./docs/CLAUDE.md) - 문서 메모리 시스템
- [Git Workflow](./modules/git-workflow.md) - 브랜치 전략

### 외부 서비스
- [External Services](./modules/external-services.md) - Supabase, Resend 등
- [Authentication](./modules/authentication-system.md) - Google OAuth + Password

---

## 📝 브랜치 상태

- **현재 브랜치**: `main`
- **머지 대기**: `feat/bookmark-all-courses`
- **최근 머지**: `chore/quality-and-devplan-automation`

---

## 🧪 품질 지표

### 테스트 현황
- **유닛 테스트**: 24개 (✅ 전체 통과)
- **통합 테스트**: 4개 (✅ 전체 통과)
- **E2E 테스트**: 1/5 통과 (🟡 Redux 이슈)
- **커버리지**: ~65% (목표 70%)

### CI/CD
- ✅ GitHub Actions 구축 완료
- ✅ 자동 lint/type-check/build
- ✅ 커버리지 리포트 자동 생성
- ❌ E2E 테스트 통합 (Phase 1 완료 후)

---

## 🎯 우선순위 매트릭스

### P0 - 필수 (MVP 출시)
- [x] 결제 처리 (PayPal) ✅
- [x] 북마크 기능 ✅
- [ ] 레슨 뷰어
- [ ] 진도 추적
- [ ] 학생 대시보드 완성

### P1 - 중요
- [ ] Stripe 결제 연동 (Phase 2)
- [ ] 리뷰 & 평점 시스템
- [ ] 코스 검색 기능
- [ ] 이메일 알림

### P2 - 선택
- [ ] 수료증 생성
- [ ] AI 추천 시스템
- [ ] 모바일 앱
- [ ] 다국어 지원

---

**마지막 업데이트**: 2025-10-30
**다음 마일스톤**: Phase 1 완료 (2025-08-31)
**GitHub**: [Milestones](https://github.com/Hulkeinstein/dvs-template01/milestones)
