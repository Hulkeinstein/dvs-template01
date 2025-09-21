'use server';

import { supabaseServer as supabase } from '@/app/lib/supabase/server';

interface EnrollmentData {
  userId: string;
  courseId: string;
}

interface EnrollmentUpdateData {
  enrollmentId: string;
  progress?: number;
  status?: 'active' | 'completed' | 'paused';
}

export async function enrollInCourse(data: EnrollmentData) {
  try {
    // Check if already enrolled
    const { data: existing, error: checkError } = await supabase
      .from('enrollments')
      .select('id, status')
      .eq('user_id', data.userId)
      .eq('course_id', data.courseId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking enrollment:', checkError);
      return { success: false, error: 'Failed to check enrollment status' };
    }

    if (existing) {
      // If already enrolled but inactive, reactivate
      if (existing.status !== 'active') {
        const { error: updateError } = await supabase
          .from('enrollments')
          .update({
            status: 'active',
            last_accessed_at: new Date().toISOString(),
          })
          .eq('id', existing.id);

        if (updateError) {
          console.error('Error reactivating enrollment:', updateError);
          return { success: false, error: 'Failed to reactivate enrollment' };
        }

        return {
          success: true,
          message: 'Enrollment reactivated',
          enrollmentId: existing.id,
        };
      }

      return { success: false, error: 'Already enrolled in this course' };
    }

    // Create new enrollment
    const { data: newEnrollment, error: insertError } = await supabase
      .from('enrollments')
      .insert({
        user_id: data.userId,
        course_id: data.courseId,
        status: 'active',
        progress: 0,
        enrolled_at: new Date().toISOString(),
        last_accessed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating enrollment:', insertError);
      return { success: false, error: 'Failed to enroll in course' };
    }

    // Also create an order record for tracking
    const { error: orderError } = await supabase.from('orders').insert({
      user_id: data.userId,
      course_id: data.courseId,
      amount: 0, // For free enrollment
      currency: 'USD',
      status: 'completed',
      payment_method: 'free',
    });

    if (orderError) {
      console.error('Error creating order record:', orderError);
      // Non-critical error, enrollment still succeeded
    }

    return {
      success: true,
      message: 'Successfully enrolled in course',
      enrollmentId: newEnrollment.id,
    };
  } catch (error) {
    console.error('Error in enrollInCourse:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function updateEnrollmentProgress(data: EnrollmentUpdateData) {
  try {
    const updateData: Record<string, unknown> = {
      last_accessed_at: new Date().toISOString(),
    };

    if (data.progress !== undefined) {
      updateData.progress = data.progress;
    }

    if (data.status) {
      updateData.status = data.status;
      if (data.status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }
    }

    const { error } = await supabase
      .from('enrollments')
      .update(updateData)
      .eq('id', data.enrollmentId);

    if (error) {
      console.error('Error updating enrollment:', error);
      return { success: false, error: 'Failed to update enrollment' };
    }

    return { success: true, message: 'Enrollment updated successfully' };
  } catch (error) {
    console.error('Error in updateEnrollmentProgress:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function unenrollFromCourse(enrollmentId: string) {
  try {
    const { error } = await supabase
      .from('enrollments')
      .update({
        status: 'paused',
        last_accessed_at: new Date().toISOString(),
      })
      .eq('id', enrollmentId);

    if (error) {
      console.error('Error unenrolling:', error);
      return { success: false, error: 'Failed to unenroll from course' };
    }

    return { success: true, message: 'Successfully unenrolled from course' };
  } catch (error) {
    console.error('Error in unenrollFromCourse:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Admin function to create test enrollments
export async function createTestEnrollment(userId: string, courseId: string) {
  try {
    const { data, error } = await supabase
      .from('enrollments')
      .insert({
        user_id: userId,
        course_id: courseId,
        status: 'active',
        progress: Math.floor(Math.random() * 100), // Random progress for testing
        enrolled_at: new Date().toISOString(),
        last_accessed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating test enrollment:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error in createTestEnrollment:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Get enrollment statistics for a user
export async function getUserEnrollmentStats(userId: string) {
  try {
    const { data: enrollments, error } = await supabase
      .from('enrollments')
      .select('status, progress')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching enrollment stats:', error);
      return null;
    }

    const stats = {
      total: enrollments?.length || 0,
      active: enrollments?.filter((e) => e.status === 'active').length || 0,
      completed:
        enrollments?.filter((e) => e.status === 'completed').length || 0,
      paused: enrollments?.filter((e) => e.status === 'paused').length || 0,
      averageProgress: enrollments?.length
        ? Math.round(
            enrollments.reduce((acc, e) => acc + (e.progress || 0), 0) /
              enrollments.length
          )
        : 0,
    };

    return stats;
  } catch (error) {
    console.error('Error in getUserEnrollmentStats:', error);
    return null;
  }
}
