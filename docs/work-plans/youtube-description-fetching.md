# Work Plan: YouTube Description Fetching

## Goal
Enable automatic fetching of YouTube video descriptions when an API key is available, fulfilling the "Hybrid API" promise. This enhances the `Lesson Summary` auto-fill feature.

## Prerequisite
- valid `YOUTUBE_API_KEY` in `.env.local`

## Implementation Steps

### 1. Type Definitions
- **File**: `types/youtube.ts`
- **Action**: Add `description?: string` to `YouTubeContentData` interface.

### 2. Backend Action (Hybrid API)
- **File**: `app/lib/actions/youtubeActions.ts`
- **Function**: `fetchDuration` (to be renamed or extended)
- **Changes**:
  - Request `part=snippet,contentDetails` from YouTube Data API v3.
  - Extract `snippet.description`.
  - Return `{ duration: number | null, description: string | null }`.
  - Merge this description into the final `data` object in `fetchYouTubeMetadata`.

### 3. Frontend Integration
- **File**: `components/create-course/QuizModals/LessonModal.tsx`
- **Function**: `handleYoutubeUrlChange`
- **Changes**:
  - Check if `result.data.description` exists.
  - If `lessonData.description` is empty, auto-fill it with the fetched description.

## Verification
1. Prepare a YouTube URL with a known description.
2. Ensure `YOUTUBE_API_KEY` is active.
3. Enter URL in Lesson Modal.
4. Verify `Lesson Summary` field is automatically populated.
