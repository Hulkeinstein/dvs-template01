'use client';

import React, { startTransition, useOptimistic, useState } from 'react';
import { toggleLessonProgress } from '@/app/lib/actions/progressActions';

interface LessonCompleteButtonProps {
  lessonId: string | number;
  courseId: string | number;
  userId: string;
  isCompleted: boolean;
  onToggle?: (status: boolean) => void;
}

const LessonCompleteButton: React.FC<LessonCompleteButtonProps> = ({ 
    lessonId, 
    courseId,
    userId, 
    isCompleted: initialDetails,
    onToggle
}) => {
    // 1. Optimistic State
    const [optimisticCompleted, addOptimisticCompleted] = useOptimistic(
        initialDetails,
        (_, newStatus: boolean) => newStatus
    );

    const [isLoading, setIsLoading] = useState(false);

    const handleToggle = async () => {
        if (!userId || isLoading) return;

        const newStatus = !optimisticCompleted;
        console.log('Toggling progress:', newStatus);

        // Optimistic UI Update immediately
        startTransition(() => {
            addOptimisticCompleted(newStatus);
        });
        
        setIsLoading(true);

        try {
            const result = await toggleLessonProgress(lessonId, courseId, userId, newStatus);
            if (!result.success) {
                  // Revert if failed (Optimistic UI naturally handles this via next render if we used state properly,
                  // but here useOptimistic resets on next server revalidate mostly. 
                  // For robust undo, we might need manual state revert, but Next.js useOptimistic helps.)
                  console.error(result.error);
                  alert(result.error); 
                  // Force revert optimistic? 
                   startTransition(() => {
                    addOptimisticCompleted(!newStatus); // Revert
                   });
            } else {
                if (onToggle) onToggle(newStatus);
            }
        } catch (error) {
            console.error(error);
             startTransition(() => {
                addOptimisticCompleted(!newStatus);
             });
        } finally {
            setIsLoading(false);
        }
    };

  return (
    <button
      className={`rbt-btn btn-sm ${optimisticCompleted ? 'btn-gradient' : 'btn-white'} hover-icon-reverse`}
      onClick={handleToggle}
      disabled={isLoading}
    >
      <span className="icon-reverse-wrapper">
        <span className="btn-text">{optimisticCompleted ? '완료됨' : '완료하기'}</span>
        <span className="btn-icon">
          <i className={`feather-${optimisticCompleted ? 'check-circle' : 'circle'}`}></i>
        </span>
        <span className="btn-icon">
          <i className={`feather-${optimisticCompleted ? 'check-circle' : 'circle'}`}></i>
        </span>
      </span>
    </button>
  );
};

export default LessonCompleteButton;
