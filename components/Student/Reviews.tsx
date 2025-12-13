'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  getReviewsByUser,
  deleteReview,
  ReviewWithCourse,
} from '@/app/lib/actions/reviewActions';

interface ReviewsProps {
  userId?: string;
}

// Helper to render star rating
const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <i key={star} className={`fas fa-star${star > rating ? ' off' : ''}`} />
      ))}
    </div>
  );
};

// Format date for display
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const Reviews = ({ userId }: ReviewsProps) => {
  const [reviews, setReviews] = useState<ReviewWithCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const data = await getReviewsByUser(userId);
        setReviews(data);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError('Failed to load reviews');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [userId]);

  const handleDelete = async (reviewId: string) => {
    if (!userId) return;
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      setDeletingId(reviewId);
      const result = await deleteReview(reviewId, userId);

      if (result.success) {
        // Remove from local state
        setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      } else {
        alert(result.error || 'Failed to delete review');
      }
    } catch (err) {
      console.error('Error deleting review:', err);
      alert('Failed to delete review');
    } finally {
      setDeletingId(null);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="rbt-dashboard-content bg-color-white rbt-shadow-box">
        <div className="content">
          <div className="section-title">
            <h4 className="rbt-title-style-3">Reviews</h4>
          </div>
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="rbt-dashboard-content bg-color-white rbt-shadow-box">
        <div className="content">
          <div className="section-title">
            <h4 className="rbt-title-style-3">Reviews</h4>
          </div>
          <div className="alert alert-danger">{error}</div>
        </div>
      </div>
    );
  }

  // Empty state
  if (reviews.length === 0) {
    return (
      <div className="rbt-dashboard-content bg-color-white rbt-shadow-box">
        <div className="content">
          <div className="section-title">
            <h4 className="rbt-title-style-3">Reviews</h4>
          </div>
          <div className="text-center py-5">
            <i
              className="feather-star"
              style={{ fontSize: '48px', opacity: 0.3 }}
            />
            <p className="mt-3 mb-0">
              You haven&apos;t written any reviews yet.
            </p>
            <p className="text-muted">
              After completing a course, share your feedback to help other
              students.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rbt-dashboard-content bg-color-white rbt-shadow-box">
      <div className="content">
        <div className="section-title">
          <h4 className="rbt-title-style-3">Reviews</h4>
        </div>

        <div className="rbt-dashboard-table table-responsive mobile-table-750">
          <table className="rbt-table table table-borderless">
            <thead>
              <tr>
                <th>Course</th>
                <th>Feedback</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review) => (
                <tr key={review.id}>
                  <th>
                    <span className="b3">
                      <Link
                        href={
                          review.course?.slug
                            ? `/course-details/${review.course.slug}`
                            : '#'
                        }
                      >
                        {review.course?.title || 'Unknown Course'}
                      </Link>
                    </span>
                    <small className="d-block text-muted">
                      {formatDate(review.created_at)}
                    </small>
                  </th>
                  <td>
                    <div className="rbt-review">
                      <StarRating rating={review.rating} />
                    </div>
                    {review.title && <p className="b3 mb-1">{review.title}</p>}
                    {review.comment && (
                      <p className="b2 text-muted mb-0">{review.comment}</p>
                    )}
                  </td>
                  <td>
                    <div className="rbt-button-group justify-content-end">
                      <Link
                        className="rbt-btn btn-xs bg-primary-opacity radius-round"
                        href={`/course-details/${review.course?.slug || ''}#reviews`}
                        title="View"
                      >
                        <i className="feather-eye pl--0" />
                      </Link>
                      <button
                        className="rbt-btn btn-xs bg-color-danger-opacity radius-round color-danger"
                        title="Delete"
                        onClick={() => handleDelete(review.id)}
                        disabled={deletingId === review.id}
                      >
                        {deletingId === review.id ? (
                          <span
                            className="spinner-border spinner-border-sm"
                            role="status"
                          />
                        ) : (
                          <i className="feather-trash-2 pl--0" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reviews;
