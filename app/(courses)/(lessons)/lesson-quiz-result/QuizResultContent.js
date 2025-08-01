"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import LessonSidebar from "@/components/Lesson/LessonSidebar";
import LessonTop from "@/components/Lesson/LessonTop";
import { supabase } from "@/app/lib/supabase/client";

const QuizResultContent = () => {
  const searchParams = useSearchParams();
  const attemptId = searchParams.get("attemptId");
  const [sidebar, setSidebar] = useState(true);
  const [loading, setLoading] = useState(true);
  const [attemptData, setAttemptData] = useState(null);
  const [quizData, setQuizData] = useState(null);

  useEffect(() => {
    if (attemptId) {
      loadQuizResult();
    }
  }, [attemptId]);

  const loadQuizResult = async () => {
    try {
      setLoading(true);
      
      // Get attempt data
      const { data: attempt, error: attemptError } = await supabase
        .from('quiz_attempts')
        .select(`
          *,
          lessons (
            title,
            content_data,
            course_id
          )
        `)
        .eq('id', attemptId)
        .single();

      if (attemptError) throw attemptError;

      setAttemptData(attempt);
      setQuizData(attempt.lessons.content_data);
    } catch (error) {
      console.error('Error loading quiz result:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  if (loading) {
    return (
      <div className="rbt-lesson-area bg-color-white">
        <div className="rbt-lesson-content-wrapper">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!attemptData) {
    return (
      <div className="rbt-lesson-area bg-color-white">
        <div className="rbt-lesson-content-wrapper">
          <div className="alert alert-warning m-5" role="alert">
            No quiz result found.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rbt-lesson-area bg-color-white">
      <div className="rbt-lesson-content-wrapper">
        <div className={`rbt-lesson-leftsidebar ${sidebar ? "" : "sibebar-none"}`}>
          <LessonSidebar />
        </div>

        <div className="rbt-lesson-rightsidebar overflow-hidden">
          <LessonTop
            sidebar={sidebar}
            setSidebar={() => setSidebar(!sidebar)}
          />

          <div className="inner">
            <div className="content">
              <div className="section-title">
                <h4>{attemptData.lessons.title} - Quiz Result</h4>
              </div>

              {/* Result Summary */}
              <div className="rbt-dashboard-table table-responsive mobile-table-750 mt--30">
                <div className="row g-5 mb-5">
                  <div className="col-lg-3 col-md-6">
                    <div className="rbt-card variation-03 rbt-hover">
                      <div className="rbt-card-body">
                        <h4 className="rbt-card-title">Score</h4>
                        <div className="rbt-card-text">
                          <span className="h3">{attemptData.score || 0}</span>
                          <span className="text-muted"> / {attemptData.total_points}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-3 col-md-6">
                    <div className="rbt-card variation-03 rbt-hover">
                      <div className="rbt-card-body">
                        <h4 className="rbt-card-title">Percentage</h4>
                        <div className="rbt-card-text">
                          <span className="h3">{Math.round(attemptData.percentage || 0)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-3 col-md-6">
                    <div className="rbt-card variation-03 rbt-hover">
                      <div className="rbt-card-body">
                        <h4 className="rbt-card-title">Time Taken</h4>
                        <div className="rbt-card-text">
                          <span className="h3">{formatTime(attemptData.time_spent_seconds || 0)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-3 col-md-6">
                    <div className="rbt-card variation-03 rbt-hover">
                      <div className="rbt-card-body">
                        <h4 className="rbt-card-title">Result</h4>
                        <div className="rbt-card-text">
                          <span className={`rbt-badge-5 ${
                            attemptData.passed
                              ? "bg-color-success-opacity color-success"
                              : "bg-color-danger-opacity color-danger"
                          }`}>
                            {attemptData.passed ? "PASSED" : "FAILED"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Question Details */}
                {quizData?.settings?.showAnswersAfterSubmit && (
                  <div className="mt-5">
                    <h5 className="mb-4">Question Details</h5>
                    <table className="rbt-table table table-borderless">
                      <thead>
                        <tr>
                          <th>No</th>
                          <th>Question</th>
                          <th>Your Answer</th>
                          <th>Correct Answer</th>
                          <th>Points</th>
                          <th>Result</th>
                        </tr>
                      </thead>
                      <tbody>
                        {quizData.questions.map((question, index) => {
                          const userAnswer = attemptData.answers[question.id];
                          const isCorrect = userAnswer?.isCorrect;
                          
                          return (
                            <tr key={question.id}>
                              <td>{index + 1}</td>
                              <td>
                                <p className="b3">{question.question}</p>
                                <span className="text-muted">{question.type}</span>
                              </td>
                              <td>
                                <p className="b3">
                                  {typeof userAnswer?.answer === 'boolean' 
                                    ? (userAnswer.answer ? 'True' : 'False')
                                    : userAnswer?.answer || 'Not answered'}
                                </p>
                              </td>
                              <td>
                                <p className="b3">
                                  {typeof question.correctAnswer === 'boolean' 
                                    ? (question.correctAnswer ? 'True' : 'False')
                                    : question.correctAnswer || 'N/A'}
                                </p>
                              </td>
                              <td>{userAnswer?.points || 0}/{question.points}</td>
                              <td>
                                <span className={`rbt-badge-5 ${
                                  isCorrect
                                    ? "bg-color-success-opacity color-success"
                                    : "bg-color-danger-opacity color-danger"
                                }`}>
                                  {isCorrect ? "Correct" : "Incorrect"}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="mt-5">
                  <Link href={`/lesson/${attemptData.lesson_id}`} className="rbt-btn btn-gradient hover-icon-reverse">
                    <span className="icon-reverse-wrapper">
                      <span className="btn-text">Retake Quiz</span>
                      <span className="btn-icon">
                        <i className="feather-arrow-right"></i>
                      </span>
                      <span className="btn-icon">
                        <i className="feather-arrow-right"></i>
                      </span>
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizResultContent;