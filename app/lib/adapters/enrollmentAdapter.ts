import { enrollmentService } from '../services/enrollmentService';
import type { Enrollment } from '../repositories/enrollment.repository';

/**
 * Adapter for JS components to access TS enrollment service
 * 6 functions for JS→TS boundary
 */
export async function enrollUser(
  userId: string,
  courseId: string
): Promise<Enrollment> {
  return enrollmentService.enrollUser({ userId, courseId });
}

export async function getEnrollmentWithProgress(enrollmentId: string) {
  return enrollmentService.getEnrollmentWithProgress(enrollmentId);
}

export async function updateEnrollmentProgress(
  enrollmentId: string,
  progress: number
) {
  return enrollmentService.updateProgress({ enrollmentId, progress });
}

export async function getUserEnrollments(userId: string) {
  const { enrollmentRepository } = await import(
    '../repositories/enrollment.repository'
  );
  return enrollmentRepository.findByUser(userId);
}

export async function getCourseEnrollments(courseId: string) {
  const { enrollmentRepository } = await import(
    '../repositories/enrollment.repository'
  );
  return enrollmentRepository.findByCourse(courseId);
}

export async function checkEnrollment(userId: string, courseId: string) {
  const { enrollmentRepository } = await import(
    '../repositories/enrollment.repository'
  );
  const enrollment = await enrollmentRepository.findByUserAndCourse(
    userId,
    courseId
  );
  return enrollment !== null;
}
