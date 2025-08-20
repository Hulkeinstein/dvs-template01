import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LessonModal from '@/components/create-course/QuizModals/LessonModal';

// Mock FileReader
global.FileReader = jest.fn(() => ({
  readAsDataURL: jest.fn(),
  onloadend: jest.fn(),
  result: 'data:image/png;base64,mockImageData',
}));

describe('LessonModal', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should render with correct modal ID', () => {
    render(<LessonModal />);

    const modal = document.querySelector('#Lesson');
    expect(modal).toBeInTheDocument();
    expect(modal).toHaveClass('modal');
  });

  it('should have unique IDs for all form elements', () => {
    render(<LessonModal />);

    // Check Lesson Name input
    const lessonNameInput = screen.getByLabelText('Lesson Name');
    expect(lessonNameInput).toHaveAttribute('id', 'lessonModalName');

    // Check Lesson Summary textarea
    const lessonSummaryTextarea = screen.getByLabelText('Lesson Summary');
    expect(lessonSummaryTextarea).toHaveAttribute('id', 'lessonModalSummary');

    // Check Feature Image input
    const featureImageInput = document.querySelector('#lessonFeatureImage');
    expect(featureImageInput).toBeInTheDocument();
    expect(featureImageInput).toHaveAttribute('type', 'file');
  });

  it('should handle Feature Image file upload', async () => {
    render(<LessonModal />);

    const fileInput = document.querySelector('#lessonFeatureImage');
    const mockFile = new File(['dummy content'], 'test-image.png', {
      type: 'image/png',
    });

    // Create a mock FileReader instance
    const mockFileReader = {
      readAsDataURL: jest.fn(),
      result: 'data:image/png;base64,mockImageData',
    };

    // Mock the FileReader constructor
    global.FileReader = jest.fn(() => mockFileReader);

    // Simulate file selection
    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    // Verify FileReader was created and readAsDataURL was called
    expect(global.FileReader).toHaveBeenCalled();
    expect(mockFileReader.readAsDataURL).toHaveBeenCalledWith(mockFile);

    // Simulate the onloadend callback
    mockFileReader.onloadend();

    // Wait for state update and check if preview image is displayed
    await waitFor(() => {
      const previewImage = document.querySelector('#lessonFeatureImagePreview');
      expect(previewImage).toBeInTheDocument();
      expect(previewImage).toHaveAttribute(
        'src',
        'data:image/png;base64,mockImageData'
      );
    });
  });

  it('should reject non-image files', () => {
    // Mock window.alert
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(<LessonModal />);

    const fileInput = document.querySelector('#lessonFeatureImage');
    const mockFile = new File(['dummy content'], 'test.txt', {
      type: 'text/plain',
    });

    // Simulate file selection with non-image file
    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    // Verify alert was called
    expect(alertMock).toHaveBeenCalledWith('Please select a valid image file');

    // Restore original alert
    alertMock.mockRestore();
  });

  it('should have proper file input attributes', () => {
    render(<LessonModal />);

    const fileInput = document.querySelector('#lessonFeatureImage');
    expect(fileInput).toHaveAttribute('accept', 'image/*');
    expect(fileInput).toHaveAttribute('type', 'file');
  });

  it('should have correct modal title', () => {
    render(<LessonModal />);

    const modalTitle = screen.getByText('Add Lesson');
    expect(modalTitle).toBeInTheDocument();
    expect(modalTitle.id).toBe('LessonLabel');
  });

  it('should have action buttons in footer', () => {
    render(<LessonModal />);

    // Check Cancel button
    const cancelButton = screen.getByText('Cancel');
    expect(cancelButton).toHaveClass(
      'rbt-btn',
      'btn-border',
      'btn-md',
      'radius-round-10'
    );
    expect(cancelButton).toHaveAttribute('data-bs-dismiss', 'modal');

    // Check Update Lesson button
    const updateButton = screen.getByText('Update Lesson');
    expect(updateButton).toHaveClass('rbt-btn', 'btn-md');
  });

  it('should allow text input in form fields', () => {
    render(<LessonModal />);

    const lessonNameInput = screen.getByLabelText('Lesson Name');
    const lessonSummaryTextarea = screen.getByLabelText('Lesson Summary');

    // Test Lesson Name input
    fireEvent.change(lessonNameInput, { target: { value: 'Test Lesson' } });
    expect(lessonNameInput.value).toBe('Test Lesson');

    // Test Lesson Summary textarea
    fireEvent.change(lessonSummaryTextarea, {
      target: { value: 'This is a test lesson summary' },
    });
    expect(lessonSummaryTextarea.value).toBe('This is a test lesson summary');
  });

  it('should show upload area before file selection', () => {
    render(<LessonModal />);

    // Check if upload area is visible
    const uploadArea = document.querySelector('.rbt-create-course-thumbnail');
    expect(uploadArea).toBeInTheDocument();

    // Check if "Choose a File" label is visible
    const chooseFileLabel = screen.getByText('Choose a File');
    expect(chooseFileLabel).toBeInTheDocument();
  });

  it('should not have duplicate IDs with other modals', () => {
    render(<LessonModal />);

    // Get all elements with IDs
    const allElementsWithIds = document.querySelectorAll('[id]');
    const idMap = {};

    allElementsWithIds.forEach((element) => {
      const id = element.getAttribute('id');
      if (idMap[id]) {
        fail(`Duplicate ID found: ${id}`);
      }
      idMap[id] = true;
    });

    // Check that our specific IDs are unique
    expect(idMap['Lesson']).toBe(true);
    expect(idMap['lessonModalName']).toBe(true);
    expect(idMap['lessonModalSummary']).toBe(true);
    expect(idMap['lessonFeatureImage']).toBe(true);
  });
});
