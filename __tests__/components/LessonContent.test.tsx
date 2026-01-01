import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LessonContent from '@/app/(courses)/(lessons)/lesson/[id]/LessonContent';
import { useSession } from 'next-auth/react';
import { getLessonById } from '@/app/lib/actions/lessonActions';
import { getQuizByLessonId } from '@/app/lib/actions/quizActions';
import { getLessonProgress } from '@/app/lib/actions/progressActions';

// Mocks
jest.mock('next-auth/react');
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));
jest.mock('@/app/lib/actions/lessonActions');
jest.mock('@/app/lib/actions/quizActions');
jest.mock('@/app/lib/actions/progressActions');

// Component Mocks - inline to avoid hoisting issues
jest.mock('@/components/Lesson/LessonSidebar', () => {
  const MockLessonSidebar = () => (
    <div data-testid="lesson-sidebar">Sidebar</div>
  );
  MockLessonSidebar.displayName = 'MockLessonSidebar';
  return MockLessonSidebar;
});

jest.mock('@/components/Lesson/LessonPagination', () => {
  const MockLessonPagination = () => (
    <div data-testid="lesson-pagination">Pagination</div>
  );
  MockLessonPagination.displayName = 'MockLessonPagination';
  return MockLessonPagination;
});

jest.mock('@/components/Lesson/LessonTop', () => {
  const React = require('react');
  const MockLessonTop = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="lesson-top">{children}</div>
  );
  MockLessonTop.displayName = 'MockLessonTop';
  return MockLessonTop;
});

jest.mock('@/components/Lesson/LessonCompleteButton', () => {
  const MockLessonCompleteButton = () => (
    <button data-testid="complete-btn">Complete</button>
  );
  MockLessonCompleteButton.displayName = 'MockLessonCompleteButton';
  return MockLessonCompleteButton;
});

jest.mock('@/components/Lesson/CreatorInfo', () => {
  const MockCreatorInfo = () => (
    <div data-testid="creator-info">Creator Info</div>
  );
  MockCreatorInfo.displayName = 'MockCreatorInfo';
  return MockCreatorInfo;
});

jest.mock('@/components/Lesson/LessonQuiz', () => {
  const MockLessonQuiz = () => <div data-testid="lesson-quiz">Quiz</div>;
  MockLessonQuiz.displayName = 'MockLessonQuiz';
  return MockLessonQuiz;
});

// Mock LessonVideo to verify props
jest.mock('@/components/Lesson/LessonVideo', () => {
  const MockLessonVideo = ({ seekTime }: { seekTime?: number }) => {
    return (
      <div data-testid="lesson-video" data-seek-time={seekTime}>
        Video Player
      </div>
    );
  };
  MockLessonVideo.displayName = 'MockLessonVideo';
  return MockLessonVideo;
});

// Mock SummaryDisplay to trigger clicks
jest.mock('@/components/Lesson/SummaryDisplay', () => {
  const MockSummaryDisplay = ({
    onTimestampClick,
  }: {
    onTimestampClick?: (seconds: number) => void;
  }) => {
    return (
      <div data-testid="summary-display">
        Summary Found
        <button onClick={() => onTimestampClick?.(120)}>Jump to 2:00</button>
      </div>
    );
  };
  MockSummaryDisplay.displayName = 'MockSummaryDisplay';
  return MockSummaryDisplay;
});

describe('LessonContent Component', () => {
  const mockLessonId = 'lesson-123';
  const mockUserId = 'user-456';

  const mockSummaryData = {
    key_notes: ['Note 1'],
    detailed_notes: [],
  };

  const mockVideoLesson = {
    id: mockLessonId,
    course_id: 'course-1',
    title: 'Test Lesson',
    content_type: 'video',
    video_source: 'youtube',
    video_url: 'https://youtube.com/watch?v=abcd',
    content_data: {
      url: 'https://youtube.com/watch?v=abcd',
      youtube: {
        channel_name: 'Test Channel',
        // ... other fields
      },
      summary: mockSummaryData,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Auth Session
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { id: mockUserId } },
      status: 'authenticated',
    });

    // Default Action Responses
    (getQuizByLessonId as jest.Mock).mockResolvedValue({ success: false });
    (getLessonProgress as jest.Mock).mockResolvedValue({
      success: true,
      isCompleted: false,
    });
  });

  it('renders SummaryDisplay when summary data exists for YouTube video', async () => {
    // Given: Lesson with summary
    (getLessonById as jest.Mock).mockResolvedValue({
      success: true,
      lesson: mockVideoLesson,
    });

    // When
    render(<LessonContent lessonId={mockLessonId} />);

    // Then
    await waitFor(() => {
      expect(screen.getByTestId('summary-display')).toBeInTheDocument();
    });
  });

  it('does NOT render SummaryDisplay if summary is missing', async () => {
    // Given: Lesson without summary
    const noSummaryLesson = {
      ...mockVideoLesson,
      content_data: { ...mockVideoLesson.content_data, summary: null },
    };
    (getLessonById as jest.Mock).mockResolvedValue({
      success: true,
      lesson: noSummaryLesson,
    });

    // When
    render(<LessonContent lessonId={mockLessonId} />);

    // Then
    // Wait for loading to finish and content to appear
    await waitFor(() => {
      expect(screen.getByTestId('lesson-video')).toBeInTheDocument();
    });

    // Now check summary is not there
    expect(screen.queryByTestId('summary-display')).not.toBeInTheDocument();
  });

  it('passes seekTime to LessonVideo when timestamp is clicked', async () => {
    // Given
    (getLessonById as jest.Mock).mockResolvedValue({
      success: true,
      lesson: mockVideoLesson,
    });

    render(<LessonContent lessonId={mockLessonId} />);

    // Wait for load
    await waitFor(() => {
      expect(screen.getByTestId('summary-display')).toBeInTheDocument();
    });

    // Verify initial state (seekTime is null/undefined)
    const video = screen.getByTestId('lesson-video');
    expect(video).not.toHaveAttribute('data-seek-time');

    // When: Click timestamp (simulated by button in mock)
    fireEvent.click(screen.getByText('Jump to 2:00'));

    // Then: LessonVideo receives seekTime=120
    await waitFor(() => {
      expect(video).toHaveAttribute('data-seek-time', '120');
    });
  });
});
