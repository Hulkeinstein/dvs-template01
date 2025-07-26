'use server'

import { supabase } from '@/app/lib/supabase/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { revalidatePath } from 'next/cache'

// Create a new course
export async function createCourse(formData) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return { error: 'You must be logged in to create a course' }
    }
    
    // 테이블 스키마 디버깅
    try {
      // 빈 쿼리로 테이블 구조 확인
      const { data: sampleData, error: sampleError } = await supabase
        .from('courses')
        .select('*')
        .limit(1)
      
      if (sampleData && sampleData.length >= 0) {
        const columns = sampleData.length > 0 ? Object.keys(sampleData[0]) : [];
        console.log('Courses table actual columns:', columns);
      }
      
      // 에러 정보에서도 힌트를 얻을 수 있음
      if (sampleError) {
        console.log('Sample query error:', sampleError);
      }
    } catch (debugError) {
      console.log('Debug error:', debugError);
    }

    // Get user ID from Supabase
    const { data: userData, error: userError } = await supabase
      .from('user')
      .select('id, role')
      .eq('email', session.user.email)
      .single()

    if (userError || !userData) {
      return { error: 'User not found' }
    }

    if (userData.role !== 'instructor') {
      return { error: 'Only instructors can create courses' }
    }

    // slug 생성 (title에서 자동 생성)
    const createSlug = (title) => {
      return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 100) + '-' + Date.now();
    };

    // Create course - 필수 필드 포함
    const courseData = {
      instructor_id: userData.id,
      title: formData.title,
      slug: createSlug(formData.title),
      status: 'draft',
      is_free: formData.price === 0,
      regular_price: parseFloat(formData.price) || 0,
      difficulty_level: formData.level || 'All Levels',
      language: formData.language || 'English',
      total_duration_hours: 0,
      total_duration_minutes: 0,
      is_public: false,
      enable_qa: false
    };
    
    // 선택적 필드들을 조건부로 추가
    if (formData.shortDescription) {
      // courses 테이블에는 short_description이 없으므로 description에 저장
      courseData.description = formData.shortDescription;
    }
    
    if (formData.description) {
      courseData.about_course = formData.description;
    }
    
    if (formData.discountPrice) {
      courseData.discounted_price = parseFloat(formData.discountPrice);
    }
    
    if (formData.duration) {
      courseData.total_duration_hours = parseInt(formData.duration);
    }
    
    if (formData.category) {
      courseData.category = formData.category;
    }
    
    // Add thumbnail_url if provided
    if (formData.thumbnail_url) {
      courseData.thumbnail_url = formData.thumbnail_url;
    }
    
    console.log('Course data to insert:', {
      ...courseData,
      thumbnail_url: courseData.thumbnail_url ? `[URL: ${courseData.thumbnail_url.substring(0, 50)}...]` : 'none'
    });

    const { data: course, error: courseError } = await supabase
      .from('courses')
      .insert(courseData)
      .select()
      .single()

    if (courseError) {
      console.error('Course creation error - Full details:', {
        error: courseError,
        message: courseError.message,
        details: courseError.details,
        hint: courseError.hint,
        code: courseError.code
      })
      return { error: `Failed to create course: ${courseError.message || 'Unknown error'}` }
    }

    // Create course settings
    const settingsData = {
      course_id: course.id,
      certificate_enabled: formData.certificateEnabled || false,
      certificate_title: formData.certificateTitle,
      passing_grade: formData.passingGrade ? parseInt(formData.passingGrade) : 70,
      max_students: formData.maxStudents ? parseInt(formData.maxStudents) : null,
      enrollment_deadline: formData.enrollmentDeadline,
      start_date: formData.startDate,
      end_date: formData.endDate,
      allow_lifetime_access: formData.lifetimeAccess !== false
    }

    const { error: settingsError } = await supabase
      .from('course_settings')
      .insert(settingsData)

    if (settingsError) {
      console.error('Settings creation error:', settingsError)
      // Don't fail the whole operation if settings fail
    }

    // Create topics and lessons
    if (formData.topics && formData.topics.length > 0) {
      for (let topicIndex = 0; topicIndex < formData.topics.length; topicIndex++) {
        const topic = formData.topics[topicIndex];
        
        // Create topic
        const { data: topicData, error: topicError } = await supabase
          .from('course_topics')
          .insert({
            course_id: course.id,
            title: topic.name,
            description: topic.summary,
            sort_order: topicIndex + 1
          })
          .select()
          .single()
        
        if (topicError) {
          console.error('Topic creation error:', topicError)
          continue;
        }
        
        // Create lessons for this topic
        if (topic.lessons && topic.lessons.length > 0) {
          for (let lessonIndex = 0; lessonIndex < topic.lessons.length; lessonIndex++) {
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
                content_type: 'video'
              })
            
            if (lessonError) {
              console.error('Lesson creation error:', lessonError)
            }
          }
        }
      }
    }

    revalidatePath('/instructor/courses')
    revalidatePath('/courses')
    
    return { success: true, courseId: course.id }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { error: 'An unexpected error occurred' }
  }
}

// Update course information
export async function updateCourse(courseId, formData) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return { error: 'You must be logged in to update a course' }
    }

    // Get user ID and verify ownership
    const { data: userData, error: userError } = await supabase
      .from('user')
      .select('id')
      .eq('email', session.user.email)
      .single()

    if (userError || !userData) {
      return { error: 'User not found' }
    }

    // Verify the user owns this course
    const { data: courseCheck, error: checkError } = await supabase
      .from('courses')
      .select('instructor_id')
      .eq('id', courseId)
      .single()

    if (checkError || !courseCheck || courseCheck.instructor_id !== userData.id) {
      return { error: 'You do not have permission to update this course' }
    }

    // Update course - 실제 테이블 컬럼에 맞게 매핑
    const courseData = {
      title: formData.title,
      description: formData.shortDescription,  // shortDescription을 description 컬럼에 저장
      about_course: formData.description,      // description을 about_course 컬럼에 저장
      regular_price: parseFloat(formData.price) || 0,
      discounted_price: formData.discountPrice ? parseFloat(formData.discountPrice) : null,
      total_duration_hours: formData.duration ? parseInt(formData.duration) : 0,
      language: formData.language,
      difficulty_level: formData.level || 'All Levels',
      max_students: formData.maxStudents || 0,
      intro_video_url: formData.introVideoUrl || null,
      is_free: formData.price === 0
    }
    
    // Add slug if provided
    if (formData.slug) {
      courseData.slug = formData.slug
    }
    
    // Add category only if it's provided (temporary workaround)
    if (formData.category) {
      courseData.category = formData.category
    }
    
    // Add thumbnail_url if provided (null means remove, undefined means don't change)
    if (formData.thumbnail_url !== undefined) {
      courseData.thumbnail_url = formData.thumbnail_url
      console.log('Setting thumbnail_url:', formData.thumbnail_url ? 'URL provided' : 'null (removing)')
    } else {
      console.log('Thumbnail_url not provided, keeping existing')
    }

    console.log('Updating course with data:', {
      ...courseData,
      thumbnail_url: courseData.thumbnail_url ? `[URL: ${courseData.thumbnail_url.substring(0, 50)}...]` : 'none'
    });
    
    const { error: updateError } = await supabase
      .from('courses')
      .update(courseData)
      .eq('id', courseId)

    if (updateError) {
      console.error('Course update error - Full details:', {
        error: updateError,
        message: updateError.message,
        details: updateError.details,
        hint: updateError.hint,
        code: updateError.code
      })
      return { error: `Failed to update course: ${updateError.message || 'Unknown error'}` }
    }

    // Update settings
    const settingsData = {
      certificate_enabled: formData.certificateEnabled || false,
      certificate_title: formData.certificateTitle,
      passing_grade: formData.passingGrade ? parseInt(formData.passingGrade) : 70,
      max_students: formData.maxStudents ? parseInt(formData.maxStudents) : null,
      enrollment_deadline: formData.enrollmentDeadline,
      start_date: formData.startDate,
      end_date: formData.endDate,
      allow_lifetime_access: formData.lifetimeAccess !== false
    }

    await supabase
      .from('course_settings')
      .update(settingsData)
      .eq('course_id', courseId)

    revalidatePath(`/courses/${courseId}`)
    revalidatePath('/instructor/courses')
    
    return { success: true }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { error: 'An unexpected error occurred' }
  }
}

// Add a lesson to a course
export async function addLesson(courseId, lessonData) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return { error: 'You must be logged in to add lessons' }
    }

    // Verify ownership
    const { data: userData, error: userError } = await supabase
      .from('user')
      .select('id')
      .eq('email', session.user.email)
      .single()

    if (userError || !userData) {
      return { error: 'User not found' }
    }

    const { data: courseCheck, error: checkError } = await supabase
      .from('courses')
      .select('instructor_id')
      .eq('id', courseId)
      .single()

    if (checkError || !courseCheck || courseCheck.instructor_id !== userData.id) {
      return { error: 'You do not have permission to add lessons to this course' }
    }

    // Get the current max order index
    const { data: maxOrderData } = await supabase
      .from('lessons')
      .select('order_index')
      .eq('course_id', courseId)
      .order('order_index', { ascending: false })
      .limit(1)

    const nextOrder = maxOrderData && maxOrderData.length > 0 
      ? maxOrderData[0].order_index + 1 
      : 1

    // Add lesson
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .insert({
        course_id: courseId,
        title: lessonData.title,
        description: lessonData.description,
        video_url: lessonData.videoUrl,
        duration_minutes: lessonData.duration ? parseInt(lessonData.duration) : null,
        order_index: nextOrder,
        is_preview: lessonData.isPreview || false
      })
      .select()
      .single()

    if (lessonError) {
      console.error('Lesson creation error:', lessonError)
      return { error: 'Failed to add lesson' }
    }

    revalidatePath(`/courses/${courseId}`)
    
    return { success: true, lessonId: lesson.id }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { error: 'An unexpected error occurred' }
  }
}

// Delete a lesson
export async function deleteLesson(lessonId) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return { error: 'You must be logged in to delete lessons' }
    }

    // Get lesson details and verify ownership
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .select('course_id, courses!inner(instructor_id)')
      .eq('id', lessonId)
      .single()

    if (lessonError || !lesson) {
      return { error: 'Lesson not found' }
    }

    const { data: userData } = await supabase
      .from('user')
      .select('id')
      .eq('email', session.user.email)
      .single()

    if (!userData || lesson.courses.instructor_id !== userData.id) {
      return { error: 'You do not have permission to delete this lesson' }
    }

    // Delete lesson
    const { error: deleteError } = await supabase
      .from('lessons')
      .delete()
      .eq('id', lessonId)

    if (deleteError) {
      console.error('Lesson deletion error:', deleteError)
      return { error: 'Failed to delete lesson' }
    }

    revalidatePath(`/courses/${lesson.course_id}`)
    
    return { success: true }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { error: 'An unexpected error occurred' }
  }
}

// Publish or unpublish a course
export async function updateCourseStatus(courseId, status) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return { error: 'You must be logged in to update course status' }
    }

    // Verify ownership
    const { data: userData } = await supabase
      .from('user')
      .select('id')
      .eq('email', session.user.email)
      .single()

    if (!userData) {
      return { error: 'User not found' }
    }

    const { data: courseCheck } = await supabase
      .from('courses')
      .select('instructor_id')
      .eq('id', courseId)
      .single()

    if (!courseCheck || courseCheck.instructor_id !== userData.id) {
      return { error: 'You do not have permission to update this course' }
    }

    // Update status
    const { error: updateError } = await supabase
      .from('courses')
      .update({ status })
      .eq('id', courseId)

    if (updateError) {
      console.error('Status update error:', updateError)
      return { error: 'Failed to update course status' }
    }

    revalidatePath(`/courses/${courseId}`)
    revalidatePath('/instructor/courses')
    revalidatePath('/courses')
    
    return { success: true }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { error: 'An unexpected error occurred' }
  }
}

// Get instructor's courses
export async function getInstructorCourses() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return { error: 'You must be logged in to view your courses' }
    }

    const { data: userData } = await supabase
      .from('user')
      .select('id')
      .eq('email', session.user.email)
      .single()

    if (!userData) {
      return { error: 'User not found' }
    }

    const { data: courses, error } = await supabase
      .from('courses')
      .select(`
        *,
        course_settings (*),
        lessons (count),
        enrollments (count)
      `)
      .eq('instructor_id', userData.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Fetch courses error - Full details:', {
        error: error,
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return { error: `Failed to fetch courses: ${error.message || 'Unknown error'}` }
    }

    return { courses: courses || [] }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { error: 'An unexpected error occurred' }
  }
}

// Get single course details
export async function getCourseById(courseId) {
  try {
    console.log('getCourseById called with ID:', courseId);
    
    const { data: course, error } = await supabase
      .from('courses')
      .select(`
        *,
        course_settings (*),
        lessons (*)
      `)
      .eq('id', courseId)
      .single()

    if (error) {
      console.error('Fetch course error - Full details:', {
        error: error,
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        courseId: courseId
      })
      return { error: `Failed to fetch course: ${error.message || 'Unknown error'}` }
    }

    console.log('Course found:', course?.id, course?.title);
    return { course }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { error: 'An unexpected error occurred' }
  }
}