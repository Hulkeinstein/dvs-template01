-- pgcrypto 확장 (UUID 생성에 필요)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Admin 전용 스키마
CREATE SCHEMA IF NOT EXISTS admin;

-- 감사 로그 테이블 (서비스 롤만 접근)
CREATE TABLE IF NOT EXISTS admin.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user UUID NOT NULL REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource TEXT,
  resource_id UUID,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- SSO 토큰 관리 (1회용 토큰)
CREATE TABLE IF NOT EXISTS admin.sso_tokens (
  jti UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  consumed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  ip_address INET,
  CONSTRAINT valid_expiry CHECK (expires_at > issued_at)
);

-- 인덱스 추가 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_user ON admin.audit_logs(actor_user);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON admin.audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_sso_tokens_user_id ON admin.sso_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_sso_tokens_unconsumed ON admin.sso_tokens(consumed_at) WHERE consumed_at IS NULL;

-- RLS 활성화 (클라이언트 접근 완전 차단)
ALTER TABLE admin.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin.sso_tokens ENABLE ROW LEVEL SECURITY;

-- 정책 생성하지 않음 = anon/auth 전면 거부, 서비스 롤만 접근
-- 의도적으로 정책 없음

-- 코멘트 추가 (문서화)
COMMENT ON SCHEMA admin IS 'Admin dashboard specific tables - service role access only';
COMMENT ON TABLE admin.audit_logs IS 'Audit trail for all admin actions';
COMMENT ON TABLE admin.sso_tokens IS 'One-time SSO tokens for admin dashboard access';
COMMENT ON COLUMN admin.audit_logs.actor_user IS 'User who performed the action';
COMMENT ON COLUMN admin.audit_logs.action IS 'Action performed (CREATE, UPDATE, DELETE, etc.)';
COMMENT ON COLUMN admin.audit_logs.resource IS 'Resource type (user, course, etc.)';
COMMENT ON COLUMN admin.audit_logs.resource_id IS 'ID of the affected resource';
COMMENT ON COLUMN admin.audit_logs.meta IS 'Additional metadata in JSON format';
COMMENT ON COLUMN admin.sso_tokens.jti IS 'JWT ID for one-time use verification';
COMMENT ON COLUMN admin.sso_tokens.consumed_at IS 'Timestamp when token was consumed';