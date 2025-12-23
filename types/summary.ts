import { z } from 'zod';

// ============================================
// Zod Schemas (런타임 검증)
// ============================================

// --------------------------------------------
// Transcript Schemas (Supadata API)
// --------------------------------------------

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

// --------------------------------------------
// Legacy Summary Schemas (기존 형식)
// --------------------------------------------

/**
 * AI 요약 상세 노트 스키마 (Legacy)
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
 * AI 요약 데이터 스키마 (Legacy)
 */
export const SummaryDataSchema = z.object({
  key_notes: z
    .array(z.string().min(1))
    .min(1, '최소 1개의 핵심 노트가 필요합니다'),
  detailed_notes: z.array(DetailedNoteSchema),
  meta: SummaryMetaSchema,
});

// --------------------------------------------
// Lilys-style Summary Schemas (신규 형식)
// --------------------------------------------

/**
 * 📌 핵심 Q&A 스키마
 * 영상의 핵심 질문과 답변
 */
export const CoreQASchema = z.object({
  question: z.string().min(1, '질문은 필수입니다'),
  answer: z.string().min(1, '답변은 필수입니다'),
});

/**
 * 💡 액션 포인트 스키마
 * 바로 실천 가능한 항목들
 */
export const ActionPointsSchema = z.object({
  items: z
    .array(z.string().min(1))
    .min(1, '최소 1개의 액션 포인트가 필요합니다')
    .max(5, '최대 5개까지 가능합니다'),
});

/**
 * 타임라인 소개 스키마
 * 영상 타임라인의 전체 맥락 설명
 */
export const TimelineIntroSchema = z.object({
  text: z.string().min(1, '타임라인 소개는 필수입니다'),
});

/**
 * 서브섹션 스키마
 * 섹션 내 세부 항목 (타임스탬프 포함)
 */
export const SubsectionSchema = z.object({
  timestamp: z
    .string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/, '유효한 타임스탬프 형식이 아닙니다'),
  timestamp_seconds: z.number().nonnegative(),
  title: z.string().min(1).max(100),
  content: z.string().min(1),
});

/**
 * 섹션 스키마
 * 대분류 섹션 (이모지 + 제목 + 서브섹션들)
 */
export const SectionSchema = z.object({
  emoji: z.string().min(1).max(4),
  title: z.string().min(1).max(50),
  timestamp: z
    .string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/, '유효한 타임스탬프 형식이 아닙니다'),
  timestamp_seconds: z.number().nonnegative(),
  subsections: z.array(SubsectionSchema).min(1),
});

/**
 * 섹션 스키마 (AI 응답용 - subsections 빈 배열 허용)
 * AI가 가끔 빈 subsections를 반환할 수 있음
 */
export const SectionSchemaForAI = z.object({
  emoji: z.string().min(1).max(4),
  title: z.string().min(1).max(50),
  timestamp: z
    .string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/, '유효한 타임스탬프 형식이 아닙니다'),
  timestamp_seconds: z.number().nonnegative(),
  subsections: z.array(SubsectionSchema), // min(1) 제거 - AI가 빈 배열 반환 가능
});

/**
 * Lilys AI 응답 스키마 (meta 없음)
 * AI가 반환하는 JSON 검증용
 */
export const LilysAIResponseSchema = z.object({
  format: z.literal('lilys'),
  core_qa: CoreQASchema,
  action_points: ActionPointsSchema,
  overview: z.string().min(1, '개요는 필수입니다'),
  timeline_intro: TimelineIntroSchema,
  sections: z.array(SectionSchemaForAI).min(1, '최소 1개의 섹션이 필요합니다'),
  suggestions: z.array(z.string()).optional(),
});

/**
 * Lilys 스타일 요약 데이터 스키마 (완전한 형태 - DB 저장용)
 * UI 순서: Q&A → Action Points → TOC(자동생성) → Overview → Sections
 */
export const LilysSummaryDataSchema = z.object({
  format: z.literal('lilys'),
  core_qa: CoreQASchema,
  action_points: ActionPointsSchema,
  overview: z.string().min(1, '개요는 필수입니다'),
  timeline_intro: TimelineIntroSchema,
  sections: z.array(SectionSchema).min(1, '최소 1개의 섹션이 필요합니다'),
  suggestions: z.array(z.string()).optional(),
  meta: SummaryMetaSchema,
});

// ============================================
// TypeScript Types (Zod에서 추론)
// ============================================

// Transcript Types
export type TranscriptSegment = z.infer<typeof TranscriptSegmentSchema>;
export type TranscriptResponse = z.infer<typeof TranscriptResponseSchema>;

// Legacy Summary Types
export type DetailedNote = z.infer<typeof DetailedNoteSchema>;
export type SummaryMeta = z.infer<typeof SummaryMetaSchema>;
export type SummaryData = z.infer<typeof SummaryDataSchema>;

// Lilys-style Summary Types
export type CoreQA = z.infer<typeof CoreQASchema>;
export type ActionPoints = z.infer<typeof ActionPointsSchema>;
export type TimelineIntro = z.infer<typeof TimelineIntroSchema>;
export type Subsection = z.infer<typeof SubsectionSchema>;
export type Section = z.infer<typeof SectionSchema>;
export type LilysSummaryData = z.infer<typeof LilysSummaryDataSchema>;

// Union Type (호환성을 위해)
export type AnySummaryData = SummaryData | LilysSummaryData;

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

export interface LilysSummaryResult {
  success: boolean;
  data?: LilysSummaryData;
  error?: string;
  errorType?: SummaryErrorType;
}

// ============================================
// Type Guards (형식 판별)
// ============================================

/**
 * Lilys 스타일 요약인지 확인하는 type guard
 * 캐시된 데이터와 신규 데이터 호환성을 위해 사용
 */
export function isLilysFormat(data: AnySummaryData): data is LilysSummaryData {
  return 'format' in data && data.format === 'lilys';
}

/**
 * Legacy 형식 요약인지 확인하는 type guard
 */
export function isLegacyFormat(data: AnySummaryData): data is SummaryData {
  return 'key_notes' in data && !('format' in data);
}
