'use client';

import React from 'react';
import { UserFilters as UserFiltersType, UserRole, UserStatus } from './types';

interface UserFiltersProps {
  filters: UserFiltersType;
  onFilterChange: (filters: UserFiltersType) => void;
  onExport: () => void;
  onAddUser: () => void;
}

const UserFilters: React.FC<UserFiltersProps> = ({
  filters,
  onFilterChange,
  onExport,
  onAddUser,
}) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, search: e.target.value });
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, role: e.target.value as UserRole | 'all' });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      ...filters,
      status: e.target.value as UserStatus | 'all',
    });
  };

  const handleSortChange = (sortBy: typeof filters.sortBy) => {
    if (filters.sortBy === sortBy) {
      // Toggle sort order if clicking the same column
      onFilterChange({
        ...filters,
        sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc',
      });
    } else {
      // New column, default to ascending
      onFilterChange({
        ...filters,
        sortBy,
        sortOrder: 'asc',
      });
    }
  };

  const clearFilters = () => {
    onFilterChange({
      search: '',
      role: 'all',
      status: 'all',
      dateRange: { start: null, end: null },
      sortBy: 'name',
      sortOrder: 'asc',
    });
  };

  const hasActiveFilters =
    filters.search || filters.role !== 'all' || filters.status !== 'all';

  return (
    <div className="rbt-dashboard-content bg-color-white rbt-shadow-box mb-4">
      <div className="content">
        <div className="row align-items-center mb-3">
          <div className="col-md-6">
            <h4 className="mb-0">User Management</h4>
          </div>
          <div className="col-md-6 text-end">
            <button
              className="rbt-btn btn-sm btn-gradient hover-icon-reverse me-2"
              onClick={onAddUser}
            >
              <span className="icon-reverse-wrapper">
                <span className="btn-text">Add User</span>
                <span className="btn-icon">
                  <i className="feather-user-plus"></i>
                </span>
                <span className="btn-icon">
                  <i className="feather-user-plus"></i>
                </span>
              </span>
            </button>
            <button className="rbt-btn btn-sm btn-border" onClick={onExport}>
              <i className="feather-download me-2"></i>
              Export
            </button>
          </div>
        </div>

        <div className="row g-3">
          <div className="col-md-4">
            <div className="form-group mb-0">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="feather-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search users by name or email..."
                  value={filters.search}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
          </div>

          <div className="col-md-2">
            <select
              className="form-select"
              value={filters.role}
              onChange={handleRoleChange}
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="instructor">Instructor</option>
              <option value="student">Student</option>
            </select>
          </div>

          <div className="col-md-2">
            <select
              className="form-select"
              value={filters.status}
              onChange={handleStatusChange}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div className="col-md-2">
            <div className="dropdown">
              <button
                className="btn btn-outline-secondary dropdown-toggle w-100"
                type="button"
                data-bs-toggle="dropdown"
              >
                <i className="feather-filter me-2"></i>
                Sort By
              </button>
              <ul className="dropdown-menu">
                <li>
                  <a
                    className="dropdown-item"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handleSortChange('name');
                    }}
                  >
                    Name{' '}
                    {filters.sortBy === 'name' && (
                      <i
                        className={`feather-chevron-${filters.sortOrder === 'asc' ? 'up' : 'down'} float-end`}
                      ></i>
                    )}
                  </a>
                </li>
                <li>
                  <a
                    className="dropdown-item"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handleSortChange('email');
                    }}
                  >
                    Email{' '}
                    {filters.sortBy === 'email' && (
                      <i
                        className={`feather-chevron-${filters.sortOrder === 'asc' ? 'up' : 'down'} float-end`}
                      ></i>
                    )}
                  </a>
                </li>
                <li>
                  <a
                    className="dropdown-item"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handleSortChange('joinDate');
                    }}
                  >
                    Join Date{' '}
                    {filters.sortBy === 'joinDate' && (
                      <i
                        className={`feather-chevron-${filters.sortOrder === 'asc' ? 'up' : 'down'} float-end`}
                      ></i>
                    )}
                  </a>
                </li>
                <li>
                  <a
                    className="dropdown-item"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handleSortChange('lastActive');
                    }}
                  >
                    Last Active{' '}
                    {filters.sortBy === 'lastActive' && (
                      <i
                        className={`feather-chevron-${filters.sortOrder === 'asc' ? 'up' : 'down'} float-end`}
                      ></i>
                    )}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="col-md-2">
            {hasActiveFilters && (
              <button
                className="btn btn-outline-secondary w-100"
                onClick={clearFilters}
              >
                <i className="feather-x me-2"></i>
                Clear
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserFilters;
