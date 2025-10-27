'use server';

import { supabaseServer as supabase } from '@/app/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function toggleBookmark(userId: string, courseId: string) {
  try {
    // Use RPC function for atomic toggle operation (race condition prevention)
    // Pass userId as parameter (SERVICE_ROLE_KEY environment doesn't have auth.uid())
    const { data: isBookmarked, error } = await supabase.rpc(
      'toggle_bookmark',
      {
        p_user_id: userId,
        p_course_id: courseId,
      }
    );

    if (error) throw error;

    // Revalidate pages to update bookmark status
    revalidatePath('/all-courses');
    revalidatePath(`/course-details/${courseId}`);
    revalidatePath('/dashboard');

    return { success: true, bookmarked: isBookmarked };
  } catch (error) {
    console.error('Error toggling bookmark:', error);
    return { success: false, error };
  }
}

export async function checkBookmarkStatus(userId: string, courseId: string) {
  try {
    const { data } = await supabase
      .from('bookmarks')
      .select('course_id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single();

    return { bookmarked: !!data };
  } catch {
    return { bookmarked: false };
  }
}

export async function getUserBookmarks(userId: string) {
  try {
    const { data, error } = await supabase
      .from('bookmarks')
      .select(
        `
        course_id,
        created_at,
        courses (
          id,
          title,
          description,
          thumbnail_url,
          price,
          difficulty_level,
          total_duration_hours,
          total_duration_minutes,
          user!courses_instructor_id_fkey (
            id,
            name,
            avatar_url
          )
        )
      `
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform the data to ensure user is an object
    const transformedData =
      data?.map((bookmark) => {
        const courseData = bookmark.courses as any;
        return {
          course_id: bookmark.course_id,
          created_at: bookmark.created_at,
          courses: {
            ...courseData,
            user: Array.isArray(courseData?.user)
              ? courseData.user[0]
              : courseData?.user,
          },
        };
      }) || [];

    return transformedData;
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    return [];
  }
}

export async function removeBookmark(courseId: string, userId: string) {
  try {
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('course_id', courseId)
      .eq('user_id', userId);

    if (error) throw error;

    // Revalidate pages to update bookmark status
    revalidatePath('/all-courses');
    revalidatePath(`/course-details/${courseId}`);
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error) {
    console.error('Error removing bookmark:', error);
    return { success: false, error };
  }
}
