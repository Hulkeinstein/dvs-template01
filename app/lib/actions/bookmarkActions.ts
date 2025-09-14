'use server';

import { supabaseServer as supabase } from '@/app/lib/supabase/server';

export async function toggleBookmark(userId: string, courseId: string) {
  try {
    // Check if bookmark exists
    const { data: existingBookmark } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single();

    if (existingBookmark) {
      // Remove bookmark
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', existingBookmark.id);

      if (error) throw error;

      return { success: true, bookmarked: false };
    } else {
      // Add bookmark
      const { error } = await supabase.from('bookmarks').insert({
        user_id: userId,
        course_id: courseId,
      });

      if (error) throw error;

      return { success: true, bookmarked: true };
    }
  } catch (error) {
    console.error('Error toggling bookmark:', error);
    return { success: false, error };
  }
}

export async function checkBookmarkStatus(userId: string, courseId: string) {
  try {
    const { data } = await supabase
      .from('bookmarks')
      .select('id')
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
        id,
        course_id,
        created_at,
        courses (
          id,
          title,
          description,
          thumbnail_url,
          price,
          level,
          duration,
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
          ...bookmark,
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

export async function removeBookmark(bookmarkId: string, userId: string) {
  try {
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('id', bookmarkId)
      .eq('user_id', userId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error removing bookmark:', error);
    return { success: false, error };
  }
}
