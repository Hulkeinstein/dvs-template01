'use server';

import { getServerClient } from '@/app/lib/supabase/server';
import { YouTubeContentData, YouTubeOEmbedResponse } from '@/types/youtube';
import {
  extractYouTubeId,
  isValidYouTubeUrl,
  getCanonicalUrl,
} from '@/app/lib/utils/youtube';
import { cache } from 'react';

// 1. oEmbed Extraction (No API Key required)
const fetchOEmbed = cache(
  async (videoId: string): Promise<YouTubeOEmbedResponse> => {
    const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const res = await fetch(url, { next: { revalidate: 3600 } }); // Cache for 1 hour

    if (res.status === 404) throw new Error('PRIVATE_OR_DELETED');
    if (res.status === 429) throw new Error('RATE_LIMIT');
    if (!res.ok) throw new Error('OEMBED_FAILED');

    return res.json();
  }
);

// 2. Data API Extraction (API Key required, Duration & Description)
const fetchDataApiDetails = cache(
  async (
    videoId: string
  ): Promise<{
    duration_seconds: number | null;
    description: string | null;
  }> => {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) return { duration_seconds: null, description: null };

    try {
      const url = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,contentDetails&key=${apiKey}`;
      const res = await fetch(url, { next: { revalidate: 86400 } }); // Cache for 24 hours

      if (!res.ok) return { duration_seconds: null, description: null };

      const data = await res.json();
      const item = data.items?.[0];
      const durationIso = item?.contentDetails?.duration;
      const rawDescription = item?.snippet?.description || null;

      // Limit description to 2000 characters ( 보완 작업 1 )
      const description = rawDescription?.substring(0, 2000) || null;

      return {
        duration_seconds: durationIso ? parseDuration(durationIso) : null,
        description: description,
      };
    } catch (err) {
      console.error('Data API Fetch Error:', err);
      return { duration_seconds: null, description: null };
    }
  }
);

function parseDuration(iso8601: string): number {
  const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
  const match = iso8601.match(regex);

  if (!match) return 0;

  const [, h, m, s] = match;
  return (
    parseInt(h || '0') * 3600 + parseInt(m || '0') * 60 + parseInt(s || '0')
  );
}

// 3. Duplicate Check
export async function checkYoutubeDuplicate(
  courseId: string,
  youtubeId: string
): Promise<boolean> {
  const supabase = getServerClient();

  // Using the unique index logic: (course_id, content_data->youtube->youtube_id)
  // We query for existing active lessons
  const { data, error } = await supabase
    .from('lessons')
    .select('id')
    .eq('course_id', courseId)
    .eq('video_source', 'youtube')
    .is('deleted_at', null)
    .ilike('content_data->youtube->>youtube_id', youtubeId) // ilike just in case, though ID case matters
    .maybeSingle();

  if (error) {
    console.error('Duplicate check error:', error);
    return false; // Fail open (allow) or handle error? Safe to return false and let constraint catch it if needed.
  }

  return !!data;
}

// Main Action
export async function fetchYouTubeMetadata(youtubeUrl: string): Promise<{
  success: boolean;
  data?: YouTubeContentData;
  error?: string;
  errorType?: 'INVALID_URL' | 'PRIVATE_OR_DELETED' | 'RATE_LIMIT' | 'UNKNOWN';
}> {
  if (!isValidYouTubeUrl(youtubeUrl)) {
    return {
      success: false,
      error: '유효하지 않은 YouTube URL입니다.',
      errorType: 'INVALID_URL',
    };
  }

  const videoId = extractYouTubeId(youtubeUrl);
  if (!videoId) {
    return {
      success: false,
      error: 'YouTube ID를 추출할 수 없습니다.',
      errorType: 'INVALID_URL',
    };
  }

  try {
    // Parallel fetch for speed
    const [oEmbedData, apiDetails] = await Promise.all([
      fetchOEmbed(videoId),
      fetchDataApiDetails(videoId),
    ]);

    const metadata: YouTubeContentData = {
      youtube_id: videoId,
      canonical_url: getCanonicalUrl(videoId),
      original_title: oEmbedData.title,
      channel_name: oEmbedData.author_name,
      channel_url: oEmbedData.author_url,
      thumbnail_url: oEmbedData.thumbnail_url, // oEmbed provides hq by default usually
      duration_seconds: apiDetails.duration_seconds,
      description: apiDetails.description || undefined,
      fetched_at: new Date().toISOString(),
    };

    return { success: true, data: metadata };
  } catch (error: any) {
    console.error('Metadata Fetch Error:', error);

    if (error.message === 'PRIVATE_OR_DELETED') {
      return {
        success: false,
        error: '비공개이거나 삭제된 영상입니다.',
        errorType: 'PRIVATE_OR_DELETED',
      };
    }
    if (error.message === 'RATE_LIMIT') {
      return {
        success: false,
        error: '요청이 너무 많습니다. 잠시 후 시도해주세요.',
        errorType: 'RATE_LIMIT',
      };
    }

    return {
      success: false,
      error: '영상 정보를 가져오는 중 오류가 발생했습니다.',
      errorType: 'UNKNOWN',
    };
  }
}
