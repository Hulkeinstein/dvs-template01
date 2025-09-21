-- =========================================================================
-- Reviews System Tables
-- =========================================================================

-- reviews 테이블 생성
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title VARCHAR(255),
  comment TEXT,
  is_verified_purchase BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(course_id, user_id) -- 한 사용자당 코스별 리뷰 하나만
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_reviews_course_id ON reviews(course_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

-- RLS 정책 설정
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 리뷰를 볼 수 있음
CREATE POLICY "reviews_select_all" ON reviews
  FOR SELECT USING (true);

-- 로그인한 사용자만 리뷰 작성 가능
CREATE POLICY "reviews_insert_auth" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 자신의 리뷰만 수정 가능
CREATE POLICY "reviews_update_own" ON reviews
  FOR UPDATE USING (auth.uid() = user_id);

-- 자신의 리뷰만 삭제 가능
CREATE POLICY "reviews_delete_own" ON reviews
  FOR DELETE USING (auth.uid() = user_id);

-- =========================================================================
-- Review Helpfulness Table (선택사항)
-- =========================================================================

-- 리뷰 도움됨 투표 테이블
CREATE TABLE IF NOT EXISTS public.review_helpfulness (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  is_helpful BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(review_id, user_id)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_review_helpfulness_review_id ON review_helpfulness(review_id);
CREATE INDEX IF NOT EXISTS idx_review_helpfulness_user_id ON review_helpfulness(user_id);

-- RLS 정책 설정
ALTER TABLE review_helpfulness ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 도움됨 투표 볼 수 있음
CREATE POLICY "review_helpfulness_select_all" ON review_helpfulness
  FOR SELECT USING (true);

-- 로그인한 사용자만 투표 가능
CREATE POLICY "review_helpfulness_insert_auth" ON review_helpfulness
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 자신의 투표만 수정 가능
CREATE POLICY "review_helpfulness_update_own" ON review_helpfulness
  FOR UPDATE USING (auth.uid() = user_id);

-- 자신의 투표만 삭제 가능
CREATE POLICY "review_helpfulness_delete_own" ON review_helpfulness
  FOR DELETE USING (auth.uid() = user_id);

-- =========================================================================
-- Updated At Trigger
-- =========================================================================

-- reviews 테이블의 updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION update_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_reviews_updated_at();

-- =========================================================================
-- Sample Data (개발 환경용 - 선택사항)
-- =========================================================================

-- 샘플 리뷰 추가 (필요시 주석 해제)
-- INSERT INTO reviews (course_id, user_id, rating, title, comment, is_verified_purchase)
-- VALUES
--   ('course-id-1', 'user-id-1', 5, 'Excellent course!', 'Really helped me understand the concepts.', true),
--   ('course-id-1', 'user-id-2', 4, 'Good content', 'Well structured, but could use more examples.', true),
--   ('course-id-1', 'user-id-3', 5, 'Highly recommend', 'Best course on this topic!', true);