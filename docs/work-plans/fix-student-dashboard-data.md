# Student Dashboard Data Integration Plan

**Date:** 2025-12-15
**Branch:** `fix/student-dashboard-data`
**Status:** Planning

## Goal Description
Connect the currently hardcoded Student Dashboard UI to real data using the existing `getStudentDashboardStats` server action. This will ensure students see their actual course progress and enrollment statistics.

## Proposed Changes

### Dashboard Logic
#### `app/(dashboard)/dashboard/page.js`
- Import `getStudentDashboardStats` from `@/app/lib/actions/studentDashboardActions`.
- Fetch student stats when `userRole` is not admin/instructor.
- Pass `stats` prop to `StudentDashboard`.

### Student Dashboard Components
#### `app/(dashboard)/(student)/student-dashboard/(dashboard)/index.tsx`
- Update `StudentDashboard` component signature to accept `stats`.
- Pass `stats` to the child `Dashboard` component.

#### `components/Student/Dashboard.js`
- Update component to accept `stats` prop.
- Replace hardcoded values (30, 10, 7) with:
    - `stats.enrolledCourses`
    - `stats.activeCourses`
    - `stats.completedCourses`
- Handle default/loading states.

## Verification Plan

### Manual Verification
1.  **Login as Student**:
    - Build/Start the app locally.
    - Login with a student account.
    - Navigate to `/dashboard`.
2.  **Verify Numbers**:
    - Check that "Enrolled Courses", "Active Courses", and "Completed Courses" match the user's actual database records.

---

# Claude Code 수정 계획 (프로젝트 원칙 준수)

**Status:** Active
**Created:** 2025-12-15
**Last Updated:** 2025-12-15 12:00
**복잡도:** Standard
**예상 시간:** 1-2h

## Overview

목표: 하드코딩된 Student Dashboard를 실제 데이터와 연결 (기존 `Dashboard.tsx` 활용)

## 원칙 위반 분석

| 원칙 | Antigravity 계획 | 수정 방향 |
|------|------------------|----------|
| TypeScript Migration | `.js` 수정 | `.tsx` 변환 필수 |
| Code Reuse (DISCOVER) | `Dashboard.js` 수정 | 기존 `Dashboard.tsx` 활용 |
| Work Plan 형식 | 불완전 | Phases 추가 |

## 핵심 발견사항

**이미 구현된 TypeScript 버전 존재:**
```
components/Student/Dashboard.js   ← 하드코딩 (30, 10, 7)
components/Student/Dashboard.tsx  ← 실제 데이터 연동 완료 ✅
```

`Dashboard.tsx`는 이미 `getStudentDashboardStats`를 호출하고 실제 데이터를 표시함.

**문제점:** `StudentDashboardClient.tsx:43`에서 userId를 Dashboard에 전달하지 않음.

## Phases

- [ ] P0: Setup - 브랜치 생성, 현재 상태 확인
- [ ] P1: Fix Data Flow - userId prop 전달 수정
- [ ] P2: Cleanup - 중복 `.js` 파일 삭제, TypeScript 변환
- [ ] P3: Verification - 테스트 및 검증

## 상세 변경사항

### P1: Fix Data Flow

#### `app/(dashboard)/(student)/student-dashboard/StudentDashboardClient.tsx`
**Line 43** - Dashboard에 userId prop 전달:
```typescript
// Before
<Dashboard />

// After
<Dashboard userId={userId} />
```

#### `app/(dashboard)/dashboard/page.js` → `page.tsx`
- TypeScript 변환
- StudentDashboard에 userId 전달

### P2: Cleanup

#### 삭제 대상
- `components/Student/Dashboard.js` (중복, `.tsx` 버전 사용)

#### TypeScript 변환 대상
- `app/(dashboard)/dashboard/page.js` → `page.tsx`

### P3: Verification

1. **Login as Student** → `/dashboard`
2. **확인 항목:**
   - Enrolled Courses 수치
   - Active Courses 수치
   - Completed Courses 수치
3. **Build 확인:** `npm run typecheck && npm run build`

## 수정 파일 목록

| 파일 | 작업 |
|------|------|
| `app/(dashboard)/(student)/student-dashboard/StudentDashboardClient.tsx` | userId prop 전달 |
| `app/(dashboard)/dashboard/page.js` | `.tsx` 변환, userId 전달 |
| `components/Student/Dashboard.js` | 삭제 (`.tsx` 사용) |

## Progress Log

### 2025-12-15 - Planning
- Antigravity 계획 검토
- 프로젝트 원칙 위반 사항 식별
- 수정 계획 작성
