'use server';

import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth.config';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import type { CourseStatus } from '@/types/course';

// Create Supabase client with service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Schema for reject course input
const RejectCourseSchema = z.object({
  courseId: z.string().uuid('Invalid course ID'),
  notes: z
    .string()
    .min(10, 'Rejection reason must be at least 10 characters')
    .max(500, 'Rejection reason must be less than 500 characters'),
});

/**
 * Submit a course for review (Instructor action)
 * Transitions course from 'draft' or 'rejected' to 'pending'
 */
export async function submitCourseForReview(courseId: string) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { error: 'You must be logged in to submit a course for review' };
    }

    // Get user data
    const { data: userData, error: userError } = await supabase
      .from('user')
      .select('id, role')
      .eq('email', session.user.email)
      .single();

    if (userError || !userData) {
      return { error: 'User not found' };
    }

    // Check if user is an instructor or admin
    if (userData.role !== 'instructor' && userData.role !== 'admin') {
      return { error: 'Only instructors can submit courses for review' };
    }

    // Check course ownership and current status
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, instructor_id, status, title')
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      return { error: 'Course not found' };
    }

    // Verify ownership
    if (course.instructor_id !== userData.id) {
      return { error: 'You can only submit your own courses for review' };
    }

    // Check if course is in a valid state for submission
    const validStatuses: CourseStatus[] = ['draft', 'rejected'];
    if (!validStatuses.includes(course.status as CourseStatus)) {
      return {
        error: `Course must be in draft or rejected status to submit for review. Current status: ${course.status}`,
      };
    }

    // Update course status to pending
    const { error: updateError } = await supabase
      .from('courses')
      .update({
        status: 'pending',
        submitted_at: new Date().toISOString(),
        // Clear previous review notes when resubmitting
        review_notes: null,
      })
      .eq('id', courseId);

    if (updateError) {
      console.error('Failed to update course status:', updateError);
      return { error: 'Failed to submit course for review' };
    }

    // Revalidate relevant paths
    revalidatePath('/instructor/courses');
    revalidatePath('/instructor/dashboard');
    revalidatePath(`/instructor/courses/${courseId}/edit`);

    return {
      success: true,
      message: `Course "${course.title}" has been submitted for review`,
    };
  } catch (error) {
    console.error('Error in submitCourseForReview:', error);
    return { error: 'An unexpected error occurred' };
  }
}

/**
 * Approve a course (Admin action)
 * Transitions course from 'pending' to 'published'
 */
export async function approveCourse(courseId: string) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { error: 'You must be logged in to approve courses' };
    }

    // Get user data and verify admin role
    const { data: userData, error: userError } = await supabase
      .from('user')
      .select('id, role')
      .eq('email', session.user.email)
      .single();

    if (userError || !userData) {
      return { error: 'User not found' };
    }

    if (userData.role !== 'admin') {
      return { error: 'Only administrators can approve courses' };
    }

    // Check course exists and is in pending status
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, status, title, instructor_id')
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      return { error: 'Course not found' };
    }

    if (course.status !== 'pending') {
      return {
        error: `Only pending courses can be approved. Current status: ${course.status}`,
      };
    }

    // Approve the course
    const { error: updateError } = await supabase
      .from('courses')
      .update({
        status: 'published',
        is_public: true,
        reviewed_at: new Date().toISOString(),
        reviewed_by: userData.id,
        published_at: new Date().toISOString(),
      })
      .eq('id', courseId);

    if (updateError) {
      console.error('Failed to approve course:', updateError);
      return { error: 'Failed to approve course' };
    }

    // TODO: Send notification to instructor about approval

    // Revalidate relevant paths
    revalidatePath('/admin/admin-courses');
    revalidatePath('/all-courses');
    revalidatePath('/courses');
    revalidatePath('/');

    return {
      success: true,
      message: `Course "${course.title}" has been approved and published`,
    };
  } catch (error) {
    console.error('Error in approveCourse:', error);
    return { error: 'An unexpected error occurred' };
  }
}

/**
 * Reject a course with notes (Admin action)
 * Transitions course from 'pending' to 'rejected'
 */
export async function rejectCourse(input: z.infer<typeof RejectCourseSchema>) {
  try {
    // Validate input
    const validated = RejectCourseSchema.parse(input);

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { error: 'You must be logged in to reject courses' };
    }

    // Get user data and verify admin role
    const { data: userData, error: userError } = await supabase
      .from('user')
      .select('id, role')
      .eq('email', session.user.email)
      .single();

    if (userError || !userData) {
      return { error: 'User not found' };
    }

    if (userData.role !== 'admin') {
      return { error: 'Only administrators can reject courses' };
    }

    // Check course exists and is in pending status
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, status, title, instructor_id')
      .eq('id', validated.courseId)
      .single();

    if (courseError || !course) {
      return { error: 'Course not found' };
    }

    if (course.status !== 'pending') {
      return {
        error: `Only pending courses can be rejected. Current status: ${course.status}`,
      };
    }

    // Reject the course
    const { error: updateError } = await supabase
      .from('courses')
      .update({
        status: 'rejected',
        review_notes: validated.notes,
        reviewed_at: new Date().toISOString(),
        reviewed_by: userData.id,
      })
      .eq('id', validated.courseId);

    if (updateError) {
      console.error('Failed to reject course:', updateError);
      return { error: 'Failed to reject course' };
    }

    // TODO: Send notification to instructor about rejection with notes

    // Revalidate relevant paths
    revalidatePath('/admin/admin-courses');
    revalidatePath(`/instructor/courses/${validated.courseId}/edit`);

    return {
      success: true,
      message: `Course "${course.title}" has been rejected`,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }
    console.error('Error in rejectCourse:', error);
    return { error: 'An unexpected error occurred' };
  }
}

/**
 * Get pending courses count for admin dashboard
 */
export async function getPendingCoursesCount() {
  try {
    const { count, error } = await supabase
      .from('courses')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    if (error) {
      console.error('Failed to get pending courses count:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Error in getPendingCoursesCount:', error);
    return 0;
  }
}
