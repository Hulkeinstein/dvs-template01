import {
  getSavedSummary,
  saveSummary,
  checkDailyLimit,
  incrementDailyUsage,
  logSummaryCost,
} from '@/app/lib/actions/summaryCachingActions';

// Mock Supabase
jest.mock('@/app/lib/supabase/server', () => ({
  getServerClient: jest.fn(),
}));

describe('Summary Caching Actions', () => {
  const mockLessonId = 'lesson-123';
  const mockUserId = 'user-456';
  const mockSummaryData = {
    key_notes: ['핵심 1', '핵심 2'],
    detailed_notes: [
      {
        timestamp: '00:00',
        timestamp_seconds: 0,
        title: '시작',
        content: '내용',
      },
    ],
    meta: {
      model: 'gpt-4o-mini',
      input_tokens: 1000,
      output_tokens: 500,
      cost_usd: 0.001,
      source_lang: 'en',
      output_lang: 'ko',
      video_duration_seconds: 600,
      processed_at: new Date().toISOString(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSavedSummary', () => {
    it('캐시된 요약이 있으면 반환한다', async () => {
      // Given: lesson에 summary가 저장되어 있음
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { content_data: { summary: mockSummaryData } },
          error: null,
        }),
      };
      require('@/app/lib/supabase/server').getServerClient.mockReturnValue(
        mockSupabase
      );

      // When
      const result = await getSavedSummary(mockLessonId);

      // Then
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockSummaryData);
      expect(result.cached).toBe(true);
    });

    it('캐시된 요약이 없으면 null 반환', async () => {
      // Given: lesson에 summary가 없음
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { content_data: null },
          error: null,
        }),
      };
      require('@/app/lib/supabase/server').getServerClient.mockReturnValue(
        mockSupabase
      );

      // When
      const result = await getSavedSummary(mockLessonId);

      // Then
      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
      expect(result.cached).toBe(false);
    });

    it('lessonId가 없으면 에러 반환', async () => {
      // When
      const result = await getSavedSummary('');

      // Then
      expect(result.success).toBe(false);
      expect(result.error).toBe('Lesson ID is required');
    });
  });

  describe('saveSummary', () => {
    it('요약을 content_data.summary에 저장한다', async () => {
      // Given
      const mockBuilder = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest
          .fn()
          .mockResolvedValue({ data: { content_data: {} }, error: null }),
        then: (resolve: any) => resolve({ data: null, error: null }),
      };

      const mockSupabase = {
        from: jest.fn().mockReturnValue(mockBuilder),
      };
      require('@/app/lib/supabase/server').getServerClient.mockReturnValue(
        mockSupabase
      );

      // When
      const result = await saveSummary(mockLessonId, mockSummaryData);

      // Then
      expect(result.success).toBe(true);
      expect(mockSupabase.from).toHaveBeenCalledWith('lessons');
    });

    it('저장 실패 시 에러 반환', async () => {
      // Given
      const mockBuilder = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest
          .fn()
          .mockResolvedValue({ data: { content_data: {} }, error: null }),
        then: (resolve: any) =>
          resolve({
            data: null,
            error: { message: 'DB Error' },
          }),
      };

      const mockSupabase = {
        from: jest.fn().mockReturnValue(mockBuilder),
      };
      require('@/app/lib/supabase/server').getServerClient.mockReturnValue(
        mockSupabase
      );

      // When
      const result = await saveSummary(mockLessonId, mockSummaryData);

      // Then
      expect(result.success).toBe(false);
      expect(result.error).toContain('DB Error');
    });
  });

  describe('checkDailyLimit', () => {
    it('일일 한도 내이면 허용', async () => {
      // Given: 오늘 10건 사용
      const mockSupabase = {
        rpc: jest.fn().mockResolvedValue({ data: 10, error: null }),
      };
      require('@/app/lib/supabase/server').getServerClient.mockReturnValue(
        mockSupabase
      );

      // When
      const result = await checkDailyLimit(mockUserId);

      // Then
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(40); // 50 - 10
      expect(result.limit).toBe(50);
    });

    it('일일 한도 초과 시 거부', async () => {
      // Given: 오늘 50건 사용
      const mockSupabase = {
        rpc: jest.fn().mockResolvedValue({ data: 50, error: null }),
      };
      require('@/app/lib/supabase/server').getServerClient.mockReturnValue(
        mockSupabase
      );

      // When
      const result = await checkDailyLimit(mockUserId);

      // Then
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('userId가 없으면 에러', async () => {
      // When
      const result = await checkDailyLimit('');

      // Then
      expect(result.allowed).toBe(false);
      expect(result.error).toBe('User ID is required');
    });
  });

  describe('incrementDailyUsage', () => {
    it('사용량을 증가시킨다', async () => {
      // Given
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        insert: jest.fn().mockResolvedValue({ data: null, error: null }),
      };
      require('@/app/lib/supabase/server').getServerClient.mockReturnValue(
        mockSupabase
      );

      // When
      const result = await incrementDailyUsage(mockUserId, mockLessonId);

      // Then
      expect(result.success).toBe(true);
    });
  });

  describe('logSummaryCost', () => {
    it('비용 정보를 로깅한다', async () => {
      // Given
      const costInfo = {
        userId: mockUserId,
        lessonId: mockLessonId,
        model: 'gpt-4o-mini',
        inputTokens: 1000,
        outputTokens: 500,
        costUsd: 0.001,
      };
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        insert: jest.fn().mockResolvedValue({ data: null, error: null }),
      };
      require('@/app/lib/supabase/server').getServerClient.mockReturnValue(
        mockSupabase
      );

      // When
      const result = await logSummaryCost(costInfo);

      // Then
      expect(result.success).toBe(true);
      expect(mockSupabase.from).toHaveBeenCalledWith('summary_usage_logs');
    });
  });
});
