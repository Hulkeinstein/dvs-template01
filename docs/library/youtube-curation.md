---
title: "YouTube 큐레이션 시스템"
tags:
  - phase/1
  - type/feature
  - component/lesson
created: 2025-12-18
updated: 2025-12-18
status: active
---

# YouTube 큐레이션 시스템

## Overview

YouTube 영상을 큐레이션하여 체계적인 학습 강좌를 제공하는 시스템.
강사가 YouTube URL을 입력하면 메타데이터를 자동으로 가져와 레슨을 생성합니다.

## Architecture

### 하이브리드 API 전략

```
YouTube URL 입력
    ↓
[1단계] oEmbed API (무제한, API Key 불필요)
    → 제목, 썸네일, 채널명
    ↓
[2단계] YouTube Data API v3 (선택적, 할당량 사용)
    → Duration만 (API Key 있을 때)
```

| API | 용도 | API Key | 할당량 |
|-----|------|---------|--------|
| oEmbed | 제목, 썸네일, 채널명 | ❌ 불필요 | 무제한 |
| Data API v3 | Duration만 | ✅ 필요 | 10,000 units/day |

### 데이터 스키마

```typescript
// lessons.content_data.youtube
interface YouTubeContentData {
  youtube_id: string;           // 영상 고유 ID
  canonical_url: string;        // 정규화된 URL
  original_title: string;       // 원본 제목
  channel_name: string;         // 채널명
  channel_url: string;          // 채널 URL
  thumbnail_url: string;        // 썸네일 URL
  duration_seconds: number | null; // 재생시간 (초)
  fetched_at: string;           // 메타데이터 수집 시점
}
```

### 중복 방지

```sql
-- 같은 코스 내 동일 YouTube 영상 중복 방지
CREATE UNIQUE INDEX idx_lessons_youtube_unique
ON lessons (course_id, (content_data->'youtube'->>'youtube_id'))
WHERE video_source = 'youtube'
  AND content_data->'youtube'->>'youtube_id' IS NOT NULL
  AND deleted_at IS NULL;
```

## Implementation

### 핵심 파일

| 파일 | 역할 |
|------|------|
| `app/lib/actions/youtubeActions.ts` | 메타데이터 fetch, 중복 검사 |
| `app/lib/actions/progressActions.ts` | 레슨 진도 토글 |
| `app/lib/utils/youtube.ts` | URL 파싱, ID 추출 |
| `components/Lesson/CreatorInfo.tsx` | 원작자 정보 표시 |
| `components/Lesson/LessonCompleteButton.tsx` | 완료 버튼 (낙관적 UI) |
| `components/Lesson/LessonVideo.tsx` | YouTube 임베드 플레이어 |

### 주요 함수

```typescript
// 메타데이터 가져오기
fetchYouTubeMetadata(url: string): Promise<Result<YouTubeContentData>>

// 중복 검사
checkYoutubeDuplicate(courseId: string, youtubeId: string): Promise<Result<boolean>>

// URL에서 ID 추출
extractYouTubeId(url: string): string | null

// 레슨 완료 토글
toggleLessonProgress(lessonId: string): Promise<Result<boolean>>
```

### UX 패턴

| 기능 | 패턴 | 설명 |
|------|------|------|
| URL 입력 | Debounce (600ms) | 타이핑 멈춘 후 API 호출 |
| 완료 버튼 | 낙관적 UI | 즉시 체크 → 서버 실패 시 롤백 |
| 에러 처리 | Graceful Degradation | API 실패 → 수동 입력 폴백 |
| 플레이어 | Privacy-enhanced | `youtube-nocookie.com` 도메인 |

## Usage

### 레슨 생성 (강사)

1. 코스 관리 → 레슨 추가
2. Video Source: "YouTube" 선택
3. YouTube URL 붙여넣기
4. 메타데이터 자동 로드 확인
5. 저장

### 레슨 시청 (학생)

1. 코스 → 레슨 선택
2. YouTube 영상 시청
3. "완료" 버튼 클릭
4. 진도 자동 저장

## Environment Variables

```env
# .env.local (선택적 - Duration 자동 추출용)
YOUTUBE_API_KEY=your_youtube_data_api_v3_key

# API Key 없어도 동작함 (Duration만 수동 입력)
```

## Database Migrations

- `20251218_youtube_unique_index.sql` - 중복 방지 인덱스
- `20251218_lesson_progress_rls.sql` - RLS 정책

## Related

- GitHub Issue: #65
- PR: #66
