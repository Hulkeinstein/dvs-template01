'use client';

import React from 'react';
import { User } from './types';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';

interface UserDetailDrawerProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (user: User) => void;
}

const UserDetailDrawer: React.FC<UserDetailDrawerProps> = ({
  user,
  isOpen,
  onClose,
  onEdit,
}) => {
  if (!user) return null;

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

  return (
    <>
      {/* Backdrop */}
      {isOpen && <div className="drawer-backdrop" onClick={onClose} />}

      {/* Drawer */}
      <div className={`user-detail-drawer ${isOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <h5 className="mb-0">User Details</h5>
          <button className="btn-close" onClick={onClose} aria-label="Close" />
        </div>

        <div className="drawer-body">
          {/* User Header */}
          <div className="text-center mb-4">
            <img
              src={
                user.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2f57ef&color=fff`
              }
              alt={user.name}
              className="rounded-circle mb-3"
              style={{ width: '100px', height: '100px', objectFit: 'cover' }}
            />
            <h4 className="mb-1">{user.name}</h4>
            <p className="text-muted mb-2">{user.email}</p>
            <div className="d-flex justify-content-center gap-2 mb-3">
              <span className={`badge ${getRoleBadgeClass(user.role)}`}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </span>
              <span className={`badge ${getStatusBadgeClass(user.status)}`}>
                {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
              </span>
            </div>
            <button className="rbt-btn btn-sm" onClick={() => onEdit(user)}>
              <i className="feather-edit me-2"></i>
              Edit Profile
            </button>
          </div>

          {/* User Information */}
          <div className="info-section">
            <h6 className="section-title">Account Information</h6>
            <div className="info-row">
              <span className="info-label">User ID:</span>
              <span className="info-value">{user.id}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Joined:</span>
              <span className="info-value">
                {new Date(user.joinDate).toLocaleDateString()}
                <span className="text-muted ms-1">
                  (
                  {formatDistanceToNow(new Date(user.joinDate), {
                    addSuffix: true,
                  })}
                  )
                </span>
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Last Active:</span>
              <span className="info-value">
                {formatDistanceToNow(new Date(user.lastActive), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </div>

          {/* Verification Status */}
          <div className="info-section">
            <h6 className="section-title">Verification</h6>
            <div className="info-row">
              <span className="info-label">Email:</span>
              <span className="info-value">
                {user.emailVerified ? (
                  <span className="text-success">
                    <i className="feather-check-circle me-1"></i>Verified
                  </span>
                ) : (
                  <span className="text-warning">
                    <i className="feather-alert-circle me-1"></i>Not Verified
                  </span>
                )}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Phone:</span>
              <span className="info-value">
                {user.phoneVerified ? (
                  <span className="text-success">
                    <i className="feather-check-circle me-1"></i>Verified
                  </span>
                ) : (
                  <span className="text-warning">
                    <i className="feather-alert-circle me-1"></i>Not Verified
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Location Info */}
          {(user.country || user.timezone) && (
            <div className="info-section">
              <h6 className="section-title">Location</h6>
              {user.country && (
                <div className="info-row">
                  <span className="info-label">Country:</span>
                  <span className="info-value">{user.country}</span>
                </div>
              )}
              {user.timezone && (
                <div className="info-row">
                  <span className="info-label">Timezone:</span>
                  <span className="info-value">{user.timezone}</span>
                </div>
              )}
            </div>
          )}

          {/* Role-specific Information */}
          {user.role === 'instructor' && (
            <div className="info-section">
              <h6 className="section-title">Instructor Stats</h6>
              <div className="info-row">
                <span className="info-label">Courses:</span>
                <span className="info-value">{user.courses || 0}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Total Earned:</span>
                <span className="info-value">
                  ${(user.totalEarned || 0).toLocaleString()}
                </span>
              </div>
              {user.skills && user.skills.length > 0 && (
                <div className="info-row">
                  <span className="info-label">Skills:</span>
                  <div className="mt-1">
                    {user.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="badge bg-light text-dark me-1 mb-1"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {user.role === 'student' && (
            <div className="info-section">
              <h6 className="section-title">Student Stats</h6>
              <div className="info-row">
                <span className="info-label">Enrollments:</span>
                <span className="info-value">{user.enrollments || 0}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Total Spent:</span>
                <span className="info-value">
                  ${(user.totalSpent || 0).toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Bio */}
          {user.bio && (
            <div className="info-section">
              <h6 className="section-title">Bio</h6>
              <p className="text-muted">{user.bio}</p>
            </div>
          )}

          {/* Actions */}
          <div className="info-section border-top pt-3">
            <h6 className="section-title">Quick Actions</h6>
            <div className="d-grid gap-2">
              <button className="btn btn-outline-primary btn-sm">
                <i className="feather-mail me-2"></i>
                Send Email
              </button>
              <button className="btn btn-outline-warning btn-sm">
                <i className="feather-key me-2"></i>
                Reset Password
              </button>
              {user.status === 'active' ? (
                <button className="btn btn-outline-danger btn-sm">
                  <i className="feather-user-x me-2"></i>
                  Deactivate Account
                </button>
              ) : (
                <button className="btn btn-outline-success btn-sm">
                  <i className="feather-user-check me-2"></i>
                  Activate Account
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserDetailDrawer;
