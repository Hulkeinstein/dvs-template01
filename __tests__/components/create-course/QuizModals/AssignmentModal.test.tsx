import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AssignmentModal from '@/components/create-course/QuizModals/AssignmentModal';
import {
  saveAsTemplate,
  getMyTemplates,
  deleteTemplate,
} from '@/app/lib/actions/assignmentTemplateActions';

// Mocks
jest.mock('@/app/lib/actions/assignmentTemplateActions', () => ({
  saveAsTemplate: jest.fn(),
  getMyTemplates: jest.fn(),
  deleteTemplate: jest.fn(),
  incrementTemplateUsage: jest.fn(),
}));

jest.mock('@/hooks/use-toast', () => ({
  toast: jest.fn(),
}));

jest.mock('@/components/create-course/QuillWrapper', () => {
  const MockQuillWrapper = ({ onChange, value }: any) => (
    <textarea
      data-testid="QuillWrapper"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
  MockQuillWrapper.displayName = 'MockQuillWrapper';
  return MockQuillWrapper;
});

describe('AssignmentModal', () => {
  const mockOnAddAssignment = jest.fn();
  const mockOnEditComplete = jest.fn();

  const defaultProps = {
    modalId: 'test-modal',
    onAddAssignment: mockOnAddAssignment,
    onEditComplete: mockOnEditComplete,
    editingAssignment: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getMyTemplates as jest.Mock).mockResolvedValue({
      success: true,
      data: [],
    });
    (deleteTemplate as jest.Mock).mockResolvedValue({ success: true });
    // Mock window.bootstrap
    (window as any).bootstrap = {
      Modal: class {
        static getInstance() {
          return { hide: jest.fn() };
        }
        constructor() {
          return { hide: jest.fn() };
        }
        hide() {}
      },
    };
    window.alert = jest.fn();
  });

  it('renders correctly', async () => {
    render(<AssignmentModal {...defaultProps} />);
    await waitFor(() => expect(getMyTemplates).toHaveBeenCalled());
    expect(screen.getAllByText('Add Assignment').length).toBeGreaterThan(0);
  });

  it('validates title on submit', async () => {
    render(<AssignmentModal {...defaultProps} />);
    await waitFor(() => expect(getMyTemplates).toHaveBeenCalled());
    const submitBtns = screen.getAllByText('Add Assignment');
    const submitBtn = submitBtns.find((el) => el.closest('button'));

    fireEvent.click(submitBtn!);

    expect(window.alert).toHaveBeenCalledWith('Please enter assignment title');
  });

  it('submits valid data', async () => {
    render(<AssignmentModal {...defaultProps} />);
    await waitFor(() => expect(getMyTemplates).toHaveBeenCalled());

    // Fill title
    const titleInput = screen.getByPlaceholderText('Assignments');
    fireEvent.change(titleInput, { target: { value: 'Test Assignment' } });

    // Submit
    const submitBtns = screen.getAllByText('Add Assignment');
    const submitBtn = submitBtns.find((el) => el.closest('button'));
    fireEvent.click(submitBtn!);

    expect(mockOnAddAssignment).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Test Assignment',
      })
    );
  });

  it('prompts for template name when save template clicked', async () => {
    render(<AssignmentModal {...defaultProps} />);
    await waitFor(() => expect(getMyTemplates).toHaveBeenCalled());

    // Fill title to enable button
    const titleInput = screen.getByPlaceholderText('Assignments');
    fireEvent.change(titleInput, { target: { value: 'Test Assignment' } });

    const saveTemplateBtn = screen.getByText('Save as Template');

    // Mock prompt
    jest.spyOn(window, 'prompt').mockReturnValue('My Template');

    fireEvent.click(saveTemplateBtn);

    expect(window.prompt).toHaveBeenCalledWith('Enter template name:');
  });

  it('saves template', async () => {
    (saveAsTemplate as jest.Mock).mockResolvedValue({ success: true });
    jest.spyOn(window, 'prompt').mockReturnValue('My Template');

    render(<AssignmentModal {...defaultProps} />);
    await waitFor(() => expect(getMyTemplates).toHaveBeenCalled());

    // Fill title to enable button
    const titleInput = screen.getByPlaceholderText('Assignments');
    fireEvent.change(titleInput, { target: { value: 'Test Assignment' } });

    // Click save
    fireEvent.click(screen.getByText('Save as Template'));

    await waitFor(() => {
      expect(saveAsTemplate).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'My Template',
        })
      );
    });
  });
});
