'use server';

import { supabaseServer as supabase } from '@/app/lib/supabase/server';

interface StudentStats {
  enrolledCourses: number;
  activeCourses: number;
  completedCourses: number;
  bookmarkedCourses: number;
  totalProgress: number;
}

interface EnrolledCourse {
  id: string;
  course_id: string;
  progress: number;
  enrolled_at: string;
  last_accessed_at: string | null;
  status: 'active' | 'completed' | 'paused';
  course: {
    id: string;
    title: string;
    description: string;
    thumbnail_url: string | null;
    instructor_id: string;
    instructor: {
      id: string;
      name: string;
      avatar_url: string | null;
    };
    total_lessons: number;
  };
  completed_lessons: number;
}

interface BookmarkedCourse {
  id: string;
  course_id: string;
  bookmarked_at: string;
  course: {
    id: string;
    title: string;
    description: string;
    thumbnail_url: string | null;
    price: number;
    instructor: {
      id: string;
      name: string;
    };
  };
}

export async function getStudentDashboardStats(
  userId: string
): Promise<StudentStats> {
  try {
    // Get enrolled courses count
    const { data: enrollments, error: enrollmentError } = await supabase
      .from('enrollments')
      .select('id, status')
      .eq('user_id', userId);

    if (enrollmentError) {
      console.error('Error fetching enrollments:', enrollmentError);
      throw enrollmentError;
    }

    const enrolledCourses = enrollments?.length || 0;
    const activeCourses =
      enrollments?.filter((e) => e.status === 'active').length || 0;
    const completedCourses =
      enrollments?.filter((e) => e.status === 'completed').length || 0;

    // Get bookmarked courses count (we'll create this table if it doesn't exist)
    const { data: bookmarks, error: bookmarkError } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('user_id', userId);

    // If bookmarks table doesn't exist, just return 0
    const bookmarkedCourses = bookmarkError ? 0 : bookmarks?.length || 0;

    // Calculate total progress
    const { data: progressData } = await supabase
      .from('enrollments')
      .select('progress')
      .eq('user_id', userId)
      .eq('status', 'active');

    const totalProgress =
      progressData && progressData.length > 0
        ? Math.round(
            progressData.reduce((acc, curr) => acc + (curr.progress || 0), 0) /
              progressData.length
          )
        : 0;

    return {
      enrolledCourses,
      activeCourses,
      completedCourses,
      bookmarkedCourses,
      totalProgress,
    };
  } catch (error) {
    console.error('Error in getStudentDashboardStats:', error);
    // Return default values on error
    return {
      enrolledCourses: 0,
      activeCourses: 0,
      completedCourses: 0,
      bookmarkedCourses: 0,
      totalProgress: 0,
    };
  }
}

export async function getEnrolledCourses(
  userId: string
): Promise<EnrolledCourse[]> {
  try {
    // First get enrollments with course details
    const { data: enrollments, error } = await supabase
      .from('enrollments')
      .select(
        `
        id,
        course_id,
        progress,
        enrolled_at,
        last_accessed_at,
        status,
        courses (
          id,
          title,
          description,
          thumbnail_url,
          instructor_id
        )
      `
      )
      .eq('user_id', userId)
      .order('last_accessed_at', { ascending: false, nullsFirst: false });

    if (error) {
      console.error('Error fetching enrolled courses:', error);
      throw error;
    }

    if (!enrollments || enrollments.length === 0) {
      return [];
    }

    // Get instructor details and lesson counts
    const enrichedCourses = await Promise.all(
      enrollments.map(async (enrollment) => {
        // Get instructor details
        const courseData = enrollment.courses as any;
        const { data: instructor } = await supabase
          .from('user')
          .select('id, name, avatar_url')
          .eq('id', courseData?.instructor_id ?? '')
          .single();

        // Get total lessons count
        const { count: totalLessons } = await supabase
          .from('lessons')
          .select('*', { count: 'exact', head: true })
          .eq('course_id', enrollment.course_id);

        // Get completed lessons count
        const { count: completedLessons } = await supabase
          .from('lesson_progress')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('course_id', enrollment.course_id)
          .eq('completed', true);

        return {
          ...enrollment,
          course: {
            ...courseData,
            instructor: instructor || {
              id: courseData?.instructor_id ?? '',
              name: 'Unknown',
              avatar_url: null,
            },
            total_lessons: totalLessons ?? 0,
          },
          completed_lessons: completedLessons ?? 0,
        };
      })
    );

    return enrichedCourses;
  } catch (error) {
    console.error('Error in getEnrolledCourses:', error);
    return [];
  }
}

export async function getBookmarkedCourses(
  userId: string
): Promise<BookmarkedCourse[]> {
  try {
    const { data: bookmarks, error } = await supabase
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
          user!courses_instructor_id_fkey (
            id,
            name
          )
        )
      `
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bookmarked courses:', error);
      // If bookmarks table doesn't exist, return empty array
      return [];
    }

    return (
      bookmarks?.map((bookmark) => {
        const courseData = bookmark.courses as any;
        return {
          id: bookmark.id,
          course_id: bookmark.course_id,
          bookmarked_at: bookmark.created_at,
          course: {
            ...courseData,
            instructor: courseData?.user ?? {
              id: '',
              name: 'Unknown',
            },
          },
        };
      }) || []
    );
  } catch (error) {
    console.error('Error in getBookmarkedCourses:', error);
    return [];
  }
}

export async function getNextLessonRecommendation(userId: string) {
  try {
    // Get the most recently accessed active course
    const { data: recentEnrollment } = await supabase
      .from('enrollments')
      .select(
        `
        course_id,
        courses (
          id,
          title
        )
      `
      )
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('last_accessed_at', { ascending: false, nullsFirst: false })
      .limit(1)
      .single();

    if (!recentEnrollment) {
      return null;
    }

    // Get the next incomplete lesson
    const { data: lessons } = await supabase
      .from('lessons')
      .select('id, title, order_index')
      .eq('course_id', recentEnrollment.course_id)
      .order('order_index', { ascending: true });

    if (!lessons || lessons.length === 0) {
      return null;
    }

    // Get completed lessons
    const { data: completedLessons } = await supabase
      .from('lesson_progress')
      .select('lesson_id')
      .eq('user_id', userId)
      .eq('course_id', recentEnrollment.course_id)
      .eq('completed', true);

    const completedLessonIds =
      completedLessons?.map((cl) => cl.lesson_id) || [];

    // Find the first incomplete lesson
    const nextLesson = lessons.find(
      (lesson) => !completedLessonIds.includes(lesson.id)
    );

    if (nextLesson) {
      const courseData = recentEnrollment.courses as any;
      return {
        lesson: nextLesson,
        course: courseData,
      };
    }

    return null;
  } catch (error) {
    console.error('Error getting next lesson recommendation:', error);
    return null;
  }
}

export async function updateLastAccessedCourse(
  userId: string,
  courseId: string
) {
  try {
    const { error } = await supabase
      .from('enrollments')
      .update({ last_accessed_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('course_id', courseId);

    if (error) {
      console.error('Error updating last accessed:', error);
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Error in updateLastAccessedCourse:', error);
    return { success: false, error };
  }
}
