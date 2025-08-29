'use client';

import React from 'react';
import { UserStats as UserStatsType } from './types';

interface UserStatsProps {
  stats: UserStatsType;
}

const UserStats: React.FC<UserStatsProps> = ({ stats }) => {
  const statCards = [
    {
      title: 'Total Users',
      value: stats.total,
      icon: 'feather-users',
      color: 'primary',
      trend:
        stats.newThisMonth > 0 ? `+${stats.newThisMonth} this month` : null,
    },
    {
      title: 'Active Users',
      value: stats.active,
      icon: 'feather-user-check',
      color: 'success',
      percentage: Math.round((stats.active / stats.total) * 100),
    },
    {
      title: 'Administrators',
      value: stats.admins,
      icon: 'feather-shield',
      color: 'danger',
      subtext: 'System admins',
    },
    {
      title: 'Instructors',
      value: stats.instructors,
      icon: 'feather-award',
      color: 'warning',
      subtext: 'Content creators',
    },
    {
      title: 'Students',
      value: stats.students,
      icon: 'feather-book-open',
      color: 'info',
      percentage: Math.round((stats.students / stats.total) * 100),
    },
    {
      title: 'New This Week',
      value: stats.newThisWeek,
      icon: 'feather-user-plus',
      color: 'secondary',
      trend: stats.newThisWeek > 0 ? 'Recent signups' : 'No new users',
    },
  ];

  return (
    <div className="row g-3 mb-4">
      {statCards.map((card, index) => (
        <div key={index} className="col-lg-4 col-md-6">
          <div className="rbt-card card-body h-100">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <p className="mb-2 text-muted small">{card.title}</p>
                <h3 className="mb-1">
                  {card.value.toLocaleString()}
                  {card.percentage && (
                    <span className="ms-2 badge bg-light text-dark">
                      {card.percentage}%
                    </span>
                  )}
                </h3>
                {card.trend && (
                  <p className="mb-0 small text-success">
                    <i className="feather-trending-up me-1"></i>
                    {card.trend}
                  </p>
                )}
                {card.subtext && (
                  <p className="mb-0 small text-muted">{card.subtext}</p>
                )}
              </div>
              <div className={`icon-circle bg-${card.color}-opacity`}>
                <i className={`${card.icon} text-${card.color}`}></i>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserStats;
