'use client';

import React from 'react';

interface UserBulkActionsProps {
  selectedCount: number;
  onBulkActivate: () => void;
  onBulkDeactivate: () => void;
  onBulkDelete: () => void;
  onBulkEmail: () => void;
  onClearSelection: () => void;
}

const UserBulkActions: React.FC<UserBulkActionsProps> = ({
  selectedCount,
  onBulkActivate,
  onBulkDeactivate,
  onBulkDelete,
  onBulkEmail,
  onClearSelection,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="bulk-actions-bar">
      <div className="rbt-dashboard-content bg-color-white rbt-shadow-box mb-3">
        <div className="content p-3">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <span className="fw-medium me-3">
                {selectedCount} user{selectedCount !== 1 ? 's' : ''} selected
              </span>
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={onClearSelection}
              >
                Clear Selection
              </button>
            </div>

            <div className="d-flex gap-2">
              <button
                className="btn btn-sm btn-outline-success"
                onClick={onBulkActivate}
                title="Activate selected users"
              >
                <i className="feather-user-check me-1"></i>
                Activate
              </button>
              <button
                className="btn btn-sm btn-outline-warning"
                onClick={onBulkDeactivate}
                title="Deactivate selected users"
              >
                <i className="feather-user-x me-1"></i>
                Deactivate
              </button>
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={onBulkEmail}
                title="Send email to selected users"
              >
                <i className="feather-mail me-1"></i>
                Email
              </button>
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={onBulkDelete}
                title="Delete selected users"
              >
                <i className="feather-trash-2 me-1"></i>
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserBulkActions;
