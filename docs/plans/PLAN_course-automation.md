# Implementation Plan: Course Automation (Claude Code 자연어 기반)

**Status**: ✅ Completed
**Started**: 2026-01-02
**Last Updated**: 2026-01-02
**Completed**: 2026-01-02
**Estimated Completion**: 2026-01-04

---

**⚠️ CRITICAL INSTRUCTIONS**: After completing each phase:
1. ✅ Check off completed task checkboxes
2. 🧪 Run all quality gate validation commands
3. ⚠️ Verify ALL quality gate items pass
4. 📅 Update "Last Updated" date above
5. 📝 Log learnings in [DEV_LOG](../logs/2026-Q1.md) (1-2 lines, 자산화 가치 → Library 승격)
6. ➡️ Only then proceed to next phase

⛔ **DO NOT skip quality gates or proceed with failing checks**

---

## 📋 Overview

### Feature Description
**Claude Code 자연어 명령으로 코스를 자동 생성**하는 시스템.
- **⚠️ Admin 전용**: 기존 수동 생성(Instructor)은 유지, 자동화는 Admin만 사용
- Claude Code에게 자연어로 지시 → YAML 생성 → DB 저장
- YouTube URL에서 메타데이터 자동 추출 (제목, 설명, 썸네일, 길이)
- 기존 `createCourse()` 및 `fetchYouTubeMetadata()` 재활용

### 워크플로우
```
┌─────────────────────────────────────────────────────────────────┐
│  Admin이 Claude Code에게 자연어로 지시                           │
│                                                                 │
│  "이 YouTube 영상들로 Python 입문 코스 만들어줘                   │
│   - https://youtube.com/watch?v=abc123                          │
│   - https://youtube.com/watch?v=def456                          │
│   카테고리는 프로그래밍, 레벨은 초급이야"                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Claude Code가 처리                                              │
│                                                                 │
│  1. YouTube 메타데이터 추출 (fetchYouTubeMetadata)               │
│  2. CourseFormData 구성                                         │
│  3. createCourseHeadless() 호출 (Admin 검증)                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ✅ 코스 생성 완료                              │
│                    Course ID: xxx-xxx-xxx                       │
└─────────────────────────────────────────────────────────────────┘
```

### Success Criteria
- [x] Claude Code 자연어 명령으로 코스 생성 가능
- [x] YouTube URL에서 자동으로 제목/설명/썸네일 추출
- [x] Admin 권한 검증 동작
- [x] 에러 발생 시 명확한 메시지 출력

### User Impact
Claude Code에게 자연어로 지시하면 코스가 자동 생성됨. YAML 파일을 직접 작성할 필요 없음.

---

## 🏗️ Architecture Decisions

| Decision | Rationale | Trade-offs |
|----------|-----------|------------|
| **Admin 전용** | 보안 강화, 실수로 대량 생성 방지 | Admin만 사용 가능 |
| **Claude Code 자연어 기반** | CLI 명령어 불필요, 자연스러운 UX | Claude Code 의존 |
| API Secret + Admin Email 인증 | 환경변수로 보안 관리, RLS 우회 | 환경변수 관리 필요 |
| 기존 함수 재사용 | 검증된 코드, 중복 방지 | Server Action 호출 방식 |
| 수동 생성(Instructor) 유지 | 기존 워크플로우 보존, 역할 분리 | - |

---

## 📦 Dependencies

### Required Before Starting
- [x] `feature/course-automation` 브랜치 생성됨
- [x] 기존 courseActions.ts 분석 완료

### External Dependencies
- `zod`: ^3.25.76 (이미 설치됨)
- ~~`yaml`: 불필요 (Claude Code가 직접 처리)~~
- ~~`tsx`: 불필요 (CLI 스크립트 없음)~~

---

## 🧪 Test Strategy

### Testing Approach
**단위 테스트**: `createCourseHeadless()` 함수 검증

### Test File Organization
```
__tests__/
└── lib/
    └── actions/
        └── courseActions.headless.test.ts
```

---

## 🚀 Implementation Phases

### Phase 0: createCourseHeadless 함수 구현
**Goal**: Admin 전용 코스 생성 함수 추가
**Estimated Time**: 2-3 hours
**Status**: ✅ Completed

#### Tasks

- [x] **Task 0.1**: Add createCourseHeadless to courseActions (Admin 전용)
  - File: `app/lib/actions/courseActions.ts`
  - Details:
    ```typescript
    export async function createCourseHeadless(
      formData: CourseFormData,
      adminEmail: string
    ): Promise<CreateCourseResult>

    // 내부 로직:
    // 1. adminEmail로 사용자 조회
    // 2. role === 'admin' 확인 (실패 시 에러)
    // 3. 기존 createCourse() 로직 재사용
    ```

- [x] **Task 0.2**: Add environment variable
  - File: `.env.example`
  - Details: `COURSE_AUTOMATION_ADMIN_EMAIL=admin@example.com`

- [x] **Task 0.3**: Write tests
  - File: `__tests__/actions/courseActions.headless.test.ts`
  - Details: Admin 검증, 입력 유효성 검증, 함수 시그니처 테스트

#### Quality Gate ✋ ✅ PASSED

**Validation Commands**:
```bash
npm run typecheck   # ✅ Pass
npm run lint        # ✅ Pass (errors only)
npx jest __tests__/actions/courseActions.headless.test.ts  # ✅ 7 tests passed
```

---

### Phase 1: Claude Code 가이드 문서 작성
**Goal**: Claude Code가 참조할 수 있는 코스 생성 가이드
**Estimated Time**: 1-2 hours
**Status**: ✅ Completed

#### Tasks

- [x] **Task 1.1**: Create course creation guide for Claude Code
  - File: `docs/library/course-automation.md`
  - Details:
    - CourseFormData 필드 설명
    - 필수/선택 필드 구분
    - YouTube 메타데이터 활용 방법
    - 사용 예시

- [x] **Task 1.2**: Add to CLAUDE.md (project memory)
  - File: `modules/development-guide.md`
  - Details: Course Automation 섹션 추가

#### Quality Gate ✋ ✅ PASSED

**Final Checks**:
- [x] 문서 링크 정상 작동
- [x] Claude Code가 가이드 참조 가능

---

## ⚠️ Risk Assessment

| Risk | Probability | Impact | Mitigation Strategy |
|------|-------------|--------|---------------------|
| YouTube API 할당량 초과 | Medium | High | Rate limiting, 캐싱 |
| 비공개/삭제된 영상 | Medium | Low | 에러 메시지 + 건너뛰기 |
| Admin 아닌 사용자 시도 | Low | High | 역할 검증 필수 |

---

## 🔄 Rollback Strategy

### If Any Phase Fails
**Steps to revert**:
- `git checkout main -- app/lib/actions/courseActions.ts`
- 브랜치 삭제 후 재시작

---

## 📊 Progress Tracking

### Completion Status
- **Phase 0**: ✅ 100%
- **Phase 1**: ✅ 100%

**Overall Progress**: 100% complete

### Time Tracking
| Phase | Estimated | Actual | Variance |
|-------|-----------|--------|----------|
| Phase 0 | 2-3 hours | ~2 hours | On target |
| Phase 1 | 1-2 hours | ~1 hour | On target |
| **Total** | 3-5 hours | ~3 hours | On target |

---

## 📝 Learnings (DEV_LOG Draft)

| Date | Tag | Learning |
|------|-----|----------|
| 2026-01-02 | jest | Jest mock hoisting 문제: `jest.mock()` 팩토리 내부에 mock 정의해야 함 |
| 2026-01-02 | typescript | 같은 이름의 타입 충돌 시 import alias 사용: `import { Type as AliasType }` |
| 2026-01-02 | supabase | Admin 전용 함수는 `supabaseAdmin` 사용하여 RLS 우회 |

---

## 📚 References

### Critical Files
- `app/lib/actions/courseActions.ts` - createCourseHeadless() 추가
- `app/lib/actions/youtubeActions.ts` - fetchYouTubeMetadata() 재사용
- `types/create-course.ts` - CourseFormData 타입
- `app/lib/utils/courseDataMapper.ts` - DB 매핑

### CourseFormData 필수 필드 (Claude Code 참조용)

```typescript
// 필수 필드
title: string;              // 코스 제목
shortDescription: string;   // 짧은 설명
description: string;        // 상세 설명
category: string;           // 카테고리
level: string;              // beginner | intermediate | advanced
language: string;           // 언어
price: number;              // 가격 (0 = 무료)

// 선택 필드 (기본값 있음)
slug?: string;              // URL-friendly (자동 생성)
maxStudents?: number;       // 기본 100
discountPrice?: number | null;
startDate?: string;
endDate?: string;
enrollmentDeadline?: string;
duration?: number;
introVideoUrl?: string;
requirements?: string;
targetedAudience?: string;
courseTags?: string;
totalDurationHours?: number;
totalDurationMinutes?: number;
certificateEnabled?: boolean;  // 기본 false
certificateTitle?: string;
passingGrade?: number;         // 기본 70
lifetimeAccess?: boolean;      // 기본 false
status?: 'draft' | 'published'; // 기본 draft
```

### 사용 예시 (Claude Code에게 지시)

```
User: "Python 입문 코스 만들어줘.
       영상은 이거야:
       - https://youtube.com/watch?v=abc123
       - https://youtube.com/watch?v=def456
       카테고리는 프로그래밍, 레벨은 초급, 무료 코스야"

Claude Code:
  1. fetchYouTubeMetadata()로 영상 정보 추출
  2. CourseFormData 구성
  3. createCourseHeadless() 호출
  4. "코스 생성 완료! ID: xxx"
```

---

**Plan Status**: ✅ Completed
**Next Action**: PR 생성 및 main 브랜치에 머지
**Blocked By**: None
