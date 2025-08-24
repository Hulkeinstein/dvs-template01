import { useCallback, useRef } from 'react';
import { updateLessonProgress } from '@/app/lib/adapters/progressAdapter';

interface ProgressUpdate {
  userId: string;
  lessonId: string;
  enrollmentId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progressPercentage?: number;
}

export function useProgressDebounce(delay: number = 2000) {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const pendingUpdate = useRef<ProgressUpdate | null>(null);

  const updateProgress = useCallback(
    async (data: ProgressUpdate) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      pendingUpdate.current = data;

      timeoutRef.current = setTimeout(async () => {
        if (pendingUpdate.current) {
          try {
            await updateLessonProgress(
              pendingUpdate.current.userId,
              pendingUpdate.current.lessonId,
              pendingUpdate.current.enrollmentId,
              pendingUpdate.current.status,
              pendingUpdate.current.progressPercentage
            );
            pendingUpdate.current = null;
          } catch (error) {
            console.error('Failed to update progress:', error);
          }
        }
      }, delay);
    },
    [delay]
  );

  const flushProgress = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (pendingUpdate.current) {
      try {
        await updateLessonProgress(
          pendingUpdate.current.userId,
          pendingUpdate.current.lessonId,
          pendingUpdate.current.enrollmentId,
          pendingUpdate.current.status,
          pendingUpdate.current.progressPercentage
        );
        pendingUpdate.current = null;
      } catch (error) {
        console.error('Failed to flush progress:', error);
      }
    }
  }, []);

  return { updateProgress, flushProgress };
}
