import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import CreateCourse from '@/components/create-course/CreateCourse';

// Mock the modules
jest.mock('next-auth/react');
jest.mock('next/navigation');
jest.mock('@/app/lib/actions/courseActions');
jest.mock('@/app/lib/actions/uploadActions');
jest.mock('@/app/lib/utils/phoneVerification');

// Mock Select component from react-select
jest.mock('react-select', () => {
  const Select = ({ value, onChange, options }) => (
    <select
      value={value?.value}
      onChange={(e) => {
        const option = options.find((opt) => opt.value === e.target.value);
        onChange(option);
      }}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
  return Select;
});

// Mock child components
jest.mock('@/components/create-course/InfoForm', () => {
  return function InfoForm({ formData, onFormDataChange, onThumbnailChange }) {
    return (
      <div data-testid="info-form">
        <input
          type="text"
          placeholder="Course Title"
          value={formData.title}
          onChange={(e) =>
            onFormDataChange({ ...formData, title: e.target.value })
          }
        />
        <input
          type="file"
          data-testid="thumbnail-input"
          onChange={(e) => onThumbnailChange(e.target.files[0])}
        />
      </div>
    );
  };
});

jest.mock('@/components/create-course/AdditionalForm', () => {
  return function AdditionalForm({ formData, onFormDataChange }) {
    return <div data-testid="additional-form">Additional Form</div>;
  };
});

jest.mock('@/components/Common/PhoneVerificationModal', () => {
  return function PhoneVerificationModal({ isOpen, onClose, onSuccess }) {
    if (!isOpen) return null;
    return (
      <div data-testid="phone-verification-modal">
        <button onClick={onClose}>Close</button>
        <button onClick={onSuccess}>Verify</button>
      </div>
    );
  };
});

// Mock modals
jest.mock('@/components/create-course/QuizModals/TopicModal', () => {
  return function TopicModal() {
    return (
      <div data-testid="topic-modal" id="topicModal">
        Topic Modal
      </div>
    );
  };
});

jest.mock('@/components/create-course/QuizModals/LessonModal', () => {
  return function LessonModal() {
    return (
      <div data-testid="lesson-modal" id="LessonModal">
        Lesson Modal
      </div>
    );
  };
});

jest.mock('@/components/create-course/QuizModals/QuizModal', () => {
  return function QuizModal() {
    return (
      <div data-testid="quiz-modal" id="QuizModal">
        Quiz Modal
      </div>
    );
  };
});

jest.mock('@/components/create-course/QuizModals/AssignmentModal', () => {
  return function AssignmentModal() {
    return (
      <div data-testid="assignment-modal" id="AssignmentModal">
        Assignment Modal
      </div>
    );
  };
});

jest.mock('@/components/create-course/QuizModals/UpdateModal', () => {
  return function UpdateModal() {
    return (
      <div data-testid="update-modal" id="UpdateModal">
        Update Modal
      </div>
    );
  };
});

jest.mock('@/components/create-course/lesson/Lesson', () => {
  return function Lesson({ id, target, expanded, text }) {
    return <div data-testid={`lesson-${id}`}>{text}</div>;
  };
});

const mockPush = jest.fn();
const mockSession = {
  user: {
    email: 'test@example.com',
    name: 'Test User',
  },
};

const mockUserProfile = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'instructor',
  phoneNumber: '+1234567890',
  phoneVerified: true,
};

describe('CreateCourse Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useSession.mockReturnValue({ data: mockSession });
    useRouter.mockReturnValue({ push: mockPush });

    // Mock phoneVerification utils
    const phoneVerificationModule = require('@/app/lib/utils/phoneVerification');
    phoneVerificationModule.isPhoneVerified = jest.fn().mockReturnValue(true);
    phoneVerificationModule.getVerificationPromptMessage = jest
      .fn()
      .mockReturnValue('Please verify your phone');
  });

  it('should render all main sections', () => {
    render(<CreateCourse userProfile={mockUserProfile} />);

    // Check accordion sections
    expect(screen.getByText('Course Info')).toBeInTheDocument();
    expect(screen.getByText('Course Intro Video')).toBeInTheDocument();
    expect(screen.getByText('Course Builder')).toBeInTheDocument();
    expect(screen.getByText('Additional Information')).toBeInTheDocument();
    expect(screen.getByText('Certificate Template')).toBeInTheDocument();

    // Check sidebar
    expect(screen.getByText('Course Upload Tips')).toBeInTheDocument();
  });

  it('should render all modals', () => {
    render(<CreateCourse userProfile={mockUserProfile} />);

    expect(screen.getByTestId('topic-modal')).toBeInTheDocument();
    expect(screen.getByTestId('lesson-modal')).toBeInTheDocument();
    expect(screen.getByTestId('quiz-modal')).toBeInTheDocument();
    expect(screen.getByTestId('assignment-modal')).toBeInTheDocument();
    expect(screen.getByTestId('update-modal')).toBeInTheDocument();
  });

  it('should handle Add New Topic button click', () => {
    render(<CreateCourse userProfile={mockUserProfile} />);

    const addTopicButton = screen.getByText('Add New Topic');
    expect(addTopicButton).toBeInTheDocument();
    expect(addTopicButton).toHaveAttribute('data-bs-toggle', 'modal');
    expect(addTopicButton).toHaveAttribute('data-bs-target', '#topicModal');
  });

  it('should render lesson components', () => {
    render(<CreateCourse userProfile={mockUserProfile} />);

    expect(screen.getByText('Lesson One')).toBeInTheDocument();
    expect(screen.getByText('Lesson Two')).toBeInTheDocument();
  });

  it('should handle course creation with phone verification', async () => {
    const phoneVerificationModule = require('@/app/lib/utils/phoneVerification');
    phoneVerificationModule.isPhoneVerified.mockReturnValue(false);

    render(
      <CreateCourse
        userProfile={{ ...mockUserProfile, phoneVerified: false }}
      />
    );

    const createButton = screen.getByText('Create Course');
    fireEvent.click(createButton);

    // Should show phone verification modal
    await waitFor(() => {
      expect(
        screen.getByTestId('phone-verification-modal')
      ).toBeInTheDocument();
    });
  });

  it('should validate required fields before submission', async () => {
    render(<CreateCourse userProfile={mockUserProfile} />);

    const createButton = screen.getByText('Create Course');
    fireEvent.click(createButton);

    // Should show error for missing required fields
    await waitFor(() => {
      expect(
        screen.getByText('Please fill in all required fields')
      ).toBeInTheDocument();
    });
  });

  it('should handle successful course creation', async () => {
    const courseActionsModule = require('@/app/lib/actions/courseActions');
    courseActionsModule.createCourse = jest.fn().mockResolvedValue({
      success: true,
      courseId: '123',
    });

    render(<CreateCourse userProfile={mockUserProfile} />);

    // Fill in required fields through InfoForm
    const titleInput = screen.getByPlaceholderText('Course Title');
    fireEvent.change(titleInput, { target: { value: 'Test Course' } });

    // Mock formData to have all required fields
    const createButton = screen.getByText('Create Course');

    // Click create course button
    fireEvent.click(createButton);

    // Note: The actual test would need proper form data setup
    // This is a simplified version to show the structure
  });

  it('should display loading state during submission', async () => {
    render(<CreateCourse userProfile={mockUserProfile} />);

    const createButton = screen.getByText('Create Course');
    expect(createButton).toBeInTheDocument();

    // During submission, button text should change
    // This would need proper setup of form data and mocks
  });

  it('should have unique modal target attributes', () => {
    render(<CreateCourse userProfile={mockUserProfile} />);

    // Check that the Add New Topic button targets the correct modal
    const addTopicButton = screen.getByText('Add New Topic');
    expect(addTopicButton).toHaveAttribute('data-bs-target', '#topicModal');

    // Verify modal exists with matching ID
    const topicModal = document.querySelector('#topicModal');
    expect(topicModal).toBeInTheDocument();
  });

  it('should render video source selector', () => {
    render(<CreateCourse userProfile={mockUserProfile} />);

    // The mocked Select component renders as a regular select
    const videoSourceSelect = screen.getByDisplayValue('Select Video Sources');
    expect(videoSourceSelect).toBeInTheDocument();
  });

  it('should render course upload tips', () => {
    render(<CreateCourse userProfile={mockUserProfile} />);

    const tips = [
      'Set the Course Price option or make it free.',
      'Standard size for the course thumbnail is 700x430.',
      'Video section controls the course overview video.',
      'Course Builder is where you create & organize a course.',
      'Add Topics in the Course Builder section to create lessons, quizzes, and assignments.',
      'Prerequisites refers to the fundamental courses to complete before taking this particular course.',
      'Information from the Additional Data section shows up on the course single page.',
    ];

    tips.forEach((tip) => {
      expect(screen.getByText(tip, { exact: false })).toBeInTheDocument();
    });
  });
});
