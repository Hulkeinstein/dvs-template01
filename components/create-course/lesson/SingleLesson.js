'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SingleLesson = (props) => {
  const { onDelete, onEdit, onUpload } = props;
  const { id, courseTitle, title, content_type } = props.course;
  const displayTitle = courseTitle || title || 'Untitled Lesson';
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Get icon based on content type
  const getContentIcon = () => {
    switch (content_type) {
      case 'quiz':
        return 'feather-help-circle';
      case 'assignment':
        return 'feather-file-text';
      case 'video':
      case 'lesson':
      default:
        return 'feather-play-circle';
    }
  };

  // Get badge based on content type
  const getContentBadge = () => {
    switch (content_type) {
      case 'quiz':
        return <span className="badge bg-primary ms-2">Quiz</span>;
      case 'assignment':
        return <span className="badge bg-warning ms-2">Assignment</span>;
      case 'lesson':
      case 'video':
        return <span className="badge bg-success ms-2">Lesson</span>;
      default:
        return <span className="badge bg-success ms-2">Lesson</span>;
    }
  };

  // Get modal target based on content type
  const getModalTarget = () => {
    switch (content_type) {
      case 'quiz':
        return `#QuizModal${props.topicId}`;
      case 'assignment':
        return `#AssignmentModal${props.topicId}`;
      default:
        return `#LessonModal${props.topicId}`;
    }
  };

  return (
    <>
      <div
        className="d-flex justify-content-between rbt-course-wrape mb-4"
        ref={setNodeRef}
        style={style}
        {...attributes}
      >
        <div className="col-9 inner d-flex align-items-center gap-2">
          <i className="feather-menu cursor-scroll" {...listeners}></i>
          <i className={`${getContentIcon()} text-muted`}></i>
          <h6 className="rbt-title mb-0">
            {displayTitle}
            {getContentBadge()}
          </h6>
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
                data-bs-target={getModalTarget()}
                onClick={() => {
                  if (onEdit) {
                    // console.log('[SingleLesson.js] Edit clicked, passing course:', {
                    //   id: props.course.id,
                    //   title: props.course.title || props.course.courseTitle,
                    //   content_type: props.course.content_type,
                    //   hasThumbnail: !!props.course.thumbnail,
                    //   hasAttachments: !!props.course.attachments,
                    //   fullCourse: props.course,
                    // });
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

export default SingleLesson;
