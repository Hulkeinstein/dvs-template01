'use client';

import { useEffect, useRef } from 'react';

const LessonVideo = ({ lesson }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    // Video player initialization if needed
  }, [lesson]);

  if (!lesson) {
    return (
      <div className="lesson-video-wrap">
        <div className="text-center p-5">
          <p>Loading lesson content...</p>
        </div>
      </div>
    );
  }

  // Handle different content types
  if (lesson.content_type === 'video') {
    const videoUrl = lesson.content_data?.url || lesson.video_url;

    if (!videoUrl) {
      return (
        <div className="lesson-video-wrap">
          <div className="text-center p-5">
            <p>No video content available for this lesson.</p>
          </div>
        </div>
      );
    }

    // Check if it's a YouTube or Vimeo URL
    const isYouTube =
      videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');
    const isVimeo = videoUrl.includes('vimeo.com');

    if (isYouTube) {
      // Extract YouTube video ID
      const videoId = videoUrl.includes('youtube.com')
        ? videoUrl.split('v=')[1]?.split('&')[0]
        : videoUrl.split('/').pop();

      return (
        <div className="lesson-video-wrap">
          <div className="video-responsive">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              title={lesson.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-100"
              style={{ minHeight: '500px' }}
            />
          </div>
        </div>
      );
    }

    if (isVimeo) {
      // Extract Vimeo video ID
      const videoId = videoUrl.split('/').pop();

      return (
        <div className="lesson-video-wrap">
          <div className="video-responsive">
            <iframe
              src={`https://player.vimeo.com/video/${videoId}`}
              title={lesson.title}
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              className="w-100"
              style={{ minHeight: '500px' }}
            />
          </div>
        </div>
      );
    }

    // Default HTML5 video player
    return (
      <div className="lesson-video-wrap">
        <video
          ref={videoRef}
          controls
          className="w-100"
          style={{ maxHeight: '600px' }}
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  // Handle text content
  if (lesson.content_type === 'text' || lesson.content_type === 'lesson') {
    const content =
      lesson.content_data?.html ||
      lesson.content_data?.text ||
      lesson.description;

    return (
      <div className="lesson-content-wrap">
        <div className="lesson-text-content p-4">
          {content ? (
            <div dangerouslySetInnerHTML={{ __html: content }} />
          ) : (
            <p>
              {lesson.description || 'No content available for this lesson.'}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Handle assignment content
  if (lesson.content_type === 'assignment') {
    return (
      <div className="lesson-content-wrap">
        <div className="assignment-content p-4">
          <h3>{lesson.title}</h3>
          <p>{lesson.description}</p>
          {lesson.content_data?.instructions && (
            <div className="instructions mt-3">
              <h5>Instructions:</h5>
              <div
                dangerouslySetInnerHTML={{
                  __html: lesson.content_data.instructions,
                }}
              />
            </div>
          )}
          {lesson.content_data?.due_date && (
            <div className="due-date mt-3">
              <strong>Due Date:</strong>{' '}
              {new Date(lesson.content_data.due_date).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default fallback
  return (
    <div className="lesson-content-wrap">
      <div className="text-center p-5">
        <p>Content type not supported: {lesson.content_type}</p>
      </div>
    </div>
  );
};

export default LessonVideo;
