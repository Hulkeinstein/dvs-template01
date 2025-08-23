import { z } from 'zod';
import { getServerClient } from '../supabase/server';

const LessonProgressDTO = z.object({
  userId: z.string().uuid(),
  lessonId: z.string().uuid(),
  enrollmentId: z.string().uuid(),
  status: z.enum(['not_started', 'in_progress', 'completed']),
  progressPercentage: z.number().min(0).max(100).optional(),
  timeSpentSeconds: z.number().min(0).optional(),
});

export class ProgressService {
  private supabase = getServerClient();

  async initializeForEnrollment(enrollmentId: string) {
    const { data: enrollment } = await this.supabase
      .from('enrollments')
      .select('course_id, user_id')
      .eq('id', enrollmentId)
      .single();

    if (!enrollment) return;

    const { data: lessons } = await this.supabase
      .from('lessons')
      .select('id')
      .eq('course_id', enrollment.course_id);

    if (!lessons || lessons.length === 0) return;

    // TODO: Batch insert for large courses (>100 lessons)
    // const BATCH_SIZE = 100;
    // for (let i = 0; i < lessons.length; i += BATCH_SIZE) {
    //   const batch = lessons.slice(i, i + BATCH_SIZE);
    //   await this.processBatch(batch, enrollment);
    // }

    const progressRecords = lessons.map((lesson) => ({
      user_id: enrollment.user_id,
      lesson_id: lesson.id,
      course_id: enrollment.course_id,
      enrollment_id: enrollmentId,
      status: 'not_started',
    }));

    // For now, single upsert (optimize for courses with >100 lessons)
    await this.supabase
      .from('lesson_progress')
      .upsert(progressRecords, { onConflict: 'user_id,lesson_id' });
  }

  async updateLessonProgress(data: z.infer<typeof LessonProgressDTO>) {
    const validated = LessonProgressDTO.parse(data);

    // Use atomic upsert function to prevent race conditions
    const { error } = await this.supabase.rpc('upsert_lesson_progress_atomic', {
      p_user_id: validated.userId,
      p_lesson_id: validated.lessonId,
      p_enrollment_id: validated.enrollmentId,
      p_status: validated.status,
      p_progress: validated.progressPercentage || 0,
      p_time_spent: validated.timeSpentSeconds || 0,
    });

    if (error) throw error;

    // Return updated progress
    const { data: progress } = await this.supabase
      .from('lesson_progress')
      .select('*')
      .eq('user_id', validated.userId)
      .eq('lesson_id', validated.lessonId)
      .single();

    return progress;
  }

  async calculateCourseProgress(enrollmentId: string) {
    const { data, error } = await this.supabase.rpc(
      'calculate_course_progress',
      { p_enrollment_id: enrollmentId }
    );

    if (error) throw error;
    return (
      data?.[0] || {
        total_lessons: 0,
        completed_lessons: 0,
        progress_percentage: 0,
      }
    );
  }

  async getNextLesson(enrollmentId: string): Promise<string | null> {
    const { data, error } = await this.supabase.rpc('get_next_lesson', {
      p_enrollment_id: enrollmentId,
    });

    if (error) throw error;
    return data;
  }

  async syncEnrollmentProgress(enrollmentId: string) {
    // Now handled atomically by upsert_lesson_progress_atomic
    const { error } = await this.supabase.rpc(
      'update_enrollment_progress_from_lessons',
      { p_enrollment_id: enrollmentId }
    );

    if (error) throw error;
  }
}

export const progressService = new ProgressService();
