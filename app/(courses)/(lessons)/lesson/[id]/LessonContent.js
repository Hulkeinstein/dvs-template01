'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import LessonSidebar from '@/components/Lesson/LessonSidebar';
import LessonPagination from '@/components/Lesson/LessonPagination';
import LessonTop from '@/components/Lesson/LessonTop';
import LessonVideo from '@/components/Lesson/LessonVideo';
import LessonQuiz from '@/components/Lesson/LessonQuiz';
import {
  getQuizByLessonId,
  startQuizAttempt,
} from '@/app/lib/actions/quizActions';

const LessonContent = ({ lessonId }) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [sidebar, setSidebar] = useState(true);
  const [loading, setLoading] = useState(true);
  const [lesson, setLesson] = useState(null);
  const [quizData, setQuizData] = useState(null);
  const [quizAttempt, setQuizAttempt] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadLessonData();
  }, [lessonId]);

  const loadLessonData = async () => {
    try {
      setLoading(true);

      // For now, we'll check if this is a quiz lesson
      const quizResult = await getQuizByLessonId(lessonId);

      if (quizResult.success && quizResult.data) {
        // This is a quiz lesson
        setLesson(quizResult.data);
        setQuizData(quizResult.data.content_data);

        // Start a quiz attempt if user is logged in
        if (session?.user?.id) {
          const attemptResult = await startQuizAttempt(
            lessonId,
            session.user.id
          );
          if (attemptResult.success) {
            setQuizAttempt(attemptResult.data);
          }
        }
      } else {
        // This is a regular video lesson
        // TODO: Load video lesson data
        setLesson({ content_type: 'video' });
      }
    } catch (err) {
      console.error('Error loading lesson:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
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

  if (error) {
    return (
      <div className="rbt-lesson-area bg-color-white">
        <div className="rbt-lesson-content-wrapper">
          <div className="alert alert-danger m-5" role="alert">
            Error loading lesson: {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rbt-lesson-area bg-color-white">
      <div className="rbt-lesson-content-wrapper">
        <div
          className={`rbt-lesson-leftsidebar ${sidebar ? '' : 'sibebar-none'}`}
        >
          <LessonSidebar />
        </div>

        <div className="rbt-lesson-rightsidebar overflow-hidden">
          <LessonTop
            sidebar={sidebar}
            setSidebar={() => setSidebar(!sidebar)}
          />

          <div className="inner">
            {lesson?.content_type === 'quiz' ? (
              <div className="content">
                <h4 className="mb-4">{lesson.title}</h4>
                {lesson.description && (
                  <p className="mb-4">{lesson.description}</p>
                )}
                {quizData && quizAttempt && (
                  <LessonQuiz
                    quizData={quizData}
                    attemptId={quizAttempt.id}
                    lessonId={lessonId}
                  />
                )}
              </div>
            ) : (
              <LessonVideo />
            )}
          </div>

          <LessonPagination />
        </div>
      </div>
    </div>
  );
};

export default LessonContent;
