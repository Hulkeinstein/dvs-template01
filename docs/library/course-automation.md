---
title: "Course Automation Guide"
tags:
  - phase/1
  - type/library
  - component/course
created: 2026-01-02
updated: 2026-01-02
status: active
---

# Course Automation (Claude Code 자연어 기반)

## Overview

Claude Code에게 자연어로 지시하면 코스가 자동 생성되는 시스템.
**Admin 전용** - Instructor는 웹 UI로만 코스 생성 가능.

## Quick Start

### 사용자 지시 예시

```
"Python 입문 코스 만들어줘.
 영상은 이거야:
 - https://youtube.com/watch?v=abc123
 - https://youtube.com/watch?v=def456
 카테고리는 프로그래밍, 레벨은 초급, 무료 코스야"
```

### Claude Code 처리 순서

1. YouTube 메타데이터 추출 (`fetchYouTubeMetadata()`)
2. `CourseFormData` 구성
3. `createCourseHeadless()` 호출
4. 결과 반환

---

## API Reference

### createCourseHeadless()

```typescript
import { createCourseHeadless } from '@/app/lib/actions/courseActions';

const result = await createCourseHeadless(formData, adminEmail);
```

**Parameters**:
- `formData`: `CourseFormData` - 코스 데이터
- `adminEmail`: `string` - Admin 사용자 이메일

**Returns**:
```typescript
interface CreateCourseResult {
  success?: boolean;
  courseId?: string;
  error?: string;
}
```

**Errors**:
- `Admin email is required` - 이메일 누락
- `Admin user not found` - 사용자 없음
- `Permission denied` - Admin 권한 없음

---

## CourseFormData 필드

### 필수 필드

| Field | Type | Description |
|-------|------|-------------|
| `title` | `string` | 코스 제목 |
| `shortDescription` | `string` | 짧은 설명 (1-2줄) |
| `description` | `string` | 상세 설명 |
| `category` | `string` | 카테고리 |
| `level` | `string` | `beginner` \| `intermediate` \| `advanced` |
| `language` | `string` | 언어 (예: "Korean") |
| `price` | `number` | 가격 (0 = 무료) |

### 선택 필드 (기본값 있음)

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `slug` | `string` | 자동 생성 | URL-friendly 식별자 |
| `maxStudents` | `number` | 100 | 최대 수강생 |
| `discountPrice` | `number \| null` | null | 할인 가격 |
| `topics` | `TopicData[]` | `[]` | 토픽 및 레슨 |
| `certificateEnabled` | `boolean` | false | 수료증 발급 |
| `passingGrade` | `number` | 70 | 합격 점수 |
| `status` | `string` | `draft` | `draft` \| `published` |

### Topic 및 Lesson 구조

```typescript
interface TopicData {
  id: string;
  name: string;
  summary: string;
  lessons: LessonData[];
}

interface LessonData {
  id: string;
  title: string;
  content_type: 'video' | 'quiz' | 'assignment';
  videoUrl?: string;      // YouTube URL
  videoSource?: string;   // 'youtube'
  duration?: number;      // 초 단위
  enablePreview?: boolean;
}
```

---

## YouTube 메타데이터 활용

### fetchYouTubeMetadata()

```typescript
import { fetchYouTubeMetadata } from '@/app/lib/actions/youtubeActions';

const metadata = await fetchYouTubeMetadata(videoId);
```

**Returns**:
```typescript
{
  title: string;
  description: string;
  thumbnail: string;      // 썸네일 URL
  duration: number;       // 초 단위
  channelTitle: string;
}
```

---

## Complete Example

```typescript
import { createCourseHeadless } from '@/app/lib/actions/courseActions';
import { fetchYouTubeMetadata } from '@/app/lib/actions/youtubeActions';
import { CourseFormData } from '@/types/create-course';

// 1. YouTube 메타데이터 추출
const video1 = await fetchYouTubeMetadata('abc123');
const video2 = await fetchYouTubeMetadata('def456');

// 2. CourseFormData 구성
const formData: CourseFormData = {
  title: 'Python 입문',
  shortDescription: '파이썬 기초부터 실전까지',
  description: '이 코스에서는 Python의 기초 문법부터...',
  category: '프로그래밍',
  level: 'beginner',
  language: 'Korean',
  price: 0,
  maxStudents: 100,
  introVideoUrl: '',
  discountPrice: null,
  startDate: '',
  endDate: '',
  enrollmentDeadline: '',
  duration: 0,
  certificateEnabled: false,
  certificateTitle: '',
  passingGrade: 70,
  lifetimeAccess: false,
  topics: [
    {
      id: 'topic-1',
      name: 'Getting Started',
      summary: 'Python 설치 및 환경 설정',
      lessons: [
        {
          id: 'lesson-1',
          title: video1.title,
          content_type: 'video',
          videoUrl: 'https://youtube.com/watch?v=abc123',
          videoSource: 'youtube',
          duration: video1.duration,
          enablePreview: true,
        },
        {
          id: 'lesson-2',
          title: video2.title,
          content_type: 'video',
          videoUrl: 'https://youtube.com/watch?v=def456',
          videoSource: 'youtube',
          duration: video2.duration,
          enablePreview: false,
        },
      ],
    },
  ],
};

// 3. 코스 생성
const result = await createCourseHeadless(
  formData,
  'admin@example.com'
);

if (result.success) {
  console.log('코스 생성 완료! ID:', result.courseId);
} else {
  console.error('실패:', result.error);
}
```

---

## Permission Model

| Role | Manual (Web UI) | Automation (Claude Code) |
|------|-----------------|--------------------------|
| Admin | ✅ | ✅ |
| Instructor | ✅ | ❌ |
| Student | ❌ | ❌ |

---

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Admin email is required` | 이메일 파라미터 누락 | adminEmail 전달 필수 |
| `Admin user not found` | DB에 해당 이메일 없음 | Admin 계정 확인 |
| `Permission denied` | role !== 'admin' | Admin 권한 필요 |
| `이미 사용 중인 URL` | slug 중복 | 다른 제목/slug 사용 |

### YouTube Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Video not found` | 비공개/삭제된 영상 | URL 확인 |
| `Invalid URL format` | 잘못된 URL | YouTube URL 형식 확인 |

---

## Related Files

- `app/lib/actions/courseActions.ts` - `createCourseHeadless()`
- `app/lib/actions/youtubeActions.ts` - `fetchYouTubeMetadata()`
- `types/create-course.ts` - `CourseFormData` 타입
- `app/lib/utils/courseDataMapper.ts` - DB 매핑

---

## ADR Reference

- (없음 - 아키텍처 결정 없음)
