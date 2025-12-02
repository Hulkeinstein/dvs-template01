---
title: "Agents Guide - Available Agents and Usage"
tags: [type/guide, component/agents, status/active]
created: 2025-11-17
updated: 2025-11-17
status: active
---

# Agents Guide

## Overview

DVS-TEMPLATE01 프로젝트에서 사용 가능한 **9개 agents**:
- **Built-in Agents**: 5개 (Claude Code 기본 제공)
- **Custom Agents**: 4개 (프로젝트 전용)

Agents는 특정 작업을 전문적으로 수행하는 AI 협업자입니다. 자동으로 활성화되거나 명시적으로 호출할 수 있습니다.

---

## Built-in Agents (5개)

### 1. general-purpose
- **용도**: 복잡한 다단계 작업, 코드 검색, 멀티스텝 워크플로우
- **도구**: 모든 도구 접근 가능
- **사용 시기**:
  - 키워드/파일 검색 시 첫 시도로 찾기 어려울 때
  - 여러 단계가 필요한 복잡한 작업

### 2. Explore
- **용도**: 코드베이스 탐색 전문 (빠른 파일 검색, 패턴 매칭)
- **thoroughness 레벨**: quick, medium, very thorough
- **사용 예시**:
  - `"src/components/**/*.tsx"` 파일 찾기
  - `"API endpoints"` 키워드 검색
  - `"how do API endpoints work?"` 질문 답변

### 3. Plan
- **용도**: 코드베이스 분석 및 계획 수립
- **thoroughness 레벨**: quick, medium, very thorough
- **사용 예시**:
  - 구현 전 계획 검증
  - 아키텍처 패턴 분석
  - 멀티 위치 탐색

### 4. typescript-enforcer
- **용도**: TypeScript 사용 강제 및 타입 안전성 유지
- **자동 활성화**:
  - 새 코드 작성 시
  - 기존 코드 수정 시
  - JavaScript 파일 감지 시
- **기능**:
  - TypeScript best practices 검토
  - `any` 타입 사용 검사
  - 타입 안전성 표준 준수

### 5. test-runner (built-in)
- **용도**: 기존 테스트 실행 및 검증
- **사용 시기**:
  - 코드 변경 후 테스트 실행
  - CI/CD 파이프라인 검증
  - E2E/통합 테스트 실행
- **지원 프레임워크**: Jest, Vitest, Playwright

---

## Custom Agents (4개)

### 1. scss-styling-expert
```yaml
name: scss-styling-expert
model: opus
color: purple
lines: 103
```

**전문 분야**:
- SCSS 스타일링 구현
- HiStudy 템플릿 아키텍처 유지
- 다크/라이트 모드 호환성
- 크로스브라우저 지원
- 반응형 디자인

**자동 활성화**:
- SCSS 파일 수정 요청
- 스타일 관련 작업
- UI/UX 개선 요청

**사용 예시**:
```
"학생 대시보드에 카드 컴포넌트 스타일 추가해줘"
"scss-styling-expert로 반응형 레이아웃 구현해줘"
```

**특징**:
- `/public/scss/` 파일 작업 (compiled CSS 건드리지 않음)
- Bootstrap 5 기반
- 테이블 정렬 표준 (text left, numbers right, actions center)
- WCAG 접근성 준수

---

### 2. test-architect
```yaml
name: test-architect
model: opus
color: green
lines: 290
```

**전문 분야**:
- 테스트 전략 설계
- Runtime validation (Zod/Valibot)
- Property-based testing (fast-check)
- Contract testing
- Test data builders

**자동 활성화**:
- 테스트 전략 필요 시
- 새로운 기능 테스트 설계
- 취약한 테스트 리팩토링

**사용 예시**:
```
"courseDataMapper 함수 테스트 작성해줘"
"test-architect로 결제 모듈 테스트 설계해줘"
```

**테스트 우선순위**:
1. Error handling (highest)
2. Money & data integrity
3. Edge cases
4. Integration contracts
5. Performance boundaries
6. Snapshots (lowest)

**DVS-TEMPLATE01 전용 가이드**:
- Server Actions 테스트 (80%+ coverage)
- Supabase mocking 패턴
- NextAuth session mocking
- 150+ lines의 프로젝트 전용 지침 포함

---

### 3. test-runner (custom)
```yaml
name: test-runner
model: opus
lines: 374
```

**전문 분야**:
- 테스트 실행 및 검증
- 실패 분석 및 디버깅
- 테스트 리포트 생성
- CI/CD 통합

**Built-in test-runner와 차이**:
- 더 상세한 리포팅
- 프로젝트 맞춤 디버깅 워크플로우
- DVS-TEMPLATE01 전용 설정

**사용 예시**:
```
"test-runner로 모든 테스트 실행해줘"
"E2E 테스트 결제 플로우 실행해줘"
```

---

### 4. typescript-migrator
```yaml
name: typescript-migrator
model: opus
color: red
lines: 153
```

**전문 분야**:
- **PROACTIVE** JavaScript → TypeScript 마이그레이션
- 자동 개입 (JavaScript 파일 감지 시)
- 100% TypeScript 채택 강제
- 타입 안전성 보장

**자동 활성화** (즉시 개입):
- JavaScript/JSX 파일 수정 시
- 새 파일 생성 시 (.js 대신 .ts 강제)
- Import에서 .js/.jsx 참조 감지
- 타입 없는 코드 발견 시

**사용 예시**:
```
"AssignmentModal.js를 TypeScript로 변환해줘"
"typescript-migrator로 남은 JS 파일들 변환해줘"
```

**마이그레이션 전략**:
- Bottom-up (의존성 없는 파일부터)
- Dependency tree 분석
- Phase별 진행 (Utils → Server Actions → Components → Routes)
- 즉시 검증 (`typecheck`, `build`)

**강제 규칙**:
- 새 파일 = 무조건 `.ts/.tsx`
- `any` 타입 = `TODO(ANY-TODO #issue)` 태그 필수
- 수정 전 TypeScript 변환 필수
- 검증 통과 전 다음 파일 진행 불가

---

## 사용 방법

### 1. 자동 호출 (Automatic Delegation)

Claude Code가 작업 내용을 분석해서 자동으로 agent 선택:

```
사용자: "학생 대시보드 스타일 개선해줘"
→ scss-styling-expert 자동 선택

사용자: "새 API 엔드포인트 추가해줘"
→ typescript-migrator 자동 개입 (.ts 파일 강제)

사용자: "결제 로직 테스트 작성해줘"
→ test-architect 자동 선택
```

**자동 매칭 기준**:
- Agent의 `description` 필드
- 현재 컨텍스트 (파일 타입, 작업 내용)
- 필요한 도구들

### 2. 명시적 호출 (Explicit Invocation)

Agent 이름을 직접 언급:

```
"scss-styling-expert를 사용해서 반응형 네비게이션 구현해줘"
"test-runner로 전체 테스트 실행해줘"
"typescript-migrator로 components/ 폴더 전부 변환해줘"
"Plan 에이전트로 work-plan 검증해줘"
```

### 3. 실제 사용 시나리오

#### 시나리오 A: 새 기능 구현
```
사용자: "강의 등록 폼 만들어줘"

Claude 내부 프로세스:
1. typescript-migrator 자동 개입
   → CourseRegistrationForm.tsx 생성 (not .jsx)
2. scss-styling-expert 자동 선택
   → course-registration.scss 생성
3. test-architect 제안
   → "테스트도 작성할까요?"

결과:
✅ TypeScript 컴포넌트
✅ SCSS 스타일
✅ 타입 정의 (Zod schema)
✅ 테스트 (선택)
```

#### 시나리오 B: TypeScript 마이그레이션
```
사용자: "AssignmentModal.js 수정해줘"

typescript-migrator 즉시 개입:
⚠️ "먼저 TypeScript로 변환하겠습니다"
1. AssignmentModal.tsx 생성
2. Props/State 타입 정의
3. Event handler 타입 추가
4. typecheck 검증
5. 원본 .js 삭제

이후 수정 진행
```

#### 시나리오 C: 테스트 작성
```
사용자: "test-architect로 courseActions 테스트 설계해줘"

test-architect 활성화:
1. 테스트 전략 수립
   - Server Actions 우선순위 1
   - Supabase mocking 패턴
   - Error handling 중점
2. 테스트 파일 구조 설계
   - courseActions.success.test.ts
   - courseActions.errors.test.ts
3. Test data builder 생성
4. Contract test 작성

완료 후 test-runner로 실행 제안
```

---

## Agents vs Memory Files

| 측면 | Memory Files | Agent Files |
|------|--------------|-------------|
| **목적** | 프로젝트 컨텍스트/규칙 | 전문 작업 실행 |
| **스타일** | Bullet points, 간결 | Narrative ("You are...") |
| **로딩** | 항상 메인 컨텍스트 로드 | 호출 시 별도 컨텍스트 |
| **형식** | 룰/커맨드 빠른 참조 | System prompt (full context) |
| **위치** | `CLAUDE.md`, `modules/` | `.claude/agents/` |
| **최적화** | ✅ 간결함 추구 | ❌ 상세함 필수 |

### 왜 Agent는 Narrative 스타일인가?

Agents는 **새로운 Claude instance**를 생성하므로:
- 역할 정의 필요 ("You are an elite test architect...")
- 전체 컨텍스트 제공 필요 (examples, methodology)
- System instructions로 작동
- Bullet points만으로는 충분한 컨텍스트 불가

### 공식 권장사항

> "Include specific instructions, examples, and constraints in your system prompts. **The more guidance you provide, the better the subagent will perform**"
>
> — Claude Code Official Documentation

**결론**: Agent 파일은 메모리 원칙(간결함)을 따르면 안 됨.

---

## 파일 관리

### 위치
```
.claude/
└── agents/
    ├── scss-styling-expert.md
    ├── test-architect.md
    ├── test-runner.md
    └── typescript-migrator.md
```

### YAML Front-matter 구조
```yaml
---
name: agent-name           # 호출 시 사용하는 이름
description: |             # 자동 매칭에 사용
  Use this agent when you need to...
  Examples: <example>...</example>
model: opus               # sonnet, opus, haiku
color: purple             # 식별용 색상 (선택)
---

You are the [Role Name]...
[Narrative-style system prompt]
```

### 작성 원칙

#### DO ✅
- Narrative 스타일 유지 ("You are...")
- 상세한 instructions, examples, constraints 포함
- 명확한 description (자동 매칭용)
- Code blocks로 패턴 예시 제공
- PROACTIVE 키워드 (자동 개입 필요 시)

#### DON'T ❌
- Bullet-point 스타일로 축약 (메모리 원칙 적용 금지)
- Description 생략
- 예시 제거 (LLM 패턴 학습에 필수)
- 과도한 최적화 (효과 감소)

### 최적화 금지 원칙

**공식 증거**:
1. 공식 문서: "더 많은 가이드 = 더 나은 성능"
2. 커뮤니티 표준: 100개+ agents 모두 narrative 스타일
3. 기술적 이유: System instructions로 동작 (별도 Claude instance)

**커스텀 agents 현황**:
- ✅ Claude Code가 생성한 프롬프트
- ✅ Best practices 준수
- ✅ 적절한 길이 (평균 150-200 lines)
- ✅ 수정 불필요

---

## Best Practices

### 1. 명확한 요청
```
❌ "스타일 좀 바꿔줘"
✅ "scss-styling-expert로 대시보드 카드 반응형 스타일 구현해줘"
```

### 2. 적절한 Agent 선택
- **설계/전략** → test-architect, Plan
- **실행/검증** → test-runner, Explore
- **스타일** → scss-styling-expert
- **타입 안전성** → typescript-migrator, typescript-enforcer

### 3. 자동 vs 명시적
- **일반 작업**: 자동 호출에 맡기기
- **확실한 작업**: 명시적 호출로 정확도 향상
- **복잡한 워크플로우**: 여러 agent 순차 호출

### 4. Proactive Agents 활용
- typescript-migrator는 자동 개입 설계됨
- JavaScript 파일 수정 시 자동으로 TypeScript 변환
- 별도 요청 없이 "Touch It, Type It" 원칙 준수

---

## 참고 자료

- [Work Plan Guide](../workflows/work-plan-guide.md)
- [Development Guide](../../modules/development-guide.md)
- [Claude Code Official Docs](https://code.claude.com/docs)

---

**마지막 업데이트**: 2025-11-17
**관리자**: DVS-TEMPLATE01 Team
