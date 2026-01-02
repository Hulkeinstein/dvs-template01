/**
 * Centralized route constants for the application
 * All route paths should be defined here to avoid hardcoding
 */

// =========================================================================
// Main route definitions
// =========================================================================
export const ROUTES = {
  // Home
  HOME: '/',
  DASHBOARD: '/dashboard',

  // Authentication routes
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },

  // Student routes
  STUDENT: {
    DASHBOARD: '/student-dashboard',
    ENROLLED_COURSES: '/student-enrolled-course',
    COURSE_BROWSER: '/all-courses',
    WISHLIST: '/student-wishlist',
    PROFILE: '/student-profile',
    SETTINGS: '/student-settings',
    CERTIFICATES: '/student-certificates',
    TEST_ENROLLMENT: '/test-enrollment',
  },

  // Instructor routes
  INSTRUCTOR: {
    DASHBOARD: '/instructor-dashboard',
    COURSES: '/instructor-personal-courses',
    CREATE_COURSE: '/create-course',
    EDIT_COURSE: (id: string) => `/instructor/courses/${id}/edit` as const,
    EDIT_ASSIGNMENT: (courseId: string, assignmentId: string) =>
      `/instructor/courses/${courseId}/edit/assignment/${assignmentId}` as const,
    ENROLLED_COURSES: '/instructor-enrolled-course',
    ANALYTICS: '/instructor-analytics',
    STUDENTS: '/instructor-students',
    PROFILE: '/instructor-profile',
    SETTINGS: '/instructor-settings',
  },

  // Course/Lesson routes (dynamic builders)
  COURSE: {
    DETAILS: (id: string) => `/course-details/${id}` as const,
    PREVIEW: (id: string) => `/course-preview/${id}` as const,
  },

  LESSON: {
    VIEW: (id: string) => `/lesson/${id}` as const,
    QUIZ: (id: string) => `/lesson/${id}/quiz` as const,
  },

  // Public pages
  PUBLIC: {
    ABOUT: '/about',
    CONTACT: '/contact',
    PRIVACY: '/privacy-policy',
    TERMS: '/terms-of-service',
  },
} as const;

// =========================================================================
// Legacy route aliases for backward compatibility
// =========================================================================
export const ROUTE_ALIASES: Record<string, string> = {
  // Instructor aliases
  '/instructor/courses': ROUTES.INSTRUCTOR.COURSES,
  '/instructor-my-courses': ROUTES.INSTRUCTOR.COURSES,

  // Student aliases
  '/enrolled-courses': ROUTES.STUDENT.ENROLLED_COURSES,
  '/my-courses': ROUTES.STUDENT.ENROLLED_COURSES,
  '/browse-courses': ROUTES.STUDENT.COURSE_BROWSER,
};

// =========================================================================
// Helper functions
// =========================================================================

/**
 * Resolves a route path, handling aliases and deprecation warnings
 * @param pathOrKey - The path or route key to resolve
 * @returns The resolved route path
 */
export function resolveRoute(pathOrKey: string): string {
  if (pathOrKey in ROUTE_ALIASES) {
    if (
      typeof window !== 'undefined' &&
      process.env.NODE_ENV === 'development'
    ) {
      console.warn(
        `[Deprecated Route] "${pathOrKey}" is deprecated. Use "${ROUTE_ALIASES[pathOrKey]}" instead.`
      );
    }
    return ROUTE_ALIASES[pathOrKey];
  }
  return pathOrKey;
}

/**
 * Gets a safe route that works with Next.js Link
 * @param route - The route constant or builder function result
 * @returns A string path suitable for href
 */
export function getRoutePath(route: string | (() => string)): string {
  return typeof route === 'function' ? route() : route;
}

/**
 * Checks if a path matches a route pattern
 * @param currentPath - The current pathname
 * @param routePattern - The route pattern to match against
 * @returns True if the paths match
 */
export function isActiveRoute(
  currentPath: string,
  routePattern: string
): boolean {
  // Handle exact matches
  if (currentPath === routePattern) return true;

  // Handle pattern matching for dynamic routes
  if (routePattern.includes('[') && routePattern.includes(']')) {
    const pattern = routePattern.replace(/\[.*?\]/g, '[^/]+');
    const regex = new RegExp(`^${pattern}$`);
    return regex.test(currentPath);
  }

  // Handle prefix matching for nested routes
  return currentPath.startsWith(routePattern + '/');
}

// =========================================================================
// Type exports
// =========================================================================

// Type for all static routes
export type StaticRoute =
  | typeof ROUTES.HOME
  | (typeof ROUTES.AUTH)[keyof typeof ROUTES.AUTH]
  | (typeof ROUTES.STUDENT)[keyof typeof ROUTES.STUDENT]
  | typeof ROUTES.INSTRUCTOR.DASHBOARD
  | typeof ROUTES.INSTRUCTOR.COURSES
  | typeof ROUTES.INSTRUCTOR.CREATE_COURSE
  | typeof ROUTES.INSTRUCTOR.ANALYTICS
  | typeof ROUTES.INSTRUCTOR.STUDENTS
  | typeof ROUTES.INSTRUCTOR.PROFILE
  | typeof ROUTES.INSTRUCTOR.SETTINGS
  | (typeof ROUTES.PUBLIC)[keyof typeof ROUTES.PUBLIC];

// Type for dynamic route builders
export type DynamicRoute =
  | ReturnType<typeof ROUTES.INSTRUCTOR.EDIT_COURSE>
  | ReturnType<typeof ROUTES.COURSE.DETAILS>
  | ReturnType<typeof ROUTES.COURSE.PREVIEW>
  | ReturnType<typeof ROUTES.LESSON.VIEW>
  | ReturnType<typeof ROUTES.LESSON.QUIZ>;

// Combined route type
export type AppRoute = StaticRoute | DynamicRoute;

// =========================================================================
// Navigation helpers
// =========================================================================

/**
 * Student navigation menu items
 */
export const STUDENT_NAV_ITEMS = [
  { label: 'Dashboard', href: ROUTES.STUDENT.DASHBOARD, icon: 'home' },
  { label: 'My Courses', href: ROUTES.STUDENT.ENROLLED_COURSES, icon: 'book' },
  {
    label: 'Browse Courses',
    href: ROUTES.STUDENT.COURSE_BROWSER,
    icon: 'search',
  },
  { label: 'Wishlist', href: ROUTES.STUDENT.WISHLIST, icon: 'heart' },
  { label: 'Certificates', href: ROUTES.STUDENT.CERTIFICATES, icon: 'award' },
] as const;

/**
 * Instructor navigation menu items
 */
export const INSTRUCTOR_NAV_ITEMS = [
  { label: 'Dashboard', href: ROUTES.INSTRUCTOR.DASHBOARD, icon: 'home' },
  { label: 'My Courses', href: ROUTES.INSTRUCTOR.COURSES, icon: 'book' },
  {
    label: 'Create Course',
    href: ROUTES.INSTRUCTOR.CREATE_COURSE,
    icon: 'plus',
  },
  { label: 'Students', href: ROUTES.INSTRUCTOR.STUDENTS, icon: 'users' },
  { label: 'Analytics', href: ROUTES.INSTRUCTOR.ANALYTICS, icon: 'chart' },
] as const;
