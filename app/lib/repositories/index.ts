/**
 * Repository Pattern Export
 * 모든 레포지토리의 중앙 export point
 */

import { courseRepository } from './course.repository';
import { lessonRepository } from './lesson.repository';
import { userRepository } from './user.repository';
import { enrollmentRepository } from './enrollment.repository';

export { BaseRepository } from './base.repository';
export type { IRepository } from './base.repository';

// Course
export { CourseRepository, courseRepository } from './course.repository';
export type { Course } from './course.repository';

// Lesson
export { LessonRepository, lessonRepository } from './lesson.repository';
export type { Lesson } from './lesson.repository';

// User
export { UserRepository, userRepository } from './user.repository';
export type { User } from './user.repository';

// Enrollment
export { EnrollmentRepository, enrollmentRepository } from './enrollment.repository';
export type { Enrollment } from './enrollment.repository';

/**
 * Repository Factory
 * 테스트에서 mock repository를 주입하기 위한 팩토리
 */
export class RepositoryFactory {
  private static repositories = new Map<string, any>();
  
  /**
   * Repository 등록
   */
  static register(name: string, repository: any): void {
    this.repositories.set(name, repository);
  }
  
  /**
   * Repository 가져오기
   */
  static get<T>(name: string): T {
    if (!this.repositories.has(name)) {
      throw new Error(`Repository ${name} not found`);
    }
    return this.repositories.get(name) as T;
  }
  
  /**
   * 모든 Repository 초기화
   */
  static reset(): void {
    this.repositories.clear();
  }
  
  /**
   * 기본 Repository 등록
   */
  static registerDefaults(): void {
    this.register('course', courseRepository);
    this.register('lesson', lessonRepository);
    this.register('user', userRepository);
    this.register('enrollment', enrollmentRepository);
  }
}

// 기본 Repository 등록
RepositoryFactory.registerDefaults();