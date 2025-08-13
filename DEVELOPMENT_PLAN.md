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

## 📅 개발 로드맵

### Phase 1: Core Platform (Week 1-2) - 진행 중
**목표**: 학생과 교사가 실제로 사용할 수 있는 핵심 기능 완성

#### Week 1: Student Core Features
**Day 1-2: Course Enrollment Process**
- [ ] Course detail page for students (`/courses/[id]`)
- [ ] Bookmark functionality (add/remove)
- [ ] Enrollment/Purchase flow
- [ ] Payment integration (Stripe/Local payment)

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