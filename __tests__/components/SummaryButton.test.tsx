import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SummaryButton from '@/components/Lesson/SummaryButton';

describe('SummaryButton', () => {
  const mockGenerate = jest.fn();

  beforeEach(() => {
    mockGenerate.mockClear();
  });

  it('renders correctly', () => {
    render(
      <SummaryButton 
        youtubeUrl="https://youtube.com/watch?v=123" 
        onGenerateSummary={mockGenerate} 
        isLoading={false} 
      />
    );
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText(/AI 요약/)).toBeInTheDocument();
  });

  it('is disabled if no YouTube URL', () => {
    render(
      <SummaryButton 
        youtubeUrl="" 
        onGenerateSummary={mockGenerate} 
        isLoading={false} 
        disabled={true}
      />
    );
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('is disabled if explicitly disabled', () => {
    render(
      <SummaryButton 
        youtubeUrl="url" 
        onGenerateSummary={mockGenerate} 
        isLoading={false} 
        disabled={true}
      />
    );
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('shows loading spinner when loading', () => {
    render(
      <SummaryButton 
        youtubeUrl="url" 
        onGenerateSummary={mockGenerate} 
        isLoading={true} 
      />
    );
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument(); // Spinner usually has role="status"
  });

  it('calls onGenerateSummary when clicked', () => {
    render(
      <SummaryButton 
        youtubeUrl="url" 
        onGenerateSummary={mockGenerate} 
        isLoading={false} 
      />
    );
    fireEvent.click(screen.getByRole('button'));
    expect(mockGenerate).toHaveBeenCalledTimes(1);
  });
});
