import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import InfoForm from '@/components/create-course/InfoForm';
import { fileToBase64 } from '@/app/lib/utils/fileUpload';

// Mock the fileUpload utility
jest.mock('@/app/lib/utils/fileUpload', () => ({
  fileToBase64: jest.fn(),
  validateFileSize: jest.fn(),
  validateFileType: jest.fn()
}));

// Mock Select component
jest.mock('react-select', () => {
  const Select = ({ value, onChange, options, placeholder }) => (
    <select
      data-testid="select-category"
      value={value?.value || ''}
      onChange={(e) => {
        const option = options.find(opt => opt.value === e.target.value);
        onChange(option);
      }}
    >
      <option value="">{placeholder}</option>
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
  return Select;
});

describe('InfoForm Component', () => {
  const mockFormData = {
    title: '',
    slug: '',
    category: null,
    level: null,
    language: null,
    duration: '',
    price: '',
    description: '',
    prerequisites: '',
    learningObjectives: ''
  };

  const mockOnFormDataChange = jest.fn();
  const mockOnThumbnailChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all form fields', () => {
    render(
      <InfoForm 
        formData={mockFormData}
        onFormDataChange={mockOnFormDataChange}
        onThumbnailChange={mockOnThumbnailChange}
      />
    );

    expect(screen.getByPlaceholderText('Course Title*')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Course Slug*')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Course Duration*')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Course Price*')).toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Level')).toBeInTheDocument();
    expect(screen.getByText('Language')).toBeInTheDocument();
  });

  it('should handle title input change', () => {
    render(
      <InfoForm 
        formData={mockFormData}
        onFormDataChange={mockOnFormDataChange}
        onThumbnailChange={mockOnThumbnailChange}
      />
    );

    const titleInput = screen.getByPlaceholderText('Course Title*');
    fireEvent.change(titleInput, { target: { value: 'Test Course' } });

    expect(mockOnFormDataChange).toHaveBeenCalledWith({
      ...mockFormData,
      title: 'Test Course'
    });
  });

  it('should handle file upload with base64 conversion', async () => {
    const mockBase64 = 'data:image/jpeg;base64,mockbase64data';
    fileToBase64.mockResolvedValue(mockBase64);

    render(
      <InfoForm 
        formData={mockFormData}
        onFormDataChange={mockOnFormDataChange}
        onThumbnailChange={mockOnThumbnailChange}
      />
    );

    const fileInput = screen.getByLabelText('Course Thumbnail*');
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    await waitFor(() => {
      expect(fileToBase64).toHaveBeenCalledWith(mockFile);
      expect(mockOnThumbnailChange).toHaveBeenCalledWith({
        file: mockFile,
        base64: mockBase64
      });
    });
  });

  it('should display error for invalid file type', async () => {
    render(
      <InfoForm 
        formData={mockFormData}
        onFormDataChange={mockOnFormDataChange}
        onThumbnailChange={mockOnThumbnailChange}
      />
    );

    const fileInput = screen.getByLabelText('Course Thumbnail*');
    const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });

    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    await waitFor(() => {
      expect(screen.getByText(/Only image files/)).toBeInTheDocument();
    });
  });

  it('should display error for oversized file', async () => {
    render(
      <InfoForm 
        formData={mockFormData}
        onFormDataChange={mockOnFormDataChange}
        onThumbnailChange={mockOnThumbnailChange}
      />
    );

    const fileInput = screen.getByLabelText('Course Thumbnail*');
    // Create a mock file that's too large
    const largeFile = {
      name: 'large.jpg',
      type: 'image/jpeg',
      size: 10 * 1024 * 1024 // 10MB
    };

    Object.defineProperty(fileInput, 'files', {
      value: [largeFile],
      writable: false,
    });

    fireEvent.change(fileInput, { target: { files: [largeFile] } });

    await waitFor(() => {
      expect(screen.getByText(/File size must be less than 5MB/)).toBeInTheDocument();
    });
  });

  it('should handle category selection', () => {
    render(
      <InfoForm 
        formData={mockFormData}
        onFormDataChange={mockOnFormDataChange}
        onThumbnailChange={mockOnThumbnailChange}
      />
    );

    const categorySelect = screen.getByTestId('select-category');
    fireEvent.change(categorySelect, { target: { value: 'web-development' } });

    expect(mockOnFormDataChange).toHaveBeenCalledWith({
      ...mockFormData,
      category: { value: 'web-development', label: 'Web Development' }
    });
  });

  it('should display preview image when thumbnail is provided', () => {
    const formDataWithThumbnail = {
      ...mockFormData,
      thumbnailPreview: 'data:image/jpeg;base64,mockpreview'
    };

    render(
      <InfoForm 
        formData={formDataWithThumbnail}
        onFormDataChange={mockOnFormDataChange}
        onThumbnailChange={mockOnThumbnailChange}
      />
    );

    const previewImage = screen.getByAltText('Thumbnail Preview');
    expect(previewImage).toBeInTheDocument();
    expect(previewImage).toHaveAttribute('src', formDataWithThumbnail.thumbnailPreview);
  });

  it('should validate required fields', () => {
    render(
      <InfoForm 
        formData={mockFormData}
        onFormDataChange={mockOnFormDataChange}
        onThumbnailChange={mockOnThumbnailChange}
      />
    );

    const requiredFields = [
      'Course Title*',
      'Course Slug*',
      'Course Duration*',
      'Course Price*'
    ];

    requiredFields.forEach(placeholder => {
      const field = screen.getByPlaceholderText(placeholder);
      expect(field).toHaveAttribute('required');
    });
  });
});