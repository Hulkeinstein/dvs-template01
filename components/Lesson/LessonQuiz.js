"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { submitQuizAttempt } from "@/app/lib/actions/quizActions";

const LessonQuiz = ({ quizData, attemptId, lessonId }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [startTime] = useState(new Date());
  const [submitting, setSubmitting] = useState(false);
  
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
              
              {currentQuestion.type === 'Fill in the Blanks' && (
                <div className="mt-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter your answer"
                    value={answers[currentQuestion.id] || ''}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                  />
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
