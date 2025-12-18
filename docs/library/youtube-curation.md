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

### 데이터 스키마

```typescript
// lessons.content_data.youtube
interface YouTubeContentData {
  youtube_id: string;
  canonical_url: string;
  original_title: string;
  channel_name: string;
  channel_url: string;
  thumbnail_url: string;
  duration_seconds: number | null;
  fetched_at: string;
}
```

## Implementation

### 핵심 파일

| 파일 | 역할 |
|------|------|
| `app/lib/actions/youtubeActions.ts` | 메타데이터 fetch, 중복 검사 |
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
```

## Related

- Work Plan: `docs/work-plans/youtube-curation-mvp.md` (삭제 예정)
- GitHub Issue: #65
