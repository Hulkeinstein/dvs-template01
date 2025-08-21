/**
 * Course Repository Test Suite
 * Repository Pattern을 사용한 테스트 예시
 */

// CourseRepository는 타입 참조용으로만 사용
import { MockCourseRepository } from '@/tests/mocks/repositories/mock.repository';
import { RepositoryFactory } from '@/app/lib/repositories';
import type { Course } from '@/app/lib/repositories/course.repository';

describe('CourseRepository', () => {
  let mockRepository: MockCourseRepository<Course>;

  beforeEach(() => {
    // Mock repository 생성 및 등록
    mockRepository = new MockCourseRepository<Course>();
    RepositoryFactory.register('course', mockRepository);
  });

  afterEach(() => {
    // Repository 초기화
    mockRepository.clear();
    RepositoryFactory.reset();
    RepositoryFactory.registerDefaults();
  });

  describe('findByInstructor', () => {
    it('should return courses for a specific instructor', async () => {
      // Given: 테스트 데이터 준비
      const instructorId = 'instructor-123';
      const courses = [
        {
          id: 'course-1',
          title: 'React Basics',
          description: 'Learn React fundamentals',
          instructor_id: instructorId,
          price: 49.99,
          is_published: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'course-2',
          title: 'Advanced React',
          description: 'Deep dive into React',
          instructor_id: instructorId,
          price: 99.99,
          is_published: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'course-3',
          title: 'Vue.js Basics',
          description: 'Learn Vue.js',
          instructor_id: 'another-instructor',
          price: 39.99,
          is_published: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      await mockRepository.bulkCreate(courses);

      // When: 특정 강사의 코스 조회
      const result = await mockRepository.findByInstructor(instructorId);

      // Then: 해당 강사의 코스만 반환
      expect(result).toHaveLength(2);
      expect(result.every((c: any) => c.instructor_id === instructorId)).toBe(
        true
      );
      expect(result.map((c: any) => c.title)).toEqual([
        'React Basics',
        'Advanced React',
      ]);
    });

    it('should return empty array when instructor has no courses', async () => {
      // When: 코스가 없는 강사 조회
      const result = await mockRepository.findByInstructor('non-existent');

      // Then: 빈 배열 반환
      expect(result).toEqual([]);
    });
  });

  describe('findPublished', () => {
    it('should return only published courses', async () => {
      // Given: 발행/미발행 코스 혼재
      const courses = [
        {
          id: 'course-1',
          title: 'Published Course',
          description: 'This is published',
          instructor_id: 'instructor-1',
          price: 49.99,
          is_published: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'course-2',
          title: 'Draft Course',
          description: 'This is a draft',
          instructor_id: 'instructor-1',
          price: 0,
          is_published: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      await mockRepository.bulkCreate(courses);

      // When: 발행된 코스만 조회
      const result = await mockRepository.findPublished();

      // Then: 발행된 코스만 반환
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Published Course');
      expect(result[0].is_published).toBe(true);
    });
  });

  describe('create', () => {
    it('should create a new course with auto-generated ID', async () => {
      // Given: 새 코스 데이터
      const courseData = {
        title: 'New Course',
        description: 'Brand new course',
        instructor_id: 'instructor-123',
        price: 79.99,
        is_published: false,
      };

      // When: 코스 생성
      const created = await mockRepository.create(courseData);

      // Then: ID가 자동 생성되고 타임스탬프 추가
      expect(created.id).toBeDefined();
      expect(created.title).toBe('New Course');
      expect(created.created_at).toBeDefined();
      expect(created.updated_at).toBeDefined();

      // 생성된 코스 조회 가능
      const found = await mockRepository.findById(created.id);
      expect(found).toEqual(created);
    });
  });

  describe('update', () => {
    it('should update course fields', async () => {
      // Given: 기존 코스
      const course = await mockRepository.create({
        title: 'Original Title',
        description: 'Original description',
        instructor_id: 'instructor-123',
        price: 49.99,
        is_published: false,
      });

      const originalCreatedAt = course.created_at;

      // When: 코스 업데이트
      const updated = await mockRepository.update(course.id, {
        title: 'Updated Title',
        price: 59.99,
        is_published: true,
      });

      // Then: 필드가 업데이트되고 updated_at 변경
      expect(updated.title).toBe('Updated Title');
      expect(updated.price).toBe(59.99);
      expect(updated.is_published).toBe(true);
      expect(updated.description).toBe('Original description'); // 변경 안 된 필드
      expect(updated.created_at).toBe(originalCreatedAt); // created_at은 유지
      expect(updated.updated_at).not.toBe(originalCreatedAt); // updated_at은 변경
    });

    it('should throw error when updating non-existent course', async () => {
      // When/Then: 존재하지 않는 코스 업데이트 시 에러
      await expect(
        mockRepository.update('non-existent', { title: 'New Title' })
      ).rejects.toThrow('Record with id non-existent not found');
    });
  });

  describe('delete', () => {
    it('should delete a course', async () => {
      // Given: 코스 생성
      const course = await mockRepository.create({
        title: 'To Be Deleted',
        description: 'This will be deleted',
        instructor_id: 'instructor-123',
        price: 29.99,
        is_published: false,
      });

      // When: 코스 삭제
      const deleted = await mockRepository.delete(course.id);

      // Then: 삭제 성공 및 조회 불가
      expect(deleted).toBe(true);
      const found = await mockRepository.findById(course.id);
      expect(found).toBeNull();
    });

    it('should return false when deleting non-existent course', async () => {
      // When: 존재하지 않는 코스 삭제
      const deleted = await mockRepository.delete('non-existent');

      // Then: false 반환
      expect(deleted).toBe(false);
    });
  });

  describe('bulk operations', () => {
    it('should handle bulk create and filtering', async () => {
      // Given: 여러 코스 한번에 생성
      const courses = [
        {
          title: 'Course 1',
          instructor_id: 'inst-1',
          price: 10,
          is_published: true,
        },
        {
          title: 'Course 2',
          instructor_id: 'inst-1',
          price: 20,
          is_published: false,
        },
        {
          title: 'Course 3',
          instructor_id: 'inst-2',
          price: 30,
          is_published: true,
        },
        {
          title: 'Course 4',
          instructor_id: 'inst-2',
          price: 40,
          is_published: true,
        },
      ].map((c) => ({
        ...c,
        description: `Description for ${c.title}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      await mockRepository.bulkCreate(courses);

      // When/Then: 다양한 조회 테스트
      const all = await mockRepository.findAll();
      expect(all).toHaveLength(4);

      const inst1Courses = await mockRepository.findByInstructor('inst-1');
      expect(inst1Courses).toHaveLength(2);

      const publishedCourses = await mockRepository.findPublished();
      expect(publishedCourses).toHaveLength(3);

      const count = mockRepository.count();
      expect(count).toBe(4);
    });
  });
});
