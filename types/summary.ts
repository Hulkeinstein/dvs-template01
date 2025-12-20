import { z } from 'zod';

// ============================================
// Zod Schemas (런타임 검증)
// ============================================

/**
 * Supadata API 자막 세그먼트 스키마
 * Note: lang은 세그먼트별로 없을 수 있음 (top-level lang 사용)
 */
export const TranscriptSegmentSchema = z.object({
  text: z.string(),
  offset: z.number().nonnegative('offset은 0 이상이어야 합니다'),
  duration: z.number().nonnegative('duration은 0 이상이어야 합니다'),
  lang: z.string().optional(),
});

/**
 * Supadata API 자막 응답 스키마
 * Note: availableLangs는 선택적 필드일 수 있음
 */
export const TranscriptResponseSchema = z.object({
  content: z.array(TranscriptSegmentSchema),
  lang: z.string(),
  availableLangs: z.array(z.string()).optional(),
});

/**
 * AI 요약 상세 노트 스키마
 */
export const DetailedNoteSchema = z.object({
  timestamp: z
    .string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/, '유효한 타임스탬프 형식이 아닙니다'),
  timestamp_seconds: z.number().nonnegative(),
  title: z.string().min(1).max(50),
  content: z.string().min(1),
});

/**
 * AI 요약 메타데이터 스키마
 */
export const SummaryMetaSchema = z.object({
  model: z.string(),
  input_tokens: z.number().nonnegative(),
  output_tokens: z.number().nonnegative(),
  cost_usd: z.number().nonnegative(),
  source_lang: z.string(),
  output_lang: z.string(),
  video_duration_seconds: z.number().nonnegative(),
  processed_at: z.string().datetime(),
});

/**
 * AI 요약 데이터 스키마
 */
export const SummaryDataSchema = z.object({
  key_notes: z
    .array(z.string().min(1))
    .min(1, '최소 1개의 핵심 노트가 필요합니다'),
  detailed_notes: z.array(DetailedNoteSchema),
  meta: SummaryMetaSchema,
});

// ============================================
// TypeScript Types (Zod에서 추론)
// ============================================

export type TranscriptSegment = z.infer<typeof TranscriptSegmentSchema>;
export type TranscriptResponse = z.infer<typeof TranscriptResponseSchema>;
export type DetailedNote = z.infer<typeof DetailedNoteSchema>;
export type SummaryMeta = z.infer<typeof SummaryMetaSchema>;
export type SummaryData = z.infer<typeof SummaryDataSchema>;

// ============================================
// Error Types
// ============================================

export type SummaryErrorType =
  | 'NO_TRANSCRIPT'
  | 'API_ERROR'
  | 'RATE_LIMIT'
  | 'VIDEO_TOO_LONG'
  | 'DAILY_LIMIT_EXCEEDED'
  | 'UNKNOWN';

export interface SummaryResult {
  success: boolean;
  data?: SummaryData;
  error?: string;
  errorType?: SummaryErrorType;
}
