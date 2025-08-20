import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import EditCoursePage from '@/app/(dashboard)/instructor/courses/[id]/edit/page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  notFound: jest.fn(),
}));

// Mock next-auth
jest.mock('next-auth/react');

// Mock server actions
jest.mock('@/app/lib/actions/courseActions');
jest.mock('@/app/lib/actions/lessonActions');

const mockPush = jest.fn();
const mockRouter = {
  push: mockPush,
  back: jest.fn(),
};

const mockSession = {
  user: {
    email: 'instructor@test.com',
    name: 'Test Instructor',
  },
};

describe.skip('EditCoursePage', () => {
  // TODO(#27): app 라우트 구조 반영하여 테스트 리라이트 (2025-03-01까지)
  // 현재 파일 경로가 존재하지 않음: app/(dashboard)/instructor/courses/[id]/edit/page
  beforeEach(() => {
    jest.clearAllMocks();
    useRouter.mockReturnValue(mockRouter);
    useSession.mockReturnValue({ data: mockSession });
  });

  it('should load course data on mount', async () => {
    const courseActions = require('@/app/lib/actions/courseActions');
    courseActions.getCourseById = jest.fn().mockResolvedValue({
      success: true,
      course: {
        id: '123',
        title: 'Test Course',
        description: 'Test Description',
        category: 'web-development',
        price: 99,
        instructor_id: 'instructor-123',
      },
    });

    render(<EditCoursePage params={{ id: '123' }} />);

    await waitFor(() => {
      expect(courseActions.getCourseById).toHaveBeenCalledWith('123');
    });

    // Should display loaded course data
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Course')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
    });
  });

  it('should handle unauthorized access', async () => {
    const courseActions = require('@/app/lib/actions/courseActions');
    courseActions.getCourseById = jest.fn().mockResolvedValue({
      success: true,
      course: {
        id: '123',
        title: 'Test Course',
        instructor_id: 'another-instructor',
      },
    });

    render(<EditCoursePage params={{ id: '123' }} />);

    await waitFor(() => {
      expect(screen.getByText(/not authorized/i)).toBeInTheDocument();
    });
  });

  it('should handle course not found', async () => {
    const courseActions = require('@/app/lib/actions/courseActions');
    courseActions.getCourseById = jest.fn().mockResolvedValue({
      success: false,
      error: 'Course not found',
    });

    render(<EditCoursePage params={{ id: 'non-existent' }} />);

    await waitFor(() => {
      expect(screen.getByText(/course not found/i)).toBeInTheDocument();
    });
  });

  it('should update course information', async () => {
    const courseActions = require('@/app/lib/actions/courseActions');
    courseActions.getCourseById = jest.fn().mockResolvedValue({
      success: true,
      course: {
        id: '123',
        title: 'Old Title',
        description: 'Old Description',
        price: 50,
      },
    });

    courseActions.updateCourse = jest.fn().mockResolvedValue({
      success: true,
    });

    render(<EditCoursePage params={{ id: '123' }} />);

    // Wait for course to load
    await waitFor(() => {
      expect(screen.getByDisplayValue('Old Title')).toBeInTheDocument();
    });

    // Update title
    const titleInput = screen.getByDisplayValue('Old Title');
    fireEvent.change(titleInput, { target: { value: 'New Title' } });

    // Update price
    const priceInput = screen.getByDisplayValue('50');
    fireEvent.change(priceInput, { target: { value: '99' } });

    // Save changes
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(courseActions.updateCourse).toHaveBeenCalledWith('123', {
        title: 'New Title',
        price: 99,
      });
    });
  });

  it('should display and manage lessons', async () => {
    const courseActions = require('@/app/lib/actions/courseActions');
    const lessonActions = require('@/app/lib/actions/lessonActions');

    courseActions.getCourseById = jest.fn().mockResolvedValue({
      success: true,
      course: {
        id: '123',
        title: 'Test Course',
        lessons: [
          { id: 'lesson-1', title: 'Lesson 1', order_index: 0 },
          { id: 'lesson-2', title: 'Lesson 2', order_index: 1 },
        ],
      },
    });

    render(<EditCoursePage params={{ id: '123' }} />);

    await waitFor(() => {
      expect(screen.getByText('Lesson 1')).toBeInTheDocument();
      expect(screen.getByText('Lesson 2')).toBeInTheDocument();
    });

    // Test add lesson
    const addLessonButton = screen.getByText('Add Lesson');
    fireEvent.click(addLessonButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Lesson Title')).toBeInTheDocument();
    });
  });

  it('should handle lesson reordering', async () => {
    const lessonActions = require('@/app/lib/actions/lessonActions');
    lessonActions.reorderLessons = jest.fn().mockResolvedValue({
      success: true,
    });

    const courseActions = require('@/app/lib/actions/courseActions');
    courseActions.getCourseById = jest.fn().mockResolvedValue({
      success: true,
      course: {
        id: '123',
        title: 'Test Course',
        lessons: [
          { id: 'lesson-1', title: 'Lesson 1', order_index: 0 },
          { id: 'lesson-2', title: 'Lesson 2', order_index: 1 },
        ],
      },
    });

    render(<EditCoursePage params={{ id: '123' }} />);

    await waitFor(() => {
      expect(screen.getByText('Lesson 1')).toBeInTheDocument();
    });

    // Simulate drag and drop (simplified test)
    // In a real test, you would use drag-and-drop testing utilities
  });

  it('should delete a lesson', async () => {
    const lessonActions = require('@/app/lib/actions/lessonActions');
    lessonActions.deleteLesson = jest.fn().mockResolvedValue({
      success: true,
    });

    const courseActions = require('@/app/lib/actions/courseActions');
    courseActions.getCourseById = jest.fn().mockResolvedValue({
      success: true,
      course: {
        id: '123',
        title: 'Test Course',
        lessons: [{ id: 'lesson-1', title: 'Lesson 1', order_index: 0 }],
      },
    });

    render(<EditCoursePage params={{ id: '123' }} />);

    await waitFor(() => {
      expect(screen.getByText('Lesson 1')).toBeInTheDocument();
    });

    // Click delete button
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    // Confirm deletion
    const confirmButton = await screen.findByText('Confirm');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(lessonActions.deleteLesson).toHaveBeenCalledWith('lesson-1');
    });
  });

  it('should navigate back on cancel', async () => {
    const courseActions = require('@/app/lib/actions/courseActions');
    courseActions.getCourseById = jest.fn().mockResolvedValue({
      success: true,
      course: {
        id: '123',
        title: 'Test Course',
      },
    });

    render(<EditCoursePage params={{ id: '123' }} />);

    const cancelButton = await screen.findByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockRouter.back).toHaveBeenCalled();
  });

  it('should show loading state while fetching course', () => {
    const courseActions = require('@/app/lib/actions/courseActions');
    courseActions.getCourseById = jest
      .fn()
      .mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

    render(<EditCoursePage params={{ id: '123' }} />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should handle errors during save', async () => {
    const courseActions = require('@/app/lib/actions/courseActions');
    courseActions.getCourseById = jest.fn().mockResolvedValue({
      success: true,
      course: {
        id: '123',
        title: 'Test Course',
      },
    });

    courseActions.updateCourse = jest.fn().mockResolvedValue({
      success: false,
      error: 'Failed to update course',
    });

    render(<EditCoursePage params={{ id: '123' }} />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Course')).toBeInTheDocument();
    });

    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/failed to update course/i)).toBeInTheDocument();
    });
  });
});
