---
title: "Phase 2: Enhancement"
tags:
  - phase/2
  - type/feature
  - component/ui
  - component/admin
  - progress/backlog
created: 2025-11-09
updated: 2025-11-09
lifecycle: active
related:
  - ../ROADMAP.md
  - ../PROJECT_VISION.md
  - phase-1.md
---

# Phase 2: Enhancement

**GitHub Milestone**: Phase 2: Admin System (→ `Phase 2: Enhancement`로 이름 변경 예정)
**Duration**: 2주 (2025-12-15 ~ 2025-12-28)
**Due Date**: 2025-12-28
**Status**: 💡 아이디어

---

## 📋 Overview

### Purpose

**Primary Goal**: 품질 관리 강화 + 수익화 시작
- 다중 배지로 코스 품질 시각화
- 신고 시스템으로 저품질 콘텐츠 차단
- 광고 수익 발생

### Why Enhancement?

**Phase 1 MVP 위에 가치 추가**:
- MVP: YouTube 큐레이션 + 기본 품질 관리
- Enhancement: 고급 품질 관리 + 수익화 + UX 개선

**Business Value**:
- 수익 발생 (Google AdSense)
- 품질 시각화 (배지 시스템)
- 커뮤니티 자정 (신고 시스템)
- 랭킹 정확도 향상 (완료율 지표)

---

## 🎯 Goals

### Primary Goals

1. **품질 시각화**
   - 다중 배지로 코스 품질 표시
   - 학생이 빠르게 좋은 코스 식별

2. **커뮤니티 자정**
   - 신고 시스템 (3건 → 자동 비공개)
   - 저품질 콘텐츠 신속 차단

3. **수익화 시작**
   - Google AdSense 통합
   - 광고 위치 최적화

4. **UX 개선**
   - 완료율 지표 표시
   - 금지어 필터링 (자동 차단)

### Success Metrics

- ✅ 광고 수익 $100+/월
- ✅ 신고 처리 시간 <24h
- ✅ 다중 배지 작동 (자동 + 수동)
- ✅ 완료율 지표 표시 (코스 카드)
- ✅ 금지어 탐지율 95%+

---

## 🚀 Features

### Feature 1: 다중 배지 시스템 (#12)

**Purpose**: 코스 품질 시각화 (Bestseller, Hot, New, Featured, Limited, Sale)

**User Story**:
- **As a** 학생
- **I want to** 코스에 배지를 보고
- **So that** 인기/신규/한정 코스를 빠르게 식별할 수 있다

**Database**:
```sql
CREATE TABLE course_badges (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references courses(id) on delete cascade,
  badge_type text not null,  -- 'bestseller', 'hot', 'new', 'featured', 'limited', 'sale'
  start_date timestamptz default now(),
  end_date timestamptz,
  created_by uuid references "user"(id),
  created_at timestamptz default now()
);
```

**Badge Types**:
1. **Bestseller** (자동)
   - 조건: 등록 학생 >100명 OR 평점 >4.5
2. **Hot** (자동)
   - 조건: 최근 7일 조회수 >500
3. **New** (자동)
   - 조건: 생성 후 30일 이내
4. **Featured** (수동)
   - 관리자가 선택한 추천 코스
5. **Limited** (수동)
   - 기간 한정 코스
6. **Sale** (수동)
   - 할인 중 (프리미엄 코스만)

**Server Actions**:
- `app/lib/actions/badgeActions.ts`
  - `assignBadge(courseId, badgeType)`
  - `removeBadge(courseId, badgeType)`
  - `syncAutoBadges()` - 자동 배지 할당 (Cron)

**UI Components**:
- `components/Course/BadgeList.tsx`
  - 배지 목록 표시
  - 우선순위: Featured > Bestseller > Hot > New

**Total Estimate**: 16시간

**Acceptance Criteria**:
- 자동 배지 할당 작동
- 교사가 Featured 배지 신청 가능
- 관리자가 배지 수동 할당 가능

---

### Feature 2: 신고 시스템 (신규)

**Purpose**: 커뮤니티 자정 기능, 저품질 콘텐츠 차단

**User Story**:
- **As a** 학생
- **I want to** 부적절한 코스를 신고하고
- **So that** 다른 학생들이 피해를 받지 않는다

**Database**:
```sql
CREATE TABLE course_reports (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references courses(id) on delete cascade,
  reporter_id uuid references "user"(id) on delete cascade,
  reason text not null,  -- 'spam', 'inappropriate', 'misleading', 'copyright', 'other'
  description text,
  status text default 'pending',  -- 'pending', 'approved', 'rejected'
  reviewed_by uuid references "user"(id),
  reviewed_at timestamptz,
  created_at timestamptz default now(),
  unique(course_id, reporter_id)  -- 한 사용자당 코스당 1번만
);
```

**Features**:
- 신고 3건 → 자동 비공개 + 관리자 검토
- 신고 사유: 스팸, 부적절, 오해, 저작권, 기타
- Admin UI (신고 처리)

**Server Actions**:
- `app/lib/actions/reportActions.ts`
  - `reportCourse(courseId, reason, description)`
  - `reviewReport(reportId, approved)`

**UI Components**:
- `components/Course/ReportButton.tsx`
  - 신고 모달 (사유 선택, 설명 입력)
- `app/(dashboard)/admin/reports/page.tsx`
  - 신고 목록 (pending, approved, rejected)
  - 신고 승인/거부 버튼

**Total Estimate**: 6-8시간

**Acceptance Criteria**:
- 학생이 코스 신고 가능
- 신고 3건 → 자동 비공개
- 관리자가 신고 처리 가능 (24h 이내)

---

### Feature 3: 광고 연동 (신규)

**Purpose**: 수익 발생 (Google AdSense)

**User Story**:
- **As a** 운영자
- **I want to** 광고로 수익을 발생시키고
- **So that** 플랫폼 운영 비용을 충당한다

**Features**:
- Google AdSense 코드 삽입
- 광고 위치 최적화
  - 사이드바 (목록 페이지)
  - 목록 사이 (3개 코스마다 1개 광고)
  - 코스 상세 페이지 (하단)
- 프리미엄 도메인: 광고 제거

**Implementation**:
```typescript
// app/(main)/courses/page.tsx
<div className="courses-grid">
  {courses.map((course, index) => (
    <>
      <CourseCard course={course} />
      {(index + 1) % 3 === 0 && <AdSenseUnit slot="XXXX" />}
    </>
  ))}
</div>
```

**AdSense Setup**:
- Google AdSense 계정 생성
- 사이트 등록 (주 도메인만, `premium.dvs.com` 제외)
- 광고 단위 생성 (Display, In-feed)

**Total Estimate**: 4-5시간

**Acceptance Criteria**:
- 광고 표시 (메인 도메인만)
- 광고 수익 $100+/월 (3개월 후)
- 프리미엄 도메인: 광고 없음

---

### Feature 4: 금지어 필터링 (신규)

**Purpose**: 부적절한 제목/설명 자동 차단

**User Story**:
- **As a** 관리자
- **I want to** 금지어가 포함된 코스를 자동 차단하고
- **So that** 수동 검토 부담을 줄인다

**Database**:
```sql
CREATE TABLE forbidden_words (
  id uuid primary key default gen_random_uuid(),
  word text not null unique,
  category text,  -- 'profanity', 'spam', 'illegal'
  created_at timestamptz default now()
);
```

**Features**:
- 코스 제목/설명 자동 체크 (생성/수정 시)
- 금지어 탐지 → 자동 비공개 + 교사 알림
- Admin UI (금지어 관리)

**Server Actions**:
- `app/lib/actions/forbiddenWordActions.ts`
  - `checkForbiddenWords(text)`
  - `addForbiddenWord(word, category)`
  - `removeForbiddenWord(word)`

**Total Estimate**: 3-4시간

**Acceptance Criteria**:
- 금지어 탐지 작동 (생성/수정 시)
- 금지어 탐지율 95%+
- 관리자가 금지어 관리 가능

---

### Feature 5: 완료율 지표 (신규)

**Purpose**: 코스 품질 평가 정확도 향상

**User Story**:
- **As a** 학생
- **I want to** 완료율을 보고
- **So that** 끝까지 들을 만한 코스인지 판단할 수 있다

**Leveraging Existing**:
- ✅ `lesson_progress` 테이블 (수강 진도)

**Features**:
- 코스 카드에 완료율 표시 (예: "75% 완료율")
- 랭킹 알고리즘 반영 (평점 + 조회수 + 완료율)

**Implementation**:
```sql
-- Materialized View
CREATE MATERIALIZED VIEW course_completion_rate AS
SELECT
  course_id,
  COUNT(DISTINCT user_id) FILTER (WHERE progress = 100) AS completed_users,
  COUNT(DISTINCT user_id) AS total_users,
  ROUND(100.0 * COUNT(DISTINCT user_id) FILTER (WHERE progress = 100) / NULLIF(COUNT(DISTINCT user_id), 0), 1) AS completion_rate
FROM lesson_progress
GROUP BY course_id;

-- Refresh daily
REFRESH MATERIALIZED VIEW CONCURRENTLY course_completion_rate;
```

**Total Estimate**: 4-5시간

**Acceptance Criteria**:
- 코스 카드에 완료율 표시
- 완료율 반영 랭킹 작동
- Materialized View 자동 갱신 (일 1회)

---

## 📋 Issues

### Existing Issues (1개)

| Issue | Title | Estimate | Priority | Status |
|-------|-------|----------|----------|--------|
| #12 | 다중 배지 시스템 구현 | 16h | P2 | Open |

### New Issues (작성 예정)

- #XX: 신고 시스템 구현
- #XX: Google AdSense 통합
- #XX: 금지어 필터링
- #XX: 완료율 지표

**Total Estimate**: 33-42시간 (약 1.5-2주, Solo Dev 기준 2주 여유)

---

## ✅ Exit Criteria

**완료 조건** (모두 충족 시 Milestone Close):

1. **다중 배지 작동**
   - ✅ 자동 배지 할당 (Bestseller, Hot, New)
   - ✅ 수동 배지 할당 (Featured, Limited, Sale)
   - ✅ 배지 우선순위 표시

2. **신고 시스템 작동**
   - ✅ 학생이 코스 신고 가능
   - ✅ 신고 3건 → 자동 비공개
   - ✅ 관리자가 24h 이내 처리

3. **광고 수익 발생**
   - ✅ Google AdSense 통합
   - ✅ 광고 표시 (메인 도메인만)
   - ✅ 월 수익 $100+ (3개월 후 목표)

4. **금지어 필터링**
   - ✅ 금지어 탐지 작동
   - ✅ 탐지율 95%+

5. **완료율 지표**
   - ✅ 코스 카드에 완료율 표시
   - ✅ 랭킹 알고리즘 반영

**Milestone Close 기준**: Exit Criteria 80% 이상 충족 시

---

## 📦 Deliverables

### Database Migrations
- `20251215_create_course_badges_table.sql`
- `20251216_create_course_reports_table.sql`
- `20251217_create_forbidden_words_table.sql`
- `20251218_create_course_completion_rate_view.sql`

### Server Actions
- `app/lib/actions/badgeActions.ts`
- `app/lib/actions/reportActions.ts`
- `app/lib/actions/forbiddenWordActions.ts`

### UI Components
- `components/Course/BadgeList.tsx`
- `components/Course/ReportButton.tsx`
- `components/AdSense/AdUnit.tsx`
- `app/(dashboard)/admin/reports/page.tsx`
- `app/(dashboard)/admin/forbidden-words/page.tsx`

### Cron Jobs / Edge Functions
- `syncAutoBadges()` - 일 1회 (자동 배지)
- `refreshCompletionRate()` - 일 1회 (완료율)

---

## 🗓️ Timeline (Flexible)

**Week 1 (2025-12-15 ~ 12-21): 다중 배지 + 신고**
- **Day 1-4**: 다중 배지 시스템 (16h → 4일)
- **Day 5-7**: 신고 시스템 (6-8h → 3일)

**Week 2 (2025-12-22 ~ 12-28): 광고 + 금지어 + 완료율**
- **Day 1-2**: Google AdSense 통합 (4-5h)
- **Day 3-4**: 금지어 필터링 (3-4h)
- **Day 5-6**: 완료율 지표 (4-5h)
- **Day 7**: 전체 테스트 + 문서 작성

---

## 🔗 Dependencies

### Prerequisites
- ✅ Phase 1 (MVP) 완료
  - YouTube 큐레이션 작동
  - 품질 평가 작동 (평점 + 좋아요)

### Internal Dependencies
- ✅ 기존 `courses` 테이블
- ✅ 기존 `lesson_progress` 테이블 (완료율)

### External Dependencies
- ❌ **Google AdSense 계정** (승인 필요, 1-2주 소요)
- ❌ **Cron or Edge Function** (배지/완료율 자동 갱신)

**Blocking**: Phase 1 완료 후 시작 가능

---

## ⚠️ Risks & Mitigation

### Risk 1: AdSense 승인 지연
**Probability**: Medium
**Impact**: Low
**Mitigation**:
- 승인 전 Placeholder 광고 배치 (디자인 검증)
- 승인 후 즉시 활성화
- 승인 거부 시 대안: Amazon Associates, Affiliate 링크

### Risk 2: 배지 할당 로직 오류
**Probability**: Low
**Impact**: Medium
**Mitigation**:
- 테스트 데이터로 사전 검증
- 자동 배지 할당 전 관리자 검토 (첫 1주)

### Risk 3: 신고 악용 (허위 신고)
**Probability**: Medium
**Impact**: Medium
**Mitigation**:
- 신고 3건 → 자동 비공개 (즉시 차단)
- 관리자 24h 이내 검토 (오탐 복구)
- 허위 신고자 계정 정지 (3회 오신고)

---

## 🔗 Related Documents

**Roadmap**:
- [Product Roadmap](../ROADMAP.md) - Phase 2 상세
- [Phase 1: MVP](./phase-1.md)

**Issues**:
- #12: 다중 배지 시스템

**Library** (완료 후 작성):
- `docs/library/badge-system.md`
- `docs/library/report-system.md`

**External Services** (완료 후 작성):
- `docs/external-services/google-adsense.md`

---

**Last Updated**: 2025-11-09
**Owner**: Development Team
**Status**: 💡 Idea
