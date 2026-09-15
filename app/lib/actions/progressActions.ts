'use server';

import { getServerClient } from '@/app/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Toggle lesson completion status
export async function toggleLessonProgress(
  lessonId: string | number,
  courseId: string | number,
  userId: string,
  completed: boolean
) {
  try {
    const supabase = getServerClient(); // Users client with session

    if (!userId) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    if (completed) {
      // Mark as complete
      const { error } = await supabase.from('lesson_progress').upsert(
        {
          user_id: userId,
          lesson_id: lessonId,
          course_id: courseId,
          completed_at: new Date().toISOString(),
          last_accessed: new Date().toISOString(),
        },
        { onConflict: 'user_id, lesson_id' } // Assuming composite PK or unique constraint
      );

      if (error) {
        console.error('Error marking complete:', error);
        return { success: false, error: '진행률 저장 실패' };
      }
    } else {
      // Mark as incomplete (optional: delete or set completed_at null)
      // Usually we set completed_at to null to keep the record for 'last_accessed' if needed,
      // but for simple toggle, deleting or nulling is fine. Detailed spec says "upsert".
      // Let's set completed_at to null.
      const { error } = await supabase
        .from('lesson_progress')
        .update({ completed_at: null })
        .eq('user_id', userId)
        .eq('lesson_id', lessonId);

      if (error) {
        console.error('Error marking incomplete:', error);
        return { success: false, error: '진행률 저장 실패' };
      }
    }

    revalidatePath(`/lesson/${lessonId}`);
    revalidatePath(`/course/${courseId}`);
    return { success: true };
  } catch (error) {
    console.error('Unexpected error in toggleLessonProgress:', error);
    return { success: false, error: '예기치 않은 오류가 발생했습니다.' };
  }
}

export async function getLessonProgress(
  lessonId: string | number,
  userId: string
) {
  try {
    const supabase = getServerClient();
    const { data, error } = await supabase
      .from('lesson_progress')
      .select('completed_at')
      .eq('user_id', userId)
      .eq('lesson_id', lessonId)
      .maybeSingle();

    if (error) return { success: false };

    return { success: true, isCompleted: !!data?.completed_at };
  } catch {
    return { success: false };
  }
}
