-- =========================================================================
-- 비밀번호 인증 필드 추가 마이그레이션
-- 실행일: 2025-02-10
-- 
-- 목적: Google OAuth 사용자도 선택적으로 비밀번호를 설정할 수 있도록
--       하이브리드 인증 시스템 구현
-- 
-- 주의: 이 파일만 실행하면 됩니다. 
--       다른 테이블들은 이미 존재하므로 생성할 필요 없습니다.
-- =========================================================================

-- user 테이블에 비밀번호 관련 필드 추가 (TIMESTAMPTZ 사용)
ALTER TABLE "user" 
  ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255),
  ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(50) DEFAULT 'google',
  ADD COLUMN IF NOT EXISTS password_set_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS password_reset_token VARCHAR(255),
  ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMPTZ;

-- 인덱스 생성 (성능 최적화)
-- 비밀번호 재설정 토큰용 유니크 인덱스
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_password_reset_token_unique
  ON "user"(password_reset_token)
  WHERE password_reset_token IS NOT NULL;

-- 인증 제공자 필터링용 인덱스
CREATE INDEX IF NOT EXISTS idx_user_auth_provider
  ON "user"(auth_provider);

-- 토큰 만료 시간 조회 최적화 (선택사항)
CREATE INDEX IF NOT EXISTS idx_user_password_reset_expires
  ON "user"(password_reset_expires)
  WHERE password_reset_expires IS NOT NULL;

-- 기존 Google OAuth 사용자의 auth_provider를 'google'로 설정
UPDATE "user"
SET auth_provider = 'google'
WHERE auth_provider IS NULL
  AND email IS NOT NULL;

-- 컬럼 설명 추가 (문서화)
COMMENT ON COLUMN "user".password_hash IS 'Bcrypt hashed password for email/password login';
COMMENT ON COLUMN "user".auth_provider IS 'Authentication method: google, email, or both';
COMMENT ON COLUMN "user".password_set_at IS 'Timestamp when password was first set (with timezone)';
COMMENT ON COLUMN "user".password_changed_at IS 'Timestamp of last password change (with timezone)';
COMMENT ON COLUMN "user".password_reset_token IS 'Token for password reset functionality (unique)';
COMMENT ON COLUMN "user".password_reset_expires IS 'Expiration time for password reset token (with timezone)';

-- 도메인 제약 추가 (선택사항 - 입력 실수 방지)
-- DO 블록으로 재실행 안전성 보장
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_auth_provider_chk'
  ) THEN
    ALTER TABLE "user"
      ADD CONSTRAINT user_auth_provider_chk
      CHECK (auth_provider IN ('google', 'email', 'both'));
  END IF;
END $$;

-- =========================================================================
-- 자동 타임스탬프 트리거 (비밀번호 설정/변경 시 자동 기록)
-- =========================================================================

-- 트리거 함수 생성
CREATE OR REPLACE FUNCTION public.set_password_timestamps()
RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  -- 처음 비밀번호 설정 (삽입 또는 NULL에서 값으로 변경)
  IF TG_OP = 'INSERT' OR 
     (TG_OP = 'UPDATE' AND OLD.password_hash IS NULL AND NEW.password_hash IS NOT NULL) THEN
    NEW.password_set_at := COALESCE(NEW.password_set_at, NOW());
    NEW.password_changed_at := NOW();
  -- 비밀번호 변경 (기존 값에서 다른 값으로)
  ELSIF TG_OP = 'UPDATE' AND 
        OLD.password_hash IS NOT NULL AND 
        NEW.password_hash IS DISTINCT FROM OLD.password_hash THEN
    NEW.password_changed_at := NOW();
  END IF;
  RETURN NEW;
END $$;

-- 트리거 생성 (기존 트리거 삭제 후 새로 생성)
DROP TRIGGER IF EXISTS user_password_timestamps ON "user";
CREATE TRIGGER user_password_timestamps
  BEFORE INSERT OR UPDATE ON "user"
  FOR EACH ROW
  WHEN (NEW.password_hash IS NOT NULL)
  EXECUTE FUNCTION public.set_password_timestamps();

-- =========================================================================
-- 실행 후 확인 쿼리 (주석 해제하여 실행)
-- =========================================================================
-- 추가된 컬럼 확인:
-- SELECT 
--   column_name, 
--   data_type, 
--   column_default
-- FROM information_schema.columns 
-- WHERE table_name = 'user' 
--   AND column_name IN (
--     'password_hash', 
--     'auth_provider', 
--     'password_set_at',
--     'password_changed_at',
--     'password_reset_token',
--     'password_reset_expires'
--   )
-- ORDER BY ordinal_position;
--
-- 생성된 인덱스 확인:
-- SELECT indexname, indexdef
-- FROM pg_indexes
-- WHERE tablename = 'user' 
--   AND indexname LIKE '%password%';