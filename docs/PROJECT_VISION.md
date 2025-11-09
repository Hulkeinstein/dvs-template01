---
title: "DVS Product Vision"
tags:
  - type/docs
  - phase/planning
  - progress/completed
created: 2025-11-08
updated: 2025-11-08
lifecycle: active
---

# DVS Product Vision

**Version**: 1.0
**Last Updated**: 2025-11-08
**Status**: Active

---

## Executive Summary

DVS는 **YouTube 기반 교육 큐레이션 플랫폼**으로, 지식의 민주화를 실현합니다. 교사는 큐레이터로서 양질의 YouTube 영상을 선별·조합하여 무료 코스를 제공하고, 학습자는 평점과 좋아요로 품질을 평가합니다. 프리미엄 서브도메인에서는 유료 강의를 판매하며, 광고와 수수료로 지속 가능한 수익 모델을 구축합니다.

---

## 1. Problem Statement

### AI 시대 교육의 3가지 문제점

**1.1 교육 비용 장벽**
- 양질의 온라인 강의는 대부분 유료 (Udemy $10-200, Coursera $50-100/월)
- 무료 콘텐츠는 산재되어 있어 체계적 학습 어려움
- 학습자가 직접 검색·선별하는 시간 비용 발생

**1.2 콘텐츠 품질 불확실성**
- YouTube에 수백만 개의 교육 영상이 존재하지만 품질 천차만별
- 초보자는 좋은 콘텐츠를 판별하기 어려움
- 검증되지 않은 정보로 인한 학습 효율 저하

**1.3 분산된 학습 경험**
- 여러 채널을 오가며 학습 (진행률 추적 불가)
- 코스 완료 기준 모호
- 학습 동기 부여 시스템 부재

---

## 2. Solution Overview

### 2.1 Core Concept

**"교사는 큐레이터, YouTube는 콘텐츠 라이브러리"**

- 교사/큐레이터가 양질의 YouTube 영상을 선별하고 조합
- 학습자에게 체계적인 학습 경로 제공
- 커뮤니티 평가 (평점 + 좋아요)로 품질 검증
- 무료 제공으로 교육 접근성 확대

### 2.2 Platform Structure

**메인 도메인** (`www.dvs.com`)
- YouTube 큐레이션 기반 **무료** 코스
- 광고 수익 모델 (Google AdSense)
- 모든 코스 수동 승인 (품질 우선)

**프리미엄 서브도메인** (`premium.dvs.com`)
- 강사 직접 제작 **유료** 강의
- 수수료 수익 모델 (20-30%)
- Stripe 결제 연동

### 2.3 Key Differentiators

| 특징 | DVS | 경쟁사 (Udemy, Coursera) |
|------|-----|--------------------------|
| **가격** | 무료 (메인) | 유료 ($10-200) |
| **콘텐츠 소스** | YouTube 큐레이션 | 자체 제작 |
| **진입 장벽** | 낮음 (이메일만) | 높음 (결제 정보) |
| **품질 검증** | 커뮤니티 평가 | 플랫폼 자체 검증 |
| **업데이트** | 빠름 (YouTube 영상 교체) | 느림 (강사 재녹화) |

---

## 3. Target Users

### 3.1 Primary Personas

**페르소나 1: 교사/큐레이터 (공급자)**
- **누구**: 특정 분야 전문 지식을 가진 교사, 전문가, 열정적인 학습자
- **목표**: 자신의 지식 체계를 공유하고 학습자에게 가치 제공
- **Pain Point**: 강의를 직접 제작할 시간/자원 부족
- **DVS 솔루션**: 기존 YouTube 영상을 선별·조합하여 코스 생성 (제작 부담 없음)

**페르소나 2: 학습자 (소비자)**
- **누구**: 새로운 기술을 배우고 싶은 직장인, 학생, 취업 준비생
- **목표**: 무료로 체계적인 학습 경로 확보
- **Pain Point**: 어떤 YouTube 영상이 좋은지 모르겠고, 진행률 추적 어려움
- **DVS 솔루션**: 큐레이션된 코스 + 진행률 추적 + 커뮤니티 평가

**페르소나 3: 강사 (프리미엄)**
- **누구**: 프리미엄 강의를 판매하고 싶은 전문 강사
- **목표**: 수익 창출 + 브랜딩
- **Pain Point**: 플랫폼 수수료 높음 (Udemy 50%, Inflearn 30%)
- **DVS 솔루션**: 낮은 수수료 (20-30%) + 무료 도메인으로 잠재 고객 확보

### 3.2 User Journey

**교사/큐레이터**:
1. 회원가입 (Google OAuth)
2. 교사 신청 (자기소개, 전문 분야)
3. 관리자 승인
4. YouTube URL로 코스 생성
5. 관리자 코스 승인
6. 학습자 피드백 (평점, 좋아요) 확인

**학습자**:
1. 회원가입 (Google OAuth)
2. 관심 분야 코스 검색
3. 평점/좋아요 확인 후 수강 신청
4. 영상 시청 + 퀴즈 풀이
5. 진행률 추적
6. 코스 완료 후 평점 작성

---

## 4. Success Metrics

### 4.1 North Star Metric

**월간 활성 학습자 (MAU)**
- 목표: 1년 후 10,000 MAU
- 측정: 한 달 동안 최소 1개 영상 시청한 사용자 수

### 4.2 Key Performance Indicators (KPIs)

**사용자 성장**
- 신규 가입자: 500명/월 (Phase 1 종료 시)
- 교사/큐레이터: 50명 (Phase 1)
- 학습자: 1,000명 (Phase 1)

**콘텐츠 품질**
- 코스 수: 100개 (Phase 1)
- 평균 평점: 4.0/5.0 이상
- 코스 완료율: 30% 이상

**수익 (Phase 2 이후)**
- 광고 수익: $300-900/월
- 프리미엄 수수료: $500/월
- **목표 MRR**: $800-1,400/월 (초기)

**참여도**
- 평점 참여율: 20% (코스 수강자 중)
- 좋아요 참여율: 40%
- 일일 활성 사용자 (DAU): 500명

### 4.3 Success Criteria (Phase 1 Exit)

- ✅ 100개 이상의 승인된 코스
- ✅ 평균 평점 4.0/5.0 이상
- ✅ 코스 완료율 30% 이상
- ✅ YouTube API 쿼터 초과 사고 0건
- ✅ 중복 등록/결제 버그 0건

---

## 5. Product Principles

### 5.1 Core Values

**1. 지식의 민주화 (Democratization of Knowledge)**
- 모든 사람이 무료로 양질의 교육을 받을 권리
- 경제적 장벽 제거
- 글로벌 접근성 (언어, 지역 무관)

**2. 품질 우선 (Quality First)**
- **모든 코스 수동 승인** (자동화 < 품질 관리)
- 초기 안정성 확보 후 점진적 자동화 검토 (Phase 3)
- 커뮤니티 평가 시스템 (평점 + 좋아요)

**3. 커뮤니티 중심 (Community-Driven)**
- 학습자의 평가가 코스 품질을 결정
- 교사와 학습자 간 피드백 루프
- 투명한 평가 시스템

**4. 투명성 (Transparency)**
- 원저작자 크레딧 표시 (YouTube 채널 링크)
- "YouTube 제공 콘텐츠" 명시
- 광고/수수료 정책 공개

**5. 지속 가능성 (Sustainability)**
- 광고 + 수수료 이원화 수익 모델
- 교사/강사에게 공정한 보상
- 플랫폼 운영 비용 자립

### 5.2 Design Principles

**간결함 (Simplicity)**
- YouTube URL 붙여넣기만으로 코스 생성
- 검색 기능 제거 (쿼터 보호 + UX 단순화)

**신뢰성 (Reliability)**
- Rate Limiting으로 봇/스팸 차단
- 영상 삭제/비공개 자동 탐지
- 24시간 캐싱으로 성능 안정성

**접근성 (Accessibility)**
- Google OAuth 간편 로그인
- 모바일 반응형 UI
- 다크/라이트 모드 지원

---

## 6. Platform Architecture

### 6.1 Domain Structure

```
Main Domain (www.dvs.com)
├─ Free YouTube Curated Courses
├─ Community Ratings & Likes
├─ Course Progress Tracking
└─ Ad Revenue (AdSense)

Premium Subdomain (premium.dvs.com)
├─ Paid Instructor-Created Courses
├─ Stripe Payment Integration
├─ Commission Revenue (20-30%)
└─ No Ads
```

### 6.2 Core Features (Phase 1)

**YouTube Integration**
- `videos` 캐시 테이블 (24h TTL)
- URL 직접 입력만 (검색 API 금지)
- 자동 메타데이터 가져오기 (제목, 썸네일, 길이, 채널)
- 영상 삭제/비공개 탐지 (`is_playable` 플래그)

**Rating System**
- 평점 (1-5점) + 좋아요 병행
- `course_ratings` 테이블 (사용자당 1개)
- `course_likes` 테이블 (빠른 UX)
- 평균 평점 자동 계산

**Quality Control**
- **모든 코스 수동 승인** (`courses.status = 'pending'`)
- 교사 신청 시스템 (`teacher_applications`)
- Rate Limiting (코스 5개/일, 평점 10개/일)

**Security**
- RLS (Row Level Security) 정책
- Supabase 인증 통합
- Middleware Rate Limiting

---

## 7. Roadmap

### Phase 1: MVP (3주) - YouTube 큐레이션 핵심
**목표**: 무료 YouTube 코스 플랫폼 런칭

**Features**:
- videos 캐시 테이블 + YouTube API 연동
- 평점 + 좋아요 시스템
- 교사 신청 + 모든 코스 수동 승인
- Rate Limiting (Middleware + Redis)
- 서브도메인 분리 (premium.dvs.com)

**Exit Criteria**:
- 100개 승인된 코스
- 평균 평점 4.0/5.0
- YouTube API 쿼터 초과 0건

---

### Phase 2: 품질 & 수익 (2주)
**목표**: 품질 관리 강화 + 수익화 시작

**Features**:
- 신고 시스템 (부적절한 콘텐츠)
- 광고 연동 (Google AdSense)
- 프리미엄 수수료 로직 개선
- 금지어 필터링
- 완료율 지표 추가

**Exit Criteria**:
- 광고 수익 발생 ($100+/월)
- 신고 처리 시간 <24h
- 수수료 자동 계산

---

### Phase 3: 확장 & 최적화 (4주)
**목표**: 스케일 준비 + 고도화

**Features**:
- 검색 최적화 (PostgreSQL Full-text or Algolia)
- 추천 알고리즘 (평점 + 조회수 + 완료율)
- ML 기반 품질 분석
- 좋아요 조작 방지 (Wilson Lower Bound)
- 교사 승인 자동화 검토

**Exit Criteria**:
- 검색 속도 <500ms
- 추천 정확도 70%+
- 조작 탐지율 90%+

---

## 8. Risks & Mitigation

### 8.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **YouTube API 쿼터 초과** | Medium | High | - videos 캐시 (90% 감소)<br>- 할당량 증가 신청<br>- 검색 API 금지 |
| **영상 삭제/비공개** | Medium | Medium | - 배치 작업 (`is_playable` 체크)<br>- 교사에게 알림<br>- 대체 영상 추천 (Phase 3) |
| **서브도메인 설정** | Low | Medium | - Next.js Middleware 검증<br>- Fallback: 경로 분리 (`/premium`) |
| **Rate Limiting 우회** | Low | Low | - IP + User 이중 체크<br>- Redis TTL 관리 |

### 8.2 Business Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **저품질 콘텐츠 양산** | High | High | - 모든 코스 수동 승인<br>- 신고 시스템<br>- 교사 승인 심사 |
| **광고 수익 부진** | Medium | Medium | - 프리미엄 도메인 분리<br>- AdSense 최적화<br>- 수수료 수익 병행 |
| **법적 이슈 (저작권)** | Low | High | - YouTube 임베딩 (합법)<br>- 원저작자 크레딧<br>- ToS 명시 |

### 8.3 Legal Compliance

**YouTube Terms of Service**
- ✅ 임베딩 허용 (ToS 5.1.C)
- ✅ 링크 공유 합법
- ✅ 썸네일 사용 가능 (API 제공)
- ⚠️ "YouTube 제공 콘텐츠" 표시 필수
- ⚠️ 다운로드/광고 제거 금지 고지

---

## 9. Competitive Analysis

### 9.1 Market Positioning

```
              │ 무료 콘텐츠 │ 유료 콘텐츠
──────────────┼─────────────┼─────────────
큐레이션      │  DVS (Main) │  -
자체 제작     │  YouTube    │  Udemy, Coursera, DVS (Premium)
```

**DVS의 차별점**:
- 유일한 **무료 + 큐레이션** 포지셔닝
- YouTube의 방대한 콘텐츠 활용
- 낮은 진입 장벽 (이메일만)

### 9.2 Competitors

**YouTube (직접 검색)**
- 장점: 무료, 방대한 콘텐츠
- 단점: 체계 없음, 진행률 추적 불가, 품질 천차만별
- DVS 우위: 큐레이션, 진행률, 커뮤니티 평가

**Udemy, Coursera**
- 장점: 검증된 품질, 수료증
- 단점: 유료 ($10-200), 업데이트 느림
- DVS 우위: 무료, 빠른 업데이트

**Inflearn (한국)**
- 장점: 한국어 콘텐츠, 커뮤니티
- 단점: 유료, 강사 부담 큼
- DVS 우위: 무료 (메인), 강사 제작 부담 없음

---

## 10. Open Questions & Future Considerations

### 10.1 Open Questions (Phase 1)

- [ ] 교사 승인 기준 명확화 (전문성, 경험, 샘플 코스?)
- [ ] 코스 승인 SLA 정의 (신청 후 24h? 48h?)
- [ ] 프리미엄 강사 수수료 최종 확정 (20%? 25%? 30%?)
- [ ] 광고 위치 최적화 (사이드바? 목록 사이? 영상 전?)

### 10.2 Future Considerations (Phase 2+)

- 수료증 시스템 (NFT or PDF?)
- 다국어 지원 (영어, 일본어, 중국어)
- 모바일 앱 (React Native or Flutter?)
- 기업 B2B 플랜 (팀 라이센스)
- AI 자동 큐레이션 (ChatGPT API로 영상 추천)

---

## 11. Related Documents

**Architecture Decisions**:
- (TBD) ADR-0001: Supabase as Backend
- (TBD) ADR-0002: YouTube API Integration Strategy
- (TBD) ADR-0003: Rating System Design

**Implementation Guides**:
- `docs/library/` (Phase 1 완료 후 작성)

**Work Plans**:
- `docs/work-plans/temp-vision-analysis.md` (임시, 삭제 예정)
- `docs/work-plans/agile-restructure.md` (Issue #53)

**Workflows**:
- `docs/workflows/milestone-workplan-adr-relationship.md`
- `modules/workflow.md`

---

## Appendix A: Data Model (Core Tables)

```sql
-- videos 캐시 (YouTube 영상 정보)
create table videos (
  id text primary key,              -- youtube_video_id
  provider text not null,           -- 'youtube'
  title text,
  duration int,                     -- seconds
  thumbnails jsonb,
  channel_id text,
  channel_title text,
  is_playable boolean default true,
  last_checked_at timestamptz default now()
);

-- course_ratings (평점 시스템)
create table course_ratings (
  id uuid primary key,
  course_id uuid references courses(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  review text,
  created_at timestamptz default now(),
  unique(course_id, user_id)
);

-- course_likes (좋아요 시스템)
create table course_likes (
  id uuid primary key,
  course_id uuid references courses(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  created_at timestamptz default now(),
  unique(course_id, user_id)
);

-- teacher_applications (교사 신청)
create table teacher_applications (
  id uuid primary key,
  user_id uuid references users(id) on delete cascade,
  application_text text not null,
  status text not null default 'pending',
  reviewed_by uuid references users(id),
  reviewed_at timestamptz,
  created_at timestamptz default now()
);

-- courses 테이블 수정
alter table courses
  add column status text not null default 'pending',
  add column rating_avg numeric(3,2) default 0,
  add column rating_count int default 0,
  add column likes_count int default 0;
```

---

**End of Document**

**Version History**:
- 1.0 (2025-11-08): Initial Product Vision
- Based on: User requirements + GPT-5 feedback analysis
- Contributors: Development Team + AI Assistant

---

**Next Steps**:
1. Delete TEMP file: `docs/work-plans/temp-vision-analysis.md`
2. Create Roadmap: `docs/ROADMAP.md` (Phase 2)
3. Update Work Plan: `docs/work-plans/agile-restructure.md` (P1 완료 체크)
