"use client";

import React, { useState, useRef } from "react";

import Settings from "../QuizTab/Settings";
import Question from "../QuizTab/Question";
import QuestionType from "../QuizTab/QuestionType";
import { convertPlaceholdersToIframes } from "@/app/lib/utils/videoUtils";

const QuizModal = ({ modalId = "Quiz", onAddQuiz }) => {
  const [selectedOption, setSelectedOption] = useState("True/False");
  const [currentStep, setCurrentStep] = useState(1);
  const [toggle, setToggle] = useState(true);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState({
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
    // Fill in the Blanks fields
    fillInBlanksQuestion: '',
    fillInBlanksAnswers: '',
    // Image Matching fields
    imageMatchingImage: null,
    imageMatchingText: '',
    imageMatchingPairs: []
  });
  const [quizData, setQuizData] = useState({
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
      essayAnswerLimit: 500
    }
  });
  const editor = useRef(null);
  const answerEditor = useRef(null);

  const handleSelectChange = (e) => {
    const newType = e.target.value;
    setSelectedOption(newType);
    // Set appropriate default correctAnswer based on question type
    const defaultCorrectAnswer = newType === 'True/False' ? true : null;
    setCurrentQuestion({ ...currentQuestion, type: newType, correctAnswer: defaultCorrectAnswer });
  };

  const generateQuestionId = () => {
    return `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleAddQuestion = () => {
    if (!currentQuestion.question.trim()) {
      alert('Please enter a question');
      return;
    }

    const newQuestion = {
      ...currentQuestion,
      id: generateQuestionId()
    };

    if (editingQuestionIndex !== null) {
      // Update existing question
      const updatedQuestions = [...quizData.questions];
      updatedQuestions[editingQuestionIndex] = newQuestion;
      setQuizData({ ...quizData, questions: updatedQuestions });
      setEditingQuestionIndex(null);
    } else {
      // Add new question
      setQuizData({
        ...quizData,
        questions: [...quizData.questions, newQuestion]
      });
    }

    // Reset form
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
      // Fill in the Blanks fields
      fillInBlanksQuestion: '',
      fillInBlanksAnswers: '',
      // Image Matching fields
      imageMatchingImage: null,
      imageMatchingText: '',
      imageMatchingPairs: []
    });
    setToggle(true);
  };

  const handleEditQuestion = (index) => {
    const question = quizData.questions[index];
    setCurrentQuestion(question);
    setSelectedOption(question.type);
    setEditingQuestionIndex(index);
    setToggle(false);
  };

  const handleDeleteQuestion = (index) => {
    const updatedQuestions = quizData.questions.filter((_, i) => i !== index);
    setQuizData({ ...quizData, questions: updatedQuestions });
  };

  const handleNextClick = () => {
    setCurrentStep((prevStep) => Math.min(prevStep + 1, 3));
  };

  const handleBackClick = () => {
    setCurrentStep((prevStep) => Math.max(prevStep - 1, 1));
  };

  return (
    <>
      <div
        className="rbt-default-modal modal fade m-auto"
        id={modalId}
        tabIndex="-1"
        aria-labelledby={`${modalId}Label`}
        aria-hidden="true"
        data-bs-focus="false"
      >
        <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <button
                type="button"
                className="rbt-round-btn"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <i className="feather-x"></i>
              </button>
            </div>
            <div className="modal-body" style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
              <div className="inner rbt-default-form">
                <div className="row">
                  <div className="col-lg-12">
                    <h5 className="modal-title mb--20" id={`${modalId}Label`}>
                      Add Quiz
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
                          aria-valuemin="0"
                          aria-valuemax="100"
                        >
                          <div
                            className="progress-bar"
                            style={{ width: `${(currentStep / 3) * 100}%` }}
                          ></div>
                        </div>
                        <button
                          type="button"
                          className={`position-absolute top-0 start-0 translate-middle btn quiz-modal-btn ${
                            currentStep >= 1 ? "quiz-modal__active" : ""
                          }`}
                        >
                          <i className="feather-check"></i>
                        </button>
                        <button
                          type="button"
                          className={`position-absolute top-0 start-50 translate-middle btn quiz-modal-btn ${
                            currentStep >= 2 ? "quiz-modal__active" : ""
                          }`}
                        >
                          {currentStep >= 2 ? (
                            <i className="feather-check"></i>
                          ) : (
                            "2"
                          )}
                        </button>
                        <button
                          type="button"
                          className={`position-absolute top-0 start-100 translate-middle btn quiz-modal-btn ${
                            currentStep >= 3 ? "quiz-modal__active" : ""
                          } btn-secondary`}
                        >
                          {currentStep >= 3 ? (
                            <i className="feather-check"></i>
                          ) : (
                            "3"
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
                            onChange={(e) => setQuizData({ ...quizData, title: e.target.value })}
                          />
                        </div>
                        <div className="course-field mb--20">
                          <label htmlFor="quizModalSummary">Quiz Summary</label>
                          <textarea 
                            id="quizModalSummary"
                            value={quizData.summary}
                            onChange={(e) => setQuizData({ ...quizData, summary: e.target.value })}
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
                              {quizData.questions.length === 0 ? (
                                <div className="text-center py-4">
                                  <i className="feather-info fs-3 text-muted mb-3 d-block"></i>
                                  <p className="text-muted">
                                    No questions added yet. Click "Add Question" to create your first question.
                                  </p>
                                </div>
                              ) : (
                                quizData.questions.map((question, index) => (
                                  <QuestionType
                                    key={question.id}
                                    title={`Question No.${String(index + 1).padStart(2, '0')}`}
                                    type={question.type}
                                    points={question.points}
                                    question={question.question}
                                    onEdit={() => handleEditQuestion(index)}
                                    onDelete={() => handleDeleteQuestion(index)}
                                  />
                                ))
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
                    {currentStep === 3 && <Settings quizData={quizData} setQuizData={setQuizData} />}
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
                {currentStep === 3 ? (
                  <button
                    type="button"
                    className="rbt-btn btn-gradient btn-md"
                    onClick={() => {
                      if (quizData.title.trim() && quizData.questions.length > 0 && onAddQuiz) {
                        // Clean up quiz data before sending
                        const cleanedQuizData = {
                          ...quizData,
                          questions: quizData.questions.map(q => ({
                            ...q,
                            // Ensure correctAnswer has appropriate value
                            correctAnswer: q.correctAnswer === null && q.type === 'True/False' ? true : q.correctAnswer,
                            // Convert placeholders to iframes for storage
                            description: convertPlaceholdersToIframes(q.description || ''),
                            explanation: convertPlaceholdersToIframes(q.explanation || ''),
                            // Convert options to simple array for Single/Multiple Choice
                            options: (q.type === 'Single Choice' || q.type === 'Multiple Choice') && q.options
                              ? q.options.map(opt => opt.text || opt)
                              : q.options
                          })),
                          settings: {
                            ...quizData.settings,
                            // If maxQuestions is 0, don't send it
                            maxQuestions: quizData.settings.maxQuestions === 0 ? undefined : quizData.settings.maxQuestions
                          }
                        };
                        onAddQuiz(cleanedQuizData);
                        // Reset form
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
                            essayAnswerLimit: 500
                          }
                        });
                        setCurrentStep(1);
                        setToggle(true);
                        
                        // Close modal
                        const modal = document.getElementById(modalId);
                        const modalInstance = window.bootstrap?.Modal?.getInstance(modal);
                        if (modalInstance) {
                          modalInstance.hide();
                        }
                      } else if (!quizData.title.trim()) {
                        alert('Please enter a quiz title');
                        setCurrentStep(1);
                      } else if (quizData.questions.length === 0) {
                        alert('Please add at least one question');
                        setCurrentStep(2);
                      }
                    }}
                  >
                    Add Quiz
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
                    {editingQuestionIndex !== null ? 'Update Question' : 'Add Question'}
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
