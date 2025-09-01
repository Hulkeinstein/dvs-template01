// SSO Token Utilities for Admin Dashboard
// 개발용 간단한 버전 - 프로덕션에서는 jose 라이브러리 사용 필수

import crypto from 'crypto';

/**
 * Generate a short-lived SSO token for admin users
 * @param {Object} session - NextAuth session object
 * @returns {string} Base64 encoded token (dev) or JWT (prod)
 */
export async function generateAdminSSOToken(session) {
  // 권한 검증
  if (!session?.user || session.user.role !== 'admin') {
    throw new Error('Unauthorized: Admin role required');
  }
  
  // 토큰 페이로드 생성
  const token = {
    jti: crypto.randomUUID(), // 1회용 ID
    sub: session.user.id,
    email: session.user.email,
    role: 'admin',
    iss: 'main-app',
    aud: 'admin-app',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (5 * 60) // 5분 만료
  };
  
  // 개발용 Base64 인코딩 (프로덕션에서는 절대 사용 금지!)
  if (process.env.NODE_ENV === 'development') {
    return Buffer.from(JSON.stringify(token)).toString('base64');
  }
  
  // TODO: 프로덕션에서는 jose 라이브러리 사용
  // npm install jose
  // 
  // import { SignJWT } from 'jose';
  // const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  // 
  // const jwt = await new SignJWT(token)
  //   .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
  //   .setExpirationTime('5m')
  //   .setIssuedAt()
  //   .sign(secret);
  // 
  // return jwt;
  
  throw new Error('Production JWT signing not implemented - install jose package');
}

/**
 * Validate an admin SSO token
 * @param {string} encoded - Base64 encoded token (dev) or JWT (prod)
 * @returns {Object} Decoded token payload
 */
export function validateAdminSSOToken(encoded) {
  try {
    // 개발용 Base64 디코딩
    if (process.env.NODE_ENV === 'development') {
      const decoded = JSON.parse(Buffer.from(encoded, 'base64').toString());
      
      // 만료 확인
      if (decoded.exp < Math.floor(Date.now() / 1000)) {
        throw new Error('Token expired');
      }
      
      // 발급자/대상 확인
      if (decoded.iss !== 'main-app' || decoded.aud !== 'admin-app') {
        throw new Error('Invalid token issuer or audience');
      }
      
      // TODO: DB에서 jti 중복 확인
      // const isConsumed = await checkTokenConsumed(decoded.jti);
      // if (isConsumed) throw new Error('Token already consumed');
      
      return decoded;
    }
    
    // TODO: 프로덕션에서는 jose 라이브러리 사용
    // import { jwtVerify } from 'jose';
    // const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    // 
    // const { payload } = await jwtVerify(encoded, secret, {
    //   issuer: 'main-app',
    //   audience: 'admin-app'
    // });
    // 
    // return payload;
    
    throw new Error('Production JWT verification not implemented');
  } catch (error) {
    throw new Error(`Invalid token: ${error.message}`);
  }
}

/**
 * Generate admin dashboard URL with SSO token
 * NOTE: In production, use POST body instead of query string
 * @param {Object} session - NextAuth session
 * @returns {string} Admin dashboard URL
 */
export async function generateAdminRedirectUrl(session) {
  const token = await generateAdminSSOToken(session);
  const adminUrl = process.env.ADMIN_URL || process.env.NEXT_PUBLIC_ADMIN_URL;
  
  // 개발 환경: 쿼리 파라미터 사용 (편의상)
  if (process.env.NODE_ENV === 'development') {
    return `${adminUrl}/auth/sso?token=${encodeURIComponent(token)}`;
  }
  
  // 프로덕션: POST 요청으로 전송해야 함 (보안)
  // Admin 앱에서 POST /api/auth/sso 엔드포인트 구현 필요
  return adminUrl;
}

// 프로덕션용 jose 기반 구현 (별도 파일로 분리 권장)
// app/lib/auth/adminTokenProd.js 참조