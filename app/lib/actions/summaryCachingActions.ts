'use server';

import { getServerClient } from '@/app/lib/supabase/server';
import type { AnySummaryData } from '@/types/summary';

const DAILY_LIMIT = 50;

// ============================================
// Types
// ============================================

interface CacheResult {
  success: boolean;
  data: AnySummaryData | null;
  cached: boolean;
  error?: string;
}

interface LimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  error?: string;
}

interface SaveResult {
  success: boolean;
  error?: string;
}

interface CostInfo {
  userId: string;
  lessonId?: string | null;
  model: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
}

// ============================================
// Cache Functions
// ============================================

export async function getSavedSummary(lessonId: string): Promise<CacheResult> {
  if (!lessonId) {
    return {
      success: false,
      data: null,
      cached: false,
      error: 'Lesson ID is required',
    };
  }

  try {
    const supabase = getServerClient();
    const { data, error } = await supabase
      .from('lessons')
      .select('content_data')
      .eq('id', lessonId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found
        return { success: true, data: null, cached: false };
      }
      return {
        success: false,
        data: null,
        cached: false,
        error: error.message,
      };
    }

    const summary = data?.content_data?.summary || null;
    return {
      success: true,
      data: summary,
      cached: summary !== null,
    };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return { success: false, data: null, cached: false, error: errorMessage };
  }
}

export async function saveSummary(
  lessonId: string,
  summary: AnySummaryData
): Promise<SaveResult> {
  if (!lessonId) {
    return { success: false, error: 'Lesson ID is required' };
  }

  try {
    const supabase = getServerClient();

    // 기존 content_data를 가져와서 summary만 업데이트
    const { data: existing } = await supabase
      .from('lessons')
      .select('content_data')
      .eq('id', lessonId)
      .single();

    const updatedContentData = {
      ...(existing?.content_data || {}),
      summary,
    };

    const { error } = await supabase
      .from('lessons')
      .update({ content_data: updatedContentData })
      .eq('id', lessonId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
}

// ============================================
// Rate Limiting Functions
// ============================================

export async function checkDailyLimit(userId: string): Promise<LimitResult> {
  if (!userId) {
    return {
      allowed: false,
      remaining: 0,
      limit: DAILY_LIMIT,
      error: 'User ID is required',
    };
  }

  try {
    const supabase = getServerClient();

    // 오늘 사용량 조회
    const { data, error } = await supabase.rpc('get_daily_summary_count', {
      p_user_id: userId,
    });

    if (error) {
      return {
        allowed: false,
        remaining: 0,
        limit: DAILY_LIMIT,
        error: error.message,
      };
    }

    const count = data || 0;
    const remaining = Math.max(0, DAILY_LIMIT - count);

    return {
      allowed: count < DAILY_LIMIT,
      remaining,
      limit: DAILY_LIMIT,
    };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return {
      allowed: false,
      remaining: 0,
      limit: DAILY_LIMIT,
      error: errorMessage,
    };
  }
}

export async function incrementDailyUsage(
  userId: string,
  lessonId?: string | null
): Promise<SaveResult> {
  if (!userId) {
    return { success: false, error: 'User ID is required' };
  }

  try {
    const supabase = getServerClient();

    const { error } = await supabase.from('summary_usage_logs').insert({
      user_id: userId,
      lesson_id: lessonId || null,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
}

// ============================================
// Cost Logging Functions
// ============================================

export async function logSummaryCost(costInfo: CostInfo): Promise<SaveResult> {
  try {
    const supabase = getServerClient();

    const { error } = await supabase.from('summary_usage_logs').insert({
      user_id: costInfo.userId,
      lesson_id: costInfo.lessonId || null,
      model: costInfo.model,
      input_tokens: costInfo.inputTokens,
      output_tokens: costInfo.outputTokens,
      cost_usd: costInfo.costUsd,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
}

// ============================================
// Combined Flow Helper
// ============================================

export async function getOrGenerateSummary(
  lessonId: string,
  userId: string,
  generateFn: () => Promise<AnySummaryData>
): Promise<CacheResult & { limitExceeded?: boolean }> {
  // 1. 캐시 확인
  const cached = await getSavedSummary(lessonId);
  if (cached.cached && cached.data) {
    return cached;
  }

  // 2. 일일 한도 확인
  const limitCheck = await checkDailyLimit(userId);
  if (!limitCheck.allowed) {
    return {
      success: false,
      data: null,
      cached: false,
      limitExceeded: true,
      error: `일일 요약 한도(${DAILY_LIMIT}건)를 초과했습니다. 내일 다시 시도해주세요.`,
    };
  }

  // 3. 요약 생성
  try {
    const summary = await generateFn();

    // 4. 저장
    await saveSummary(lessonId, summary);

    // 5. 사용량 증가
    await incrementDailyUsage(userId, lessonId);

    // 6. 비용 로깅
    await logSummaryCost({
      userId,
      lessonId,
      model: summary.meta.model,
      inputTokens: summary.meta.input_tokens,
      outputTokens: summary.meta.output_tokens,
      costUsd: summary.meta.cost_usd,
    });

    return { success: true, data: summary, cached: false };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to generate summary';
    return { success: false, data: null, cached: false, error: errorMessage };
  }
}
