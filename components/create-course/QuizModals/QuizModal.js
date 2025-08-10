"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

import Settings from "../QuizTab/Settings";
import Question from "../QuizTab/Question";
import QuestionType from "../QuizTab/QuestionType";
import { convertPlaceholdersToIframes } from "@/app/lib/utils/videoUtils";
import { updateQuizLesson } from "@/app/lib/actions/quizActions";

const QuizModal = ({ modalId = "Quiz", topicId, onAddQuiz, onUpdateQuiz, editingQuiz, onEditComplete }) => {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState("True/False");
  const [currentStep, setCurrentStep] = useState(1);
  const [toggle, setToggle] = useState(true);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [settingsKey, setSettingsKey] = useState(0);
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
    blanks: [],
    // Sort Answer fields
    sortItems: [],
    // Image Matching fields
    imageMatchingImage: null,
    imageMatchingText: '',
    imageMatchingPairs: [],
    // Matching fields
    matchingPairs: {
      leftItems: [],
      rightItems: [],
      correctMatches: {}
    }
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
  
  // 모달 상태를 초기화하는 함수 - useEffect 전에 정의
  const resetModalState = () => {
    // 항상 모든 상태를 초기화 (편집 모드 여부와 관계없이)
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
    
    // 기타 상태들 초기화
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
      matchingPairs: null
    });
    setSelectedOption('True/False');
  };

  // 모달을 닫는 함수
  const closeModal = () => {
    console.log('[closeModal] Called with modalId:', modalId);
    const modalElement = document.getElementById(modalId);
    console.log('[closeModal] Modal element found:', !!modalElement);
    
    if (modalElement && window.bootstrap?.Modal) {
      console.log('[closeModal] Bootstrap Modal available');
      const modalInstance = window.bootstrap.Modal.getInstance(modalElement);
      console.log('[closeModal] Existing instance:', !!modalInstance);
      
      if (!modalInstance) {
        console.log('[closeModal] Creating new instance');
        new window.bootstrap.Modal(modalElement);
      }
      
      const finalInstance = window.bootstrap.Modal.getInstance(modalElement);
      if (finalInstance) {
        finalInstance.hide();
      }
    }
  };

  // Cancel 버튼 클릭 핸들러
  const handleCancelClick = () => {
    resetModalState();
    closeModal();
  };
  
  // 모달 ID 확인
  useEffect(() => {
    console.log('[QuizModal] Mounted with modalId:', modalId);
  }, [modalId]);

  // 모달 닫힘 이벤트 리스너 설정
  useEffect(() => {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const handleModalHidden = () => {
        // 모달이 닫힐 때 백드롭 정리
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

  // Load editing quiz data
  useEffect(() => {
    if (editingQuiz) {
      console.log('Loading quiz for editing:', editingQuiz);
      
      // 안전성 체크 - editingQuiz 객체 구조 확인
      try {
        console.log('editingQuiz keys:', Object.keys(editingQuiz));
        console.log('content_data type:', typeof editingQuiz.content_data);
      } catch (e) {
        console.error('Error accessing editingQuiz properties:', e);
      }
      
      // DB에서 온 데이터인지 로컬 데이터인지 구분
      const isFromDB = editingQuiz.content_data !== undefined;
      // JSON parse/stringify로 안전한 객체로 변환
      const rawContent = isFromDB ? editingQuiz.content_data : editingQuiz;
      const quizContent = JSON.parse(JSON.stringify(rawContent));
      
      // 질문 데이터 정규화
      const questions = (quizContent.questions || []).map((q, qIndex) => {
        // 옵션이 문자열 배열인 경우 객체 배열로 변환
        let normalizedOptions = [];
        if (Array.isArray(q.options)) {
          normalizedOptions = q.options.map((opt, idx) => {
            if (typeof opt === 'string') {
              return { id: `opt_${qIndex}_${idx}`, text: opt };
            }
            return opt;
          });
        }
        
        // correctAnswer 정규화 (인덱스를 옵션 ID로 변환)
        let normalizedCorrectAnswer = q.correctAnswer;
        if (q.type === 'Single Choice' && typeof q.correctAnswer === 'number') {
          normalizedCorrectAnswer = `opt_${qIndex}_${q.correctAnswer}`;
        } else if (q.type === 'Multiple Choice' && Array.isArray(q.correctAnswer)) {
          normalizedCorrectAnswer = q.correctAnswer.map(idx => 
            typeof idx === 'number' ? `opt_${qIndex}_${idx}` : idx
          );
        }
        
        return {
          ...q,
          options: normalizedOptions,
          correctAnswer: normalizedCorrectAnswer
        };
      });
      
      setQuizData({
        title: editingQuiz.title || '',
        summary: isFromDB ? editingQuiz.description : (editingQuiz.summary || ''),
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
          essayAnswerLimit: 500
        }
      });
      setCurrentStep(1);
      setToggle(true);
      setEditingQuestionIndex(null);
    } else {
      // editingQuiz가 없으면 (생성 모드) 상태 초기화
      resetModalState();
    }
  }, [editingQuiz]);

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
      blanks: [],
      // Sort Answer fields
      sortItems: [],
      // Image Matching fields
      imageMatchingImage: null,
      imageMatchingText: '',
      imageMatchingPairs: [],
      // Matching fields
      matchingPairs: null
    });
    setToggle(true);
  };

  const handleEditQuestion = (index) => {
    const question = quizData.questions[index];
    
    // 옵션 재정규화 (DB에서 온 문자열 배열을 객체 배열로 변환)
    const normalizedOptions = (question.options || []).map((opt, idx) => {
      if (typeof opt === 'string') {
        return { id: `opt_${index}_${idx}`, text: opt };
      }
      // 이미 객체인 경우 그대로 사용
      return opt;
    });
    
    // correctAnswer 재정규화
    let normalizedCorrectAnswer = question.correctAnswer;
    
    // 숫자 인덱스인 경우
    if (question.type === 'Single Choice' && typeof question.correctAnswer === 'number') {
      normalizedCorrectAnswer = `opt_${index}_${question.correctAnswer}`;
    } 
    // 문자열이지만 숫자로 변환 가능한 경우 (예: "0", "1")
    else if (question.type === 'Single Choice' && 
             typeof question.correctAnswer === 'string' && 
             !isNaN(parseInt(question.correctAnswer))) {
      const idx = parseInt(question.correctAnswer);
      if (idx < normalizedOptions.length) {
        normalizedCorrectAnswer = `opt_${index}_${idx}`;
      }
    }
    // Multiple Choice 처리
    else if (question.type === 'Multiple Choice' && Array.isArray(question.correctAnswer)) {
      normalizedCorrectAnswer = question.correctAnswer.map(answer => {
        if (typeof answer === 'number') {
          return `opt_${index}_${answer}`;
        } else if (typeof answer === 'string' && !isNaN(parseInt(answer))) {
          return `opt_${index}_${parseInt(answer)}`;
        }
        return answer;
      });
    }
    
    setCurrentQuestion({
      ...question,
      options: normalizedOptions,
      correctAnswer: normalizedCorrectAnswer,
      // Provide safe defaults for all possible question types
      blanks: question.blanks || [],
      sortItems: question.sortItems || [],
      matchingPairs: question.matchingPairs || {
        leftItems: [],
        rightItems: [],
        correctMatches: {}
      },
      imageMatchingPairs: question.imageMatchingPairs || [],
      questionImage: question.questionImage || null
    });
    setSelectedOption(question.type || 'True/False');
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
    const newStep = Math.max(currentStep - 1, 1);
    setCurrentStep(newStep);
    // Step 1로 돌아가면 toggle을 true로 설정하여 Quiz info 폼을 보여줌
    if (newStep === 1) {
      setToggle(true);
    }
  };

  // 개발 환경 전용 - 샘플 퀴즈 데이터 로드 함수
  const loadSampleQuizData = () => {
    // 완전히 독립된 샘플 데이터
    const sampleQuizData = {
      title: "샘플 퀴즈 - React 기초",
      summary: "React의 기본 개념을 확인하는 샘플 퀴즈입니다.",
      questions: [
        {
          id: `sample_${Date.now()}_1`,
          type: "True/False",
          question: "React는 Facebook에서 개발한 JavaScript 라이브러리입니다.",
          points: 10,
          required: true,
          randomize: false,
          correctAnswer: true,
          explanation: "맞습니다. React는 2013년 Facebook(현 Meta)에서 공개했습니다."
        },
        {
          id: `sample_${Date.now()}_2`,
          type: "Single Choice",
          question: "다음 중 React의 주요 특징이 아닌 것은?",
          points: 10,
          required: true,
          randomize: true,
          options: [
            { id: "s1", text: "가상 DOM 사용" },
            { id: "s2", text: "컴포넌트 기반 구조" },
            { id: "s3", text: "단방향 데이터 흐름" },
            { id: "s4", text: "자동 메모리 관리" }
          ],
          correctAnswer: "s4",
          explanation: "자동 메모리 관리는 React의 특징이 아닙니다."
        },
        {
          id: `sample_${Date.now()}_3`,
          type: "Multiple Choice",
          question: "다음 중 JavaScript의 특징을 모두 고르세요.",
          points: 20,
          required: true,
          randomize: true,
          options: [
            { id: "mc1", text: "동적 타입 언어" },
            { id: "mc2", text: "프로토타입 기반" },
            { id: "mc3", text: "컴파일 언어" },
            { id: "mc4", text: "비동기 처리 지원" }
          ],
          correctAnswer: ["mc1", "mc2", "mc4"],
          explanation: "JavaScript는 인터프리터 언어이며, 컴파일 언어가 아닙니다."
        },
        {
          id: `sample_${Date.now()}_4`,
          type: "Open Ended",
          question: "React의 장점을 3가지 이상 설명하세요.",
          points: 30,
          required: true,
          correctAnswer: null,
          explanation: "Component 재사용성, Virtual DOM으로 인한 성능 향상, 단방향 데이터 흐름으로 예측 가능한 상태 관리 등이 있습니다."
        },
        {
          id: `sample_${Date.now()}_5`,
          type: "Fill in the Blanks",
          question: "React에서 상태를 관리하는 Hook은 [1]이고, 부수 효과를 처리하는 Hook은 [2]입니다.",
          points: 20,
          required: true,
          blanks: [
            { id: 1, answers: ["useState"], caseSensitive: false },
            { id: 2, answers: ["useEffect"], caseSensitive: false }
          ],
          correctAnswer: {
            1: ["useState"],
            2: ["useEffect"]
          }
        },
        {
          id: `sample_${Date.now()}_6`,
          type: "Sort Answer",
          question: "React 컴포넌트 생명주기 순서대로 정렬하세요.",
          points: 15,
          required: true,
          sortItems: [
            { id: 1, text: "constructor", order: 1 },
            { id: 2, text: "render", order: 2 },
            { id: 3, text: "componentDidMount", order: 3 },
            { id: 4, text: "componentDidUpdate", order: 4 },
            { id: 5, text: "componentWillUnmount", order: 5 }
          ],
          correctAnswer: [1, 2, 3, 4, 5]
        },
        {
          id: `sample_${Date.now()}_7`,
          type: "Matching",
          question: "React 개념과 설명을 연결하세요.",
          points: 25,
          required: true,
          randomize: true,
          matchingPairs: {
            leftItems: [
              { id: "left1", text: "useState" },
              { id: "left2", text: "useEffect" },
              { id: "left3", text: "props" },
              { id: "left4", text: "JSX" }
            ],
            rightItems: [
              { id: "right1", text: "상태 관리 Hook" },
              { id: "right2", text: "부수 효과 처리 Hook" },
              { id: "right3", text: "컴포넌트 간 데이터 전달" },
              { id: "right4", text: "JavaScript XML 문법" }
            ],
            correctMatches: {
              "left1": "right1",
              "left2": "right2",
              "left3": "right3",
              "left4": "right4"
            }
          },
          correctAnswer: {
            "left1": "right1",
            "left2": "right2",
            "left3": "right3",
            "left4": "right4"
          }
        }
      ],
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
        essayAnswerLimit: 500
      }
    };

    // 기존 데이터를 완전히 교체 (안전한 방식)
    setQuizData(sampleQuizData);
    
    // Settings 컴포넌트 재마운트를 위해 key 변경
    setSettingsKey(prev => prev + 1);
    
    // 사용자에게 알림
    alert('샘플 퀴즈 데이터가 로드되었습니다. 필요에 따라 수정해서 사용하세요.');
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
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        style={{ '--bs-modal-padding': '1rem' }}
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
            <div className="modal-body" style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
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
                              {(!quizData.questions || quizData.questions.length === 0) ? (
                                <div className="text-center py-4">
                                  <i className="feather-info fs-3 text-muted mb-3 d-block"></i>
                                  <p className="text-muted">
                                    No questions added yet. Click &quot;Add Question&quot; to create your first question.
                                  </p>
                                </div>
                              ) : (
                                (quizData.questions || []).map((question, index) => (
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
                    {currentStep === 3 && <Settings key={settingsKey} quizData={quizData} setQuizData={setQuizData} />}
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
                
                {/* 개발 환경에서만 표시되는 샘플 퀴즈 로드 버튼 */}
                {currentStep === 3 && process.env.NODE_ENV === 'development' && (
                  <button
                    type="button"
                    className="rbt-btn btn-outline-secondary btn-md me-3"
                    onClick={loadSampleQuizData}
                    style={{ 
                      borderStyle: 'dashed',
                      opacity: 0.8 
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
                    onClick={async () => {
                      if (quizData.title.trim() && quizData.questions && quizData.questions.length > 0 && onAddQuiz) {
                        setIsSaving(true);
                        try {
                        // Clean up quiz data before sending
                        const cleanedSettings = { ...quizData.settings };
                        // Remove maxQuestions if it's 0 (instead of setting to undefined)
                        if (cleanedSettings.maxQuestions === 0) {
                          delete cleanedSettings.maxQuestions;
                        }
                        
                        const cleanedQuizData = {
                          ...quizData,
                          questions: (quizData.questions || []).map((q, qIndex) => {
                            // correctAnswer를 인덱스로 변환
                            let correctAnswerForDB = q.correctAnswer;
                            if (q.type === 'Single Choice' && q.correctAnswer) {
                              // opt_0_1 형식에서 인덱스 추출
                              const match = q.correctAnswer.match(/opt_\d+_(\d+)/);
                              correctAnswerForDB = match ? parseInt(match[1]) : q.correctAnswer;
                            } else if (q.type === 'Multiple Choice' && Array.isArray(q.correctAnswer)) {
                              correctAnswerForDB = q.correctAnswer.map(id => {
                                const match = id.match(/opt_\d+_(\d+)/);
                                return match ? parseInt(match[1]) : id;
                              });
                            }
                            
                            // Remove unnecessary fields based on question type
                            const cleanedQuestion = {
                              ...q,
                              // Ensure correctAnswer has appropriate value
                              correctAnswer: q.correctAnswer === null && q.type === 'True/False' ? true : correctAnswerForDB,
                              // Convert placeholders to iframes for storage
                              description: convertPlaceholdersToIframes(q.description || ''),
                              explanation: convertPlaceholdersToIframes(q.explanation || ''),
                              // Convert options to string array for Single/Multiple Choice
                              options: (q.type === 'Single Choice' || q.type === 'Multiple Choice') && q.options
                                ? q.options.map(opt => typeof opt === 'object' ? opt.text : opt)
                                : q.options || []
                            };
                            
                            // Clean up type-specific fields
                            if (q.type === 'Fill in the Blanks') {
                              // Keep blanks for Fill in the Blanks
                              cleanedQuestion.blanks = q.blanks || [];
                            } else {
                              // Remove Fill in the Blanks specific fields for other types
                              delete cleanedQuestion.blanks;
                              delete cleanedQuestion.fillInBlanksQuestion;
                              delete cleanedQuestion.fillInBlanksAnswers;
                            }
                            
                            // Handle Sort Answer fields
                            if (q.type === 'Sort Answer') {
                              cleanedQuestion.sortItems = q.sortItems || [];
                            } else {
                              delete cleanedQuestion.sortItems;
                            }
                            
                            // Remove image matching fields if not Image Matching type
                            if (q.type !== 'Image Matching') {
                              delete cleanedQuestion.imageMatchingImage;
                              delete cleanedQuestion.imageMatchingText;
                              delete cleanedQuestion.imageMatchingPairs;
                            }
                            
                            // Handle Matching fields
                            if (q.type === 'Matching') {
                              cleanedQuestion.matchingPairs = q.matchingPairs || {
                                leftItems: [],
                                rightItems: [],
                                correctMatches: {}
                              };
                            } else {
                              delete cleanedQuestion.matchingPairs;
                            }
                            
                            return cleanedQuestion;
                          }),
                          settings: cleanedSettings
                        };
                        
                        let result;
                        if (editingQuiz) {
                          // 편집 모드: updateQuizLesson 호출
                          result = await updateQuizLesson(editingQuiz.id, cleanedQuizData);
                        } else {
                          // 생성 모드: onAddQuiz 호출 (Promise처럼 처리)
                          const addResult = onAddQuiz(cleanedQuizData);
                          // onAddQuiz가 직접 객체를 반환하는 경우 처리
                          result = addResult && typeof addResult === 'object' ? addResult : { success: true };
                        }
                        
                        if (result && result.success) {
                          // 편집 완료 콜백 호출 (편집 모드일 때만)
                          if (editingQuiz) {
                            // 서버에서 반환된 데이터 사용
                            if (onUpdateQuiz && result.data) {
                              onUpdateQuiz(editingQuiz.id, {
                                ...result.data,
                                id: editingQuiz.id,
                                content_type: 'quiz'
                              });
                            }
                            if (onEditComplete) {
                              onEditComplete();
                            }
                          }
                          
                          // Reset modal state first
                          resetModalState();
                          
                          // Close modal with proper cleanup
                          console.log('[Save Success] Closing modal with ID:', modalId);
                          const modalElement = document.getElementById(modalId);
                          if (modalElement) {
                            // Bootstrap Modal 인스턴스 확인 및 닫기
                            if (window.bootstrap && window.bootstrap.Modal) {
                              try {
                                const modalInstance = window.bootstrap.Modal.getInstance(modalElement);
                                if (modalInstance) {
                                  modalInstance.hide();
                                } else {
                                  // 인스턴스가 없으면 새로 생성하여 닫기
                                  const newInstance = new window.bootstrap.Modal(modalElement);
                                  newInstance.hide();
                                }
                              } catch (error) {
                                console.error('[Modal Close Error]:', error);
                                // Fallback: data-bs-dismiss를 사용한 닫기 시뮬레이션
                                const closeButton = modalElement.querySelector('[data-bs-dismiss="modal"]');
                                if (closeButton) {
                                  closeButton.click();
                                }
                              }
                            } else {
                              // Bootstrap이 없는 경우 fallback
                              const closeButton = modalElement.querySelector('[data-bs-dismiss="modal"]');
                              if (closeButton) {
                                closeButton.click();
                              }
                            }
                            
                            // 추가 정리 작업
                            setTimeout(() => {
                              // 백드롭 제거
                              const backdrop = document.querySelector('.modal-backdrop');
                              if (backdrop) {
                                backdrop.remove();
                              }
                              // body 클래스 정리
                              document.body.classList.remove('modal-open');
                              document.body.style.removeProperty('padding-right');
                              document.body.style.removeProperty('overflow');
                            }, 100);
                          } else {
                            console.error('[Modal Element Not Found] ID:', modalId);
                          }
                        } else {
                          // 실패한 경우 에러 메시지 표시
                          alert(result?.error || '퀴즈 저장에 실패했습니다. 다시 시도해주세요.');
                        }
                        
                        } catch (error) {
                          console.error('Quiz save error:', error);
                          // error.message가 없을 수 있으므로 안전하게 처리
                          const errorMessage = error?.message || error?.toString() || '알 수 없는 오류가 발생했습니다';
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
                    }}
                  >
                    {isSaving ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        저장 중...
                      </>
                    ) : (
                      editingQuiz ? 'Update Quiz' : 'Add Quiz'
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
