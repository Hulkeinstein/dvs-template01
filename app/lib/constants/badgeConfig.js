/**
 * Badge configuration with icons and tooltips
 * This is separated from server actions to comply with "use server" restrictions
 */
export const BADGE_CONFIG = {
  bestseller: {
    icon: '🏆',
    tooltip: '베스트셀러',
    color: '#f39c12',
    priority: 3,
  },
  hot: {
    icon: '🔥',
    tooltip: '인기 급상승',
    color: '#e74c3c',
    priority: 2,
  },
  new: {
    icon: '✨',
    tooltip: '신규 코스',
    color: '#3498db',
    priority: 6,
  },
  featured: {
    icon: '⭐',
    tooltip: '추천 코스',
    color: '#9b59b6',
    priority: 4,
  },
  limited: {
    icon: '🎯',
    tooltip: '마감 임박',
    color: '#e67e22',
    priority: 2,
  },
  sale: {
    icon: '💰',
    tooltip: '할인 중',
    color: '#27ae60',
    priority: 1,
  },
  certified: {
    icon: '🎓',
    tooltip: '수료증 제공',
    color: '#2c3e50',
    priority: 5,
  },
};
