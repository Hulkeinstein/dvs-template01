'use client';

import React from 'react';
import { User } from './types';

interface UserActionsProps {
  user: User;
  onView: (user: User) => void;
  onEdit: (user: User) => void;
  onToggleStatus: (user: User) => void;
  onResetPassword: (user: User) => void;
  onDelete: (user: User) => void;
  onImpersonate?: (user: User) => void;
}

const UserActions: React.FC<UserActionsProps> = ({
  user,
  onView,
  onEdit,
  onToggleStatus,
  onResetPassword,
  onDelete,
  onImpersonate,
}) => {
  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    action();
  };

  const getStatusAction = () => {
    switch (user.status) {
      case 'active':
        return {
          label: 'Deactivate',
          icon: 'feather-user-x',
          color: 'text-warning',
        };
      case 'inactive':
        return {
          label: 'Activate',
          icon: 'feather-user-check',
          color: 'text-success',
        };
      case 'suspended':
        return {
          label: 'Unsuspend',
          icon: 'feather-user-check',
          color: 'text-success',
        };
      case 'pending':
        return {
          label: 'Approve',
          icon: 'feather-check-circle',
          color: 'text-success',
        };
      default:
        return {
          label: 'Toggle Status',
          icon: 'feather-toggle-left',
          color: '',
        };
    }
  };

  const statusAction = getStatusAction();

  return (
    <div className="dropdown">
      <button
        className="btn btn-sm btn-icon btn-light"
        type="button"
        data-bs-toggle="dropdown"
        aria-expanded="false"
        onClick={(e) => e.stopPropagation()}
      >
        <i className="feather-more-vertical"></i>
      </button>
      <ul className="dropdown-menu dropdown-menu-end">
        <li>
          <a
            className="dropdown-item"
            href="#"
            onClick={(e) => handleAction(e, () => onView(user))}
          >
            <i className="feather-eye me-2"></i>
            View Details
          </a>
        </li>
        <li>
          <a
            className="dropdown-item"
            href="#"
            onClick={(e) => handleAction(e, () => onEdit(user))}
          >
            <i className="feather-edit me-2"></i>
            Edit User
          </a>
        </li>
        {user.role !== 'admin' && onImpersonate && (
          <li>
            <a
              className="dropdown-item"
              href="#"
              onClick={(e) => handleAction(e, () => onImpersonate(user))}
            >
              <i className="feather-log-in me-2"></i>
              Impersonate
            </a>
          </li>
        )}
        <li>
          <hr className="dropdown-divider" />
        </li>
        <li>
          <a
            className={`dropdown-item ${statusAction.color}`}
            href="#"
            onClick={(e) => handleAction(e, () => onToggleStatus(user))}
          >
            <i className={`${statusAction.icon} me-2`}></i>
            {statusAction.label}
          </a>
        </li>
        <li>
          <a
            className="dropdown-item"
            href="#"
            onClick={(e) => handleAction(e, () => onResetPassword(user))}
          >
            <i className="feather-key me-2"></i>
            Reset Password
          </a>
        </li>
        <li>
          <hr className="dropdown-divider" />
        </li>
        <li>
          <a
            className="dropdown-item text-danger"
            href="#"
            onClick={(e) => handleAction(e, () => onDelete(user))}
          >
            <i className="feather-trash-2 me-2"></i>
            Delete User
          </a>
        </li>
      </ul>
    </div>
  );
};

export default UserActions;
