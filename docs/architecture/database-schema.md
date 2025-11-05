---
title: "Database Schema Reference"
tags:
  - type/docs
  - component/database
created: 2025-09-16
updated: 2025-11-05
lifecycle: active
---

# 📚 데이터베이스 스키마 참고 문서

> ## ⚠️ 경고: 참고용 문서입니다!
> 
> **이 문서는 전체 데이터베이스 스키마를 보여주는 참고 문서입니다.**
> 
> ❌ **실행하지 마세요!** 대부분의 테이블은 이미 존재합니다.
> 
> ✅ 실제 마이그레이션은 `supabase/migrations/` 폴더의 개별 SQL 파일을 사용하세요.
> 
> ✅ 현재 필요한 마이그레이션: `20250210_add_password_auth_fields.sql` (비밀번호 필드만)

---

## 📋 전체 스키마 개요

이 문서는 DVS-TEMPLATE01 프로젝트의 전체 데이터베이스 스키마를 참고할 수 있도록 정리한 문서입니다.

### 주요 테이블 구조
- **user** - 사용자 정보 및 프로필
- **courses** - 코스 정보
- **lessons** - 레슨 (비디오, 퀴즈, 과제)
- **course_topics** - 코스 챕터/주제
- **enrollments** - 수강 등록
- **orders** - 결제 기록
- **lesson_progress** - 진도 추적
- 기타 지원 테이블들

---

## 🗄️ 테이블 정의

### 1. 코스 및 레슨 테이블

```sql
-- =========================================================================
-- courses 테이블
-- =========================================================================
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  about_course TEXT,
  thumbnail_url TEXT,
  intro_video_url TEXT,
  intro_video_source VARCHAR(50),
  category VARCHAR(100),
  difficulty_level VARCHAR(50) DEFAULT 'All Levels',
  max_students INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT false,
  enable_qa BOOLEAN DEFAULT false,
  status VARCHAR(50) DEFAULT 'draft',
  is_free BOOLEAN DEFAULT false,
  regular_price DECIMAL(10, 2),
  discounted_price DECIMAL(10, 2),
  start_date DATE,
  language VARCHAR(50) DEFAULT 'English',
  requirements TEXT,
  targeted_audience TEXT,
  course_tags TEXT[],
  total_duration_hours INTEGER DEFAULT 0,
  total_duration_minutes INTEGER DEFAULT 0,
  content_drip_enabled BOOLEAN DEFAULT false,
  content_drip_type VARCHAR(50),
  certificate_template VARCHAR(50),
  certificate_orientation VARCHAR(20) DEFAULT 'landscape',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- =========================================================================
-- course_topics 테이블
-- =========================================================================
CREATE TABLE IF NOT EXISTS course_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================================
-- lessons 테이블
-- =========================================================================
CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES course_topics(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  video_url TEXT,
  video_source VARCHAR(50),
  duration_minutes INTEGER DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  order_index INTEGER DEFAULT 0,
  is_preview BOOLEAN DEFAULT false,
  content_type VARCHAR(50) DEFAULT 'video',
  content_data JSONB,
  attachments JSONB,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================================
-- course_settings 테이블
-- =========================================================================
CREATE TABLE IF NOT EXISTS course_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID UNIQUE NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  allow_review BOOLEAN DEFAULT true,
  review_after_days INTEGER DEFAULT 0,
  allow_download BOOLEAN DEFAULT false,
  passing_grade DECIMAL(5, 2) DEFAULT 80.00,
  certificate_enabled BOOLEAN DEFAULT false,
  drip_content BOOLEAN DEFAULT false,
  drip_schedule JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. 사용자 테이블

```sql
-- =========================================================================
-- user 테이블 (완전한 구조)
-- =========================================================================
CREATE TABLE IF NOT EXISTS "user" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  name TEXT,
  photo_url TEXT,
  role TEXT DEFAULT 'student',
  is_premium BOOLEAN DEFAULT false,
  workspace_email TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- 프로필 필드
  username VARCHAR(255),
  phone VARCHAR(255),
  is_phone_verified BOOLEAN DEFAULT false,
  skill_occupation VARCHAR(255),
  bio TEXT,
  is_profile_complete BOOLEAN DEFAULT false,
  onboarding_completed_at TIMESTAMP,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 이름 및 소셜 필드
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  facebook_url VARCHAR(255),
  twitter_url VARCHAR(255),
  linkedin_url VARCHAR(255),
  website_url VARCHAR(255),
  github_url VARCHAR(255),
  avatar_url VARCHAR(255),
  instagram_url VARCHAR(255),
  cover_photo_url VARCHAR(255),
  
  -- 비밀번호 인증 필드 (하이브리드 인증)
  password_hash VARCHAR(255),
  auth_provider VARCHAR(50) DEFAULT 'google',
  password_set_at TIMESTAMPTZ,
  password_changed_at TIMESTAMPTZ,
  password_reset_token VARCHAR(255),
  password_reset_expires TIMESTAMPTZ
);
```

### 3. 등록 및 수강 관리

```sql
-- =========================================================================
-- enrollments 테이블
-- =========================================================================
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  progress_percentage DECIMAL(5, 2) DEFAULT 0.00,
  completed_at TIMESTAMP WITH TIME ZONE,
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- =========================================================================
-- orders 테이블
-- =========================================================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(50) DEFAULT 'pending',
  payment_method VARCHAR(50),
  transaction_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================================
-- lesson_progress 테이블
-- =========================================================================
CREATE TABLE IF NOT EXISTS lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  enrollment_id UUID REFERENCES enrollments(id) ON DELETE CASCADE,
  is_completed BOOLEAN DEFAULT false,
  progress_percentage DECIMAL(5, 2) DEFAULT 0.00,
  last_watched_position INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);
```

### 4. 평가 및 인증

```sql
-- =========================================================================
-- phone_verifications 테이블
-- =========================================================================
CREATE TABLE IF NOT EXISTS phone_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  verification_code VARCHAR(6) NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  attempts INTEGER DEFAULT 0,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  verified_at TIMESTAMP
);

-- =========================================================================
-- quiz_attempts 테이블
-- =========================================================================
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  score INTEGER,
  total_points INTEGER,
  passed BOOLEAN DEFAULT false,
  answers JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================================
-- certificates 테이블
-- =========================================================================
CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  certificate_number VARCHAR(50) UNIQUE NOT NULL,
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  certificate_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 5. 기타 기능

```sql
-- =========================================================================
-- course_badges 테이블
-- =========================================================================
CREATE TABLE IF NOT EXISTS course_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  badge_type VARCHAR(50) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(course_id, badge_type)
);

-- =========================================================================
-- announcements 테이블
-- =========================================================================
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  instructor_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 📦 스토리지 버킷

```sql
-- course-materials 버킷
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('course-materials', 'course-materials', true, 52428800, NULL)
ON CONFLICT (id) DO NOTHING;

-- profiles 버킷
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('profiles', 'profiles', true, 5242880, 
        ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']::text[])
ON CONFLICT (id) DO NOTHING;

-- attachments 버킷
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('attachments', 'attachments', true, 52428800, 
        ARRAY['application/pdf', 'application/zip', 'application/x-zip-compressed', 
              'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
              'text/plain', 'image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/mpeg']::text[])
ON CONFLICT (id) DO NOTHING;
```

## 🔍 인덱스 (성능 최적화)

```sql
-- Courses 인덱스
CREATE INDEX IF NOT EXISTS idx_courses_instructor_id ON courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);

-- Lessons 인덱스
CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_sort_order ON lessons(course_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_lessons_topic_id ON lessons(topic_id);

-- Course topics 인덱스
CREATE INDEX IF NOT EXISTS idx_course_topics_course_id ON course_topics(course_id);
CREATE INDEX IF NOT EXISTS idx_course_topics_sort_order ON course_topics(course_id, sort_order);

-- Enrollments 인덱스
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON enrollments(status);

-- User 인덱스
CREATE INDEX IF NOT EXISTS idx_user_email ON "user"(email);
CREATE INDEX IF NOT EXISTS idx_user_role ON "user"(role);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_password_reset_token_unique 
  ON "user"(password_reset_token) 
  WHERE password_reset_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_auth_provider ON "user"(auth_provider);

-- Phone verifications 인덱스
CREATE INDEX IF NOT EXISTS idx_phone_verifications_user_id ON phone_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_phone_verifications_phone ON phone_verifications(phone_number);

-- Quiz attempts 인덱스
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_lesson_id ON quiz_attempts(lesson_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_course_id ON quiz_attempts(course_id);
```

## 📝 참고사항

1. **이 문서는 참고용입니다** - 실행하지 마세요!
2. **실제 마이그레이션**: `supabase/migrations/` 폴더 사용
3. **IF NOT EXISTS**: 모든 테이블/컬럼 생성은 중복 실행 안전
4. **TIMESTAMPTZ**: 시간대 자동 처리
5. **인덱스**: 쿼리 성능 최적화를 위해 적절히 배치

## 관련 문서
- 마이그레이션 가이드: `modules/database-migration-guide.md`
- 실제 마이그레이션 파일: `supabase/migrations/`