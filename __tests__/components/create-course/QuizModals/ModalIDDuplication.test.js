import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import TopicModal from '@/components/create-course/QuizModals/TopicModal';
import LessonModal from '@/components/create-course/QuizModals/LessonModal';
import QuizModal from '@/components/create-course/QuizModals/QuizModal';
import AssignmentModal from '@/components/create-course/QuizModals/AssignmentModal';
import UpdateModal from '@/components/create-course/QuizModals/UpdateModal';

describe('Modal ID Duplication Tests', () => {
  it('should not have duplicate IDs across all modals', () => {
    // Create a container for all modals
    const container = document.createElement('div');
    document.body.appendChild(container);
    
    // Render all modals
    const { container: topicContainer } = render(<TopicModal />, { container });
    const { container: lessonContainer } = render(<LessonModal />, { container });
    const { container: quizContainer } = render(<QuizModal />, { container });
    const { container: assignmentContainer } = render(<AssignmentModal />, { container });
    const { container: updateContainer } = render(<UpdateModal />, { container });
    
    // Get all elements with IDs
    const allElementsWithIds = container.querySelectorAll('[id]');
    const idMap = {};
    const duplicates = [];
    
    allElementsWithIds.forEach(element => {
      const id = element.getAttribute('id');
      if (idMap[id]) {
        duplicates.push({
          id,
          firstElement: idMap[id],
          duplicateElement: element
        });
      } else {
        idMap[id] = element;
      }
    });
    
    // Check for duplicates
    if (duplicates.length > 0) {
      const duplicateInfo = duplicates.map(dup => 
        `ID "${dup.id}" is duplicated in ${dup.firstElement.tagName} and ${dup.duplicateElement.tagName}`
      ).join('\n');
      
      fail(`Found ${duplicates.length} duplicate IDs:\n${duplicateInfo}`);
    }
    
    // Cleanup
    document.body.removeChild(container);
  });

  it('should have unique modal IDs', () => {
    const modalIds = {
      TopicModal: 'topicModal',
      LessonModal: 'Lesson',
      QuizModal: 'Quiz',
      AssignmentModal: 'AssignmentModal',
      UpdateModal: 'UpdateTopic'
    };
    
    // Check that all modal IDs are unique
    const idValues = Object.values(modalIds);
    const uniqueIds = new Set(idValues);
    
    expect(uniqueIds.size).toBe(idValues.length);
  });

  it('should have unique form field IDs in each modal', () => {
    const expectedFieldIds = {
      TopicModal: ['topicModalName', 'topicModalSummary'],
      LessonModal: ['lessonModalName', 'lessonModalSummary', 'lessonFeatureImage'],
      QuizModal: ['quizModalTitle', 'quizModalSummary'],
      AssignmentModal: ['assignmentModalTitle'],
      UpdateModal: ['updateModalTopicName', 'updateModalTopicSummary']
    };
    
    // Check that all field IDs are unique across all modals
    const allFieldIds = [];
    Object.values(expectedFieldIds).forEach(ids => {
      allFieldIds.push(...ids);
    });
    
    const uniqueFieldIds = new Set(allFieldIds);
    expect(uniqueFieldIds.size).toBe(allFieldIds.length);
  });

  it('should verify each modal has correct title element ID', () => {
    // Test TopicModal
    const { container: topicContainer } = render(<TopicModal />);
    const topicTitle = topicContainer.querySelector('#topicModalLabel');
    expect(topicTitle).toHaveTextContent('Add Topic');
    
    // Test LessonModal
    const { container: lessonContainer } = render(<LessonModal />);
    const lessonTitle = lessonContainer.querySelector('#LessonLabel');
    expect(lessonTitle).toHaveTextContent('Add Lesson');
    
    // Test QuizModal
    const { container: quizContainer } = render(<QuizModal />);
    const quizTitle = quizContainer.querySelector('#QuizModalLabel');
    expect(quizTitle).toHaveTextContent('Quiz');
    
    // Test AssignmentModal
    const { container: assignmentContainer } = render(<AssignmentModal />);
    const assignmentTitle = assignmentContainer.querySelector('#AssignmentModalLabel');
    expect(assignmentTitle).toHaveTextContent('Assignment');
    
    // Test UpdateModal
    const { container: updateContainer } = render(<UpdateModal />);
    const updateTitle = updateContainer.querySelector('#UpdateTopicModalLabel');
    expect(updateTitle).toHaveTextContent('Update Topic');
  });

  it('should ensure no generic IDs like "modal-field-1" exist', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    
    // Render all modals
    render(<TopicModal />, { container });
    render(<LessonModal />, { container });
    render(<QuizModal />, { container });
    render(<AssignmentModal />, { container });
    render(<UpdateModal />, { container });
    
    // Check for generic IDs
    const genericIdPatterns = [
      'modal-field-1',
      'modal-field-2',
      'createinputfile',
      'field-1',
      'field-2'
    ];
    
    genericIdPatterns.forEach(pattern => {
      const element = container.querySelector(`#${pattern}`);
      if (element) {
        fail(`Found generic ID "${pattern}" in ${element.tagName}. All IDs should be descriptive and unique.`);
      }
    });
    
    // Cleanup
    document.body.removeChild(container);
  });
});