/**
 * Course Data Mapper Test Suite
 *
 * DB 스키마와 UI 폼 데이터 간의 변환을 테스트합니다.
 */

import {
  mapFormDataToDB,
  mapDBToFormData,
  mapFormDataToSettings,
  logUnmappedFields,
} from '@/app/lib/utils/courseDataMapper';

// Extended interface for testing
interface TestFormData {
  title?: string;
  shortDescription?: string;
  description?: string;
  price?: number | string;
  discountPrice?: number | string | null;
  language?: string;
  level?: string;
  maxStudents?: number | string;
  introVideoUrl?: string;
  startDate?: string;
  requirements?: string;
  targetedAudience?: string;
  totalDurationHours?: number | string;
  totalDurationMinutes?: number | string;
  duration?: number | string;
  contentDripEnabled?: boolean;
  contentDripType?: string;
  courseTags?: string;
  slug?: string;
  category?: string;
  thumbnail_url?: string;
  status?: string;
  certificateEnabled?: boolean;
  certificateTitle?: string;
  passingGrade?: number | string;
  enrollmentDeadline?: string;
  endDate?: string;
  lifetimeAccess?: boolean;
  thumbnailPreview?: string | null;
  topics?: Array<{
    id?: string;
    name?: string;
    summary?: string;
    lessons?: unknown[];
    quizzes?: unknown[];
    assignments?: unknown[];
  }>;
  // For testing unmapped fields
  unknownField?: string;
  anotherUnknownField?: number;
}

interface TestDBData {
  title?: string;
  description?: string | null;
  about_course?: string | null;
  regular_price?: number;
  discounted_price?: number | null;
  language?: string;
  difficulty_level?: string;
  max_students?: number;
  intro_video_url?: string | null;
  is_free?: boolean;
  start_date?: string | null;
  requirements?: string | null;
  targeted_audience?: string | null;
  total_duration_hours?: number;
  total_duration_minutes?: number;
  content_drip_enabled?: boolean;
  content_drip_type?: string | null;
  course_tags?: string[] | null;
  slug?: string;
  category?: string;
  thumbnail_url?: string;
  status?: string;
  end_date?: string;
  course_settings?: Array<{
    certificate_enabled?: boolean;
    certificate_title?: string;
    passing_grade?: number;
    enrollment_deadline?: string;
    end_date?: string;
    allow_lifetime_access?: boolean;
  }>;
}

describe('Course Data Mapper', () => {
  describe('mapFormDataToDB', () => {
    it('should map basic form fields to DB schema', () => {
      const formData = {
        title: 'Test Course',
        shortDescription: 'Short desc',
        description: 'Long description about the course',
        price: '100',
        discountPrice: '80',
        language: 'Korean',
        level: 'Intermediate',
        maxStudents: '30',
        introVideoUrl: 'https://youtube.com/watch?v=123',
      };

      const dbData = mapFormDataToDB(formData);

      expect(dbData.title).toBe('Test Course');
      expect(dbData.description).toBe('Short desc'); // shortDescription → description
      expect(dbData.about_course).toBe('Long description about the course'); // description → about_course
      expect(dbData.regular_price).toBe(100);
      expect(dbData.discounted_price).toBe(80);
      expect(dbData.language).toBe('Korean');
      expect(dbData.difficulty_level).toBe('Intermediate');
      expect(dbData.max_students).toBe(30);
      expect(dbData.intro_video_url).toBe('https://youtube.com/watch?v=123');
    });

    it('should handle free courses correctly', () => {
      const formData = {
        title: 'Free Course',
        price: '0',
      };

      const dbData = mapFormDataToDB(formData);

      expect(dbData.is_free).toBe(true);
      expect(dbData.regular_price).toBe(0);
    });

    it('should convert course tags string to array', () => {
      const formData = {
        courseTags: 'javascript, react, nextjs',
      };

      const dbData = mapFormDataToDB(formData);

      expect(dbData.course_tags).toEqual(['javascript', 'react', 'nextjs']);
    });

    it('should handle empty course tags', () => {
      const formData = {
        courseTags: '',
      };

      const dbData = mapFormDataToDB(formData);

      expect(dbData.course_tags).toEqual([]);
    });

    it('should handle duration fields correctly', () => {
      const formData = {
        totalDurationHours: '5',
        totalDurationMinutes: '30',
      };

      const dbData = mapFormDataToDB(formData);

      expect(dbData.total_duration_hours).toBe(5);
      expect(dbData.total_duration_minutes).toBe(30);
    });

    it('should handle content drip settings', () => {
      const formData = {
        contentDripEnabled: true,
        contentDripType: 'weekly',
      };

      const dbData = mapFormDataToDB(formData);

      expect(dbData.content_drip_enabled).toBe(true);
      expect(dbData.content_drip_type).toBe('weekly');
    });

    it('should handle optional fields', () => {
      const formData = {
        title: 'Test',
        slug: 'test-course',
        category: 'Development',
        thumbnail_url: 'https://example.com/image.jpg',
        status: 'published',
      };

      const dbData = mapFormDataToDB(formData);

      expect(dbData.slug).toBe('test-course');
      expect(dbData.category).toBe('Development');
      expect(dbData.thumbnail_url).toBe('https://example.com/image.jpg');
      expect(dbData.status).toBe('published');
    });

    it('should handle undefined optional fields', () => {
      const formData = {
        title: 'Test',
      };

      const dbData = mapFormDataToDB(formData);

      expect(dbData.slug).toBeUndefined();
      expect(dbData.category).toBeUndefined();
      expect(dbData.thumbnail_url).toBeUndefined();
    });
  });

  describe('mapDBToFormData', () => {
    it('should map DB data to form fields', () => {
      const dbData = {
        title: 'Test Course',
        description: 'Short desc',
        about_course: 'Long description',
        regular_price: 100,
        discounted_price: 80,
        language: 'English',
        difficulty_level: 'Beginner',
        max_students: 50,
        intro_video_url: 'https://youtube.com/watch?v=456',
        is_free: false,
        total_duration_hours: 10,
        total_duration_minutes: 45,
        content_drip_enabled: true,
        content_drip_type: 'daily',
        course_tags: ['node', 'express', 'mongodb'],
        status: 'draft',
      };

      const formData = mapDBToFormData(dbData);

      expect(formData.title).toBe('Test Course');
      expect(formData.shortDescription).toBe('Short desc'); // description → shortDescription
      expect(formData.description).toBe('Long description'); // about_course → description
      expect(formData.price).toBe(100);
      expect(formData.discountPrice).toBe(80);
      expect(formData.language).toBe('English');
      expect(formData.level).toBe('Beginner');
      expect(formData.maxStudents).toBe(50);
      expect(formData.introVideoUrl).toBe('https://youtube.com/watch?v=456');
      expect(formData.totalDurationHours).toBe(10);
      expect(formData.totalDurationMinutes).toBe(45);
      expect(formData.contentDripEnabled).toBe(true);
      expect(formData.contentDripType).toBe('daily');
      expect(formData.courseTags).toBe('node, express, mongodb');
      expect(formData.status).toBe('draft');
    });

    it('should handle course settings data', () => {
      const dbData = {
        title: 'Test',
        course_settings: [
          {
            certificate_enabled: true,
            certificate_title: 'Completion Certificate',
            passing_grade: 85,
            enrollment_deadline: '2024-12-31',
            end_date: '2025-01-31',
            allow_lifetime_access: false,
          },
        ],
      };

      const formData = mapDBToFormData(dbData);

      expect(formData.certificateEnabled).toBe(true);
      expect(formData.certificateTitle).toBe('Completion Certificate');
      expect(formData.passingGrade).toBe(85);
      expect(formData.enrollmentDeadline).toBe('2024-12-31');
      expect(formData.endDate).toBe('2025-01-31');
      expect(formData.lifetimeAccess).toBe(false);
    });

    it('should handle missing course settings', () => {
      const dbData = {
        title: 'Test',
      };

      const formData = mapDBToFormData(dbData);

      expect(formData.certificateEnabled).toBe(false);
      expect(formData.certificateTitle).toBe('');
      expect(formData.passingGrade).toBe(70);
      expect(formData.lifetimeAccess).toBe(true);
    });

    it('should handle null values gracefully', () => {
      const dbData: TestDBData = {
        title: 'Test',
        description: null,
        about_course: null,
        discounted_price: null,
        intro_video_url: null,
        course_tags: null,
      };

      const formData = mapDBToFormData(dbData);

      expect(formData.shortDescription).toBe('');
      expect(formData.description).toBe('');
      expect(formData.discountPrice).toBe(null);
      expect(formData.introVideoUrl).toBe('');
      expect(formData.courseTags).toBe('');
    });

    it('should set default values for missing fields', () => {
      const dbData = {};

      const formData = mapDBToFormData(dbData);

      expect(formData.title).toBe('');
      expect(formData.language).toBe('English');
      expect(formData.level).toBe('all_levels');
      expect(formData.maxStudents).toBe(0);
      expect(formData.price).toBe(0);
      expect(formData.status).toBe('draft');
      expect(formData.topics).toEqual([]);
    });
  });

  describe('mapFormDataToSettings', () => {
    it('should map form data to course settings', () => {
      const formData = {
        certificateEnabled: true,
        certificateTitle: 'Achievement Certificate',
        passingGrade: '90',
        maxStudents: '100',
        enrollmentDeadline: '2024-12-01',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        lifetimeAccess: false,
      };

      const settings = mapFormDataToSettings(formData);

      expect(settings.certificate_enabled).toBe(true);
      expect(settings.certificate_title).toBe('Achievement Certificate');
      expect(settings.passing_grade).toBe(90);
      expect(settings.max_students).toBe(100);
      expect(settings.enrollment_deadline).toBe('2024-12-01');
      expect(settings.start_date).toBe('2024-01-01');
      expect(settings.end_date).toBe('2024-12-31');
      expect(settings.allow_lifetime_access).toBe(false);
    });

    it('should handle default values', () => {
      const formData = {};

      const settings = mapFormDataToSettings(formData);

      expect(settings.certificate_enabled).toBe(false);
      expect(settings.certificate_title).toBe(null);
      expect(settings.passing_grade).toBe(70);
      expect(settings.max_students).toBe(null);
      expect(settings.allow_lifetime_access).toBe(true);
    });

    it('should handle number type conversion', () => {
      const formData = {
        passingGrade: 75, // number instead of string
        maxStudents: 50, // number instead of string
      };

      const settings = mapFormDataToSettings(formData);

      expect(settings.passing_grade).toBe(75);
      expect(settings.max_students).toBe(50);
    });
  });

  describe('Round-trip conversion', () => {
    it('should maintain data integrity through round-trip conversion', () => {
      const originalFormData = {
        title: 'Complete Course',
        shortDescription: 'Brief overview',
        description: 'Detailed course content',
        price: 150,
        discountPrice: 120,
        language: 'Spanish',
        level: 'Advanced',
        maxStudents: 25,
        introVideoUrl: 'https://vimeo.com/123456',
        startDate: '2024-03-01',
        requirements: 'Basic knowledge required',
        targetedAudience: 'Professionals',
        totalDurationHours: 8,
        totalDurationMinutes: 30,
        contentDripEnabled: true,
        contentDripType: 'monthly',
        courseTags: 'python, django, web',
        slug: 'complete-course',
        category: 'Programming',
        status: 'published',
      };

      // Convert to DB format
      const dbData = mapFormDataToDB(originalFormData);

      // Convert back to form format
      const convertedFormData = mapDBToFormData(dbData);

      // Check key mappings
      expect(convertedFormData.title).toBe(originalFormData.title);
      expect(convertedFormData.shortDescription).toBe(
        originalFormData.shortDescription
      );
      expect(convertedFormData.description).toBe(originalFormData.description);
      expect(convertedFormData.price).toBe(originalFormData.price);
      expect(convertedFormData.discountPrice).toBe(
        originalFormData.discountPrice
      );
      expect(convertedFormData.language).toBe(originalFormData.language);
      expect(convertedFormData.level).toBe(originalFormData.level);
      expect(convertedFormData.maxStudents).toBe(originalFormData.maxStudents);
      expect(convertedFormData.introVideoUrl).toBe(
        originalFormData.introVideoUrl
      );
      expect(convertedFormData.totalDurationHours).toBe(
        originalFormData.totalDurationHours
      );
      expect(convertedFormData.totalDurationMinutes).toBe(
        originalFormData.totalDurationMinutes
      );
      expect(convertedFormData.contentDripEnabled).toBe(
        originalFormData.contentDripEnabled
      );
      expect(convertedFormData.contentDripType).toBe(
        originalFormData.contentDripType
      );
      expect(convertedFormData.courseTags).toBe(originalFormData.courseTags);
      expect(convertedFormData.slug).toBe(originalFormData.slug);
      expect(convertedFormData.category).toBe(originalFormData.category);
      expect(convertedFormData.status).toBe(originalFormData.status);
    });
  });

  describe('logUnmappedFields', () => {
    it('should not throw errors when logging unmapped fields', () => {
      const formData: TestFormData = {
        title: 'Test',
        unknownField: 'value',
        anotherUnknownField: 123,
      };

      const dbData = mapFormDataToDB(formData);

      // Should not throw
      expect(() => logUnmappedFields(formData, dbData)).not.toThrow();
    });

    it('should ignore topics and thumbnailPreview fields', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const formData = {
        title: 'Test',
        topics: [],
        thumbnailPreview: 'preview.jpg',
      };

      const dbData = mapFormDataToDB(formData);
      logUnmappedFields(formData, dbData);

      // Should not warn about topics or thumbnailPreview
      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
});
