---
title: "0002. YouTube AI Summarization Tech Stack"
tags:
  - type/docs
  - phase/1
  - component/youtube
  - external/openai
  - external/supadata
created: 2025-12-19
updated: 2025-12-19
lifecycle: active
---

# 0002. YouTube AI Summarization Tech Stack

**Date**: 2025-12-19
**Status**: Accepted
**Deciders**: @Hulkeinstein, AI Assistants (Cursor, GPT-4, Gemini 3)

## Context

DVS-TEMPLATE01 LMS 플랫폼에 YouTube 영상 AI 요약 기능을 추가해야 합니다. 사용자가 YouTube 강의 영상을 등록하면, AI가 자동으로 요약을 생성하여 학습 효율을 높이는 것이 목표입니다.

**요구사항**:
- Lilys AI 스타일의 두 가지 요약 형식:
  - **핵심노트**: 3-5줄 핵심 요약
  - **자세한노트**: 타임스탬프 포함 상세 요약
- 한국어 출력 필수 (입력 언어 무관)
- MVP 비용 월 $10 이내

**제약사항**:
- Vercel 클라우드 환경 배포 (IP 차단 이슈)
- 기존 lessons 테이블 구조 활용
- Solo developer + AI 협업 개발

## Decision Drivers

- **MVP 빠른 구현**: 최소한의 설정으로 빠르게 동작
- **비용 최소화**: 월 $10 이내 운영
- **클라우드 호환성**: Vercel/Railway 등 클라우드 환경에서 안정적 동작
- **한국어 품질**: 자연스러운 한국어 요약 생성
- **확장성**: 향후 긴 영상, 다국어 지원 가능

## Considered Options

### AI 모델 선택

- **Option 1**: GPT-4 (gpt-4-turbo)
- **Option 2**: GPT-4o-mini
- **Option 3**: Claude 3.5 Sonnet
- **Option 4**: Gemini 1.5 Pro

### 자막 추출 API

- **Option A**: youtube-transcript (오픈소스)
- **Option B**: Supadata API
- **Option C**: RapidAPI YouTube Transcript

### 데이터 저장 방식

- **Option X**: 별도 summaries 테이블
- **Option Y**: lessons.content_data JSONB 필드 확장
- **Option Z**: 외부 저장소 (S3, etc.)

## Decision Outcome

### AI 모델: GPT-4o-mini (Option 2)

**선택 이유**:
- 128k context window로 1시간 영상 자막 충분히 처리
- 저비용: ~$0.15/1M input, ~$0.60/1M output tokens
- JSON 모드 지원으로 구조화된 출력 보장
- 한국어 생성 품질 우수

**Fallback**: Claude 3.5 Sonnet (200k context, 복잡한 영상용 - 향후 고려)

### 자막 추출: Supadata API (Option B)

**선택 이유**:
- 클라우드 IP 차단 없음 (가장 중요)
- 타임스탬프 포함 응답
- $9/1,000건으로 합리적인 비용
- 간단한 REST API

### 데이터 저장: JSONB 확장 (Option Y)

**선택 이유**:
- 기존 lessons 테이블 재사용 (스키마 변경 최소화)
- content_data.summary 필드로 구조화
- 유연한 스키마 확장 가능

### Positive Consequences

- 월 운영비 ~$10 (목표 달성)
- 클라우드 환경에서 안정적 동작
- 빠른 MVP 구현 가능 (3-5일)
- 기존 코드베이스와 자연스러운 통합

### Negative Consequences

- OpenAI API 의존성 증가
- Supadata API 장애 시 서비스 영향
- 2시간+ 긴 영상 미지원 (MVP 제약)

## Pros and Cons of the Options

### Option 1: GPT-4 (gpt-4-turbo)

- ✅ Good, because 최고 성능의 요약 품질
- ✅ Good, because 128k context window
- ❌ Bad, because 비용이 GPT-4o-mini 대비 10배 이상
- ❌ Bad, because MVP 단계에 과도한 스펙

### Option 2: GPT-4o-mini

- ✅ Good, because 128k context (1시간 영상 충분)
- ✅ Good, because 매우 저렴 (~$0.001/요청)
- ✅ Good, because JSON 모드 지원
- ✅ Good, because 빠른 응답 속도
- ❌ Bad, because GPT-4 대비 약간 낮은 품질 (MVP에 충분)

### Option 3: Claude 3.5 Sonnet

- ✅ Good, because 200k context (더 긴 영상 가능)
- ✅ Good, because 한국어 품질 우수
- ❌ Bad, because 비용이 GPT-4o-mini 대비 높음
- ❌ Bad, because JSON 모드 미지원 (프롬프트로 보완 필요)

### Option 4: Gemini 1.5 Pro

- ✅ Good, because 1M+ context window
- ✅ Good, because 무료 티어 존재
- ❌ Bad, because 한국어 품질 불안정
- ❌ Bad, because API 안정성 이슈 보고됨

### Option A: youtube-transcript (OSS)

- ✅ Good, because 무료
- ✅ Good, because 직접 제어 가능
- ❌ Bad, because **클라우드 IP 차단 빈번** (치명적)
- ❌ Bad, because YouTube 정책 변경에 취약

### Option B: Supadata API

- ✅ Good, because 클라우드 IP 차단 없음
- ✅ Good, because 타임스탬프 포함
- ✅ Good, because 안정적인 서비스
- ❌ Bad, because 유료 ($9/1,000건)

### Option C: RapidAPI YouTube Transcript

- ✅ Good, because 다양한 옵션
- ❌ Bad, because 설정 복잡
- ❌ Bad, because 가격 불투명
- ❌ Bad, because 품질 보장 어려움

## Implementation Notes

### 데이터베이스 스키마 (content_data.summary)

```json
{
  "key_notes": [
    "핵심 포인트 1",
    "핵심 포인트 2"
  ],
  "detailed_notes": [
    {
      "timestamp": "00:00",
      "timestamp_seconds": 0,
      "title": "인트로",
      "content": "영상의 주제와 목표를 설명합니다..."
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

### MVP 제약사항

| 제약 | 값 | 이유 |
|------|-----|------|
| 영상 길이 | 1시간 이내 | 토큰 제한, 비용 관리 |
| 일일 한도 | 50건/사용자 | 비용 관리 |
| 출력 언어 | 한국어 고정 | MVP 단순화 |

### 환경 변수

```bash
SUPADATA_API_KEY=xxx
OPENAI_API_KEY=xxx
```

### 비용 추정 (월간)

| 항목 | 단가 | 100건 | 1,000건 |
|------|------|-------|---------|
| Supadata | $9/1,000 | $0.9 | $9 |
| GPT-4o-mini | ~$0.001/건 | $0.1 | $1 |
| **합계** | | ~$1 | ~$10 |

## Links

- [Work Plan]: [../work-plans/youtube-ai-summarization.md](../work-plans/youtube-ai-summarization.md)
- [YouTube Actions]: [../../app/lib/actions/youtubeActions.ts](../../app/lib/actions/youtubeActions.ts)
- [Supadata Docs]: https://supadata.ai/docs
- [OpenAI JSON Mode]: https://platform.openai.com/docs/guides/json-mode
- [Lilys AI]: https://lilys.ai (벤치마킹 대상)

---

## Metadata

**Status Changes**:
- 2025-12-19: Proposed
- 2025-12-19: Accepted (AI 의견 종합 후 확정)

**Related Decisions**:
- Related to: [0001 - Record Architecture Decisions](./0001-record-architecture-decisions.md)
