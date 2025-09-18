/**
 * Central role-based routing utility
 * Single source of truth for all role-specific routes
 */

import { ROUTES } from '@/app/lib/constants/routes';

export type UserRole = 'student' | 'instructor' | 'admin';

/**
 * Get dashboard URL based on user role
 */
export function getDashboardUrl(role: UserRole | null | undefined): string {
  switch (role) {
    case 'student':
      return '/student-dashboard';
    case 'instructor':
      return '/instructor-dashboard';
    case 'admin':
      // Admin uses instructor dashboard as per current implementation
      return '/instructor-dashboard';
    default:
      // Fallback to student dashboard instead of non-existent /dashboard
      return '/student-dashboard';
  }
}

/**
 * Get profile URL based on user role
 */
export function getProfileUrl(role: UserRole | null | undefined): string {
  switch (role) {
    case 'student':
      return '/student-profile';
    case 'instructor':
      return '/instructor-profile';
    case 'admin':
      // Admin uses instructor profile as per current implementation
      return '/instructor-profile';
    default:
      return '/student-profile'; // Fallback
  }
}

/**
 * Get settings URL based on user role
 */
export function getSettingsUrl(role: UserRole | null | undefined): string {
  switch (role) {
    case 'student':
      return '/student-settings';
    case 'instructor':
      return '/instructor-settings';
    case 'admin':
      // Admin uses instructor settings as per current implementation
      return '/instructor-settings';
    default:
      return '/student-settings'; // Fallback
  }
}

/**
 * Get enrolled courses URL based on user role
 */
export function getEnrolledCoursesUrl(
  role: UserRole | null | undefined
): string {
  switch (role) {
    case 'student':
      return ROUTES.STUDENT.ENROLLED_COURSES;
    case 'instructor':
      return ROUTES.INSTRUCTOR.ENROLLED_COURSES;
    case 'admin':
      return ROUTES.INSTRUCTOR.ENROLLED_COURSES;
    default:
      return ROUTES.STUDENT.ENROLLED_COURSES;
  }
}

/**
 * Get wishlist URL based on user role
 */
export function getWishlistUrl(role: UserRole | null | undefined): string {
  switch (role) {
    case 'student':
      return '/student-wishlist';
    case 'instructor':
      return '/instructor-wishlist';
    case 'admin':
      return '/instructor-wishlist';
    default:
      return '/student-wishlist';
  }
}

/**
 * Get reviews URL based on user role
 */
export function getReviewsUrl(role: UserRole | null | undefined): string {
  switch (role) {
    case 'student':
      return '/student-reviews';
    case 'instructor':
      return '/instructor-reviews';
    case 'admin':
      return '/instructor-reviews';
    default:
      return '/student-reviews';
  }
}

/**
 * Get quiz attempts URL based on user role
 */
export function getQuizAttemptsUrl(role: UserRole | null | undefined): string {
  switch (role) {
    case 'student':
      return '/student-quiz-attempts';
    case 'instructor':
      return '/instructor-quiz-attempts';
    case 'admin':
      return '/instructor-quiz-attempts';
    default:
      return '/student-quiz-attempts';
  }
}

/**
 * Get order history URL based on user role
 */
export function getOrderHistoryUrl(role: UserRole | null | undefined): string {
  switch (role) {
    case 'student':
      return '/student-order-history';
    case 'instructor':
      return '/instructor-order-history';
    case 'admin':
      return '/instructor-order-history';
    default:
      return '/student-order-history';
  }
}

/**
 * Instructor-specific routes
 */
export function getMyCoursesUrl(role: UserRole | null | undefined): string {
  if (role === 'instructor' || role === 'admin') {
    return '/instructor-personal-courses';
  }
  return '/student-dashboard'; // Students don't have this, redirect to their dashboard
}

export function getStudentsUrl(role: UserRole | null | undefined): string {
  if (role === 'instructor' || role === 'admin') {
    return '/instructor-students';
  }
  return '/student-dashboard'; // Students don't have this, redirect to their dashboard
}

export function getAnnouncementsUrl(role: UserRole | null | undefined): string {
  if (role === 'instructor' || role === 'admin') {
    return '/instructor-announcements';
  }
  return '/student-announcements'; // Different view for students
}

export function getAssignmentsUrl(role: UserRole | null | undefined): string {
  if (role === 'instructor' || role === 'admin') {
    return '/instructor-assignments';
  }
  return '/student-assignments'; // Different view for students
}

/**
 * Resolve URL based on sidebar key and role
 */
export function resolveUrl(
  key: string,
  role: UserRole | null | undefined
): string {
  switch (key) {
    case 'dashboard':
      return getDashboardUrl(role);
    case 'profile':
      return getProfileUrl(role);
    case 'settings':
      return getSettingsUrl(role);
    case 'enrolled-courses':
      return getEnrolledCoursesUrl(role);
    case 'wishlist':
      return getWishlistUrl(role);
    case 'reviews':
      return getReviewsUrl(role);
    case 'quiz-attempts':
      return getQuizAttemptsUrl(role);
    case 'order-history':
      return getOrderHistoryUrl(role);
    case 'my-courses':
      return getMyCoursesUrl(role);
    case 'students':
      return getStudentsUrl(role);
    case 'announcements':
      return getAnnouncementsUrl(role);
    case 'assignments':
      return getAssignmentsUrl(role);
    default:
      return '/'; // Fallback to home
  }
}

/**
 * Check if a role has access to instructor features
 */
export function hasInstructorAccess(
  role: UserRole | null | undefined
): boolean {
  return role === 'instructor' || role === 'admin';
}

/**
 * Check if a role has access to admin features
 */
export function hasAdminAccess(role: UserRole | null | undefined): boolean {
  return role === 'admin';
}
