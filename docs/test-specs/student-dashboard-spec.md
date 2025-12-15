# Student Dashboard - Product Specification

## Overview
The Student Dashboard displays real-time learning statistics and course information for enrolled students.

## Purpose
- Show students their learning progress at a glance
- Display enrolled, active, and completed course counts
- Provide quick access to continue learning
- Show overall progress percentage

## Features

### 1. Statistics Counter Widgets
Three counter widgets displaying:
- **Enrolled Courses**: Total number of courses the student has enrolled in
- **Active Courses**: Courses currently in progress (status = 'active')
- **Completed Courses**: Courses the student has finished (status = 'completed')

### 2. Continue Learning Section
- Shows the next recommended lesson based on recent activity
- Displays course title, lesson title, and thumbnail
- "Continue" button links directly to the lesson

### 3. My Courses Grid
- Grid display of all enrolled courses
- Each card shows:
  - Course thumbnail
  - Course title
  - Instructor name
  - Progress bar with percentage
  - Lessons completed count

### 4. Overall Progress
- Circular progress indicator
- Shows average completion percentage across all active courses

## Data Flow
1. User logs in as student
2. Dashboard fetches data via `getStudentDashboardStats(userId)`
3. Real data is displayed (not hardcoded values)

## Expected Behavior
- Dashboard should load within 2 seconds
- Statistics should reflect actual database records
- Empty states should be handled gracefully (0 courses = "No courses enrolled yet")

## Test Scenarios
1. **Verify Statistics Display**: Numbers match actual enrollment data
2. **Verify Course Cards**: Enrolled courses appear in grid
3. **Verify Progress**: Progress percentages are accurate
4. **Verify Navigation**: Clicking course cards navigates to course page

## Technical Details
- Route: `/student-dashboard`
- Components: `StudentDashboardClient.tsx`, `Dashboard.tsx`
- Data Source: `studentDashboardActions.ts`
