-- Admin Dual Role RLS Policies
-- Admin이 Instructor 권한도 가질 수 있도록 RLS 정책 업데이트

-- ============================================
-- 1. COURSES 테이블 정책
-- ============================================

-- 기존 정책 삭제 (있는 경우)
DROP POLICY IF EXISTS "Instructors can create courses" ON courses;
DROP POLICY IF EXISTS "Instructors can update own courses" ON courses;
DROP POLICY IF EXISTS "Instructors can delete own courses" ON courses;

-- 새로운 정책: Admin과 Instructor 모두 코스 생성 가능
CREATE POLICY "Instructors and admins can create courses" ON courses
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "user" 
      WHERE id = auth.uid() 
      AND role IN ('instructor', 'admin')
    )
  );

-- 새로운 정책: 코스 소유자 또는 Admin이 수정 가능
CREATE POLICY "Course owners and admins can update" ON courses
  FOR UPDATE 
  USING (
    instructor_id = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM "user"
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- 새로운 정책: 코스 소유자 또는 Admin이 삭제 가능
CREATE POLICY "Course owners and admins can delete" ON courses
  FOR DELETE 
  USING (
    instructor_id = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM "user"
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- ============================================
-- 2. LESSONS 테이블 정책
-- ============================================

-- 기존 정책 삭제 (있는 경우)
DROP POLICY IF EXISTS "Instructors can manage lessons" ON lessons;

-- 새로운 정책: 코스 소유자 또는 Admin이 레슨 관리 가능
CREATE POLICY "Course owners and admins can manage lessons" ON lessons
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = lessons.course_id
      AND (
        courses.instructor_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM "user"
          WHERE id = auth.uid() 
          AND role = 'admin'
        )
      )
    )
  );

-- ============================================
-- 3. ANNOUNCEMENTS 테이블 정책 (있는 경우)
-- ============================================

-- 테이블이 존재하는지 확인하고 정책 생성
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'announcements'
  ) THEN
    -- 기존 정책 삭제
    EXECUTE 'DROP POLICY IF EXISTS "Instructors can create announcements" ON announcements';
    EXECUTE 'DROP POLICY IF EXISTS "Instructors can manage own announcements" ON announcements';
    
    -- 새로운 정책 생성
    EXECUTE '
      CREATE POLICY "Instructors and admins can create announcements" ON announcements
      FOR INSERT 
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM "user" 
          WHERE id = auth.uid() 
          AND role IN (''instructor'', ''admin'')
        )
      )
    ';
    
    EXECUTE '
      CREATE POLICY "Announcement owners and admins can manage" ON announcements
      FOR UPDATE 
      USING (
        instructor_id = auth.uid() 
        OR EXISTS (
          SELECT 1 FROM "user"
          WHERE id = auth.uid() 
          AND role = ''admin''
        )
      )
    ';
  END IF;
END $$;

-- ============================================
-- 4. ENROLLMENTS 테이블 - Admin 읽기 권한
-- ============================================

-- Admin이 모든 enrollment 데이터를 볼 수 있도록
CREATE POLICY IF NOT EXISTS "Admins can view all enrollments" ON enrollments
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM "user"
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- ============================================
-- 5. USER 테이블 - Admin 관리 권한
-- ============================================

-- Admin이 모든 사용자 정보를 볼 수 있도록
CREATE POLICY IF NOT EXISTS "Admins can view all users" ON "user"
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM "user" u
      WHERE u.id = auth.uid() 
      AND u.role = 'admin'
    )
  );

-- Admin이 사용자 역할을 변경할 수 있도록
CREATE POLICY IF NOT EXISTS "Admins can update user roles" ON "user"
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM "user" u
      WHERE u.id = auth.uid() 
      AND u.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "user" u
      WHERE u.id = auth.uid() 
      AND u.role = 'admin'
    )
  );

-- ============================================
-- 코멘트 추가
-- ============================================
COMMENT ON POLICY "Instructors and admins can create courses" ON courses IS 'Admin과 Instructor 모두 코스 생성 가능';
COMMENT ON POLICY "Course owners and admins can update" ON courses IS '코스 소유자 또는 Admin이 수정 가능';
COMMENT ON POLICY "Course owners and admins can delete" ON courses IS '코스 소유자 또는 Admin이 삭제 가능';
COMMENT ON POLICY "Course owners and admins can manage lessons" ON lessons IS '코스 소유자 또는 Admin이 레슨 관리 가능';
COMMENT ON POLICY "Admins can view all enrollments" ON enrollments IS 'Admin은 모든 수강 정보 조회 가능';
COMMENT ON POLICY "Admins can view all users" ON "user" IS 'Admin은 모든 사용자 정보 조회 가능';
COMMENT ON POLICY "Admins can update user roles" ON "user" IS 'Admin은 사용자 역할 변경 가능';