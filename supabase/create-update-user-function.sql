-- username 업데이트를 위한 RPC 함수 생성
CREATE OR REPLACE FUNCTION update_user_username(
    user_id UUID,
    new_username VARCHAR(50)
)
RETURNS VOID AS $$
BEGIN
    UPDATE public."user"
    SET username = new_username
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- phone 업데이트를 위한 RPC 함수 생성
CREATE OR REPLACE FUNCTION update_user_phone(
    user_id UUID,
    new_phone VARCHAR(20)
)
RETURNS VOID AS $$
BEGIN
    UPDATE public."user"
    SET phone = new_phone
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 전체 프로필 업데이트를 위한 RPC 함수
CREATE OR REPLACE FUNCTION update_user_profile(
    user_id UUID,
    new_username VARCHAR(50) DEFAULT NULL,
    new_phone VARCHAR(20) DEFAULT NULL,
    new_skill_occupation VARCHAR(100) DEFAULT NULL,
    new_bio TEXT DEFAULT NULL,
    new_is_profile_complete BOOLEAN DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    UPDATE public."user"
    SET 
        username = COALESCE(new_username, username),
        phone = COALESCE(new_phone, phone),
        skill_occupation = COALESCE(new_skill_occupation, skill_occupation),
        bio = COALESCE(new_bio, bio),
        is_profile_complete = COALESCE(new_is_profile_complete, is_profile_complete)
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;