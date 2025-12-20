import type { SummaryData } from './summary';

export interface YouTubeOEmbedResponse {
  title: string;
  author_name: string;
  author_url: string;
  thumbnail_url: string;
  thumbnail_width: number;
  thumbnail_height: number;
  html: string;
  provider_name: string;
  type: string;
  version: string;
}

export interface YouTubeContentData {
  youtube_id: string;
  canonical_url: string;
  original_title: string;
  channel_name: string;
  channel_url: string;
  thumbnail_url: string;
  duration_seconds: number | null;
  description?: string;
  fetched_at: string; // ISO 8601
}

export interface YouTubeLessonInput {
  youtube_url: string;
  custom_title?: string;
  custom_description?: string;
  duration_minutes?: number; // UI input remains in minutes
}

// For lesson.content_data field
export interface LessonContentData {
  youtube?: YouTubeContentData;
  summary?: SummaryData;
  [key: string]: unknown;
}
