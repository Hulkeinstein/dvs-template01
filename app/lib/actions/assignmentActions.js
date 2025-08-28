'use server';

import { supabaseServer as supabase } from '@/app/lib/supabase/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth.config';
import { logger } from '@/app/lib/utils/logger';

// Create a new assignment lesson
export async function createAssignmentLesson(
  courseId,
  topicId,
  assignmentData
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return {
        success: false,
        error: 'You must be logged in to create an assignment',
      };
    }

    // Verify the user owns the course
    const { data: userData } = await supabase
      .from('user')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (!userData) {
      return { success: false, error: 'User not found' };
    }

    const { data: courseCheck } = await supabase
      .from('courses')
      .select('instructor_id')
      .eq('id', courseId)
      .single();

    if (!courseCheck || courseCheck.instructor_id !== userData.id) {
      return {
        success: false,
        error: 'You do not have permission to modify this course',
      };
    }

    // Get the current max sort_order for this topic
    const { data: existingLessons } = await supabase
      .from('lessons')
      .select('sort_order')
      .eq('course_id', courseId)
      .eq('topic_id', topicId)
      .order('sort_order', { ascending: false })
      .limit(1);

    const nextSortOrder =
      existingLessons && existingLessons.length > 0
        ? existingLessons[0].sort_order + 1
        : 0;

    // Prepare assignment content data
    const contentData = {
      instructions: assignmentData.summary || '',
      attachments: assignmentData.attachments || [],
      timeLimit: assignmentData.timeLimit || { value: 0, unit: 'weeks' },
      totalPoints: assignmentData.totalPoints || 100,
      passingPoints: assignmentData.passingPoints || 70,
      maxUploads: assignmentData.maxUploads || 1,
      maxFileSize: assignmentData.maxFileSize || 10,
      dueDate: assignmentData.dueDate || null,
    };

    // Create the assignment lesson
    const { data, error } = await supabase
      .from('lessons')
      .insert({
        course_id: courseId,
        topic_id: topicId,
        title: assignmentData.title,
        description: assignmentData.summary || '',
        content_type: 'assignment',
        content_data: contentData,
        sort_order: nextSortOrder,
        duration_minutes: 0,
        is_preview: false,
      })
      .select()
      .single();

    if (error) {
      logger.error('[assignmentActions] Error creating assignment:', error);
      throw error;
    }

    logger.log('[assignmentActions] Assignment created successfully:', {
      id: data.id,
      title: data.title,
      courseId,
      topicId,
    });

    return { success: true, data };
  } catch (error) {
    console.error('Error creating assignment:', error);
    return { success: false, error: error.message };
  }
}

// Update an existing assignment lesson
export async function updateAssignmentLesson(lessonId, assignmentData) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return {
        success: false,
        error: 'You must be logged in to update an assignment',
      };
    }

    // Verify ownership through the lesson's course
    const { data: lessonCheck } = await supabase
      .from('lessons')
      .select(
        `
        course_id,
        courses!inner (instructor_id)
      `
      )
      .eq('id', lessonId)
      .single();

    const { data: userData } = await supabase
      .from('user')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (
      !userData ||
      !lessonCheck ||
      lessonCheck.courses.instructor_id !== userData.id
    ) {
      return {
        success: false,
        error: 'You do not have permission to modify this assignment',
      };
    }

    // Prepare updated content data
    const contentData = {
      instructions: assignmentData.summary || '',
      attachments: assignmentData.attachments || [],
      timeLimit: assignmentData.timeLimit || { value: 0, unit: 'weeks' },
      totalPoints: assignmentData.totalPoints || 100,
      passingPoints: assignmentData.passingPoints || 70,
      maxUploads: assignmentData.maxUploads || 1,
      maxFileSize: assignmentData.maxFileSize || 10,
      dueDate: assignmentData.dueDate || null,
    };

    // Update the assignment lesson
    const { data, error } = await supabase
      .from('lessons')
      .update({
        title: assignmentData.title,
        description: assignmentData.summary || '',
        content_data: contentData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', lessonId)
      .select()
      .single();

    if (error) {
      logger.error('[assignmentActions] Error updating assignment:', error);
      throw error;
    }

    logger.log('[assignmentActions] Assignment updated successfully:', {
      id: data.id,
      title: data.title,
    });

    return { success: true, data };
  } catch (error) {
    console.error('Error updating assignment:', error);
    return { success: false, error: error.message };
  }
}

// Delete an assignment lesson
export async function deleteAssignmentLesson(lessonId) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return {
        success: false,
        error: 'You must be logged in to delete an assignment',
      };
    }

    // Verify ownership through the lesson's course
    const { data: lessonCheck } = await supabase
      .from('lessons')
      .select(
        `
        course_id,
        topic_id,
        sort_order,
        courses!inner (instructor_id)
      `
      )
      .eq('id', lessonId)
      .single();

    const { data: userData } = await supabase
      .from('user')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (
      !userData ||
      !lessonCheck ||
      lessonCheck.courses.instructor_id !== userData.id
    ) {
      return {
        success: false,
        error: 'You do not have permission to delete this assignment',
      };
    }

    // Delete the assignment
    const { error } = await supabase
      .from('lessons')
      .delete()
      .eq('id', lessonId);

    if (error) {
      logger.error('[assignmentActions] Error deleting assignment:', error);
      throw error;
    }

    // Reorder remaining lessons
    const { data: remainingLessons } = await supabase
      .from('lessons')
      .select('id, sort_order')
      .eq('course_id', lessonCheck.course_id)
      .eq('topic_id', lessonCheck.topic_id)
      .gt('sort_order', lessonCheck.sort_order)
      .order('sort_order', { ascending: true });

    if (remainingLessons && remainingLessons.length > 0) {
      for (const lesson of remainingLessons) {
        await supabase
          .from('lessons')
          .update({ sort_order: lesson.sort_order - 1 })
          .eq('id', lesson.id);
      }
    }

    logger.log('[assignmentActions] Assignment deleted successfully:', {
      id: lessonId,
    });

    return { success: true };
  } catch (error) {
    console.error('Error deleting assignment:', error);
    return { success: false, error: error.message };
  }
}

// Get assignment by lesson ID
export async function getAssignmentByLessonId(lessonId) {
  try {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('id', lessonId)
      .eq('content_type', 'assignment')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return { success: false, error: 'Assignment not found' };
      }
      throw error;
    }

    // Transform the data to match the expected format
    const assignmentData = {
      id: data.id,
      title: data.title,
      summary: data.content_data?.instructions || data.description || '',
      attachments: data.content_data?.attachments || [],
      timeLimit: data.content_data?.timeLimit || { value: 0, unit: 'weeks' },
      totalPoints: data.content_data?.totalPoints || 100,
      passingPoints: data.content_data?.passingPoints || 70,
      maxUploads: data.content_data?.maxUploads || 1,
      maxFileSize: data.content_data?.maxFileSize || 10,
      dueDate: data.content_data?.dueDate || null,
    };

    return { success: true, data: assignmentData };
  } catch (error) {
    console.error('Error fetching assignment:', error);
    return { success: false, error: error.message };
  }
}

// Reorder assignments within a topic
export async function reorderAssignments(courseId, topicId, assignmentIds) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return {
        success: false,
        error: 'You must be logged in to reorder assignments',
      };
    }

    // Verify ownership
    const { data: userData } = await supabase
      .from('user')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (!userData) {
      return { success: false, error: 'User not found' };
    }

    const { data: courseCheck } = await supabase
      .from('courses')
      .select('instructor_id')
      .eq('id', courseId)
      .single();

    if (!courseCheck || courseCheck.instructor_id !== userData.id) {
      return {
        success: false,
        error: 'You do not have permission to modify this course',
      };
    }

    // Update sort_order for each assignment
    const updates = assignmentIds.map((id, index) =>
      supabase
        .from('lessons')
        .update({ sort_order: index })
        .eq('id', id)
        .eq('course_id', courseId)
        .eq('topic_id', topicId)
        .eq('content_type', 'assignment')
    );

    // Execute all updates
    const results = await Promise.all(updates);

    // Check for errors
    const errors = results.filter((result) => result.error);
    if (errors.length > 0) {
      logger.error('[assignmentActions] Error reordering assignments:', errors);
      return {
        success: false,
        error: 'Some assignments could not be reordered',
      };
    }

    logger.log('[assignmentActions] Assignments reordered successfully');
    return { success: true };
  } catch (error) {
    console.error('Error reordering assignments:', error);
    return { success: false, error: error.message };
  }
}

// Get all assignments for an instructor
export async function getInstructorAssignments(instructorId) {
  try {
    // First, get all courses for the instructor
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('id, title')
      .eq('instructor_id', instructorId)
      .order('created_at', { ascending: false });

    if (coursesError) {
      logger.error('[assignmentActions] Error fetching courses:', coursesError);
      return { success: false, error: 'Failed to fetch courses' };
    }

    if (!courses || courses.length === 0) {
      return { success: true, data: [] };
    }

    // Get all assignment lessons for these courses with submissions count
    const courseIds = courses.map((c) => c.id);

    const { data: assignments, error: assignmentsError } = await supabase
      .from('lessons')
      .select(
        `
        id,
        course_id,
        topic_id,
        title,
        description,
        content_data,
        sort_order,
        created_at,
        updated_at,
        course_topics (
          id,
          title
        )
      `
      )
      .eq('content_type', 'assignment')
      .in('course_id', courseIds)
      .order('created_at', { ascending: false });

    if (assignmentsError) {
      logger.error(
        '[assignmentActions] Error fetching assignments:',
        assignmentsError
      );
      return { success: false, error: 'Failed to fetch assignments' };
    }

    // Get submission counts for each assignment
    // Note: This assumes there's an assignment_submissions table - adjust based on your schema
    const assignmentsWithData = await Promise.all(
      (assignments || []).map(async (assignment) => {
        // For now, we'll use mock submission count
        // In production, you'd query the actual submissions table
        const submissionsCount = Math.floor(Math.random() * 20);

        // Find the course for this assignment
        const course = courses.find((c) => c.id === assignment.course_id);

        return {
          id: assignment.id,
          lesson_id: assignment.id,
          course_id: assignment.course_id,
          topic_id: assignment.topic_id,
          title: assignment.title,
          description: assignment.description,
          total_points: assignment.content_data?.totalPoints || 100,
          passing_points: assignment.content_data?.passingPoints || 70,
          due_date: assignment.content_data?.dueDate || null,
          submissions_count: submissionsCount,
          created_at: assignment.created_at,
          updated_at: assignment.updated_at,
          course: course ? { id: course.id, title: course.title } : null,
          topic: assignment.course_topics || null,
        };
      })
    );

    logger.log('[assignmentActions] Fetched assignments:', {
      count: assignmentsWithData.length,
      instructorId,
    });

    return { success: true, data: assignmentsWithData };
  } catch (error) {
    console.error('Error fetching instructor assignments:', error);
    return { success: false, error: error.message };
  }
}
