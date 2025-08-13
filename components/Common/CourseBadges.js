'use client';

import { useEffect } from 'react';

/**
 * CourseBadges Component
 * Displays multiple badges for a course with tooltip support
 *
 * @param {Array} badges - Array of badge objects
 * @param {number} maxDisplay - Maximum number of badges to display (default: 4)
 * @param {string} size - Size of badges: 'sm', 'md', 'lg' (default: 'md')
 * @param {boolean} showTooltip - Whether to show tooltips (default: true)
 */
const CourseBadges = ({
  badges = [],
  maxDisplay = 4,
  size = 'md',
  showTooltip = true,
  className = '',
}) => {
  // Initialize Bootstrap tooltips
  useEffect(() => {
    if (showTooltip && typeof window !== 'undefined') {
      // Bootstrap tooltip initialization
      const tooltipTriggerList = document.querySelectorAll(
        '[data-bs-toggle="tooltip"]'
      );
      const tooltipList = [...tooltipTriggerList].map((tooltipTriggerEl) => {
        if (window.bootstrap && window.bootstrap.Tooltip) {
          return new window.bootstrap.Tooltip(tooltipTriggerEl);
        }
        return null;
      });

      // Cleanup tooltips on unmount
      return () => {
        tooltipList.forEach((tooltip) => {
          if (tooltip) tooltip.dispose();
        });
      };
    }
  }, [badges, showTooltip]);

  if (!badges || badges.length === 0) {
    return null;
  }

  // Sort badges by priority and limit display
  const displayBadges = badges
    .sort((a, b) => (a.priority || 999) - (b.priority || 999))
    .slice(0, maxDisplay);

  const remainingCount = badges.length - displayBadges.length;

  // Size classes
  const sizeClasses = {
    sm: 'badge-icon-sm',
    md: 'badge-icon-md',
    lg: 'badge-icon-lg',
  };

  return (
    <div className={`course-badges-container ${className}`}>
      {displayBadges.map((badge, index) => (
        <span
          key={`${badge.type}-${index}`}
          className={`rbt-badge-icon ${sizeClasses[size]} badge-${badge.type}`}
          {...(showTooltip
            ? {
                'data-bs-toggle': 'tooltip',
                'data-bs-placement': 'top',
                title: badge.tooltip || badge.type,
              }
            : {})}
          style={{
            zIndex: displayBadges.length - index,
          }}
        >
          <span className="badge-emoji">{badge.icon}</span>
        </span>
      ))}

      {remainingCount > 0 && (
        <span
          className={`rbt-badge-icon ${sizeClasses[size]} badge-more`}
          {...(showTooltip
            ? {
                'data-bs-toggle': 'tooltip',
                'data-bs-placement': 'top',
                title: `${remainingCount}개 더 보기`,
              }
            : {})}
        >
          +{remainingCount}
        </span>
      )}
    </div>
  );
};

export default CourseBadges;
