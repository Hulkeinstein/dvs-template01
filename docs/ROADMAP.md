---
title: "DVS Product Roadmap"
tags:
  - type/docs
  - phase/planning
  - progress/in-progress
created: 2025-11-08
updated: 2026-09-16
lifecycle: active
related:
  - PROJECT_VISION.md
  - work-plans/agile-restructure.md
---

# DVS Product Roadmap

**Version**: 2.1 (재개 점검 반영)
**Last Updated**: 2026-09-16
**Status**: Active

---

## Overview

이 로드맵은 **실제 프로젝트 상태**를 반영하여 [Product Vision](./PROJECT_VISION.md)을 실행 가능한 단계로 나눈 계획입니다.

**주요 변경사항** (v1.0 → v2.0):
- ✅ 기존 구현 상태 반영 (reviews 테이블, video_url 필드)
- ✅ Gap Analysis 기반 재작성
- ✅ 기존 Milestone (#19, #10)을 Phase 0로 재정의
- ✅ Vision 요구사항을 Phase 1로 명확히 분리

**Roadmap 철학**:
- **현실 기반**: As-Is 파악 → Gap 분석 → 실행 계획
- **점진적 가치**: 각 Phase마다 사용자 체감 가능한 기능 출시
- **품질 우선**: 빠른 출시보다 안정적인 기능 우선

---

## 🔁 재개 점검 (2026-09-16)

2026-01-23 이후 멈췄던 프로젝트를 다시 점검한 결과입니다. 아래 Phase 0~3의 일정(2025-11 ~ 2026-01)은 모두 지났고, **첫 행의 결정 전까지 기존 Phase 일정은 보류**합니다.

| 항목 | 상태 | 비고 |
|------|------|------|
| 현 코드베이스를 이어갈지, 핵심 기능만 새 프로젝트로 옮길지 결정 | 🔜 다음 작업 | 코드 변경 없음 |
| 유출된 Supabase 키 폐기 및 저장소에서 제거 | ✅ 완료 | #74 |
| 보안 후속 조치 (서버 액션·API 인가, DB 권한·RLS 재정비) | ⏸️ 결정 후 | 상세는 비공개 점검 보고서 |
| Next.js 14 · Node 20 지원 종료 대응 | ⏸️ 결정 후 | |
| DB 마이그레이션 기준선 재수립 (운영 DB 스키마 기준) | ⏸️ 결정 후 | |
| 저장소 정리·CI 복구 (서식, 줄바꿈 정규화, 추적 산출물) | ⏸️ 결정 후 | |
| 완료됐지만 남아 있는 work-plan 정리 | ⏸️ 결정 후 | histudy-demo-cleanup, youtube-ai-summarization |

---

## Milestones Mapping

| Roadmap Phase | GitHub Milestone | Duration | Due Date | Focus |
|---------------|------------------|----------|----------|-------|
| **Phase 0: Tech Debt** | Phase 1 (이름 변경 예정) | 2주 | 2025-11-22 | TypeScript, Assignment 템플릿 |
| **Phase 1: MVP** | Phase 1.5 MVP (신규 생성) | 3주 | 2025-12-14 | YouTube 큐레이션 핵심 (Vision Gap 해소) |
| **Phase 2: Enhancement** | Phase 2 (이름 변경 예정) | 2주 | 2025-12-28 | 다중 배지, 신고, 광고 |
| **Phase 3: Scale** | Phase 3 (신규 생성) | 4주 | 2026-01-25 | 검색, 추천, ML |
| **Active** | Active | - | - | Quick Wins (<2h, docs, hotfixes) |

**Note**: GitHub Milestone 재구성은 P3 (Milestone 재정의)에서 수행

---

## 🔧 Phase 0: Tech Debt (기존 Phase 1 재정의)

**Duration**: 2주 (2025-11-09 ~ 2025-11-22)
**Status**: 📋 계획됨
**GitHub Milestone**: Phase 1: Core Platform (→ 이름 변경 예정)

### 🎯 Goals

**Primary Goal**: Vision 작업 전 기술 부채 해소
- TypeScript 마이그레이션으로 타입 안정성 확보
- Assignment 템플릿으로 교사 UX 개선

**Why Phase 0?**
- Vision 작업은 대규모 개발 (40-60시간)
- 안정적인 코드베이스 필요
- 기존 Milestone Issues (#19, #10)와 Vision은 무관

### 🚀 Features

#### Feature 1: TypeScript 마이그레이션 (#19)
**Purpose**: 타입 안전성, 개발자 경험 개선
**Scope**: 133개 핵심 파일 변환
**Phases**:
- Phase 1: Foundation (30개 - 1h)
- Phase 2: Server Actions (13개 - 1.5h)
- Phase 3: Components (60개 - 2h)
- Phase 4: App Routes (30개 - 1h)

**Total Estimate**: 5.5시간

**Acceptance Criteria**:
- `tsc --noEmit` 통과
- `npm run build` 성공
- 기존 기능 정상 작동

---

#### Feature 2: Assignment 템플릿 시스템 (#10)
**Status**: ✅ 완료 (#60, 2025-12-14)
**Purpose**: 교사가 자주 사용하는 과제를 템플릿으로 저장/재사용
**Scope**:
- DB: `assignment_templates` 테이블
- Server Actions: assignmentTemplateActions.ts
- UI: AssignmentModal 확장 ('템플릿으로 저장', '내 템플릿' 드롭다운)

**Total Estimate**: 3-4시간

**Acceptance Criteria**:
- 교사가 과제를 템플릿으로 저장 가능
- 템플릿 불러와서 새 과제 생성 가능
- 템플릿 관리 (수정/삭제) 가능

---

### 📦 Deliverables

**Database Migrations**:
- `20251109_create_assignment_templates.sql`

**Server Actions**:
- `app/lib/actions/assignmentTemplateActions.ts`

**UI Components** (TypeScript 변환):
- 133개 파일 .js → .ts/.tsx

---

### ✅ Exit Criteria

- ✅ TypeScript 변환 100% 완료
- ✅ Assignment 템플릿 작동
- ✅ `npm run build` 성공
- ✅ 빌드 에러 0건
- ✅ 기존 기능 회귀 테스트 통과

---

### 🗓️ Timeline

**Week 1 (2025-11-09 ~ 11-15): TypeScript 마이그레이션**
- Day 1-2: Phase 1-2 (Foundation + Server Actions)
- Day 3-5: Phase 3 (Components)
- Day 6-7: Phase 4 (App Routes) + 검증

**Week 2 (2025-11-16 ~ 11-22): Assignment 템플릿**
- Day 1-2: DB + Server Actions
- Day 3-4: UI 컴포넌트
- Day 5-7: 테스트 + 디버깅

---

## 🚀 Phase 1: MVP - YouTube 큐레이션 핵심

**Duration**: 3주 (2025-11-23 ~ 2025-12-14)
**Status**: 💡 아이디어
**GitHub Milestone**: Phase 1.5 MVP (신규 생성 예정)

### 🎯 Goals

**Primary Goal**: Vision 실현 시작 - YouTube 기반 무료 교육 플랫폼 런칭
- 교사가 YouTube URL로 코스 생성
- 학생이 평점 + 좋아요로 품질 평가
- 관리자가 교사 승인 + 코스 승인

**Success Criteria**:
- ✅ 50개 이상 승인된 코스
- ✅ 평균 평점 4.0/5.0 이상
- ✅ YouTube API 쿼터 초과 0건
- ✅ Rate Limiting 작동
- ✅ 서브도메인 분리 완료

### 🚀 Features

#### 1. YouTube API Integration (신규 개발)
**Purpose**: YouTube 영상 정보 자동 가져오기, 쿼터 절약

**Features**:
- `videos` 캐시 테이블 생성
- YouTube Data API v3 연동
- 자동 메타데이터 (제목, 썸네일, 길이, 채널)
- URL 직접 입력만 (검색 API 금지, 쿼터 절약)
- 배치 작업: 영상 삭제/비공개 탐지 (`is_playable` 플래그)

**Leveraging Existing**:
- ✅ `courses.intro_video_url` (기존 활용)
- ✅ `lessons.video_url` (기존 활용)
- ✅ `video_source` enum ('youtube', 'vimeo', 'upload')

**New Development**:
```sql
CREATE TABLE videos (
  id text primary key,              -- youtube_video_id
  provider text not null,           -- 'youtube'
  title text,
  duration int,
  thumbnails jsonb,
  channel_id text,
  channel_title text,
  is_playable boolean default true,
  last_checked_at timestamptz default now()
);
```

**Server Actions**:
- `app/lib/actions/youtubeActions.ts` (YouTube API 호출, 캐시 관리)

**Estimate**: 8-10시간

---

#### 2. 좋아요 시스템 (신규 개발)
**Purpose**: 빠른 UX, 평점과 병행

**Features**:
- `course_likes` 테이블 생성
- 좋아요 수 집계 (`courses.likes_count`)
- RLS 정책 (본인만 생성/삭제, 모두 조회)

**Leveraging Existing**:
- ✅ `reviews` 테이블 (평점 1-5, title, comment) → **재사용**
- ✅ `review_helpfulness` 테이블 → **재사용**

**New Development**:
```sql
CREATE TABLE course_likes (
  id uuid primary key,
  course_id uuid references courses(id) on delete cascade,
  user_id uuid references "user"(id) on delete cascade,
  created_at timestamptz default now(),
  unique(course_id, user_id)
);

ALTER TABLE courses ADD COLUMN likes_count int default 0;
```

**UI Components**:
- `components/Course/LikeButton.tsx` (좋아요 버튼)
- `components/Course/RatingWidget.tsx` (기존 reviews 활용)

**Estimate**: 4-5시간

---

#### 3. Quality Control (확장 + 신규)
**Purpose**: 저품질 콘텐츠 차단, 스팸 방지

**3-1. 교사 신청 시스템 (신규 개발)**
- `teacher_applications` 테이블
- 신청 폼 (이름, 이메일, 자기소개, SNS)
- 관리자 승인 워크플로우

```sql
CREATE TABLE teacher_applications (
  id uuid primary key,
  user_id uuid references "user"(id) on delete cascade,
  application_text text not null,
  status text not null default 'pending', -- pending, approved, rejected
  reviewed_by uuid references "user"(id),
  reviewed_at timestamptz,
  created_at timestamptz default now()
);
```

**3-2. 모든 코스 수동 승인 (확장)**
**Leveraging Existing**:
- ✅ `courses.status` 컬럼 ('draft', 'active', 'archived')

**Extension**:
- Enum 확장: 'pending', 'approved' 추가
- 기본값: 'pending'
- Admin UI: 코스 승인 페이지 (`app/(dashboard)/admin/courses/approval/`)

**3-3. Rate Limiting (신규 개발)**
- Middleware (IP + User 기반)
- Redis (Upstash 무료 플랜 or Supabase)
- 정책:
  - 코스 생성: 5개/일
  - 평점: 10개/일
  - 좋아요: 30개/일
  - 신고: 3개/일

**Estimate**: 10-12시간

---

#### 4. Premium Domain Separation (신규 개발)
**Purpose**: 무료/유료 콘텐츠 명확히 구분

**Features**:
- `middleware.ts` 생성
- 도메인 감지 (`premium.dvs.com`)
- 메인: YouTube 큐레이션만 표시
- Premium: 유료 강의만 표시

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';

  if (hostname.startsWith('premium.')) {
    // 프리미엄 강의만 표시
    return NextResponse.rewrite(new URL('/premium', request.url));
  }

  // 메인 도메인: YouTube 큐레이션만
  return NextResponse.next();
}
```

**Dependencies**:
- Domain 설정 (Vercel DNS)
- 환경 변수 (`NEXT_PUBLIC_MAIN_DOMAIN`, `NEXT_PUBLIC_PREMIUM_DOMAIN`)

**Estimate**: 4-5시간

---

### 📦 Deliverables

**Database Migrations**:
- `20251123_create_videos_table.sql`
- `20251124_create_course_likes_table.sql`
- `20251125_create_teacher_applications_table.sql`
- `20251126_extend_course_status_enum.sql`
- `20251127_add_likes_count_to_courses.sql`

**Server Actions**:
- `app/lib/actions/youtubeActions.ts` (YouTube API)
- `app/lib/actions/likeActions.ts` (좋아요)
- `app/lib/actions/teacherActions.ts` (교사 신청)

**UI Components**:
- `components/Course/LikeButton.tsx`
- `components/Instructor/TeacherApplicationForm.tsx`
- `app/(dashboard)/admin/teachers/page.tsx` (교사 승인)
- `app/(dashboard)/admin/courses/approval/page.tsx` (코스 승인)

**Middleware**:
- `middleware.ts` (도메인 라우팅 + Rate Limiting)

**Documentation**:
- `docs/library/youtube-integration.md` (완료 후 작성)
- `docs/library/quality-control.md` (완료 후 작성)

---

### 🗓️ Timeline (Flexible)

**Week 1 (2025-11-23 ~ 11-29): YouTube API + 좋아요**
- Day 1-3: YouTube API 연동 + videos 캐시
- Day 4-5: 좋아요 시스템
- Day 6-7: UI 통합 + 테스트

**Week 2 (2025-11-30 ~ 12-06): Quality Control**
- Day 1-3: 교사 신청 시스템
- Day 4-5: 코스 승인 확장
- Day 6-7: Admin UI

**Week 3 (2025-12-07 ~ 12-14): Rate Limiting + 서브도메인**
- Day 1-3: Rate Limiting Middleware
- Day 4-5: 서브도메인 분리
- Day 6-7: 전체 테스트 + 안정화

---

### 🔗 Dependencies

**External Services**:
- YouTube Data API v3 키 (Google Cloud Console)
- Redis (Upstash 무료 플랜) or Supabase
- Domain 설정 (premium.dvs.com → Vercel)

**Internal**:
- Phase 0 완료 (TypeScript 마이그레이션)
- 기존 reviews 테이블
- 기존 video_url 필드

---

### ⚠️ Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **YouTube API 쿼터 초과** | Medium | High | - videos 캐시 (90% 감소)<br>- 검색 API 금지<br>- 할당량 증가 신청 |
| **영상 삭제/비공개** | Medium | Medium | - 배치 작업 (is_playable 체크)<br>- 교사에게 알림<br>- 코스 비공개 처리 |
| **Rate Limiting 우회** | Low | Low | - IP + User 이중 체크<br>- Redis TTL 관리<br>- 로그 모니터링 |
| **서브도메인 설정 실패** | Low | Medium | - Fallback: 경로 분리 (`/premium`)<br>- Middleware 검증 |

---

## 🎨 Phase 2: Enhancement

**Duration**: 2주 (2025-12-15 ~ 2025-12-28)
**Status**: 💡 아이디어
**GitHub Milestone**: Phase 2: Admin System (→ 이름 변경 예정)

### 🎯 Goals

**Primary Goal**: 품질 관리 강화 + 수익화 시작
- 다중 배지로 코스 품질 시각화
- 신고 시스템으로 저품질 콘텐츠 차단
- 광고 수익 발생

### 🚀 Features

#### 1. 다중 배지 시스템 (#12)
- `course_badges` 테이블
- 배지 타입: Bestseller, Hot, New, Featured, Limited, Sale
- 자동 배지 할당 로직
- 교사 Featured 배지 설정

**Estimate**: 16시간

---

#### 2. 신고 시스템 (신규)
- `course_reports` 테이블
- 신고 3건 → 자동 비공개 + 관리자 검토
- Admin UI (신고 처리)

**Estimate**: 6-8시간

---

#### 3. 광고 연동 (신규)
- Google AdSense 코드 삽입
- 광고 위치 최적화 (사이드바, 목록 사이)
- 프리미엄 도메인: 광고 제거

**Estimate**: 4-5시간

---

#### 4. 금지어 필터링 (신규)
- `forbidden_words` 테이블
- 코스 제목/설명 자동 체크
- 자동 비공개 + 교사 알림

**Estimate**: 3-4시간

---

#### 5. 완료율 지표 (신규)
- 기존 `lesson_progress` 테이블 활용
- 코스 카드에 완료율 표시
- 랭킹 알고리즘 반영 (평점 + 조회수 + 완료율)

**Estimate**: 4-5시간

---

### ✅ Exit Criteria

- ✅ 광고 수익 $100+/월
- ✅ 신고 처리 시간 <24h
- ✅ 다중 배지 작동
- ✅ 완료율 지표 표시

---

## 🌐 Phase 3: Scale

**Duration**: 4주 (2025-12-29 ~ 2026-01-25)
**Status**: 💡 아이디어
**GitHub Milestone**: Phase 3: Scale (신규 생성 예정)

### 🎯 Goals

**Primary Goal**: 스케일 준비 + 고도화
- 검색 성능 최적화
- 추천 알고리즘 구축
- ML 기반 품질 분석

### 🚀 Features

1. **검색 최적화** - PostgreSQL Full-text or Algolia
2. **추천 알고리즘** - 개인화 추천, 유사 코스
3. **ML 품질 분석** - 스팸 탐지, 품질 점수
4. **좋아요 조작 방지** - Wilson Lower Bound, 패턴 분석

### ✅ Exit Criteria

- ✅ 검색 속도 <500ms
- ✅ 추천 정확도 70%+
- ✅ 조작 탐지율 90%+

---

## 🎯 Active Milestone: Quick Wins

**Purpose**: 긴급 작업, 문서, Hotfix
**Criteria**: <2시간, 단일 Phase 무관
**GitHub Milestone**: Active

**Examples**:
- 문서 작성/수정
- 버그 수정 (Hotfix)
- 린트/포맷팅
- 환경 변수 추가

**Process**: Issue → 즉시 처리 → PR → Close

---

## 📚 Backlog & Future Ideas

**Phase 4+**:
- 수료증 시스템 (NFT or PDF)
- 다국어 지원 (i18n)
- 모바일 앱 (React Native)
- 기업 B2B 플랜
- AI 자동 큐레이션

---

## 📊 Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2025-11-08 16:30 | Initial Roadmap (Vision 기반, 실제 상태 무시) | AI |
| 2.0 | 2025-11-08 17:00 | **재작성 (As-Is 반영)**: Gap Analysis, Phase 0 추가, 기존 구현 명시 | AI + User |
| 2.1 | 2026-09-16 | 재개 점검 결과 등재, 기존 Phase 일정 보류, #10 완료 표시 | AI + User |

---

## 🔗 Related Documents

**Vision & Strategy**:
- [Product Vision](./PROJECT_VISION.md)
- [Gap Analysis](./work-plans/temp-gap-analysis.md) (TEMP)

**Execution**:
- [Work Plans](./work-plans/)
- [ADR Index](./adr/INDEX.md)
- [Library](./library/)

**Workflow**:
- [Milestone-WorkPlan-ADR Relationship](./workflows/milestone-workplan-adr-relationship.md)
- [Project Workflow](../modules/workflow.md)

---

**End of Roadmap v2.0**

**Next Steps**:
1. TEMP Gap Analysis 파일 삭제
2. P3: Milestone 재정의 (GitHub Milestone 생성/수정)
3. Work Plan 업데이트
