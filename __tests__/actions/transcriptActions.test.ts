import { fetchTranscript } from '@/app/lib/actions/transcriptActions';
import { TranscriptResponseSchema } from '@/types/summary';

// Mock validateSummaryApiKeys to avoid environment issues in tests
jest.mock('@/app/lib/utils/apiKeyValidator', () => ({
  validateSummaryApiKeys: jest.fn(),
}));

// Mock fetch globally
global.fetch = jest.fn();

// Helper functions for testing (mirrors internal implementation)
function extractVideoId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

function validateVideoDuration(duration: number): boolean {
  return duration <= 3600; // 1 hour in seconds
}

describe('Transcript Actions', () => {
  const mockApiKey = 'mock-supadata-api-key';

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.SUPADATA_API_KEY = mockApiKey;
    (require('@/app/lib/utils/apiKeyValidator').validateSummaryApiKeys as jest.Mock).mockReturnValue({
      supadata: true,
      openai: true,
      ready: true
    });
  });

  describe('extractVideoId (helper)', () => {
    it('should extract ID from standard youtube URL', () => {
      expect(extractVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    });

    it('should extract ID from short URL', () => {
      expect(extractVideoId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    });

    it('should return null for invalid URL', () => {
      expect(extractVideoId('https://google.com')).toBeNull();
    });
  });

  describe('validateVideoDuration (helper)', () => {
    it('should return true for videos under 1 hour', () => {
      expect(validateVideoDuration(3599)).toBe(true);
    });

    it('should return false for videos over 1 hour', () => {
      expect(validateVideoDuration(3601)).toBe(false);
    });
  });

  describe('fetchTranscript', () => {
    const validUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

    it('should fail if API key is invalid', async () => {
        (require('@/app/lib/utils/apiKeyValidator').validateSummaryApiKeys as jest.Mock).mockReturnValue({
            supadata: false,
            openai: false,
            ready: false
        });

        const result = await fetchTranscript(validUrl);
        expect(result.success).toBe(false);
        expect(result.error).toContain('Missing Supadata API Key');
    });

    it('should fail if URL is invalid', async () => {
        const result = await fetchTranscript('invalid-url');
        expect(result.success).toBe(false);
        expect(result.error).toContain('Invalid YouTube URL');
    });

    it('should fail if API returns 404/429/500', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            status: 404,
            statusText: 'Not Found'
        });

        const result = await fetchTranscript(validUrl);
        expect(result.success).toBe(false);
        expect(result.errorType).toBe('NO_TRANSCRIPT');
    });

    it('should handle API rate limit (429)', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            status: 429,
            statusText: 'Too Many Requests'
        });

        const result = await fetchTranscript(validUrl);
        expect(result.success).toBe(false);
        expect(result.errorType).toBe('RATE_LIMIT');
    });

    it('should return success with valid transcript data', async () => {
        const mockResponse = {
            content: [
                { text: "Hello", offset: 0, duration: 1 },
                { text: "World", offset: 1, duration: 1 }
            ],
            lang: "en"
            // availableLangs is optional now
        };

        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse
        });

        const result = await fetchTranscript(validUrl);
        
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
        
        // Zod validation check
        const validation = TranscriptResponseSchema.safeParse(result.data);
        expect(validation.success).toBe(true);
        expect(result.data?.content).toHaveLength(2);
        expect(result.data?.content[0].text).toBe("Hello");
    });
  });
});
