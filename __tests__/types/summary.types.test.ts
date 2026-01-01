import {
  TranscriptSegmentSchema,
  DetailedNoteSchema,
  SummaryDataSchema,
} from '@/types/summary';

describe('Summary Types - Zod Schema Validation', () => {
  describe('TranscriptSegmentSchema', () => {
    it('유효한 세그먼트 통과', () => {
      const valid = {
        text: 'Hello world',
        offset: 1000,
        duration: 5000,
        lang: 'en',
      };
      expect(() => TranscriptSegmentSchema.parse(valid)).not.toThrow();
    });

    it('offset이 음수면 실패', () => {
      const invalid = {
        text: 'Hello',
        offset: -100,
        duration: 5000,
        lang: 'en',
      };
      expect(() => TranscriptSegmentSchema.parse(invalid)).toThrow();
    });

    it('text가 빈 문자열이어도 통과 (Supadata API 호환)', () => {
      // Note: Supadata API에서 빈 세그먼트가 올 수 있음
      const valid = {
        text: '',
        offset: 0,
        duration: 5000,
        lang: 'en',
      };
      expect(() => TranscriptSegmentSchema.parse(valid)).not.toThrow();
    });

    it('duration이 음수면 실패', () => {
      const invalid = {
        text: 'Hello',
        offset: 0,
        duration: -100,
        lang: 'en',
      };
      expect(() => TranscriptSegmentSchema.parse(invalid)).toThrow();
    });
  });

  describe('DetailedNoteSchema', () => {
    it('유효한 노트 통과 (MM:SS 형식)', () => {
      const valid = {
        timestamp: '00:30',
        timestamp_seconds: 30,
        title: '인트로',
        content: '영상의 주제를 소개합니다.',
      };
      expect(() => DetailedNoteSchema.parse(valid)).not.toThrow();
    });

    it('유효한 노트 통과 (HH:MM:SS 형식)', () => {
      const valid = {
        timestamp: '01:30:45',
        timestamp_seconds: 5445,
        title: '핵심 내용',
        content: '주요 개념을 설명합니다.',
      };
      expect(() => DetailedNoteSchema.parse(valid)).not.toThrow();
    });

    it('timestamp_seconds가 음수면 실패', () => {
      const invalid = {
        timestamp: '00:00',
        timestamp_seconds: -1,
        title: '제목',
        content: '내용',
      };
      expect(() => DetailedNoteSchema.parse(invalid)).toThrow();
    });

    it('title이 50자 초과면 실패', () => {
      const invalid = {
        timestamp: '00:00',
        timestamp_seconds: 0,
        title: 'a'.repeat(51),
        content: '내용',
      };
      expect(() => DetailedNoteSchema.parse(invalid)).toThrow();
    });

    it('content가 빈 문자열이면 실패', () => {
      const invalid = {
        timestamp: '00:00',
        timestamp_seconds: 0,
        title: '제목',
        content: '',
      };
      expect(() => DetailedNoteSchema.parse(invalid)).toThrow();
    });
  });

  describe('SummaryDataSchema', () => {
    const validMeta = {
      model: 'gpt-4o-mini',
      input_tokens: 1000,
      output_tokens: 500,
      cost_usd: 0.001,
      source_lang: 'en',
      output_lang: 'ko',
      video_duration_seconds: 600,
      processed_at: '2025-12-19T10:00:00Z',
    };

    it('유효한 요약 데이터 통과', () => {
      const valid = {
        key_notes: ['핵심 1', '핵심 2'],
        detailed_notes: [
          {
            timestamp: '00:00',
            timestamp_seconds: 0,
            title: '시작',
            content: '내용',
          },
        ],
        meta: validMeta,
      };
      expect(() => SummaryDataSchema.parse(valid)).not.toThrow();
    });

    it('key_notes가 빈 배열이면 실패', () => {
      const invalid = {
        key_notes: [],
        detailed_notes: [],
        meta: validMeta,
      };
      expect(() => SummaryDataSchema.parse(invalid)).toThrow();
    });

    it('key_notes에 빈 문자열이 있으면 실패', () => {
      const invalid = {
        key_notes: ['핵심 1', ''],
        detailed_notes: [],
        meta: validMeta,
      };
      expect(() => SummaryDataSchema.parse(invalid)).toThrow();
    });

    it('cost_usd가 음수면 실패', () => {
      const invalid = {
        key_notes: ['핵심 1'],
        detailed_notes: [],
        meta: {
          ...validMeta,
          cost_usd: -0.001,
        },
      };
      expect(() => SummaryDataSchema.parse(invalid)).toThrow();
    });

    it('processed_at이 유효한 ISO datetime이 아니면 실패', () => {
      const invalid = {
        key_notes: ['핵심 1'],
        detailed_notes: [],
        meta: {
          ...validMeta,
          processed_at: '2025-12-19',
        },
      };
      expect(() => SummaryDataSchema.parse(invalid)).toThrow();
    });
  });
});
