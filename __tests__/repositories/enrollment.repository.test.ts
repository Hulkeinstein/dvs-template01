/**
 * Enrollment Repository Test Suite
 * 수강 등록 Repository 테스트
 */

import { EnrollmentRepository } from '@/app/lib/repositories/enrollment.repository';
import { MockEnrollmentRepository } from '@/tests/mocks/repositories/mock.repository';
import { RepositoryFactory } from '@/app/lib/repositories';
import type { Enrollment } from '@/app/lib/repositories/enrollment.repository';

describe('EnrollmentRepository', () => {
  let mockRepository: MockEnrollmentRepository<Enrollment>;
  
  beforeEach(() => {
    mockRepository = new MockEnrollmentRepository<Enrollment>();
    RepositoryFactory.register('enrollment', mockRepository);
  });
  
  afterEach(() => {
    mockRepository.clear();
    RepositoryFactory.reset();
    RepositoryFactory.registerDefaults();
  });
  
  describe('enrollment operations', () => {
    it('should enroll a user in a course', async () => {
      // Given: 사용자와 코스 ID
      const userId = 'user-123';
      const courseId = 'course-456';
      
      // When: 수강 등록
      const enrollment = await mockRepository.create({
        user_id: userId,
        course_id: courseId,
        enrolled_at: new Date().toISOString(),
        progress: 0,
        last_accessed_at: new Date().toISOString(),
      });
      
      // Then: 등록 정보 확인
      expect(enrollment.user_id).toBe(userId);
      expect(enrollment.course_id).toBe(courseId);
      expect(enrollment.progress).toBe(0);
      expect(enrollment.enrolled_at).toBeDefined();
    });
    
    it('should find enrollment by user and course', async () => {
      // Given: 여러 등록 정보
      const enrollments = [
        {
          user_id: 'user-1',
          course_id: 'course-1',
          progress: 50,
          enrolled_at: new Date().toISOString(),
        },
        {
          user_id: 'user-1',
          course_id: 'course-2',
          progress: 30,
          enrolled_at: new Date().toISOString(),
        },
        {
          user_id: 'user-2',
          course_id: 'course-1',
          progress: 70,
          enrolled_at: new Date().toISOString(),
        },
      ];
      
      await mockRepository.bulkCreate(enrollments);
      
      // When: 특정 사용자의 특정 코스 등록 조회
      const found = await mockRepository.findByUserAndCourse('user-1', 'course-1');
      
      // Then: 정확한 등록 정보 반환
      expect(found).not.toBeNull();
      expect(found?.progress).toBe(50);
    });
  });
  
  describe('progress tracking', () => {
    it('should update course progress', async () => {
      // Given: 등록된 코스
      const enrollment = await mockRepository.create({
        user_id: 'user-123',
        course_id: 'course-456',
        progress: 0,
        enrolled_at: new Date().toISOString(),
      });
      
      // When: 진도 업데이트
      const updated = await mockRepository.update(enrollment.id, {
        progress: 75,
        last_accessed_at: new Date().toISOString(),
      });
      
      // Then: 진도가 업데이트됨
      expect(updated.progress).toBe(75);
      expect(updated.last_accessed_at).toBeDefined();
      expect(updated.completed_at).toBeUndefined(); // 아직 완료 안 됨
    });
    
    it('should mark as completed when progress is 100', async () => {
      // Given: 등록된 코스
      const enrollment = await mockRepository.create({
        user_id: 'user-123',
        course_id: 'course-456',
        progress: 90,
        enrolled_at: new Date().toISOString(),
      });
      
      // When: 100% 진도 달성
      const completed = await mockRepository.update(enrollment.id, {
        progress: 100,
        completed_at: new Date().toISOString(),
      });
      
      // Then: 완료 처리
      expect(completed.progress).toBe(100);
      expect(completed.completed_at).toBeDefined();
    });
  });
  
  describe('user enrollments', () => {
    it('should find all enrollments for a user', async () => {
      // Given: 한 사용자의 여러 코스 등록
      const userId = 'user-123';
      await mockRepository.bulkCreate([
        {
          user_id: userId,
          course_id: 'course-1',
          progress: 100,
          completed_at: new Date().toISOString(),
          enrolled_at: new Date().toISOString(),
        },
        {
          user_id: userId,
          course_id: 'course-2',
          progress: 50,
          enrolled_at: new Date().toISOString(),
        },
        {
          user_id: userId,
          course_id: 'course-3',
          progress: 0,
          enrolled_at: new Date().toISOString(),
        },
        {
          user_id: 'other-user',
          course_id: 'course-1',
          progress: 25,
          enrolled_at: new Date().toISOString(),
        },
      ]);
      
      // When: 사용자의 모든 등록 조회
      const userEnrollments = await mockRepository.findByUser(userId);
      
      // Then: 해당 사용자의 등록만 반환
      expect(userEnrollments).toHaveLength(3);
      expect(userEnrollments.every(e => e.user_id === userId)).toBe(true);
    });
    
    it('should categorize enrollments by status', async () => {
      // Given: 다양한 상태의 등록
      const userId = 'user-123';
      await mockRepository.bulkCreate([
        {
          user_id: userId,
          course_id: 'completed-1',
          progress: 100,
          completed_at: new Date().toISOString(),
          enrolled_at: new Date().toISOString(),
        },
        {
          user_id: userId,
          course_id: 'completed-2',
          progress: 100,
          completed_at: new Date().toISOString(),
          enrolled_at: new Date().toISOString(),
        },
        {
          user_id: userId,
          course_id: 'in-progress-1',
          progress: 60,
          enrolled_at: new Date().toISOString(),
        },
        {
          user_id: userId,
          course_id: 'in-progress-2',
          progress: 30,
          enrolled_at: new Date().toISOString(),
        },
        {
          user_id: userId,
          course_id: 'not-started',
          progress: 0,
          enrolled_at: new Date().toISOString(),
        },
      ]);
      
      // When: 상태별 조회
      const completed = await mockRepository.findCompleted(userId);
      const inProgress = await mockRepository.findInProgress(userId);
      
      // Then: 정확한 분류
      expect(completed).toHaveLength(2);
      expect(completed.every(e => e.completed_at != null)).toBe(true);
      
      expect(inProgress).toHaveLength(2);
      expect(inProgress.every(e => e.progress! > 0 && e.progress! < 100)).toBe(true);
    });
  });
  
  describe('course enrollments', () => {
    it('should find all students enrolled in a course', async () => {
      // Given: 한 코스에 여러 학생 등록
      const courseId = 'course-123';
      await mockRepository.bulkCreate([
        {
          user_id: 'student-1',
          course_id: courseId,
          progress: 80,
          enrolled_at: new Date().toISOString(),
        },
        {
          user_id: 'student-2',
          course_id: courseId,
          progress: 45,
          enrolled_at: new Date().toISOString(),
        },
        {
          user_id: 'student-3',
          course_id: courseId,
          progress: 100,
          completed_at: new Date().toISOString(),
          enrolled_at: new Date().toISOString(),
        },
        {
          user_id: 'student-1',
          course_id: 'other-course',
          progress: 20,
          enrolled_at: new Date().toISOString(),
        },
      ]);
      
      // When: 코스의 모든 등록 조회
      const courseEnrollments = await mockRepository.findByCourse(courseId);
      
      // Then: 해당 코스의 등록만 반환
      expect(courseEnrollments).toHaveLength(3);
      expect(courseEnrollments.every(e => e.course_id === courseId)).toBe(true);
      
      // 통계 계산
      const completedCount = courseEnrollments.filter(e => e.completed_at).length;
      const averageProgress = courseEnrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / courseEnrollments.length;
      
      expect(completedCount).toBe(1);
      expect(averageProgress).toBeCloseTo(75, 0);
    });
  });
  
  describe('edge cases', () => {
    it('should handle duplicate enrollment attempts', async () => {
      // Given: 첫 번째 등록
      const userId = 'user-123';
      const courseId = 'course-456';
      
      await mockRepository.create({
        user_id: userId,
        course_id: courseId,
        progress: 25,
        enrolled_at: new Date().toISOString(),
      });
      
      // When: 같은 사용자가 같은 코스에 다시 등록 시도
      const existing = await mockRepository.findByUserAndCourse(userId, courseId);
      
      // Then: 기존 등록 정보 반환
      expect(existing).not.toBeNull();
      expect(existing?.progress).toBe(25);
    });
    
    it('should handle empty results gracefully', async () => {
      // When: 빈 데이터베이스에서 조회
      const userEnrollments = await mockRepository.findByUser('non-existent');
      const courseEnrollments = await mockRepository.findByCourse('non-existent');
      const completed = await mockRepository.findCompleted('non-existent');
      const inProgress = await mockRepository.findInProgress('non-existent');
      
      // Then: 모두 빈 배열 반환 (에러 없이)
      expect(userEnrollments).toEqual([]);
      expect(courseEnrollments).toEqual([]);
      expect(completed).toEqual([]);
      expect(inProgress).toEqual([]);
    });
  });
});