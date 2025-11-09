---
title: "Phase 3: Scale"
tags:
  - phase/3
  - type/feature
  - component/api
  - component/ml
  - progress/backlog
created: 2025-11-09
updated: 2025-11-09
lifecycle: draft
related:
  - ../ROADMAP.md
  - ../PROJECT_VISION.md
  - phase-1.md
  - phase-2.md
---

# Phase 3: Scale

**GitHub Milestone**: Phase 3: Scale (신규 생성 예정)
**Duration**: 4주 (2025-12-29 ~ 2026-01-25)
**Due Date**: 2026-01-25
**Status**: 💡 아이디어

---

## 📋 Overview

### Purpose

**Primary Goal**: 스케일 준비 + 고도화
- 검색 성능 최적화
- 추천 알고리즘 구축
- ML 기반 품질 분석
- 조작 방지

### Why Scale?

**Phase 2 완료 후 성장 대비**:
- Phase 1: MVP 런칭
- Phase 2: 품질 관리 + 수익화
- **Phase 3**: 대규모 사용자 준비 (수천~수만 코스)

**Business Value**:
- 검색 성능 향상 (대용량 처리)
- 개인화 추천 (학습 경험 개선)
- ML 품질 분석 (자동화)
- 조작 방지 (신뢰도 향상)

---

## 🎯 Goals

### Primary Goals

1. **검색 최적화**
   - PostgreSQL Full-text Search or Algolia
   - 검색 속도 <500ms

2. **추천 알고리즘**
   - 개인화 추천 (학습 이력 기반)
   - 유사 코스 추천 (태그, 카테고리)

3. **ML 품질 분석**
   - 스팸 탐지 (자동화)
   - 품질 점수 (제목, 설명, 영상 분석)

4. **조작 방지**
   - Wilson Lower Bound (평점 조작 방지)
   - 패턴 분석 (좋아요 봇 탐지)

### Success Metrics

- ✅ 검색 속도 <500ms (10,000개 코스 기준)
- ✅ 추천 정확도 70%+ (클릭율 기준)
- ✅ 스팸 탐지율 90%+
- ✅ 조작 탐지율 90%+

---

## 🚀 Features

### Feature 1: 검색 최적화 (신규)

**Purpose**: 대용량 코스 검색 성능 향상

**Options**:

**Option A: PostgreSQL Full-text Search**
- Pros: 무료, 기존 DB 활용, 간단
- Cons: 성능 한계 (10,000+ 코스)

**Option B: Algolia**
- Pros: 빠름 (<50ms), 타이핑 자동완성, Faceted Search
- Cons: 비용 ($1/1,000 searches 이후)

**Recommendation**: Phase 3 초기는 PostgreSQL, 성능 병목 시 Algolia 도입

**Implementation (PostgreSQL)**:
```sql
-- Full-text Search Index
CREATE INDEX idx_courses_fts ON courses USING gin(to_tsvector('korean', title || ' ' || description));

-- Search Query
SELECT * FROM courses
WHERE to_tsvector('korean', title || ' ' || description) @@ to_tsquery('korean', '검색어')
ORDER BY ts_rank(...) DESC
LIMIT 20;
```

**Total Estimate**: 6-8시간 (PostgreSQL), 12-15시간 (Algolia 마이그레이션)

---

### Feature 2: 추천 알고리즘 (신규)

**Purpose**: 개인화 추천으로 학습 경험 개선

**2-1. 개인화 추천**
- 학습 이력 기반 (수강 완료 코스, 평점 높은 코스)
- Collaborative Filtering (유사 사용자 패턴)

**2-2. 유사 코스 추천**
- 태그 유사도 (Cosine Similarity)
- 카테고리 기반 추천

**Implementation**:
```sql
-- User Learning History
CREATE MATERIALIZED VIEW user_preferences AS
SELECT
  user_id,
  array_agg(DISTINCT tag) AS preferred_tags,
  array_agg(DISTINCT category) AS preferred_categories
FROM enrollments
JOIN courses ON enrollments.course_id = courses.id
JOIN course_tags ON courses.id = course_tags.course_id
WHERE lesson_progress.progress > 50  -- 50% 이상 수강
GROUP BY user_id;

-- Recommendation Query
SELECT courses.* FROM courses
WHERE EXISTS (
  SELECT 1 FROM course_tags
  WHERE course_tags.course_id = courses.id
    AND course_tags.tag = ANY(user_preferences.preferred_tags)
)
ORDER BY similarity DESC
LIMIT 10;
```

**Total Estimate**: 10-12시간

---

### Feature 3: ML 품질 분석 (신규)

**Purpose**: 스팸 + 저품질 코스 자동 탐지

**3-1. 스팸 탐지**
- Title/Description 텍스트 분석
- 키워드 빈도 (예: "100% 무료", "즉시 수익")
- ML 모델 (Naive Bayes or BERT)

**3-2. 품질 점수**
- 제목 길이 (20-100자 적정)
- 설명 길이 (>200자)
- 영상 길이 (10-60분 적정)
- 태그 수 (3-10개 적정)

**Implementation**:
```python
# Spam Detection (Python + Supabase Edge Function)
from sklearn.naive_bayes import MultinomialNB
from sklearn.feature_extraction.text import TfidfVectorizer

def detect_spam(title: str, description: str) -> float:
    text = f"{title} {description}"
    features = vectorizer.transform([text])
    spam_probability = model.predict_proba(features)[0][1]
    return spam_probability
```

**Total Estimate**: 15-20시간 (ML 모델 훈련 포함)

---

### Feature 4: 조작 방지 (신규)

**Purpose**: 평점/좋아요 조작 탐지 및 방지

**4-1. Wilson Lower Bound (평점 조작 방지)**
- 평점 수가 적을 때 신뢰도 하향 조정
- 평점 1,000개 vs 평점 5개 → 신뢰도 차이 반영

**Implementation**:
```sql
-- Wilson Lower Bound
SELECT
  course_id,
  title,
  avg_rating,
  review_count,
  (avg_rating - 1.96 * SQRT((avg_rating * (5 - avg_rating)) / review_count)) AS wilson_score
FROM courses
WHERE review_count >= 5
ORDER BY wilson_score DESC;
```

**4-2. 패턴 분석 (좋아요 봇 탐지)**
- IP 중복 (같은 IP에서 100개+ 좋아요)
- 시간 패턴 (1초에 10개+ 좋아요)
- User-Agent 중복

**Total Estimate**: 8-10시간

---

## 📋 Issues

**Note**: Phase 3는 미래 계획이므로 Issues 미생성

**예상 Issues** (작성 예정):
- #XX: PostgreSQL Full-text Search 최적화
- #XX: 개인화 추천 알고리즘
- #XX: ML 스팸 탐지 모델
- #XX: Wilson Lower Bound 랭킹
- #XX: 좋아요 봇 탐지

**Total Estimate**: 39-50시간 (약 2-3주, Solo Dev 기준 4주 여유)

---

## ✅ Exit Criteria

**완료 조건** (모두 충족 시 Milestone Close):

1. **검색 최적화**
   - ✅ 검색 속도 <500ms (10,000개 코스)
   - ✅ Full-text Search 작동 (한글 지원)

2. **추천 알고리즘**
   - ✅ 개인화 추천 작동
   - ✅ 추천 정확도 70%+ (클릭율)

3. **ML 품질 분석**
   - ✅ 스팸 탐지율 90%+
   - ✅ 품질 점수 자동 계산

4. **조작 방지**
   - ✅ Wilson Lower Bound 랭킹 작동
   - ✅ 좋아요 봇 탐지율 90%+

**Milestone Close 기준**: Exit Criteria 80% 이상 충족 시

---

## 📦 Deliverables

### Database Migrations
- `20260105_add_fts_index_to_courses.sql`
- `20260106_create_user_preferences_view.sql`
- `20260107_add_quality_score_to_courses.sql`

### Server Actions
- `app/lib/actions/searchActions.ts`
- `app/lib/actions/recommendActions.ts`
- `app/lib/actions/qualityActions.ts`

### Edge Functions (Python)
- `supabase/functions/spam-detection/index.py`
- `supabase/functions/bot-detection/index.py`

### Cron Jobs
- `syncUserPreferences()` - 일 1회
- `calculateQualityScores()` - 일 1회
- `detectBots()` - 시간 1회

---

## 🗓️ Timeline (Flexible)

**Week 1 (2025-12-29 ~ 2026-01-04): 검색 최적화**
- Day 1-3: PostgreSQL Full-text Search (6-8h)
- Day 4-7: 검색 UI 통합 + 테스트

**Week 2 (2026-01-05 ~ 01-11): 추천 알고리즘**
- Day 1-4: 개인화 추천 (10-12h)
- Day 5-7: 유사 코스 추천 + 테스트

**Week 3 (2026-01-12 ~ 01-18): ML 품질 분석**
- Day 1-5: 스팸 탐지 모델 훈련 (15-20h)
- Day 6-7: 품질 점수 계산 + 테스트

**Week 4 (2026-01-19 ~ 01-25): 조작 방지**
- Day 1-3: Wilson Lower Bound (8-10h)
- Day 4-5: 좋아요 봇 탐지
- Day 6-7: 전체 테스트 + 문서 작성

---

## 🔗 Dependencies

### Prerequisites
- ✅ Phase 2 (Enhancement) 완료
  - 다중 배지 작동
  - 신고 시스템 작동
  - 광고 수익 발생

### Internal Dependencies
- ✅ 대용량 코스 데이터 (1,000+ 코스)
- ✅ 사용자 학습 이력 (enrollments, lesson_progress)

### External Dependencies
- ❌ **Algolia 계정** (옵션, PostgreSQL 성능 부족 시)
- ❌ **Python ML 모델** (scikit-learn, TensorFlow)
- ❌ **Supabase Edge Functions** (Python 런타임)

**Blocking**: Phase 2 완료 후 시작 가능

---

## ⚠️ Risks & Mitigation

### Risk 1: ML 모델 정확도 부족
**Probability**: Medium
**Impact**: Medium
**Mitigation**:
- 훈련 데이터 수집 (1,000+ 샘플)
- 사람 검증 병행 (첫 3개월)
- 모델 정기 재훈련 (월 1회)

### Risk 2: 검색 성능 병목
**Probability**: Low
**Impact**: High
**Mitigation**:
- PostgreSQL 먼저 시도 (무료)
- 성능 모니터링 (P95 latency)
- Algolia 마이그레이션 준비 (병목 시)

### Risk 3: 추천 정확도 낮음
**Probability**: Medium
**Impact**: Low
**Mitigation**:
- A/B 테스트 (추천 vs 인기순)
- 사용자 피드백 수집 ("도움이 됐나요?")
- 알고리즘 정기 개선

---

## 🔗 Related Documents

**Roadmap**:
- [Product Roadmap](../ROADMAP.md) - Phase 3 상세
- [Phase 1: MVP](./phase-1.md)
- [Phase 2: Enhancement](./phase-2.md)

**ADR** (작성 예정):
- `docs/adr/XXXX-search-engine-choice.md` (PostgreSQL vs Algolia)
- `docs/adr/XXXX-ml-framework-choice.md` (scikit-learn vs TensorFlow)

**Library** (완료 후 작성):
- `docs/library/search-optimization.md`
- `docs/library/recommendation-system.md`
- `docs/library/ml-quality-analysis.md`

---

**Last Updated**: 2025-11-09
**Owner**: Development Team
**Status**: 💡 Idea (Draft)
