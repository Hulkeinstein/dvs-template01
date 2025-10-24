'use client';

import { useState, useEffect, startTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toggleBookmark } from '@/app/lib/actions/bookmarkActions';

interface BookmarkButtonProps {
  courseId: string;
  initialBookmarked?: boolean;
  variant?: 'icon' | 'button';
  className?: string;
}

const BookmarkButton: React.FC<BookmarkButtonProps> = ({
  courseId,
  initialBookmarked = false,
  variant = 'icon',
  className = '',
}) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const [isPending, setIsPending] = useState(false);

  // Sync with server state when initialBookmarked prop changes
  useEffect(() => {
    setIsBookmarked(initialBookmarked);
  }, [initialBookmarked]);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session?.user?.id) {
      router.push('/login');
      return;
    }

    setIsPending(true);
    const previousState = isBookmarked;

    // Optimistic UI update
    setIsBookmarked(!isBookmarked);

    try {
      const result = await toggleBookmark(session.user.id, courseId);

      if (!result.success) {
        // Rollback on error
        setIsBookmarked(previousState);
        console.error('Failed to toggle bookmark');
      } else {
        // Confirm with server state
        setIsBookmarked(result.bookmarked);

        // Refresh server-side data without blocking UI
        startTransition(() => {
          router.refresh();
        });
      }
    } catch (error) {
      // Rollback on error
      setIsBookmarked(previousState);
      console.error('Error toggling bookmark:', error);
    } finally {
      setIsPending(false);
    }
  };

  if (variant === 'button') {
    return (
      <button
        className={`rbt-btn-link border-0 bg-transparent p-2 ${isBookmarked ? 'bookmark-active' : ''} ${className}`}
        onClick={handleClick}
        disabled={isPending}
        aria-pressed={isBookmarked}
        aria-label={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
      >
        <i className={isBookmarked ? 'fas fa-heart' : 'far fa-heart'}></i>
      </button>
    );
  }

  // Icon variant (for course cards)
  return (
    <div className="rbt-bookmark-btn">
      <button
        className={`rbt-round-btn ${isBookmarked ? 'bookmark-active' : ''} ${className}`}
        onClick={handleClick}
        disabled={isPending}
        aria-pressed={isBookmarked}
        aria-label={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
        title={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
      >
        <i className={isBookmarked ? 'fas fa-heart' : 'far fa-heart'}></i>
      </button>
    </div>
  );
};

export default BookmarkButton;
