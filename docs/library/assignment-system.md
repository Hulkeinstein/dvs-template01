---
title: "Assignment Template System"
tags:
  - phase/0
  - type/feature
  - component/assignment
created: 2025-12-14
updated: 2025-12-14
status: active
---

# Assignment Template System

## Overview

Instructor가 Assignment 설정을 템플릿으로 저장하고 재사용할 수 있는 시스템.

**Related Issue**: #10
**ADR**: N/A (기존 아키텍처 패턴 활용)

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    AssignmentModal.tsx                       │
│  ┌─────────────────┐  ┌─────────────────┐                   │
│  │ Load Template   │  │ Save as Template│                   │
│  │ Dropdown        │  │ Button + Input  │                   │
│  └────────┬────────┘  └────────┬────────┘                   │
└───────────┼────────────────────┼────────────────────────────┘
            │                    │
            ▼                    ▼
┌─────────────────────────────────────────────────────────────┐
│              assignmentTemplateActions.ts                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │getMyTemplates│  │saveAsTemplate│  │deleteTemplate│        │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                 Supabase (assignment_templates)              │
│  - RLS: instructor_id = auth.uid()                          │
│  - UNIQUE: (instructor_id, name)                            │
└─────────────────────────────────────────────────────────────┘
```

## Database Schema

```sql
CREATE TABLE assignment_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  template_data JSONB NOT NULL,
  usage_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_template_name UNIQUE (instructor_id, name)
);

-- RLS Policies
CREATE POLICY "Instructors can manage own templates"
ON assignment_templates FOR ALL
USING (instructor_id = auth.uid());

-- Index for fast lookup
CREATE INDEX idx_assignment_templates_instructor
ON assignment_templates(instructor_id);
```

## Server Actions

### `saveAsTemplate(input)`
Assignment 데이터를 템플릿으로 저장.

```typescript
import { saveAsTemplate } from '@/app/lib/actions/assignmentTemplateActions';

const result = await saveAsTemplate({
  name: 'My Template',
  description: 'Optional description',
  template_data: {
    instructions: 'Assignment instructions...',
    timeLimit: { value: 2, unit: 'weeks' },
    totalPoints: 100,
    passingPoints: 70,
    maxUploads: 3,
    maxFileSize: 10,
    attachments: []
  }
});

if (result.success) {
  console.log('Saved:', result.data);
} else {
  // Handle error codes: VALIDATION_ERROR, DUPLICATE_TEMPLATE_NAME, etc.
  console.error(result.code, result.message);
}
```

### `getMyTemplates()`
현재 instructor의 모든 템플릿 조회.

```typescript
import { getMyTemplates } from '@/app/lib/actions/assignmentTemplateActions';

const result = await getMyTemplates();
if (result.success) {
  result.data.forEach(template => {
    console.log(template.name, template.template_data);
  });
}
```

### `deleteTemplate(templateId)`
템플릿 삭제 (소유자만 가능).

```typescript
import { deleteTemplate } from '@/app/lib/actions/assignmentTemplateActions';

const result = await deleteTemplate('uuid-here');
if (result.success) {
  console.log('Deleted');
}
```

### `incrementTemplateUsage(templateId)`
템플릿 사용 시 카운트 증가 (분석용).

## UI Components

### Load Template Dropdown
- "Load Sample Data" 버튼 클릭 시 드롭다운 표시
- My Templates 섹션 (저장된 템플릿)
- Sample Data 섹션 (기본 샘플)
- 템플릿 삭제 버튼 (휴지통 아이콘)

### Save as Template
- 모달 푸터에 "Save as Template" 버튼
- 클릭 시 인라인 입력 필드 표시
- 템플릿 이름 입력 후 Save 클릭
- 중복 이름 시 에러 토스트

## Type Definitions

```typescript
// Template content structure (JSONB)
interface TemplateContent {
  instructions: string;
  attachments: AttachmentMeta[];
  timeLimit: { value: number; unit: 'minutes' | 'hours' | 'days' | 'weeks' | 'months' };
  totalPoints: number;
  passingPoints: number;
  maxUploads: number;
  maxFileSize: number;
}

// Database row
interface TemplateRow {
  id: string;
  instructor_id: string;
  name: string;
  description: string | null;
  template_data: TemplateContent;
  created_at: string;
  updated_at: string;
}

// Action result pattern
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; code: ErrorCode; message?: string; issues?: unknown };
```

## Error Handling

| Code | Description | User Message |
|------|-------------|--------------|
| `VALIDATION_ERROR` | Zod validation failed | "Invalid input" |
| `DUPLICATE_TEMPLATE_NAME` | Same name exists | "A template with this name already exists" |
| `UNAUTHORIZED` | Not logged in | "You must be logged in" |
| `INSTRUCTOR_ONLY` | Not instructor role | "Only instructors can manage templates" |
| `UNKNOWN` | Unexpected error | Error message from DB |

## Files

| File | Purpose |
|------|---------|
| [assignmentTemplateActions.ts](../../app/lib/actions/assignmentTemplateActions.ts) | Server Actions (CRUD) |
| [AssignmentModal.tsx](../../components/create-course/QuizModals/AssignmentModal.tsx) | UI Component |
| [create-course.d.ts](../../types/create-course.ts) | Type definitions |

## Related

- [Payment Security](./payment-security.md) - Similar ActionResult pattern
- [Create Course](../../components/create-course/) - Parent component
