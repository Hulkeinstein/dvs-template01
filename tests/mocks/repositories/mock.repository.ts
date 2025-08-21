/**
 * Mock Repository for Testing
 * 테스트에서 사용할 메모리 기반 Mock Repository
 */

import { IRepository } from '@/app/lib/repositories';

export class MockRepository<T extends { id: string }>
  implements IRepository<T>
{
  private data: Map<string, T> = new Map();
  private idCounter = 1;

  /**
   * ID로 조회
   */
  async findById(id: string): Promise<T | null> {
    return this.data.get(id) || null;
  }

  /**
   * 모든 레코드 조회
   */
  async findAll(): Promise<T[]> {
    return Array.from(this.data.values());
  }

  /**
   * 생성
   */
  async create(data: Partial<T>): Promise<T> {
    const id = data.id || `mock-${this.idCounter++}`;
    const created = {
      ...data,
      id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.data.set(id, created as unknown as T);
    return created as unknown as T;
  }

  /**
   * 업데이트
   */
  async update(id: string, data: Partial<T>): Promise<T> {
    const existing = this.data.get(id);
    if (!existing) {
      throw new Error(`Record with id ${id} not found`);
    }

    const updated = {
      ...existing,
      ...data,
      id, // ID는 변경 불가
      updated_at: new Date().toISOString(),
    } as T;

    this.data.set(id, updated);
    return updated;
  }

  /**
   * 삭제
   */
  async delete(id: string): Promise<boolean> {
    return this.data.delete(id);
  }

  /**
   * 테스트용 헬퍼 메서드들
   */

  /**
   * 모든 데이터 초기화
   */
  clear(): void {
    this.data.clear();
    this.idCounter = 1;
  }

  /**
   * 데이터 개수
   */
  count(): number {
    return this.data.size;
  }

  /**
   * 특정 필드로 검색
   */
  async findByField(field: keyof T, value: any): Promise<T[]> {
    return Array.from(this.data.values()).filter(
      (item) => item[field] === value
    );
  }

  /**
   * 여러 데이터 한번에 추가
   */
  async bulkCreate(items: Partial<T>[]): Promise<T[]> {
    const created: T[] = [];
    for (const item of items) {
      created.push(await this.create(item));
    }
    return created;
  }

  /**
   * 조건에 맞는 첫 번째 아이템
   */
  async findOne(predicate: (item: T) => boolean): Promise<T | null> {
    for (const item of this.data.values()) {
      if (predicate(item)) {
        return item;
      }
    }
    return null;
  }

  /**
   * 조건에 맞는 모든 아이템
   */
  async findMany(predicate: (item: T) => boolean): Promise<T[]> {
    return Array.from(this.data.values()).filter(predicate);
  }
}

/**
 * Course Mock Repository
 */
export class MockCourseRepository<
  T extends { id: string; instructor_id?: string; is_published?: boolean },
> extends MockRepository<T> {
  async findByInstructor(instructorId: string): Promise<T[]> {
    return this.findByField('instructor_id' as keyof T, instructorId);
  }

  async findPublished(): Promise<T[]> {
    return this.findMany((course) => course.is_published === true);
  }
}

/**
 * Lesson Mock Repository
 */
export class MockLessonRepository<
  T extends {
    id: string;
    course_id?: string;
    topic_id?: string;
    order_index?: number;
  },
> extends MockRepository<T> {
  async findByCourse(courseId: string): Promise<T[]> {
    const lessons = await this.findByField('course_id' as keyof T, courseId);
    return lessons.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
  }

  async findByTopic(topicId: string): Promise<T[]> {
    const lessons = await this.findByField('topic_id' as keyof T, topicId);
    return lessons.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
  }
}

/**
 * User Mock Repository
 */
export class MockUserRepository<
  T extends { id: string; email?: string; role?: string },
> extends MockRepository<T> {
  async findByEmail(email: string): Promise<T | null> {
    return this.findOne((user) => user.email === email);
  }

  async findByRole(role: string): Promise<T[]> {
    return this.findMany((user) => user.role === role);
  }
}

/**
 * Enrollment Mock Repository
 */
export class MockEnrollmentRepository<
  T extends {
    id: string;
    user_id?: string;
    course_id?: string;
    progress?: number;
    completed_at?: string;
  },
> extends MockRepository<T> {
  async findByUser(userId: string): Promise<T[]> {
    return this.findByField('user_id' as keyof T, userId);
  }

  async findByCourse(courseId: string): Promise<T[]> {
    return this.findByField('course_id' as keyof T, courseId);
  }

  async findByUserAndCourse(
    userId: string,
    courseId: string
  ): Promise<T | null> {
    return this.findOne(
      (e) => e.user_id === userId && e.course_id === courseId
    );
  }

  async findCompleted(userId: string): Promise<T[]> {
    return this.findMany((e) => e.user_id === userId && e.completed_at != null);
  }

  async findInProgress(userId: string): Promise<T[]> {
    return this.findMany(
      (e) =>
        e.user_id === userId && e.completed_at == null && (e.progress || 0) > 0
    );
  }
}
