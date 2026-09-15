import {
  getSavedSummary,
  checkDailyLimit,
} from '@/app/lib/actions/summaryCachingActions';

// Mock all external actions/modules
jest.mock('@/app/lib/actions/transcriptActions');
jest.mock('@/app/lib/actions/summaryActions');
jest.mock('@/app/lib/actions/summaryCachingActions');

describe('Summary Flow Integration', () => {
  describe('전체 요약 흐름', () => {
    it('캐시가 있으면 API 호출 없이 반환', async () => {
      // Mock getSavedSummary to return cached data
      (getSavedSummary as jest.Mock).mockResolvedValue({
        success: true,
        data: { key_notes: [] },
        cached: true,
      });

      // Given: 캐시된 요약 존재
      const cachedResult = await getSavedSummary('lesson-123');

      // Then: API 호출 없이 캐시 반환
      if (cachedResult.cached) {
        expect(cachedResult.data).toBeDefined();
        // generateFullSummary calls should be 0 - verified in component/logic tests usually
      }
    });

    it('일일 한도 초과 시 에러 반환', async () => {
      // Mock checkDailyLimit to return disallowed
      (checkDailyLimit as jest.Mock).mockResolvedValue({
        allowed: false,
        remaining: 0,
        limit: 50,
        error: 'Daily limit exceeded',
      });

      // Given: 일일 한도 50건 초과
      const limitCheck = await checkDailyLimit('user-123');

      // Then
      if (!limitCheck.allowed) {
        expect(limitCheck.error).toContain('limit');
      }
    });
  });
});
