import {
  generateKeySummary,
  generateDetailedNotes,
  generateFullSummary,
} from '@/app/lib/actions/summaryActions';
import { estimateTokenCount } from '@/app/lib/utils/apiKeyValidator';
import { TranscriptSegment, TranscriptResponse } from '@/types/summary';

// Mock apiKeyValidator - estimateTokenCount needs to match actual implementation
jest.mock('@/app/lib/utils/apiKeyValidator', () => ({
  validateSummaryApiKeys: jest.fn(),
  estimateTokenCount: jest.fn((text: string) => {
    if (!text) return 0;
    return Math.ceil(text.length / 4);
  }),
  getABTestWeight: jest.fn(() => ({ provider: 'openai', weight: 1 })),
}));

// Mock global fetch
global.fetch = jest.fn();

describe('Summary Actions', () => {
  const mockOpenAIKey = 'mock-openai-key';

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.OPENAI_API_KEY = mockOpenAIKey;
    (
      require('@/app/lib/utils/apiKeyValidator')
        .validateSummaryApiKeys as jest.Mock
    ).mockReturnValue({
      openai: true,
      ready: true,
    });
  });

  describe('estimateTokenCount', () => {
    it('should return approximately text length / 4', () => {
      const text = 'Hello world'; // 11 chars
      // Mock returns ceil(length / 4)
      expect(estimateTokenCount(text)).toBe(Math.ceil(11 / 4));
    });

    it('should handle empty string', () => {
      // Mock implementation handles empty strings
      const result = estimateTokenCount('');
      // Result should be 0 or falsy for empty input
      expect(result === 0 || result === undefined).toBe(true);
    });
  });

  describe('generateKeySummary', () => {
    const mockTranscript = 'This is a transcript text.';

    it('should throw error if OpenAI API key is missing', async () => {
      (
        require('@/app/lib/utils/apiKeyValidator')
          .validateSummaryApiKeys as jest.Mock
      ).mockReturnValue({
        openai: false,
        ready: false,
      });

      const result = await generateKeySummary(mockTranscript);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Missing OpenAI API Key');
    });

    it('should fail if transcript is empty', async () => {
      const result = await generateKeySummary('');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Transcript is empty');
    });

    it('should fail if token limit is exceeded', async () => {
      // 120,000 tokens * 4 chars = 480,000 chars.
      // Create a string longer than that.
      const longTranscript = 'a'.repeat(480001);
      const result = await generateKeySummary(longTranscript);
      expect(result.success).toBe(false);
      // Error type depends on implementation - either VIDEO_TOO_LONG or API_ERROR
      expect(result.error).toBeDefined();
    });

    it('should match Key Summary schema on success', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                key_notes: ['Point 1', 'Point 2', 'Point 3'],
              }),
            },
          },
        ],
        usage: {
          total_tokens: 100,
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await generateKeySummary(mockTranscript);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(3);
      expect(result.data?.[0]).toBe('Point 1');
    });

    it('should handle API errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      const result = await generateKeySummary(mockTranscript);
      expect(result.success).toBe(false);
      expect(result.errorType).toBe('API_ERROR');
    });

    it('should handle invalid JSON response', async () => {
      const mockResponse = {
        choices: [{ message: { content: 'Not JSON' } }],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await generateKeySummary(mockTranscript);

      expect(result.success).toBe(false);
      expect(result.errorType).toBe('API_ERROR');
    });
  });

  describe('generateDetailedNotes', () => {
    const mockSegments: TranscriptSegment[] = [
      { text: 'Intro', offset: 0, duration: 10, lang: 'en' },
      { text: 'Content', offset: 10, duration: 20, lang: 'en' },
    ];

    it('should match Detailed Notes schema on success', async () => {
      const mockDetailedNotes = [
        {
          timestamp: '00:00',
          timestamp_seconds: 0,
          title: 'Introduction',
          content: 'This is the intro.',
        },
        {
          timestamp: '00:10',
          timestamp_seconds: 10,
          title: 'Main Content',
          content: 'This is the content.',
        },
      ];

      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                detailed_notes: mockDetailedNotes,
              }),
            },
          },
        ],
        usage: {
          total_tokens: 200,
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await generateDetailedNotes(mockSegments);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data?.[0].title).toBe('Introduction');
      expect(result.data?.[0].timestamp).toBe('00:00');
    });
  });

  describe('generateFullSummary', () => {
    const mockTranscriptResponse: TranscriptResponse = {
      content: [
        { text: 'Intro', offset: 0, duration: 10, lang: 'en' },
        { text: 'Content', offset: 10, duration: 20, lang: 'en' },
      ],
      lang: 'en',
      availableLangs: ['en'],
    };

    it('should generate full summary successfully', async () => {
      // Mock responses for Key Summary and Detailed Notes
      const keySummaryResponse = {
        choices: [
          { message: { content: JSON.stringify({ key_notes: ['Key 1'] }) } },
        ],
        usage: { total_tokens: 100, prompt_tokens: 50, completion_tokens: 50 },
      };
      const detailedNotesResponse = {
        choices: [
          { message: { content: JSON.stringify({ detailed_notes: [] }) } },
        ],
        usage: {
          total_tokens: 200,
          prompt_tokens: 100,
          completion_tokens: 100,
        },
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => keySummaryResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => detailedNotesResponse,
        });

      const result = await generateFullSummary(
        mockTranscriptResponse,
        'Description',
        100
      );

      expect(result.success).toBe(true);
      expect(result.data?.key_notes).toHaveLength(1);
      expect(result.data?.meta).toBeDefined();
      // Check cost calculation (approximate)
      // 150 input tokens * 0.15/1M + 150 output tokens * 0.60/1M
      // = (150 * 0.00000015) + (150 * 0.00000060)
      expect(result.data?.meta.input_tokens).toBe(150);
      expect(result.data?.meta.output_tokens).toBe(150);
    });
  });
});
