import { validateSummaryApiKeys } from '@/app/lib/utils/apiKeyValidator';

describe('validateSummaryApiKeys', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('에러 케이스', () => {
    it('API 키가 모두 없으면 ready: false', () => {
      delete process.env.SUPADATA_API_KEY;
      delete process.env.OPENAI_API_KEY;

      const result = validateSummaryApiKeys();

      expect(result.supadata).toBe(false);
      expect(result.openai).toBe(false);
      expect(result.ready).toBe(false);
    });

    it('SUPADATA_API_KEY만 없으면 ready: false', () => {
      delete process.env.SUPADATA_API_KEY;
      process.env.OPENAI_API_KEY = 'test-key';

      const result = validateSummaryApiKeys();

      expect(result.supadata).toBe(false);
      expect(result.openai).toBe(true);
      expect(result.ready).toBe(false);
    });

    it('OPENAI_API_KEY만 없으면 ready: false', () => {
      process.env.SUPADATA_API_KEY = 'test-key';
      delete process.env.OPENAI_API_KEY;

      const result = validateSummaryApiKeys();

      expect(result.supadata).toBe(true);
      expect(result.openai).toBe(false);
      expect(result.ready).toBe(false);
    });
  });

  describe('정상 케이스', () => {
    it('모든 API 키가 있으면 ready: true', () => {
      process.env.SUPADATA_API_KEY = 'supadata-key';
      process.env.OPENAI_API_KEY = 'openai-key';

      const result = validateSummaryApiKeys();

      expect(result.supadata).toBe(true);
      expect(result.openai).toBe(true);
      expect(result.ready).toBe(true);
    });
  });
});
