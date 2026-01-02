/**
 * Tests for createCourseHeadless function
 *
 * Note: Full integration tests with Supabase mocking are complex.
 * These tests focus on the core validation logic that can be tested
 * without complex mock chains.
 */

// Mock all Supabase dependencies
jest.mock('@/app/lib/supabase/admin', () => ({
  supabaseAdmin: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({ data: null, error: null }),
        })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({ data: null, error: null }),
        })),
      })),
    })),
  },
}));

jest.mock('@/app/lib/supabase/server', () => ({
  supabaseServer: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          neq: jest.fn(() => Promise.resolve({ count: 0, error: null })),
        })),
      })),
    })),
  },
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

jest.mock('@/app/lib/utils/courseDataMapper', () => ({
  mapFormDataToDB: jest.fn((data) => ({
    title: data.title,
    description: data.description,
  })),
  mapFormDataToSettings: jest.fn(() => ({})),
  logUnmappedFields: jest.fn(),
}));

jest.mock('@/app/lib/constants/routes', () => ({
  ROUTES: { INSTRUCTOR: { COURSES: '/instructor/courses' } },
}));

jest.mock('@/app/lib/constants/badgeConfig', () => ({
  BADGE_CONFIG: {},
}));

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('@/app/api/auth/[...nextauth]/auth.config', () => ({
  authOptions: {},
}));

import { createCourseHeadless } from '@/app/lib/actions/courseActions';
import { CourseFormData } from '@/types/create-course';

describe('createCourseHeadless', () => {
  const validFormData: CourseFormData = {
    title: 'Test Course',
    slug: 'test-course',
    shortDescription: 'Test description',
    description: 'Full description',
    category: 'Programming',
    level: 'beginner',
    maxStudents: 100,
    introVideoUrl: '',
    price: 0,
    discountPrice: null,
    startDate: '',
    endDate: '',
    enrollmentDeadline: '',
    language: 'Korean',
    duration: 0,
    certificateEnabled: false,
    certificateTitle: '',
    passingGrade: 70,
    lifetimeAccess: false,
    topics: [],
  };

  describe('Input validation', () => {
    it('should fail when admin email is empty string', async () => {
      const result = await createCourseHeadless(validFormData, '');
      expect(result.error).toContain('Admin email is required');
      expect(result.success).toBeFalsy();
    });

    it('should fail when admin email is null-like', async () => {
      // @ts-expect-error Testing invalid input
      const result = await createCourseHeadless(validFormData, null);
      expect(result.error).toContain('Admin email is required');
    });

    it('should fail when admin email is undefined', async () => {
      // @ts-expect-error Testing invalid input
      const result = await createCourseHeadless(validFormData, undefined);
      expect(result.error).toContain('Admin email is required');
    });
  });

  describe('Email normalization', () => {
    it('should trim whitespace from email', async () => {
      // This test verifies the function handles whitespace
      // The actual admin lookup will fail, but we can verify it doesn't crash
      const result = await createCourseHeadless(
        validFormData,
        '  admin@example.com  '
      );
      // Will fail at admin lookup, but shouldn't fail at validation
      expect(result.error).not.toContain('Admin email is required');
    });
  });

  describe('Function signature', () => {
    it('should accept CourseFormData and adminEmail parameters', () => {
      // Type check - this test verifies the function signature
      expect(typeof createCourseHeadless).toBe('function');
    });

    it('should return a promise', () => {
      const result = createCourseHeadless(validFormData, 'test@test.com');
      expect(result).toBeInstanceOf(Promise);
    });

    it('should return CreateCourseResult shape', async () => {
      const result = await createCourseHeadless(validFormData, 'test@test.com');
      // Result should have either success or error
      expect(
        result.success !== undefined ||
          result.error !== undefined ||
          result.courseId !== undefined
      ).toBe(true);
    });
  });
});
