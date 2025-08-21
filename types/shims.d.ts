/* eslint-disable @typescript-eslint/no-explicit-any */
// 0) 안전망: @/* 별칭 모듈 전부 any로 처리 (정밀 타입은 추후)
declare module '@/*' {
  const anyModule: any;
  export = anyModule;
}

// 1) Supabase 클라이언트
declare module '@/app/lib/supabase/client' {
  const client: any;
  export default client;
  export const supabase: any;
}

// 2) 서버 액션들
declare module '@/app/lib/actions/*' {
  const anyActionModule: any;
  export = anyActionModule;
}

// 3) 전역 타입 모듈
declare module '@/types' {
  export interface ContentItem {
    id?: string;
    content_type?: string;
    [key: string]: any;
  }
  export interface UserProfile {
    phone?: string;
    [key: string]: any;
  }
  export type Lesson = any;
  export type CourseTopic = any;
  export type User = any;
}

// 4) 테스트에서 직접 임포트하는 유틸
declare module '@/app/lib/utils/courseDataMapper' {
  export const mapFormDataToDB: any;
  export const mapDBToFormData: any;
  export const mapFormDataToSettings: any;
  export const logUnmappedFields: any;
}

// 5) repositories 인덱스 임포트용 (테스트에서 참조)
declare module '@/app/lib/repositories' {
  export const RepositoryFactory: any;
  export interface IRepository<T> {
    findById(id: string): Promise<T | null>;
    findAll(): Promise<T[]>;
    create(data: Partial<T>): Promise<T>;
    update(id: string, data: Partial<T>): Promise<T>;
    delete(id: string): Promise<boolean>;
  }
}

// 6) 특정 repository 모듈들
declare module '@/app/lib/repositories/course.repository' {
  export interface Course {
    id: string;
    [key: string]: any;
  }
}

declare module '@/app/lib/repositories/enrollment.repository' {
  export interface Enrollment {
    id: string;
    [key: string]: any;
  }
}

// 7) 테스트 mock repository
declare module '@/tests/mocks/repositories/mock.repository' {
  export class MockCourseRepository<T> {
    [key: string]: any;
  }
  export class MockEnrollmentRepository<T> {
    [key: string]: any;
  }
}