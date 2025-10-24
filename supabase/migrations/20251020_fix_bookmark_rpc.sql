-- =========================================================================
-- Fix Bookmark RPC Authentication Issue
-- Created: 2025-10-20
-- Purpose: SERVICE_ROLE_KEY 환경에서 auth.uid() 대신 userId 파라미터 사용
-- =========================================================================

-- 1) 기존 RPC 함수 삭제 (auth.uid() 사용하는 버전)
DROP FUNCTION IF EXISTS public.toggle_bookmark(UUID);

-- 2) 새 RPC 함수 생성 (userId 파라미터 받는 버전)
CREATE OR REPLACE FUNCTION public.toggle_bookmark(
  p_user_id UUID,
  p_course_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  -- 파라미터 검증
  IF p_user_id IS NULL OR p_course_id IS NULL THEN
    RAISE EXCEPTION 'User ID and Course ID are required';
  END IF;

  -- 북마크 존재 여부 확인 (원자적 작업)
  SELECT EXISTS(
    SELECT 1 FROM public.bookmarks
    WHERE user_id = p_user_id AND course_id = p_course_id
  ) INTO v_exists;

  -- 토글 로직: 존재하면 삭제, 없으면 추가
  IF v_exists THEN
    -- 북마크 제거
    DELETE FROM public.bookmarks
    WHERE user_id = p_user_id AND course_id = p_course_id;
    RETURN FALSE;  -- 북마크 제거됨
  ELSE
    -- 북마크 추가
    INSERT INTO public.bookmarks(user_id, course_id)
    VALUES (p_user_id, p_course_id);
    RETURN TRUE;   -- 북마크 추가됨
  END IF;
END $$;

-- 3) RPC 함수 권한 부여
GRANT EXECUTE ON FUNCTION public.toggle_bookmark(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.toggle_bookmark(UUID, UUID) TO anon;

-- 완료 메시지
DO $$
BEGIN
  RAISE NOTICE '✅ Bookmark RPC fixed successfully!';
  RAISE NOTICE '   - Old RPC (auth.uid() version) removed';
  RAISE NOTICE '   - New RPC (p_user_id parameter) created';
  RAISE NOTICE '   - Compatible with SERVICE_ROLE_KEY environment';
END $$;
