'use client';

import React from 'react';
import { User } from './types';
import UserActions from './UserActions';
import { formatDistanceToNow } from 'date-fns';

interface UserRowProps {
  user: User;
  isSelected: boolean;
  onSelect: (userId: string, selected: boolean) => void;
  onView: (user: User) => void;
  onEdit: (user: User) => void;
  onToggleStatus: (user: User) => void;
  onResetPassword: (user: User) => void;
  onDelete: (user: User) => void;
  onImpersonate?: (user: User) => void;
}

const UserRow: React.FC<UserRowProps> = ({
  user,
  isSelected,
  onSelect,
  onView,
  onEdit,
  onToggleStatus,
  onResetPassword,
  onDelete,
  onImpersonate,
}) => {
  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-danger';
      case 'instructor':
        return 'bg-warning';
      case 'student':
        return 'bg-info';
      default:
        return 'bg-secondary';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success';
      case 'inactive':
        return 'bg-secondary';
      case 'suspended':
        return 'bg-danger';
      case 'pending':
        return 'bg-warning';
      default:
        return 'bg-light text-dark';
    }
  };

  const handleRowClick = () => {
    onView(user);
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <tr className="user-row" onClick={handleRowClick}>
      <td className="text-center" onClick={handleCheckboxClick}>
        <input
          type="checkbox"
          className="form-check-input"
          checked={isSelected}
          onChange={(e) => onSelect(user.id, e.target.checked)}
        />
      </td>
      <td>
        <div className="d-flex align-items-center">
          <img
            src={
              user.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2f57ef&color=fff`
            }
            alt={user.name}
            className="rounded-circle me-3"
            style={{ width: '40px', height: '40px', objectFit: 'cover' }}
          />
          <div>
            <div className="fw-medium">{user.name}</div>
            <small className="text-muted">{user.email}</small>
          </div>
        </div>
      </td>
      <td className="text-center">
        <span className={`badge ${getRoleBadgeClass(user.role)}`}>
          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
        </span>
      </td>
      <td className="text-center">
        <span className={`badge ${getStatusBadgeClass(user.status)}`}>
          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
        </span>
      </td>
      <td className="text-center">
        <div className="d-flex justify-content-center gap-2">
          {user.emailVerified && (
            <span className="text-success" title="Email Verified">
              <i className="feather-mail"></i>
            </span>
          )}
          {user.phoneVerified && (
            <span className="text-success" title="Phone Verified">
              <i className="feather-phone"></i>
            </span>
          )}
          {!user.emailVerified && !user.phoneVerified && (
            <span className="text-muted">Not verified</span>
          )}
        </div>
      </td>
      <td className="text-center">
        <small className="text-muted">
          {formatDistanceToNow(new Date(user.lastActive), { addSuffix: true })}
        </small>
      </td>
      <td className="text-center" onClick={(e) => e.stopPropagation()}>
        <UserActions
          user={user}
          onView={onView}
          onEdit={onEdit}
          onToggleStatus={onToggleStatus}
          onResetPassword={onResetPassword}
          onDelete={onDelete}
          onImpersonate={onImpersonate}
        />
      </td>
    </tr>
  );
};

export default UserRow;
