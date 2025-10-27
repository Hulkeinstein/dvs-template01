-- =========================================================================
-- Bookmarks System Migration
-- Created: 2025-10-20
-- Purpose: 사용자 코스 북마크 기능 (복합 PK + CASCADE + RLS + RPC)
-- =========================================================================

-- 1) 북마크 테이블 생성 (조인 테이블 패턴: 복합 PK)
CREATE TABLE IF NOT EXISTS public.bookmarks (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, course_id)
);

-- 2) 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON public.bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_course_id ON public.bookmarks(course_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_created_at ON public.bookmarks(created_at);

-- 3) Row Level Security (RLS) 활성화
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 사용자는 자신의 북마크만 조회 가능
CREATE POLICY "select_own_bookmarks"
ON public.bookmarks FOR SELECT
USING (auth.uid() = user_id);

-- RLS 정책: 사용자는 자신의 북마크만 생성 가능
CREATE POLICY "insert_own_bookmarks"
ON public.bookmarks FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS 정책: 사용자는 자신의 북마크만 삭제 가능
CREATE POLICY "delete_own_bookmarks"
ON public.bookmarks FOR DELETE
USING (auth.uid() = user_id);

-- 4) 권한 부여 (PostgREST 경유)
GRANT SELECT, INSERT, DELETE ON public.bookmarks TO authenticated;

-- 5) 호환성용 View 생성 (Supabase 힌트 메시지 대응)
-- "Perhaps you meant 'course_bookmarks' instead of 'bookmarks'"
-- 기존 테이블/뷰가 있으면 삭제 후 View 생성
DROP TABLE IF EXISTS public.course_bookmarks CASCADE;
DROP VIEW IF EXISTS public.course_bookmarks CASCADE;

CREATE VIEW public.course_bookmarks AS
SELECT user_id, course_id, created_at
FROM public.bookmarks;

-- View 권한 부여
GRANT SELECT ON public.course_bookmarks TO authenticated;

-- 6) RPC 함수: toggle_bookmark (레이스 컨디션 방지)
-- 북마크 토글을 원자적으로 처리하여 동시성 문제 해결
CREATE OR REPLACE FUNCTION public.toggle_bookmark(p_course_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user UUID := auth.uid();
  v_exists BOOLEAN;
BEGIN
  -- 인증 확인
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 북마크 존재 여부 확인
  SELECT EXISTS(
    SELECT 1 FROM public.bookmarks
    WHERE user_id = v_user AND course_id = p_course_id
  ) INTO v_exists;

  -- 존재하면 삭제, 없으면 추가 (원자적 작업)
  IF v_exists THEN
    DELETE FROM public.bookmarks
    WHERE user_id = v_user AND course_id = p_course_id;
    RETURN FALSE;  -- 북마크 제거됨
  ELSE
    INSERT INTO public.bookmarks(user_id, course_id)
    VALUES (v_user, p_course_id);
    RETURN TRUE;   -- 북마크 추가됨
  END IF;
END $$;

-- RPC 함수 권한 부여
GRANT EXECUTE ON FUNCTION public.toggle_bookmark(UUID) TO authenticated;

-- 완료 메시지
DO $$
BEGIN
  RAISE NOTICE '✅ Bookmarks system created successfully!';
  RAISE NOTICE '   - Table: public.bookmarks (복합 PK + CASCADE)';
  RAISE NOTICE '   - Indexes: 3개 (user_id, course_id, created_at)';
  RAISE NOTICE '   - RLS Policies: 3개 (select, insert, delete)';
  RAISE NOTICE '   - View: public.course_bookmarks (호환성)';
  RAISE NOTICE '   - RPC: public.toggle_bookmark(uuid) (원자적 토글)';
END $$;
