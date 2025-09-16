# Supabase 데이터베이스 마이그레이션 가이드

## 📋 개요
이 문서는 DVS-TEMPLATE01 프로젝트의 Supabase 데이터베이스 마이그레이션 실행 가이드입니다.

## ⚠️ 중요 사항
**대부분의 테이블은 이미 존재합니다!**
- 새로운 프로젝트가 아니라면, **비밀번호 인증 필드 추가만 필요합니다**
- 전체 스키마 참고: `modules/database-schema-reference.md` (실행 금지!)

## 🎯 현재 필요한 마이그레이션

### 비밀번호 인증 시스템 (2025-02-10)
**파일**: `supabase/migrations/20250210_add_password_auth_fields.sql`
- OAuth + 비밀번호 하이브리드 인증 지원
- 6개 필드 추가 (password_hash, auth_provider, password_set_at 등)
- TIMESTAMPTZ 사용으로 시간대 이슈 해결
- **이 파일만 실행하면 됩니다!**

### 실행 방법
1. Supabase SQL Editor 열기
2. `20250210_add_password_auth_fields.sql` 내용 복사
3. 실행 및 확인

## 📁 전체 마이그레이션 파일 구조 (참고용)

### 이미 실행된 마이그레이션들
아래 파일들은 이미 실행되어 테이블이 존재합니다:

#### 핵심 테이블 (이미 존재)
1. **create_courses_tables.sql** - 코스 관련 기본 테이블
2. **20250124_create_enrollment_tables.sql** - 등록/수강 테이블  
3. **20250124_create_storage_bucket.sql** - 파일 스토리지 버킷

#### 사용자 프로필 (대부분 존재)
4. **add_user_profile_fields.sql** - 기본 프로필 필드
5. **add_missing_social_and_name_columns.sql** - 소셜 링크 필드
6. **20250209_add_instagram_and_cover_photo.sql** - Instagram, 커버 사진
7. **20250210_add_password_auth_fields.sql** - ⚠️ **이것만 실행 필요!**

#### 스토리지 (이미 존재)
8. **20250209_create_profiles_bucket.sql** - 프로필 이미지 버킷
9. **20250130_create_attachment_storage.sql** - 첨부파일 버킷

#### 기능 테이블 (이미 존재)
10. **create_phone_verifications_table.sql** - 전화번호 인증
11. **20250131_create_quiz_attempts_table.sql** - 퀴즈 시도 기록
12. **20250131_create_certificates_table.sql** - 수료증 시스템
13. **20250213_create_badge_system.sql** - 배지 시스템
14. **20250214_create_announcements_table.sql** - 공지사항

## 🔧 일반적인 오류 해결

### PostgreSQL ALTER TABLE 문법
```sql
-- 올바른 문법: 각 컬럼마다 ADD COLUMN IF NOT EXISTS
ALTER TABLE "user" 
  ADD COLUMN IF NOT EXISTS col1 TYPE,
  ADD COLUMN IF NOT EXISTS col2 TYPE;
```

### "relation already exists" 오류
- IF NOT EXISTS 구문이 있으므로 무시 가능
- 이미 존재하는 테이블/컬럼은 건너뜁니다

### "permission denied" 오류
- Service Role Key 확인
- Supabase Dashboard > Settings > API에서 확인

## 📊 실행 후 확인사항

### 비밀번호 필드 확인
```sql
-- 추가된 컬럼 확인
SELECT 
  column_name, 
  data_type, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'user' 
  AND column_name IN (
    'password_hash', 
    'auth_provider', 
    'password_set_at',
    'password_changed_at',
    'password_reset_token',
    'password_reset_expires'
  )
ORDER BY ordinal_position;

-- 생성된 인덱스 확인
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'user' 
  AND indexname LIKE '%password%';
```

### 테이블 목록 확인
```sql
-- 모든 테이블 목록
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### 스토리지 버킷 확인
```sql
-- 스토리지 버킷 목록
SELECT * FROM storage.buckets;
```

## 🔄 롤백 방법

마이그레이션 실패 시:
1. Supabase Dashboard > Database > Backups에서 복원
2. 또는 개별 컬럼 삭제:
```sql
ALTER TABLE "user" 
  DROP COLUMN IF EXISTS password_hash,
  DROP COLUMN IF EXISTS auth_provider,
  DROP COLUMN IF EXISTS password_set_at,
  DROP COLUMN IF EXISTS password_changed_at,
  DROP COLUMN IF EXISTS password_reset_token,
  DROP COLUMN IF EXISTS password_reset_expires;
```

## 📝 주의사항

1. **백업 필수**: 프로덕션 데이터가 있다면 반드시 백업 후 실행
2. **중복 실행 안전**: 모든 스크립트는 IF NOT EXISTS 사용으로 재실행 가능
3. **시간대 처리**: TIMESTAMPTZ 사용으로 서버/클라이언트 시간대 차이 자동 처리
4. **보안**: 비밀번호는 Bcrypt로 해시, 평문 저장 금지

## 📞 지원

문제 발생 시:
- GitHub Issues: https://github.com/Hulkeinstein/dvs-template01/issues
- Supabase Discord: https://discord.supabase.com