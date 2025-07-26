'use server'

import { supabase } from '@/app/lib/supabase/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { base64ToBlob } from '@/app/lib/utils/fileUpload'

// Upload course thumbnail - now accepts base64 data
export async function uploadCourseThumbnail(base64Data, fileName) {
  try {
    // Validate input
    if (!base64Data) {
      return { success: false, error: 'No file data provided' }
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    let fileType = 'image/jpeg' // default
    
    if (base64Data.includes('data:')) {
      const matches = base64Data.match(/data:([^;]+);/)
      if (matches) {
        fileType = matches[1]
        if (!allowedTypes.includes(fileType)) {
          return { success: false, error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.' }
        }
      }
    }

    // Validate file size (approximate check for base64)
    // Base64 increases size by ~33%, so 5MB file ≈ 6.67MB base64
    const base64Size = base64Data.length * 0.75 // approximate size in bytes
    const maxSize = 5 * 1024 * 1024 // 5MB
    
    if (base64Size > maxSize) {
      return { success: false, error: `File size exceeds ${maxSize / 1024 / 1024}MB limit` }
    }

    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return { success: false, error: 'You must be logged in to upload files' }
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

    // Convert base64 to blob
    const blob = base64ToBlob(base64Data, fileType)

    // Sanitize filename
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '-')
    const fileExt = sanitizedFileName.split('.').pop() || 'jpg'
    const uniqueFileName = `${Date.now()}-${sanitizedFileName}`
    const filePath = `course-thumbnails/${uniqueFileName}`

    // List available buckets for debugging
    console.log('Uploading file:', {
      fileName: uniqueFileName,
      filePath: filePath,
      blobSize: blob.size,
      fileType: fileType
    });
    
    // Upload to Supabase Storage - try 'courses' bucket first
    let bucketName = 'courses';
    let uploadData, uploadError;
    
    ({ data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, blob, {
        cacheControl: '3600',
        upsert: false,
        contentType: fileType
      }));
    
    // If failed, try 'course-images' bucket
    if (uploadError && uploadError.message?.includes('bucket')) {
      console.log('Trying alternative bucket: course-images');
      bucketName = 'course-images';
      ({ data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, blob, {
          cacheControl: '3600',
          upsert: false,
          contentType: fileType
        }));
    }

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return { success: false, error: `Failed to upload file: ${uploadError.message}` }
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath)

    return { success: true, url: publicUrl }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: 'An unexpected error occurred' }
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
    return { success: false, error: 'An unexpected error occurred' }
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
    return { success: false, error: 'An unexpected error occurred' }
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
    return { success: false, error: 'An unexpected error occurred' }
  }
}