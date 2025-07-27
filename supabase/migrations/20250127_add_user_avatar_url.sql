-- user 테이블에 avatar_url 컬럼 추가
ALTER TABLE "user" 
ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500);

-- 기본 아바타 URL 설정 (선택사항)
UPDATE "user" 
SET avatar_url = '/images/client/avatar-02.png'
WHERE avatar_url IS NULL;

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_user_avatar_url ON "user"(avatar_url);