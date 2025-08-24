import { progressService } from '../services/progressService';

/**
 * Adapter for JS components to access TS progress service
 * 3 functions for progress tracking
 */
export async function updateLessonProgress(
  userId: string,
  lessonId: string,
  enrollmentId: string,
  status: 'not_started' | 'in_progress' | 'completed',
  progressPercentage?: number
) {
  return progressService.updateLessonProgress({
    userId,
    lessonId,
    enrollmentId,
    status,
    progressPercentage,
  });
}

export async function getNextLesson(enrollmentId: string) {
  return progressService.getNextLesson(enrollmentId);
}

export async function getCourseProgress(enrollmentId: string) {
  return progressService.calculateCourseProgress(enrollmentId);
}
