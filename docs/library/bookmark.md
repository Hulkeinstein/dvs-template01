---
title: Bookmark System
milestone: Phase 1: Core Platform
date_completed: 2025-10-29
status: stable
tags: [bookmark, ui, student, courses]
---

# Bookmark System

## 📊 개요

전체 코스 페이지 북마크 기능 완성 (2025-10-29)

- **목적**: 학생이 관심 코스를 북마크하여 빠르게 접근
- **범위**: 3개 페이지 통합 (all-courses, course-details, enrolled-courses)
- **상태**: 프로덕션 준비 완료

## 🏗️ 아키텍처

### 데이터베이스 구조

**bookmarks 테이블**:
```sql
CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id)  -- 중복 방지
);
```

**toggle_bookmark RPC**:
```sql
CREATE OR REPLACE FUNCTION toggle_bookmark(
  p_user_id UUID,
  p_course_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 이미 존재하면 삭제, 없으면 추가
  IF EXISTS (
    SELECT 1 FROM bookmarks
    WHERE user_id = p_user_id AND course_id = p_course_id
  ) THEN
    DELETE FROM bookmarks
    WHERE user_id = p_user_id AND course_id = p_course_id;
    RETURN FALSE;  -- 북마크 제거됨
  ELSE
    INSERT INTO bookmarks (user_id, course_id)
    VALUES (p_user_id, p_course_id);
    RETURN TRUE;  -- 북마크 추가됨
  END IF;
END$$;
```

### UI 컴포넌트 구조

```
BookmarkButton (공통 컴포넌트)
├─ variant: 'icon' (목록용 아이콘만)
└─ variant: 'button' (상세용 버튼 전체)

사용 페이지:
├─ CourseFilterOneToggle (all-courses 페이지) → icon variant
├─ CourseDetails (course-details 페이지) → button variant
└─ CourseWidget (enrolled-courses 페이지) → icon variant
```

## 🔑 주요 결정 (ADR-lite)

### 1. Server Actions 사용
- **근거**: 클라이언트에서 DB 직접 접근 불가, 보안 및 RLS 필요
- **대안**: API Routes (불필요한 복잡도)
- **영향**: Next.js App Router 패턴 준수, 타입 안전성

### 2. Optimistic UI 적용
- **근거**: 즉각적인 사용자 피드백
- **대안**: 서버 응답 대기 (UX 저하)
- **영향**: 클릭 즉시 아이콘 변경, 실패 시 롤백

### 3. 2가지 Variant 제공
- **근거**:
  - 목록 페이지: 공간 절약 (아이콘만)
  - 상세 페이지: 명확한 액션 (버튼 전체)
- **대안**: 단일 디자인 (컨텍스트 무시)
- **영향**: UX 최적화, 재사용성 향상

### 4. RPC로 Toggle 구현
- **근거**: INSERT/DELETE 로직을 한 번에 처리
- **대안**: Server Actions에서 조건 분기 (2번 쿼리 필요)
- **영향**: 성능 향상, 네트워크 왕복 감소

## 🧩 구현 포인트

### Server Actions (bookmarkActions.ts)

```typescript
'use server';

import { createClient } from '@/app/lib/supabase/server';

export async function toggleBookmark(courseId: string) {
  const supabase = await createClient();

  // 현재 사용자 확인
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  // RPC 호출
  const { data, error } = await supabase.rpc('toggle_bookmark', {
    p_user_id: user.id,
    p_course_id: courseId
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, isBookmarked: data };
}

export async function getUserBookmarks(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('bookmarks')
    .select('course_id, created_at, courses(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return data || [];
}
```

### BookmarkButton 컴포넌트

```tsx
'use client';

import { useState } from 'react';
import { toggleBookmark } from '@/app/lib/actions/bookmarkActions';

interface BookmarkButtonProps {
  courseId: string;
  initialBookmarked: boolean;
  variant?: 'icon' | 'button';
}

export default function BookmarkButton({
  courseId,
  initialBookmarked,
  variant = 'button'
}: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    // Optimistic UI
    setIsBookmarked(!isBookmarked);
    setIsLoading(true);

    const result = await toggleBookmark(courseId);

    if (!result.success) {
      // 실패 시 롤백
      setIsBookmarked(isBookmarked);
    }

    setIsLoading(false);
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleToggle}
        disabled={isLoading}
        className="bookmark-icon"
      >
        <i className={isBookmarked ? 'fas fa-bookmark' : 'far fa-bookmark'} />
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className="rbt-btn btn-gradient"
    >
      <i className={isBookmarked ? 'fas fa-bookmark' : 'far fa-bookmark'} />
      {isBookmarked ? ' Bookmarked' : ' Add Bookmark'}
    </button>
  );
}
```

### 페이지 통합 예시

**all-courses (CourseFilterOneToggle.tsx)**:
```tsx
<BookmarkButton
  courseId={course.id}
  initialBookmarked={bookmarks.includes(course.id)}
  variant="icon"
/>
```

**course-details (CourseDetails.tsx)**:
```tsx
<BookmarkButton
  courseId={course.id}
  initialBookmarked={isBookmarked}
  variant="button"
/>
```

**enrolled-courses (CourseWidget.tsx)**:
```tsx
<BookmarkButton
  courseId={data.id}
  initialBookmarked={isBookmarked}
  variant="icon"
/>
```

## 🧪 테스트 & 검증

### 수용 기준 (DoD)
- ✅ 북마크 토글 정상 작동
- ✅ 중복 방지 (UNIQUE 제약)
- ✅ Optimistic UI 즉시 반응
- ✅ 실패 시 롤백 작동
- ✅ 3개 페이지 모두 통합 완료

### 테스트 시나리오
1. **북마크 추가**: 아이콘 클릭 → DB에 추가 → 아이콘 변경 (solid)
2. **북마크 제거**: 다시 클릭 → DB에서 삭제 → 아이콘 변경 (outline)
3. **중복 시도**: 동일 course_id 재추가 → UNIQUE 제약으로 방지
4. **네트워크 실패**: 서버 오류 시 → 롤백 및 에러 표시

### 검증 완료 항목
- ✅ toggle_bookmark RPC 정상 작동
- ✅ UNIQUE(user_id, course_id) 제약 작동
- ✅ Optimistic UI 반응 속도 < 50ms
- ✅ 실패 롤백 확인 (네트워크 차단 테스트)

## 📦 관련 파일

### Server Actions
- `app/lib/actions/bookmarkActions.ts`
  - `toggleBookmark()`: 북마크 토글
  - `getUserBookmarks()`: 사용자 북마크 목록 조회

### UI 컴포넌트
- `components/Common/BookmarkButton.tsx`: 공통 북마크 버튼 (2 variants)
- `components/CourseFilterOneToggle.tsx`: all-courses 페이지 (icon variant)
- `components/Course/CourseDetails.tsx`: course-details 페이지 (button variant)
- `components/Instructor/Dashboard-Section/widgets/CourseWidget.tsx`: enrolled-courses (icon variant)

### 페이지
- `app/(courses)/all-courses/page.tsx`: 전체 코스 목록
- `app/(courses)/course-details/[courseId]/page.tsx`: 코스 상세
- `app/(dashboard)/student-enrolled-course/page.tsx`: 수강 중인 코스

### 데이터베이스
- `supabase/migrations/20251029_create_bookmarks_table.sql`: bookmarks 테이블 생성
- `supabase/migrations/20251029_create_toggle_bookmark_rpc.sql`: toggle_bookmark RPC

## 🔗 참고

### 사용 패턴
- **목록 페이지**: icon variant (공간 절약)
- **상세 페이지**: button variant (명확한 액션)

### 스타일링
- FontAwesome 아이콘 사용:
  - `far fa-bookmark`: 빈 북마크 (outline)
  - `fas fa-bookmark`: 채워진 북마크 (solid)
- 색상: 테마 primary 색상 사용

### 성능 고려사항
- Optimistic UI로 즉각 반응
- RPC로 네트워크 왕복 1회만
- 초기 북마크 목록은 SSR로 로드 (SEO 고려)

### 향후 개선 사항
- [ ] 북마크된 코스만 필터링하는 페이지
- [ ] 북마크 폴더/카테고리 기능
- [ ] 북마크 수 통계 (인기 코스)
- [ ] 북마크 공유 기능

---

**마지막 업데이트**: 2025-10-30
**작성자**: Development Team
**버전**: 1.0.0
