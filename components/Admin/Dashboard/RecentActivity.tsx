'use client';

import React from 'react';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import { ActivityItem } from '@/types/dashboard';

interface Props {
  activities: ActivityItem[];
}

const RecentActivity: React.FC<Props> = ({ activities }) => {
  const getActivityColor = (type: ActivityItem['type']) => {
    const colors = {
      user: 'text-primary',
      course: 'text-success',
      enrollment: 'text-info',
      system: 'text-warning',
    };
    return colors[type] || 'text-muted';
  };

  const getActivityBadge = (type: ActivityItem['type']) => {
    const badges = {
      user: 'badge-primary-soft',
      course: 'badge-success-soft',
      enrollment: 'badge-info-soft',
      system: 'badge-warning-soft',
    };
    return badges[type] || 'badge-secondary-soft';
  };

  return (
    <div className="rbt-dashboard-content bg-color-white rbt-shadow-box mb--60">
      <div className="content">
        <div className="section-title mb--30">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h4 className="rbt-title-style-3">Recent Activity</h4>
              <p className="b3 text-muted">Latest platform events</p>
            </div>
            <a
              href="/admin-logs"
              className="rbt-btn btn-sm btn-outline-primary"
            >
              View All
            </a>
          </div>
        </div>

        <div className="rbt-dashboard-table table-responsive">
          <table className="rbt-table table table-borderless">
            <tbody>
              {activities.length > 0 ? (
                activities.map((activity) => (
                  <tr key={activity.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div
                          className={`rbt-round-icon me-3 ${getActivityColor(activity.type)}`}
                        >
                          <i
                            className={activity.icon || 'feather-activity'}
                          ></i>
                        </div>
                        <div className="flex-grow-1">
                          <p className="mb-1">{activity.message}</p>
                          <small className="text-muted">
                            <i className="feather-clock me-1"></i>
                            {formatDistanceToNow(new Date(activity.timestamp), {
                              addSuffix: true,
                            })}
                          </small>
                        </div>
                        <div>
                          <span
                            className={`badge ${getActivityBadge(activity.type)}`}
                          >
                            {activity.type}
                          </span>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="text-center text-muted py-5">
                    <i
                      className="feather-inbox mb-3"
                      style={{ fontSize: '2rem' }}
                    ></i>
                    <p>No recent activity</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RecentActivity;
