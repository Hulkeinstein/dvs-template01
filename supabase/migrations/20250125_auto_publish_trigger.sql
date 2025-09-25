-- =========================================================================
-- 자동 공개 설정 트리거
-- 목적: status가 'published'로 변경되면 자동으로 is_public=true 설정
-- =========================================================================

-- 트리거 함수 생성
CREATE OR REPLACE FUNCTION auto_set_public_on_publish()
RETURNS TRIGGER AS $$
BEGIN
  -- published 상태로 변경 시
  IF NEW.status = 'published' AND (OLD.status IS NULL OR OLD.status != 'published') THEN
    NEW.is_public := true;
    -- published_at이 비어있으면 현재 시간 설정
    IF NEW.published_at IS NULL THEN
      NEW.published_at := NOW();
    END IF;
  -- draft/archived 상태로 변경 시
  ELSIF (NEW.status = 'draft' OR NEW.status = 'archived') AND OLD.status = 'published' THEN
    NEW.is_public := false;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 기존 트리거 제거 (있을 경우)
DROP TRIGGER IF EXISTS trg_auto_publish ON courses;

-- 트리거 생성
CREATE TRIGGER trg_auto_publish
BEFORE INSERT OR UPDATE ON courses
FOR EACH ROW
EXECUTE FUNCTION auto_set_public_on_publish();

-- =========================================================================
-- 기존 데이터 수정 (이미 published인데 is_public=false인 경우)
-- =========================================================================
UPDATE courses
SET is_public = true,
    published_at = COALESCE(published_at, NOW())
WHERE status = 'published' AND is_public = false;

-- 확인 쿼리
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE 'Updated % courses to public status', updated_count;
END $$;