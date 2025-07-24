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

    // Create course
    const courseData = {
      instructor_id: userData.id,
      title: formData.title,
      short_description: formData.shortDescription,
      description: formData.description,
      price: parseFloat(formData.price) || 0,
      discount_price: formData.discountPrice ? parseFloat(formData.discountPrice) : null,
      duration_hours: formData.duration ? parseInt(formData.duration) : null,
      language: formData.language,
      level: formData.level,
      status: 'draft'
    }
    
    // Add category only if it's provided (temporary workaround)
    if (formData.category) {
      courseData.category = formData.category
    }

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

    // Update course
    const courseData = {
      title: formData.title,
      short_description: formData.shortDescription,
      description: formData.description,
      price: parseFloat(formData.price) || 0,
      discount_price: formData.discountPrice ? parseFloat(formData.discountPrice) : null,
      duration_hours: formData.duration ? parseInt(formData.duration) : null,
      language: formData.language,
      level: formData.level
    }
    
    // Add category only if it's provided (temporary workaround)
    if (formData.category) {
      courseData.category = formData.category
    }

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
    const { data: course, error } = await supabase
      .from('courses')
      .select(`
        *,
        course_settings (*),
        lessons (*),
        user:instructor_id (
          name,
          email,
          avatar_url
        )
      `)
      .eq('id', courseId)
      .order('lessons.order_index', { ascending: true })
      .single()

    if (error) {
      console.error('Fetch course error:', error)
      return { error: 'Failed to fetch course' }
    }

    return { course }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { error: 'An unexpected error occurred' }
  }
}