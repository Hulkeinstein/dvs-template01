'use server';

import { supabaseServer as supabase } from '@/app/lib/supabase/server';
import { supabaseAdmin } from '@/app/lib/supabase/admin';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth.config';
import { revalidatePath } from 'next/cache';
import { BADGE_CONFIG } from '@/app/lib/constants/badgeConfig';
import { ROUTES } from '@/app/lib/constants/routes';
import {
  mapFormDataToDB,
  mapFormDataToSettings,
  logUnmappedFields,
} from '@/app/lib/utils/courseDataMapper';

// =========================================================================
// Type Definitions
// =========================================================================

export interface ActionResult<T = unknown> {
  success?: boolean;
  error?: string;
  data?: T;
  lessonId?: string;
  course?: unknown;
  message?: string;
  [key: string]: unknown;
}

export interface CourseSummary {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  thumbnail_url?: string | null;
  status?: string;
  is_free?: boolean;
  regular_price?: number | null;
  discounted_price?: number | null;
  instructor_id?: string;
  instructor?: {
    id: string;
    name: string;
    avatar_url?: string | null;
  };
}

export interface CourseFilter {
  q?: string; // Search query
  instructorId?: string; // Filter by instructor
  status?: string[]; // Filter by status
  limit?: number; // Pagination limit
  offset?: number; // Pagination offset
}

export interface CourseBadge {
  badge_type: string;
  priority: number;
}

export interface CourseFormData {
  title: string;
  description?: string;
  category?: string;
  difficulty_level?: string;
  regular_price?: number;
  discounted_price?: number;
  is_free?: boolean;
  thumbnail_url?: string;
  [key: string]: unknown; // For additional form fields
}

export interface CreateCourseResult {
  error?: string;
  success?: boolean;
  courseId?: string;
}

export interface UpdateCourseResult {
  error?: string;
  success?: boolean;
}

export interface DeleteCourseResult {
  success: boolean;
  error?: string;
}

// =========================================================================
// Course CRUD Operations
// =========================================================================

// Create a new course
export async function createCourse(
  formData: CourseFormData
): Promise<CreateCourseResult> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return { error: 'You must be logged in to create a course' };
    }

    // Remove debug table schema check

    // Get user ID from Supabase
    const { data: userData, error: userError } = await supabase
      .from('user')
      .select('id, role')
      .eq('email', session.user.email)
      .single();

    if (userError || !userData) {
      return { error: 'User not found' };
    }

    // Admin도 코스 생성 가능
    if (userData.role !== 'instructor' && userData.role !== 'admin') {
      return { error: 'Only instructors and admins can create courses' };
    }

    // slug 생성 (title에서 자동 생성)
    const createSlug = (title: string) => {
      return (
        title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
          .substring(0, 100) +
        '-' +
        Date.now()
      );
    };

    // Create course - mapper를 사용하여 데이터 변환
    const mappedData = mapFormDataToDB(formData);
    const courseData = {
      instructor_id: userData.id,
      slug: createSlug(formData.title),
      status: 'draft',
      is_public: false,
      enable_qa: false,
      ...mappedData,
    };

    if (process.env.NODE_ENV === 'development') {
      console.log('Course data to insert:', {
        ...courseData,
        thumbnail_url: courseData.thumbnail_url
          ? `[URL: ${courseData.thumbnail_url.substring(0, 50)}...]`
          : 'none',
      });
    }

    const { data: course, error: courseError } = await supabase
      .from('courses')
      .insert(courseData)
      .select()
      .single();

    if (courseError) {
      console.error('Course creation error - Full details:', {
        error: courseError,
        message: courseError.message,
        details: courseError.details,
        hint: courseError.hint,
        code: courseError.code,
      });
      return {
        error: `Failed to create course: ${courseError.message || 'Unknown error'}`,
      };
    }

    // Create course settings - mapper를 사용하여 데이터 변환
    const settingsData = {
      course_id: course.id,
      ...mapFormDataToSettings(formData),
    };

    const { error: settingsError } = await supabase
      .from('course_settings')
      .insert(settingsData);

    if (settingsError) {
      console.error('Settings creation error:', settingsError);
      // Don't fail the whole operation if settings fail
    }

    // Create topics and lessons
    const topics = (formData as any).topics;
    if (topics && Array.isArray(topics) && topics.length > 0) {
      for (let topicIndex = 0; topicIndex < topics.length; topicIndex++) {
        const topic = topics[topicIndex];

        // Create topic
        const { data: topicData, error: topicError } = await supabase
          .from('course_topics')
          .insert({
            course_id: course.id,
            title: topic.name,
            description: topic.summary,
            sort_order: topicIndex + 1 + 1,
          })
          .select()
          .single();

        if (topicError) {
          console.error('Topic creation error:', topicError);
          continue;
        }

        // Create lessons for this topic
        if (topic.lessons && topic.lessons.length > 0) {
          for (
            let lessonIndex = 0;
            lessonIndex < topic.lessons.length;
            lessonIndex++
          ) {
            const lesson = topic.lessons[lessonIndex];

            const { error: lessonError } = await supabase
              .from('lessons')
              .insert({
                course_id: course.id,
                topic_id: topicData.id,
                title: lesson.title,
                description: lesson.description,
                video_url: lesson.videoUrl,
                video_source: lesson.videoSource || 'youtube',
                duration_minutes: Math.floor(lesson.duration / 60) || 0,
                sort_order: lessonIndex + 1,
                is_preview: lesson.enablePreview || false,
                content_type: 'video',
              });

            if (lessonError) {
              console.error('Lesson creation error:', lessonError);
            }
          }
        }
      }
    }

    revalidatePath(ROUTES.INSTRUCTOR.COURSES);
    revalidatePath('/courses'); // TODO: Add to ROUTES

    return { success: true, courseId: course.id };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Unexpected error:', error);
    }
    return { error: 'An unexpected error occurred' };
  }
}

// Update course information
export async function updateCourse(
  courseId: string,
  formData: any
): Promise<ActionResult<void>> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return { error: 'You must be logged in to update a course' };
    }

    // Get user ID and verify ownership
    const { data: userData, error: userError } = await supabase
      .from('user')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (userError || !userData) {
      return { error: 'User not found' };
    }

    // Verify the user owns this course
    const { data: courseCheck, error: checkError } = await supabase
      .from('courses')
      .select('instructor_id')
      .eq('id', courseId)
      .single();

    if (
      checkError ||
      !courseCheck ||
      courseCheck.instructor_id !== userData.id
    ) {
      return { error: 'You do not have permission to update this course' };
    }

    // Update course - mapper를 사용하여 데이터 변환
    const courseData = mapFormDataToDB(formData);

    // 디버깅: 매핑되지 않은 필드 확인
    if (process.env.NODE_ENV === 'development') {
      logUnmappedFields(formData, courseData);
    }

    console.log('Updating course with data:', {
      ...courseData,
      thumbnail_url: courseData.thumbnail_url
        ? `[URL: ${courseData.thumbnail_url.substring(0, 50)}...]`
        : 'none',
    });

    const { error: updateError } = await supabase
      .from('courses')
      .update(courseData)
      .eq('id', courseId);

    if (updateError) {
      console.error('Course update error - Full details:', {
        error: updateError,
        message: updateError.message,
        details: updateError.details,
        hint: updateError.hint,
        code: updateError.code,
      });
      return {
        error: `Failed to update course: ${updateError.message || 'Unknown error'}`,
      };
    }

    // Update settings - mapper를 사용하여 데이터 변환
    const settingsData = mapFormDataToSettings(formData);

    await supabase
      .from('course_settings')
      .update(settingsData)
      .eq('course_id', courseId);

    // Update topics and lessons
    if (formData.topics && formData.topics.length > 0) {
      console.log(
        'Updating topics and lessons. Topics count:',
        formData.topics.length
      );

      // Get existing topics
      const { data: existingTopics } = await supabase
        .from('course_topics')
        .select('id')
        .eq('course_id', courseId);

      // Delete existing topics (and their lessons will be deleted by cascade)
      if (existingTopics && existingTopics.length > 0) {
        console.log('Deleting existing topics:', existingTopics.length);
        const { error: deleteError } = await supabase
          .from('course_topics')
          .delete()
          .eq('course_id', courseId);

        if (deleteError) {
          console.error('Error deleting topics:', deleteError);
        }
      }

      // Also delete any orphan lessons (lessons without topic_id)
      const { error: deleteOrphanError } = await supabase
        .from('lessons')
        .delete()
        .eq('course_id', courseId)
        .is('topic_id', null);

      if (deleteOrphanError) {
        console.error('Error deleting orphan lessons:', deleteOrphanError);
      }

      // Create new topics and lessons
      for (
        let topicIndex = 0;
        topicIndex < formData.topics.length;
        topicIndex++
      ) {
        const topic = formData.topics[topicIndex];
        console.log(
          `Creating topic ${topicIndex + 1}:`,
          topic.name,
          'with',
          topic.lessons?.length || 0,
          'lessons'
        );

        // Skip general-topic as it's a placeholder
        if (topic.id === 'general-topic') {
          // Create lessons without topic_id for general topics
          if (topic.lessons && topic.lessons.length > 0) {
            for (
              let lessonIndex = 0;
              lessonIndex < topic.lessons.length;
              lessonIndex++
            ) {
              const lesson = topic.lessons[lessonIndex];
              console.log(`Creating lesson without topic: ${lesson.title}`);

              const lessonData = {
                course_id: courseId,
                topic_id: null,
                title: lesson.title,
                description: lesson.description || lesson.summary || '',
                video_url: lesson.videoUrl || '',
                video_source: lesson.videoSource || 'youtube',
                duration_minutes:
                  typeof lesson.duration === 'number' ? lesson.duration : 0,
                sort_order: lessonIndex + 1,
                is_preview: lesson.enablePreview || false,
                content_type: lesson.content_type || 'video',
                thumbnail_url: lesson.thumbnail || null,
                attachments: lesson.attachments || [],
                // Add content_data for quiz and assignment types
                ...(lesson.content_type === 'quiz' && lesson.questions
                  ? {
                      content_data: {
                        questions: lesson.questions,
                        settings: lesson.settings || {},
                        metadata: lesson.metadata || {},
                      },
                    }
                  : {}),
                ...(lesson.content_type === 'assignment'
                  ? {
                      content_data: {
                        summary: lesson.summary || '',
                        timeLimit: lesson.timeLimit || {
                          value: 0,
                          unit: 'weeks',
                        },
                        totalPoints: lesson.totalPoints || 100,
                        passingPoints: lesson.passingPoints || 70,
                        maxUploads: lesson.maxUploads || 1,
                        maxFileSize: lesson.maxFileSize || 10,
                        attachments: lesson.attachments || [],
                      },
                    }
                  : {}),
              };

              console.log('Lesson data to insert:', lessonData);

              const { data: lessonResult, error: lessonError } = await supabase
                .from('lessons')
                .insert(lessonData)
                .select()
                .single();

              if (lessonError) {
                if (process.env.NODE_ENV === 'development') {
                  console.error('Lesson creation error:', lessonError);
                  console.error('Failed lesson data:', lessonData);
                }
              } else if (process.env.NODE_ENV === 'development') {
                console.log('Lesson created successfully:', lessonResult.id);
              }
            }
          }
          continue;
        }

        // Create topic
        const { data: topicData, error: topicError } = await supabase
          .from('course_topics')
          .insert({
            course_id: courseId,
            title: topic.name,
            description: topic.summary || '',
            sort_order: topicIndex + 1,
          })
          .select()
          .single();

        if (topicError) {
          if (process.env.NODE_ENV === 'development') {
            console.error('Topic creation error:', topicError);
          }
          continue;
        }

        if (process.env.NODE_ENV === 'development') {
          console.log('Topic created:', topicData.id);
        }

        // Create lessons for this topic
        if (topic.lessons && topic.lessons.length > 0) {
          for (
            let lessonIndex = 0;
            lessonIndex < topic.lessons.length;
            lessonIndex++
          ) {
            const lesson = topic.lessons[lessonIndex];
            if (process.env.NODE_ENV === 'development') {
              console.log(
                `Creating lesson ${lessonIndex + 1} for topic:`,
                lesson.title
              );
            }

            const lessonData = {
              course_id: courseId,
              topic_id: topicData.id,
              title: lesson.title,
              description: lesson.description || lesson.summary || '',
              video_url: lesson.videoUrl || '',
              video_source: lesson.videoSource || 'youtube',
              duration_minutes:
                typeof lesson.duration === 'number' ? lesson.duration : 0,
              sort_order: lessonIndex,
              is_preview: lesson.enablePreview || false,
              content_type: lesson.content_type || 'video',
              thumbnail_url: lesson.thumbnail || null,
              attachments: lesson.attachments || [],
              // Add content_data for quiz and assignment types
              ...(lesson.content_type === 'quiz' && lesson.questions
                ? {
                    content_data: {
                      questions: lesson.questions,
                      settings: lesson.settings || {},
                      metadata: lesson.metadata || {},
                    },
                  }
                : {}),
              ...(lesson.content_type === 'assignment'
                ? {
                    content_data: {
                      summary: lesson.summary || '',
                      timeLimit: lesson.timeLimit || {
                        value: 0,
                        unit: 'weeks',
                      },
                      totalPoints: lesson.totalPoints || 100,
                      passingPoints: lesson.passingPoints || 70,
                      maxUploads: lesson.maxUploads || 1,
                      maxFileSize: lesson.maxFileSize || 10,
                      attachments: lesson.attachments || [],
                    },
                  }
                : {}),
            };

            console.log('Lesson data to insert:', lessonData);

            const { data: lessonResult, error: lessonError } = await supabase
              .from('lessons')
              .insert(lessonData)
              .select()
              .single();

            if (lessonError) {
              console.error('Lesson creation error:', lessonError);
              console.error('Failed lesson data:', lessonData);
            } else {
              console.log('Lesson created successfully:', lessonResult.id);
            }
          }
        }
      }

      console.log('Topics and lessons update completed');
    }

    revalidatePath(`/courses/${courseId}`);
    revalidatePath(ROUTES.INSTRUCTOR.COURSES);
    revalidatePath(ROUTES.INSTRUCTOR.CREATE_COURSE);

    return { success: true };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Unexpected error:', error);
    }
    return { error: 'An unexpected error occurred' };
  }
}

// Add a lesson to a course
export async function addLesson(
  courseId: string,
  lessonData: Record<string, unknown>
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return { error: 'You must be logged in to add lessons' };
    }

    // Verify ownership
    const { data: userData, error: userError } = await supabase
      .from('user')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (userError || !userData) {
      return { error: 'User not found' };
    }

    const { data: courseCheck, error: checkError } = await supabase
      .from('courses')
      .select('instructor_id')
      .eq('id', courseId)
      .single();

    if (
      checkError ||
      !courseCheck ||
      courseCheck.instructor_id !== userData.id
    ) {
      return {
        error: 'You do not have permission to add lessons to this course',
      };
    }

    // Get the current max order index
    const { data: maxOrderData } = await supabase
      .from('lessons')
      .select('order_index')
      .eq('course_id', courseId)
      .order('order_index', { ascending: false })
      .limit(1);

    const nextOrder =
      maxOrderData && maxOrderData.length > 0
        ? maxOrderData[0].order_index + 1
        : 1;

    // Add lesson
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .insert({
        course_id: courseId,
        title: lessonData.title,
        description: lessonData.description,
        video_url: lessonData.videoUrl,
        duration_minutes: (lessonData as any).duration
          ? parseInt((lessonData as any).duration)
          : null,
        order_index: nextOrder,
        is_preview: lessonData.isPreview || false,
      })
      .select()
      .single();

    if (lessonError) {
      console.error('Lesson creation error:', lessonError);
      return { error: 'Failed to add lesson' };
    }

    revalidatePath(`/courses/${courseId}`);

    return { success: true, lessonId: lesson.id };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Unexpected error:', error);
    }
    return { error: 'An unexpected error occurred' };
  }
}

// Delete a lesson
export async function deleteLesson(
  lessonId: string
): Promise<ActionResult<void>> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return { error: 'You must be logged in to delete lessons' };
    }

    // Get lesson details and verify ownership
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .select('course_id, courses!inner(instructor_id)')
      .eq('id', lessonId)
      .single();

    if (lessonError || !lesson) {
      return { error: 'Lesson not found' };
    }

    const { data: userData } = await supabase
      .from('user')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (!userData || (lesson.courses as any).instructor_id !== userData.id) {
      return { error: 'You do not have permission to delete this lesson' };
    }

    // Delete lesson
    const { error: deleteError } = await supabase
      .from('lessons')
      .delete()
      .eq('id', lessonId);

    if (deleteError) {
      console.error('Lesson deletion error:', deleteError);
      return { error: 'Failed to delete lesson' };
    }

    revalidatePath(`/courses/${lesson.course_id}`);

    return { success: true };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Unexpected error:', error);
    }
    return { error: 'An unexpected error occurred' };
  }
}

// Publish or unpublish a course
export async function updateCourseStatus(
  courseId: string,
  status: string
): Promise<ActionResult<void>> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return { error: 'You must be logged in to update course status' };
    }

    // Verify ownership
    const { data: userData } = await supabase
      .from('user')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (!userData) {
      return { error: 'User not found' };
    }

    const { data: courseCheck } = await supabase
      .from('courses')
      .select('instructor_id')
      .eq('id', courseId)
      .single();

    if (!courseCheck || courseCheck.instructor_id !== userData.id) {
      return { error: 'You do not have permission to update this course' };
    }

    // Update status
    const { error: updateError } = await supabase
      .from('courses')
      .update({ status })
      .eq('id', courseId);

    if (updateError) {
      console.error('Status update error:', updateError);
      return { error: 'Failed to update course status' };
    }

    revalidatePath(`/courses/${courseId}`);
    revalidatePath(ROUTES.INSTRUCTOR.COURSES);
    revalidatePath('/courses'); // TODO: Add to ROUTES

    return { success: true };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Unexpected error:', error);
    }
    return { error: 'An unexpected error occurred' };
  }
}

// Get instructor's courses
export async function getInstructorCourses() {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('=== getInstructorCourses 시작 ===');
    }

    const session = await getServerSession(authOptions);
    if (process.env.NODE_ENV === 'development') {
      console.log('세션 정보:', {
        exists: !!session,
        userEmail: session?.user?.email,
        userId: session?.user?.id,
        userRole: session?.user?.role,
      });
    }

    if (!session?.user?.email) {
      if (process.env.NODE_ENV === 'development') {
        console.log('세션이 없거나 이메일이 없음');
      }
      return { error: 'You must be logged in to view your courses' };
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('Supabase 클라이언트 초기화 시도...');
    }
    const { data: userData, error: userError } = await supabase
      .from('user')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (process.env.NODE_ENV === 'development') {
      console.log('사용자 조회 결과:', {
        userData,
        userError: userError
          ? {
              message: userError.message,
              code: userError.code,
              details: userError.details,
            }
          : null,
      });
    }

    if (!userData) {
      if (process.env.NODE_ENV === 'development') {
        console.log('사용자를 찾을 수 없음 - 이메일:', session.user.email);
      }
      return { error: 'User not found' };
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('사용자 ID로 코스 조회 시도:', userData.id);
    }
    const { data: courses, error } = await supabase
      .from('courses')
      .select(
        `
        *,
        course_settings (*),
        course_badges (*),
        lessons (count),
        enrollments (count)
      `
      )
      .eq('instructor_id', userData.id)
      .order('created_at', { ascending: false });

    if (process.env.NODE_ENV === 'development') {
      console.log('코스 조회 결과:', {
        coursesCount: courses?.length || 0,
        error: error
          ? {
              message: error.message,
              code: error.code,
              details: error.details,
            }
          : null,
      });
    }

    // Debug log to check the structure of returned data
    if (courses && courses.length > 0) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Sample course data structure:', {
          id: courses[0].id,
          title: courses[0].title,
          lessons: courses[0].lessons,
          enrollments: courses[0].enrollments,
          lessonsType: typeof courses[0].lessons,
          enrollmentsType: typeof courses[0].enrollments,
        });
      }
    }

    if (error) {
      console.error('Fetch courses error - Full details:', {
        error: error,
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      return {
        error: `Failed to fetch courses: ${error.message || 'Unknown error'}`,
      };
    }

    // Process badges for each course
    const coursesWithBadges =
      courses?.map((course) => {
        try {
          if (course.course_badges && Array.isArray(course.course_badges)) {
            course.badges = course.course_badges
              .sort((a: CourseBadge, b: CourseBadge) => a.priority - b.priority)
              .map((badge: CourseBadge) => ({
                ...badge,
                ...(BADGE_CONFIG[
                  badge.badge_type as keyof typeof BADGE_CONFIG
                ] || {}),
                type: badge.badge_type,
              }));
          } else {
            course.badges = [];
          }
        } catch (error) {
          console.warn('Badge processing failed for course:', course.id, error);
          course.badges = [];
        }
        return course;
      }) || [];

    if (process.env.NODE_ENV === 'development') {
      console.log('=== getInstructorCourses 완료 ===');
    }
    return { courses: coursesWithBadges };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Unexpected error:', error);
    }
    return { error: 'An unexpected error occurred' };
  }
}

// Get single course details
// 서버는 통합 lessons 배열만 반환 - 순서/일관성 보장과 타입 추가 시 비용 최소화를 위해
// content_type으로 구분되며, 클라이언트에서 필요시 필터링
export async function getCourseById(
  courseId: string
): Promise<ActionResult<any>> {
  try {
    console.log('getCourseById called with ID:', courseId);

    // 1. 먼저 코스 기본 정보 로드
    const { data: course, error } = await supabase
      .from('courses')
      .select(
        `
        *,
        course_settings (*),
        course_badges (*)
      `
      )
      .eq('id', courseId)
      .single();

    if (error) {
      console.error('Fetch course error - Full details:', {
        error: error,
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        courseId: courseId,
      });
      return {
        error: `Failed to fetch course: ${error.message || 'Unknown error'}`,
      };
    }

    if (!course) {
      return { error: 'Course not found' };
    }

    // 2. instructor 정보를 user 테이블에서 로드
    if (course.instructor_id) {
      const { data: instructorData, error: instructorError } = await supabase
        .from('user')
        .select('id, email, name, role, avatar_url, bio')
        .eq('id', course.instructor_id)
        .single();

      if (!instructorError && instructorData) {
        course.instructor = instructorData;
        console.log('Instructor loaded:', instructorData.name);
      } else {
        console.log('Could not load instructor data:', instructorError);
        // instructor 정보가 없어도 코스는 반환
        course.instructor = null;
      }
    }

    // 3. 배지 데이터 처리 (badge configuration 추가)
    try {
      if (course.course_badges && Array.isArray(course.course_badges)) {
        course.badges = course.course_badges
          .sort((a: CourseBadge, b: CourseBadge) => a.priority - b.priority)
          .map((badge: CourseBadge) => ({
            ...badge,
            ...(BADGE_CONFIG[badge.badge_type as keyof typeof BADGE_CONFIG] ||
              {}),
            type: badge.badge_type,
          }));
      } else {
        course.badges = [];
      }
    } catch (error) {
      console.warn('Badge processing failed in getCourseById:', error);
      course.badges = [];
    }

    console.log('Course found:', course.id, course.title);

    // 3. Topics 로드
    const { data: topics, error: topicsError } = await supabase
      .from('course_topics')
      .select('*')
      .eq('course_id', courseId)
      .order('sort_order', { ascending: true });

    if (topicsError) {
      console.error('Error loading topics:', topicsError);
      course.topics = [];
    } else {
      course.topics = topics || [];
    }

    // 4. 모든 레슨 한번에 로드 (성능 최적화) - thumbnail_url과 attachments 포함
    const { data: allLessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('*')
      .eq('course_id', courseId)
      .order('sort_order', { ascending: true });

    if (lessonsError) {
      console.error('Error loading lessons:', lessonsError);
      course.lessons = [];
    } else {
      course.lessons = allLessons || [];

      // 5. Topics에 레슨 할당
      if (course.topics && course.topics.length > 0) {
        for (const topic of course.topics) {
          topic.lessons =
            allLessons?.filter((lesson) => lesson.topic_id === topic.id) || [];
        }
      }

      // 6. Topic에 속하지 않은 레슨들도 유지
      const orphanLessons =
        allLessons?.filter((lesson) => !lesson.topic_id) || [];
      if (orphanLessons.length > 0) {
        if (process.env.NODE_ENV === 'development') {
          console.log('Found lessons without topics:', orphanLessons.length);
        }
      }
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(
        'Course loaded successfully with',
        course.topics?.length || 0,
        'topics and',
        course.lessons?.length || 0,
        'lessons'
      );
    }

    return { course };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Unexpected error in getCourseById:', error);
    }
    return { error: 'An unexpected error occurred' };
  }
}

/**
 * Soft delete a course (enterprise-grade pattern)
 * Only draft courses can be deleted
 * @param {string} courseId - The ID of the course to delete
 * @returns {Promise<{success: boolean, message?: string, error?: string}>}
 */
export async function deleteCourse(
  courseId: string
): Promise<ActionResult<void>> {
  try {
    // 1. NextAuth로 세션 확인
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return {
        success: false,
        error: 'Authentication required',
      };
    }

    // 2. Supabase에서 사용자 정보 가져오기 (email로 조회)
    const { data: userData, error: userError } = await supabaseAdmin
      .from('user')
      .select('id, role')
      .eq('email', session.user.email)
      .single();

    if (userError || !userData) {
      if (process.env.NODE_ENV === 'development') {
        console.error('User not found in database:', userError);
      }
      return {
        success: false,
        error: 'User not found',
      };
    }

    // 3. 코스 존재 여부 및 소유권 확인 (admin client 사용)
    const { data: course, error: fetchError } = await supabaseAdmin
      .from('courses')
      .select('id, status, instructor_id, title')
      .eq('id', courseId)
      .single();

    if (fetchError || !course) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Course not found:', fetchError);
      }
      return {
        success: false,
        error: 'Course not found',
      };
    }

    // 4. 소유권 검증
    if (course.instructor_id !== userData.id) {
      return {
        success: false,
        error: 'You do not have permission to delete this course',
      };
    }

    // 5. 상태 확인 - draft만 삭제 가능
    if (course.status !== 'draft') {
      return {
        success: false,
        error: `Cannot delete course in ${course.status} status. Only draft courses can be deleted.`,
      };
    }

    // 6. Soft delete 수행 (admin client로 RLS 우회)
    const updateData = {
      status: 'deleted',
      updated_at: new Date().toISOString(),
      deleted_at: new Date().toISOString(), // Soft delete timestamp
    };

    const { error: updateError } = await supabaseAdmin
      .from('courses')
      .update(updateData)
      .eq('id', courseId);

    if (updateError) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error deleting course:', updateError);
      }
      return {
        success: false,
        error: 'Failed to delete course',
      };
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`Course ${courseId} soft deleted successfully`);
    }

    return {
      success: true,
      message: 'Course deleted successfully',
    };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Unexpected error in deleteCourse:', error);
    }
    return {
      success: false,
      error: 'An unexpected error occurred while deleting the course',
    };
  }
}

// Get all courses with instructor details and statistics for public display
export async function getAllCoursesWithDetails(): Promise<any[]> {
  try {
    // 1. Fetch only published courses with instructor info
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select(
        `
        *,
        instructor:user!instructor_id(
          id,
          name,
          avatar_url
        )
      `
      )
      .eq('status', 'published') // Only published courses
      .order('created_at', { ascending: false });

    if (coursesError) {
      console.error('Error fetching courses:', coursesError);
      return [];
    }

    if (!courses || courses.length === 0) {
      return [];
    }

    // 2. Get statistics for each course (parallel processing)
    const coursesWithStats = await Promise.all(
      courses.map(async (course) => {
        // Get lesson count
        const { count: lessonCount } = await supabase
          .from('lessons')
          .select('*', { count: 'exact', head: true })
          .eq('course_id', course.id);

        // Get enrollment count
        const { count: enrollmentCount } = await supabase
          .from('enrollments')
          .select('*', { count: 'exact', head: true })
          .eq('course_id', course.id);

        // Transform to UI format matching CourseDetails structure
        return {
          id: course.id,
          courseTitle: course.title,
          desc: course.description || '',
          courseImg: course.thumbnail_url || '/images/course/1.jpg',
          userCategory: course.category || 'Web Design',
          courseType: course.difficulty_level || 'All Levels',
          price: course.discounted_price || course.regular_price || 0,
          offPrice: course.regular_price || 0,
          name: course.instructor?.name || 'Instructor',
          userImg:
            course.instructor?.avatar_url || '/images/client/avater-1.png',
          student: `${enrollmentCount || 0} Students`,
          lesson: lessonCount || 0,
          review: '5.0', // Placeholder - implement reviews later
          reviewCount: '15', // Placeholder - implement reviews later
          duration: '8 Hours', // Placeholder - calculate from lessons later
        };
      })
    );

    return coursesWithStats;
  } catch (error) {
    console.error('Error in getAllCoursesWithDetails:', error);
    return [];
  }
}

// Get user's bookmarked courses
export async function getUserBookmarks(userId: string): Promise<string[]> {
  if (!userId) return [];

  try {
    const { data, error } = await supabase
      .from('course_bookmarks')
      .select('course_id')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching bookmarks:', error);
      return [];
    }

    return data?.map((b) => b.course_id) || [];
  } catch (error) {
    console.error('Error in getUserBookmarks:', error);
    return [];
  }
}

// Get available courses for enrollment (for testing or course selection)
export async function getAvailableCourses(
  filter: CourseFilter = {}
): Promise<{ success: boolean; error?: string; courses: CourseSummary[] }> {
  try {
    const { status = ['published', 'draft'], limit, offset } = filter;

    let query = supabase
      .from('courses')
      .select(
        `
        id,
        title,
        description,
        thumbnail_url,
        status,
        is_free,
        regular_price,
        discounted_price,
        instructor_id,
        user!courses_instructor_id_fkey (
          id,
          name,
          avatar_url
        )
      `
      )
      .in('status', status)
      .order('created_at', { ascending: false });

    // Apply pagination if provided
    if (limit) {
      query = query.limit(limit);
    }
    if (offset) {
      query = query.range(offset, offset + (limit || 10) - 1);
    }

    const { data: courses, error } = await query;

    if (error) {
      console.error('Error fetching available courses:', error);
      return { success: false, error: error.message, courses: [] };
    }

    // Format the data for easier use
    const formattedCourses: any[] =
      courses?.map((course: any) => ({
        id: course.id,
        title: course.title,
        slug:
          course.slug ||
          course.title?.toLowerCase().replace(/\s+/g, '-') ||
          course.id,
        description: course.description,
        thumbnail_url: course.thumbnail_url,
        status: course.status,
        is_free: course.is_free,
        regular_price: course.regular_price,
        discounted_price: course.discounted_price,
        instructor_id: course.instructor_id,
        instructor: {
          id: course.instructor_id,
          name: course.user?.[0]?.name || 'Unknown Instructor',
          avatar_url: course.user?.[0]?.avatar_url,
        },
      })) || [];

    return {
      success: true,
      courses: formattedCourses,
    };
  } catch (error) {
    console.error('Error in getAvailableCourses:', error);
    return {
      success: false,
      error: 'Failed to fetch available courses',
      courses: [],
    };
  }
}
