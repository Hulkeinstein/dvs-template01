-- Admin Audit Logs Table
-- 관리자의 모든 액션을 추적하기 위한 테이블

-- UUID extension 확인 (이미 있을 수 있음)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- admin_audit_logs 테이블 생성
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES "user"(id) NOT NULL,
  action VARCHAR(100) NOT NULL,
  details JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성 (검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_admin_id ON admin_audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_action ON admin_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_timestamp ON admin_audit_logs(timestamp DESC);

-- RLS (Row Level Security) 활성화
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS 정책 생성
-- Admin만 audit logs를 볼 수 있음
CREATE POLICY "Admins can view audit logs" ON admin_audit_logs
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM "user" 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Service role은 모든 작업 가능 (Server Actions용)
CREATE POLICY "Service role can manage audit logs" ON admin_audit_logs
  FOR ALL 
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- 테이블 코멘트 추가
COMMENT ON TABLE admin_audit_logs IS 'Admin dashboard access and action logs';
COMMENT ON COLUMN admin_audit_logs.admin_id IS 'ID of the admin user who performed the action';
COMMENT ON COLUMN admin_audit_logs.action IS 'Type of action performed (e.g., dashboard_view, user_edit, course_delete)';
COMMENT ON COLUMN admin_audit_logs.details IS 'Additional details about the action in JSON format';
COMMENT ON COLUMN admin_audit_logs.ip_address IS 'IP address from which the action was performed';
COMMENT ON COLUMN admin_audit_logs.user_agent IS 'Browser/client information';

-- 샘플 액션 타입 목록 (참고용 코멘트)
/*
Action types:
- dashboard_view: Admin dashboard accessed
- user_list: User list viewed
- user_edit: User information edited
- user_delete: User account deleted
- course_list: Course list viewed
- course_approve: Course approved
- course_reject: Course rejected
- course_delete: Course deleted
- settings_update: System settings updated
- backup_create: Backup created
- logs_view: System logs viewed
*/