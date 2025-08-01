import React from "react";

const QuestionType = ({ title, type, points, question, onEdit, onDelete }) => {
  return (
    <>
      <div
        className="d-flex justify-content-between rbt-course-wrape mb-4"
        style={{ cursor: "auto" }}
      >
        <div className="inner d-flex align-items-center gap-3">
          <h6 className="rbt-title mb-0">{title}</h6>
          <span className="badge bg-primary">{type}</span>
          <span className="text-muted">{points} points</span>
        </div>
        <div className="text-muted small mt-1" style={{ maxWidth: '400px' }}>
          {question && question.length > 50 ? question.substring(0, 50) + '...' : question}
        </div>
        <div className="inner">
          <ul className="rbt-list-style-1 rbt-course-list d-flex gap-3 align-items-center">
            <li>
              <button
                type="button"
                className="btn btn-sm btn-outline-primary me-2"
                onClick={onEdit}
              >
                <i className="feather-edit-2"></i> Edit
              </button>
            </li>
            <li>
              <button
                type="button"
                className="btn btn-sm btn-outline-danger"
                onClick={onDelete}
              >
                <i className="feather-trash"></i> Delete
              </button>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default QuestionType;
