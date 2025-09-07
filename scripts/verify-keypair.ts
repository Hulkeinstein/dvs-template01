#!/usr/bin/env tsx
// 메인 앱 키 쌍 검증 스크립트
// 개인키에서 공개키를 도출하고 지문을 출력합니다.

import { createPrivateKey, createPublicKey, createHash } from 'crypto';
import * as dotenv from 'dotenv';
import * as path from 'path';

// .env.local 파일 로드
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

console.log('=== DVS-TEMPLATE01 개인키 검증 ===\n');

// 환경변수에서 개인키 가져오기
const privateKeyB64 =
  process.env.JWT_PRIVATE_KEY_B64 || process.env.MAIN_JWT_PRIVATE_KEY_B64;

if (!privateKeyB64) {
  console.error('❌ 오류: 개인키를 찾을 수 없습니다.');
  console.error(
    '   JWT_PRIVATE_KEY_B64 또는 MAIN_JWT_PRIVATE_KEY_B64 환경변수를 설정하세요.'
  );
  process.exit(1);
}

try {
  // Base64 디코딩
  const privateKeyPem = Buffer.from(privateKeyB64, 'base64').toString('utf8');

  console.log('📝 개인키 PEM 헤더 확인:');
  const pemLines = privateKeyPem.split('\n');
  console.log('   첫 줄:', pemLines[0]);
  console.log(
    '   마지막 줄:',
    pemLines[pemLines.length - 2] || pemLines[pemLines.length - 1]
  );
  console.log();

  // PEM 형식 확인
  if (
    !privateKeyPem.includes('-----BEGIN PRIVATE KEY-----') &&
    !privateKeyPem.includes('-----BEGIN RSA PRIVATE KEY-----')
  ) {
    console.error('❌ 오류: 개인키가 올바른 PEM 형식이 아닙니다.');
    console.error(
      '   PKCS#8 (BEGIN PRIVATE KEY) 또는 PKCS#1 (BEGIN RSA PRIVATE KEY) 형식이어야 합니다.'
    );
    process.exit(1);
  }

  // 개인키 객체 생성
  const privateKey = createPrivateKey(privateKeyPem);

  // 개인키에서 공개키 도출
  const publicKey = createPublicKey(privateKey);

  // DER 형식으로 내보내기
  const publicKeyDer = publicKey.export({
    type: 'spki',
    format: 'der',
  }) as Buffer;

  // SHA-256 지문 생성
  const fingerprint = createHash('sha256')
    .update(publicKeyDer)
    .digest('base64url');

  // 키 정보 출력
  const keyInfo = privateKey.asymmetricKeyDetails;

  console.log('✅ 개인키 정보:');
  console.log(`   알고리즘: ${privateKey.asymmetricKeyType?.toUpperCase()}`);
  if (keyInfo) {
    console.log(`   모듈러스 길이: ${keyInfo.modulusLength} 비트`);
  }
  console.log(
    `   환경변수: ${process.env.JWT_PRIVATE_KEY_B64 ? 'JWT_PRIVATE_KEY_B64' : 'MAIN_JWT_PRIVATE_KEY_B64'}`
  );
  console.log();

  console.log('📌 공개키 지문 (SHA-256):');
  console.log(`   ${fingerprint}`);
  console.log();

  console.log('ℹ️  Admin 앱에서 동일한 지문이 나와야 합니다.');
  console.log('   Admin 앱에서 verify-keypair.ts를 실행하세요.');
  console.log();

  // 공개키 PEM 출력 (필요시 Admin 앱에 복사)
  const publicKeyPem = publicKey.export({
    type: 'spki',
    format: 'pem',
  }) as string;
  const publicKeyB64 = Buffer.from(publicKeyPem).toString('base64');

  console.log('='.repeat(80));
  console.log('📋 아래 공개키를 Admin 앱 .env.local에 복사하세요:');
  console.log('='.repeat(80));
  console.log();
  console.log('MAIN_JWT_PUBLIC_KEY_B64=' + publicKeyB64);
  console.log();
  console.log('='.repeat(80));

  // 공개키 PEM 형식도 출력 (디버깅용)
  console.log('\n📄 공개키 PEM 형식 (참고용):');
  console.log(publicKeyPem);
} catch (error) {
  console.error('❌ 오류:', error instanceof Error ? error.message : error);
  console.error('\n상세 에러:');
  console.error(error);
  process.exit(1);
}
