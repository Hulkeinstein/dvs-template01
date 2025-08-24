import { z } from 'zod';
import {
  enrollmentRepository,
  type Enrollment,
} from '../repositories/enrollment.repository';
import { progressService } from './progressService';

// DTOs with Zod validation
const EnrollmentCreateDTO = z.object({
  userId: z.string().uuid(),
  courseId: z.string().uuid(),
});

const ProgressUpdateDTO = z.object({
  enrollmentId: z.string().uuid(),
  progress: z.number().min(0).max(100),
});

export class EnrollmentService {
  async enrollUser(
    data: z.infer<typeof EnrollmentCreateDTO>
  ): Promise<Enrollment> {
    const validated = EnrollmentCreateDTO.parse(data);

    const enrollment = await enrollmentRepository.enroll(
      validated.userId,
      validated.courseId
    );

    await progressService.initializeForEnrollment(enrollment.id);
    return enrollment;
  }

  async getEnrollmentWithProgress(enrollmentId: string) {
    const enrollment = await enrollmentRepository.findById(enrollmentId);
    if (!enrollment) return null;

    const progress =
      await progressService.calculateCourseProgress(enrollmentId);

    return {
      ...enrollment,
      calculatedProgress: progress,
    };
  }

  async updateProgress(
    data: z.infer<typeof ProgressUpdateDTO>
  ): Promise<Enrollment> {
    const validated = ProgressUpdateDTO.parse(data);

    // Match repository signature: updateProgress(enrollmentId: string, progress: number)
    const enrollment = await enrollmentRepository.updateProgress(
      validated.enrollmentId,
      validated.progress
    );

    await progressService.syncEnrollmentProgress(validated.enrollmentId);
    return enrollment;
  }
}

export const enrollmentService = new EnrollmentService();
