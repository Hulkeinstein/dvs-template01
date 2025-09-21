'use server';

import { supabase } from '@/app/lib/supabase/server';

export interface Review {
  id: string;
  course_id: string;
  user_id: string;
  rating: number;
  title?: string;
  comment?: string;
  is_verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
  updated_at: string;
  user?: {
    name: string;
    avatar_url?: string;
  };
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  percentages: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

/**
 * Get review statistics for a course
 */
export async function getCourseReviewStats(
  courseId: string
): Promise<ReviewStats> {
  try {
    // Get count for each rating (1-5) using the existing pattern
    const ratingPromises = [1, 2, 3, 4, 5].map((rating) =>
      supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true })
        .eq('course_id', courseId)
        .eq('rating', rating)
    );

    const results = await Promise.all(ratingPromises);

    const distribution: ReviewStats['ratingDistribution'] = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };
    let totalReviews = 0;
    let totalScore = 0;

    results.forEach((result, index) => {
      const rating = (index + 1) as 1 | 2 | 3 | 4 | 5;
      const count = result.count || 0;
      distribution[rating] = count;
      totalReviews += count;
      totalScore += rating * count;
    });

    const averageRating = totalReviews > 0 ? totalScore / totalReviews : 0;

    // Calculate percentages for progress bars
    const percentages: ReviewStats['percentages'] = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    if (totalReviews > 0) {
      ([1, 2, 3, 4, 5] as const).forEach((rating) => {
        percentages[rating] = Math.round(
          (distribution[rating] / totalReviews) * 100
        );
      });
    }

    return {
      averageRating: Number(averageRating.toFixed(1)),
      totalReviews,
      ratingDistribution: distribution,
      percentages,
    };
  } catch (error) {
    console.error('Error fetching review stats:', error);
    // Return default values on error
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      percentages: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };
  }
}

/**
 * Get all reviews for a course with user information
 */
export async function getCourseReviews(courseId: string): Promise<Review[]> {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select(
        `
        *,
        user:user_id (
          name,
          avatar_url
        )
      `
      )
      .eq('course_id', courseId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reviews:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getCourseReviews:', error);
    return [];
  }
}

/**
 * Create a new review for a course
 */
export async function createReview(
  courseId: string,
  userId: string,
  rating: number,
  title?: string,
  comment?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if user has already reviewed this course
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('course_id', courseId)
      .eq('user_id', userId)
      .single();

    if (existingReview) {
      return {
        success: false,
        error: 'You have already reviewed this course',
      };
    }

    // Check if user has enrolled in this course
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('id')
      .eq('course_id', courseId)
      .eq('user_id', userId)
      .single();

    const isVerifiedPurchase = !!enrollment;

    // Create the review
    const { error } = await supabase.from('reviews').insert({
      course_id: courseId,
      user_id: userId,
      rating,
      title,
      comment,
      is_verified_purchase: isVerifiedPurchase,
    });

    if (error) {
      console.error('Error creating review:', error);
      return {
        success: false,
        error: 'Failed to create review',
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in createReview:', error);
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}

/**
 * Update an existing review
 */
export async function updateReview(
  reviewId: string,
  userId: string,
  updates: {
    rating?: number;
    title?: string;
    comment?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('reviews')
      .update(updates)
      .eq('id', reviewId)
      .eq('user_id', userId); // Ensure user owns the review

    if (error) {
      console.error('Error updating review:', error);
      return {
        success: false,
        error: 'Failed to update review',
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in updateReview:', error);
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}

/**
 * Delete a review
 */
export async function deleteReview(
  reviewId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId)
      .eq('user_id', userId); // Ensure user owns the review

    if (error) {
      console.error('Error deleting review:', error);
      return {
        success: false,
        error: 'Failed to delete review',
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in deleteReview:', error);
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}

/**
 * Mark a review as helpful or not helpful
 */
export async function voteReviewHelpfulness(
  reviewId: string,
  userId: string,
  isHelpful: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if user has already voted
    const { data: existingVote } = await supabase
      .from('review_helpfulness')
      .select('id, is_helpful')
      .eq('review_id', reviewId)
      .eq('user_id', userId)
      .single();

    if (existingVote) {
      // Update existing vote
      const { error } = await supabase
        .from('review_helpfulness')
        .update({ is_helpful: isHelpful })
        .eq('id', existingVote.id);

      if (error) {
        console.error('Error updating helpfulness vote:', error);
        return {
          success: false,
          error: 'Failed to update vote',
        };
      }
    } else {
      // Create new vote
      const { error } = await supabase.from('review_helpfulness').insert({
        review_id: reviewId,
        user_id: userId,
        is_helpful: isHelpful,
      });

      if (error) {
        console.error('Error creating helpfulness vote:', error);
        return {
          success: false,
          error: 'Failed to vote',
        };
      }
    }

    // Update helpful count on the review
    const { count } = await supabase
      .from('review_helpfulness')
      .select('*', { count: 'exact', head: true })
      .eq('review_id', reviewId)
      .eq('is_helpful', true);

    await supabase
      .from('reviews')
      .update({ helpful_count: count || 0 })
      .eq('id', reviewId);

    return { success: true };
  } catch (error) {
    console.error('Error in voteReviewHelpfulness:', error);
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}
