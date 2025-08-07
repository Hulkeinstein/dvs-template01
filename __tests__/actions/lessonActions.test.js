import {
  createLesson,
  updateLesson,
  deleteLesson,
  reorderLessons,
  getLessonsByCourse,
} from '@/app/lib/actions/lessonActions';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth';

// Mock dependencies
jest.mock('@supabase/supabase-js');
jest.mock('next-auth');

describe('lessonActions', () => {
  let mockSupabase;
  let mockFrom;
  let mockSelect;
  let mockInsert;
  let mockUpdate;
  let mockDelete;
  let mockEq;
  let mockSingle;
  let mockOrder;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock chain
    mockOrder = jest.fn().mockReturnThis();
    mockSingle = jest.fn().mockReturnThis();
    mockEq = jest.fn().mockReturnThis();
    mockDelete = jest.fn().mockReturnThis();
    mockUpdate = jest.fn().mockReturnThis();
    mockInsert = jest.fn().mockReturnThis();
    mockSelect = jest.fn().mockReturnThis();
    mockFrom = jest.fn(() => ({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
      eq: mockEq,
      single: mockSingle,
      order: mockOrder,
    }));

    mockSupabase = {
      from: mockFrom,
    };

    createClient.mockReturnValue(mockSupabase);
    getServerSession.mockResolvedValue({
      user: { email: 'instructor@test.com' },
    });
  });

  describe('createLesson', () => {
    it('should create a new lesson successfully', async () => {
      // Mock user lookup
      mockSelect.mockResolvedValueOnce({
        data: { id: 'instructor-123' },
        error: null,
      });

      // Mock course ownership check
      mockSelect.mockResolvedValueOnce({
        data: { instructor_id: 'instructor-123' },
        error: null,
      });

      // Mock existing lessons count
      mockSelect.mockResolvedValueOnce({
        data: [{ id: 'lesson-1' }, { id: 'lesson-2' }],
        error: null,
      });

      // Mock lesson creation
      mockInsert.mockResolvedValueOnce({
        data: { id: 'new-lesson-id' },
        error: null,
      });

      const result = await createLesson({
        courseId: 'course-123',
        title: 'New Lesson',
        description: 'Lesson description',
        videoUrl: 'https://example.com/video.mp4',
      });

      expect(result.success).toBe(true);
      expect(result.lessonId).toBe('new-lesson-id');

      // Verify lesson was created with correct order_index
      expect(mockInsert).toHaveBeenCalledWith({
        course_id: 'course-123',
        title: 'New Lesson',
        description: 'Lesson description',
        video_url: 'https://example.com/video.mp4',
        order_index: 2, // 0-based index, so third lesson gets index 2
      });
    });

    it('should handle unauthorized access', async () => {
      // Mock user lookup
      mockSelect.mockResolvedValueOnce({
        data: { id: 'instructor-123' },
        error: null,
      });

      // Mock course ownership check - different instructor
      mockSelect.mockResolvedValueOnce({
        data: { instructor_id: 'different-instructor' },
        error: null,
      });

      const result = await createLesson({
        courseId: 'course-123',
        title: 'New Lesson',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('permission');
    });

    it('should handle database errors', async () => {
      mockSelect.mockResolvedValueOnce({
        data: null,
        error: new Error('Database error'),
      });

      const result = await createLesson({
        courseId: 'course-123',
        title: 'New Lesson',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('error');
    });
  });

  describe('updateLesson', () => {
    it('should update lesson successfully', async () => {
      // Mock user lookup
      mockSelect.mockResolvedValueOnce({
        data: { id: 'instructor-123' },
        error: null,
      });

      // Mock lesson ownership check
      mockSelect.mockResolvedValueOnce({
        data: {
          course_id: 'course-123',
          courses: { instructor_id: 'instructor-123' },
        },
        error: null,
      });

      // Mock lesson update
      mockUpdate.mockResolvedValueOnce({
        data: { id: 'lesson-123' },
        error: null,
      });

      const result = await updateLesson('lesson-123', {
        title: 'Updated Title',
        description: 'Updated Description',
      });

      expect(result.success).toBe(true);
      expect(mockUpdate).toHaveBeenCalledWith({
        title: 'Updated Title',
        description: 'Updated Description',
      });
    });

    it('should not allow updating restricted fields', async () => {
      // Mock user lookup
      mockSelect.mockResolvedValueOnce({
        data: { id: 'instructor-123' },
        error: null,
      });

      // Mock lesson ownership check
      mockSelect.mockResolvedValueOnce({
        data: {
          course_id: 'course-123',
          courses: { instructor_id: 'instructor-123' },
        },
        error: null,
      });

      // Mock lesson update
      mockUpdate.mockResolvedValueOnce({
        data: { id: 'lesson-123' },
        error: null,
      });

      const result = await updateLesson('lesson-123', {
        title: 'Updated Title',
        course_id: 'different-course', // This should be filtered out
        id: 'different-id', // This should be filtered out
      });

      expect(result.success).toBe(true);
      expect(mockUpdate).toHaveBeenCalledWith({
        title: 'Updated Title',
      });
    });
  });

  describe('deleteLesson', () => {
    it('should delete lesson and reorder remaining lessons', async () => {
      // Mock user lookup
      mockSelect.mockResolvedValueOnce({
        data: { id: 'instructor-123' },
        error: null,
      });

      // Mock lesson ownership check
      mockSelect.mockResolvedValueOnce({
        data: {
          course_id: 'course-123',
          order_index: 1,
          courses: { instructor_id: 'instructor-123' },
        },
        error: null,
      });

      // Mock lesson deletion
      mockDelete.mockResolvedValueOnce({
        error: null,
      });

      // Mock remaining lessons fetch
      mockSelect.mockResolvedValueOnce({
        data: [
          { id: 'lesson-1', order_index: 0 },
          { id: 'lesson-3', order_index: 2 },
        ],
        error: null,
      });

      // Mock reordering update
      mockUpdate.mockResolvedValueOnce({
        error: null,
      });

      const result = await deleteLesson('lesson-123');

      expect(result.success).toBe(true);
      expect(mockDelete).toHaveBeenCalled();

      // Verify reordering happened
      expect(mockUpdate).toHaveBeenCalledWith({ order_index: 1 });
    });
  });

  describe('reorderLessons', () => {
    it('should reorder lessons successfully', async () => {
      // Mock user lookup
      mockSelect.mockResolvedValueOnce({
        data: { id: 'instructor-123' },
        error: null,
      });

      // Mock course ownership check
      mockSelect.mockResolvedValueOnce({
        data: { instructor_id: 'instructor-123' },
        error: null,
      });

      // Mock lesson updates
      mockUpdate.mockResolvedValue({
        error: null,
      });

      const lessonOrders = [
        { id: 'lesson-3', order: 0 },
        { id: 'lesson-1', order: 1 },
        { id: 'lesson-2', order: 2 },
      ];

      const result = await reorderLessons('course-123', lessonOrders);

      expect(result.success).toBe(true);
      expect(mockUpdate).toHaveBeenCalledTimes(3);
    });

    it('should validate all lessons belong to the course', async () => {
      // Mock user lookup
      mockSelect.mockResolvedValueOnce({
        data: { id: 'instructor-123' },
        error: null,
      });

      // Mock course ownership check
      mockSelect.mockResolvedValueOnce({
        data: { instructor_id: 'instructor-123' },
        error: null,
      });

      // Mock lesson validation
      mockSelect.mockResolvedValueOnce({
        data: [
          { id: 'lesson-1' },
          { id: 'lesson-2' },
          // lesson-3 is missing, indicating it doesn't belong to this course
        ],
        error: null,
      });

      const lessonOrders = [
        { id: 'lesson-1', order: 0 },
        { id: 'lesson-2', order: 1 },
        { id: 'lesson-3', order: 2 }, // This doesn't belong to the course
      ];

      const result = await reorderLessons('course-123', lessonOrders);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid lesson IDs');
    });
  });

  describe('getLessonsByCourse', () => {
    it('should fetch lessons ordered by index', async () => {
      const mockLessons = [
        { id: 'lesson-1', title: 'Lesson 1', order_index: 0 },
        { id: 'lesson-2', title: 'Lesson 2', order_index: 1 },
      ];

      mockSelect.mockResolvedValueOnce({
        data: mockLessons,
        error: null,
      });

      const result = await getLessonsByCourse('course-123');

      expect(result.success).toBe(true);
      expect(result.lessons).toEqual(mockLessons);
      expect(mockOrder).toHaveBeenCalledWith('order_index', {
        ascending: true,
      });
    });

    it('should handle errors gracefully', async () => {
      mockSelect.mockResolvedValueOnce({
        data: null,
        error: new Error('Database error'),
      });

      const result = await getLessonsByCourse('course-123');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to fetch lessons');
    });
  });
});
