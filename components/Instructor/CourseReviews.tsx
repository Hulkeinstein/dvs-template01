'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  getReviewsForInstructor,
  ReviewWithDetails,
} from '@/app/lib/actions/reviewActions';

interface CourseReviewsProps {
  instructorId?: string;
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

/**
 * CourseReviews - Instructor-only component
 * Shows reviews received from students on instructor's courses
 * (Received reviews only, no Given tab)
 */
const CourseReviews = ({ instructorId }: CourseReviewsProps) => {
  const [reviews, setReviews] = useState<ReviewWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!instructorId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const data = await getReviewsForInstructor(instructorId);
        setReviews(data);
      } catch (err) {
        console.error('Error fetching course reviews:', err);
        setError('Failed to load course reviews');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [instructorId]);

  // Loading state
  if (isLoading) {
    return (
      <div className="rbt-dashboard-content bg-color-white rbt-shadow-box">
        <div className="content">
          <div className="section-title">
            <h4 className="rbt-title-style-3">Course Reviews</h4>
            <p className="description">Reviews from students on your courses</p>
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
            <h4 className="rbt-title-style-3">Course Reviews</h4>
            <p className="description">Reviews from students on your courses</p>
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
            <h4 className="rbt-title-style-3">Course Reviews</h4>
            <p className="description">Reviews from students on your courses</p>
          </div>
          <div className="text-center py-5">
            <i
              className="feather-message-square"
              style={{ fontSize: '48px', opacity: 0.3 }}
            />
            <p className="mt-3 mb-0">No reviews yet.</p>
            <p className="text-muted">
              When students leave reviews on your courses, they will appear
              here.
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
          <h4 className="rbt-title-style-3">Course Reviews</h4>
          <p className="description">
            Reviews from students on your courses ({reviews.length} total)
          </p>
        </div>

        <div className="rbt-dashboard-table table-responsive mobile-table-750">
          <table className="rbt-table table table-borderless">
            <thead>
              <tr>
                <th>Student</th>
                <th>Date</th>
                <th>Feedback</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review) => (
                <tr key={review.id}>
                  <th>
                    <div className="d-flex align-items-center gap-2">
                      {review.user?.avatar_url ? (
                        <Image
                          src={review.user.avatar_url}
                          alt={review.user?.name || 'Student'}
                          width={32}
                          height={32}
                          className="rounded-circle"
                          style={{ objectFit: 'cover' }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: '#e0e0e0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <i
                            className="feather-user"
                            style={{ fontSize: '16px' }}
                          />
                        </div>
                      )}
                      <span>{review.user?.name || 'Anonymous'}</span>
                    </div>
                  </th>
                  <td>{formatDate(review.created_at)}</td>
                  <td>
                    <span className="b3">
                      Course:{' '}
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
                    <div className="rbt-review">
                      <StarRating rating={review.rating} />
                    </div>
                    {review.title && <p className="b3 mb-1">{review.title}</p>}
                    {review.comment && (
                      <p className="b2 text-muted mb-0">{review.comment}</p>
                    )}
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

export default CourseReviews;
