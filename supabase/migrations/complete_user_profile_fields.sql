-- 모든 필요한 user 테이블 필드를 추가하는 완전한 마이그레이션

-- 1. 기본 프로필 필드 추가
ALTER TABLE "user" 
ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE,
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS skill_occupation VARCHAR(100),
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS is_profile_complete BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP;

-- 2. 이름 필드 추가 (First/Last name 분리)
ALTER TABLE "user" 
ADD COLUMN IF NOT EXISTS first_name VARCHAR(50),
ADD COLUMN IF NOT EXISTS last_name VARCHAR(50);

-- 3. 소셜 미디어 링크 필드 추가
ALTER TABLE "user" 
ADD COLUMN IF NOT EXISTS facebook_url VARCHAR(255),
ADD COLUMN IF NOT EXISTS twitter_url VARCHAR(255),
ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(255),
ADD COLUMN IF NOT EXISTS website_url VARCHAR(255),
ADD COLUMN IF NOT EXISTS github_url VARCHAR(255);

-- 4. 인덱스 생성 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_user_username ON "user"(username);
CREATE INDEX IF NOT EXISTS idx_user_profile_complete ON "user"(is_profile_complete);

-- 5. 기존 사용자의 name을 first_name과 last_name으로 분리
UPDATE "user" 
SET 
  first_name = COALESCE(first_name, SPLIT_PART(name, ' ', 1)),
  last_name = COALESCE(last_name, 
    CASE 
      WHEN ARRAY_LENGTH(STRING_TO_ARRAY(name, ' '), 1) > 1 
      THEN SUBSTR(name, LENGTH(SPLIT_PART(name, ' ', 1)) + 2)
      ELSE ''
    END
  )
WHERE first_name IS NULL OR last_name IS NULL;

-- 6. 프로필 완성 상태 업데이트
UPDATE "user" 
SET is_profile_complete = FALSE 
WHERE username IS NULL OR phone IS NULL;