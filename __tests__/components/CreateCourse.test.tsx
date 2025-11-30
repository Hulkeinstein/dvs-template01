import { render, screen } from '@testing-library/react';
import CreateCourse from '@/components/create-course/CreateCourse';
import { useSession } from 'next-auth/react';
import { useAutoSave } from '@/app/hooks/useAutoSave';

// Mock dependencies
jest.mock('next-auth/react');
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));
jest.mock('@/app/hooks/useAutoSave');
jest.mock('@/app/lib/utils/phoneVerification', () => ({
  isPhoneVerified: jest.fn().mockReturnValue(true),
}));
jest.mock('@/app/lib/actions/courseActions', () => ({
  getCourseById: jest.fn(),
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt} />;
  },
}));

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

// Mock react-select
jest.mock('react-select', () => ({
  __esModule: true,
  default: () => <div data-testid="Select" />,
}));

// Mock child components to avoid rendering issues
// Mock child components to avoid rendering issues
jest.mock('@/components/create-course/InfoFormNew', () => {
  const MockInfoFormNew = () => <div data-testid="InfoFormNew" />;
  MockInfoFormNew.displayName = 'InfoFormNew';
  return MockInfoFormNew;
});
jest.mock('@/components/create-course/AdditionalForm', () => {
  const MockAdditionalForm = () => <div data-testid="AdditionalForm" />;
  MockAdditionalForm.displayName = 'AdditionalForm';
  return MockAdditionalForm;
});
jest.mock('@/components/create-course/QuizModals/TopicModal', () => {
  const MockTopicModal = () => <div data-testid="TopicModal" />;
  MockTopicModal.displayName = 'TopicModal';
  return MockTopicModal;
});
jest.mock('@/components/create-course/QuizModals/LessonModal', () => {
  const MockLessonModal = () => <div data-testid="LessonModal" />;
  MockLessonModal.displayName = 'LessonModal';
  return MockLessonModal;
});
jest.mock('@/components/create-course/QuizModals/QuizModal', () => {
  const MockQuizModal = () => <div data-testid="QuizModal" />;
  MockQuizModal.displayName = 'QuizModal';
  return MockQuizModal;
});
jest.mock('@/components/create-course/QuizModals/AssignmentModal', () => {
  const MockAssignmentModal = () => <div data-testid="AssignmentModal" />;
  MockAssignmentModal.displayName = 'AssignmentModal';
  return MockAssignmentModal;
});
jest.mock('@/components/create-course/QuizModals/UpdateModal', () => {
  const MockUpdateModal = () => <div data-testid="UpdateModal" />;
  MockUpdateModal.displayName = 'UpdateModal';
  return MockUpdateModal;
});
jest.mock('@/components/create-course/lesson/Lesson', () => {
  const MockLesson = () => <div data-testid="Lesson" />;
  MockLesson.displayName = 'Lesson';
  return MockLesson;
});
jest.mock('@/components/Common/PhoneVerificationModal', () => {
  const MockPhoneVerificationModal = () => (
    <div data-testid="PhoneVerificationModal" />
  );
  MockPhoneVerificationModal.displayName = 'PhoneVerificationModal';
  return MockPhoneVerificationModal;
});

describe('CreateCourse Auto-Save UI', () => {
  const mockSession = {
    user: { name: 'Test User', email: 'test@example.com' },
    expires: '2025-01-01',
  };

  beforeEach(() => {
    (useSession as jest.Mock).mockReturnValue({
      data: mockSession,
      status: 'authenticated',
    });
  });

  it('should not show any indicator when status is idle', () => {
    (useAutoSave as jest.Mock).mockReturnValue({
      status: 'idle',
      lastSavedAt: null,
      saveNow: jest.fn(),
      recover: jest.fn(),
      getRecoverable: jest
        .fn()
        .mockReturnValue({ data: null, timestamp: null }),
      clearDraft: jest.fn(),
    });

    render(<CreateCourse userProfile={{ id: 'test-user-id' }} />);

    // "저장 대기 중"이나 "저장 중" 같은 텍스트가 없어야 함
    expect(screen.queryByText(/저장 대기 중/)).not.toBeInTheDocument();
    expect(screen.queryByText(/저장 중/)).not.toBeInTheDocument();
    expect(screen.queryByText(/저장됨/)).not.toBeInTheDocument();
  });

  it('should not show any indicator when status is dirty', () => {
    (useAutoSave as jest.Mock).mockReturnValue({
      status: 'dirty',
      lastSavedAt: Date.now(),
      saveNow: jest.fn(),
      recover: jest.fn(),
      getRecoverable: jest
        .fn()
        .mockReturnValue({ data: null, timestamp: null }),
      clearDraft: jest.fn(),
    });

    render(<CreateCourse userProfile={{ id: 'test-user-id' }} />);

    // Dirty 상태에서도 아무것도 표시하지 않아야 함 (Minimalist)
    expect(screen.queryByText(/저장 대기 중/)).not.toBeInTheDocument();
    expect(screen.queryByText(/변경사항 있음/)).not.toBeInTheDocument();
  });

  it('should show checkmark when status is saved', () => {
    (useAutoSave as jest.Mock).mockReturnValue({
      status: 'saved',
      lastSavedAt: Date.now(),
      saveNow: jest.fn(),
      recover: jest.fn(),
      getRecoverable: jest
        .fn()
        .mockReturnValue({ data: null, timestamp: null }),
      clearDraft: jest.fn(),
    });

    render(<CreateCourse userProfile={{ id: 'test-user-id' }} />);

    // 체크 아이콘이 있는 컨테이너가 렌더링되어야 함
    // 텍스트는 없지만 feather-check 클래스가 있는 요소가 있어야 함
    const checkIcon = document.querySelector('.feather-check');
    expect(checkIcon).toBeInTheDocument();
  });

  it('should show error badge when status is error', () => {
    (useAutoSave as jest.Mock).mockReturnValue({
      status: 'error',
      lastSavedAt: null,
      saveNow: jest.fn(),
      recover: jest.fn(),
      getRecoverable: jest
        .fn()
        .mockReturnValue({ data: null, timestamp: null }),
      clearDraft: jest.fn(),
    });

    render(<CreateCourse userProfile={{ id: 'test-user-id' }} />);

    expect(screen.getByText(/저장 실패/)).toBeInTheDocument();
  });
});
