'use client';

import React from 'react';
import { User } from './types';
import UserRow from './UserRow';

interface UserTableProps {
  users: User[];
  selectedUsers: Set<string>;
  onSelectUser: (userId: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onView: (user: User) => void;
  onEdit: (user: User) => void;
  onToggleStatus: (user: User) => void;
  onResetPassword: (user: User) => void;
  onDelete: (user: User) => void;
  onImpersonate?: (user: User) => void;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (column: string) => void;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  selectedUsers,
  onSelectUser,
  onSelectAll,
  onView,
  onEdit,
  onToggleStatus,
  onResetPassword,
  onDelete,
  onImpersonate,
  sortBy,
  sortOrder,
  onSort,
}) => {
  const allSelected =
    users.length > 0 && users.every((user) => selectedUsers.has(user.id));
  const someSelected =
    users.some((user) => selectedUsers.has(user.id)) && !allSelected;

  const getSortIcon = (column: string) => {
    if (sortBy !== column) {
      return <i className="feather-chevron-down text-muted opacity-50"></i>;
    }
    return sortOrder === 'asc' ? (
      <i className="feather-chevron-up"></i>
    ) : (
      <i className="feather-chevron-down"></i>
    );
  };

  return (
    <div className="rbt-dashboard-content bg-color-white rbt-shadow-box">
      <div className="content">
        <div className="table-responsive">
          <table className="rbt-table table table-hover">
            <thead>
              <tr>
                <th className="text-center" style={{ width: '40px' }}>
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={allSelected}
                    ref={(input) => {
                      if (input) {
                        input.indeterminate = someSelected;
                      }
                    }}
                    onChange={(e) => onSelectAll(e.target.checked)}
                  />
                </th>
                <th
                  className="sortable-header"
                  onClick={() => onSort('name')}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="d-flex align-items-center">
                    User
                    <span className="ms-1">{getSortIcon('name')}</span>
                  </div>
                </th>
                <th className="text-center">Role</th>
                <th className="text-center">Status</th>
                <th className="text-center">Verified</th>
                <th
                  className="text-center sortable-header"
                  onClick={() => onSort('lastActive')}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="d-flex align-items-center justify-content-center">
                    Last Active
                    <span className="ms-1">{getSortIcon('lastActive')}</span>
                  </div>
                </th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    isSelected={selectedUsers.has(user.id)}
                    onSelect={onSelectUser}
                    onView={onView}
                    onEdit={onEdit}
                    onToggleStatus={onToggleStatus}
                    onResetPassword={onResetPassword}
                    onDelete={onDelete}
                    onImpersonate={onImpersonate}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-5">
                    <div className="text-muted">
                      <i
                        className="feather-users mb-3"
                        style={{ fontSize: '3rem' }}
                      ></i>
                      <p>No users found matching your criteria</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {users.length > 0 && (
          <div className="d-flex justify-content-between align-items-center mt-4">
            <div>
              Showing <strong>1-{Math.min(10, users.length)}</strong> of{' '}
              <strong>{users.length}</strong> users
            </div>
            <nav>
              <ul className="pagination mb-0">
                <li className="page-item disabled">
                  <a className="page-link" href="#" tabIndex={-1}>
                    <i className="feather-chevron-left"></i>
                  </a>
                </li>
                <li className="page-item active">
                  <a className="page-link" href="#">
                    1
                  </a>
                </li>
                <li className="page-item">
                  <a className="page-link" href="#">
                    2
                  </a>
                </li>
                <li className="page-item">
                  <a className="page-link" href="#">
                    3
                  </a>
                </li>
                <li className="page-item">
                  <a className="page-link" href="#">
                    <i className="feather-chevron-right"></i>
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserTable;
