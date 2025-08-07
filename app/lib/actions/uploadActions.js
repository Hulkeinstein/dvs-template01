'use server';

import { supabase } from '@/app/lib/supabase/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { base64ToBlob } from '@/app/lib/utils/fileUpload';
import { debugLog, trackError } from '@/app/lib/utils/debugHelper';

// Upload course thumbnail - now accepts base64 data
export async function uploadCourseThumbnail(base64Data, fileName) {
  try {
    // Validate input
    if (!base64Data) {
      return { success: false, error: 'No file data provided' };
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    let fileType = 'image/jpeg'; // default

    if (base64Data.includes('data:')) {
      const matches = base64Data.match(/data:([^;]+);/);
      if (matches) {
        fileType = matches[1];
        if (!allowedTypes.includes(fileType)) {
          return {
            success: false,
            error:
              'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.',
          };
        }
      }
    }

    // Validate file size (approximate check for base64)
    // Base64 increases size by ~33%, so 5MB file ≈ 6.67MB base64
    const base64Size = base64Data.length * 0.75; // approximate size in bytes
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (base64Size > maxSize) {
      return {
        success: false,
        error: `File size exceeds ${maxSize / 1024 / 1024}MB limit`,
      };
    }

    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return { success: false, error: 'You must be logged in to upload files' };
    }

    // Get user ID
    const { data: userData } = await supabase
      .from('user')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (!userData) {
      return { success: false, error: 'User not found' };
    }

    // Convert base64 to blob
    const blob = base64ToBlob(base64Data, fileType);

    // Sanitize filename
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '-');
    const fileExt = sanitizedFileName.split('.').pop() || 'jpg';
    const uniqueFileName = `${Date.now()}-${sanitizedFileName}`;
    const filePath = `course-thumbnails/${uniqueFileName}`;

    // List available buckets for debugging
    console.log('Uploading file:', {
      fileName: uniqueFileName,
      filePath: filePath,
      blobSize: blob.size,
      fileType: fileType,
    });

    // Upload to Supabase Storage - try 'courses' bucket first
    let bucketName = 'courses';
    let uploadData, uploadError;

    ({ data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, blob, {
        cacheControl: '3600',
        upsert: false,
        contentType: fileType,
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
          contentType: fileType,
        }));
    }

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return {
        success: false,
        error: `Failed to upload file: ${uploadError.message}`,
      };
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucketName).getPublicUrl(filePath);

    return { success: true, url: publicUrl };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Upload lesson attachment - accepts base64 data
export async function uploadLessonAttachment(base64Data, fileName) {
  const context = { fileName, dataSize: base64Data?.length };

  try {
    debugLog('uploadActions', 'uploadLessonAttachment:start', context);

    // Validate input
    if (!base64Data || !fileName) {
      throw new Error(
        'Missing required parameters: base64Data and fileName are required'
      );
    }

    // Validate file type for attachments (문서 + 이미지)
    const allowedExtensions = [
      'pdf',
      'doc',
      'docx',
      'xls',
      'xlsx',
      'ppt',
      'pptx',
      'zip',
      'rar',
      'txt',
      'jpg',
      'jpeg',
      'png',
      'gif',
      'webp',
      'bmp',
    ];
    const fileExt = fileName.split('.').pop()?.toLowerCase();

    if (!fileExt || !allowedExtensions.includes(fileExt)) {
      throw new Error(
        `Invalid file type. Allowed types: ${allowedExtensions.join(', ')}`
      );
    }

    // Validate file size (10MB limit for attachments)
    const base64Size = base64Data.length * 0.75; // approximate size in bytes
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (base64Size > maxSize) {
      throw new Error(
        `File size exceeds ${maxSize / 1024 / 1024}MB limit. Current size: ${(base64Size / 1024 / 1024).toFixed(2)}MB`
      );
    }

    debugLog('uploadActions', 'uploadLessonAttachment:validated', {
      ...context,
      fileExt,
      fileSizeMB: (base64Size / 1024 / 1024).toFixed(2),
    });

    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      throw new Error('You must be logged in to upload files');
    }

    // Get user ID
    const { data: userData } = await supabase
      .from('user')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (!userData) {
      throw new Error('User not found');
    }

    // Determine MIME type based on extension
    const mimeTypes = {
      // 문서 타입
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ppt: 'application/vnd.ms-powerpoint',
      pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      zip: 'application/zip',
      rar: 'application/x-rar-compressed',
      txt: 'text/plain',
      // 이미지 타입
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      bmp: 'image/bmp',
    };

    const mimeType = mimeTypes[fileExt] || 'application/octet-stream';

    // Convert base64 to blob
    const blob = base64ToBlob(base64Data, mimeType);

    // Sanitize filename and create unique path
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '-');
    const uniqueFileName = `${Date.now()}-${sanitizedFileName}`;
    const filePath = `lessons/attachments/${uniqueFileName}`;

    debugLog('uploadActions', 'uploadLessonAttachment:uploading', {
      filePath,
      blobSize: blob.size,
      mimeType,
    });

    // Try to upload to 'courses' bucket first (존재하는 버킷)
    let bucketName = 'courses';
    let uploadData, uploadError;

    debugLog('uploadActions', 'uploadLessonAttachment:trying-bucket', {
      bucket: bucketName,
      filePath,
      mimeType,
    });

    ({ data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, blob, {
        cacheControl: '3600',
        upsert: false,
        contentType: mimeType,
      }));

    // If failed with bucket error, try 'course-attachments' bucket as fallback
    if (uploadError) {
      debugLog('uploadActions', 'uploadLessonAttachment:first-attempt-failed', {
        bucket: bucketName,
        error: uploadError.message,
        errorCode: uploadError.code,
      });

      // Only try alternative bucket if it's a bucket-related error
      if (
        uploadError.message?.includes('bucket') ||
        uploadError.message?.includes('not found')
      ) {
        bucketName = 'course-attachments';

        debugLog('uploadActions', 'uploadLessonAttachment:trying-fallback', {
          bucket: bucketName,
        });

        ({ data: uploadData, error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(filePath, blob, {
            cacheControl: '3600',
            upsert: false,
            contentType: mimeType,
          }));
      }
    }

    if (uploadError) {
      // 더 자세한 에러 메시지
      let errorMessage = uploadError.message;

      if (errorMessage.includes('bucket')) {
        errorMessage = `Storage bucket '${bucketName}' not found. Please create the bucket in Supabase dashboard or use existing 'courses' bucket.`;
      } else if (errorMessage.includes('row level security')) {
        errorMessage =
          'Permission denied. Please check storage policies in Supabase.';
      } else if (errorMessage.includes('payload too large')) {
        errorMessage = `File too large. Maximum size is ${maxSize / 1024 / 1024}MB.`;
      }

      debugLog('uploadActions', 'uploadLessonAttachment:final-error', {
        originalError: uploadError.message,
        enhancedError: errorMessage,
        bucket: bucketName,
      });

      throw new Error(errorMessage);
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucketName).getPublicUrl(filePath);

    debugLog('uploadActions', 'uploadLessonAttachment:success', {
      publicUrl,
      bucketUsed: bucketName,
      filePath,
    });

    return {
      success: true,
      url: publicUrl,
      path: filePath,
      fileName: sanitizedFileName,
      fileSize: blob.size,
    };
  } catch (error) {
    trackError('uploadLessonAttachment', error, context);
    return {
      success: false,
      error: error.message,
      debugInfo: {
        ...context,
        errorStack: error.stack,
      },
    };
  }
}

// Upload lesson video
export async function uploadLessonVideo(courseId, lessonId, file) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return { error: 'You must be logged in to upload files' };
    }

    // Get user ID
    const { data: userData } = await supabase
      .from('user')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (!userData) {
      return { error: 'User not found' };
    }

    // Verify course ownership through lesson
    const { data: lesson } = await supabase
      .from('lessons')
      .select('course_id, courses!inner(instructor_id)')
      .eq('id', lessonId)
      .single();

    if (!lesson || lesson.courses.instructor_id !== userData.id) {
      return {
        error: 'You do not have permission to upload files for this lesson',
      };
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${lessonId}-${Date.now()}.${fileExt}`;
    const filePath = `lesson-videos/${courseId}/${fileName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('courses')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return { error: 'Failed to upload file' };
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('courses').getPublicUrl(filePath);

    // Update lesson video URL
    const { error: updateError } = await supabase
      .from('lessons')
      .update({ video_url: publicUrl })
      .eq('id', lessonId);

    if (updateError) {
      console.error('Update error:', updateError);
      // Try to delete uploaded file
      await supabase.storage.from('courses').remove([filePath]);
      return { error: 'Failed to update lesson video' };
    }

    return { success: true, url: publicUrl };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Delete file from storage
export async function deleteFile(filePath) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return { error: 'You must be logged in to delete files' };
    }

    const { error } = await supabase.storage.from('courses').remove([filePath]);

    if (error) {
      console.error('Delete error:', error);
      return { error: 'Failed to delete file' };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Create storage bucket if it doesn't exist (run once during setup)
export async function createStorageBucket() {
  try {
    const { data: buckets, error: listError } =
      await supabase.storage.listBuckets();

    if (listError) {
      console.error('List buckets error:', listError);
      return { error: 'Failed to list storage buckets' };
    }

    const coursesBucket = buckets.find((bucket) => bucket.name === 'courses');

    if (!coursesBucket) {
      const { error: createError } = await supabase.storage.createBucket(
        'courses',
        {
          public: true,
          allowedMimeTypes: [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'video/mp4',
            'video/webm',
          ],
          fileSizeLimit: 524288000, // 500MB
        }
      );

      if (createError) {
        console.error('Create bucket error:', createError);
        return { error: 'Failed to create storage bucket' };
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
