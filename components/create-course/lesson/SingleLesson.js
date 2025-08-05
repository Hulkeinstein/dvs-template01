"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const SingleLesson = (props) => {
  const { onDelete, onEdit, onUpload } = props;
  const { id, courseTitle, title, content_type, _pending } = props.course;
  const displayTitle = courseTitle || title || 'Untitled Lesson';
  const isQuiz = content_type === 'quiz';
  const isPending = _pending === true;
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <>
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
      <div
        className="d-flex justify-content-between rbt-course-wrape mb-4"
        ref={setNodeRef}
        style={style}
        {...attributes}
      >
        <div className="col-9 inner d-flex align-items-center gap-2">
          <i className="feather-menu cursor-scroll" {...listeners}></i>
          {isQuiz ? (
            <>
              <i className="feather-help-circle text-primary" title="Quiz"></i>
              <h6 className="rbt-title mb-0">{displayTitle}</h6>
              <span className="badge bg-primary ms-2">Quiz</span>
              {isPending && (
                <span 
                  className="ms-2" 
                  style={{ 
                    fontSize: '12px', 
                    color: '#6c757d',
                    animation: 'pulse 1.5s ease-in-out infinite' 
                  }}
                  title="저장 중..."
                >
                  <i className="feather-loader" style={{ animation: 'spin 1s linear infinite' }}></i>
                </span>
              )}
            </>
          ) : (
            <>
              <i className="feather-play-circle" title="Video Lesson"></i>
              <h6 className="rbt-title mb-0">{displayTitle}</h6>
              {isPending && (
                <span 
                  className="ms-2" 
                  style={{ 
                    fontSize: '12px', 
                    color: '#6c757d',
                    animation: 'pulse 1.5s ease-in-out infinite' 
                  }}
                  title="저장 중..."
                >
                  <i className="feather-loader" style={{ animation: 'spin 1s linear infinite' }}></i>
                </span>
              )}
            </>
          )}
        </div>
        <div className="col-3 inner">
          <ul className="rbt-list-style-1 rbt-course-list d-flex gap-1 justify-content-end">
            <li>
              <i 
                className="feather-trash"
                onClick={() => {
                  if (onDelete && confirm('이 레슨을 삭제하시겠습니까?')) {
                    onDelete(id);
                  }
                }}
              ></i>
            </li>
            <li>
              <i
                className="feather-edit"
                data-bs-toggle="modal"
                data-bs-target={isQuiz ? `#QuizModal${props.topicId}` : `#LessonModal${props.topicId}`}
                onClick={() => {
                  if (onEdit) {
                    console.log('[SingleLesson.js] Edit clicked, passing course:', {
                      id: props.course.id,
                      title: props.course.title || props.course.courseTitle,
                      isQuiz: isQuiz,
                      content_type: props.course.content_type,
                      hasThumbnail: !!props.course.thumbnail,
                      hasAttachments: !!props.course.attachments,
                      fullCourse: props.course
                    });
                    onEdit(props.course);
                  }
                }}
              ></i>
            </li>
            <li>
              <i 
                className="feather-upload"
                onClick={() => {
                  if (onUpload) {
                    onUpload(id);
                  }
                }}
              ></i>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default React.memo(SingleLesson);