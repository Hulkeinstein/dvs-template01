const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

console.log('🔑 JWT RSA 키쌍 생성 시작...\n');

// RSA 키쌍 생성 (2048 비트)
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem',
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem',
  },
});

// Base64 인코딩 (한 줄로 변환)
const publicKeyB64 = Buffer.from(publicKey)
  .toString('base64')
  .replace(/\n/g, '');
const privateKeyB64 = Buffer.from(privateKey)
  .toString('base64')
  .replace(/\n/g, '');

// PEM 파일로 저장 (선택사항 - 백업용)
const keysDir = path.join(__dirname, 'keys');
if (!fs.existsSync(keysDir)) {
  fs.mkdirSync(keysDir, { recursive: true });
}

fs.writeFileSync(path.join(keysDir, 'jwt-public.pem'), publicKey);
fs.writeFileSync(path.join(keysDir, 'jwt-private.pem'), privateKey);

// 환경변수 형식으로 출력
console.log('='.repeat(80));
console.log('📝 메인 앱 (DVS-TEMPLATE01) .env.local에 추가:');
console.log('='.repeat(80));
console.log('\n# JWT 키쌍 (SSO용) - 메인 앱에서 토큰 서명');
console.log(`JWT_PRIVATE_KEY_B64=${privateKeyB64}`);
console.log(`\nJWT_PUBLIC_KEY_B64=${publicKeyB64}`);

console.log('\n' + '='.repeat(80));
console.log('📝 Admin 앱 (dvs-admin) .env.local에 추가:');
console.log('='.repeat(80));
console.log('\n# SSO JWT 검증용 공개키 - Admin 앱에서 토큰 검증');
console.log(`ADMIN_JWT_PUBLIC_KEY_B64=${publicKeyB64}`);

console.log('\n' + '='.repeat(80));
console.log('✅ 키 생성 완료!');
console.log('='.repeat(80));
console.log('\n📁 파일 저장 위치:');
console.log(`  - 공개키: ${path.join(keysDir, 'jwt-public.pem')}`);
console.log(`  - 개인키: ${path.join(keysDir, 'jwt-private.pem')}`);

console.log('\n⚠️  보안 주의사항:');
console.log('  1. JWT_PRIVATE_KEY_B64는 메인 앱에서만 사용 (절대 공유 금지!)');
console.log('  2. ADMIN_JWT_PUBLIC_KEY_B64는 Admin 앱과 공유 가능');
console.log('  3. keys 폴더를 .gitignore에 추가하세요');

console.log('\n💡 다음 단계:');
console.log('  1. 위의 환경변수를 각 앱의 .env.local에 추가');
console.log('  2. 메인 앱: adminToken.js에서 RS256 서명 구현');
console.log('  3. Admin 앱: SSO 토큰 검증 엔드포인트 구현');
