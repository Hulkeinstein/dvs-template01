# AI Summary Feature - Product Specification

## Overview

This document describes the AI Summary feature for YouTube video lessons in the DVS Education Platform. The feature allows instructors to automatically generate AI-powered summaries for YouTube videos when creating or editing course lessons.

## Feature Purpose

Enable instructors to quickly generate comprehensive, structured summaries of YouTube video content using AI (OpenAI API), improving the learning experience for students with:
- Core Q&A extraction
- Action points
- Overview
- Timeline-based sections with timestamps
- Related suggestions

---

## Test Environment

- **Local Development URL**: `http://localhost:3000`
- **Test Path**: `/create-course?edit=2b7e6b49-fad4-4f90-9d34-b82bdfd7a530`
- **Full URL**: `http://localhost:3000/create-course?edit=2b7e6b49-fad4-4f90-9d34-b82bdfd7a530`
- **Database**: Supabase (PostgreSQL)
- **External APIs**: OpenAI (gpt-4o-mini), Supadata (YouTube transcript)

---

## PART 1: Frontend Tests (E2E)

### User Flow

#### Prerequisites
- User must be logged in as an instructor
- User must have an existing course to edit (or create new)

#### Step-by-Step Flow

1. **Navigate to Course Editor**
   - Go to `/create-course?edit={courseId}`
   - Page loads with Course Builder interface

2. **Open Topic Accordion**
   - Locate "Course Builder" section with topic accordions
   - Find the target topic (e.g., "바이브코딩")
   - Click the accordion header to expand it
   - Accordion reveals lesson list and action buttons

3. **Open Add Lesson Modal**
   - Click the "Lesson" button within the expanded accordion
   - Bootstrap modal opens with title "Add Lesson" (or "Edit Lesson" if editing)
   - Modal ID: `Lesson`

4. **Enter YouTube Video URL**
   - Locate "Video URL" input field (ID: `lessonVideoUrl`)
   - Enter a valid YouTube URL (e.g., `https://www.youtube.com/watch?v=VIDEO_ID`)
   - Wait for automatic metadata loading (debounced 600ms)
   - Loading indicator shows "메타데이터 가져오는 중..."

5. **Verify Metadata Loaded**
   - After loading completes, a preview card appears showing:
     - Thumbnail image
     - Video title
     - Channel name
     - Duration (e.g., "10분 30초")
   - Lesson Name and other fields auto-populate from YouTube metadata

6. **Generate AI Summary**
   - "AI 요약" button appears below the metadata preview
   - Button text: "AI 요약" with star icon
   - Click the button
   - Button changes to "생성 중..." with spinner

7. **Wait for Summary Generation**
   - System fetches video transcript
   - AI processes transcript and generates structured summary
   - Takes approximately 10-30 seconds depending on video length

8. **View Generated Summary**
   - Summary displays below the button in structured format:
     - **Core Q&A**: Main question and answer
     - **Action Points**: Bulleted actionable items
     - **TOC (Table of Contents)**: Clickable section links
     - **Overview**: Background and summary text
     - **Timeline Sections**: Detailed sections with subsections
     - **Suggestions**: Related questions (optional)

9. **Save Lesson with Summary**
   - Click "Add Lesson" (or "Update Lesson") button
   - Modal closes
   - Summary data is saved with the lesson's `content_data.summary`

### Frontend Test Cases

#### TC-F001: Basic Summary Generation
**Preconditions**: User logged in as instructor, existing course with topic

**Steps**:
1. Navigate to `/create-course?edit={courseId}`
2. Expand topic accordion
3. Click "Lesson" button
4. Enter YouTube URL: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
5. Wait for metadata to load
6. Click "AI 요약" button
7. Wait for generation to complete

**Expected Results**:
- Metadata preview shows video info
- AI 요약 button is enabled after metadata loads
- Summary displays with core_qa, action_points, sections
- No error messages

#### TC-F002: Invalid YouTube URL
**Steps**:
1. Open Lesson modal
2. Enter invalid URL: `https://example.com/video`

**Expected Results**:
- No metadata preview appears
- AI 요약 button remains disabled
- No error message (silent fail)

#### TC-F003: Summary Caching (Frontend)
**Preconditions**: Summary already generated for a lesson

**Steps**:
1. Open existing lesson with summary in edit mode
2. Click "AI 요약" button without changing URL

**Expected Results**:
- Cached summary loads immediately (no loading spinner)
- No API call made
- Same summary content displayed

#### TC-F004: Daily Limit Error Display
**Preconditions**: User has exceeded daily summary limit

**Steps**:
1. Open Lesson modal
2. Enter valid YouTube URL
3. Click "AI 요약" button

**Expected Results**:
- Error message displayed: "일일 요약 한도(X건)를 초과했습니다"
- Summary not generated

#### TC-F005: Save Lesson with Summary
**Steps**:
1. Generate summary (TC-F001)
2. Click "Add Lesson" button

**Expected Results**:
- Modal closes
- Lesson saved with summary in content_data
- Lesson appears in topic list

#### TC-F006: Dark Mode Styling
**Preconditions**: Dark mode enabled

**Steps**:
1. Generate summary
2. Observe summary display

**Expected Results**:
- All text is readable
- Proper contrast on all sections
- No white backgrounds on dark mode

---

## PART 2: Backend Tests (API / Server Actions)

### Backend Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    LessonModal.tsx                          │
│                  (Frontend Component)                        │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              Server Actions (app/lib/actions/)              │
├─────────────────────────────────────────────────────────────┤
│  transcriptActions.ts   │  Fetch YouTube transcripts        │
│  summaryActions.ts      │  Generate AI summaries            │
│  summaryCachingActions.ts│  Cache & rate limiting           │
│  youtubeActions.ts      │  YouTube metadata fetching        │
└─────────────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   External APIs                              │
├─────────────────────────────────────────────────────────────┤
│  Supadata API  │  YouTube transcript extraction             │
│  OpenAI API    │  GPT-4o-mini for summary generation        │
│  Supabase      │  PostgreSQL for caching & rate limiting    │
└─────────────────────────────────────────────────────────────┘
```

### Server Actions to Test

#### 1. transcriptActions.ts - `fetchTranscript()`

**Function**: `fetchTranscript(youtubeUrl: string): Promise<TranscriptResult>`

**Test Cases**:

| ID | Test Case | Input | Expected Output |
|----|-----------|-------|-----------------|
| TC-B001 | Valid YouTube URL with transcript | `https://youtube.com/watch?v=valid_id` | `{ success: true, data: { content: [...], lang: 'ko' } }` |
| TC-B002 | Invalid YouTube URL format | `https://example.com/video` | `{ success: false, error: 'Invalid YouTube URL', errorType: 'UNKNOWN' }` |
| TC-B003 | Video without transcript | `https://youtube.com/watch?v=no_caption` | `{ success: false, errorType: 'NO_TRANSCRIPT' }` |
| TC-B004 | Rate limit exceeded | (After many requests) | `{ success: false, errorType: 'RATE_LIMIT' }` |
| TC-B005 | Missing API key | (No SUPADATA_API_KEY) | `{ success: false, error: 'Missing Supadata API Key' }` |

#### 2. summaryActions.ts - `generateFullSummary()`

**Function**: `generateFullSummary(transcript: TranscriptResponse, description: string, duration: number): Promise<LilysSummaryResult>`

**Test Cases**:

| ID | Test Case | Input | Expected Output |
|----|-----------|-------|-----------------|
| TC-B006 | Valid transcript (Korean) | Transcript with Korean text | Lilys-format summary with all fields |
| TC-B007 | Valid transcript (English) | Transcript with English text | Summary translated to Korean |
| TC-B008 | Empty transcript | `{ content: [] }` | Error or minimal summary |
| TC-B009 | Very long transcript (>1hr) | 60+ min video transcript | Summary with multiple sections |
| TC-B010 | Missing OpenAI API key | (No OPENAI_API_KEY) | `{ success: false, error: 'Missing OpenAI API Key' }` |
| TC-B011 | OpenAI rate limit | (After many requests) | `{ success: false, errorType: 'RATE_LIMIT' }` |

**Output Schema Validation**:
```typescript
// Response must match LilysSummaryDataSchema
{
  format: 'lilys',
  core_qa: { question: string, answer: string },
  action_points: { items: string[] },
  overview: string,
  timeline_intro: { text: string },
  sections: Array<{
    emoji: string,
    title: string,
    timestamp?: string,
    timestamp_seconds?: number,
    subsections: Array<{ timestamp, content }>
  }>,
  suggestions?: string[],
  meta: { model, input_tokens, output_tokens, cost_usd }
}
```

#### 3. summaryCachingActions.ts

**Functions to Test**:

| Function | Purpose |
|----------|---------|
| `getSavedSummary(lessonId)` | Retrieve cached summary from DB |
| `saveSummary(lessonId, summary)` | Save summary to DB |
| `checkDailyLimit(userId)` | Check if user can generate more summaries |
| `incrementDailyUsage(userId, lessonId)` | Record summary generation |
| `logSummaryCost(costInfo)` | Log API costs |

**Test Cases**:

| ID | Test Case | Function | Expected |
|----|-----------|----------|----------|
| TC-B012 | Cache miss | `getSavedSummary('new_lesson')` | `{ cached: false, data: null }` |
| TC-B013 | Cache hit | `getSavedSummary('existing')` | `{ cached: true, data: {...} }` |
| TC-B014 | Save summary | `saveSummary('lesson', summary)` | `{ success: true }` |
| TC-B015 | Under daily limit | `checkDailyLimit('user1')` | `{ allowed: true, remaining: 49 }` |
| TC-B016 | At daily limit | `checkDailyLimit('heavy_user')` | `{ allowed: false, remaining: 0 }` |
| TC-B017 | Increment usage | `incrementDailyUsage('user1')` | `{ success: true }` |
| TC-B018 | Log cost | `logSummaryCost({...})` | `{ success: true }` |
| TC-B019 | Invalid lesson ID | `getSavedSummary('')` | `{ success: false, error: 'Lesson ID is required' }` |

#### 4. youtubeActions.ts - `fetchYouTubeMetadata()`

**Function**: `fetchYouTubeMetadata(url: string): Promise<YouTubeMetadataResult>`

**Test Cases**:

| ID | Test Case | Input | Expected |
|----|-----------|-------|----------|
| TC-B020 | Valid YouTube URL | `https://youtube.com/watch?v=...` | `{ success: true, data: { title, thumbnail_url, duration_seconds, channel_name } }` |
| TC-B021 | Invalid URL | `not-a-url` | `{ success: false }` |
| TC-B022 | Private video | Private video URL | `{ success: false, error: '...' }` |
| TC-B023 | Deleted video | Non-existent video | `{ success: false }` |

### Database Tests

#### Tables Used

| Table | Purpose |
|-------|---------|
| `lessons` | Store `content_data.summary` |
| `summary_usage_logs` | Rate limiting & cost tracking |

#### SQL Function Test

**Function**: `get_daily_summary_count(p_user_id uuid)`

```sql
-- Test: Returns count of summaries generated today
SELECT get_daily_summary_count('user-uuid-here');
-- Expected: Integer (0-50)
```

**Test Cases**:

| ID | Scenario | Expected |
|----|----------|----------|
| TC-B024 | New user, no usage | Returns 0 |
| TC-B025 | User with 5 summaries today | Returns 5 |
| TC-B026 | User with usage from yesterday only | Returns 0 (reset at midnight) |

---

## PART 3: Integration Tests

### End-to-End Flow Test

**TC-I001: Complete Summary Generation Flow**

```
1. Frontend: User enters YouTube URL
   └─► youtubeActions.fetchYouTubeMetadata()
       └─► Returns: title, thumbnail, duration

2. Frontend: User clicks "AI 요약"
   └─► Session check (NextAuth)
   └─► summaryCachingActions.checkDailyLimit()
       └─► Returns: { allowed: true }

3. Backend: Fetch transcript
   └─► transcriptActions.fetchTranscript()
       └─► Supadata API call
       └─► Returns: TranscriptResponse

4. Backend: Generate summary
   └─► summaryActions.generateFullSummary()
       └─► OpenAI API call
       └─► Zod validation (LilysSummaryDataSchema)
       └─► Returns: SummaryData

5. Backend: Save & log
   └─► summaryCachingActions.saveSummary()
   └─► summaryCachingActions.incrementDailyUsage()
   └─► summaryCachingActions.logSummaryCost()

6. Frontend: Display summary
   └─► SummaryDisplay component renders
```

### Error Handling Integration Tests

| ID | Scenario | Trigger | Expected Behavior |
|----|----------|---------|-------------------|
| TC-I002 | Transcript API fails | Supadata down | Show "자막을 가져오는데 실패했습니다" |
| TC-I003 | OpenAI API fails | OpenAI error | Show "요약 생성에 실패했습니다" + retry button |
| TC-I004 | DB save fails | Supabase error | Summary displays but not cached |
| TC-I005 | Network timeout | Slow connection | Loading state → timeout error |

---

## Environment Variables Required

```env
# OpenAI (for summary generation)
OPENAI_API_KEY=sk-...

# Supadata (for transcript fetching)
SUPADATA_API_KEY=...

# Supabase (for caching)
NEXT_PUBLIC_SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=...

# NextAuth (for session)
NEXTAUTH_SECRET=...
```

---

## UI Components Reference

| Component | File | Purpose |
|-----------|------|---------|
| LessonModal | `components/create-course/QuizModals/LessonModal.tsx` | Main modal for lesson creation |
| SummaryButton | `components/Lesson/SummaryButton.tsx` | Trigger button for AI summary |
| SummaryDisplay | `components/Lesson/SummaryDisplay.tsx` | Renders the generated summary |
| SummaryDisplay.scss | `components/Lesson/SummaryDisplay.scss` | Styles for summary (dark mode support) |

---

## Related Files

### Frontend
- `components/create-course/QuizModals/LessonModal.tsx`
- `components/Lesson/SummaryButton.tsx`
- `components/Lesson/SummaryDisplay.tsx`
- `components/Lesson/SummaryDisplay.scss`

### Backend (Server Actions)
- `app/lib/actions/summaryActions.ts`
- `app/lib/actions/transcriptActions.ts`
- `app/lib/actions/summaryCachingActions.ts`
- `app/lib/actions/youtubeActions.ts`

### Types & Validation
- `types/summary.ts` (Zod schemas)
- `types/youtube.ts`

### Database
- `supabase/migrations/20251219_summary_usage_logs.sql`

---

## Test Data

### Sample YouTube URLs for Testing

| Type | URL | Expected |
|------|-----|----------|
| Valid (Korean) | `https://www.youtube.com/watch?v=XqZsoesa55w` | Success |
| Valid (English) | `https://www.youtube.com/watch?v=dQw4w9WgXcQ` | Success |
| No captions | `https://www.youtube.com/watch?v=...` | NO_TRANSCRIPT error |
| Private | Private video URL | Error |
| Invalid | `https://example.com` | Invalid URL |

### Sample Summary Output

```json
{
  "format": "lilys",
  "core_qa": {
    "question": "이 영상의 핵심 내용은?",
    "answer": "..."
  },
  "action_points": {
    "items": ["액션 1", "액션 2"]
  },
  "overview": "영상 개요...",
  "timeline_intro": {
    "text": "이 영상은 A, B, C를 다룹니다."
  },
  "sections": [...],
  "suggestions": ["관련 질문 1?", "관련 질문 2?"],
  "meta": {
    "model": "gpt-4o-mini",
    "input_tokens": 1500,
    "output_tokens": 800,
    "cost_usd": 0.0023
  }
}
```
