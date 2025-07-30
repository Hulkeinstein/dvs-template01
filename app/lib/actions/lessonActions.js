'use server'

import { supabase } from '@/app/lib/supabase/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// Create a new lesson
export async function createLesson(lessonData) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return { success: false, error: 'You must be logged in to create lessons' }
    }

    // Get user ID
    const { data: userData } = await supabase
      .from('user')
      .select('id')
      .eq('email', session.user.email)
      .single()

    if (!userData) {
      return { success: false, error: 'User not found' }
    }

    // Verify course ownership
    const { data: course } = await supabase
      .from('courses')
      .select('instructor_id')
      .eq('id', lessonData.courseId)
      .single()

    if (!course || course.instructor_id !== userData.id) {
      return { success: false, error: 'You do not have permission to add lessons to this course' }
    }

    // Get current lesson count to determine sort_order
    const { data: existingLessons, error: countError } = await supabase
      .from('lessons')
      .select('id')
      .eq('course_id', lessonData.courseId)

    if (countError) {
      console.error('Error counting lessons:', countError)
      return { success: false, error: 'Failed to determine lesson order' }
    }

    const orderIndex = existingLessons ? existingLessons.length : 0

    // Create the lesson
    const { data: newLesson, error: createError } = await supabase
      .from('lessons')
      .insert({
        course_id: lessonData.courseId,
        title: lessonData.title,
        description: lessonData.description || '',
        video_url: lessonData.videoUrl || '',
        sort_order: orderIndex,
        duration_minutes: lessonData.duration || 0
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating lesson:', createError)
      return { success: false, error: 'Failed to create lesson' }
    }

    return { success: true, lessonId: newLesson.id }
  } catch (error) {
    console.error('Unexpected error in createLesson:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// Update a lesson
export async function updateLesson(lessonId, updates) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return { success: false, error: 'You must be logged in to update lessons' }
    }

    // Get user ID
    const { data: userData } = await supabase
      .from('user')
      .select('id')
      .eq('email', session.user.email)
      .single()

    if (!userData) {
      return { success: false, error: 'User not found' }
    }

    // Verify lesson ownership through course
    const { data: lesson } = await supabase
      .from('lessons')
      .select('course_id, courses!inner(instructor_id)')
      .eq('id', lessonId)
      .single()

    if (!lesson || lesson.courses.instructor_id !== userData.id) {
      return { success: false, error: 'You do not have permission to update this lesson' }
    }

    // Filter out fields that shouldn't be updated
    const allowedFields = ['title', 'description', 'video_url', 'duration_minutes', 'content']
    const filteredUpdates = Object.keys(updates)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key]
        return obj
      }, {})

    // Update the lesson
    const { error: updateError } = await supabase
      .from('lessons')
      .update(filteredUpdates)
      .eq('id', lessonId)

    if (updateError) {
      console.error('Error updating lesson:', updateError)
      return { success: false, error: 'Failed to update lesson' }
    }

    return { success: true }
  } catch (error) {
    console.error('Unexpected error in updateLesson:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// Delete a lesson
export async function deleteLesson(lessonId) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return { success: false, error: 'You must be logged in to delete lessons' }
    }

    // Get user ID
    const { data: userData } = await supabase
      .from('user')
      .select('id')
      .eq('email', session.user.email)
      .single()

    if (!userData) {
      return { success: false, error: 'User not found' }
    }

    // Verify lesson ownership and get order info
    const { data: lesson } = await supabase
      .from('lessons')
      .select('course_id, sort_order, courses!inner(instructor_id)')
      .eq('id', lessonId)
      .single()

    if (!lesson || lesson.courses.instructor_id !== userData.id) {
      return { success: false, error: 'You do not have permission to delete this lesson' }
    }

    // Delete the lesson
    const { error: deleteError } = await supabase
      .from('lessons')
      .delete()
      .eq('id', lessonId)

    if (deleteError) {
      console.error('Error deleting lesson:', deleteError)
      return { success: false, error: 'Failed to delete lesson' }
    }

    // Reorder remaining lessons
    const { data: remainingLessons, error: fetchError } = await supabase
      .from('lessons')
      .select('id, sort_order')
      .eq('course_id', lesson.course_id)
      .gt('sort_order', lesson.sort_order)
      .order('sort_order')

    if (fetchError) {
      console.error('Error fetching remaining lessons:', fetchError)
      // Deletion succeeded but reordering failed - not critical
      return { success: true, warning: 'Lesson deleted but reordering failed' }
    }

    // Update order indices
    for (const remainingLesson of remainingLessons) {
      await supabase
        .from('lessons')
        .update({ sort_order: remainingLesson.sort_order - 1 })
        .eq('id', remainingLesson.id)
    }

    return { success: true }
  } catch (error) {
    console.error('Unexpected error in deleteLesson:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// Reorder lessons
export async function reorderLessons(courseId, lessonOrders) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return { success: false, error: 'You must be logged in to reorder lessons' }
    }

    // Get user ID
    const { data: userData } = await supabase
      .from('user')
      .select('id')
      .eq('email', session.user.email)
      .single()

    if (!userData) {
      return { success: false, error: 'User not found' }
    }

    // Verify course ownership
    const { data: course } = await supabase
      .from('courses')
      .select('instructor_id')
      .eq('id', courseId)
      .single()

    if (!course || course.instructor_id !== userData.id) {
      return { success: false, error: 'You do not have permission to reorder lessons in this course' }
    }

    // Verify all lesson IDs belong to this course
    const lessonIds = lessonOrders.map(lo => lo.id)
    const { data: courseLessons } = await supabase
      .from('lessons')
      .select('id')
      .eq('course_id', courseId)
      .in('id', lessonIds)

    if (!courseLessons || courseLessons.length !== lessonIds.length) {
      return { success: false, error: 'Invalid lesson IDs provided' }
    }

    // Update lesson orders
    const updatePromises = lessonOrders.map(({ id, order }) =>
      supabase
        .from('lessons')
        .update({ sort_order: order })
        .eq('id', id)
    )

    const results = await Promise.all(updatePromises)
    const hasError = results.some(result => result.error)

    if (hasError) {
      console.error('Error reordering lessons:', results)
      return { success: false, error: 'Failed to reorder some lessons' }
    }

    return { success: true }
  } catch (error) {
    console.error('Unexpected error in reorderLessons:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// Get lessons for a course
export async function getLessonsByCourse(courseId) {
  try {
    const { data: lessons, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('course_id', courseId)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Error fetching lessons:', error)
      return { success: false, error: 'Failed to fetch lessons' }
    }

    return { success: true, lessons: lessons || [] }
  } catch (error) {
    console.error('Unexpected error in getLessonsByCourse:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}