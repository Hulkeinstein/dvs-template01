/**
 * AI 요약 기능에 필요한 API 키 검증 유틸
 */
export function validateSummaryApiKeys(): {
  supadata: boolean;
  openai: boolean;
  gemini: boolean;
  ready: boolean;
} {
  const supadata = !!process.env.SUPADATA_API_KEY;
  const openai = !!process.env.OPENAI_API_KEY;
  const gemini = !!process.env.GEMINI_API_KEY;
  // ready = supadata + (openai OR gemini)
  return { supadata, openai, gemini, ready: supadata && (openai || gemini) };
}

/**
 * A/B 테스트 가중치 가져오기 (0.0 ~ 1.0)
 * 0.0 = OpenAI only, 1.0 = Gemini only, 0.5 = 50/50
 */
export function getABTestWeight(): number {
  const weight = parseFloat(process.env.GEMINI_AB_TEST_WEIGHT || '0');
  if (isNaN(weight) || weight < 0) return 0;
  if (weight > 1) return 1;
  return weight;
}

/**
 * 토큰 수 추정 (간단한 근사치: 문자 수 / 4)
 */
export function estimateTokenCount(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}
