# Development Roadmap

## Phase 1: Core Platform Completion (Week 1-2) - CURRENT PRIORITY
**목표**: 학생과 교사가 실제로 사용할 수 있는 핵심 기능 완성

### Week 1: Student Core Features
- **Day 1-2**: Course Enrollment Process
  - [ ] Course detail page for students (`/courses/[id]`)
  - [ ] **Bookmark functionality (add/remove)**
  - [ ] Enrollment/Purchase flow
  - [ ] Payment integration (Stripe/Local payment)
  
- **Day 3-4**: Learning System
  - [ ] Lesson viewer page (`/lesson/[id]`)
  - [ ] Video player with progress tracking
  - [ ] Quiz taking interface
  - [ ] Lesson completion logic
  
- **Day 5**: Student Dashboard Completion
  - [ ] Display enrolled courses (real data)
  - [ ] **Display bookmarked courses section**
  - [ ] Progress tracking UI
  - [ ] Next lesson recommendations

### Week 2: Supporting Features
- **Day 1-2**: Review & Rating System
  - [ ] Review submission form
  - [ ] Rating display on courses
  - [ ] Instructor review management
  
- **Day 3**: Search & Discovery
  - [ ] Course search functionality
  - [ ] Category/Level filters
  - [ ] Featured courses section
  
- **Day 4-5**: Testing & Bug Fixes
  - [ ] Full user journey testing
  - [ ] Payment flow verification
  - [ ] Performance optimization

## Phase 2: Admin System Integration (Week 3)
**목표**: PreSkool 템플릿을 활용한 관리자 대시보드 구축

- **Day 1**: PreSkool Setup
  - [ ] Install PreSkool React TS version
  - [ ] Configure subdomain (admin.domain.com)
  
- **Day 2-3**: Authentication Integration
  - [ ] Implement SSO between main app and PreSkool
  - [ ] Admin role verification
  
- **Day 4-5**: Data Integration
  - [ ] API endpoints for PreSkool
  - [ ] **Badge management system (Hot/New/Featured)**
  - [ ] **Database fields for badge states**
  - [ ] Data synchronization
  
- **Day 6-7**: Testing & Deployment
  - [ ] Integration testing
  - [ ] Production deployment

## Phase 3: Enhancement & Optimization (Week 4+)
- Mobile app consideration
- Advanced analytics
- AI-powered recommendations
- Multi-language support

## Technical Decisions

### Admin Dashboard Strategy
**Decision**: Use PreSkool template as separate admin system
**Rationale**: 
- Faster implementation (1 week vs 4-6 weeks)
- Professional UI/UX out of the box
- Cost-effective ($59 one-time)
- Focus on core platform first

### Integration Approach
- Subdomain deployment (admin.domain.com)
- Shared Supabase database
- JWT-based SSO
- API-based data sync

## Planned Features

### Badge System (Week 3)
**데이터베이스 변경**:
```sql
ALTER TABLE courses 
ADD COLUMN is_hot BOOLEAN DEFAULT false,
ADD COLUMN is_new BOOLEAN DEFAULT false,
ADD COLUMN is_featured BOOLEAN DEFAULT false,
ADD COLUMN badge_text VARCHAR(50);
```

**Admin Features**:
- Toggle badges on course list
- Bulk badge operations
- Auto-badge rules (e.g., new courses < 7 days)

### Bookmark System (Week 1)
**데이터베이스 변경**:
```sql
CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);
```

**Features**:
- Add/Remove bookmark API
- My Bookmarks section in student dashboard
- Bookmark count on courses

## Admin Features Guidelines (To Be Implemented)

### Admin 구현 시 필요한 체크리스트

#### 1. 권한 시스템
- [ ] Admin role 정의 및 데이터베이스 스키마 업데이트
- [ ] 역할 기반 접근 제어(RBAC) 시스템 설계
- [ ] Admin 전용 미들웨어/가드 구현

#### 2. Admin 전용 기능
- [ ] 모든 코스 상태에서 편집 권한
- [ ] 일반 워크플로우 우회 권한
- [ ] 사용자 관리 (role 변경, 계정 활성화/비활성화)
- [ ] 시스템 전체 통계 및 모니터링
- [ ] 긴급 콘텐츠 수정 권한

#### 3. 보안 고려사항
- [ ] 서버 사이드 권한 검증 필수
- [ ] Admin 액션 로깅 시스템
- [ ] 2단계 인증 고려
- [ ] IP 화이트리스트 고려

#### 4. UI/UX 고려사항
- [ ] Admin 전용 대시보드 필요 여부
- [ ] 일반 사용자 UI에서 Admin 기능 표시 방법
- [ ] Admin 모드 토글 기능
- [ ] 위험한 액션에 대한 확인 다이얼로그

#### 5. 데이터베이스 고려사항
- [ ] Admin 액션 로그 테이블
- [ ] 권한 관리 테이블 구조
- [ ] 감사(Audit) 추적 기능