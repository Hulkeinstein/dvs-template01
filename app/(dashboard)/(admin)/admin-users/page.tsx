'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  User,
  UserFilters as UserFiltersType,
  UserStats as UserStatsType,
} from '@/components/Admin/UserManagement/types';
import UserStats from '@/components/Admin/UserManagement/UserStats';
import UserFilters from '@/components/Admin/UserManagement/UserFilters';
import UserTable from '@/components/Admin/UserManagement/UserTable';
import UserBulkActions from '@/components/Admin/UserManagement/UserBulkActions';
import UserDetailDrawer from '@/components/Admin/UserManagement/UserDetailDrawer';
import { mockUsers } from './_data/mockUsers';

export default function AdminUsersPage() {
  const [users] = useState<User[]>(mockUsers);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [filters, setFilters] = useState<UserFiltersType>({
    search: '',
    role: 'all',
    status: 'all',
    dateRange: { start: null, end: null },
    sortBy: 'name',
    sortOrder: 'asc',
  });

  // Calculate stats
  const stats = useMemo<UserStatsType>(() => {
    const total = users.length;
    const active = users.filter((u) => u.status === 'active').length;
    const inactive = users.filter((u) => u.status === 'inactive').length;
    const admins = users.filter((u) => u.role === 'admin').length;
    const instructors = users.filter((u) => u.role === 'instructor').length;
    const students = users.filter((u) => u.role === 'student').length;

    // Calculate new users (mock data)
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const newThisWeek = users.filter(
      (u) => new Date(u.joinDate) > weekAgo
    ).length;
    const newThisMonth = users.filter(
      (u) => new Date(u.joinDate) > monthAgo
    ).length;

    return {
      total,
      active,
      inactive,
      admins,
      instructors,
      students,
      newThisWeek,
      newThisMonth,
    };
  }, [users]);

  // Filter and sort users
  const filteredUsers = useMemo(() => {
    let filtered = [...users];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(searchLower) ||
          u.email.toLowerCase().includes(searchLower)
      );
    }

    // Role filter
    if (filters.role !== 'all') {
      filtered = filtered.filter((u) => u.role === filters.role);
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter((u) => u.status === filters.status);
    }

    // Sort
    filtered.sort((a, b) => {
      let compareValue = 0;

      switch (filters.sortBy) {
        case 'name':
          compareValue = a.name.localeCompare(b.name);
          break;
        case 'email':
          compareValue = a.email.localeCompare(b.email);
          break;
        case 'joinDate':
          compareValue =
            new Date(a.joinDate).getTime() - new Date(b.joinDate).getTime();
          break;
        case 'lastActive':
          compareValue =
            new Date(a.lastActive).getTime() - new Date(b.lastActive).getTime();
          break;
      }

      return filters.sortOrder === 'asc' ? compareValue : -compareValue;
    });

    return filtered;
  }, [users, filters]);

  // Handlers
  const handleSelectUser = useCallback((userId: string, selected: boolean) => {
    setSelectedUsers((prev) => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(userId);
      } else {
        newSet.delete(userId);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(
    (selected: boolean) => {
      if (selected) {
        setSelectedUsers(new Set(filteredUsers.map((u) => u.id)));
      } else {
        setSelectedUsers(new Set());
      }
    },
    [filteredUsers]
  );

  const handleViewUser = useCallback((user: User) => {
    setSelectedUser(user);
    setIsDrawerOpen(true);
  }, []);

  const handleEditUser = useCallback((user: User) => {
    console.log('Edit user:', user);
    alert(`Edit user: ${user.name}`);
  }, []);

  const handleToggleStatus = useCallback((user: User) => {
    console.log('Toggle status for:', user);
    alert(`Toggle status for: ${user.name}`);
  }, []);

  const handleResetPassword = useCallback((user: User) => {
    console.log('Reset password for:', user);
    alert(`Reset password for: ${user.name}`);
  }, []);

  const handleDeleteUser = useCallback((user: User) => {
    if (confirm(`Are you sure you want to delete ${user.name}?`)) {
      console.log('Delete user:', user);
      alert(`User ${user.name} would be deleted`);
    }
  }, []);

  const handleImpersonate = useCallback((user: User) => {
    console.log('Impersonate user:', user);
    alert(`Impersonate user: ${user.name}`);
  }, []);

  const handleExport = useCallback(() => {
    console.log('Export users');
    alert('Export users to CSV');
  }, []);

  const handleAddUser = useCallback(() => {
    console.log('Add new user');
    alert('Add new user dialog would open');
  }, []);

  const handleSort = useCallback((column: string) => {
    setFilters((prev) => {
      if (prev.sortBy === column) {
        return {
          ...prev,
          sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc',
        };
      }
      return {
        ...prev,
        sortBy: column as typeof prev.sortBy,
        sortOrder: 'asc',
      };
    });
  }, []);

  // Bulk actions
  const handleBulkActivate = useCallback(() => {
    console.log('Bulk activate:', Array.from(selectedUsers));
    alert(`Activate ${selectedUsers.size} users`);
    setSelectedUsers(new Set());
  }, [selectedUsers]);

  const handleBulkDeactivate = useCallback(() => {
    console.log('Bulk deactivate:', Array.from(selectedUsers));
    alert(`Deactivate ${selectedUsers.size} users`);
    setSelectedUsers(new Set());
  }, [selectedUsers]);

  const handleBulkDelete = useCallback(() => {
    if (
      confirm(`Are you sure you want to delete ${selectedUsers.size} users?`)
    ) {
      console.log('Bulk delete:', Array.from(selectedUsers));
      alert(`Delete ${selectedUsers.size} users`);
      setSelectedUsers(new Set());
    }
  }, [selectedUsers]);

  const handleBulkEmail = useCallback(() => {
    console.log('Bulk email:', Array.from(selectedUsers));
    alert(`Send email to ${selectedUsers.size} users`);
  }, [selectedUsers]);

  const handleClearSelection = useCallback(() => {
    setSelectedUsers(new Set());
  }, []);

  return (
    <div className="rbt-dashboard-content">
      <div className="content">
        {/* Statistics */}
        <UserStats stats={stats} />

        {/* Filters */}
        <UserFilters
          filters={filters}
          onFilterChange={setFilters}
          onExport={handleExport}
          onAddUser={handleAddUser}
        />

        {/* Bulk Actions */}
        <UserBulkActions
          selectedCount={selectedUsers.size}
          onBulkActivate={handleBulkActivate}
          onBulkDeactivate={handleBulkDeactivate}
          onBulkDelete={handleBulkDelete}
          onBulkEmail={handleBulkEmail}
          onClearSelection={handleClearSelection}
        />

        {/* User Table */}
        <UserTable
          users={filteredUsers}
          selectedUsers={selectedUsers}
          onSelectUser={handleSelectUser}
          onSelectAll={handleSelectAll}
          onView={handleViewUser}
          onEdit={handleEditUser}
          onToggleStatus={handleToggleStatus}
          onResetPassword={handleResetPassword}
          onDelete={handleDeleteUser}
          onImpersonate={handleImpersonate}
          sortBy={filters.sortBy}
          sortOrder={filters.sortOrder}
          onSort={handleSort}
        />

        {/* User Detail Drawer */}
        <UserDetailDrawer
          user={selectedUser}
          isOpen={isDrawerOpen}
          onClose={() => {
            setIsDrawerOpen(false);
            setSelectedUser(null);
          }}
          onEdit={handleEditUser}
        />
      </div>
    </div>
  );
}
