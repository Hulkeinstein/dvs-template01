# Supabase Migrations

## 실행 방법

1. Supabase 대시보드에 로그인
2. SQL Editor로 이동
3. 다음 순서대로 SQL 파일 실행:

### 1단계: 등록 및 주문 테이블 생성 (아직 실행하지 않은 경우)
```sql
-- 20250124_create_enrollment_tables.sql 내용 실행
```

### 2단계: Storage 버킷 생성 (아직 실행하지 않은 경우)
```sql
-- 20250124_create_storage_bucket.sql 내용 실행
```

**참고**: courses 테이블은 이미 생성되어 있으므로 추가 실행 불필요

## 테이블 구조

### courses
- 코스 기본 정보 (제목, 설명, 가격 등)
- 강사 ID로 user 테이블과 연결

### lessons
- 코스에 속한 레슨들
- 순서(order_index)로 정렬

### course_settings
- 코스별 설정 (인증서, 수강 기한 등)

### enrollments
- 학생의 코스 등록 정보
- 진행률 자동 계산

### orders
- 결제 정보

### lesson_progress
- 개별 레슨 완료 상태
- 진행률 자동 업데이트 트리거

## RLS (Row Level Security) 정책

- 강사는 자신의 코스만 관리 가능
- 학생은 등록한 코스만 접근 가능
- 공개된 코스는 모두가 조회 가능

## 주의사항

1. 마이그레이션 실행 전 백업 권장
2. 순서대로 실행해야 함
3. Storage 정책은 별도 설정 필요할 수 있음