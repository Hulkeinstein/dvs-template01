'use server';

import { supabaseServer as supabase } from '@/app/lib/supabase/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth.config';
import type {
  EnrolledStudent,
  EnrollmentSummary,
  GetEnrolledStudentsResponse,
  ErrorResponse,
  StudentProfile,
  CourseInfo,
} from '@/types/enrollment';

/**
 * Get all students enrolled in courses taught by the current instructor
 * @returns Promise with enrolled students data and summary statistics
 */
export async function getInstructorEnrolledStudents(): Promise<
  GetEnrolledStudentsResponse | ErrorResponse
> {
  try {
    // Get current user session
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return {
        error: 'Unauthorized',
        message: 'You must be logged in to view enrolled students',
      };
    }

    // Get user from Supabase
    const { data: userData, error: userError } = await supabase
      .from('user')
      .select('id, role')
      .eq('email', session.user.email)
      .single();

    if (userError || !userData) {
      return {
        error: 'User not found',
        message: 'Could not find user in database',
      };
    }

    if (userData.role !== 'instructor' && userData.role !== 'admin') {
      return {
        error: 'Unauthorized',
        message: 'Only instructors can view enrolled students',
      };
    }

    const instructorId = userData.id;

    // First, get all courses taught by this instructor
    const { data: instructorCourses, error: coursesError } = await supabase
      .from('courses')
      .select('id')
      .eq('instructor_id', instructorId);

    if (coursesError) {
      console.error('Error fetching instructor courses:', coursesError);
      return {
        error: 'Failed to fetch courses',
        message: coursesError.message,
      };
    }

    if (!instructorCourses || instructorCourses.length === 0) {
      // No courses, return empty result
      return {
        students: [],
        summary: {
          total: 0,
          enrolled: 0,
          active: 0,
          completed: 0,
          dropped: 0,
        },
      };
    }

    // Extract course IDs
    const courseIds = instructorCourses.map((course) => course.id);

    // Fetch all enrollments for instructor's courses with student and course details
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from('enrollments')
      .select(
        `
        id,
        user_id,
        course_id,
        enrolled_at,
        completed_at,
        progress,
        last_accessed_at,
        certificate_issued_at,
        status,
        created_at,
        updated_at,
        user:user_id (
          id,
          email,
          name,
          first_name,
          last_name,
          avatar_url,
          username,
          phone,
          bio
        ),
        course:course_id (
          id,
          title,
          thumbnail_url,
          instructor_id,
          category,
          difficulty_level,
          total_duration_hours,
          total_duration_minutes
        )
      `
      )
      .in('course_id', courseIds)
      .order('enrolled_at', { ascending: false });

    if (enrollmentsError) {
      console.error('Error fetching enrollments:', enrollmentsError);
      return {
        error: 'Failed to fetch enrollments',
        message: enrollmentsError.message,
      };
    }

    // Transform the data into the expected format
    const enrolledStudents: EnrolledStudent[] = (enrollments || []).map(
      (enrollment) => ({
        enrollment: {
          id: enrollment.id,
          user_id: enrollment.user_id,
          course_id: enrollment.course_id,
          enrolled_at: enrollment.enrolled_at,
          completed_at: enrollment.completed_at,
          progress: enrollment.progress || 0,
          last_accessed_at: enrollment.last_accessed_at,
          certificate_issued_at: enrollment.certificate_issued_at,
          status: enrollment.status,
          created_at: enrollment.created_at,
          updated_at: enrollment.updated_at,
        },
        student: (enrollment.user as any as StudentProfile) || {
          id: enrollment.user_id,
          email: 'Unknown',
          name: null,
          first_name: null,
          last_name: null,
          avatar_url: null,
          username: null,
          phone: null,
          bio: null,
        },
        course: (enrollment.course as any as CourseInfo) || {
          id: enrollment.course_id,
          title: 'Unknown Course',
          thumbnail_url: null,
          instructor_id: instructorId,
          category: null,
          difficulty_level: null,
          total_duration_hours: null,
          total_duration_minutes: null,
        },
      })
    );

    // Calculate summary statistics
    const summary: EnrollmentSummary = {
      total: enrolledStudents.length,
      enrolled: 0,
      active: 0,
      completed: 0,
      dropped: 0,
    };

    enrolledStudents.forEach((student) => {
      const { status, progress } = student.enrollment;

      if (status === 'dropped') {
        summary.dropped++;
      } else if (status === 'completed' || progress === 100) {
        summary.completed++;
      } else if (progress > 0 && progress < 100) {
        summary.active++;
      } else if (progress === 0) {
        summary.enrolled++;
      }
    });

    return {
      students: enrolledStudents,
      summary,
    };
  } catch (error) {
    console.error('Unexpected error in getInstructorEnrolledStudents:', error);
    return {
      error: 'Unexpected error',
      message:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

/**
 * Get students enrolled in a specific course
 * @param courseId - The ID of the course
 * @returns Promise with enrolled students data and summary statistics
 */
export async function getEnrolledStudentsByCourse(
  courseId: string
): Promise<GetEnrolledStudentsResponse | ErrorResponse> {
  try {
    // Get current user session
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return {
        error: 'Unauthorized',
        message: 'You must be logged in to view enrolled students',
      };
    }

    // Get user from Supabase
    const { data: userData, error: userError } = await supabase
      .from('user')
      .select('id, role')
      .eq('email', session.user.email)
      .single();

    if (userError || !userData) {
      return {
        error: 'User not found',
        message: 'Could not find user in database',
      };
    }

    if (userData.role !== 'instructor' && userData.role !== 'admin') {
      return {
        error: 'Unauthorized',
        message: 'Only instructors can view enrolled students',
      };
    }

    const instructorId = userData.id;

    // Verify that this course belongs to the instructor
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, instructor_id')
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      return {
        error: 'Course not found',
        message: 'The specified course does not exist',
      };
    }

    if (course.instructor_id !== instructorId) {
      return {
        error: 'Unauthorized',
        message: 'You can only view students for your own courses',
      };
    }

    // Fetch enrollments for this course
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from('enrollments')
      .select(
        `
        id,
        user_id,
        course_id,
        enrolled_at,
        completed_at,
        progress,
        last_accessed_at,
        certificate_issued_at,
        status,
        created_at,
        updated_at,
        user:user_id (
          id,
          email,
          name,
          first_name,
          last_name,
          avatar_url,
          username,
          phone,
          bio
        ),
        course:course_id (
          id,
          title,
          thumbnail_url,
          instructor_id,
          category,
          difficulty_level,
          total_duration_hours,
          total_duration_minutes
        )
      `
      )
      .eq('course_id', courseId)
      .order('enrolled_at', { ascending: false });

    if (enrollmentsError) {
      console.error('Error fetching enrollments:', enrollmentsError);
      return {
        error: 'Failed to fetch enrollments',
        message: enrollmentsError.message,
      };
    }

    // Transform the data into the expected format
    const enrolledStudents: EnrolledStudent[] = (enrollments || []).map(
      (enrollment) => ({
        enrollment: {
          id: enrollment.id,
          user_id: enrollment.user_id,
          course_id: enrollment.course_id,
          enrolled_at: enrollment.enrolled_at,
          completed_at: enrollment.completed_at,
          progress: enrollment.progress || 0,
          last_accessed_at: enrollment.last_accessed_at,
          certificate_issued_at: enrollment.certificate_issued_at,
          status: enrollment.status,
          created_at: enrollment.created_at,
          updated_at: enrollment.updated_at,
        },
        student: (enrollment.user as any as StudentProfile) || {
          id: enrollment.user_id,
          email: 'Unknown',
          name: null,
          first_name: null,
          last_name: null,
          avatar_url: null,
          username: null,
          phone: null,
          bio: null,
        },
        course: (enrollment.course as any as CourseInfo) || {
          id: enrollment.course_id,
          title: 'Unknown Course',
          thumbnail_url: null,
          instructor_id: instructorId,
          category: null,
          difficulty_level: null,
          total_duration_hours: null,
          total_duration_minutes: null,
        },
      })
    );

    // Calculate summary statistics
    const summary: EnrollmentSummary = {
      total: enrolledStudents.length,
      enrolled: 0,
      active: 0,
      completed: 0,
      dropped: 0,
    };

    enrolledStudents.forEach((student) => {
      const { status, progress } = student.enrollment;

      if (status === 'dropped') {
        summary.dropped++;
      } else if (status === 'completed' || progress === 100) {
        summary.completed++;
      } else if (progress > 0 && progress < 100) {
        summary.active++;
      } else if (progress === 0) {
        summary.enrolled++;
      }
    });

    return {
      students: enrolledStudents,
      summary,
    };
  } catch (error) {
    console.error('Unexpected error in getEnrolledStudentsByCourse:', error);
    return {
      error: 'Unexpected error',
      message:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}
