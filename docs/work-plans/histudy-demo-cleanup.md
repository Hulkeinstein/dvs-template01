# HiStudy 템플릿 데모 컴포넌트 정리 - Work Plan

**Status**: Paused (최종 빌드 시 진행)
**Created**: 2025-12-28
**Issue**: #69
**Branch**: `chore/cleanup-histudy-demo-69`

## 목표
HiStudy 템플릿에서 가져온 미사용 데모 컴포넌트 정리로 번들 크기 감소 및 코드베이스 단순화

## 분석 결과

### 사용 중 (유지)
| 파일 | 용도 |
|------|------|
| `Content.js` | 커리큘럼 표시 (프로덕션) |
| `LessonAssignmentsSubmit.js` | 과제 제출 페이지 |
| `CourseDetails-One.js` | 코스 상세 메인 |

### 미사용 (삭제 대상)
| 파일 | 경로 | 비고 |
|------|------|------|
| `CourseDetails-Two.js` | `/course-detail-2` | 데모만 |
| `CourseDetails-Three.js` | `/course-detail-3` | 데모만 |
| `CourseDetails-Four.js` | `/course-detail-4` | 데모만 |
| `CourseDetails-Five.js` | `/course-detail-5` | 데모만 |
| `CourseDetails-Six.js` | `/course-detail-6` | 데모만 |
| `CourseDetails-Seven.js` | `/course-detail-7` | 데모만 |
| `CourseDetails-Eight.js` | `/course-detail-8` | 데모만 |

### 관련 라우트 (함께 삭제)
```
app/(courses)/course-detail-2/
app/(courses)/course-detail-3/
app/(courses)/course-detail-4/
app/(courses)/course-detail-5/
app/(courses)/course-detail-6/
app/(courses)/course-detail-7/
app/(courses)/course-detail-8/
app/(courses)/course-card-2/
app/(courses)/course-card-3/
```

## Phases

### Phase 0: 백업 및 확인 ✅
- [x] 현재 빌드 성공 확인
- [x] 삭제 대상 파일 목록 최종 확인
- [x] 추가 발견: `course-card-2/`, `course-card-3/` 데모 라우트

### Phase 1: 데모 라우트 삭제
- [ ] `app/(courses)/course-detail-{2-8}/` 폴더 삭제 (7개)
- [ ] `app/(courses)/course-card-{2-3}/` 폴더 삭제 (2개)
- [ ] 빌드 확인

### Phase 2: 데모 컴포넌트 삭제
- [ ] `CourseDetails-{Two-Eight}.js` 삭제 (7개)
- [ ] 빌드 확인

### Phase 3: 검증 및 정리
- [ ] 전체 빌드 성공 확인
- [ ] 번들 크기 비교 (선택)
- [ ] PR 생성

## 예상 소요
- Phase 0: 5분
- Phase 1: 10분
- Phase 2: 10분
- Phase 3: 10분
- **총**: ~35분

## 리스크
- **낮음**: 프로덕션에서 사용하지 않는 데모 파일만 삭제
- 롤백: git revert로 즉시 복구 가능

## 결정 사항
- `Content.js`, `LessonAssignmentsSubmit.js`: 유지 (프로덕션 사용 중)
- `checkMatchCourses` props 이름: 이번 작업에서는 변경하지 않음 (별도 이슈)
