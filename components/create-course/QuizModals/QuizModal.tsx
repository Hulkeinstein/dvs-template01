'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import Settings from '../QuizTab/Settings';
import Question, { InternalQuestion } from '../QuizTab/Question';
import QuestionType from '../QuizTab/QuestionType';
import { convertPlaceholdersToIframes } from '@/app/lib/utils/videoUtils';
import { updateQuizLesson } from '@/app/lib/actions/quizActions';
import type {
  QuizModalProps,
  QuizLesson,
  QuizQuestion,
  QuizSettings,
  QuestionType as QuestionTypeEnum,
  QuestionOption,
} from '@/types/create-course';

// ============================================================================
// Internal Types
// ============================================================================

interface QuizData {
  title: string;
  summary: string;
  questions: QuizQuestion[];
  settings: QuizSettings;
}

interface QuizActionResult {
  success: boolean;
  data?: QuizLesson;
  error?: string;
}

// Note: Window.bootstrap type is already declared globally in another file
// This component uses window.bootstrap.Modal for Bootstrap modal operations

// ============================================================================
// Component
// ============================================================================

const QuizModal: React.FC<QuizModalProps> = ({
  modalId = 'Quiz',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  topicId: _topicId,
  onAddQuiz,
  onUpdateQuiz,
  editingQuiz,
  onEditComplete,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _router = useRouter();
  const [selectedOption, setSelectedOption] =
    useState<QuestionTypeEnum>('True/False');
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [toggle, setToggle] = useState<boolean>(true);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<
    number | null
  >(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [settingsKey, setSettingsKey] = useState<number>(0);

  const [currentQuestion, setCurrentQuestion] = useState<InternalQuestion>({
    question: '',
    questionImage: null,
    type: 'True/False',
    points: 10,
    required: true,
    randomize: false,
    description: '',
    correctAnswer: true,
    options: [],
    explanation: '',
    blanks: [],
    sortItems: [],
    imageMatchingImage: null,
    imageMatchingText: '',
    imageMatchingPairs: [],
    matchingPairs: undefined,
  });

  const [quizData, setQuizData] = useState<QuizData>({
    title: '',
    summary: '',
    questions: [],
    settings: {
      passingScore: 70,
      feedbackMode: 'default',
      randomizeQuestions: false,
      showAnswersAfterSubmit: true,
      maxQuestions: 0,
      maxAttempts: 3,
      questionLayout: 'random',
      questionsOrder: 'single_question',
      hideQuestionNumber: false,
      shortAnswerLimit: 200,
      essayAnswerLimit: 500,
    },
  });

  const editor = useRef<unknown>(null);
  const answerEditor = useRef<unknown>(null);

  // ============================================================================
  // Helper Functions
  // ============================================================================

  const resetModalState = (): void => {
    setQuizData({
      title: '',
      summary: '',
      questions: [],
      settings: {
        passingScore: 70,
        feedbackMode: 'default',
        randomizeQuestions: false,
        showAnswersAfterSubmit: true,
        maxQuestions: 0,
        maxAttempts: 3,
        questionLayout: 'random',
        questionsOrder: 'single_question',
        hideQuestionNumber: false,
        shortAnswerLimit: 200,
        essayAnswerLimit: 500,
      },
    });

    setCurrentStep(1);
    setToggle(true);
    setEditingQuestionIndex(null);
    setIsSaving(false);
    setCurrentQuestion({
      question: '',
      questionImage: null,
      type: 'True/False',
      points: 10,
      required: true,
      randomize: false,
      description: '',
      correctAnswer: true,
      options: [],
      explanation: '',
      blanks: [],
      sortItems: [],
      imageMatchingImage: null,
      imageMatchingText: '',
      imageMatchingPairs: [],
      matchingPairs: undefined,
    });
    setSelectedOption('True/False');
  };

  const closeModal = (): void => {
    const modalElement = document.getElementById(modalId);

    if (modalElement && window.bootstrap?.Modal) {
      const modalInstance = window.bootstrap.Modal.getInstance(modalElement);

      if (!modalInstance) {
        new window.bootstrap.Modal(modalElement);
      }

      const finalInstance = window.bootstrap.Modal.getInstance(modalElement);
      if (finalInstance) {
        finalInstance.hide();
      }
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _handleCancelClick = (): void => {
    resetModalState();
    closeModal();
  };

  const generateQuestionId = (): string => {
    return `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // ============================================================================
  // Effects
  // ============================================================================

  useEffect(() => {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const handleModalHidden = (): void => {
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) {
          backdrop.remove();
        }
        document.body.classList.remove('modal-open');
        document.body.style.removeProperty('padding-right');
      };

      modalElement.addEventListener('hidden.bs.modal', handleModalHidden);

      return () => {
        modalElement.removeEventListener('hidden.bs.modal', handleModalHidden);
      };
    }
  }, [modalId]);

  useEffect(() => {
    if (editingQuiz) {
      try {
        const isFromDB =
          'content_data' in editingQuiz &&
          editingQuiz.content_data !== undefined;
        const rawContent = isFromDB
          ? (editingQuiz as any).content_data
          : editingQuiz;
        const quizContent = JSON.parse(JSON.stringify(rawContent)) as QuizData;

        const questions = (quizContent.questions || []).map((q, qIndex) => {
          const questionAny = q as any;
          let normalizedOptions: QuestionOption[] = [];
          if (Array.isArray(questionAny.options)) {
            normalizedOptions = (questionAny.options as any[]).map(
              (opt, idx) => {
                if (typeof opt === 'string') {
                  return { id: `opt_${qIndex}_${idx}`, text: opt };
                }
                return opt as QuestionOption;
              }
            );
          }

          let normalizedCorrectAnswer = questionAny.correctAnswer;
          if (
            q.type === 'Single Choice' &&
            typeof questionAny.correctAnswer === 'number'
          ) {
            normalizedCorrectAnswer = `opt_${qIndex}_${questionAny.correctAnswer}`;
          } else if (
            q.type === 'Multiple Choice' &&
            Array.isArray(questionAny.correctAnswer)
          ) {
            normalizedCorrectAnswer = (questionAny.correctAnswer as any[]).map(
              (idx) => (typeof idx === 'number' ? `opt_${qIndex}_${idx}` : idx)
            );
          }

          return {
            ...q,
            options: normalizedOptions,
            correctAnswer: normalizedCorrectAnswer,
          } as QuizQuestion;
        });

        setQuizData({
          title: editingQuiz.title || '',
          summary: isFromDB
            ? (editingQuiz as any).description
            : editingQuiz.summary || '',
          questions: questions,
          settings: quizContent.settings || {
            passingScore: 70,
            feedbackMode: 'default',
            randomizeQuestions: false,
            showAnswersAfterSubmit: true,
            maxQuestions: 0,
            maxAttempts: 3,
            questionLayout: 'random',
            questionsOrder: 'single_question',
            hideQuestionNumber: false,
            shortAnswerLimit: 200,
            essayAnswerLimit: 500,
          },
        });
        setCurrentStep(1);
        setToggle(true);
        setEditingQuestionIndex(null);
      } catch (e) {
        console.error('Error loading editing quiz:', e);
      }
    } else {
      resetModalState();
    }
  }, [editingQuiz]);

  // ============================================================================
  // Event Handlers
  // ============================================================================

  const handleSelectChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    const newType = e.target.value as QuestionTypeEnum;
    setSelectedOption(newType);
    const defaultCorrectAnswer = newType === 'True/False' ? true : null;
    setCurrentQuestion({
      ...currentQuestion,
      type: newType,
      correctAnswer: defaultCorrectAnswer,
    });
  };

  const handleAddQuestion = (): void => {
    if (!currentQuestion.question?.trim()) {
      alert('Please enter a question');
      return;
    }

    const newQuestion: QuizQuestion = {
      ...currentQuestion,
      id: generateQuestionId(),
    } as QuizQuestion;

    if (editingQuestionIndex !== null) {
      const updatedQuestions = [...quizData.questions];
      updatedQuestions[editingQuestionIndex] = newQuestion;
      setQuizData({ ...quizData, questions: updatedQuestions });
      setEditingQuestionIndex(null);
    } else {
      setQuizData({
        ...quizData,
        questions: [...quizData.questions, newQuestion],
      });
    }

    setCurrentQuestion({
      question: '',
      questionImage: null,
      type: selectedOption,
      points: 10,
      required: true,
      randomize: false,
      description: '',
      correctAnswer: selectedOption === 'True/False' ? true : null,
      options: [],
      explanation: '',
      blanks: [],
      sortItems: [],
      imageMatchingImage: null,
      imageMatchingText: '',
      imageMatchingPairs: [],
      matchingPairs: undefined,
    });
    setToggle(true);
  };

  const handleEditQuestion = (index: number): void => {
    const question = quizData.questions[index];

    const normalizedOptions = ((question as any).options || []).map(
      (opt: any, idx: number) => {
        if (typeof opt === 'string') {
          return { id: `opt_${index}_${idx}`, text: opt };
        }
        return opt as QuestionOption;
      }
    );

    let normalizedCorrectAnswer = (question as any).correctAnswer;

    if (
      question.type === 'Single Choice' &&
      typeof (question as any).correctAnswer === 'number'
    ) {
      normalizedCorrectAnswer = `opt_${index}_${(question as any).correctAnswer}`;
    } else if (
      question.type === 'Single Choice' &&
      typeof (question as any).correctAnswer === 'string' &&
      !isNaN(parseInt((question as any).correctAnswer))
    ) {
      const idx = parseInt((question as any).correctAnswer);
      if (idx < normalizedOptions.length) {
        normalizedCorrectAnswer = `opt_${index}_${idx}`;
      }
    } else if (
      question.type === 'Multiple Choice' &&
      Array.isArray((question as any).correctAnswer)
    ) {
      normalizedCorrectAnswer = ((question as any).correctAnswer as any[]).map(
        (answer) => {
          if (typeof answer === 'number') {
            return `opt_${index}_${answer}`;
          } else if (typeof answer === 'string' && !isNaN(parseInt(answer))) {
            return `opt_${index}_${parseInt(answer)}`;
          }
          return answer;
        }
      );
    }

    setCurrentQuestion({
      ...(question as any),
      options: normalizedOptions,
      correctAnswer: normalizedCorrectAnswer,
      blanks: (question as any).blanks || [],
      sortItems: (question as any).sortItems || [],
      matchingPairs: (question as any).matchingPairs || {
        leftItems: [],
        rightItems: [],
        correctMatches: {},
      },
      imageMatchingPairs: (question as any).imageMatchingPairs || [],
      questionImage: (question as any).questionImage || null,
    });
    setSelectedOption(question.type || 'True/False');
    setEditingQuestionIndex(index);
    setToggle(false);
  };

  const handleDeleteQuestion = (index: number): void => {
    const updatedQuestions = quizData.questions.filter((_, i) => i !== index);
    setQuizData({ ...quizData, questions: updatedQuestions });
  };

  const handleNextClick = (): void => {
    setCurrentStep((prevStep) => Math.min(prevStep + 1, 3));
  };

  const handleBackClick = (): void => {
    const newStep = Math.max(currentStep - 1, 1);
    setCurrentStep(newStep);
    if (newStep === 1) {
      setToggle(true);
    }
  };

  const loadSampleQuizData = (): void => {
    const sampleQuizData: QuizData = {
      title: '샘플 퀴즈 - React 기초',
      summary: 'React의 기본 개념을 확인하는 샘플 퀴즈입니다.',
      questions: [
        {
          id: `sample_${Date.now()}_1`,
          type: 'True/False',
          question: 'React는 Facebook에서 개발한 JavaScript 라이브러리입니다.',
          points: 10,
          required: true,
          randomize: false,
          correctAnswer: true,
          explanation:
            '맞습니다. React는 2013년 Facebook(현 Meta)에서 공개했습니다.',
        },
        {
          id: `sample_${Date.now()}_2`,
          type: 'Single Choice',
          question: '다음 중 React의 주요 특징이 아닌 것은?',
          points: 10,
          required: true,
          randomize: true,
          options: [
            { id: 's1', text: '가상 DOM 사용' },
            { id: 's2', text: '컴포넌트 기반 구조' },
            { id: 's3', text: '단방향 데이터 흐름' },
            { id: 's4', text: '자동 메모리 관리' },
          ],
          correctAnswer: 's4',
          explanation: '자동 메모리 관리는 React의 특징이 아닙니다.',
        },
        {
          id: `sample_${Date.now()}_3`,
          type: 'Multiple Choice',
          question: '다음 중 JavaScript의 특징을 모두 고르세요.',
          points: 20,
          required: true,
          randomize: true,
          options: [
            { id: 'mc1', text: '동적 타입 언어' },
            { id: 'mc2', text: '프로토타입 기반' },
            { id: 'mc3', text: '컴파일 언어' },
            { id: 'mc4', text: '비동기 처리 지원' },
          ],
          correctAnswer: ['mc1', 'mc2', 'mc4'],
          explanation:
            'JavaScript는 인터프리터 언어이며, 컴파일 언어가 아닙니다.',
        },
        {
          id: `sample_${Date.now()}_4`,
          type: 'Open Ended',
          question: 'React의 장점을 3가지 이상 설명하세요.',
          points: 30,
          required: true,
          correctAnswer: null,
          explanation:
            'Component 재사용성, Virtual DOM으로 인한 성능 향상, 단방향 데이터 흐름으로 예측 가능한 상태 관리 등이 있습니다.',
        },
        {
          id: `sample_${Date.now()}_5`,
          type: 'Fill in the Blanks',
          question:
            'React에서 상태를 관리하는 Hook은 [1]이고, 부수 효과를 처리하는 Hook은 [2]입니다.',
          points: 20,
          required: true,
          blanks: [
            { id: 1, answers: ['useState'], caseSensitive: false },
            { id: 2, answers: ['useEffect'], caseSensitive: false },
          ],
          correctAnswer: {
            1: ['useState'],
            2: ['useEffect'],
          },
        },
        {
          id: `sample_${Date.now()}_6`,
          type: 'Sort Answer',
          question: 'React 컴포넌트 생명주기 순서대로 정렬하세요.',
          points: 15,
          required: true,
          sortItems: [
            { id: 1, text: 'constructor', order: 1 },
            { id: 2, text: 'render', order: 2 },
            { id: 3, text: 'componentDidMount', order: 3 },
            { id: 4, text: 'componentDidUpdate', order: 4 },
            { id: 5, text: 'componentWillUnmount', order: 5 },
          ],
          correctAnswer: [1, 2, 3, 4, 5],
        },
        {
          id: `sample_${Date.now()}_7`,
          type: 'Matching',
          question: 'React 개념과 설명을 연결하세요.',
          points: 25,
          required: true,
          randomize: true,
          matchingPairs: {
            leftItems: [
              { id: 'left1', text: 'useState' },
              { id: 'left2', text: 'useEffect' },
              { id: 'left3', text: 'props' },
              { id: 'left4', text: 'JSX' },
            ],
            rightItems: [
              { id: 'right1', text: '상태 관리 Hook' },
              { id: 'right2', text: '부수 효과 처리 Hook' },
              { id: 'right3', text: '컴포넌트 간 데이터 전달' },
              { id: 'right4', text: 'JavaScript XML 문법' },
            ],
            correctMatches: {
              left1: 'right1',
              left2: 'right2',
              left3: 'right3',
              left4: 'right4',
            },
          },
          correctAnswer: {
            left1: 'right1',
            left2: 'right2',
            left3: 'right3',
            left4: 'right4',
          },
        },
      ] as QuizQuestion[],
      settings: {
        passingScore: 70,
        feedbackMode: 'reveal',
        randomizeQuestions: false,
        showAnswersAfterSubmit: true,
        maxQuestions: 0,
        maxAttempts: 3,
        questionLayout: 'one_per_page',
        questionsOrder: 'sequential',
        hideQuestionNumber: false,
        shortAnswerLimit: 200,
        essayAnswerLimit: 500,
      },
    };

    setQuizData(sampleQuizData);
    setSettingsKey((prev) => prev + 1);
    alert(
      '샘플 퀴즈 데이터가 로드되었습니다. 필요에 따라 수정해서 사용하세요.'
    );
  };

  const handleSaveQuiz = async (): Promise<void> => {
    if (
      quizData.title.trim() &&
      quizData.questions &&
      quizData.questions.length > 0 &&
      onAddQuiz
    ) {
      setIsSaving(true);
      try {
        // Remove maxQuestions if it's 0
        const settingsToSave: QuizSettings =
          quizData.settings.maxQuestions === 0
            ? { ...quizData.settings, maxQuestions: 0 }
            : quizData.settings;

        const cleanedQuizData: QuizData = {
          ...quizData,
          questions: (quizData.questions || []).map((q) => {
            let correctAnswerForDB = (q as any).correctAnswer;
            if (q.type === 'Single Choice' && (q as any).correctAnswer) {
              const match = String((q as any).correctAnswer).match(
                /opt_\d+_(\d+)/
              );
              correctAnswerForDB = match
                ? parseInt(match[1])
                : (q as any).correctAnswer;
            } else if (
              q.type === 'Multiple Choice' &&
              Array.isArray((q as any).correctAnswer)
            ) {
              correctAnswerForDB = ((q as any).correctAnswer as any[]).map(
                (id) => {
                  const match = String(id).match(/opt_\d+_(\d+)/);
                  return match ? parseInt(match[1]) : id;
                }
              );
            }

            const cleanedQuestion: any = {
              ...q,
              correctAnswer:
                (q as any).correctAnswer === null && q.type === 'True/False'
                  ? true
                  : correctAnswerForDB,
              description: convertPlaceholdersToIframes(
                (q as any).description || ''
              ),
              explanation: convertPlaceholdersToIframes(
                (q as any).explanation || ''
              ),
              options:
                (q.type === 'Single Choice' || q.type === 'Multiple Choice') &&
                (q as any).options
                  ? ((q as any).options as any[]).map((opt) =>
                      typeof opt === 'object' ? opt.text : opt
                    )
                  : (q as any).options || [],
            };

            if (q.type === 'Fill in the Blanks') {
              cleanedQuestion.blanks = (q as any).blanks || [];
            } else {
              delete cleanedQuestion.blanks;
              delete cleanedQuestion.fillInBlanksQuestion;
              delete cleanedQuestion.fillInBlanksAnswers;
            }

            if (q.type === 'Sort Answer') {
              cleanedQuestion.sortItems = (q as any).sortItems || [];
            } else {
              delete cleanedQuestion.sortItems;
            }

            if (q.type !== 'Image Matching') {
              delete cleanedQuestion.imageMatchingImage;
              delete cleanedQuestion.imageMatchingText;
              delete cleanedQuestion.imageMatchingPairs;
            }

            if (q.type === 'Matching') {
              cleanedQuestion.matchingPairs = (q as any).matchingPairs || {
                leftItems: [],
                rightItems: [],
                correctMatches: {},
              };
            } else {
              delete cleanedQuestion.matchingPairs;
            }

            return cleanedQuestion;
          }),
          settings: settingsToSave,
        };

        let result: QuizActionResult;
        if (editingQuiz) {
          result = await updateQuizLesson(
            editingQuiz.id as string,
            cleanedQuizData as any
          );
        } else {
          const addResult = await onAddQuiz(cleanedQuizData as any);
          result =
            addResult && typeof addResult === 'object'
              ? addResult
              : { success: true };
        }

        if (result && result.success) {
          if (editingQuiz) {
            if (onUpdateQuiz && result.data) {
              onUpdateQuiz(editingQuiz.id, {
                ...result.data,
                id: editingQuiz.id,
                content_type: 'quiz',
              });
            }
            if (onEditComplete) {
              onEditComplete();
            }
          }

          resetModalState();

          const modalElement = document.getElementById(modalId);
          if (modalElement) {
            if (window.bootstrap && window.bootstrap.Modal) {
              try {
                const modalInstance =
                  window.bootstrap.Modal.getInstance(modalElement);
                if (modalInstance) {
                  modalInstance.hide();
                } else {
                  const newInstance = new window.bootstrap.Modal(modalElement);
                  newInstance.hide();
                }
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
              } catch (_error) {
                const closeButton = modalElement.querySelector(
                  '[data-bs-dismiss="modal"]'
                );
                if (closeButton) {
                  (closeButton as HTMLElement).click();
                }
              }
            } else {
              const closeButton = modalElement.querySelector(
                '[data-bs-dismiss="modal"]'
              );
              if (closeButton) {
                (closeButton as HTMLElement).click();
              }
            }

            setTimeout(() => {
              const backdrop = document.querySelector('.modal-backdrop');
              if (backdrop) {
                backdrop.remove();
              }
              document.body.classList.remove('modal-open');
              document.body.style.removeProperty('padding-right');
              document.body.style.removeProperty('overflow');
            }, 100);
          }
        } else {
          alert(
            result?.error || '퀴즈 저장에 실패했습니다. 다시 시도해주세요.'
          );
        }
      } catch (error: unknown) {
        const errorMessage =
          error && typeof error === 'object' && 'message' in error
            ? String((error as Error).message)
            : String(error);
        alert('퀴즈 저장 중 오류가 발생했습니다: ' + errorMessage);
      } finally {
        setIsSaving(false);
      }
    } else if (!quizData.title.trim()) {
      alert('Please enter a quiz title');
      setCurrentStep(1);
    } else if (!quizData.questions || quizData.questions.length === 0) {
      alert('Please add at least one question');
      setCurrentStep(2);
    }
  };

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <>
      <div
        className="rbt-default-modal modal fade m-auto"
        id={modalId}
        tabIndex={-1}
        aria-labelledby={`${modalId}Label`}
        aria-hidden="true"
        data-bs-focus="false"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        style={{ '--bs-modal-padding': '1rem' } as React.CSSProperties}
      >
        <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <button
                type="button"
                className="rbt-round-btn"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={() => resetModalState()}
              >
                <i className="feather-x"></i>
              </button>
            </div>
            <div
              className="modal-body"
              style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}
            >
              <div className="inner rbt-default-form">
                <div className="row">
                  <div className="col-lg-12">
                    <h5 className="modal-title mb--20" id={`${modalId}Label`}>
                      {editingQuiz ? 'Edit Quiz' : 'Add Quiz'}
                    </h5>
                    <div className="course-field quiz-modal mb--40">
                      <div className="d-flex justify-content-between">
                        <span>Quiz info</span>
                        <span>Question</span>
                        <span>Settings</span>
                      </div>
                      <div className="position-relative m-4">
                        <div
                          className="progress"
                          role="progressbar"
                          aria-label="Progress"
                          aria-valuenow={(currentStep / 3) * 100}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        >
                          <div
                            className="progress-bar"
                            style={{ width: `${(currentStep / 3) * 100}%` }}
                          ></div>
                        </div>
                        <button
                          type="button"
                          className={`position-absolute top-0 start-0 translate-middle btn quiz-modal-btn ${
                            currentStep >= 1 ? 'quiz-modal__active' : ''
                          }`}
                        >
                          <i className="feather-check"></i>
                        </button>
                        <button
                          type="button"
                          className={`position-absolute top-0 start-50 translate-middle btn quiz-modal-btn ${
                            currentStep >= 2 ? 'quiz-modal__active' : ''
                          }`}
                        >
                          {currentStep >= 2 ? (
                            <i className="feather-check"></i>
                          ) : (
                            '2'
                          )}
                        </button>
                        <button
                          type="button"
                          className={`position-absolute top-0 start-100 translate-middle btn quiz-modal-btn ${
                            currentStep >= 3 ? 'quiz-modal__active' : ''
                          } btn-secondary`}
                        >
                          {currentStep >= 3 ? (
                            <i className="feather-check"></i>
                          ) : (
                            '3'
                          )}
                        </button>
                      </div>
                    </div>
                    {currentStep === 1 && (
                      <form className="tabs-1">
                        <div className="course-field mb--20">
                          <label htmlFor="quizModalTitle">Quiz Title</label>
                          <input
                            id="quizModalTitle"
                            type="text"
                            placeholder="Type your quiz title here"
                            value={quizData.title}
                            onChange={(e) =>
                              setQuizData({
                                ...quizData,
                                title: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="course-field mb--20">
                          <label htmlFor="quizModalSummary">Quiz Summary</label>
                          <textarea
                            id="quizModalSummary"
                            value={quizData.summary}
                            onChange={(e) =>
                              setQuizData({
                                ...quizData,
                                summary: e.target.value,
                              })
                            }
                          ></textarea>
                          <small>
                            <i className="feather-info"></i> Add a summary of
                            short text to prepare students for the activities
                            for the Quiz. The text is shown on the course page
                            beside the tooltip beside the Quiz name.
                          </small>
                        </div>
                      </form>
                    )}
                    {currentStep === 2 && (
                      <form className="tabs-2">
                        {toggle ? (
                          <div className="content">
                            <div className="course-field mb--20">
                              {!quizData.questions ||
                              quizData.questions.length === 0 ? (
                                <div className="text-center py-4">
                                  <i className="feather-info fs-3 text-muted mb-3 d-block"></i>
                                  <p className="text-muted">
                                    No questions added yet. Click &quot;Add
                                    Question&quot; to create your first
                                    question.
                                  </p>
                                </div>
                              ) : (
                                (quizData.questions || []).map(
                                  (question, index) => (
                                    <QuestionType
                                      key={question.id}
                                      title={`Question No.${String(index + 1).padStart(2, '0')}`}
                                      type={question.type}
                                      points={question.points}
                                      question={question.question}
                                      onEdit={() => handleEditQuestion(index)}
                                      onDelete={() =>
                                        handleDeleteQuestion(index)
                                      }
                                    />
                                  )
                                )
                              )}
                            </div>
                            <div className="course-field">
                              <button
                                className="rbt-btn btn-border hover-icon-reverse rbt-sm-btn btn-1"
                                type="button"
                                onClick={() => {
                                  setEditingQuestionIndex(null);
                                  setToggle(!toggle);
                                }}
                              >
                                <span className="icon-reverse-wrapper">
                                  <span className="btn-text">Add Question</span>
                                  <span className="btn-icon">
                                    <i className="feather-plus-square"></i>
                                  </span>
                                  <span className="btn-icon">
                                    <i className="feather-plus-square"></i>
                                  </span>
                                </span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <Question
                            handleSelectChange={handleSelectChange}
                            selectedOption={selectedOption}
                            editor={editor}
                            answerEditor={answerEditor}
                            currentQuestion={currentQuestion}
                            setCurrentQuestion={setCurrentQuestion}
                            isEditing={editingQuestionIndex !== null}
                          />
                        )}
                      </form>
                    )}
                    {currentStep === 3 && (
                      <Settings
                        key={settingsKey}
                        quizData={quizData}
                        setQuizData={setQuizData}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="top-circle-shape"></div>
            <div className="modal-footer pt--30 justify-content-between">
              <button
                type="button"
                className="rbt-btn btn-border btn-md radius-round-10"
                data-bs-dismiss="modal"
                onClick={() => resetModalState()}
              >
                Cancel
              </button>
              <div className="content">
                <button
                  type="button"
                  className="rbt-btn btn-border btn-md radius-round-10 mr--10"
                  onClick={handleBackClick}
                >
                  Back
                </button>

                {currentStep === 3 &&
                  process.env.NODE_ENV === 'development' && (
                    <button
                      type="button"
                      className="rbt-btn btn-outline-secondary btn-md me-3"
                      onClick={loadSampleQuizData}
                      style={{
                        borderStyle: 'dashed',
                        opacity: 0.8,
                      }}
                    >
                      <i className="feather-download me-2"></i>
                      샘플 퀴즈 로드 (개발용)
                    </button>
                  )}

                {currentStep === 3 ? (
                  <button
                    type="button"
                    className="rbt-btn btn-gradient btn-md"
                    disabled={isSaving}
                    onClick={handleSaveQuiz}
                  >
                    {isSaving ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        저장 중...
                      </>
                    ) : editingQuiz ? (
                      'Update Quiz'
                    ) : (
                      'Add Quiz'
                    )}
                  </button>
                ) : toggle ? (
                  <button
                    type="button"
                    className="rbt-btn btn-md btn-2"
                    onClick={handleNextClick}
                  >
                    Save & Next
                  </button>
                ) : (
                  <button
                    type="button"
                    className="rbt-btn btn-md btn-2"
                    onClick={handleAddQuestion}
                  >
                    {editingQuestionIndex !== null
                      ? 'Update Question'
                      : 'Add Question'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default QuizModal;
