/**
 * AI 요약 기능에 필요한 API 키 검증 유틸
 */
export function validateSummaryApiKeys(): {
  supadata: boolean;
  openai: boolean;
  ready: boolean;
} {
  const supadata = !!process.env.SUPADATA_API_KEY;
  const openai = !!process.env.OPENAI_API_KEY;
  return { supadata, openai, ready: supadata && openai };
}

/**
 * 토큰 수 추정 (간단한 근사치: 문자 수 / 4)
 */
export function estimateTokenCount(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}
