'use server';

import {
  TranscriptSegment,
  SummaryData,
  DetailedNote,
  DetailedNoteSchema,
  SummaryErrorType,
  TranscriptResponse,
  LilysAIResponseSchema,
  LilysSummaryResult,
  SummaryProvider,
} from '@/types/summary';
import {
  validateSummaryApiKeys,
  estimateTokenCount,
  getABTestWeight,
} from '@/app/lib/utils/apiKeyValidator';
import { generateLilysSummaryWithGemini } from './geminiSummaryActions';
import { z } from 'zod';

// ============================================
// A/B Testing Helpers
// ============================================

/**
 * A/B 테스트 그룹 선택
 * @returns 'openai' | 'gemini'
 */
function selectProvider(): SummaryProvider {
  const { openai, gemini } = validateSummaryApiKeys();
  const weight = getABTestWeight();

  // Gemini 키가 없으면 OpenAI만 사용
  if (!gemini) {
    console.log('[A/B Test] Gemini key not found, using OpenAI');
    return 'openai';
  }

  // OpenAI 키가 없으면 Gemini만 사용
  if (!openai) {
    console.log('[A/B Test] OpenAI key not found, using Gemini');
    return 'gemini';
  }

  // weight 기반 랜덤 선택 (0.5 = 50:50)
  const random = Math.random();
  const provider: SummaryProvider = random < weight ? 'gemini' : 'openai';

  console.log('[A/B Test] Provider selected:', {
    weight,
    random: random.toFixed(3),
    provider,
  });

  return provider;
}

/**
 * A/B 테스트 그룹 ID 생성
 */
function generateABTestGroupId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `ab_${timestamp}_${random}`;
}

// Types for results
export type KeySummaryResult = {
  success: boolean;
  data?: string[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  error?: string;
  errorType?: SummaryErrorType;
};

export type DetailedNotesResult = {
  success: boolean;
  data?: DetailedNote[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  error?: string;
  errorType?: SummaryErrorType;
};

export type SummaryResult = {
  success: boolean;
  data?: SummaryData;
  error?: string;
  errorType?: SummaryErrorType;
};

// OpenAI Types
type OpenAIMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

type OpenAIResponseFormat = {
  type: 'text' | 'json_object';
};

// ... existing types ...

// Helper: Call OpenAI API
async function callOpenAI(
  messages: OpenAIMessage[],
  responseFormat: OpenAIResponseFormat = { type: 'json_object' }
): Promise<{ content: any; usage?: any }> {
  const { openai } = validateSummaryApiKeys();
  if (!openai) {
    throw new Error('Missing OpenAI API Key');
  }
  const apiKey = process.env.OPENAI_API_KEY!;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: messages,
      temperature: 0.3,
      response_format: responseFormat,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `OpenAI API Error: ${response.status} ${JSON.stringify(errorData)}`
    );
  }

  const json = await response.json();
  const content = json.choices[0].message.content;
  if (!content) {
    throw new Error('Empty response from OpenAI');
  }

  try {
    return {
      content: JSON.parse(content),
      usage: json.usage,
    };
  } catch {
    throw new Error('Failed to parse JSON response from OpenAI');
  }
}

// 1. Generate Key Summary
export async function generateKeySummary(
  transcript: string,
  description: string = ''
): Promise<KeySummaryResult> {
  try {
    if (!transcript) {
      return {
        success: false,
        error: 'Transcript is empty',
        errorType: 'UNKNOWN',
      };
    }

    const systemPrompt = `You are a video summarizer. Analyze the transcript and extract 3-5 key points.

IMPORTANT:
- Output MUST be in Korean regardless of input language
- Return as JSON array of strings
- Each point should be 1-2 sentences max
- Focus on actionable insights and main takeaways

Output format:
{"key_notes": ["핵심 포인트 1", "핵심 포인트 2", ...]}`;

    // Token Limit Check (128k context for GPT-4o-mini)
    const estimatedTokens =
      estimateTokenCount(transcript) + estimateTokenCount(systemPrompt);
    if (estimatedTokens > 120000) {
      // Safety margin
      return {
        success: false,
        error: 'Video too long (exceeds token limit)',
        errorType: 'VIDEO_TOO_LONG',
      };
    }

    const userPrompt = `Transcript:
${transcript.slice(0, 100000)}

Video Description (context):
${description}`;

    const result = await callOpenAI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    // Validation
    const schema = z.object({ key_notes: z.array(z.string()) });
    const parsed = schema.safeParse(result.content);

    if (!parsed.success) {
      return {
        success: false,
        error: 'Invalid JSON schema for Key Notes',
        errorType: 'API_ERROR',
      };
    }

    return { success: true, data: parsed.data.key_notes, usage: result.usage };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage.includes('Missing OpenAI API Key')) {
      return { success: false, error: errorMessage, errorType: 'API_ERROR' };
    }
    if (errorMessage.includes('OpenAI API Error')) {
      return { success: false, error: errorMessage, errorType: 'API_ERROR' };
    }
    return { success: false, error: errorMessage, errorType: 'API_ERROR' };
  }
}

// 2. Generate Detailed Notes
export async function generateDetailedNotes(
  segments: TranscriptSegment[],
  description: string = ''
): Promise<DetailedNotesResult> {
  try {
    // Convert segments to text with timestamps for context
    const transcriptWithTimestamps = segments
      .map((s) => `[${Math.floor(s.offset)}s] ${s.text}`)
      .join('\n');

    const systemPrompt = `You are a video summarizer. Create detailed notes with timestamps.

IMPORTANT:
- Output MUST be in Korean regardless of input language
- Group content into logical sections (3-7 sections)
- Include timestamp for each section start
- Each section: title (5 words max) + content (2-4 sentences)

Output format (JSON):
{"detailed_notes": [
  {"timestamp": "00:00", "timestamp_seconds": 0, "title": "섹션 제목", "content": "설명..."},
  ...
]}`;

    // Token Limit Check
    const estimatedTokens =
      estimateTokenCount(transcriptWithTimestamps) +
      estimateTokenCount(systemPrompt);
    if (estimatedTokens > 120000) {
      return {
        success: false,
        error: 'Video too long (exceeds token limit)',
        errorType: 'VIDEO_TOO_LONG',
      };
    }

    const userPrompt = `Transcript with timestamps:
${transcriptWithTimestamps.slice(0, 100000)}

Video Description (context):
${description}`;

    const result = await callOpenAI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    // Validation
    const schema = z.object({ detailed_notes: z.array(DetailedNoteSchema) });
    const parsed = schema.safeParse(result.content);

    if (!parsed.success) {
      console.error('Detailed Notes Validation Error:', parsed.error);
      return {
        success: false,
        error: 'Invalid JSON schema for Detailed Notes',
        errorType: 'API_ERROR',
      };
    }

    return {
      success: true,
      data: parsed.data.detailed_notes,
      usage: result.usage,
    };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage, errorType: 'API_ERROR' };
  }
}

// 3. Generate Full Summary
export async function generateFullSummary(
  transcript: TranscriptResponse,
  description: string = '',
  videoDurationSeconds: number = 0
): Promise<SummaryResult> {
  try {
    // 1. Prepare text
    const fullText = transcript.content.map((s) => s.text).join(' ');

    // 2. Generate Key Summary
    const keySummaryResult = await generateKeySummary(fullText, description);
    if (!keySummaryResult.success || !keySummaryResult.data) {
      return {
        success: false,
        error: keySummaryResult.error || 'Failed to generate key summary',
        errorType: keySummaryResult.errorType,
      };
    }

    // 3. Generate Detailed Notes
    const detailedNotesResult = await generateDetailedNotes(
      transcript.content,
      description
    );
    if (!detailedNotesResult.success || !detailedNotesResult.data) {
      return {
        success: false,
        error: detailedNotesResult.error || 'Failed to generate detailed notes',
        errorType: detailedNotesResult.errorType,
      };
    }

    // 4. Calculate Meta
    // Aggregating usage from both calls if available, otherwise 0
    const keyUsage = keySummaryResult.usage || {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0,
    };
    const detailUsage = detailedNotesResult.usage || {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0,
    };

    const input_tokens =
      (keyUsage.prompt_tokens || 0) + (detailUsage.prompt_tokens || 0);
    const output_tokens =
      (keyUsage.completion_tokens || 0) + (detailUsage.completion_tokens || 0);

    // Cost calculation (GPT-4o-mini)
    // Input: $0.15 / 1M, Output: $0.60 / 1M
    const cost_usd = (input_tokens * 0.15 + output_tokens * 0.6) / 1_000_000;

    const summaryData: SummaryData = {
      key_notes: keySummaryResult.data,
      detailed_notes: detailedNotesResult.data,
      meta: {
        model: 'gpt-4o-mini',
        input_tokens,
        output_tokens,
        cost_usd,
        source_lang: transcript.lang,
        output_lang: 'ko', // Always Korean as per prompt
        video_duration_seconds: videoDurationSeconds,
        processed_at: new Date().toISOString(),
      },
    };

    return { success: true, data: summaryData };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      errorType: 'UNKNOWN',
    };
  }
}

// Helper: Format seconds to M:SS, MM:SS, or H:MM:SS
function formatTimestamp(seconds: number): string {
  // 방어 로직: NaN, 음수, Infinity 처리
  if (!Number.isFinite(seconds) || seconds < 0) {
    return '0:00';
  }

  const totalSeconds = Math.floor(seconds);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  // Zod 정규식 호환: \d{1,2}:\d{2}(:\d{2})?
  // M:SS (0:00 ~ 9:59), MM:SS (10:00 ~ 59:59), H:MM:SS (1:00:00+)
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// Helper: Build structured segments from transcript
function buildStructuredSegments(content: TranscriptSegment[]): {
  id: number;
  start: number;
  end: number;
  timestamp: string;
  text: string;
}[] {
  return content.map((seg, idx) => {
    const start = Math.floor(seg.offset);
    const end = Math.floor(seg.offset + seg.duration);
    return {
      id: idx + 1,
      start,
      end,
      timestamp: formatTimestamp(start),
      text: seg.text,
    };
  });
}

// Helper: Sample segments by time to ensure full video coverage
// This solves the 100k character truncation problem by intelligently sampling
interface StructuredSegment {
  id: number;
  start: number;
  end: number;
  timestamp: string;
  text: string;
}

// Helper: Snap AI-generated timestamp to nearest actual segment start time
// Solves: AI ignores actual timestamps and generates its own
function snapToNearestSegment(
  timestamp: number,
  segments: StructuredSegment[]
): number {
  if (segments.length === 0) return timestamp;

  // Find the closest segment by comparing distances
  let closest = segments[0];
  let minDistance = Math.abs(segments[0].start - timestamp);

  for (const seg of segments) {
    const distance = Math.abs(seg.start - timestamp);
    if (distance < minDistance) {
      minDistance = distance;
      closest = seg;
    }
  }

  return closest.start;
}

function sampleSegmentsByTime(
  segments: StructuredSegment[],
  targetSections: number = 5,
  maxCharsPerSection: number = 15000
): { sampledSegments: StructuredSegment[]; sectionBoundaries: number[] } {
  if (segments.length === 0) {
    return { sampledSegments: [], sectionBoundaries: [] };
  }

  const lastSegment = segments[segments.length - 1];
  const totalDuration = lastSegment.end || lastSegment.start + 10;
  const sectionDuration = totalDuration / targetSections;

  const sampledSegments: StructuredSegment[] = [];
  const sectionBoundaries: number[] = [];

  for (let i = 0; i < targetSections; i++) {
    const sectionStart = Math.floor(i * sectionDuration);
    const sectionEnd = Math.floor((i + 1) * sectionDuration);
    sectionBoundaries.push(sectionStart);

    // 해당 구간의 세그먼트 필터링
    const sectionSegments = segments.filter(
      (seg) => seg.start >= sectionStart && seg.start < sectionEnd
    );

    if (sectionSegments.length === 0) continue;

    // 구간 내에서 균등하게 샘플링 (최대 글자수 제한)
    let charCount = 0;
    const sampledFromSection: StructuredSegment[] = [];

    // 구간 시작, 중간, 끝 부분에서 샘플링
    const indices = [
      0,
      Math.floor(sectionSegments.length * 0.25),
      Math.floor(sectionSegments.length * 0.5),
      Math.floor(sectionSegments.length * 0.75),
      sectionSegments.length - 1,
    ];

    for (const idx of [...new Set(indices)]) {
      if (idx < sectionSegments.length) {
        const seg = sectionSegments[idx];
        if (charCount + seg.text.length <= maxCharsPerSection) {
          sampledFromSection.push(seg);
          charCount += seg.text.length;
        }
      }
    }

    // 추가 세그먼트 샘플링 (글자수 허용 범위 내)
    for (const seg of sectionSegments) {
      if (!sampledFromSection.includes(seg)) {
        if (charCount + seg.text.length <= maxCharsPerSection) {
          sampledFromSection.push(seg);
          charCount += seg.text.length;
        }
      }
    }

    // 시간순 정렬 후 추가
    sampledFromSection.sort((a, b) => a.start - b.start);
    sampledSegments.push(...sampledFromSection);
  }

  return { sampledSegments, sectionBoundaries };
}

// Helper: Normalize AI response to match expected schema
// Handles: action_points array→object, missing timestamps, timestamp snapping & sorting
function normalizeAIResponse(
  response: Record<string, unknown>,
  maxDurationSeconds: number,
  sectionBoundaries: number[],
  allSegments: StructuredSegment[] // 새 파라미터: 타임스탬프 스냅핑용
): Record<string, unknown> {
  const normalized = { ...response };

  // 1. action_points: 배열이면 객체로 변환
  if (Array.isArray(normalized.action_points)) {
    normalized.action_points = { items: normalized.action_points };
  }

  // 1.5. timeline_intro: 문자열이면 객체로 변환
  if (typeof normalized.timeline_intro === 'string') {
    normalized.timeline_intro = { text: normalized.timeline_intro };
  }

  // 2. sections: 타임스탬프 스냅핑, 정규화 및 정렬
  if (Array.isArray(normalized.sections)) {
    let sections = normalized.sections as Record<string, unknown>[];
    const totalSections = sections.length;

    sections = sections.map((section, sectionIdx) => {
      const normalizedSection = { ...section };

      // 이 섹션의 시간 범위 계산 (섹션 수가 sectionBoundaries보다 많을 수 있음)
      // 안전하게 영상 길이를 기반으로 균등 분배
      const sectionStart =
        sectionIdx < sectionBoundaries.length
          ? sectionBoundaries[sectionIdx]
          : Math.floor((sectionIdx / totalSections) * maxDurationSeconds);
      const sectionEnd =
        sectionIdx + 1 < sectionBoundaries.length
          ? sectionBoundaries[sectionIdx + 1]
          : sectionIdx === totalSections - 1
            ? maxDurationSeconds
            : Math.floor(
                ((sectionIdx + 1) / totalSections) * maxDurationSeconds
              );

      // sectionEnd가 maxDurationSeconds를 초과하지 않도록 보장
      const safeSectionEnd = Math.min(sectionEnd, maxDurationSeconds);
      const safeSectionStart = Math.min(sectionStart, safeSectionEnd);

      // 섹션 타임스탬프 처리
      let sectionTimestampSeconds: number;

      if (
        typeof normalizedSection.timestamp_seconds === 'number' &&
        Number.isFinite(normalizedSection.timestamp_seconds)
      ) {
        sectionTimestampSeconds = normalizedSection.timestamp_seconds as number;
      } else if (
        normalizedSection.timestamp &&
        typeof normalizedSection.timestamp === 'string'
      ) {
        // timestamp 문자열에서 초 추출 시도
        const parts = (normalizedSection.timestamp as string)
          .split(':')
          .map(Number);
        if (parts.length === 3 && parts.every(Number.isFinite)) {
          sectionTimestampSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
        } else if (parts.length === 2 && parts.every(Number.isFinite)) {
          sectionTimestampSeconds = parts[0] * 60 + parts[1];
        } else {
          sectionTimestampSeconds = safeSectionStart;
        }
      } else {
        sectionTimestampSeconds = safeSectionStart;
      }

      // NaN 방어
      if (!Number.isFinite(sectionTimestampSeconds)) {
        sectionTimestampSeconds = safeSectionStart;
      }

      // 클램핑: 영상 길이 초과 또는 음수인 경우에만 적용
      if (
        sectionTimestampSeconds > maxDurationSeconds ||
        sectionTimestampSeconds < 0
      ) {
        sectionTimestampSeconds = safeSectionStart;
      }

      // 스냅핑: AI 타임스탬프를 가장 가까운 실제 세그먼트로 매칭
      if (allSegments.length > 0) {
        sectionTimestampSeconds = snapToNearestSegment(
          sectionTimestampSeconds,
          allSegments
        );
      }

      normalizedSection.timestamp_seconds = sectionTimestampSeconds;
      normalizedSection.timestamp = formatTimestamp(sectionTimestampSeconds);

      // 3. subsections 타임스탬프 정규화, 스냅핑 및 정렬
      if (Array.isArray(normalizedSection.subsections)) {
        let subsections = normalizedSection.subsections as Record<
          string,
          unknown
        >[];
        const totalSubsections = subsections.length;

        subsections = subsections.map((sub, subIdx) => {
          const normalizedSub = { ...sub };

          // 서브섹션 시작 시간 (섹션 내에서 균등 분배)
          const subStart =
            sectionTimestampSeconds +
            Math.floor(
              (subIdx / totalSubsections) *
                (safeSectionEnd - sectionTimestampSeconds)
            );

          let subTimestampSeconds: number;

          if (
            typeof normalizedSub.timestamp_seconds === 'number' &&
            Number.isFinite(normalizedSub.timestamp_seconds)
          ) {
            subTimestampSeconds = normalizedSub.timestamp_seconds as number;
          } else if (
            normalizedSub.timestamp &&
            typeof normalizedSub.timestamp === 'string'
          ) {
            const parts = (normalizedSub.timestamp as string)
              .split(':')
              .map(Number);
            if (parts.length === 3 && parts.every(Number.isFinite)) {
              subTimestampSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
            } else if (parts.length === 2 && parts.every(Number.isFinite)) {
              subTimestampSeconds = parts[0] * 60 + parts[1];
            } else {
              subTimestampSeconds = subStart;
            }
          } else {
            subTimestampSeconds = subStart;
          }

          // NaN 방어
          if (!Number.isFinite(subTimestampSeconds)) {
            subTimestampSeconds = subStart;
          }

          // 클램핑: 영상 길이 초과 또는 음수인 경우에만 적용
          if (
            subTimestampSeconds > maxDurationSeconds ||
            subTimestampSeconds < 0
          ) {
            subTimestampSeconds = subStart;
          }

          // 스냅핑: AI 타임스탬프를 가장 가까운 실제 세그먼트로 매칭
          if (allSegments.length > 0) {
            subTimestampSeconds = snapToNearestSegment(
              subTimestampSeconds,
              allSegments
            );
          }

          normalizedSub.timestamp_seconds = subTimestampSeconds;
          normalizedSub.timestamp = formatTimestamp(subTimestampSeconds);

          return normalizedSub;
        });

        // 서브섹션 정렬: timestamp_seconds 기준 오름차순
        subsections.sort((a, b) => {
          const aTime = (a.timestamp_seconds as number) || 0;
          const bTime = (b.timestamp_seconds as number) || 0;
          return aTime - bTime;
        });

        normalizedSection.subsections = subsections;
      }

      return normalizedSection;
    });

    // 섹션 정렬: timestamp_seconds 기준 오름차순
    sections.sort((a, b) => {
      const aTime = (a.timestamp_seconds as number) || 0;
      const bTime = (b.timestamp_seconds as number) || 0;
      return aTime - bTime;
    });

    normalized.sections = sections;
  }

  return normalized;
}

// 4. Generate Lilys Style Summary (A/B Test Router)
export async function generateLilysSummary(
  transcript: TranscriptResponse,
  description: string = '',
  videoDurationSeconds: number = 0
): Promise<LilysSummaryResult> {
  // A/B 테스트 라우팅
  const provider = selectProvider();
  const abTestGroupId = generateABTestGroupId();

  console.log('[Summary] A/B Test:', { provider, abTestGroupId });

  if (provider === 'gemini') {
    const result = await generateLilysSummaryWithGemini(
      transcript,
      description,
      videoDurationSeconds
    );
    return {
      ...result,
      provider: 'gemini',
      abTestGroupId,
    };
  }

  // OpenAI 경로
  const result = await generateLilysSummaryWithOpenAI(
    transcript,
    description,
    videoDurationSeconds
  );
  return {
    ...result,
    provider: 'openai',
    abTestGroupId,
  };
}

// 4.1 Generate Lilys Style Summary with OpenAI
async function generateLilysSummaryWithOpenAI(
  transcript: TranscriptResponse,
  description: string = '',
  videoDurationSeconds: number = 0
): Promise<LilysSummaryResult> {
  try {
    // 1. Build structured segments with explicit timestamps
    const allSegments = buildStructuredSegments(transcript.content);

    // 2. Apply time-based sampling to ensure full video coverage
    // This prevents the 100k character truncation problem
    const TARGET_SECTIONS = 5;
    const { sampledSegments, sectionBoundaries } = sampleSegmentsByTime(
      allSegments,
      TARGET_SECTIONS,
      18000 // ~18k chars per section = ~90k total, safe margin
    );

    // Calculate actual video duration
    // 우선순위: 1) 전달된 videoDurationSeconds, 2) 세그먼트 기반 계산
    const segmentBasedDuration =
      allSegments.length > 0
        ? allSegments[allSegments.length - 1].end ||
          allSegments[allSegments.length - 1].start + 10
        : 0;

    // videoDurationSeconds가 전달되면 우선 사용 (더 정확함)
    const actualDuration =
      videoDurationSeconds > 0 ? videoDurationSeconds : segmentBasedDuration;

    console.log('[Summary] Video duration:', {
      videoDurationSeconds,
      segmentBasedDuration,
      actualDuration,
      segmentCount: allSegments.length,
    });

    // 3. Create JSON input for AI (using sampled segments)
    const segmentsJson = JSON.stringify(sampledSegments, null, 2);

    const systemPrompt = `You are an expert video analyst who extracts the CORE VALUE from educational content.

## YOUR MISSION
1. 먼저 영상 전체를 분석하여 핵심 주제와 논점을 파악하세요
2. 학습자가 실제로 활용할 수 있는 내용만 추출하세요
3. 영상의 논리적 구조를 반영한 계층 구조로 정리하세요

## CONTENT ANALYSIS (먼저 수행)
영상을 분석할 때 다음을 파악하세요:
- 이 영상의 핵심 주장/결론은 무엇인가?
- 발표자가 전달하려는 핵심 방법론/단계는 무엇인가?
- 학습자가 바로 실행할 수 있는 구체적 조언은 무엇인가?

## CONTENT QUALITY RULES (매우 중요)

### 포함할 내용 (우선순위):
1. 핵심 주장/결론 - 영상의 메인 메시지
2. 구체적 방법론/단계 - "5단계 전략", "3가지 방법" 등
3. 실행 가능한 조언 - 학습자가 바로 적용할 수 있는 것
4. 중요한 예시/케이스 - 핵심을 설명하는 예시

### 제외할 내용:
- 도입부/예고: "오늘 공개합니다", "지금부터 시작합니다"
- 전환 발언: "다음으로", "자 그러면", "말씀드렸듯이"
- 반복/요약: "방금 말씀드렸듯이", "다시 정리하면"
- 모호한 중간 레벨: "단계별 과정" (하위 항목이 있다면 생략)

### 계층 구조 규칙:
- "5단계 전략"이 언급되면 → section.title: "5단계 전략"
  → subsections: a. 1단계, b. 2단계, c. 3단계...
- "단계별 과정" 같은 모호한 상위 개념은 section에 포함하지 않음
- 하위 항목이 명확하면 상위 개념을 section으로, 하위를 subsection으로

## INPUT FORMAT
JSON array of transcript segments:
[
  {"id": 1, "start": 0, "end": 15, "timestamp": "00:00", "text": "..."},
  ...
]

## TIMESTAMP RULES (매우 중요)
1. 반드시 segment의 "start" 값을 timestamp_seconds로 사용
2. 각 subsection.content 끝에 (MM:SS) 형태로 타임스탬프 표시
3. 타임스탬프를 추정하거나 임의로 생성하지 마세요

## FULL VIDEO COVERAGE (필수)
1. **영상 전체를 시간순으로 커버**해야 합니다
2. 첫 번째 섹션은 영상 초반(0:00~2:00 사이)에서 시작
3. 마지막 섹션은 영상 후반부 내용을 포함
4. 섹션들의 timestamp_seconds가 **시간순으로 증가**해야 함
5. 특정 구간(예: 12:00~15:00)에만 집중하지 말고 전체 영상을 분석

### 타임스탬프 분포 예시 (20분 영상):
- 섹션 1: 0:00~3:00 (도입 후 첫 주제)
- 섹션 2: 4:00~8:00 (두 번째 주제)
- 섹션 3: 9:00~13:00 (세 번째 주제)
- 섹션 4: 14:00~18:00 (네 번째 주제)
- 섹션 5: 18:00~20:00 (마무리/결론)

### 금지 패턴:
- 모든 섹션이 같은 시간대(예: 12:43~15:17)에 집중
- 영상 초반이나 후반이 누락
- 섹션 간 timestamp가 역순

## OUTPUT FORMAT (JSON)
{
  "format": "lilys",
  "core_qa": {
    "question": "영상 전체를 관통하는 핵심 질문",
    "answer": "핵심 답변 (2-3문장)"
  },
  "action_points": {
    "items": ["즉시 실행 가능한 액션 1", "액션 2", ...]
  },
  "overview": "영상 배경 및 전체 요약 (3-4문장)",
  "timeline_intro": {
    "text": "시간순 흐름 안내 (1-2문장)"
  },
  "sections": [
    {
      "emoji": "📚",
      "title": "1. 전통적 학습 방식의 한계와 AI-Native 학습의 등장",
      "timestamp": "00:04",
      "timestamp_seconds": 4,
      "duration": "(1분)",
      "summary": "학교 교육은 **기초(Foundation)**부터 시작해야 한다는 사고방식에 기반을 두고 있습니다.",
      "subsections": [
        {
          "timestamp": "00:05",
          "timestamp_seconds": 5,
          "title": "a. 전통적 학습 방식 (바텀업)",
          "content": "학교 교육은 **기초(Foundation)**부터 시작해야 한다는 사고방식에 기반을 두고 있습니다. 수학을 배우려면 먼저 덧셈, 뺄셈을 배우고, 그 다음 곱셈, 나눗셈을 배우는 식입니다. 이러한 **순차적 학습 방식**은 교육 시스템 전반에 깊이 뿌리내려 있으며, 대부분의 사람들이 이것이 유일한 학습 방법이라고 생각합니다. 하지만 이 방식에는 심각한 한계가 있습니다. (0:05)"
        },
        {
          "timestamp": "00:25",
          "timestamp_seconds": 25,
          "title": "b. 머신러닝 학습의 전통적 접근",
          "content": "머신러닝을 배우려면 수학, 행렬 분류, 선형 알고리즘 등 **기초 지식**을 쌓는 데 첫 4년을 할애해야 한다고 간주합니다. 대학 커리큘럼을 보면 1-2학년은 수학 기초, 3학년은 통계와 알고리즘, 4학년이 되어서야 실제 ML 모델을 다룹니다. 이런 방식으로는 **실무에서 ML을 활용**하기까지 최소 4-5년이 걸리며, 그 사이에 많은 사람들이 포기하게 됩니다. (0:25)"
        },
        {
          "timestamp": "01:10",
          "timestamp_seconds": 70,
          "title": "c. 바텀업 방식의 확장성 문제",
          "content": "**탑다운 방식**(전문가가 1:1로 가르치는 방식)이 확장하기 어려운 이유는 교사가 항상 옆에 있어야 하고, 매 순간 정확히 어떤 지식이 필요한지 알기 어렵기 때문입니다. 반면 바텀업 방식은 순서가 정해져 있어 확장이 훨씬 쉽습니다. 교재를 만들어 놓으면 수천 명이 동시에 배울 수 있죠. 하지만 이 방식은 **극도로 비효율적**입니다. 대부분의 기초 지식이 실제로 필요하지 않거나, 필요할 때 찾아보면 되는 것들이기 때문입니다. (1:10)"
        }
      ]
    }
  ],
  "suggestions": ["관련 질문 1?", "관련 질문 2?"]
}

## ROLE DISTINCTION (중복 방지)
- core_qa: 영상의 핵심 가치를 Q&A 형태로 (가장 중요한 하나의 질문/답변)
- overview: 배경 설명 + 전체 요약 (무엇을, 왜 - 3-4문장)
- timeline_intro: 시간순 흐름 안내 (어떻게 전개되는지 - 1-2문장)
- sections.summary: 섹션의 핵심 내용 요약 (1-2문장, 제목 아래 표시)

## SECTION STRUCTURE RULES
1. sections.title: 핵심 주제를 명확히 (예: "5단계 AI 코딩 전략")
2. sections.summary: 이 섹션에서 얻을 핵심 인사이트 1-2문장
3. subsections: 섹션의 핵심 내용만 포함 (도입부/전환 발언 제외)
4. subsections.title: 실질적인 내용 제목 (예: "a. 계획 수립 단계")
5. subsections.content (매우 중요 - 상세하게 작성):
   - **3-5문장**으로 상세하게 설명
   - 발표자가 말한 핵심 내용을 구체적으로 풀어서 작성
   - 예시, 비유, 구체적 수치가 있다면 포함
   - **핵심 키워드** 볼드 처리
   - 마지막에 (M:SS) 타임스탬프

## BAD vs GOOD EXAMPLES

### BAD - 너무 간략한 content:
"content": "Antigravity가 문제 해결 계획을 세웁니다. (12:43)"

### GOOD - 상세한 content (이렇게 작성):
"content": "**Antigravity**는 문제를 분석하고 해결 계획을 수립하는 AI 에이전트입니다. 먼저 사용자의 요청을 분석하여 필요한 작업 단계를 도출합니다. 예를 들어 '로그인 기능 추가'라는 요청이 들어오면, 1) 인증 라이브러리 선택, 2) 데이터베이스 스키마 설계, 3) API 엔드포인트 구현, 4) 프론트엔드 폼 작성 등의 세부 단계로 분해합니다. 이 계획은 **문서 형태**로 저장되어 다음 단계에서 검증을 받게 됩니다. (12:43)"

### BAD - 모호한 제목과 구조:
section: "전략 공개"
  - "a. 전략 공개" (X) 도입부, 핵심 아님
  - "b. 단계별 과정" (X) 모호한 중간 레벨

### GOOD - 명확한 제목과 구조:
section: "5단계 AI 코딩 전략"
  - "a. 계획 수립 (Antigravity)" - 상세한 내용 3-5문장
  - "b. 계획 검증 (Claude Code)" - 상세한 내용 3-5문장
  - "c. 코드 실행" - 상세한 내용 3-5문장

## CONTENT DEPTH
- 짧은 영상 (5분 이하): 섹션 2-3개
- 중간 영상 (5-15분): 섹션 3-5개
- 긴 영상 (15분 이상): 섹션 5-7개
- 각 섹션당 subsection은 핵심 내용 수에 따라 유동적 (2-6개)

## RULES
1. 한국어로 작성
2. format: "lilys"
3. action_points: 실행 가능한 것만 2-5개
4. 도입부/예고/전환 발언은 타임라인에서 제외
5. **볼드**는 핵심 키워드에만`;

    // Token Limit Check
    const estimatedTokens =
      estimateTokenCount(segmentsJson) + estimateTokenCount(systemPrompt);
    if (estimatedTokens > 120000) {
      return {
        success: false,
        error: 'Video too long (exceeds token limit)',
        errorType: 'VIDEO_TOO_LONG',
      };
    }

    // Use actual duration from all segments (not sampled)
    const lastSegmentStart = allSegments[allSegments.length - 1]?.start || 0;
    const videoDurationFormatted = formatTimestamp(actualDuration);

    // Calculate section time boundaries for prompt
    const sectionRanges = sectionBoundaries
      .map((start, i) => {
        const end =
          i < sectionBoundaries.length - 1
            ? sectionBoundaries[i + 1]
            : actualDuration;
        return `- 섹션 ${i + 1}: ${formatTimestamp(start)} ~ ${formatTimestamp(end)}`;
      })
      .join('\n');

    const userPrompt = `## Transcript Segments (JSON)
이 자막은 ${videoDurationFormatted} 영상에서 시간순으로 샘플링되었습니다.
각 구간의 핵심 내용을 대표합니다.

${segmentsJson}

## Video Description
${description}

## ⚠️ CRITICAL: VIDEO TIMELINE (반드시 준수)

### 영상 정보
- 전체 길이: ${videoDurationFormatted} (${Math.floor(actualDuration)}초)
- 원본 세그먼트: ${allSegments.length}개
- 샘플링된 세그먼트: ${sampledSegments.length}개

### 필수 섹션 시간 배치 (이 구간에서 시작해야 함)
${sectionRanges}

### ❌ 절대 금지
- 모든 섹션이 같은 시간대에 몰리는 것 (예: 12:00~15:00에 집중)
- 영상 앞부분(0:00~${formatTimestamp(sectionBoundaries[2] || 0)})이 완전히 누락
- 두 섹션이 같은 timestamp_seconds로 시작
- **timestamp_seconds가 ${Math.floor(actualDuration)}초를 초과** (영상 길이 초과 금지!)

### ✅ 필수 규칙
- 섹션 1은 반드시 0:00~${formatTimestamp(sectionBoundaries[1] || 60)} 사이에서 시작
- 마지막 섹션은 반드시 ${formatTimestamp(sectionBoundaries[TARGET_SECTIONS - 1] || lastSegmentStart)} 이후에서 시작
- 각 섹션의 timestamp_seconds는 위 구간 내 세그먼트의 "start" 값 사용

중요: segments의 "start" 값만 timestamp_seconds로 사용하세요. 임의의 값을 생성하지 마세요.`;

    const result = await callOpenAI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    // Normalize AI response before validation
    // Handles: action_points array→object, timestamp snapping & sorting
    const normalizedContent = normalizeAIResponse(
      result.content as Record<string, unknown>,
      actualDuration,
      sectionBoundaries,
      allSegments // 타임스탬프 스냅핑용
    );

    // Validation - AI 응답용 스키마 사용 (meta 없음, subsections 빈 배열 허용)
    const parsed = LilysAIResponseSchema.safeParse(normalizedContent);

    if (!parsed.success) {
      console.error('Lilys Summary Validation Error:');
      console.error(
        'Missing/Invalid fields:',
        parsed.error.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
          received: e.code,
        }))
      );
      return {
        success: false,
        error: `Invalid JSON schema for Lilys Summary: ${parsed.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')}`,
        errorType: 'API_ERROR',
      };
    }

    // Add Meta
    const usage = result.usage || {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0,
    };
    const cost_usd =
      (usage.prompt_tokens * 0.15 + usage.completion_tokens * 0.6) / 1_000_000;

    const summaryData = {
      ...parsed.data,
      meta: {
        model: 'gpt-4o-mini',
        input_tokens: usage.prompt_tokens,
        output_tokens: usage.completion_tokens,
        cost_usd,
        source_lang: transcript.lang,
        output_lang: 'ko',
        video_duration_seconds: videoDurationSeconds,
        processed_at: new Date().toISOString(),
      },
    };

    return { success: true, data: summaryData, provider: 'openai' };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: errorMessage,
      errorType: 'API_ERROR',
      provider: 'openai',
    };
  }
}
