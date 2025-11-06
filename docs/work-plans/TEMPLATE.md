---
title: "[Feature Name] Work Plan"
tags:
  - type/docs
  - progress/in-progress
created: YYYY-MM-DD
updated: YYYY-MM-DD
lifecycle: active
---

# [Feature Name] - Work Plan

**Status**: Active | Paused | Completed
**Created**: YYYY-MM-DD
**Last Updated**: YYYY-MM-DD (Phase X 완료)
**Issue**: #XX
**Delete By**: YYYY-MM-DD (30일 후)

---

## Overview

**목표**: [One-line description of what you're trying to achieve]

**예상 시간**: X hours

**복잡도**: Lite | Standard | Risky

**배경**:
- [Why is this work needed?]
- [What problem does it solve?]
- [What is the current state?]

---

## Phases

- [ ] **P0: Setup** (Description)
- [ ] **P1: Implementation** (Description)
- [ ] **P2: Testing** (Description)
- [ ] **P3: Documentation** (Description)
- [ ] **P4: Cleanup** (Description)

---

## Phase Details

### Phase 0: Setup

**목표**: [What needs to be prepared]

**작업**:
- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

**결정사항**:
- **D1**: [Decision name] (see Decisions Log)

### Phase 1: Implementation

**목표**: [What will be built]

#### 1.1. Subtask Name

**작업**:
- [ ] Specific task 1
- [ ] Specific task 2

**파일**:
- `path/to/file1.ts`
- `path/to/file2.tsx`

#### 1.2. Another Subtask

**작업**:
- [ ] Task 1
- [ ] Task 2

### Phase 2: Testing

**목표**: [What needs to be tested]

**테스트 시나리오**:
1. Scenario 1: [Description]
2. Scenario 2: [Description]

**검증 명령**:
```bash
npm run test
npm run typecheck
npm run build
```

### Phase 3: Documentation

**목표**: [What needs to be documented]

**작업**:
- [ ] Update docs/library/[feature].md
- [ ] Update README if needed
- [ ] Add code comments

### Phase 4: Cleanup

**목표**: [Final steps]

**작업**:
- [ ] Delete this Work Plan
- [ ] Create PR
- [ ] Verify CI passes

---

## Progress Log

### YYYY-MM-DD HH:MM - Phase 0 Started
- [What was done]
- [Decision made]
- **Next**: [What's next]

### YYYY-MM-DD HH:MM - Phase 0 Completed ✅
- [Summary of completion]
- [Commit hash if applicable]
- **Next**: Phase 1 시작

### YYYY-MM-DD HH:MM - Phase 1 In Progress
- [Current work]
- [Issues encountered]
- **Next**: [Next step]

---

## Decisions Log

### D1: [Decision Name] (YYYY-MM-DD)
**질문**: [What was the question?]

**결정**: [What was decided?]

**이유**:
- [Reason 1]
- [Reason 2]

**대안**:
- A안: [Description] - [Why not chosen]
- B안: [Description] - [Chosen] ✅
- C안: [Description] - [Why not chosen]

**영향**: [What is affected by this decision?]

**ADR**: [Link to ADR if created]

---

### D2: [Another Decision]
...

---

## Risks & Mitigations

### R1: [Risk Name]
**완화 방안**:
- [Mitigation 1]
- [Mitigation 2]

### R2: [Another Risk]
**완화 방안**:
- [Mitigation]

---

## Next Steps

**Immediate**:
1. [Next immediate action]
2. [Second action]

**After Phase X**:
- [What happens next]
- [Dependencies]

---

## Completion Criteria

**Phase 0**:
- [ ] Criterion 1
- [ ] Criterion 2

**Phase 1**:
- [ ] Criterion 1
- [ ] Criterion 2

**Overall (DoD)**:
- [ ] All tests pass
- [ ] TypeScript type-check passes
- [ ] Build succeeds
- [ ] Documentation updated
- [ ] PR created and approved

---

## Reference

- **Issue**: #XX
- **Work Plan Guide**: [../workflows/work-plan-guide.md](../workflows/work-plan-guide.md)
- **Relationship Guide**: [../workflows/milestone-workplan-adr-relationship.md](../workflows/milestone-workplan-adr-relationship.md)
- **Examples**: [../workflows/examples.md](../workflows/examples.md)
- **Related Library Docs**: [../library/](../library/)
- **Related ADRs**: [../adr/INDEX.md](../adr/INDEX.md)
- **Project Workflow**: [../../modules/workflow.md](../../modules/workflow.md)

---

## Response Template (AI Protocol)

When AI is working with this Work Plan, use this format:

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

### Operating Rules

1. **One Phase at a Time**: AI executes one phase, updates Work Plan, waits for approval
2. **Always Return to Plan**: After answering questions, return to original plan
3. **Log Everything**: Record all decisions in Decisions Log
4. **Update After Completion**: Mark phases complete, update Progress Log
5. **No Assumptions**: Get explicit approval before next phase

---

## Workflow Integration

```
Issue (#XX)
  ↓
Work Plan (this file) - Temporary
  ↓
Development
  ↓
Library Doc - Permanent
  ↓
Delete Work Plan
  ↓
PR (Closes #XX)
```

**When to Delete**:
- ✅ After PR merge
- ✅ After Library doc created
- ✅ After 30 days (if stale)

**When to Keep**:
- ⏳ Active development
- ⏳ Paused (but will resume)
- ⏳ Complex feature in progress
