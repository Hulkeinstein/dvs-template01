---
title: "Work Plan Guide"
tags:
  - type/docs
created: 2025-11-02
updated: 2025-11-05
lifecycle: active
---

# Work Plan Guide

## Quick Reference

### When to Use Work Plans
- **Complex tasks**: 3+ phases or 2+ hours
- **Need context**: Multiple sessions required
- **Multiple decisions**: Architecture choices, trade-offs
- **Collaboration**: Solo dev working with AI agent

### File Location
```
docs/work-plans/<task-name>.md
```

### Basic Structure
```markdown
# [Task Name] - Work Plan

**Status**: Active | Paused | Completed
**Created**: YYYY-MM-DD
**Last Updated**: YYYY-MM-DD HH:MM

## Overview
목표: <one line>
예상 시간: <estimate>
복잡도: Lite | Standard | Risky

## Phases
- [ ] P0: Setup
- [ ] P1: Implementation
- [ ] P2: Verification
- [ ] P3: Cleanup

## Progress Log
### YYYY-MM-DD HH:MM - Phase N
- Completed: ...
- Decision: ...
- Next: ...
```

---

## Response Template (AI)

AI가 Work Plan 사용 시 따라야 할 응답 형식:

```markdown
**[상태 헤더]**
* 목표: <one line>
* 현재 페이즈: P<n>
* 다음 단계: <one line>

**[답변 본문]**
<detailed answer>

**[원래 계획으로 복귀]**
P<n> 핵심: <phase summary>
다음 액션: <specific action>
선택지: [승인] [수정] [질문] [보류]
```

**Purpose**:
- 사용자가 세부 질문을 해도 원래 계획으로 복귀
- 맥락 유지 및 다음 단계 명확화

---

## Operating Rules

### Rule 1: One Phase at a Time
- AI는 한 번에 하나의 Phase만 실행
- Phase 완료 후 Work Plan 파일 업데이트
- 다음 Phase는 명시적 승인 후에만 진행

### Rule 2: Always Return to Plan
- 사용자 질문에 답변 후 **반드시** 원래 계획으로 복귀
- 응답 템플릿의 [원래 계획으로 복귀] 섹션 사용
- 다음 단계 선택지 제시

### Rule 3: Log Everything
- 모든 결정사항을 Work Plan 파일에 기록
- Progress Log에 타임스탬프 포함
- Trade-off 분석 결과 문서화

### Rule 4: Update After Completion
- Phase 완료 시 체크박스 업데이트
- 진행 로그에 완료 시각 기록
- 예상치 못한 이슈 기록

### Rule 5: No Assumptions
- 다음 Phase 진행 전 명시적 승인 필요
- 불명확한 요구사항은 질문으로 해결
- 선택지 제시 시 추천 옵션 명시

---

## Examples

### Example 1: Simple Feature (No Work Plan)

**Scenario**: 버튼 색상 변경

**Why No Work Plan?**
- Single phase
- <1 hour
- No complex decisions
- Clear requirements

**Action**: 직접 구현 후 커밋

---

### Example 2: Standard Feature (Work Plan)

**Scenario**: 새로운 대시보드 위젯 추가

**Why Work Plan?**
- Multiple phases (Design → Implement → Test)
- ~3 hours
- API integration decisions
- Responsive design considerations

**Work Plan Phases**:
```markdown
- [ ] P0: Design widget layout & API integration
- [ ] P1: Implement component
- [ ] P2: Add responsive styles
- [ ] P3: Write tests & update docs
```

---

### Example 3: Complex Task (Work Plan)

**Scenario**: 인증 시스템 리팩토링

**Why Work Plan?**
- 5+ phases
- Multiple sessions needed
- Critical security decisions
- Database migration required

**Work Plan Phases**:
```markdown
- [ ] P0: Analyze current auth flow
- [ ] P1: Design new architecture
- [ ] P2: Create migration plan
- [ ] P3: Implement new auth service
- [ ] P4: Migrate existing users
- [ ] P5: Test & rollback strategy
- [ ] P6: Deploy & monitor
```

---

## Conversation Flow

### Ideal Flow (With Work Plan)

```
User: "사용자 프로필 편집 기능 추가해줘"
AI: [Work Plan 생성] Phase 0-3 계획 제시

User: "Phase 0 승인"
AI: [P0 실행] → [완료] → [Work Plan 업데이트]
   "P0 완료. P1 진행할까요?"

User: "근데 프로필 사진은 어떻게 저장해?"
AI: [답변] Supabase Storage 설명
   [원래 계획으로 복귀] "P1 승인: [승인] [수정] [질문]"

User: "승인"
AI: [P1 실행] → ...
```

### Context Loss Example (Without Work Plan)

```
User: "대시보드 개선해줘"
AI: "Phase 0, 1, 2, 3 계획입니다"

User: "Phase 0에서 왜 API 호출을 분리해?"
AI: [3페이지 API 설계 설명...]

User: "현업에서는 어떻게 해?"
AI: [5페이지 Best Practices 조사...]

User: "그럼 어디서부터 시작하지?" ← LOST CONTEXT!
AI: ??? (원래 계획을 잊음)
```

**Solution**: Work Plan 파일 + 응답 템플릿으로 항상 복귀

---

## FAQ

### Q1: 언제 Work Plan을 만들어야 하나요?
**A**: 3가지 조건 중 하나라도 해당하면 생성
- 2시간 이상 예상
- 3개 이상의 Phase 필요
- 세션이 여러 번으로 나뉠 것 같을 때

### Q2: Work Plan 없이 시작했는데 복잡해졌어요
**A**: 즉시 Work Plan 생성 가능
1. 현재까지 작업 정리
2. 남은 작업 Phase로 분리
3. Work Plan 파일 생성 후 계속

### Q3: Work Plan은 언제 삭제하나요?
**A**: 작업 완료 후
1. Library 문서 작성 (`docs/library/<feature>.md`)
2. Work Plan 삭제 (`git rm docs/work-plans/<task>.md`)
3. PR 생성

### Q4: AI가 계획을 벗어나면?
**A**: 응답 템플릿 준수 요청
- "원래 계획으로 돌아가줘"
- AI는 [원래 계획으로 복귀] 섹션 제시

### Q5: Phase를 건너뛰고 싶어요
**A**: 명시적으로 요청
- "P1 건너뛰고 P2 진행"
- AI는 Work Plan에 스킵 이유 기록

---

## Related Files

- AI Protocol: `~/.claude/modules/work-plan-protocol.md`
- Project Workflow: `modules/workflow.md`
- Development Guide: `modules/development-guide.md`
