-- 전화번호 인증을 위한 테이블 생성

-- 기존 테이블이 있다면 삭제
DROP TABLE IF EXISTS phone_verifications;

-- phone_verifications 테이블 생성
CREATE TABLE phone_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES "user"(id) ON DELETE CASCADE,
  phone VARCHAR(20) NOT NULL,
  otp VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 인덱스 생성 (성능 향상)
CREATE INDEX idx_phone_verifications_phone ON phone_verifications(phone);
CREATE INDEX idx_phone_verifications_expires_at ON phone_verifications(expires_at);
CREATE INDEX idx_phone_verifications_user_id ON phone_verifications(user_id);

-- 만료된 OTP 자동 삭제를 위한 정책 (선택사항)
-- Row Level Security 활성화
ALTER TABLE phone_verifications ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 인증 정보만 볼 수 있음
CREATE POLICY "Users can view own verifications" ON phone_verifications
  FOR SELECT USING (auth.uid() = user_id);

-- 시스템은 모든 인증 정보를 생성/수정 가능 (service role 사용)
CREATE POLICY "Service role can manage all verifications" ON phone_verifications
  FOR ALL USING (true);