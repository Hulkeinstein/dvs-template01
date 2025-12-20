-- Summary Usage Logs 테이블 (일일 사용량 추적 및 비용 모니터링)
CREATE TABLE IF NOT EXISTS summary_usage_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES "user"(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
    model VARCHAR(50) NOT NULL DEFAULT 'gpt-4o-mini',
    input_tokens INTEGER NOT NULL DEFAULT 0,
    output_tokens INTEGER NOT NULL DEFAULT 0,
    cost_usd DECIMAL(10, 6) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스: 일일 사용량 조회 최적화
CREATE INDEX IF NOT EXISTS idx_summary_usage_user_date
ON summary_usage_logs (user_id, created_at);

-- RLS 정책
ALTER TABLE summary_usage_logs ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 로그만 조회 가능
DROP POLICY IF EXISTS "Users can view own usage logs" ON summary_usage_logs;
CREATE POLICY "Users can view own usage logs"
ON summary_usage_logs FOR SELECT
USING (auth.uid()::text = user_id::text);

-- 서비스 롤만 삽입 가능 (Server Action에서)
DROP POLICY IF EXISTS "Service can insert usage logs" ON summary_usage_logs;
CREATE POLICY "Service can insert usage logs"
ON summary_usage_logs FOR INSERT
WITH CHECK (true);

-- 일일 사용량 조회 함수
CREATE OR REPLACE FUNCTION get_daily_summary_count(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COALESCE(COUNT(*), 0)::INTEGER
        FROM summary_usage_logs
        WHERE user_id = p_user_id
        AND created_at >= CURRENT_DATE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
