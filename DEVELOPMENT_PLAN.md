# Development Plan & Progress

## 🚀 현재 작업 중인 기능
- 학생 코스 등록 시스템
- 결제 통합 (Stripe/Local payment)
- 학습 경험 개선
- My Courses 데이터 접근 오류 수정 (진행 중)

## ✅ 최근 완료된 작업

### 2025-02-07
- ✅ 퀴즈 시스템 구현 (Quill 에디터 통합)
- ✅ 9가지 문제 유형 지원
- ✅ 비디오 placeholder 시스템
- ✅ 프로젝트 메모리 모듈화

### 2025-01-31
- ✅ Prettier/ESLint CI 통과
- ✅ 수료증 시스템 구현 (비활성 상태)
- ✅ GitHub Actions 워크플로우 수정

### 2025-01-26
- ✅ 레슨 관리 시스템 (CRUD + 드래그앤드롭)
- ✅ 코스 편집 페이지
- ✅ CourseWidget 역할별 UI 차별화

### 2025-01-25
- ✅ 파일 업로드 시스템 (Base64 변환)
- ✅ 코스 생성 페이지
- ✅ 교사 대시보드 (90% 완성)

## 📅 다음 우선순위

### Phase 1: Core Platform (1-2주)
1. **학생 코스 상세 페이지** (`/courses/[id]`)
   - 코스 정보 표시
   - 커리큘럼 보기
   - 등록 버튼

2. **등록/결제 프로세스**
   - 결제 게이트웨이 통합
   - 주문 확인
   - 등록 완료 처리

3. **레슨 뷰어 구현** (`/lesson/[id]`)
   - 비디오 플레이어
   - 퀴즈 응시 인터페이스
   - 진도 추적

### Phase 2: Supporting Features
- 리뷰 & 평점 시스템
- 코스 검색 기능
- 북마크 기능
- 이메일 알림

### Phase 3: Admin System
- PreSkool 템플릿 통합
- 배지 관리 시스템
- 통계 대시보드

## 🐛 현재 이슈
- [ ] My Courses 페이지 데이터 로딩 오류
- [ ] 포트 충돌 문제 (3000-3003)
- [ ] package-lock.json 동기화 필요

## 📝 작업 브랜치
- **현재**: `fix/my-courses-data-access`
- **이전**: `feature/quiz-system-quill-experiment` (머지됨)

## 🎯 마일스톤
- **MVP 완성 목표**: 2025년 2월 말
- **코어 플랫폼**: 2주
- **관리자 시스템**: 1주
- **전체 MVP**: 3-4주