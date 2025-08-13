'use server';

import { supabase } from '@/app/lib/supabase/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { revalidatePath } from 'next/cache';

// Create a new announcement
export async function createAnnouncement(data) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return {
        success: false,
        error: 'You must be logged in to create an announcement',
      };
    }

    // Get user data
    const { data: userData, error: userError } = await supabase
      .from('user')
      .select('id, role')
      .eq('email', session.user.email)
      .single();

    if (userError || !userData) {
      return { success: false, error: 'User not found' };
    }

    if (userData.role !== 'instructor') {
      return {
        success: false,
        error: 'Only instructors can create announcements',
      };
    }

    // If course_id is provided, verify ownership
    if (data.course_id) {
      const { data: courseCheck } = await supabase
        .from('courses')
        .select('instructor_id')
        .eq('id', data.course_id)
        .single();

      if (!courseCheck || courseCheck.instructor_id !== userData.id) {
        return {
          success: false,
          error:
            'You do not have permission to create announcements for this course',
        };
      }
    }

    // Create the announcement
    const { data: announcement, error } = await supabase
      .from('announcements')
      .insert({
        course_id: data.course_id || null,
        instructor_id: userData.id,
        title: data.title,
        content: data.content,
        priority: data.priority || 'normal',
        is_active: data.is_active !== false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating announcement:', error);
      return { success: false, error: 'Failed to create announcement' };
    }

    revalidatePath('/instructor/announcements');
    revalidatePath('/student/announcements');

    return { success: true, data: announcement };
  } catch (error) {
    console.error('Unexpected error in createAnnouncement:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Update an announcement
export async function updateAnnouncement(announcementId, data) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return {
        success: false,
        error: 'You must be logged in to update an announcement',
      };
    }

    // Get user data
    const { data: userData } = await supabase
      .from('user')
      .select('id, role')
      .eq('email', session.user.email)
      .single();

    if (!userData || userData.role !== 'instructor') {
      return {
        success: false,
        error: 'Only instructors can update announcements',
      };
    }

    // Verify ownership
    const { data: announcementCheck } = await supabase
      .from('announcements')
      .select('instructor_id')
      .eq('id', announcementId)
      .single();

    if (!announcementCheck || announcementCheck.instructor_id !== userData.id) {
      return {
        success: false,
        error: 'You do not have permission to update this announcement',
      };
    }

    // Update the announcement
    const { data: announcement, error } = await supabase
      .from('announcements')
      .update({
        title: data.title,
        content: data.content,
        priority: data.priority,
        is_active: data.is_active,
        course_id: data.course_id,
      })
      .eq('id', announcementId)
      .select()
      .single();

    if (error) {
      console.error('Error updating announcement:', error);
      return { success: false, error: 'Failed to update announcement' };
    }

    revalidatePath('/instructor/announcements');
    revalidatePath('/student/announcements');

    return { success: true, data: announcement };
  } catch (error) {
    console.error('Unexpected error in updateAnnouncement:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Delete an announcement
export async function deleteAnnouncement(announcementId) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return {
        success: false,
        error: 'You must be logged in to delete an announcement',
      };
    }

    // Get user data
    const { data: userData } = await supabase
      .from('user')
      .select('id, role')
      .eq('email', session.user.email)
      .single();

    if (!userData || userData.role !== 'instructor') {
      return {
        success: false,
        error: 'Only instructors can delete announcements',
      };
    }

    // Verify ownership
    const { data: announcementCheck } = await supabase
      .from('announcements')
      .select('instructor_id')
      .eq('id', announcementId)
      .single();

    if (!announcementCheck || announcementCheck.instructor_id !== userData.id) {
      return {
        success: false,
        error: 'You do not have permission to delete this announcement',
      };
    }

    // Delete the announcement
    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', announcementId);

    if (error) {
      console.error('Error deleting announcement:', error);
      return { success: false, error: 'Failed to delete announcement' };
    }

    revalidatePath('/instructor/announcements');
    revalidatePath('/student/announcements');

    return { success: true };
  } catch (error) {
    console.error('Unexpected error in deleteAnnouncement:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Get instructor's announcements
export async function getInstructorAnnouncements() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return { success: false, error: 'You must be logged in' };
    }

    // Get user data
    const { data: userData } = await supabase
      .from('user')
      .select('id, role')
      .eq('email', session.user.email)
      .single();

    if (!userData || userData.role !== 'instructor') {
      return { success: false, error: 'Only instructors can access this' };
    }

    // Get announcements with course information
    const { data: announcements, error } = await supabase
      .from('announcements')
      .select(
        `
        *,
        courses (
          id,
          title
        )
      `
      )
      .eq('instructor_id', userData.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching announcements:', error);
      return { success: false, error: 'Failed to fetch announcements' };
    }

    // Get instructor's courses for the filter dropdown
    const { data: courses } = await supabase
      .from('courses')
      .select('id, title')
      .eq('instructor_id', userData.id)
      .order('title');

    return {
      success: true,
      announcements: announcements || [],
      courses: courses || [],
    };
  } catch (error) {
    console.error('Unexpected error in getInstructorAnnouncements:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Get student's announcements (from enrolled courses)
export async function getStudentAnnouncements() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return { success: false, error: 'You must be logged in' };
    }

    // Get user data
    const { data: userData } = await supabase
      .from('user')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (!userData) {
      return { success: false, error: 'User not found' };
    }

    // Get enrolled courses
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('course_id')
      .eq('student_id', userData.id);

    if (!enrollments || enrollments.length === 0) {
      return { success: true, announcements: [], courses: [] };
    }

    const courseIds = enrollments.map((e) => e.course_id);

    // Get announcements from enrolled courses
    const { data: announcements, error } = await supabase
      .from('announcements')
      .select(
        `
        *,
        courses (
          id,
          title
        )
      `
      )
      .in('course_id', courseIds)
      .eq('is_active', true)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching announcements:', error);
      return { success: false, error: 'Failed to fetch announcements' };
    }

    // Get enrolled courses for filter
    const { data: courses } = await supabase
      .from('courses')
      .select('id, title')
      .in('id', courseIds)
      .order('title');

    return {
      success: true,
      announcements: announcements || [],
      courses: courses || [],
    };
  } catch (error) {
    console.error('Unexpected error in getStudentAnnouncements:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Get announcement by ID
export async function getAnnouncementById(announcementId) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return { success: false, error: 'You must be logged in' };
    }

    const { data: userData } = await supabase
      .from('user')
      .select('id, role')
      .eq('email', session.user.email)
      .single();

    if (!userData) {
      return { success: false, error: 'User not found' };
    }

    // Get the announcement
    const { data: announcement, error } = await supabase
      .from('announcements')
      .select(
        `
        *,
        courses (
          id,
          title
        )
      `
      )
      .eq('id', announcementId)
      .single();

    if (error || !announcement) {
      return { success: false, error: 'Announcement not found' };
    }

    // Check permissions
    if (userData.role === 'instructor') {
      // Instructors can only view their own announcements
      if (announcement.instructor_id !== userData.id) {
        return { success: false, error: 'Permission denied' };
      }
    } else {
      // Students can only view announcements from enrolled courses
      const { data: enrollment } = await supabase
        .from('enrollments')
        .select('id')
        .eq('student_id', userData.id)
        .eq('course_id', announcement.course_id)
        .single();

      if (!enrollment) {
        return { success: false, error: 'Permission denied' };
      }
    }

    return { success: true, data: announcement };
  } catch (error) {
    console.error('Unexpected error in getAnnouncementById:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
