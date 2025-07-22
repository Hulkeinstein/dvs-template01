-- 1. 먼저 현재 user 테이블의 구조 확인
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'user'
ORDER BY ordinal_position;

-- 2. username 컬럼이 없다면 추가
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user' 
        AND column_name = 'username'
    ) THEN
        ALTER TABLE public."user" 
        ADD COLUMN username VARCHAR(50) UNIQUE;
    END IF;
END $$;

-- 3. 기타 필요한 컬럼들도 추가
DO $$ 
BEGIN
    -- phone 컬럼
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'user' AND column_name = 'phone'
    ) THEN
        ALTER TABLE public."user" ADD COLUMN phone VARCHAR(20);
    END IF;
    
    -- is_phone_verified 컬럼
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'user' AND column_name = 'is_phone_verified'
    ) THEN
        ALTER TABLE public."user" ADD COLUMN is_phone_verified BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- skill_occupation 컬럼
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'user' AND column_name = 'skill_occupation'
    ) THEN
        ALTER TABLE public."user" ADD COLUMN skill_occupation VARCHAR(100);
    END IF;
    
    -- bio 컬럼
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'user' AND column_name = 'bio'
    ) THEN
        ALTER TABLE public."user" ADD COLUMN bio TEXT;
    END IF;
    
    -- is_profile_complete 컬럼
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'user' AND column_name = 'is_profile_complete'
    ) THEN
        ALTER TABLE public."user" ADD COLUMN is_profile_complete BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- onboarding_completed_at 컬럼
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'user' AND column_name = 'onboarding_completed_at'
    ) THEN
        ALTER TABLE public."user" ADD COLUMN onboarding_completed_at TIMESTAMP;
    END IF;
END $$;

-- 4. PostgREST 스키마 캐시 새로고침을 위한 함수 호출
-- (Supabase는 자동으로 처리하지만 명시적으로 실행)
NOTIFY pgrst, 'reload schema';

-- 5. 변경사항 확인
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'user'
AND column_name IN ('username', 'phone', 'is_phone_verified', 'skill_occupation', 'bio', 'is_profile_complete')
ORDER BY column_name;