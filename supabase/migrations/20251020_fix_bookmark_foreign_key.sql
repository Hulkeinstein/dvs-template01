-- =========================================================================
-- Fix Bookmark Foreign Key Reference
-- Created: 2025-10-20
-- Purpose: auth.users → public.user 외래 키 참조 변경
-- Reason: 프로젝트가 NextAuth.js 사용, Supabase Auth 미사용
-- =========================================================================

-- 1) 기존 외래 키 제약 조건 확인 및 삭제
DO $$
DECLARE
  constraint_name_var TEXT;
BEGIN
  -- bookmarks.user_id의 외래 키 제약 조건 이름 찾기
  SELECT constraint_name INTO constraint_name_var
  FROM information_schema.table_constraints
  WHERE table_schema = 'public'
    AND table_name = 'bookmarks'
    AND constraint_type = 'FOREIGN KEY'
    AND constraint_name LIKE '%user_id%';

  -- 외래 키 제약 조건 삭제
  IF constraint_name_var IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.bookmarks DROP CONSTRAINT IF EXISTS ' || constraint_name_var;
    RAISE NOTICE '✓ 기존 외래 키 제약 조건 삭제: %', constraint_name_var;
  ELSE
    RAISE NOTICE 'ℹ 삭제할 외래 키 제약 조건 없음';
  END IF;
END $$;

-- 2) 새로운 외래 키 제약 조건 추가 (public.user 참조)
ALTER TABLE public.bookmarks
  ADD CONSTRAINT bookmarks_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES public.user(id)
  ON DELETE CASCADE;

-- 3) 완료 메시지
DO $$
BEGIN
  RAISE NOTICE '✅ Bookmark foreign key fixed successfully!';
  RAISE NOTICE '   - Old reference: auth.users(id)';
  RAISE NOTICE '   - New reference: public.user(id)';
  RAISE NOTICE '   - ON DELETE CASCADE: 유저 삭제 시 북마크 자동 삭제';
END $$;
