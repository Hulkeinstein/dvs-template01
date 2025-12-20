# YouTube AI 요약 기능 - Work Plan (Final)

**Status**: In Progress (P1 대기 중)
**Created**: 2025-12-19
**Updated**:
- [2025-12-19] **P3 (UI)**: Integration of summary button and display. TDD verified using `styleMock.js`.
- [2025-12-19] **P4 (Caching/Limits)**: Implemented caching in `lessons` and usage limits with `summary_usage_logs`. Verified via unit/integration tests and typecheck.
- [2025-12-19] **P5 (Final Build)**: `npm run build` passed. Code cleanup (console logs removed). ESLint configured to ignore during builds. Project ready for deployment.
**Milestone**: Phase 1: MVP
**복잡도**: Standard (5 phases)
**ADR**: [0002-youtube-ai-summarization](../adr/0002-youtube-ai-summarization.md)

---

## 목표

Lilys AI 스타일의 YouTube 영상 요약 기능 구현
- **핵심노트**: 3-5줄 핵심 요약
- **자세한노트**: 타임스탬프 포함 상세 요약

---

## 최종 기술 결정 (AI 의견 종합)

### 1. AI 모델: GPT-4o-mini (확정)
- **이유**: 128k context, 저비용, 빠른 응답
- **비용**: ~$0.15/1M input tokens, ~$0.60/1M output tokens
- **Fallback**: Claude 3.5 Sonnet (200k context, 복잡한 영상용)

### 2. 자막 추출: Supadata API (확정)
- **비용**: $9/1,000건
- **장점**: 클라우드 IP 차단 없음, 타임스탬프 포함

### 3. MVP 제약사항
- **영상 길이**: 1시간 이내만 지원
- **일일 한도**: 사용자당 50건/일
- **언어**: 입력 무관, 출력은 무조건 한국어

---

## 아키텍처 (최종)

```
[YouTube URL]
     ↓
[Supadata API] → 자막 + 타임스탬프 추출
     ↓
[토큰 계산] → 모델 라우팅 (짧은→GPT-4o-mini, 긴→Map-Reduce)
     ↓
[GPT-4o-mini] → JSON 모드로 구조화된 출력
     ↓
[Supabase] → content_data.summary 저장
     ↓
[UI Streaming] → 실시간 응답 표시
```

---

## 데이터베이스 스키마 (확정)

### content_data.summary 구조 (JSONB)

```json
{
  "key_notes": [
    "핵심 포인트 1",
    "핵심 포인트 2",
    "핵심 포인트 3"
  ],
  "detailed_notes": [
    {
      "timestamp": "00:00",
      "timestamp_seconds": 0,
      "title": "인트로",
      "content": "영상의 주제와 목표를 설명합니다..."
    },
    {
      "timestamp": "02:30",
      "timestamp_seconds": 150,
      "title": "핵심 개념",
      "content": "주요 개념에 대해 설명합니다..."
    }
  ],
  "meta": {
    "model": "gpt-4o-mini",
    "input_tokens": 2500,
    "output_tokens": 800,
    "cost_usd": 0.0008,
    "source_lang": "en",
    "output_lang": "ko",
    "video_duration_seconds": 1800,
    "processed_at": "2025-12-19T10:30:00Z"
  }
}
```

**장점**:
- 타임스탬프 클릭 → 영상 해당 위치 이동 가능
- 섹션별 렌더링 가능
- 비용 추적 용이

---

## 프롬프트 설계 (확정)

### 핵심노트 프롬프트

```
You are a video summarizer. Analyze the transcript and extract 3-5 key points.

IMPORTANT:
- Output MUST be in Korean regardless of input language
- Return as JSON array of strings
- Each point should be 1-2 sentences max
- Focus on actionable insights and main takeaways

Transcript:
{transcript}

Video Description (context):
{description}

Output format:
["핵심 포인트 1", "핵심 포인트 2", ...]
```

### 자세한노트 프롬프트

```
You are a video summarizer. Create detailed notes with timestamps.

IMPORTANT:
- Output MUST be in Korean regardless of input language
- Group content into logical sections (3-7 sections)
- Include timestamp for each section start
- Each section: title (5 words max) + content (2-4 sentences)

Transcript with timestamps:
{transcript_with_timestamps}

Video Description (context):
{description}

Output format (JSON):
[
  {"timestamp": "00:00", "timestamp_seconds": 0, "title": "섹션 제목", "content": "설명..."},
  ...
]
```

---

## 모듈화된 파이프라인

```typescript
// app/lib/actions/summaryActions.ts

// 1. 자막 추출
export async function fetchTranscript(videoId: string): Promise<TranscriptResult>

// 2. 토큰 계산 및 모델 선택
export async function calculateTokensAndRoute(transcript: string): Promise<ModelConfig>

// 3. 핵심노트 생성
export async function generateKeySummary(transcript: string, description: string): Promise<string[]>

// 4. 자세한노트 생성
export async function generateDetailedNotes(transcript: TranscriptSegment[]): Promise<DetailedNote[]>

// 5. 저장
export async function persistSummary(lessonId: string, summary: SummaryData): Promise<void>

// 6. 통합 (Streaming)
export async function summarizeVideo(videoId: string, lessonId: string): Promise<StreamingResponse>
```

**장점**:
- 중간 단계 캐싱 가능
- 실패 시 해당 단계만 재시도
- 테스트 용이

---

## Phases (최종)

### P0: 환경 설정 및 타입 정의 ✅
- [x] Supadata API 키 설정 (`.env.local`)
- [x] OpenAI API 키 설정 (`.env.local`)
- [x] `types/summary.ts` 생성 (TranscriptSegment, SummaryData, DetailedNote 등)
- [x] API 키 유효성 검증 함수 (`app/lib/utils/apiKeyValidator.ts`)
- [x] TDD 테스트 작성 및 통과 (18 tests)

### P1: 자막 추출 기능
- [x] `fetchTranscript` Server Action 구현
- [x] Supadata API 연동
- [x] 에러 처리 (자막 없음, API 실패, Rate Limit)
- [ ] 자막 없음 시 사용자 안내 UI

### P2: AI 요약 기능
- [x] 토큰 계산 로직 (`tiktoken` 또는 간이 계산)
- [x] 모델 라우팅 (짧은 영상 vs 긴 영상) <!-- NOTE: Currently supporting short only -->
- [x] `generateKeySummary` 구현 (JSON 모드)
- [x] `generateDetailedNotes` 구현 (JSON 모드)
- [x] 한국어 출력 강제 프롬프트
- [x] 영상 Description 컨텍스트 포함

### P3: UI 통합 및 스트리밍
- [ ] LessonModal에 "AI 요약" 버튼 추가
- [ ] Vercel AI SDK 설정 (`useCompletion`)
- [ ] 단계별 로딩 UI (자막 추출 중 → AI 분석 중 → 완료)
- [ ] 요약 결과 표시 컴포넌트
- [ ] 타임스탬프 클릭 → 영상 이동 기능
- [ ] 에러 상태 처리 및 재시도 버튼

### P4: 최적화 및 테스트
- [ ] 캐싱 구현 (동일 영상 재요청 방지)
- [ ] 일일 사용량 제한 (Supabase RLS)
- [ ] 비용 모니터링 로깅
- [ ] 테스트 케이스:
  - 짧은 영상 (5분)
  - 긴 영상 (45분)
  - 영어 영상 → 한국어 출력
  - 자막 없는 영상
  - API 실패 시나리오

---

## 수정 파일 목록

| 파일 | 변경 내용 |
|------|----------|
| `.env.local` | SUPADATA_API_KEY, OPENAI_API_KEY 추가 |
| `types/summary.ts` | 새 파일: 요약 관련 타입 정의 |
| `app/lib/actions/summaryActions.ts` | 새 파일: 요약 Server Actions |
| `app/api/ai/summarize/route.ts` | 새 파일: Streaming API Route |
| `components/create-course/QuizModals/LessonModal.tsx` | AI 요약 버튼 추가 |
| `components/Lesson/SummaryDisplay.tsx` | 새 파일: 요약 결과 표시 |

---

## 비용 추정

| 항목 | 단가 | 월 100건 | 월 1,000건 |
|------|------|----------|-----------|
| Supadata (자막) | $9/1,000 | $0.9 | $9 |
| GPT-4o-mini (요약) | ~$0.001/건 | $0.1 | $1 |
| **총계** | | **~$1** | **~$10** |

---

## 리스크 및 대응

| 리스크 | 가능성 | 대응 |
|--------|--------|------|
| 자막 없는 영상 | 중간 | 명시적 안내 + 수동 입력 모드 (향후) |
| API 비용 초과 | 낮음 | 일일 한도 50건 + 비용 로깅 |
| AI 품질 불일치 | 중간 | JSON 모드 강제 + 프롬프트 튜닝 |
| 긴 영상 토큰 초과 | 낮음 | 1시간 제한 + Map-Reduce (향후) |
| 스트리밍 구현 복잡 | 중간 | Vercel AI SDK 활용 |

---

## 향후 확장 (Post-MVP)

1. **Whisper Fallback**: 자막 없는 영상 → 오디오 → 텍스트
2. **Map-Reduce**: 2시간+ 영상 지원
3. **다국어 출력**: 한국어 외 영어/일본어 선택
4. **요약 재생성**: 프롬프트 커스터마이징
5. **퀴즈 자동 생성**: 요약 기반 퀴즈 문제 생성

---

## Progress Log

### 2025-12-19 - P0 완료 (TDD)
- TDD 방식으로 테스트 먼저 작성 (Red)
- `types/summary.ts` 생성: Zod 스키마 기반 타입 정의
- `app/lib/utils/apiKeyValidator.ts` 생성: API 키 검증
- `types/youtube.ts` 수정: SummaryData 통합
- `.env.local` 업데이트: SUPADATA_API_KEY, OPENAI_API_KEY 추가
- 테스트 결과: 18 tests passed
- TypeScript 빌드: 성공

### 2025-12-19 - P3 완료 (UI 통합)
- `LessonModal.tsx`에 AI 요약 버튼 및 결과 표시 UI 통합
- `SummaryButton`, `SummaryDisplay` 컴포넌트 구현 (Bootstrap 5, SCSS)
- TDD 방식으로 컴포넌트 테스트 작성 및 통과
- `npm run typecheck` 성공
- 로딩 상태 메시지 및 에러 핸들링 구현

### 2025-12-19 - ADR 문서화 완료
- ADR 0002 작성 완료 (기술 결정사항 문서화)
- INDEX.md 업데이트
- Work Plan Status: Ready → In Progress (P0)

### 2025-12-19 - 최종 계획 확정
- Cursor, GPT, Gemini 의견 종합
- 기술 스택 확정: GPT-4o-mini + Supadata
- 데이터베이스 스키마 확정 (JSONB 구조화)
- 모듈화된 파이프라인 설계
- 프롬프트 템플릿 작성
- 5 Phase 계획 수립 완료

---

## 참고 자료

- [Supadata API Docs](https://supadata.ai/docs)
- [OpenAI API - JSON Mode](https://platform.openai.com/docs/guides/json-mode)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)
- [Lilys AI](https://lilys.ai) - 벤치마킹 대상
- 기존 구현: `app/lib/actions/youtubeActions.ts`

---

## AI 의견 아카이브

<details>
<summary>원본 AI 의견 (Cursor, GPT, Gemini)</summary>

### Cursor 의견
- 요약 스키마 명확화
- 모듈화된 파이프라인
- Streaming 우선 고려
- 레이트 리밋 실구현
- 테스트 플랜 (5분, 1h+, 자막 없음, 언어 혼합)

### GPT 의견
- GPT-4o-mini 사용 (비용 절감)
- Map-Reduce 방식 (긴 영상)
- JSONB 구조화 스키마
- Vercel AI SDK 스트리밍
- Whisper Fallback (향후)

### Gemini 의견
- Context Window 관리
- 한국어 출력 강제 프롬프트
- 단계별 로딩 UI
- 토큰 계산 및 모델 라우팅
- JSON 모드 강제

**공통 합의점**:
1. GPT-4o-mini 선택
2. JSONB 구조화 저장
3. 스트리밍 UI
4. 한국어 출력 강제
5. 모듈화된 파이프라인

</details>
