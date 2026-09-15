'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import LessonSidebar from '@/components/Lesson/LessonSidebar';
import LessonPagination from '@/components/Lesson/LessonPagination';
import LessonTop from '@/components/Lesson/LessonTop';
import LessonVideo from '@/components/Lesson/LessonVideo';
import LessonQuiz from '@/components/Lesson/LessonQuiz';
import CreatorInfo from '@/components/Lesson/CreatorInfo';
import LessonCompleteButton from '@/components/Lesson/LessonCompleteButton';
import SummaryDisplay from '@/components/Lesson/SummaryDisplay';
import {
  getQuizByLessonId,
  startQuizAttempt,
} from '@/app/lib/actions/quizActions';
import { getLessonById } from '@/app/lib/actions/lessonActions';
import { getLessonProgress } from '@/app/lib/actions/progressActions';

const LessonContent = ({ lessonId }) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [sidebar, setSidebar] = useState(true);
  const [loading, setLoading] = useState(true);
  const [lesson, setLesson] = useState(null);
  const [quizData, setQuizData] = useState(null);
  const [quizAttempt, setQuizAttempt] = useState(null);
  const [error, setError] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [seekTime, setSeekTime] = useState(null);

  const loadLessonData = useCallback(async () => {
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
        const videoResult = await getLessonById(lessonId);

        if (videoResult.success && videoResult.lesson) {
          setLesson(videoResult.lesson);
        } else {
          console.error('Failed to load video lesson');
          setError('레슨 정보를 불러올 수 없습니다.');
          setLesson({ content_type: 'video' }); // Fallback or handle error
        }
      }

      // Fetch progress if user logged in
      if (session?.user?.id) {
        const progressResult = await getLessonProgress(
          lessonId,
          session.user.id
        );
        if (progressResult.success) {
          setIsCompleted(progressResult.isCompleted);
        }
      }
    } catch (err) {
      console.error('Error loading lesson:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [lessonId, session?.user?.id]);

  useEffect(() => {
    loadLessonData();
  }, [lessonId, loadLessonData]);

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
          <LessonTop sidebar={sidebar} setSidebar={() => setSidebar(!sidebar)}>
            {session?.user?.id && lesson && (
              <LessonCompleteButton
                lessonId={lessonId}
                courseId={lesson.course_id}
                userId={session.user.id}
                isCompleted={isCompleted}
                onToggle={setIsCompleted}
              />
            )}
          </LessonTop>

          <div className="inner">
            {lesson?.content_type === 'quiz' ? (
              <LessonQuiz
                quizData={quizData}
                quizAttempt={quizAttempt}
                lessonId={lessonId}
                courseId={lesson?.course_id}
                onComplete={(score) => {
                  console.log('Quiz completed with score:', score);
                  loadLessonData();
                }}
              />
            ) : (
              <>
                <LessonVideo
                  lesson={lesson}
                  seekTime={seekTime}
                  onSeekComplete={() => setSeekTime(null)}
                />

                {lesson?.video_source === 'youtube' &&
                  lesson?.content_data?.youtube && (
                    <CreatorInfo
                      channelName={lesson.content_data.youtube.channel_name}
                      channelUrl={lesson.content_data.youtube.channel_url}
                      videoUrl={lesson.content_data.youtube.canonical_url}
                      originalTitle={lesson.content_data.youtube.original_title}
                    />
                  )}

                {lesson?.video_source === 'youtube' &&
                  lesson?.content_data?.summary && (
                    <SummaryDisplay
                      data={lesson.content_data.summary}
                      isLoading={false}
                      onTimestampClick={(seconds) => setSeekTime(seconds)}
                    />
                  )}
              </>
            )}
          </div>

          <LessonPagination />
        </div>
      </div>
    </div>
  );
};

export default LessonContent;
