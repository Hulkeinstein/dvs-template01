'use server';

import {
  TranscriptSegment,
  SummaryData,
  DetailedNote,
  DetailedNoteSchema,
  SummaryErrorType,
  TranscriptResponse
} from '@/types/summary';
import { validateSummaryApiKeys, estimateTokenCount } from '@/app/lib/utils/apiKeyValidator';
import { z } from 'zod';

// Types for results
export type KeySummaryResult = {
  success: boolean;
  data?: string[];
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number; };
  error?: string;
  errorType?: SummaryErrorType;
};

export type DetailedNotesResult = {
  success: boolean;
  data?: DetailedNote[];
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number; };
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
  responseFormat: OpenAIResponseFormat = { type: "json_object" }
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
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: messages,
      temperature: 0.3,
      response_format: responseFormat,
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`OpenAI API Error: ${response.status} ${JSON.stringify(errorData)}`);
  }

  const json = await response.json();
  const content = json.choices[0].message.content;
  if (!content) {
    throw new Error('Empty response from OpenAI');
  }

  try {
    return {
        content: JSON.parse(content),
        usage: json.usage
    };
  } catch {
    throw new Error('Failed to parse JSON response from OpenAI');
  }
}

// 1. Generate Key Summary
export async function generateKeySummary(
  transcript: string, 
  description: string = ""
): Promise<KeySummaryResult> {
  try {
    if (!transcript) {
        return { success: false, error: 'Transcript is empty', errorType: 'UNKNOWN' };
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
    const estimatedTokens = estimateTokenCount(transcript) + estimateTokenCount(systemPrompt);
    if (estimatedTokens > 120000) { // Safety margin
        return { success: false, error: 'Video too long (exceeds token limit)', errorType: 'VIDEO_TOO_LONG' };
    }

    const userPrompt = `Transcript:
${transcript.slice(0, 100000)}

Video Description (context):
${description}`;

    const result = await callOpenAI([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ]);

    // Validation
    const schema = z.object({ key_notes: z.array(z.string()) });
    const parsed = schema.safeParse(result.content);

    if (!parsed.success) {
      return { success: false, error: 'Invalid JSON schema for Key Notes', errorType: 'API_ERROR' };
    }

    return { success: true, data: parsed.data.key_notes, usage: result.usage };

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
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
  description: string = ""
): Promise<DetailedNotesResult> {
  try {
    // Convert segments to text with timestamps for context
    const transcriptWithTimestamps = segments.map(s => 
      `[${Math.floor(s.offset)}s] ${s.text}`
    ).join('\n');

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
    const estimatedTokens = estimateTokenCount(transcriptWithTimestamps) + estimateTokenCount(systemPrompt);
    if (estimatedTokens > 120000) {
        return { success: false, error: 'Video too long (exceeds token limit)', errorType: 'VIDEO_TOO_LONG' };
    }

    const userPrompt = `Transcript with timestamps:
${transcriptWithTimestamps.slice(0, 100000)}

Video Description (context):
${description}`;

    const result = await callOpenAI([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ]);

    // Validation
    const schema = z.object({ detailed_notes: z.array(DetailedNoteSchema) });
    const parsed = schema.safeParse(result.content);

    if (!parsed.success) {
      console.error('Detailed Notes Validation Error:', parsed.error);
      return { success: false, error: 'Invalid JSON schema for Detailed Notes', errorType: 'API_ERROR' };
    }

    return { success: true, data: parsed.data.detailed_notes, usage: result.usage };

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage, errorType: 'API_ERROR' };
  }
}

// 3. Generate Full Summary
export async function generateFullSummary(
  transcript: TranscriptResponse,
  description: string = "",
  videoDurationSeconds: number = 0
): Promise<SummaryResult> {
  try {
    // 1. Prepare text
    const fullText = transcript.content.map(s => s.text).join(' ');
    
    // 2. Generate Key Summary
    const keySummaryResult = await generateKeySummary(fullText, description);
    if (!keySummaryResult.success || !keySummaryResult.data) {
      return { 
        success: false, 
        error: keySummaryResult.error || 'Failed to generate key summary', 
        errorType: keySummaryResult.errorType 
      };
    }

    // 3. Generate Detailed Notes
    const detailedNotesResult = await generateDetailedNotes(transcript.content, description);
    if (!detailedNotesResult.success || !detailedNotesResult.data) {
      return { 
        success: false, 
        error: detailedNotesResult.error || 'Failed to generate detailed notes', 
        errorType: detailedNotesResult.errorType 
      };
    }

    // 4. Calculate Meta
    // Aggregating usage from both calls if available, otherwise 0
    const keyUsage = keySummaryResult.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
    const detailUsage = detailedNotesResult.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };

    const input_tokens = (keyUsage.prompt_tokens || 0) + (detailUsage.prompt_tokens || 0);
    const output_tokens = (keyUsage.completion_tokens || 0) + (detailUsage.completion_tokens || 0);

    // Cost calculation (GPT-4o-mini)
    // Input: $0.15 / 1M, Output: $0.60 / 1M
    const cost_usd = (input_tokens * 0.15 + output_tokens * 0.60) / 1_000_000;

    const summaryData: SummaryData = {
      key_notes: keySummaryResult.data,
      detailed_notes: detailedNotesResult.data,
      meta: {
        model: "gpt-4o-mini",
        input_tokens,
        output_tokens,
        cost_usd,
        source_lang: transcript.lang,
        output_lang: "ko", // Always Korean as per prompt
        video_duration_seconds: videoDurationSeconds,
        processed_at: new Date().toISOString()
      }
    };

    return { success: true, data: summaryData };

  } catch (error: unknown) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error', 
      errorType: 'UNKNOWN' 
    };
  }
}

