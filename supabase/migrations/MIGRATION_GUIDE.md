# 데이터베이스 마이그레이션 가이드

이 가이드는 Course Builder 데이터 지속성 문제를 해결하기 위한 데이터베이스 스키마 표준화 마이그레이션을 실행하는 방법을 설명합니다.

## 문제 해결 내용

1. **컬럼명 충돌 해결**: `order_index` vs `sort_order` 통일
2. **참조 불일치 수정**: `auth.users` → `user` 테이블 참조로 변경
3. **누락된 컬럼 추가**: `topic_id`, `video_source` 등
4. **데이터 무결성 보장**: 자동 sort_order 설정 및 중복 방지

## 실행 순서

### 1단계: 백업 (중요!)
Supabase 대시보드에서 데이터베이스를 백업하세요.

### 2단계: 마이그레이션 실행
Supabase SQL Editor에서 다음 파일을 순서대로 실행하세요:

1. **기존 마이그레이션 확인** (이미 실행된 경우 건너뛰기)
   - `create_courses_tables.sql`
   - `20250124_create_enrollment_tables.sql`

2. **새 마이그레이션 실행** ⭐
   - `20250130_standardize_database_schema.sql`

### 3단계: 검증
마이그레이션 실행 후 다음 SQL로 데이터 무결성을 확인하세요:

```sql
-- 데이터 무결성 검증
SELECT * FROM validate_course_data();

-- 스키마 확인
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'lessons' 
AND column_name IN ('sort_order', 'order_index');
```

### 4단계: 애플리케이션 테스트
1. Course Builder에서 새 Topic/Lesson 추가
2. 저장 후 페이지 새로고침
3. Edit 모드로 재진입하여 데이터 확인

## 주의사항

- 마이그레이션은 idempotent(멱등성)하게 작성되어 여러 번 실행해도 안전합니다
- 기존 데이터는 자동으로 마이그레이션됩니다
- sort_order 중복이 있었다면 자동으로 재정렬됩니다

## 문제 발생 시

1. 에러 메시지를 확인하고 상세 내용을 기록하세요
2. `validate_course_data()` 함수로 데이터 문제를 진단하세요
3. 필요한 경우 백업에서 복원하세요

## 마이그레이션 후 효과

- Course Builder에서 추가한 Topics/Lessons이 영구 저장됨
- 데이터베이스 스키마가 일관성 있게 통합됨
- 향후 기능 추가 시 안정적인 기반 제공