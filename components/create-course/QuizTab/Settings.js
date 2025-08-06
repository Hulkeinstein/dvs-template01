"use client";

import React, { useState } from "react";

const Settings = ({ quizData, setQuizData }) => {
  const [maxQuestions, setMaxQuestions] = useState(quizData?.settings?.maxQuestions || 0);
  const [passingGrade, setPassingGrade] = useState(quizData?.settings?.passingScore || 70);
  const [sortAns, setSortAns] = useState(quizData?.settings?.shortAnswerLimit || 200);
  const [answer, setAnswer] = useState(quizData?.settings?.essayAnswerLimit || 500);
  const [isAdvanceOpen, setIsAdvanceOpen] = useState(false);

  const handleInputChange = (setter, field) => (event) => {
    const value = Math.max(0, Number(event.target.value));
    setter(value);
    
    if (field && setQuizData) {
      setQuizData(prev => ({
        ...prev,
        settings: {
          ...prev.settings,
          [field]: value
        }
      }));
    }
  };

  const handleFeedbackModeChange = (mode) => {
    if (setQuizData) {
      setQuizData(prev => ({
        ...prev,
        settings: {
          ...prev.settings,
          feedbackMode: mode
        }
      }));
    }
  };
  return (
    <>
      <div className="tabs-3">
        <div className="course-field">
          <label htmlFor="modal-field-3">Quiz Feedback Mode</label>
          <small>
            (Pick the quiz system&quot;s behaviour on choice based questions.)
          </small>
          <div className="d-flex flex-column gap-4 mt--10">
            <div className="rbt-form-check col-12 rbt-border-2 rounded-2 ps-4 py-3">
              <input
                className="form-check-input ps-5"
                type="radio"
                name="rbt-radio"
                id="rbt-radio1"
                checked={quizData?.settings?.feedbackMode === 'default'}
                onChange={() => handleFeedbackModeChange('default')}
              />
              <label className="form-check-label h-auto" htmlFor="rbt-radio1">
                <div className="">
                  <span>Default</span>
                </div>
                <div className="">
                  <span>Answers shown after quiz is finished </span>
                </div>
              </label>
            </div>
            <div className="rbt-form-check col-12 rbt-border-2 rounded-2 ps-4 py-3">
              <input
                className="form-check-input ps-5"
                type="radio"
                name="rbt-radio"
                id="rbt-radio2"
                checked={quizData?.settings?.feedbackMode === 'reveal'}
                onChange={() => handleFeedbackModeChange('reveal')}
              />
              <label className="form-check-label h-auto" htmlFor="rbt-radio2">
                <div className="">
                  <span>Reveal Mode</span>
                </div>
                <div className="">
                  <span>Show result after the attempt. </span>
                </div>
              </label>
            </div>
            <div className="rbt-form-check col-12 rbt-border-2 rounded-2 ps-4 py-3">
              <input
                className="form-check-input ps-5"
                type="radio"
                name="rbt-radio"
                id="rbt-radio3"
                checked={quizData?.settings?.feedbackMode === 'retry'}
                onChange={() => handleFeedbackModeChange('retry')}
              />
              <label className="form-check-label h-auto" htmlFor="rbt-radio3">
                <div className="">
                  <span>Retry Mode</span>
                </div>
                <div className="">
                  <span>
                    Reattempt quiz any number of times. Define Attempts Allowed
                    below.
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>
        {quizData?.settings?.feedbackMode === 'retry' && (
          <div className="course-field mt--20">
            <div className="col-xl-8">
              <label htmlFor="modal-field-attempts">Attempts Allowed</label>
              <input
                className="mb-0"
                id="modal-field-attempts"
                type="number"
                min="1"
                value={quizData?.settings?.maxAttempts || 3}
                onChange={(e) => setQuizData && setQuizData(prev => ({
                  ...prev,
                  settings: {
                    ...prev.settings,
                    maxAttempts: parseInt(e.target.value) || 1
                  }
                }))}
              />
              <small>
                <i className="feather-info"></i> Number of times students can retake this quiz.
              </small>
            </div>
          </div>
        )}
        <div className="course-field mt--20">
          <div className="col-xl-8">
            <label htmlFor="modal-field-4">Passing Grade (%)</label>
            <input
              className="mb-0"
              id="modal-field-4"
              type="number"
              value={passingGrade}
              onChange={handleInputChange(setPassingGrade, 'passingScore')}
            />
            <small>
              <i className="feather-info"></i> Set the minimum percentage required to pass this quiz.
            </small>
          </div>
        </div>
        <div className="course-field mt--20">
          <div className="col-xl-8">
            <label htmlFor="modal-field-5">
              Max Question Allowed to Answer
            </label>
            <input
              className="mb-0"
              id="modal-field-5"
              type="number"
              value={maxQuestions}
              onChange={handleInputChange(setMaxQuestions, 'maxQuestions')}
            />
            <small>
              <i className="feather-info"></i> This amount of question will be
              available for students to answer, and question will comes randomly
              from all available questions belongs with a quiz, if this amount
              is greater than available question, then all questions will be
              available for a student to answer.
            </small>
          </div>
        </div>
        <div className="course-field rbt-accordion-style rbt-accordion-01 rbt-accordion-06 accordion mt--30">
          <div className="accordion-item card">
            <h2 className="accordion-header card-header" id="accThree3">
              <button
                className={`accordion-button ${isAdvanceOpen ? '' : 'collapsed'}`}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setIsAdvanceOpen(!isAdvanceOpen);
                }}
                aria-expanded={isAdvanceOpen}
                aria-controls="accCollapseThree3"
              >
                <i className="feather-settings me-3"></i>
                Advance Settings
              </button>
            </h2>
            <div
              id="accCollapseThree3"
              className={`accordion-collapse collapse ${isAdvanceOpen ? 'show' : ''}`}
              aria-labelledby="accThree3"
              style={{
                transition: 'height 0.35s ease'
              }}
            >
              <div className="accordion-body card-body">
                <div className="form-check form-switch mb--5">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    id="autoStart"
                    checked={quizData?.settings?.randomizeQuestions || false}
                    onChange={(e) => setQuizData && setQuizData(prev => ({
                      ...prev,
                      settings: {
                        ...prev.settings,
                        randomizeQuestions: e.target.checked
                      }
                    }))}
                  />
                  <label className="form-check-label" htmlFor="autoStart">
                    Randomize Questions
                  </label>
                </div>
                <small>
                  <i className="feather-info"></i> If you enable this option,
                  the questions will be presented in random order.
                </small>
                <div className="course-field d-sm-flex gap-4 mt--20">
                  <div className="col-sm-6 col-xl-3 mb-4 mb-sm-0">
                    <label className="form-check-label" htmlFor="option-1">
                      Question Layout
                    </label>
                    <select 
                      className="w-100 rbt-select-dark"
                      value={quizData?.settings?.questionLayout || 'random'}
                      onChange={(e) => setQuizData && setQuizData(prev => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          questionLayout: e.target.value
                        }
                      }))}
                    >
                      <option value="random">Random</option>
                      <option value="sorting">Sorting </option>
                      <option value="asc">Ascending </option>
                      <option value="desc">Descending </option>
                    </select>
                  </div>
                  <div className="col-sm-6 col-xl-3">
                    <label className="form-check-label" htmlFor="option-1">
                      Questions Order
                    </label>
                    <select 
                      className="w-100 rbt-select-dark"
                      value={quizData?.settings?.questionsOrder || 'single_question'}
                      onChange={(e) => setQuizData && setQuizData(prev => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          questionsOrder: e.target.value
                        }
                      }))}
                    >
                      <option value="single_question">Single Question</option>
                      <option value="question_pagination">
                        Question Pagination
                      </option>
                      <option value="question_below_each_other">
                        Question below each other
                      </option>
                    </select>
                  </div>
                </div>
                <div className="course-field mt--20">
                  <div className="form-check form-switch mb--5">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      id="hideNumber"
                      checked={quizData?.settings?.hideQuestionNumber || false}
                      onChange={(e) => setQuizData && setQuizData(prev => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          hideQuestionNumber: e.target.checked
                        }
                      }))}
                    />
                    <label className="form-check-label" htmlFor="hideNumber">
                      Hide question number
                    </label>
                  </div>
                  <small>
                    <i className="feather-info"></i>
                    Show/hide question number during attempt.
                  </small>
                </div>
                <div className="course-field d-lg-flex flex-wrap justify-content-between gap-5 mt--20">
                  <div className="col-lg-7 mb-4 mb-lg-0">
                    <label htmlFor="modal-field-sort-answer">
                      Short answer characters limit
                    </label>
                    <input
                      className="mb-0"
                      id="modal-field-sort-answer"
                      type="number"
                      value={sortAns}
                      onChange={handleInputChange(setSortAns, 'shortAnswerLimit')}
                    />
                    <small>
                      <i className="feather-info pe-1"></i>
                      Student will place answer in short answer question type
                      within this characters limit.
                    </small>
                  </div>

                  <div className="col-lg-7">
                    <label htmlFor="modal-field-3">
                      Open-Ended/Essay questions answer character limit
                    </label>
                    <input
                      className="mb-0"
                      id="modal-field-7"
                      type="number"
                      value={answer}
                      onChange={handleInputChange(setAnswer, 'essayAnswerLimit')}
                    />
                    <small>
                      <i className="feather-info pe-1"></i>
                      Students will place the answer in the Open-Ended/Essay
                      question type within this character limit.
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings;
