'use server';

import {
  TranscriptResponse,
  SummaryErrorType,
  TranscriptResponseSchema,
} from '@/types/summary';
import { validateSummaryApiKeys } from '@/app/lib/utils/apiKeyValidator';

export type TranscriptResult = {
  success: boolean;
  data?: TranscriptResponse;
  error?: string;
  errorType?: SummaryErrorType;
};

function extractVideoId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

// Reserved for future use
// function validateVideoDuration(duration: number): boolean {
//   return duration <= 3600; // 1 hour in seconds
// }

export async function fetchTranscript(
  youtubeUrl: string
): Promise<TranscriptResult> {
  try {
    // 1. Validate API Key
    const { supadata } = validateSummaryApiKeys();
    if (!supadata) {
      return {
        success: false,
        error: 'Missing Supadata API Key',
        errorType: 'API_ERROR',
      };
    }
    const supadataApiKey = process.env.SUPADATA_API_KEY!;

    // 2. Extract Video ID
    const videoId = extractVideoId(youtubeUrl);
    if (!videoId) {
      return {
        success: false,
        error: 'Invalid YouTube URL',
        errorType: 'UNKNOWN',
      };
    }

    // 3. Call Supadata API
    const response = await fetch(
      `https://api.supadata.ai/v1/youtube/transcript?url=${encodeURIComponent(youtubeUrl)}&text=false`,
      {
        method: 'GET',
        headers: {
          'x-api-key': supadataApiKey,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return {
          success: false,
          error: 'Rate limit exceeded',
          errorType: 'RATE_LIMIT',
        };
      }
      if (response.status === 404 || response.status === 500) {
        // Supadata returns 500 often for "no transcript found" or really private videos
        // 404 is more explicit
        return {
          success: false,
          error: 'No transcript found or API error',
          errorType: 'NO_TRANSCRIPT',
        };
      }
      return {
        success: false,
        error: `API Error: ${response.status} ${response.statusText}`,
        errorType: 'API_ERROR',
      };
    }

    const json = await response.json();

    // 4. API 에러 응답 확인 (Supadata는 200 OK와 함께 에러 객체를 반환할 수 있음)
    if (json?.error) {
      console.error(
        'Supadata API Error Response:',
        JSON.stringify(json, null, 2)
      );

      // 에러 메시지에 따른 분류
      const errorMessage = json.message || json.error || 'Unknown API error';

      if (
        errorMessage.toLowerCase().includes('transcript') ||
        errorMessage.toLowerCase().includes('subtitle') ||
        errorMessage.toLowerCase().includes('caption')
      ) {
        return {
          success: false,
          error: '이 영상에는 자막이 없습니다.',
          errorType: 'NO_TRANSCRIPT',
        };
      }

      if (
        errorMessage.toLowerCase().includes('rate') ||
        errorMessage.toLowerCase().includes('limit')
      ) {
        return {
          success: false,
          error: 'API 요청 한도 초과',
          errorType: 'RATE_LIMIT',
        };
      }

      return { success: false, error: errorMessage, errorType: 'API_ERROR' };
    }

    // 5. Validate Schema
    const parseResult = TranscriptResponseSchema.safeParse(json);
    if (!parseResult.success) {
      console.error('Transcript Schema Validation Failed:');
      console.error('Response keys:', Object.keys(json || {}));
      console.error(
        'Errors:',
        JSON.stringify(parseResult.error.errors, null, 2)
      );

      return {
        success: false,
        error: 'Invalid API response format',
        errorType: 'API_ERROR',
      };
    }

    return { success: true, data: parseResult.data };
  } catch (error: unknown) {
    console.error('fetchTranscript Error:', error);

    // Type guard for error object with message
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    if (errorMessage.includes('API Key') || errorMessage.includes('Missing')) {
      return { success: false, error: errorMessage, errorType: 'API_ERROR' };
    }

    return { success: false, error: errorMessage, errorType: 'UNKNOWN' };
  }
}

// TODO: VIDEO_TOO_LONG check requires video metadata (duration).
// This will be implemented in P2 when we integrate YouTube Data API or metadata fetching.
// Currently validateVideoDuration is implemented but waiting for data source.
