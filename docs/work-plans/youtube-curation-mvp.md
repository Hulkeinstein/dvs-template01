# YouTube 큐레이션 플랫폼 MVP - Work Plan

**Status:** Active
**Created:** 2025-12-18
**Last Updated:** 2025-12-18 17:30
**복잡도:** Standard
**예상 시간:** 3-4일 (완료 임박)

---

## Overview

**목표:** YouTube 영상을 큐레이션하여 체계적인 AI 학습 강좌 제공
**첫 번째 강좌:** AI 관련 (Claude, GPT, AI 활용법 등)
**타겟:** YouTube로 공부하지만 체계적 커리큘럼이 필요한 학습자

---

## 현재 상태 분석

### 기존 DB 스키마 (활용 가능) ✅

| 테이블 | 필드 | YouTube 지원 |
|--------|------|-------------|
| `lessons` | `video_url` | ✅ YouTube URL 저장 |
| `lessons` | `video_source` | ✅ 'youtube' 구분 |
| `lessons` | `content_data` (JSONB) | ✅ 메타데이터 확장 |
| `lessons` | `thumbnail_url` | ✅ 썸네일 |
| `lessons` | `duration_minutes` | ✅ 영상 길이 |
| `lesson_progress` | `watch_time_seconds` | ✅ 시청 시간 |
| `lesson_progress` | `completed` | ✅ 완료 여부 |

**결론:** 새 테이블 불필요, 기존 스키마 활용

### 기존 컴포넌트 (수정/확장)

| 컴포넌트 | 파일 경로 | 현재 상태 |
|---------|----------|----------|
| 레슨 생성 모달 | `components/create-course/QuizModals/LessonModal.tsx` | ✅ YouTube URL 입력 지원 |
| 비디오 플레이어 | `components/Lesson/LessonVideo.js` | ✅ YouTube 자동 감지/임베드 |
| 레슨 시청 페이지 | `app/(courses)/(lessons)/lesson/[id]/LessonContent.js` | ✅ 레슨 데이터 로드 |
| 레슨 구조화 | `components/create-course/lesson/Lesson.tsx` | ✅ DnD, CRUD |

---

## Phases

- [x] **P0:** 환경 설정 및 타입 정의
- [x] **P1:** YouTube 메타데이터 자동 추출 (oEmbed API)
- [x] **P2:** 레슨 생성 폼 개선 (YouTube 특화, Shorts 지원 확인)
- [x] **P3:** 크리에이터 정보 표시 컴포넌트 (검증 완료)
- [x] **P4:** 진도 체크 시스템 (완료 버튼, 로직 검증 완료)
- [x] **P5:** 플레이어 개선 (검은 바 제거, 반응형, nocookie 적용 확인)
- [ ] **P6:** 검증 및 테스트 (기능 테스트 완료, 최종 빌드 대기)

---

## 상세 구현 계획 (Revised)

### P0: 환경 설정 및 타입 정의

**목표:** YouTube 관련 타입과 강력한 URL 파싱 유틸리티 구축

**주요 고려사항 (Cursor Integration):**
- **URL 파싱 강화:** `youtu.be`, `shorts/`, `v=` 파라미터 등 모든 케이스 커버.
- **타입 안전성:** 엄격한 타입 정의.

**파일 생성:**
```
types/youtube.ts              # YouTube 메타데이터 타입
app/lib/utils/youtube.ts      # YouTube URL 파싱 유틸리티
```

**app/lib/utils/youtube.ts:**
```typescript
// 정규식 테스트 케이스:
// - https://www.youtube.com/watch?v=VIDEO_ID
// - https://youtu.be/VIDEO_ID
// - https://www.youtube.com/shorts/VIDEO_ID
// - https://m.youtube.com/watch?v=VIDEO_ID
export function extractYouTubeId(url: string): string | null

// 유효성 검사
export function isValidYouTubeUrl(url: string): boolean

// 썸네일 생성 (hqdefault 등 품질 옵션)
export function getYouTubeThumbnail(videoId: string, quality?: 'default' | 'hq' | 'maxres'): string
```

**체크리스트:**
- [ ] `types/youtube.ts` 생성
- [ ] `app/lib/utils/youtube.ts` 생성 (정규식/유닛테스트 강화)
- [ ] TypeScript 빌드 확인

---

### P1: YouTube 메타데이터 자동 추출 (하이브리드 API 전략)

**목표:** YouTube URL로 제목, 썸네일, 채널명, **재생시간** 자동 추출

**API 전략: 하이브리드 (현업 표준)**

```
URL 입력
    ↓
[1단계: oEmbed API] ← 무제한, API Key 불필요
    ↓
제목, 썸네일, 채널명 자동 채움
    ↓
[2단계: YouTube Data API v3] ← 필요시만, 할당량 절약
    ↓
Duration만 추가 요청 (1 unit/video)
```

| API | 용도 | API Key | 할당량 |
|-----|------|---------|--------|
| oEmbed | 제목, 썸네일, 채널명 | ❌ 불필요 | 무제한 |
| Data API v3 | **Duration만** | ✅ 필요 | 10,000 units/day |

**Graceful Degradation:**
- API Key 없으면 → Duration 수동 입력 (기존 폼 유지)
- API Key 있으면 → Duration 자동 채움

**환경변수:**
```env
YOUTUBE_API_KEY=your_api_key  # 선택적
```

**app/lib/actions/youtubeActions.ts:**
```typescript
'use server';

import { cache } from 'react';

// 1단계: oEmbed (무료, 무제한)
async function fetchOEmbed(videoId: string) {
  const url = `https://www.youtube.com/oembed?url=https://youtube.com/watch?v=${videoId}&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('oEmbed failed');
  return res.json(); // { title, author_name, author_url, thumbnail_url }
}

// 2단계: Data API (할당량 사용, duration만)
async function fetchDuration(videoId: string): Promise<number | null> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return null; // API Key 없으면 수동 입력

  const url = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=contentDetails&key=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) return null;

  const data = await res.json();
  const duration = data.items?.[0]?.contentDetails?.duration; // ISO 8601
  return duration ? parseDuration(duration) : null;
}

// ISO 8601 → 초 변환 (PT1H2M3S → 3723)
function parseDuration(iso8601: string): number {
  const match = iso8601.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const [, h, m, s] = match;
  return (parseInt(h || '0') * 3600) + (parseInt(m || '0') * 60) + parseInt(s || '0');
}

// 통합 메타데이터 추출
export async function fetchYouTubeMetadata(
  youtubeUrl: string
): Promise<{ success: boolean; data?: YouTubeMetadata; error?: string }> {
  // 1. URL → ID 추출
  // 2. oEmbed 호출 (기본 정보)
  // 3. Data API 호출 (duration만, API Key 있을 때)
  // 4. 결합하여 반환
}
```

**체크리스트:**
- [ ] `app/lib/actions/youtubeActions.ts` 생성
- [ ] oEmbed API 연동 (제목, 썸네일, 채널)
- [ ] YouTube Data API v3 연동 (duration만)
- [ ] ISO 8601 duration 파싱 함수
- [ ] Graceful degradation (API Key 없을 때 수동 입력)
- [ ] 에러 핸들링 로직 (404, 429 등)

---

### P2: 레슨 생성 폼 개선

**목표:** UX 중심의 데이터 입력 자동화

**주요 고려사항 (Cursor):**
- **Debounce:** 입력 시 즉시 호출하지 않고 400~600ms 지연.
- **수동 폴백:** 자동 추출 실패 시 사용자가 직접 입력 가능하도록 유지.
- **재시도:** 실패 시 '다시 시도' 버튼 제공.

**수정 파일:** `components/create-course/QuizModals/LessonModal.tsx`

**로직 개선:**
1. **Debounce 적용:** `useDebounce` 훅 또는 `lodash.debounce` 활용.
2. **로딩 인디케이터:** 메타데이터 가져오는 중 스피너 표시.
3. **낙관적 업데이트:** 가능한 경우 즉시 필드 채움.
4. **Duration:** 사용자가 직접 입력 (필수 항목).

**체크리스트:**
- [ ] Debounce 로직 추가
- [ ] 로딩 상태 UI (Spinner)
- [ ] 수동 입력 필드 유지 (실패 대비)
- [ ] 재시도 버튼 구현

---

### P3: 크리에이터 정보 표시 컴포넌트

**목표:** 원작자 존중 및 출처 명시

**주요 고려사항:**
- **보안 (Cursor):** 외부 링크에 `rel="noopener noreferrer"` 필수 적용.

**파일:** `components/Lesson/CreatorInfo.tsx`

**체크리스트:**
- [ ] `CreatorInfo.tsx` 구현
- [ ] 보안 속성(`rel`) 적용 확인
- [ ] LessonContent에 통합

---

### P4: 진도 체크 시스템

**목표:** 직관적인 수동 완료 처리

**주요 고려사항 (Cursor):**
- **낙관적 UI:** 서버 응답 대기 없이 UI 먼저 업데이트(체크 표시).
- **롤백:** 실패 시 다시 체크 해제 및 토스트 에러 메시지.
- **RLS:** Supabase Row Level Security 권한 확인.

**파일:** `components/Lesson/LessonCompleteButton.tsx`

**체크리스트:**
- [ ] 낙관적 UI 상태 관리 로직 (`useOptimistic` 등) 구현
- [ ] 실패 시 롤백 처리
- [ ] Supabase RLS 정책 확인 (내 진도만 수정 가능)

---

### P5: 플레이어 개선

**목표:** 몰입감 있는 시청 경험 및 프라이버시

**주요 고려사항 (Cursor & Antigravity):**
- **프라이버시:** `youtube-nocookie.com` 도메인 사용 고려.
- **반응형 (Antigravity):** 16:9 비율 유지, 무리한 Crop 지양.
- **보안:** `AllowScriptAccess="always"` 등 불필요한 속성 제거.

**파일:**
- `components/Lesson/LessonVideo.tsx`
- `public/scss/template/_youtube-player.scss` ← **경로 수정 (custom → template)**

**체크리스트:**
- [ ] TSX 변환 및 옵션 적용 (`rel=0`, `modestbranding=1`, `autoplay=0`)
- [ ] `youtube-nocookie.com` 도메인 적용 테스트
- [ ] 반응형 스타일 (모바일/데스크탑)

---

### P6: 검증 및 테스트 (Cursor Revised)

**테스트 시나리오 확장:**
1. **URL 케이스:** `youtu.be`, `shorts`, `m.youtube.com`, `?t=timestamp` 포함 URL 테스트.
2. **네트워크 지연:** 브라우저 스로틀링 상태에서 로딩 UI 및 타임아웃 처리 확인.
3. **모바일 뷰:** 모바일 가로/세로 모드에서 플레이어 비율 및 오버플로우 확인.
4. **에러 케이스:** 존재하지 않는 ID, 비공개 영상 입력 시 적절한 피드백 표시 확인.

---

## 수정 파일 요약

### 신규 생성 (9개)
| 파일 | 설명 |
|------|------|
| `types/youtube.ts` | YouTube 타입 정의 |
| `app/lib/utils/youtube.ts` | YouTube URL 유틸리티 |
| `app/lib/actions/youtubeActions.ts` | YouTube 메타데이터 Server Action |
| `app/lib/actions/progressActions.ts` | **레슨 진도 Server Action (신규)** |
| `components/Lesson/CreatorInfo.tsx` | 크리에이터 정보 컴포넌트 |
| `components/Lesson/LessonCompleteButton.tsx` | 완료 버튼 컴포넌트 |
| `public/scss/template/_youtube-player.scss` | **YouTube 플레이어 스타일 (경로 수정)** |
| `supabase/migrations/YYYYMMDD_youtube_unique_index.sql` | **중복 방지 인덱스** |
| `supabase/migrations/YYYYMMDD_lesson_progress_rls.sql` | **lesson_progress RLS 정책 (신규)** |

### 수정 (3개)
| 파일 | 변경 내용 |
|------|----------|
| `components/create-course/QuizModals/LessonModal.tsx` | YouTube 메타데이터 자동 추출 |
| `components/Lesson/LessonVideo.js` → `.tsx` | TypeScript 변환 + 최적화 |
| `app/(courses)/(lessons)/lesson/[id]/LessonContent.js` | CreatorInfo, 완료 버튼 통합 + **lesson prop 전달 수정**

---

## Progress Log

### 2025-12-18 14:00 - Planning
- 기존 구조 분석 완료
- MVP 범위 확정
- 세부 구현 계획 작성

---


## 다음 단계

P0 완료 후 사용자 승인 필요:
- 선택지: [승인] [수정] [질문] [보류]

---

## Antigravity's Opinion (2025-12-18)

1. **영상 길이(Duration) 제한**: oEmbed API는 영상 길이를 제공하지 않습니다. MVP에서는 **사용자가 수동으로 입력**하도록 유지합니다. (자동화 필요 시 YouTube Data API Key 필요)
2. **다양한 URL 포맷 지원**: `youtu.be` (공유 링크) 및 `shorts/` (쇼츠) URL도 문제없이 인식하도록 정규식(Regex)을 강화해야 합니다.
3. **화면 비율 이슈 (검은 바 제거)**: 검은 바를 없애기 위해 강제로 확대(Crop)하면 자막이 잘릴 위험이 있습니다. 기본은 **16:9 반응형**으로 제한적으로 적용합니다.
4. **자동 완료 확장성**: 추후 YouTube Player API의 이벤트를 통해 '90% 이상 시청 시 자동 완료' 기능을 고려할 수 있습니다.

## Cursor's Opinion (2025-12-18)

1. 데이터 품질: oEmbed 실패 대비해 폼에서 수동 제목/썸네일 입력 유지, 오류 문구는 짧고 즉시 표시.
2. URL 파싱: youtu.be, shorts, watch 파라미터 케이스 모두 커버하는 정규식/유효성 함수 테스트 추가.
3. UX 성능: 메타데이터 fetch는 debounce(400~600ms) + 로딩 인디케이터, 실패 시 재시도 버튼 제공.
4. 임베드 보안: `youtube-nocookie.com` 옵션 고려, autoplay 기본 OFF, `rel="noopener noreferrer"` 준수.
5. 캐싱/쿨다운: 같은 URL 반복 요청 시 캐시된 메타데이터 재사용, 서버 측 429 대비 간단한 백오프.
6. 완료 버튼: 낙관적 UI 업데이트 + 실패 시 롤백/토스트, Supabase RLS 권한 확인.
7. 테스트: 모바일(세로/가로) 임베드 크기, 느린 네트워크에서 썸네일/iframe 지연, 비공개·삭제 영상 에러 플로우 포함.

---

## Claude Code 보완 사항 (ChatGPT 피드백 검토 결과)

**검토일:** 2025-12-18
**검토자:** Claude Code

### 검토 요약

| 항목 | ChatGPT 제안 | 프로젝트 현황 | 조치 |
|------|-------------|--------------|------|
| A. content_data 스키마 | 표준 형태 정의 | 계획에 있음 | ✅ DoD에 명시 |
| B. 중복 방지 | youtube_id 유니크 | ❌ 없음 | ✅ **추가 필요** |
| C. 권한/RLS | 레슨 CRUD 권한 | ✅ 이미 구현됨 | ❌ 불필요 |
| D. YouTube 이용정책 | 운영 정책 섹션 | ❌ 없음 | ✅ 간단히 추가 |
| E. 캐싱 기준 | TTL 명시 | 언급만 | ✅ 구체화 |
| F. DoD | Phase별 완료 기준 | 체크리스트만 | ✅ **추가 필요** |

---

## 보완 1: content_data 저장 스키마 (계약)

YouTube 메타데이터를 `lessons.content_data` JSONB에 저장할 때 **표준 형식**:

```typescript
// lessons.content_data.youtube 구조
interface YouTubeContentData {
  youtube_id: string;           // 필수: 영상 고유 ID
  canonical_url: string;        // 정규화된 URL (watch?v= 형식)
  original_title: string;       // 원본 제목
  channel_name: string;         // 채널명
  channel_url: string;          // 채널 URL
  thumbnail_url: string;        // 썸네일 URL
  duration_seconds: number | null; // 재생시간 (초), API Key 없으면 null
  fetched_at: string;           // ISO 8601 (메타데이터 수집 시점)
}
```

**예시:**
```json
{
  "youtube": {
    "youtube_id": "dQw4w9WgXcQ",
    "canonical_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "original_title": "프롬프트 엔지니어링 기초",
    "channel_name": "AI Academy",
    "channel_url": "https://www.youtube.com/channel/UC...",
    "thumbnail_url": "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    "duration_seconds": 723,
    "fetched_at": "2025-12-18T14:00:00.000Z"
  }
}
```

---

## 보완 2: 중복 방지 규칙

**문제:** 같은 YouTube 영상이 다른 URL 포맷으로 중복 등록될 수 있음
- `https://youtube.com/watch?v=ABC123`
- `https://youtu.be/ABC123`
- `https://youtube.com/shorts/ABC123`

**해결책:** 같은 코스 내 동일 `youtube_id` 중복 방지

### P0에 추가할 마이그레이션:
```sql
-- 같은 코스 내 YouTube 영상 중복 방지 (Partial Unique Index)
CREATE UNIQUE INDEX IF NOT EXISTS idx_lessons_youtube_unique
ON lessons (course_id, (content_data->>'youtube_id'))
WHERE video_source = 'youtube'
  AND content_data->>'youtube_id' IS NOT NULL
  AND deleted_at IS NULL;
```

### 레슨 생성 로직에 검증 추가:
```typescript
// youtubeActions.ts에 추가
export async function checkYoutubeDuplicate(
  courseId: string,
  youtubeId: string
): Promise<boolean> {
  const { data } = await supabase
    .from('lessons')
    .select('id')
    .eq('course_id', courseId)
    .eq('video_source', 'youtube')
    .filter('content_data->youtube_id', 'eq', youtubeId)
    .is('deleted_at', null)
    .single();

  return !!data; // true면 중복
}
```

---

## 보완 3: RLS 정책 확인 (⚠️ lesson_progress RLS 누락)

| 테이블 | 정책 | 상태 |
|--------|------|------|
| `lessons` | Instructors/Admins만 자신의 코스 레슨 CRUD | ✅ 구현됨 |
| `lesson_progress` | 사용자는 자신의 진도만 조회/수정 | ❌ **RLS 없음** |

**⚠️ P4에 lesson_progress RLS 마이그레이션 추가 필요**

### P4에 추가할 마이그레이션:
```sql
-- supabase/migrations/YYYYMMDD_lesson_progress_rls.sql

-- Enable RLS
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;

-- Users can only view their own progress
CREATE POLICY "Users can view own progress"
ON lesson_progress FOR SELECT
USING (auth.uid() = user_id);

-- Users can only insert their own progress
CREATE POLICY "Users can insert own progress"
ON lesson_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can only update their own progress
CREATE POLICY "Users can update own progress"
ON lesson_progress FOR UPDATE
USING (auth.uid() = user_id);
```

---

## 보완 4: YouTube 이용정책 (운영 섹션)

### 플랫폼 운영 정책

1. **임베드 전용**: YouTube 영상을 다운로드하거나 복제하지 않음. iframe 임베드만 사용.

2. **출처 명시**: 모든 YouTube 레슨에 원본 크리에이터 정보 표시
   - 채널명 및 채널 링크
   - "YouTube에서 보기" 원본 링크

3. **삭제 요청 대응**: 크리에이터의 삭제 요청 시 즉시 레슨 비활성화
   - 연락처: [관리자 이메일]
   - 대응 시간: 영업일 기준 48시간 이내

4. **광고 정책**: YouTube 원본 광고 유지 (차단하지 않음)

---

## 보완 5: 캐싱 기준 구체화

### oEmbed API 캐싱 전략

| 상황 | 캐시 TTL | 동작 |
|------|---------|------|
| 성공 | 7일 | content_data에 저장, 재요청 안함 |
| 실패 (404/비공개) | 10분 | 짧은 재시도 허용 |
| 실패 (429/네트워크) | 1분 | 즉시 재시도 가능 |

### 구현 방식:
```typescript
// 캐시는 DB 저장으로 대체 (content_data.fetched_at 기준)
const CACHE_TTL_DAYS = 7;

export async function shouldRefetchMetadata(lesson: Lesson): boolean {
  const fetchedAt = lesson.content_data?.youtube?.fetched_at;
  if (!fetchedAt) return true;

  const daysSinceFetch = (Date.now() - new Date(fetchedAt).getTime()) / (1000 * 60 * 60 * 24);
  return daysSinceFetch > CACHE_TTL_DAYS;
}
```

---

## 보완 6: DoD (Definition of Done) 추가

### P0 DoD
- [ ] 모든 URL 포맷 테스트 통과 (watch, youtu.be, shorts, m.youtube)
- [ ] `npm run typecheck` 통과
- [ ] 유틸 함수 단위 테스트 (최소 5개 케이스)

### P1 DoD
- [ ] 유효한 URL → 메타데이터 반환 (제목, 채널명, 썸네일)
- [ ] **API Key 있을 때** → Duration 자동 반환 (초 단위)
- [ ] **API Key 없을 때** → Duration null 반환 (수동 입력 폼 표시)
- [ ] 비공개 영상 → "비공개 영상입니다" 에러
- [ ] 삭제된 영상 → "존재하지 않는 영상입니다" 에러
- [ ] 잘못된 URL → "유효하지 않은 YouTube URL입니다" 에러

### P2 DoD
- [ ] URL 입력 후 600ms 내 메타데이터 자동 채움 (제목, 썸네일)
- [ ] **Duration 자동 채움** (API Key 있을 때) 또는 수동 입력 폼 표시
- [ ] 로딩 중 스피너 표시
- [ ] 실패 시 수동 입력 가능 + 재시도 버튼
- [ ] 중복 영상 등록 시 경고 메시지

### P3 DoD
- [ ] 크리에이터 정보 카드 렌더링
- [ ] "YouTube에서 보기" 링크 새 탭에서 열림
- [ ] `rel="noopener noreferrer"` 적용 확인

### P4 DoD
- [ ] 완료 버튼 클릭 → 즉시 UI 업데이트 (낙관적)
- [ ] 서버 실패 시 롤백 + 토스트 에러
- [ ] 새로고침 후 완료 상태 유지

### P5 DoD
- [ ] 16:9 비율 유지 (검은 바 강제 제거 안함)
- [ ] 모바일에서 전체 너비 사용
- [ ] `youtube-nocookie.com` 도메인 사용

### P6 DoD
- [ ] `npm run typecheck && npm run lint && npm run build` 통과
- [ ] 모든 Phase DoD 항목 충족
- [ ] 크롬/사파리/파이어폭스 테스트

---

## 수정 파일 요약 (보완 후)

### 신규 생성 (9개) - 검증 후 수정
| 파일 | 설명 |
|------|------|
| `types/youtube.ts` | YouTube 타입 정의 |
| `app/lib/utils/youtube.ts` | YouTube URL 유틸리티 |
| `app/lib/actions/youtubeActions.ts` | YouTube 메타데이터 Server Action |
| `app/lib/actions/progressActions.ts` | **레슨 진도 Server Action (신규)** |
| `components/Lesson/CreatorInfo.tsx` | 크리에이터 정보 컴포넌트 |
| `components/Lesson/LessonCompleteButton.tsx` | 완료 버튼 컴포넌트 |
| `public/scss/template/_youtube-player.scss` | **YouTube 플레이어 스타일 (경로 수정: custom → template)** |
| `supabase/migrations/YYYYMMDD_youtube_unique_index.sql` | 중복 방지 인덱스 |
| `supabase/migrations/YYYYMMDD_lesson_progress_rls.sql` | **lesson_progress RLS 정책 (신규)** |

### 수정 (3개) - 검증 후 수정
| 파일 | 변경 내용 |
|------|----------|
| `components/create-course/QuizModals/LessonModal.tsx` | YouTube 메타데이터 자동 추출 + 중복 검사 |
| `components/Lesson/LessonVideo.js` → `.tsx` | TypeScript 변환 + 최적화 |
| `app/(courses)/(lessons)/lesson/[id]/LessonContent.js` | CreatorInfo, 완료 버튼 통합 + **lesson prop 전달 수정**

---

## 최종 계획 요약

### 한눈에 보는 Phase별 작업

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        YouTube 큐레이션 MVP 구현 흐름                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  P0: 환경 설정          P1: API 연동           P2: 폼 개선                   │
│  ┌─────────────┐       ┌─────────────┐       ┌─────────────┐               │
│  │ types/      │       │ oEmbed API  │       │ LessonModal │               │
│  │ youtube.ts  │──────▶│ (무제한)    │──────▶│ 자동 채움   │               │
│  │             │       │      +      │       │ + Debounce  │               │
│  │ utils/      │       │ Data API v3 │       │ + 중복 검사 │               │
│  │ youtube.ts  │       │ (Duration)  │       │             │               │
│  └─────────────┘       └─────────────┘       └─────────────┘               │
│         │                    │                     │                        │
│         ▼                    ▼                     ▼                        │
│  P3: 크리에이터 표시    P4: 진도 체크          P5: 플레이어                  │
│  ┌─────────────┐       ┌─────────────┐       ┌─────────────┐               │
│  │ CreatorInfo │       │ Complete    │       │ LessonVideo │               │
│  │ 채널명/링크 │       │ Button      │       │ nocookie    │               │
│  │ 원본 보기   │       │ 낙관적 UI   │       │ 16:9 반응형 │               │
│  └─────────────┘       └─────────────┘       └─────────────┘               │
│                              │                                              │
│                              ▼                                              │
│                        P6: 검증 및 테스트                                   │
│                        ┌─────────────┐                                      │
│                        │ typecheck   │                                      │
│                        │ lint, build │                                      │
│                        │ 브라우저    │                                      │
│                        └─────────────┘                                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### Phase별 상세 요약

| Phase | 목표 | 핵심 파일 | 예상 시간 |
|-------|------|----------|----------|
| **P0** | 타입 정의 + URL 파싱 유틸 | `types/youtube.ts`, `app/lib/utils/youtube.ts` | 1시간 |
| **P1** | 하이브리드 API 메타데이터 추출 | `app/lib/actions/youtubeActions.ts` | 2시간 |
| **P2** | 레슨 생성 폼 자동화 | `LessonModal.tsx` 수정 | 3시간 |
| **P3** | 크리에이터 정보 표시 | `CreatorInfo.tsx` 신규 | 1시간 |
| **P4** | 완료 버튼 (낙관적 UI) | `LessonCompleteButton.tsx` 신규 | 2시간 |
| **P5** | 플레이어 개선 (프라이버시) | `LessonVideo.tsx` 변환 | 1.5시간 |
| **P6** | 통합 테스트 및 검증 | 전체 | 1.5시간 |

**총 예상 시간:** 12시간 (3-4일)

---

### 핵심 기술 결정

#### 1. 하이브리드 API 전략 (현업 표준)

```
┌────────────────────────────────────────────────────────────┐
│                    YouTube URL 입력                        │
└────────────────────────┬───────────────────────────────────┘
                         ▼
┌────────────────────────────────────────────────────────────┐
│  [1단계] oEmbed API                                        │
│  • API Key: 불필요                                         │
│  • 할당량: 무제한                                          │
│  • 반환: title, author_name, author_url, thumbnail_url    │
└────────────────────────┬───────────────────────────────────┘
                         ▼
┌────────────────────────────────────────────────────────────┐
│  [2단계] YouTube Data API v3 (선택적)                      │
│  • API Key: 필요 (YOUTUBE_API_KEY)                         │
│  • 할당량: 10,000 units/day (1 video = 1 unit)            │
│  • 반환: duration (ISO 8601 → 초 변환)                    │
│  • Graceful Degradation: API Key 없으면 수동 입력         │
└────────────────────────────────────────────────────────────┘
```

#### 2. 데이터 저장 스키마

```typescript
// lessons.content_data.youtube 구조
interface YouTubeContentData {
  youtube_id: string;           // "dQw4w9WgXcQ"
  canonical_url: string;        // "https://www.youtube.com/watch?v=..."
  original_title: string;       // 원본 제목
  channel_name: string;         // 채널명
  channel_url: string;          // 채널 URL
  thumbnail_url: string;        // 썸네일 URL
  duration_seconds: number | null; // 초 단위 (API Key 없으면 null)
  fetched_at: string;           // ISO 8601 타임스탬프
}
```

#### 3. 중복 방지

```sql
-- 같은 코스 내 동일 YouTube 영상 중복 방지
CREATE UNIQUE INDEX idx_lessons_youtube_unique
ON lessons (course_id, (content_data->>'youtube_id'))
WHERE video_source = 'youtube'
  AND content_data->>'youtube_id' IS NOT NULL
  AND deleted_at IS NULL;
```

#### 4. UX 패턴

| 기능 | 패턴 | 설명 |
|------|------|------|
| URL 입력 | Debounce (600ms) | 타이핑 멈춘 후 API 호출 |
| 완료 버튼 | 낙관적 UI | 즉시 체크 → 서버 실패 시 롤백 |
| 에러 처리 | Graceful Degradation | API 실패 → 수동 입력 폴백 |
| 플레이어 | Privacy-enhanced | `youtube-nocookie.com` 도메인 |

---

### 파일 변경 총정리

#### 신규 생성 (9개) - 검증 완료

| 파일 | 역할 |
|------|------|
| `types/youtube.ts` | YouTube 타입 정의 |
| `app/lib/utils/youtube.ts` | URL 파싱, 썸네일 생성 유틸 |
| `app/lib/actions/youtubeActions.ts` | 하이브리드 API Server Action |
| `app/lib/actions/progressActions.ts` | **레슨 진도 Server Action (신규)** |
| `components/Lesson/CreatorInfo.tsx` | 크리에이터 정보 카드 |
| `components/Lesson/LessonCompleteButton.tsx` | 완료 버튼 (낙관적 UI) |
| `public/scss/template/_youtube-player.scss` | **플레이어 반응형 스타일 (경로 수정)** |
| `supabase/migrations/YYYYMMDD_youtube_unique_index.sql` | 중복 방지 인덱스 |
| `supabase/migrations/YYYYMMDD_lesson_progress_rls.sql` | **lesson_progress RLS 정책** |

#### 수정 (3개) - 검증 완료

| 파일 | 변경 내용 |
|------|----------|
| `LessonModal.tsx` | YouTube 메타데이터 자동 채움 + 중복 검사 |
| `LessonVideo.js` → `.tsx` | TypeScript 변환 + nocookie 도메인 |
| `LessonContent.js` | CreatorInfo, 완료 버튼 통합 + **lesson prop 전달 수정**

---

### UI 배치 미리보기

#### 레슨 생성 폼 (P2)

```
┌─────────────────────────────────────────────────────────┐
│  레슨 추가                                         [X]  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  YouTube URL *                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │ https://youtube.com/watch?v=...    [🔄 로딩...]│   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  🎬 썸네일 미리보기                              │   │
│  │  ┌─────────────────┐                            │   │
│  │  │                 │  제목: AI 프롬프트 기초     │   │
│  │  │   [Thumbnail]   │  채널: AI Academy          │   │
│  │  │                 │  길이: 12:03               │   │
│  │  └─────────────────┘                            │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  레슨 제목 *                                            │
│  ┌─────────────────────────────────────────────────┐   │
│  │ AI 프롬프트 기초 (자동 채움됨)                   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│                              [취소]  [레슨 추가]        │
└─────────────────────────────────────────────────────────┘
```

#### 레슨 시청 페이지 (P3, P4, P5)

```
┌─────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────┐   │
│  │                                                 │   │
│  │              YouTube Player                     │   │
│  │           (16:9, nocookie.com)                  │   │
│  │                                                 │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  📺 AI Academy                                  │   │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    │   │
│  │  🔗 YouTube에서 보기                            │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  [✓ 레슨 완료로 표시]                           │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  [← 이전 레슨]                          [다음 레슨 →]   │
└─────────────────────────────────────────────────────────┘
```

---

### 환경 변수

```env
# .env.local (선택적 - Duration 자동 추출용)
YOUTUBE_API_KEY=your_youtube_data_api_v3_key

# API Key 없어도 동작함 (Duration만 수동 입력)
```

---

### 실행 순서

```bash
# P0-P5 개발 및 단위/통합 테스트 완료 (Port 3000 검증됨)
# - YouTube 메타데이터 (일반/Shorts) 정상
# - 플레이어 (privacy mode) 정상
# - 완료 버튼 로직 정상

# 최종 배포 빌드 확인
npm run build
```
# 코스 생성 → 레슨 추가 → YouTube URL 입력 테스트

# P6 (최종 검증)
npm run typecheck && npm run lint && npm run build
```

---

---

## 검증 결과 (2025-12-18)

### Ultra Think 코드베이스 분석 결과

| 항목 | 기존 계획 | 실제 코드베이스 | 수정 |
|------|----------|----------------|------|
| SCSS 경로 | `public/scss/custom/` | ❌ 폴더 없음 | → `public/scss/template/` |
| progressActions.ts | "수정" 분류 | ❌ 파일 없음 | → "신규 생성" 분류 |
| lesson_progress RLS | "이미 구현됨" | ❌ RLS 없음 | → P4에 마이그레이션 추가 |
| LessonContent.js | CreatorInfo 통합만 | ⚠️ `<LessonVideo />` lesson prop 누락 | → lesson prop 전달 수정 포함 |

### 프로젝트 원칙 준수 확인

| 원칙 | 상태 |
|------|------|
| Work Plan Protocol (Phase별 승인) | ✅ 준수 |
| 파일 경로 규칙 (/app/lib/actions/) | ✅ 준수 |
| TypeScript "Touch It, Type It" | ✅ 준수 |
| Result 패턴 에러 처리 | ✅ 준수 |
| RLS 보안 정책 | ✅ 추가 완료 |
| 네이밍 컨벤션 (kebab-case, camelCase) | ✅ 준수 |

### 수정 내역 요약

1. **SCSS 경로**: `custom/` → `template/` (기존 폴더 구조 활용)
2. **progressActions.ts**: "수정" → "신규 생성" (파일 미존재)
3. **lesson_progress RLS**: 마이그레이션 SQL 추가
4. **LessonContent.js**: lesson prop 전달 수정 사항 명시

---

### 다음 단계

**P0 승인 대기 중**

선택지: **[P0 승인]** **[질문]** **[수정 요청]** **[보류]**
