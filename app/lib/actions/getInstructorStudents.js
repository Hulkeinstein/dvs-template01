'use server';

import { supabaseServer as supabase } from '@/app/lib/supabase/server';

export async function getInstructorStudents(instructorId) {
  try {
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('id, title')
      .eq('instructor_id', instructorId);

    if (coursesError) {
      console.error('Error fetching courses:', coursesError);
      return { students: [], courses: [] };
    }

    if (!courses || courses.length === 0) {
      return { students: [], courses: [] };
    }

    const courseIds = courses.map((course) => course.id);

    const { data: enrollments, error: enrollmentsError } = await supabase
      .from('enrollments')
      .select(
        `
        enrolled_at,
        progress,
        course_id,
        user:user_id (
          id,
          name,
          email,
          phone,
          is_phone_verified,
          is_profile_complete,
          created_at
        ),
        course:course_id (
          id,
          title
        )
      `
      )
      .in('course_id', courseIds)
      .order('enrolled_at', { ascending: false });

    if (enrollmentsError) {
      console.error('Error fetching enrollments:', enrollmentsError);
      return { students: [], courses: [] };
    }

    const students = enrollments.map((enrollment) => ({
      id: enrollment.user.id,
      name: enrollment.user.name || 'No Name',
      email: enrollment.user.email,
      phone: enrollment.user.phone || '-',
      phoneVerified: enrollment.user.is_phone_verified,
      profileComplete: enrollment.user.is_profile_complete,
      enrolledAt: enrollment.enrolled_at,
      progress: enrollment.progress || 0,
      courseId: enrollment.course_id,
      courseTitle: enrollment.course.title,
      createdAt: enrollment.user.created_at,
    }));

    return { students, courses };
  } catch (error) {
    console.error('Error in getInstructorStudents:', error);
    return { students: [], courses: [] };
  }
}
