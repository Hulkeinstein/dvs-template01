// SSO Token 발급 유틸리티 (RS256 서명)
// 메인 앱에서 Admin 앱으로 안전한 SSO를 위한 JWT 생성

import { SignJWT, importPKCS8 } from 'jose';
import crypto from 'crypto';

/**
 * RS256으로 서명된 SSO 코드 생성 (Admin 앱용)
 * @param {Object} user - 사용자 정보
 * @param {string} user.id - 사용자 ID
 * @param {string} user.email - 사용자 이메일
 * @param {string} user.role - 사용자 역할
 * @returns {Promise<string>} JWT 코드
 */
export async function createAdminSSOCode(user) {
  // 권한 검증
  if (!user || !user.id || !user.email) {
    throw new Error('Invalid user data for SSO code generation');
  }

  // Admin 역할 확인 (선택사항)
  if (user.role !== 'admin') {
    throw new Error('Unauthorized: Admin role required for SSO');
  }

  // 개인키 가져오기 (Base64 디코딩)
  const privateKeyB64 = process.env.JWT_PRIVATE_KEY_B64;
  if (!privateKeyB64) {
    throw new Error('JWT_PRIVATE_KEY_B64 environment variable not set');
  }

  // Base64 → PEM 변환
  const privateKeyPem = Buffer.from(privateKeyB64, 'base64').toString('utf-8');

  // jose 라이브러리용 키 import
  const privateKey = await importPKCS8(privateKeyPem, 'RS256');

  // JWT 페이로드 구성
  const payload = {
    // 표준 클레임
    sub: user.id, // Subject (사용자 ID)
    iss: 'dvs-template01', // Issuer (메인 앱)
    aud: 'dvs-admin', // Audience (Admin 앱)
    exp: Math.floor(Date.now() / 1000) + 10 * 60, // 10분 만료
    iat: Math.floor(Date.now() / 1000), // 발급 시간
    jti: crypto.randomUUID(), // JWT ID (1회용)

    // 커스텀 클레임
    email: user.email,
    role: user.role,
    name: user.name || user.email,
  };

  // JWT 생성 및 서명
  const jwt = await new SignJWT(payload)
    .setProtectedHeader({
      alg: 'RS256', // RSA-SHA256 서명
      typ: 'JWT',
    })
    .setIssuedAt()
    .setExpirationTime('10m') // 10분 만료
    .setJti(payload.jti) // 고유 ID
    .sign(privateKey);

  return jwt;
}

/**
 * SSO 리다이렉트를 위한 URL 생성 (개발용)
 * 프로덕션에서는 POST 폼 사용 권장
 * @param {Object} user - 사용자 정보
 * @param {string} returnUrl - Admin 앱의 SSO 수신 URL
 * @param {string} to - 최종 목적지 경로
 * @returns {Promise<string>} 리다이렉트 URL
 */
export async function generateSSORedirectUrl(user, returnUrl, to) {
  const code = await createAdminSSOCode(user);

  // 개발 환경: URL 파라미터 (테스트용)
  if (process.env.NODE_ENV === 'development') {
    const params = new URLSearchParams({
      code,
      to: to || '/admin-dashboard',
    });
    return `${returnUrl}?${params.toString()}`;
  }

  // 프로덕션: POST 폼 사용 권장
  return { code, returnUrl, to };
}

/**
 * JTI (JWT ID) 저장 - 1회용 토큰 보장
 * TODO: 실제 구현 시 Redis 또는 DB 사용
 * @param {string} jti - JWT ID
 */
export async function markTokenAsUsed(jti) {
  // 개발 환경: 메모리 저장 (서버 재시작 시 초기화)
  if (!global.usedTokens) {
    global.usedTokens = new Set();
  }

  if (global.usedTokens.has(jti)) {
    throw new Error('Token already used');
  }

  global.usedTokens.add(jti);

  // 10분 후 자동 삭제 (메모리 관리)
  setTimeout(
    () => {
      global.usedTokens.delete(jti);
    },
    10 * 60 * 1000
  );
}

/**
 * JTI 중복 체크
 * @param {string} jti - JWT ID
 * @returns {boolean} 이미 사용됨 여부
 */
export function isTokenUsed(jti) {
  return global.usedTokens && global.usedTokens.has(jti);
}
