'use server'

import { supabase } from '@/app/lib/supabase/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// Upload course thumbnail
export async function uploadCourseThumbnail(courseId, file) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return { error: 'You must be logged in to upload files' }
    }

    // Get user ID
    const { data: userData } = await supabase
      .from('user')
      .select('id')
      .eq('email', session.user.email)
      .single()

    if (!userData) {
      return { error: 'User not found' }
    }

    // Verify course ownership
    const { data: course } = await supabase
      .from('courses')
      .select('instructor_id')
      .eq('id', courseId)
      .single()

    if (!course || course.instructor_id !== userData.id) {
      return { error: 'You do not have permission to upload files for this course' }
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${courseId}-${Date.now()}.${fileExt}`
    const filePath = `course-thumbnails/${fileName}`

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('courses')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return { error: 'Failed to upload file' }
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('courses')
      .getPublicUrl(filePath)

    // Update course thumbnail URL
    const { error: updateError } = await supabase
      .from('courses')
      .update({ thumbnail_url: publicUrl })
      .eq('id', courseId)

    if (updateError) {
      console.error('Update error:', updateError)
      // Try to delete uploaded file
      await supabase.storage.from('courses').remove([filePath])
      return { error: 'Failed to update course thumbnail' }
    }

    return { success: true, url: publicUrl }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { error: 'An unexpected error occurred' }
  }
}

// Upload lesson video
export async function uploadLessonVideo(courseId, lessonId, file) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return { error: 'You must be logged in to upload files' }
    }

    // Get user ID
    const { data: userData } = await supabase
      .from('user')
      .select('id')
      .eq('email', session.user.email)
      .single()

    if (!userData) {
      return { error: 'User not found' }
    }

    // Verify course ownership through lesson
    const { data: lesson } = await supabase
      .from('lessons')
      .select('course_id, courses!inner(instructor_id)')
      .eq('id', lessonId)
      .single()

    if (!lesson || lesson.courses.instructor_id !== userData.id) {
      return { error: 'You do not have permission to upload files for this lesson' }
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${lessonId}-${Date.now()}.${fileExt}`
    const filePath = `lesson-videos/${courseId}/${fileName}`

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('courses')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return { error: 'Failed to upload file' }
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('courses')
      .getPublicUrl(filePath)

    // Update lesson video URL
    const { error: updateError } = await supabase
      .from('lessons')
      .update({ video_url: publicUrl })
      .eq('id', lessonId)

    if (updateError) {
      console.error('Update error:', updateError)
      // Try to delete uploaded file
      await supabase.storage.from('courses').remove([filePath])
      return { error: 'Failed to update lesson video' }
    }

    return { success: true, url: publicUrl }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { error: 'An unexpected error occurred' }
  }
}

// Delete file from storage
export async function deleteFile(filePath) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return { error: 'You must be logged in to delete files' }
    }

    const { error } = await supabase.storage
      .from('courses')
      .remove([filePath])

    if (error) {
      console.error('Delete error:', error)
      return { error: 'Failed to delete file' }
    }

    return { success: true }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { error: 'An unexpected error occurred' }
  }
}

// Create storage bucket if it doesn't exist (run once during setup)
export async function createStorageBucket() {
  try {
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error('List buckets error:', listError)
      return { error: 'Failed to list storage buckets' }
    }

    const coursesBucket = buckets.find(bucket => bucket.name === 'courses')
    
    if (!coursesBucket) {
      const { error: createError } = await supabase.storage.createBucket('courses', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'],
        fileSizeLimit: 524288000 // 500MB
      })

      if (createError) {
        console.error('Create bucket error:', createError)
        return { error: 'Failed to create storage bucket' }
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { error: 'An unexpected error occurred' }
  }
}