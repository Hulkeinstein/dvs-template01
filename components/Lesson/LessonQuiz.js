"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { submitQuizAttempt } from "@/app/lib/actions/quizActions";

const LessonQuiz = ({ quizData, attemptId, lessonId }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [startTime] = useState(new Date());
  const [submitting, setSubmitting] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  
  const questions = quizData?.questions || [];
  const settings = quizData?.settings || {};
  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  
  const handleAnswerChange = (value) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: value
    });
  };
  
  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };
  
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  const handleSubmit = async () => {
    if (!attemptId) return;
    
    try {
      setSubmitting(true);
      const result = await submitQuizAttempt(attemptId, answers);
      
      if (result.success) {
        // Redirect to quiz result page
        window.location.href = `/lesson-quiz-result?attemptId=${attemptId}`;
      } else {
        alert('Failed to submit quiz: ' + result.error);
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('An error occurred while submitting the quiz');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (questions.length === 0) {
    return <div>No questions available in this quiz.</div>;
  }
  return (
    <>
      <form id="quiz-form" className="quiz-form-wrapper">
        <div className="question">
          <div className="quize-top-meta">
            <div className="quize-top-left">
              <span>
                Questions No: <strong>{currentQuestionIndex + 1}/{totalQuestions}</strong>
              </span>
            </div>
            <div className="quize-top-right">
              <span>
                Passing Score: <strong>{settings.passingScore}%</strong>
              </span>
            </div>
          </div>
          <hr />
          
          {currentQuestion && (
            <div className="rbt-single-quiz">
              <h4>{currentQuestionIndex + 1}. {currentQuestion.question}</h4>
              <div className="text-muted mb-3">{currentQuestion.points} points</div>
              
              {/* Render based on question type */}
              {currentQuestion.type === 'True/False' && (
                <div className="row g-3 mt--10">
                  <div className="col-lg-6">
                    <div className="rbt-form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name={`question-${currentQuestion.id}`}
                        id={`${currentQuestion.id}-true`}
                        checked={answers[currentQuestion.id] === true}
                        onChange={() => handleAnswerChange(true)}
                      />
                      <label className="form-check-label" htmlFor={`${currentQuestion.id}-true`}>
                        True
                      </label>
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="rbt-form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name={`question-${currentQuestion.id}`}
                        id={`${currentQuestion.id}-false`}
                        checked={answers[currentQuestion.id] === false}
                        onChange={() => handleAnswerChange(false)}
                      />
                      <label className="form-check-label" htmlFor={`${currentQuestion.id}-false`}>
                        False
                      </label>
                    </div>
                  </div>
                </div>
              )}
              
              {currentQuestion.type === 'Single Choice' && currentQuestion.options && (
                <div className="row g-3 mt--10">
                  {currentQuestion.options.map((option, index) => (
                    <div className="col-lg-6" key={index}>
                      <div className="rbt-form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name={`question-${currentQuestion.id}`}
                          id={`${currentQuestion.id}-option-${index}`}
                          checked={answers[currentQuestion.id] === option}
                          onChange={() => handleAnswerChange(option)}
                        />
                        <label className="form-check-label" htmlFor={`${currentQuestion.id}-option-${index}`}>
                          {option}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {currentQuestion.type === 'Multiple Choice' && currentQuestion.options && (
                <div className="row g-3 mt--10">
                  {currentQuestion.options.map((option, index) => (
                    <div className="col-lg-6" key={index}>
                      <p className="rbt-checkbox-wrapper mb--5">
                        <input
                          id={`${currentQuestion.id}-option-${index}`}
                          type="checkbox"
                          value={option}
                          checked={answers[currentQuestion.id]?.includes(option) || false}
                          onChange={(e) => {
                            const currentAnswers = answers[currentQuestion.id] || [];
                            if (e.target.checked) {
                              handleAnswerChange([...currentAnswers, option]);
                            } else {
                              handleAnswerChange(currentAnswers.filter(a => a !== option));
                            }
                          }}
                        />
                        <label htmlFor={`${currentQuestion.id}-option-${index}`}>
                          {option}
                        </label>
                      </p>
                    </div>
                  ))}
                </div>
              )}
              
              {currentQuestion.type === 'Open Ended' && (
                <div className="mt-3">
                  <textarea
                    className="form-control"
                    rows="5"
                    placeholder="Enter your answer here..."
                    value={answers[currentQuestion.id] || ''}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                  />
                </div>
              )}
              
              {currentQuestion.type === 'Sort Answer' && (
                <div className="mt-3">
                  {currentQuestion.sortItems && currentQuestion.sortItems.length > 0 ? (
                    <div>
                      <p className="mb-3">Drag and drop to arrange items in the correct order:</p>
                      <div className="sortable-list">
                        {(() => {
                          // Get current order or use default order
                          const currentOrder = answers[currentQuestion.id] || currentQuestion.sortItems.map(item => item.id);
                          const orderedItems = currentOrder.map(id => 
                            currentQuestion.sortItems.find(item => item.id === id)
                          ).filter(Boolean);
                          
                          return orderedItems.map((item, index) => (
                            <div
                              key={item.id}
                              className="d-flex align-items-center gap-3 mb-2 p-3 border rounded bg-light"
                              draggable
                              onDragStart={(e) => {
                                setDraggedIndex(index);
                                e.dataTransfer.effectAllowed = 'move';
                              }}
                              onDragOver={(e) => {
                                e.preventDefault();
                                e.dataTransfer.dropEffect = 'move';
                              }}
                              onDrop={(e) => {
                                e.preventDefault();
                                if (draggedIndex === null) return;
                                
                                const newOrder = [...currentOrder];
                                const [draggedItem] = newOrder.splice(draggedIndex, 1);
                                newOrder.splice(index, 0, draggedItem);
                                
                                handleAnswerChange(newOrder);
                                setDraggedIndex(null);
                              }}
                              style={{ cursor: 'move' }}
                            >
                              <i className="feather-menu"></i>
                              <span className="fw-bold">{index + 1}.</span>
                              <span className="flex-grow-1">{item.text}</span>
                            </div>
                          ));
                        })()}
                      </div>
                    </div>
                  ) : (
                    <p>No items to sort</p>
                  )}
                </div>
              )}
              
              {currentQuestion.type === 'Fill in the Blanks' && (
                <div className="mt-3">
                  {currentQuestion.blanks && currentQuestion.blanks.length > 0 ? (
                    // New format with multiple blanks
                    <div>
                      <div className="mb-3">
                        {/* Display question with blank placeholders */}
                        <p className="fs-5">
                          {currentQuestion.question.split(/\[(\d+)\]/g).map((part, index) => {
                            // Check if this part is a number (blank ID)
                            const blankId = parseInt(part);
                            if (!isNaN(blankId) && currentQuestion.blanks.find(b => b.id === blankId)) {
                              return <span key={index} className="text-primary fw-bold">_______</span>;
                            }
                            return <span key={index}>{part}</span>;
                          })}
                        </p>
                      </div>
                      {currentQuestion.blanks.map((blank) => (
                        <div key={blank.id} className="mb-3">
                          <label className="form-label">Blank [{blank.id}]:</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder={`Enter answer for blank ${blank.id}`}
                            value={answers[currentQuestion.id]?.[blank.id] || ''}
                            onChange={(e) => {
                              const currentAnswers = answers[currentQuestion.id] || {};
                              handleAnswerChange({
                                ...currentAnswers,
                                [blank.id]: e.target.value
                              });
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    // Legacy format with single answer
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter your answer"
                      value={answers[currentQuestion.id] || ''}
                      onChange={(e) => handleAnswerChange(e.target.value)}
                    />
                  )}
                </div>
              )}
              
              {currentQuestion.type === 'Matching' && (
                <div className="mt-3">
                  {currentQuestion.matchingPairs ? (
                    <div className="row">
                      <div className="col-md-6">
                        <h6>Items to Match</h6>
                        {currentQuestion.matchingPairs.leftItems?.map((leftItem) => (
                          <div key={leftItem.id} className="mb-3 p-3 border rounded">
                            <div className="d-flex align-items-center justify-content-between">
                              <span>{leftItem.text}</span>
                              <i className="feather-arrow-right"></i>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="col-md-6">
                        <h6>Match With</h6>
                        {currentQuestion.matchingPairs.leftItems?.map((leftItem) => (
                          <div key={leftItem.id} className="mb-3">
                            <select
                              className="form-select"
                              value={answers[currentQuestion.id]?.[leftItem.id] || ''}
                              onChange={(e) => {
                                const currentMatches = answers[currentQuestion.id] || {};
                                handleAnswerChange({
                                  ...currentMatches,
                                  [leftItem.id]: e.target.value
                                });
                              }}
                            >
                              <option value="">Select a match</option>
                              {currentQuestion.matchingPairs.rightItems?.map((rightItem) => (
                                <option key={rightItem.id} value={rightItem.id}>
                                  {rightItem.text}
                                </option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p>No matching items available</p>
                  )}
                </div>
              )}
              
              {currentQuestion.type === 'Image Matching' && (
                <div className="mt-3">
                  {currentQuestion.imageMatchingPairs && currentQuestion.imageMatchingPairs.length > 0 ? (
                    <div>
                      <p className="mb-3">Match each image with the correct text:</p>
                      <div className="row">
                        {currentQuestion.imageMatchingPairs.map((pair) => (
                          <div key={pair.id} className="col-md-6 mb-4">
                            <div className="card">
                              <img 
                                src={pair.image} 
                                className="card-img-top" 
                                alt={`Image ${pair.id}`}
                                style={{ height: '200px', objectFit: 'cover' }}
                              />
                              <div className="card-body">
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Enter matching text"
                                  value={answers[currentQuestion.id]?.[pair.id] || ''}
                                  onChange={(e) => {
                                    const currentMatches = answers[currentQuestion.id] || {};
                                    handleAnswerChange({
                                      ...currentMatches,
                                      [pair.id]: e.target.value
                                    });
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p>No images to match</p>
                  )}
                </div>
              )}
              
              {/* Add more question types as needed */}
            </div>
          )}
        </div>

        <div className="rbt-quiz-btn-wrapper mt--30">
          <button
            className="rbt-btn bg-primary-opacity btn-sm"
            id="prev-btn"
            type="button"
            disabled={currentQuestionIndex === 0}
            onClick={handlePrevious}
          >
            Previous
          </button>
          
          {currentQuestionIndex < totalQuestions - 1 ? (
            <button
              className="rbt-btn bg-primary-opacity btn-sm ms-2"
              id="next-btn"
              type="button"
              onClick={handleNext}
            >
              Next
            </button>
          ) : (
            <button
              className="rbt-btn btn-gradient btn-sm ms-2"
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          )}
        </div>
      </form>
    </>
  );
};

export default LessonQuiz;
