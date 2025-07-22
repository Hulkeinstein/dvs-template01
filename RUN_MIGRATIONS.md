# 데이터베이스 마이그레이션 실행 가이드

## 문제 상황
현재 코드에서 사용하는 다음 컬럼들이 실제 데이터베이스에 존재하지 않습니다:
- `username`
- `phone`
- `is_phone_verified`
- `skill_occupation`
- `bio`
- 기타 프로필 관련 필드들

### 전화번호 인증 오류 (Error saving OTP: {})
`phone_verifications` 테이블이 존재하지 않아서 OTP 저장 시 오류가 발생합니다.

## 해결 방법

### 1. Supabase Dashboard를 통한 실행 (권장)

1. [Supabase Dashboard](https://app.supabase.com)에 로그인
2. 해당 프로젝트 선택
3. 왼쪽 메뉴에서 "SQL Editor" 클릭
4. 다음 SQL 파일들의 내용을 순서대로 복사하여 실행:
   - `/supabase/migrations/add_user_profile_fields.sql`
   - `/supabase/migrations/complete_user_profile_fields.sql` (있는 경우)
   - `/supabase/migrations/add_phone_verification_status.sql`
   - `/supabase/migrations/20241222_add_missing_user_columns.sql`
   - `/supabase/migrations/add_missing_social_and_name_columns.sql` (최신 - 누락된 컬럼만 추가)
   - `/supabase/migrations/create_phone_verifications_table.sql` (전화번호 인증 테이블)

### 빠른 해결 - 전화번호 인증 오류
전화번호 인증 오류만 해결하려면 `/supabase/migrations/run_all_phone_migrations.sql` 파일의 내용을 실행하세요.

### 2. Supabase CLI를 통한 실행

```bash
# Supabase CLI 설치 (이미 설치되어 있다면 건너뛰기)
npm install -g supabase

# 프로젝트 디렉토리로 이동
cd D:\kamwoo\6.programing\DEV\Cursor\project\dvs-template01\DVS-TEMPLATE01

# Supabase 로그인
supabase login

# 마이그레이션 실행
supabase db push
```

### 3. 직접 SQL 실행

가장 간단한 방법은 Supabase Dashboard의 SQL Editor에서 다음 쿼리를 실행하는 것입니다:

```sql
-- Add missing columns to user table
ALTER TABLE "user" 
ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE,
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS is_phone_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS skill_occupation VARCHAR(100),
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS facebook_url VARCHAR(255),
ADD COLUMN IF NOT EXISTS twitter_url VARCHAR(255),
ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(255),
ADD COLUMN IF NOT EXISTS website_url VARCHAR(255),
ADD COLUMN IF NOT EXISTS github_url VARCHAR(255),
ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS last_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS is_profile_complete BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_user_username ON "user"(username);
CREATE INDEX IF NOT EXISTS idx_user_phone_verified ON "user"(is_phone_verified);
CREATE INDEX IF NOT EXISTS idx_user_profile_complete ON "user"(is_profile_complete);
```

## 확인 방법

마이그레이션 실행 후, SQL Editor에서 다음 쿼리로 컬럼이 추가되었는지 확인:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user' 
ORDER BY ordinal_position;
```

## 빠른 실행 (누락된 컬럼만)

최신 마이그레이션 파일만 실행하려면:

```sql
-- /supabase/migrations/add_missing_social_and_name_columns.sql 파일 내용을 복사하여 실행
```

이 마이그레이션은 다음 컬럼들을 추가합니다:
- `updated_at` (자동 업데이트 트리거 포함)
- `first_name`, `last_name`
- `facebook_url`, `twitter_url`, `linkedin_url`, `website_url`, `github_url`

## 주의사항

- 프로덕션 환경에서는 백업을 먼저 수행하세요
- `IF NOT EXISTS` 절이 있어서 기존 컬럼이 있어도 안전합니다
- 마이그레이션 후 애플리케이션을 재시작하면 정상 작동합니다