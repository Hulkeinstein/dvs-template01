'use server';

import {
  TranscriptSegment,
  TranscriptResponse,
  LilysAIResponseSchema,
  LilysSummaryResult,
} from '@/types/summary';
import {
  validateSummaryApiKeys,
  estimateTokenCount,
} from '@/app/lib/utils/apiKeyValidator';

// ============================================
// Gemini API Types
// ============================================

type GeminiResponse = {
  candidates: {
    content: {
      parts: { text: string }[];
    };
  }[];
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
};

// ============================================
// Helper: Call Gemini API
// ============================================

async function callGemini(
  systemPrompt: string,
  userPrompt: string
): Promise<{
  content: unknown;
  usage?: { input_tokens: number; output_tokens: number };
}> {
  const { gemini } = validateSummaryApiKeys();
  if (!gemini) {
    throw new Error('Missing Gemini API Key');
  }
  const apiKey = process.env.GEMINI_API_KEY!;

  // Gemini 3 Flash Preview model
  const model = 'gemini-3-flash-preview';
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  // Gemini uses system instruction separately
  const requestBody = {
    system_instruction: {
      parts: [{ text: systemPrompt }],
    },
    contents: [
      {
        role: 'user',
        parts: [{ text: userPrompt }],
      },
    ],
    generationConfig: {
      temperature: 0.3,
      responseMimeType: 'application/json',
      // thinking_level: 'medium', // Optional: minimal, low, medium, high
    },
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Gemini API Error: ${response.status} ${JSON.stringify(errorData)}`
    );
  }

  const json: GeminiResponse = await response.json();

  // Extract text from response
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Empty response from Gemini');
  }

  // Parse JSON response
  try {
    const content = JSON.parse(text);

    // Map Gemini usage metadata to common format
    const usage = json.usageMetadata
      ? {
          input_tokens: json.usageMetadata.promptTokenCount || 0,
          output_tokens: json.usageMetadata.candidatesTokenCount || 0,
        }
      : undefined;

    return { content, usage };
  } catch {
    throw new Error('Failed to parse JSON response from Gemini');
  }
}

// ============================================
// Helper Functions (copied from summaryActions.ts)
// ============================================

function formatTimestamp(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return '0:00';
  }

  const totalSeconds = Math.floor(seconds);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

interface StructuredSegment {
  id: number;
  start: number;
  end: number;
  timestamp: string;
  text: string;
}

function buildStructuredSegments(
  content: TranscriptSegment[]
): StructuredSegment[] {
  return content.map((seg, idx) => {
    // Supadata API returns offset/duration in milliseconds, convert to seconds
    const start = Math.floor(seg.offset / 1000);
    const end = Math.floor((seg.offset + seg.duration) / 1000);
    return {
      id: idx + 1,
      start,
      end,
      timestamp: formatTimestamp(start),
      text: seg.text,
    };
  });
}

function snapToNearestSegment(
  timestamp: number,
  segments: StructuredSegment[]
): number {
  if (segments.length === 0) return timestamp;

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

    const sectionSegments = segments.filter(
      (seg) => seg.start >= sectionStart && seg.start < sectionEnd
    );

    if (sectionSegments.length === 0) continue;

    let charCount = 0;
    const sampledFromSection: StructuredSegment[] = [];

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

    for (const seg of sectionSegments) {
      if (!sampledFromSection.includes(seg)) {
        if (charCount + seg.text.length <= maxCharsPerSection) {
          sampledFromSection.push(seg);
          charCount += seg.text.length;
        }
      }
    }

    sampledFromSection.sort((a, b) => a.start - b.start);
    sampledSegments.push(...sampledFromSection);
  }

  return { sampledSegments, sectionBoundaries };
}

function normalizeAIResponse(
  response: Record<string, unknown>,
  maxDurationSeconds: number,
  sectionBoundaries: number[],
  allSegments: StructuredSegment[]
): Record<string, unknown> {
  const normalized = { ...response };

  // action_points: 배열이면 객체로 변환
  if (Array.isArray(normalized.action_points)) {
    normalized.action_points = { items: normalized.action_points };
  }

  // timeline_intro: 문자열이면 객체로 변환
  if (typeof normalized.timeline_intro === 'string') {
    normalized.timeline_intro = { text: normalized.timeline_intro };
  }

  // sections: 타임스탬프 스냅핑, 정규화 및 정렬
  if (Array.isArray(normalized.sections)) {
    let sections = normalized.sections as Record<string, unknown>[];
    const totalSections = sections.length;

    sections = sections.map((section, sectionIdx) => {
      const normalizedSection = { ...section };

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

      const safeSectionEnd = Math.min(sectionEnd, maxDurationSeconds);
      const safeSectionStart = Math.min(sectionStart, safeSectionEnd);

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

      if (!Number.isFinite(sectionTimestampSeconds)) {
        sectionTimestampSeconds = safeSectionStart;
      }

      if (
        sectionTimestampSeconds > maxDurationSeconds ||
        sectionTimestampSeconds < 0
      ) {
        sectionTimestampSeconds = safeSectionStart;
      }

      if (allSegments.length > 0) {
        sectionTimestampSeconds = snapToNearestSegment(
          sectionTimestampSeconds,
          allSegments
        );
      }

      normalizedSection.timestamp_seconds = sectionTimestampSeconds;
      normalizedSection.timestamp = formatTimestamp(sectionTimestampSeconds);

      if (Array.isArray(normalizedSection.subsections)) {
        let subsections = normalizedSection.subsections as Record<
          string,
          unknown
        >[];
        const totalSubsections = subsections.length;

        subsections = subsections.map((sub, subIdx) => {
          const normalizedSub = { ...sub };

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

          if (!Number.isFinite(subTimestampSeconds)) {
            subTimestampSeconds = subStart;
          }

          if (
            subTimestampSeconds > maxDurationSeconds ||
            subTimestampSeconds < 0
          ) {
            subTimestampSeconds = subStart;
          }

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

        subsections.sort((a, b) => {
          const aTime = (a.timestamp_seconds as number) || 0;
          const bTime = (b.timestamp_seconds as number) || 0;
          return aTime - bTime;
        });

        normalizedSection.subsections = subsections;
      }

      return normalizedSection;
    });

    sections.sort((a, b) => {
      const aTime = (a.timestamp_seconds as number) || 0;
      const bTime = (b.timestamp_seconds as number) || 0;
      return aTime - bTime;
    });

    normalized.sections = sections;
  }

  return normalized;
}

// ============================================
// Gemini Lilys Summary Generator
// ============================================

export async function generateLilysSummaryWithGemini(
  transcript: TranscriptResponse,
  description: string = '',
  videoDurationSeconds: number = 0
): Promise<LilysSummaryResult> {
  try {
    // 1. Build structured segments
    const allSegments = buildStructuredSegments(transcript.content);

    // 2. Sample segments
    const TARGET_SECTIONS = 5;
    const { sampledSegments, sectionBoundaries } = sampleSegmentsByTime(
      allSegments,
      TARGET_SECTIONS,
      18000
    );

    // 3. Calculate duration
    const segmentBasedDuration =
      allSegments.length > 0
        ? allSegments[allSegments.length - 1].end ||
          allSegments[allSegments.length - 1].start + 10
        : 0;

    const actualDuration =
      videoDurationSeconds > 0 ? videoDurationSeconds : segmentBasedDuration;

    console.log('[Gemini Summary] Video duration:', {
      videoDurationSeconds,
      segmentBasedDuration,
      actualDuration,
      segmentCount: allSegments.length,
    });

    // 4. Create JSON input
    const segmentsJson = JSON.stringify(sampledSegments, null, 2);

    // System prompt (same as OpenAI version)
    const systemPrompt = `You are an expert video analyst who extracts the CORE VALUE from educational content.

## YOUR MISSION
1. 먼저 영상 전체를 분석하여 핵심 주제와 논점을 파악하세요
2. 학습자가 실제로 활용할 수 있는 내용만 추출하세요
3. 영상의 논리적 구조를 반영한 계층 구조로 정리하세요

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

## INPUT FORMAT
JSON array of transcript segments with timestamps.

## TIMESTAMP RULES (매우 중요)
1. 반드시 segment의 "start" 값을 timestamp_seconds로 사용
2. 각 subsection.content 끝에 (MM:SS) 형태로 타임스탬프 표시
3. 타임스탬프를 추정하거나 임의로 생성하지 마세요

## FULL VIDEO COVERAGE (필수)
1. 영상 전체를 시간순으로 커버해야 합니다
2. 첫 번째 섹션은 영상 초반에서 시작
3. 마지막 섹션은 영상 후반부 내용을 포함
4. 섹션들의 timestamp_seconds가 시간순으로 증가해야 함

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
      "title": "1. 섹션 제목",
      "timestamp": "00:04",
      "timestamp_seconds": 4,
      "duration": "(1분)",
      "summary": "섹션 요약 1-2문장",
      "subsections": [
        {
          "timestamp": "00:05",
          "timestamp_seconds": 5,
          "title": "a. 서브섹션 제목",
          "content": "**핵심 키워드** 포함한 상세 설명 3-5문장. (0:05)"
        }
      ]
    }
  ],
  "suggestions": ["관련 질문 1?", "관련 질문 2?"]
}

## RULES
1. 한국어로 작성
2. format: "lilys"
3. action_points: 실행 가능한 것만 2-5개
4. subsection.content는 3-5문장으로 상세하게
5. **볼드**는 핵심 키워드에만`;

    // Token limit check
    const estimatedTokens =
      estimateTokenCount(segmentsJson) + estimateTokenCount(systemPrompt);
    if (estimatedTokens > 900000) {
      // Gemini has 1M context
      return {
        success: false,
        error: 'Video too long (exceeds token limit)',
        errorType: 'VIDEO_TOO_LONG',
        provider: 'gemini',
      };
    }

    // User prompt
    const videoDurationFormatted = formatTimestamp(actualDuration);

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

${segmentsJson}

## Video Description
${description}

## ⚠️ CRITICAL: VIDEO TIMELINE
- 전체 길이: ${videoDurationFormatted} (${Math.floor(actualDuration)}초)
- 원본 세그먼트: ${allSegments.length}개

### 필수 섹션 시간 배치
${sectionRanges}

중요: segments의 "start" 값만 timestamp_seconds로 사용하세요.`;

    // 5. Call Gemini API
    const result = await callGemini(systemPrompt, userPrompt);

    // Debug: Log raw Gemini response
    console.log(
      '[Gemini Summary] Raw response sections:',
      JSON.stringify(
        (result.content as Record<string, unknown>)?.sections,
        null,
        2
      )?.slice(0, 500)
    );

    // 6. Normalize response
    const normalizedContent = normalizeAIResponse(
      result.content as Record<string, unknown>,
      actualDuration,
      sectionBoundaries,
      allSegments
    );

    // 7. Validate
    const parsed = LilysAIResponseSchema.safeParse(normalizedContent);

    if (!parsed.success) {
      console.error('Gemini Summary Validation Error:', parsed.error.errors);
      return {
        success: false,
        error: `Invalid JSON schema: ${parsed.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')}`,
        errorType: 'GEMINI_API_ERROR',
        provider: 'gemini',
      };
    }

    // 8. Add meta
    const usage = result.usage || { input_tokens: 0, output_tokens: 0 };
    // Gemini 3 Flash pricing: $0.50/1M input, $3.00/1M output
    const cost_usd =
      (usage.input_tokens * 0.5 + usage.output_tokens * 3.0) / 1_000_000;

    const summaryData = {
      ...parsed.data,
      meta: {
        model: 'gemini-3-flash-preview',
        input_tokens: usage.input_tokens,
        output_tokens: usage.output_tokens,
        cost_usd,
        source_lang: transcript.lang,
        output_lang: 'ko',
        video_duration_seconds: videoDurationSeconds,
        processed_at: new Date().toISOString(),
      },
    };

    return {
      success: true,
      data: summaryData,
      provider: 'gemini',
    };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('[Gemini Summary Error]', errorMessage);
    return {
      success: false,
      error: errorMessage,
      errorType: 'GEMINI_API_ERROR',
      provider: 'gemini',
    };
  }
}
