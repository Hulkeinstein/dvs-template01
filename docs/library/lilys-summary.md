---
title: "Lilys.ai 스타일 AI 요약 시스템"
tags:
  - phase/1
  - type/feature
  - component/lesson
created: 2025-12-20
updated: 2025-12-25
status: active
---

# Lilys.ai 스타일 AI 요약 시스템

## Overview

YouTube 영상 자막을 기반으로 Lilys.ai 스타일의 구조화된 AI 요약 노트를 생성하는 시스템.
기존 단순 요약에서 핵심 Q&A, 액션 포인트, 개요, 타임라인 노트 형태의 학습 친화적 요약으로 전면 개편.

**릴리즈**: 2025-12-21 (Issue #67)

## Architecture

### 요약 생성 플로우

```
YouTube URL 입력
    ↓
[1단계] 자막 추출 (youtube-transcript)
    ↓
[2단계] GPT-4o-mini 요약 생성
    → Lilys 스타일 프롬프트
    → JSON 구조화 출력
    ↓
[3단계] Zod 스키마 검증
    → LilysSummaryDataSchema
    ↓
[4단계] DB 캐싱 (ai_summary_cache)
    ↓
[5단계] UI 렌더링 (SummaryDisplay)
```

### 데이터 스키마

```typescript
// types/summary.ts
interface LilysSummaryData {
  format: 'lilys';                    // 형식 식별자
  core_qa: {
    question: string;                 // 📌 핵심 질문
    answer: string;                   // 핵심 답변
  };
  action_points: {
    items: string[];                  // 💡 액션 포인트 (2-5개)
  };
  overview: string;                   // 📝 개요 (3-4문장)
  timeline_intro: {
    text: string;                     // 타임라인 소개
  };
  sections: Section[];                // 🗂️ 타임라인 섹션들
  suggestions?: string[];             // 💭 관련 질문 (선택)
  meta: SummaryMeta;                  // 메타데이터
}

interface Section {
  emoji: string;                      // 섹션 이모지
  title: string;                      // 섹션 제목
  timestamp: string;                  // 시작 시간 (MM:SS)
  timestamp_seconds: number;          // 시작 초
  subsections: Subsection[];          // 서브섹션들
}

interface Subsection {
  timestamp: string;                  // 서브섹션 시간
  timestamp_seconds: number;          // 서브섹션 초
  title: string;                      // 서브섹션 제목
  content: string;                    // 서브섹션 내용
}
```

### 하위 호환성

```typescript
// 기존 포맷과 병렬 지원
type AnySummaryData = LilysSummaryData | SummaryData;

// 타입 가드
function isLilysFormat(data: AnySummaryData): data is LilysSummaryData {
  return data && 'format' in data && data.format === 'lilys';
}

function isLegacyFormat(data: AnySummaryData): data is SummaryData {
  return data && 'key_notes' in data && !('format' in data);
}
```

## Implementation

### 핵심 파일

| 파일 | 역할 |
|------|------|
| `types/summary.ts` | Lilys 스키마, 타입 가드 |
| `app/lib/actions/summaryActions.ts` | AI 요약 생성 (`generateLilysSummary`) |
| `app/lib/actions/transcriptActions.ts` | 자막 추출 |
| `app/lib/actions/summaryCachingActions.ts` | 캐싱, 일일 제한 |
| `components/Lesson/SummaryDisplay.tsx` | UI 렌더링 |
| `public/scss/elements/_summary-display.scss` | 스타일 |

### 주요 함수

```typescript
// 자막 추출
fetchTranscript(videoId: string): Promise<TranscriptResponse>

// Lilys 스타일 요약 생성
generateLilysSummary(
  transcript: TranscriptResponse,
  description?: string,
  videoDurationSeconds?: number
): Promise<LilysSummaryResult>

// 캐시 조회
getSavedSummary(videoId: string): Promise<LilysSummaryData | null>

// 일일 사용량 체크
checkDailyLimit(userId: string): Promise<{ canGenerate: boolean; remaining: number }>
```

### AI 프롬프트 설계

```typescript
const systemPrompt = `You are a professional video note-taker creating Lilys.ai style summaries.

OUTPUT FORMAT (JSON):
{
  "format": "lilys",
  "core_qa": { "question": "...", "answer": "..." },
  "action_points": { "items": ["...", "..."] },
  "overview": "...",
  "timeline_intro": { "text": "..." },
  "sections": [...],
  "suggestions": ["?", "?"]
}

ROLE DISTINCTION (중복 방지):
- core_qa: 영상의 핵심 가치를 Q&A 형태로 (가장 중요한 하나)
- overview: 배경 설명 + 전체 요약 (무엇을, 왜)
- timeline_intro: 시간순 흐름 안내 (어떻게 전개되는지)

RULES:
1. 모든 텍스트는 한국어
2. sections: 영상 길이에 따라 3-8개
3. 각 섹션에 timestamp 필수
4. subsection.content: "~합니다" 종결어미`;
```

### UI 구조

```
📌 핵심 Q&A
┌─────────────────────────────────┐
│ Q: 핵심 질문                     │
│ A: 핵심 답변                     │
└─────────────────────────────────┘

💡 액션 포인트
┌─────────────────────────────────┐
│ • 포인트 1                       │
│ • 포인트 2                       │
└─────────────────────────────────┘

📑 목차 (TOC)
┌─────────────────────────────────┐
│ 1. 섹션 1                        │
│ 2. 섹션 2                        │
└─────────────────────────────────┘

📝 개요
┌─────────────────────────────────┐
│ 영상 전체 요약                   │
└─────────────────────────────────┘

🗂️ 타임라인 노트
┌─────────────────────────────────┐
│ 1. 섹션 1 ▶ 00:00               │
│    [서브섹션 제목]: 내용...       │
└─────────────────────────────────┘

💭 관련 질문 (선택)
┌─────────────────────────────────┐
│ • 더 궁금한 질문 1?              │
│ • 더 궁금한 질문 2?              │
└─────────────────────────────────┘
```

### 스타일링 (SCSS)

| 클래스 | 용도 |
|--------|------|
| `.summary-display--lilys` | Lilys 스타일 컨테이너 |
| `.summary-display__core-qa` | 핵심 Q&A 섹션 |
| `.summary-display__action-points` | 액션 포인트 |
| `.summary-display__toc` | 목차 |
| `.summary-display__overview` | 개요 |
| `.summary-display__timeline` | 타임라인 노트 |
| `.summary-display__section` | 개별 섹션 |
| `.summary-display__suggestions` | 관련 질문 |

**다크모드**: `[data-theme="dark"]`, `.active-dark-mode` 지원

## Usage

### 강사 (요약 생성)

1. 코스 관리 → 레슨 추가
2. YouTube URL 입력
3. "AI 요약" 버튼 클릭
4. 요약 생성 완료 후 저장

### 학생 (요약 보기)

1. 레슨 페이지 접속
2. 요약 섹션에서 Lilys 스타일 노트 확인
3. 타임스탬프 클릭 → 해당 구간 재생

## Technical Decisions

| 결정 | 선택 | 대안 | 이유 |
|------|------|------|------|
| 타입 구조 | 새 타입 병렬 추가 | 기존 확장 | 기존 캐시 호환 |
| 불릿 저장 | `string[]` | 마크다운 | 단순, 검증 용이 |
| 섹션 분할 | AI 자동 | 규칙 기반 | 품질 향상 |
| UI 분기 | 타입 가드 | 버전 필드 | 타입 안전 |

## Environment Variables

```env
# .env.local
OPENAI_API_KEY=your_openai_api_key   # AI 요약 생성용 (필수)
YOUTUBE_API_KEY=your_youtube_api_key  # Duration 추출용 (선택)
```

## Database

### ai_summary_cache 테이블

```sql
-- 요약 캐시 테이블
CREATE TABLE ai_summary_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id TEXT NOT NULL UNIQUE,
  summary_data JSONB NOT NULL,        -- LilysSummaryData 저장
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 일일 사용량 추적
CREATE TABLE ai_summary_usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user(id),
  video_id TEXT NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT now()
);
```

## Testing

### 테스트 케이스

| 케이스 | 설명 |
|--------|------|
| 짧은 영상 | 5분 이하 (3-4 섹션) |
| 중간 영상 | 10-20분 (5-6 섹션) |
| 긴 영상 | 30분 이상 (7-8 섹션) |
| 다크모드 | 스타일 전환 확인 |
| 타임스탬프 | 클릭 시 영상 이동 |
| 캐시 호환 | 기존 포맷 렌더링 |

### TestSprite 결과

- **프론트엔드**: 1/10 통과 (모달 UI 접근 제한)
- **백엔드**: Server Actions 직접 테스트 미지원
- **결론**: 수동 테스트 또는 Jest 단위 테스트 권장

## Phase 2 (후속 개선)

| 기능 | 설명 |
|------|------|
| 탭 UI | 핵심 노트 / 타임라인 노트 분리 |
| SourceRef | 인용 클릭 시 영상 구간 이동 |
| captureSource | 섹션별 썸네일 이미지 |
| Duration 표시 | 섹션별 "(8분)" 표시 |
| Multiple Q&A | 긴 영상 2-3개 Q&A 지원 |

## Related

- **GitHub Issue**: #67
- **Branch**: `feature/lilys-style-summary`
- **YouTube 큐레이션**: [library/youtube-curation.md](./youtube-curation.md)
- **SCSS 트러블슈팅**: [troubleshooting/scss-styling-issues.md](../troubleshooting/scss-styling-issues.md)
- **HiStudy SCSS 가이드**: [guides/histudy-scss-guide.md](../guides/histudy-scss-guide.md)
