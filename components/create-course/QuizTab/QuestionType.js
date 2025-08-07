import React from 'react';

const QuestionType = ({ title, type, points, question, onEdit, onDelete }) => {
  return (
    <>
      <div
        className="d-flex justify-content-between rbt-course-wrape mb-4"
        style={{ cursor: 'auto' }}
      >
        <div className="inner d-flex align-items-center gap-3">
          <h6 className="rbt-title mb-0">{title}</h6>
          <span className="badge bg-primary">{type}</span>
          <span className="text-muted">{points} points</span>
        </div>
        <div className="text-muted small mt-1" style={{ maxWidth: '400px' }}>
          {question && question.length > 50
            ? question.substring(0, 50) + '...'
            : question}
        </div>
        <div className="inner d-flex align-items-center gap-2">
          <button
            type="button"
            className="badge"
            style={{
              backgroundColor: '#2f57ef',
              color: 'white',
              border: 'none',
              padding: '6px 16px',
              fontSize: '14px',
              fontWeight: '500',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'opacity 0.2s',
            }}
            onMouseOver={(e) => (e.target.style.opacity = '0.9')}
            onMouseOut={(e) => (e.target.style.opacity = '1')}
            onClick={onEdit}
          >
            Edit
          </button>
          <button
            type="button"
            className="badge"
            style={{
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '6px 16px',
              fontSize: '14px',
              fontWeight: '500',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'opacity 0.2s',
            }}
            onMouseOver={(e) => (e.target.style.opacity = '0.9')}
            onMouseOut={(e) => (e.target.style.opacity = '1')}
            onClick={onDelete}
          >
            Delete
          </button>
        </div>
      </div>
    </>
  );
};

export default QuestionType;
