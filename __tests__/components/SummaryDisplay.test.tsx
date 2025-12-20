import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SummaryDisplay from '@/components/Lesson/SummaryDisplay';
import { SummaryData, DetailedNote } from '@/types/summary';

describe('SummaryDisplay', () => {
  const mockRetry = jest.fn();
  const mockTimestampClick = jest.fn();
  
  const mockData: SummaryData = {
    key_notes: ['Note 1', 'Note 2'],
    detailed_notes: [
      { timestamp: '00:10', timestamp_seconds: 10, title: 'Intro', content: 'Intro content' },
      { timestamp: '01:00', timestamp_seconds: 60, title: 'Main', content: 'Main content' }
    ] as DetailedNote[],
    meta: {
      model: 'gpt-4o',
      input_tokens: 100,
      output_tokens: 100,
      cost_usd: 0.01,
      source_lang: 'en',
      output_lang: 'ko',
      video_duration_seconds: 120,
      processed_at: '2023-01-01'
    }
  };

  beforeEach(() => {
    mockRetry.mockClear();
    mockTimestampClick.mockClear();
  });

  it('renders nothing if no data, no loading, no error', () => {
    const { container } = render(
      <SummaryDisplay 
        data={null} 
        isLoading={false} 
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('shows loading message', () => {
    render(
      <SummaryDisplay 
        data={null} 
        isLoading={true} 
      />
    );
    expect(screen.getByText(/자막을 추출하고 있습니다|분석하고 있습니다|요약을 생성하고 있습니다/)).toBeInTheDocument();
  });

  it('shows error message and retry button', () => {
    render(
      <SummaryDisplay 
        data={null} 
        isLoading={false} 
        error="Something went wrong"
        onRetry={mockRetry}
      />
    );
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    const retryBtn = screen.getByText('재시도');
    fireEvent.click(retryBtn);
    expect(mockRetry).toHaveBeenCalled();
  });

  it('renders key notes', () => {
    render(
      <SummaryDisplay 
        data={mockData} 
        isLoading={false} 
      />
    );
    expect(screen.getByText('핵심 요약')).toBeInTheDocument();
    expect(screen.getByText(/Note 1/)).toBeInTheDocument();
    expect(screen.getByText(/Note 2/)).toBeInTheDocument();
  });

  it('renders detailed notes and handles timestamp click', () => {
    render(
      <SummaryDisplay 
        data={mockData} 
        isLoading={false} 
        onTimestampClick={mockTimestampClick}
      />
    );
    expect(screen.getByText('상세 노트')).toBeInTheDocument();
    
    const timestampBtn = screen.getByText('00:10');
    fireEvent.click(timestampBtn);
    expect(mockTimestampClick).toHaveBeenCalledWith(10);

    expect(screen.getByText('Intro')).toBeInTheDocument();
    expect(screen.getByText('Intro content')).toBeInTheDocument();
  });
});
