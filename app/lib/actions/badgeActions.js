'use server';

import { supabaseServer as supabase } from '@/app/lib/supabase/server';
import { BADGE_CONFIG } from '@/app/lib/constants/badgeConfig';

/**
 * Get badges for a specific course
 * @param {string} courseId - The course ID
 * @returns {Array} Array of badge objects
 */
export async function getCourseBadges(courseId) {
  try {
    const { data: badges, error } = await supabase
      .from('course_badges')
      .select('*')
      .eq('course_id', courseId)
      .order('priority', { ascending: true });

    if (error) {
      console.error('Error fetching badges:', error);
      return [];
    }

    // Enrich badges with config data
    return badges.map((badge) => ({
      ...badge,
      ...BADGE_CONFIG[badge.badge_type],
      type: badge.badge_type,
    }));
  } catch (error) {
    console.error('Error in getCourseBadges:', error);
    return [];
  }
}

/**
 * Get badges for multiple courses
 * @param {Array} courseIds - Array of course IDs
 * @returns {Object} Object with courseId as key and badges array as value
 */
export async function getMultipleCourseBadges(courseIds) {
  try {
    const { data: badges, error } = await supabase
      .from('course_badges')
      .select('*')
      .in('course_id', courseIds)
      .order('priority', { ascending: true });

    if (error) {
      console.error('Error fetching multiple badges:', error);
      return {};
    }

    // Group badges by course_id
    const badgesByCourse = badges.reduce((acc, badge) => {
      if (!acc[badge.course_id]) {
        acc[badge.course_id] = [];
      }

      acc[badge.course_id].push({
        ...badge,
        ...BADGE_CONFIG[badge.badge_type],
        type: badge.badge_type,
      });

      return acc;
    }, {});

    return badgesByCourse;
  } catch (error) {
    console.error('Error in getMultipleCourseBadges:', error);
    return {};
  }
}

/**
 * Toggle featured badge for a course
 * @param {string} courseId - The course ID
 * @param {boolean} isFeatured - Whether to set as featured
 * @param {Date} featuredUntil - Optional expiry date
 */
export async function toggleFeaturedBadge(
  courseId,
  isFeatured,
  featuredUntil = null
) {
  try {
    // Update course table
    const { error: courseError } = await supabase
      .from('courses')
      .update({
        is_featured: isFeatured,
        featured_until: featuredUntil,
      })
      .eq('id', courseId);

    if (courseError) {
      console.error('Error updating course featured status:', courseError);
      return { success: false, error: courseError.message };
    }

    // Trigger badge recalculation
    const { error: badgeError } = await supabase.rpc(
      'calculate_course_badges',
      { p_course_id: courseId }
    );

    if (badgeError) {
      console.error('Error recalculating badges:', badgeError);
      return { success: false, error: badgeError.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in toggleFeaturedBadge:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Manually add a badge to a course
 * @param {string} courseId - The course ID
 * @param {string} badgeType - The badge type
 * @param {Object} metadata - Optional metadata
 * @param {Date} expiresAt - Optional expiry date
 */
export async function addBadgeToCourse(
  courseId,
  badgeType,
  metadata = null,
  expiresAt = null
) {
  try {
    const badgeConfig = BADGE_CONFIG[badgeType];
    if (!badgeConfig) {
      return { success: false, error: 'Invalid badge type' };
    }

    const { error } = await supabase.from('course_badges').upsert(
      {
        course_id: courseId,
        badge_type: badgeType,
        priority: badgeConfig.priority,
        metadata: metadata,
        expires_at: expiresAt,
      },
      {
        onConflict: 'course_id,badge_type',
      }
    );

    if (error) {
      console.error('Error adding badge:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in addBadgeToCourse:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Remove a badge from a course
 * @param {string} courseId - The course ID
 * @param {string} badgeType - The badge type to remove
 */
export async function removeBadgeFromCourse(courseId, badgeType) {
  try {
    const { error } = await supabase
      .from('course_badges')
      .delete()
      .eq('course_id', courseId)
      .eq('badge_type', badgeType);

    if (error) {
      console.error('Error removing badge:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in removeBadgeFromCourse:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Refresh badges for a course (triggers recalculation)
 * @param {string} courseId - The course ID
 */
export async function refreshCourseBadges(courseId) {
  try {
    const { error } = await supabase.rpc('calculate_course_badges', {
      p_course_id: courseId,
    });

    if (error) {
      console.error('Error refreshing badges:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in refreshCourseBadges:', error);
    return { success: false, error: error.message };
  }
}
