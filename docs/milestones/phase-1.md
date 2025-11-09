---
title: "Phase 1: MVP - YouTube Curation Core"
tags:
  - phase/1
  - type/feature
  - component/api
  - component/ui
  - external/youtube
  - progress/backlog
created: 2025-11-09
updated: 2025-11-09
lifecycle: active
related:
  - ../ROADMAP.md
  - ../PROJECT_VISION.md
  - ../work-plans/agile-restructure.md
---

# Phase 1: MVP - YouTube 큐레이션 핵심

**GitHub Milestone**: Phase 1.5 MVP (신규 생성 예정)
**Duration**: 3주 (2025-11-23 ~ 2025-12-14)
**Due Date**: 2025-12-14
**Status**: 💡 아이디어

---

## 📋 Overview

### Purpose

**Primary Goal**: Vision 실현 시작 - YouTube 기반 무료 교육 플랫폼 런칭
- 교사가 YouTube URL로 코스 생성
- 학생이 평점 + 좋아요로 품질 평가
- 관리자가 교사 승인 + 코스 승인

### Why MVP?

**Vision Gap 해소**:
- 현재: 템플릿 프로젝트 수준
- 목표: 실제 운영 가능한 YouTube 큐레이션 플랫폼
- Vision 문서의 핵심 요구사항을 최소한으로 구현

**Business Value**:
- AI 시대 교육 접근성 향상 (누구나 무료로 학습)
- 지식의 민주화 (교사 = 큐레이터)
- 품질 관리 시스템 (수동 승인 + 평점 + 좋아요)

---

## 🎯 Goals

### Primary Goals

1. **YouTube 큐레이션 활성화**
   - 교사가 YouTube URL로 코스 생성
   - 자동 메타데이터 (제목, 썸네일, 길이, 채널)
   - 영상 삭제/비공개 자동 탐지

2. **품질 평가 시스템**
   - 평점 (1-5점) + 좋아요 병행
   - 학생이 쉽게 품질 평가
   - 코스 랭킹 반영

3. **Quality Control**
   - 교사 신청 시스템 (진입장벽)
   - 모든 코스 수동 승인
   - Rate Limiting (스팸 방지)

4. **무료/유료 분리**
   - 서브도메인 (`premium.dvs.com`)
   - 메인: YouTube 큐레이션만
   - 프리미엄: 유료 강의만

### Success Metrics

- ✅ 50개 이상 승인된 코스
- ✅ 평균 평점 4.0/5.0 이상
- ✅ YouTube API 쿼터 초과 0건
- ✅ Rate Limiting 작동
- ✅ 서브도메인 분리 완료

---

## 🚀 Features

### Feature 1: YouTube API Integration (신규 개발)

**Purpose**: YouTube 영상 정보 자동 가져오기, 쿼터 절약

**User Story**:
- **As a** 교사
- **I want to** YouTube URL을 입력하면 자동으로 제목/썸네일이 입력되고
- **So that** 매번 복사/붙여넣기 하지 않아도 된다

#### Leveraging Existing (기존 활용)
- ✅ `courses.intro_video_url` (YouTube URL 저장)
- ✅ `lessons.video_url` (YouTube URL 저장)
- ✅ `video_source` enum ('youtube', 'vimeo', 'upload')

#### New Development (신규 개발)

**1-1. videos 캐시 테이블**
```sql
CREATE TABLE videos (
  id text primary key,              -- youtube_video_id (예: "dQw4w9WgXcQ")
  provider text not null,           -- 'youtube'
  title text,
  duration int,                     -- 초 단위
  thumbnails jsonb,                 -- {default, medium, high, standard, maxres}
  channel_id text,
  channel_title text,
  is_playable boolean default true, -- 삭제/비공개 탐지
  last_checked_at timestamptz default now(),
  created_at timestamptz default now()
);
```

**1-2. YouTube Data API v3 연동**
- URL 직접 입력만 (검색 API 금지, 쿼터 절약)
- `videos.list` API로 메타데이터 가져오기
- 캐시 우선 (90% API 호출 감소)

**1-3. 배치 작업 (영상 삭제/비공개 탐지)**
- 일 1회 실행 (Supabase Edge Function or Cron)
- `is_playable` 플래그 업데이트
- 교사에게 알림 + 코스 비공개 처리

**Server Actions**:
- `app/lib/actions/youtubeActions.ts`
  - `fetchVideoMetadata(videoId)` - API 호출 + 캐싱
  - `checkVideoPlayability(videoId)` - 영상 상태 확인
  - `syncVideosCache()` - 배치 작업

**Estimate**: 8-10시간

**Acceptance Criteria**:
- YouTube URL 입력 시 자동으로 제목/썸네일 입력
- 영상 삭제/비공개 시 24시간 내 탐지
- API 쿼터 일일 사용량 <10,000 units (캐싱으로 90% 감소)

---

### Feature 2: 좋아요 시스템 (신규 개발)

**Purpose**: 빠른 UX, 평점과 병행

**User Story**:
- **As a** 학생
- **I want to** 코스를 좋아요/취소 버튼으로 빠르게 평가하고
- **So that** 평점을 작성하지 않아도 간단히 의사표시 할 수 있다

#### Leveraging Existing (기존 활용)
- ✅ `reviews` 테이블 (rating 1-5, title, comment)
- ✅ `review_helpfulness` 테이블 (리뷰 유용성)

#### New Development (신규 개발)

**2-1. course_likes 테이블**
```sql
CREATE TABLE course_likes (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references courses(id) on delete cascade,
  user_id uuid references "user"(id) on delete cascade,
  created_at timestamptz default now(),
  unique(course_id, user_id)  -- 한 사용자당 1번만
);

ALTER TABLE courses ADD COLUMN likes_count int default 0;
```

**2-2. RLS 정책**
```sql
-- 본인만 생성/삭제, 모두 조회
CREATE POLICY "Users can like courses"
ON course_likes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view likes"
ON course_likes FOR SELECT
USING (true);
```

**2-3. 좋아요 카운트 집계**
- Trigger로 `courses.likes_count` 자동 증감
- 코스 카드에 "❤️ 123" 표시

**Server Actions**:
- `app/lib/actions/likeActions.ts`
  - `likeCourse(courseId)` - 좋아요 추가
  - `unlikeCourse(courseId)` - 좋아요 취소
  - `getLikesCount(courseId)` - 좋아요 수 조회

**UI Components**:
- `components/Course/LikeButton.tsx`
  - 하트 아이콘 (filled/outlined)
  - 좋아요 수 표시
  - 클릭 시 토글

**Estimate**: 4-5시간

**Acceptance Criteria**:
- 학생이 코스 좋아요/취소 가능
- 좋아요 수 실시간 반영
- RLS 정책 작동 (본인만 추가/삭제)

---

### Feature 3: Quality Control (확장 + 신규)

**Purpose**: 저품질 콘텐츠 차단, 스팸 방지

#### 3-1. 교사 신청 시스템 (신규 개발)

**User Story**:
- **As a** 일반 사용자
- **I want to** 교사로 신청하고 승인받아야
- **So that** 무분별한 코스 생성을 방지한다

**Database**:
```sql
CREATE TABLE teacher_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references "user"(id) on delete cascade,
  application_text text not null,  -- 자기소개, 교육 경험 등
  status text not null default 'pending', -- pending, approved, rejected
  reviewed_by uuid references "user"(id),
  reviewed_at timestamptz,
  created_at timestamptz default now(),
  unique(user_id)  -- 한 사용자당 1번만 신청
);
```

**UI Components**:
- `components/Instructor/TeacherApplicationForm.tsx`
  - 이름, 이메일, 자기소개, SNS
  - 제출 버튼
- `app/(dashboard)/admin/teachers/page.tsx`
  - 신청 목록 (pending, approved, rejected)
  - 승인/거부 버튼

**Estimate**: 4-5시간

---

#### 3-2. 모든 코스 수동 승인 (확장)

**Leveraging Existing**:
- ✅ `courses.status` 컬럼 ('draft', 'active', 'archived')

**Extension**:
```sql
ALTER TYPE course_status ADD VALUE 'pending';
ALTER TYPE course_status ADD VALUE 'approved';

-- 기본값 변경
ALTER TABLE courses ALTER COLUMN status SET DEFAULT 'pending';
```

**UI Components**:
- `app/(dashboard)/admin/courses/approval/page.tsx`
  - 승인 대기 코스 목록 (status=pending)
  - 코스 미리보기 (제목, 설명, 영상)
  - 승인/거부 버튼

**Estimate**: 3-4시간

---

#### 3-3. Rate Limiting (신규 개발)

**User Story**:
- **As a** 관리자
- **I want to** 사용자별 행동 제한을 두어
- **So that** 스팸/어뷰징을 방지한다

**Features**:
- Middleware (IP + User 기반)
- Redis (Upstash 무료 플랜 or Supabase)

**Rate Limits**:
```typescript
// middleware.ts
const RATE_LIMITS = {
  createCourse: { max: 5, window: '24h' },    // 코스 생성: 5개/일
  createReview: { max: 10, window: '24h' },   // 평점: 10개/일
  likeCourse: { max: 30, window: '24h' },     // 좋아요: 30개/일
  reportCourse: { max: 3, window: '24h' },    // 신고: 3개/일
};
```

**Implementation**:
```typescript
// middleware.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '24 h'),
});

export async function middleware(request: NextRequest) {
  const userId = await getUserId(request);
  const { success } = await ratelimit.limit(userId);

  if (!success) {
    return new Response('Rate limit exceeded', { status: 429 });
  }

  return NextResponse.next();
}
```

**Estimate**: 3-4시간

**Total Estimate (Quality Control)**: 10-13시간

---

### Feature 4: Premium Domain Separation (신규 개발)

**Purpose**: 무료/유료 콘텐츠 명확히 구분

**User Story**:
- **As a** 학생
- **I want to** 메인 도메인에서는 무료 YouTube 큐레이션만 보고
- **So that** 유료 강의와 혼동하지 않는다

**Features**:
- `middleware.ts` 생성
- 도메인 감지 (`premium.dvs.com`)
- 메인: YouTube 큐레이션만 표시
- Premium: 유료 강의만 표시

**Implementation**:
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';

  // 프리미엄 도메인 감지
  if (hostname.startsWith('premium.')) {
    // 프리미엄 강의만 표시
    return NextResponse.rewrite(new URL('/premium', request.url));
  }

  // 메인 도메인: YouTube 큐레이션만
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

**UI Changes**:
- 메인 도메인: `video_source = 'youtube'` 필터링
- Premium 도메인: `video_source != 'youtube'` 필터링

**Dependencies**:
- Domain 설정 (Vercel DNS)
  - CNAME: `premium.dvs.com` → Vercel
- 환경 변수:
  - `NEXT_PUBLIC_MAIN_DOMAIN`
  - `NEXT_PUBLIC_PREMIUM_DOMAIN`

**Estimate**: 4-5시간

**Acceptance Criteria**:
- `premium.dvs.com` 접속 시 유료 강의만 표시
- `dvs.com` 접속 시 YouTube 큐레이션만 표시
- 도메인별 필터링 작동

---

## 📋 Issues

**Note**: Phase 1 (MVP)는 신규 Milestone이므로 기존 Issues 없음. 완료 후 새 Issues 생성.

**예상 Issues** (작성 예정):
- #XX: YouTube API Integration
- #XX: 좋아요 시스템
- #XX: 교사 신청 시스템
- #XX: 코스 승인 시스템
- #XX: Rate Limiting
- #XX: Premium Domain 분리

**Total Estimate**: 29-37시간 (약 1-1.5주, Solo Dev 기준 3주 여유)

---

## ✅ Exit Criteria

**완료 조건** (모두 충족 시 Milestone Close):

1. **YouTube 큐레이션 작동**
   - ✅ YouTube URL 입력 시 자동 메타데이터
   - ✅ 영상 삭제/비공개 탐지 작동
   - ✅ API 쿼터 일일 <10,000 units

2. **품질 평가 작동**
   - ✅ 평점 (기존 reviews) + 좋아요 (신규) 병행
   - ✅ 코스 카드에 평점/좋아요 표시
   - ✅ RLS 정책 작동

3. **Quality Control 작동**
   - ✅ 교사 신청/승인 시스템 작동
   - ✅ 코스 수동 승인 작동
   - ✅ Rate Limiting 작동 (429 응답)

4. **서브도메인 분리**
   - ✅ `premium.dvs.com` 접속 시 유료 강의만
   - ✅ 메인 도메인 접속 시 YouTube 큐레이션만

5. **문서화**
   - ✅ Work Plan 완료
   - ✅ Library 문서 작성 (`docs/library/youtube-integration.md`, `docs/library/quality-control.md`)
   - ✅ PR 설명 작성

**Milestone Close 기준**: Exit Criteria 80% 이상 충족 시 (유연한 기준)

---

## 📦 Deliverables

### Database Migrations
- `20251123_create_videos_table.sql`
- `20251124_create_course_likes_table.sql`
- `20251125_create_teacher_applications_table.sql`
- `20251126_extend_course_status_enum.sql`
- `20251127_add_likes_count_to_courses.sql`

### Server Actions
- `app/lib/actions/youtubeActions.ts` (YouTube API)
- `app/lib/actions/likeActions.ts` (좋아요)
- `app/lib/actions/teacherActions.ts` (교사 신청)

### UI Components
- `components/Course/LikeButton.tsx` (좋아요 버튼)
- `components/Instructor/TeacherApplicationForm.tsx` (교사 신청 폼)
- `app/(dashboard)/admin/teachers/page.tsx` (교사 승인)
- `app/(dashboard)/admin/courses/approval/page.tsx` (코스 승인)

### Middleware
- `middleware.ts` (도메인 라우팅 + Rate Limiting)

### Documentation (완료 후 작성)
- `docs/library/youtube-integration.md`
- `docs/library/quality-control.md`
- `docs/external-services/youtube-api.md`

---

## 🗓️ Timeline (Flexible)

**Week 1 (2025-11-23 ~ 11-29): YouTube API + 좋아요**
- **Day 1-3**: YouTube API 연동 + videos 캐시 (8-10h → 3일)
- **Day 4-5**: 좋아요 시스템 (4-5h → 2일)
- **Day 6-7**: UI 통합 + 테스트

**Week 2 (2025-11-30 ~ 12-06): Quality Control**
- **Day 1-3**: 교사 신청 시스템 (4-5h)
- **Day 4-5**: 코스 승인 확장 (3-4h)
- **Day 6-7**: Admin UI 구축

**Week 3 (2025-12-07 ~ 12-14): Rate Limiting + 서브도메인**
- **Day 1-3**: Rate Limiting Middleware (3-4h)
- **Day 4-5**: 서브도메인 분리 (4-5h)
- **Day 6-7**: 전체 테스트 + 안정화 + 문서 작성

**Flexibility**: Solo Dev 특성상 일정은 유연하게 조정 가능

---

## 🔗 Dependencies

### Prerequisites
- ✅ Phase 0 완료 (TypeScript 마이그레이션)

### Internal Dependencies
- ✅ 기존 `reviews` 테이블 (평점 시스템)
- ✅ 기존 `courses.video_url` 필드 (YouTube URL)
- ✅ 기존 `courses.status` enum (확장 필요)

### External Dependencies
- ❌ **YouTube Data API v3 키** (Google Cloud Console)
  - 할당량: 10,000 units/일 (무료)
  - 필요 시 할당량 증가 신청
- ❌ **Redis** (Upstash 무료 플랜 or Supabase)
  - Rate Limiting용
  - Max 10,000 commands/일 (무료)
- ❌ **Domain 설정** (Vercel DNS)
  - `premium.dvs.com` CNAME 레코드

**Blocking**: Phase 0 완료 후 시작 가능

---

## ⚠️ Risks & Mitigation

### Risk 1: YouTube API 쿼터 초과
**Probability**: Medium
**Impact**: High
**Mitigation**:
- videos 캐시 테이블 (90% API 호출 감소)
- 검색 API 금지 (URL 직접 입력만)
- 할당량 증가 신청 (Google)
- 모니터링 알림 (80% 도달 시)

### Risk 2: 영상 삭제/비공개 탐지 지연
**Probability**: Medium
**Impact**: Medium
**Mitigation**:
- 배치 작업 주기: 일 1회 (새벽 3시)
- 교사에게 이메일 알림
- 코스 자동 비공개 처리
- 학생에게 "영상 삭제됨" 메시지 표시

### Risk 3: Rate Limiting 우회
**Probability**: Low
**Impact**: Low
**Mitigation**:
- IP + User 이중 체크
- Redis TTL 정확히 관리
- 로그 모니터링 (429 응답 패턴 분석)
- 필요 시 Cloudflare Rate Limiting 추가

### Risk 4: 서브도메인 설정 실패
**Probability**: Low
**Impact**: Medium
**Mitigation**:
- Fallback: 경로 분리 (`/premium`)
- Middleware 검증 테스트 (로컬 + Vercel Preview)
- DNS 전파 대기 (24-48h)

### Risk 5: 개발 시간 초과
**Probability**: Medium
**Impact**: Low
**Mitigation**:
- 3주 여유 (Solo Dev 특성 반영)
- Phase별 점진적 배포
- 80% 완료 시 Milestone Close 허용

---

## 🔗 Related Documents

**Roadmap**:
- [Product Roadmap](../ROADMAP.md) - Phase 1 상세
- [Product Vision](../PROJECT_VISION.md) - Vision 요구사항

**Work Plans**:
- [Agile Restructure](../work-plans/agile-restructure.md)

**ADR** (작성 예정):
- `docs/adr/XXXX-youtube-api-strategy.md`
- `docs/adr/XXXX-rate-limiting-approach.md`

**Library** (완료 후 작성):
- `docs/library/youtube-integration.md`
- `docs/library/quality-control.md`

**External Services** (완료 후 작성):
- `docs/external-services/youtube-api.md`
- `docs/external-services/upstash-redis.md`

---

**Last Updated**: 2025-11-09
**Owner**: Development Team
**Status**: 💡 Idea
