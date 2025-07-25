"use client";

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const LessonItem = ({ lesson, onEdit, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: lesson.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr ref={setNodeRef} style={style}>
      <td>
        <button
          className="btn btn-sm"
          {...attributes}
          {...listeners}
          style={{ cursor: 'grab' }}
        >
          <i className="feather-menu"></i>
        </button>
      </td>
      <td>
        <h6 className="mb-0">{lesson.title}</h6>
        {lesson.description && (
          <small className="text-muted">{lesson.description}</small>
        )}
      </td>
      <td>
        {lesson.duration_minutes ? `${lesson.duration_minutes} min` : '-'}
      </td>
      <td>
        <div className="rbt-button-group justify-content-end">
          <button
            className="rbt-btn btn-xs bg-primary-opacity radius-round"
            title="Edit"
            onClick={() => onEdit(lesson)}
          >
            <i className="feather-edit"></i>
          </button>
          <button
            className="rbt-btn btn-xs bg-danger-opacity radius-round ms-2"
            title="Delete"
            onClick={() => onDelete(lesson.id)}
          >
            <i className="feather-trash-2"></i>
          </button>
        </div>
      </td>
    </tr>
  );
};

export default LessonItem;