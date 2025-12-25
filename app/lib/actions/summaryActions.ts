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
} from '@/types/summary';
import {
  validateSummaryApiKeys,
  estimateTokenCount,
} from '@/app/lib/utils/apiKeyValidator';
import { z } from 'zod';

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

// Helper: Format seconds to MM:SS or HH:MM:SS
function formatTimestamp(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// Helper: Build structured segments from transcript
function buildStructuredSegments(
  content: TranscriptSegment[]
): {
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

// 4. Generate Lilys Style Summary
export async function generateLilysSummary(
  transcript: TranscriptResponse,
  description: string = '',
  videoDurationSeconds: number = 0
): Promise<LilysSummaryResult> {
  try {
    // 1. Build structured segments with explicit timestamps
    const structuredSegments = buildStructuredSegments(transcript.content);

    // 2. Create JSON input for AI
    const segmentsJson = JSON.stringify(structuredSegments, null, 2);

    const systemPrompt = `You are a professional video note-taker creating highly detailed Lilys.ai style summaries.

## INPUT FORMAT
You will receive a JSON array of transcript segments:
[
  {"id": 1, "start": 0, "end": 15, "timestamp": "00:00", "text": "..."},
  {"id": 2, "start": 15, "end": 30, "timestamp": "00:15", "text": "..."},
  ...
]

## TIMESTAMP RULES (매우 중요)
1. 반드시 입력된 segment의 "start" 값을 timestamp_seconds로 사용
2. timestamp는 해당 segment의 "timestamp" 값을 그대로 사용
3. 각 subsection.content 끝에 해당 내용의 시작 타임스탬프를 (MM:SS) 형태로 표시
4. 절대로 타임스탬프를 추정하거나 임의로 생성하지 마세요

예시: segment id=5의 start=62이면 → timestamp_seconds: 62, timestamp: "01:02"
예시: 내용 참조 → "**기초 지식**을 먼저 쌓아야 합니다. (1:02)"

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
          "content": "학교 교육은 **기초(Foundation)**부터 시작해야 한다는 사고방식에 기반을 두고 있습니다. (0:05)"
        },
        {
          "timestamp": "00:25",
          "timestamp_seconds": 25,
          "title": "b. 머신러닝 학습의 첫 4년",
          "content": "머신러닝을 배우려면 수학, 행렬 분류, 선형 알고리즘 등 **기초 지식**을 쌓는 데 첫 4년을 할애해야 한다고 간주합니다. (0:25)"
        },
        {
          "timestamp": "00:48",
          "timestamp_seconds": 48,
          "title": "c. 선형 회귀의 한계",
          "content": "이 방식은 선형 회귀와 같이 현재도 일부 사용되지만, **실제 생산 수준(production-grade)**의 ML에 도달하기까지 매우 오랜 시간이 소요됩니다. (0:48)"
        },
        {
          "timestamp": "01:10",
          "timestamp_seconds": 70,
          "title": "d. 확장성 문제",
          "content": "이 방식이 확장(scale)하기 어려운 이유는 교사가 항상 옆에 있어야 하고, 매 순간 정확히 어떤 지식이 필요한지 알기 어렵기 때문입니다. (1:10)"
        },
        {
          "timestamp": "01:35",
          "timestamp_seconds": 95,
          "title": "e. 바텀업 방식의 비효율",
          "content": "반면, 바텀업 방식은 순서가 정해져 있어 확장이 훨씬 쉽지만, **극도로 비효율적**입니다. (1:35)"
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

## DETAILED TIMELINE RULES (매우 중요)
1. sections.title: "N. 긴 제목" 형태로 번호 포함 (제목은 구체적으로)
2. sections.summary: 섹션 시작 부분의 핵심 내용을 1-2문장으로 요약
3. sections.duration: "(N분)" 또는 "(N초)" 형태
4. subsections: 각 섹션당 **4-8개** (a, b, c, d, e, f, g, h 형태)
5. subsections.title: "a. 구체적인 소제목" 형태
6. subsections.content:
   - 1-2문장으로 핵심 내용 설명
   - **핵심 키워드** 볼드 처리 필수
   - 마지막에 (M:SS) 형태로 해당 내용의 타임스탬프 추가
7. 원본 영상 내용의 **90% 이상** 커버

## CONTENT DEPTH REQUIREMENTS
- 짧은 영상 (5분 이하): 섹션 3-4개, 섹션당 subsection 4-6개
- 중간 영상 (5-15분): 섹션 4-6개, 섹션당 subsection 5-8개
- 긴 영상 (15분 이상): 섹션 6-8개, 섹션당 subsection 6-10개

## RULES
1. 모든 텍스트는 한국어로 작성
2. format: 반드시 "lilys" 문자열
3. action_points.items: 2-5개
4. sections: 영상 길이에 따라 3-8개
5. suggestions: 관련 질문 2-3개
6. **볼드** 처리는 각 subsection에 최소 1개 이상`;

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

    const userPrompt = `## Transcript Segments (JSON)
${segmentsJson.slice(0, 100000)}

## Video Description
${description}

## Available Timestamps
First segment: id=1, start=${structuredSegments[0]?.start || 0}s
Last segment: id=${structuredSegments.length}, start=${structuredSegments[structuredSegments.length - 1]?.start || 0}s
Total segments: ${structuredSegments.length}

중요: 위 segments의 "start" 값만 timestamp_seconds로 사용하세요. 임의의 값을 생성하지 마세요.`;

    const result = await callOpenAI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    // Validation - AI 응답용 스키마 사용 (meta 없음, subsections 빈 배열 허용)
    const parsed = LilysAIResponseSchema.safeParse(result.content);

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

    return { success: true, data: summaryData };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage, errorType: 'API_ERROR' };
  }
}
