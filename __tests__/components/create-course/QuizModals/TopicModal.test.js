import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TopicModal from '@/components/create-course/QuizModals/TopicModal';

describe('TopicModal', () => {
  it('should render with correct modal ID', () => {
    render(<TopicModal />);
    
    const modal = document.querySelector('#topicModal');
    expect(modal).toBeInTheDocument();
    expect(modal).toHaveClass('modal');
  });

  it('should have unique IDs for all form elements', () => {
    render(<TopicModal />);
    
    // Check Topic Name input
    const topicNameInput = screen.getByLabelText('Topic Name');
    expect(topicNameInput).toHaveAttribute('id', 'topicModalName');
    
    // Check Topic Summary textarea
    const topicSummaryTextarea = screen.getByLabelText('Topic Summary');
    expect(topicSummaryTextarea).toHaveAttribute('id', 'topicModalSummary');
  });

  it('should have correct modal title', () => {
    render(<TopicModal />);
    
    const modalTitle = screen.getByText('Add Topic');
    expect(modalTitle).toBeInTheDocument();
    expect(modalTitle.id).toBe('topicModalLabel');
  });

  it('should have close button in header', () => {
    render(<TopicModal />);
    
    const closeButton = document.querySelector('.modal-header .rbt-round-btn');
    expect(closeButton).toBeInTheDocument();
    expect(closeButton).toHaveAttribute('data-bs-dismiss', 'modal');
  });

  it('should have action buttons in footer', () => {
    render(<TopicModal />);
    
    // Check Cancel button only (no Save button in current implementation)
    const cancelButton = screen.getByText('Cancel');
    expect(cancelButton).toHaveClass('rbt-btn', 'btn-border', 'btn-md', 'radius-round-10');
    expect(cancelButton).toHaveAttribute('data-bs-dismiss', 'modal');
  });

  it('should allow text input in form fields', () => {
    render(<TopicModal />);
    
    const topicNameInput = screen.getByLabelText('Topic Name');
    const topicSummaryTextarea = screen.getByLabelText('Topic Summary');
    
    // Test Topic Name input
    fireEvent.change(topicNameInput, { target: { value: 'Test Topic' } });
    expect(topicNameInput.value).toBe('Test Topic');
    
    // Test Topic Summary textarea
    fireEvent.change(topicSummaryTextarea, { target: { value: 'This is a test summary' } });
    expect(topicSummaryTextarea.value).toBe('This is a test summary');
  });

  it('should have proper Bootstrap modal attributes', () => {
    render(<TopicModal />);
    
    const modal = document.querySelector('#topicModal');
    expect(modal).toHaveAttribute('tabindex', '-1');
    expect(modal).toHaveAttribute('aria-labelledby', 'topicModalLabel');
    expect(modal).toHaveAttribute('aria-hidden', 'true');
  });

  it('should not have duplicate IDs with other modals', () => {
    render(<TopicModal />);
    
    // Get all elements with IDs
    const allElementsWithIds = document.querySelectorAll('[id]');
    const idMap = {};
    
    allElementsWithIds.forEach(element => {
      const id = element.getAttribute('id');
      if (idMap[id]) {
        fail(`Duplicate ID found: ${id}`);
      }
      idMap[id] = true;
    });
    
    // Check that our specific IDs are unique
    expect(idMap['topicModal']).toBe(true);
    expect(idMap['topicModalName']).toBe(true);
    expect(idMap['topicModalSummary']).toBe(true);
  });
});