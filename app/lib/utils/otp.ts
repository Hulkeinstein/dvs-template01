// OTP 관련 유틸리티 함수

/**
 * 6자리 랜덤 OTP 생성
 * @returns {string} 6자리 숫자 문자열
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * OTP 만료 시간 계산 (기본 5분)
 * @param {number} minutes - 만료까지의 분 (기본값: 5)
 * @returns {Date} 만료 시간
 */
export function getOTPExpiryTime(minutes: number = 5): Date {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + minutes);
  return expiry;
}

/**
 * 전화번호 포맷 검증 및 정규화
 * react-phone-input-2는 이미 E.164 형식(+로 시작하는 국제 형식)으로 제공하므로
 * 간단한 검증만 수행
 * @param {string} phone - 입력된 전화번호
 * @returns {string|null} 정규화된 전화번호 또는 null
 */
export function normalizePhoneNumber(phone: string): string | null {
  // 이미 + 로 시작하는 E.164 형식인지 확인
  if (phone.startsWith('+')) {
    // 숫자와 + 기호만 남기고 제거
    const cleaned = phone.replace(/[^+\d]/g, '');

    // E.164 형식 검증: +로 시작하고 10-15자리 숫자
    if (/^\+\d{10,15}$/.test(cleaned)) {
      return cleaned;
    }
  }

  // E.164 형식이 아닌 경우 숫자만 추출해서 +를 붙여서 반환
  const digits = phone.replace(/\D/g, '');
  if (digits.length >= 10 && digits.length <= 15) {
    return '+' + digits;
  }

  return null;
}

interface VerifyOTPResult {
  valid: boolean;
  error?: string;
}

/**
 * OTP 검증
 * @param {string} inputOTP - 사용자가 입력한 OTP
 * @param {string} savedOTP - 저장된 OTP
 * @param {Date | string} expiryTime - 만료 시간
 * @returns {VerifyOTPResult} 검증 결과
 */
export function verifyOTP(inputOTP: string, savedOTP: string, expiryTime: Date | string): VerifyOTPResult {
  const now = new Date();
  const expiry = typeof expiryTime === 'string' ? new Date(expiryTime) : expiryTime;

  if (now > expiry) {
    return { valid: false, error: 'OTP has expired' };
  }

  if (inputOTP !== savedOTP) {
    return { valid: false, error: 'Invalid OTP' };
  }

  return { valid: true };
}