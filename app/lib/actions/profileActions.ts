'use server';

import { supabaseServer as supabase } from '@/app/lib/supabase/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth.config';
import { revalidatePath } from 'next/cache';

// Types
interface UpdateProfileData {
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  skill_occupation?: string | null;
  bio?: string | null;
  facebook_url?: string | null;
  instagram_url?: string | null;
  linkedin_url?: string | null;
  website_url?: string | null;
  github_url?: string | null;
  twitter_url?: string | null; // UI shows as X
}

// Storage constants
const STORAGE_BUCKET = 'profiles';
const AVATAR_DIR = 'avatars';
const COVER_DIR = 'covers';

// File validation constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: '파일이 선택되지 않았습니다.' };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `파일 크기는 최대 ${MAX_FILE_SIZE / 1024 / 1024}MB까지 허용됩니다.`,
    };
  }

  // Check file type
  const fileType = file.type;
  if (!ALLOWED_IMAGE_TYPES.includes(fileType)) {
    return {
      valid: false,
      error: '이미지 파일만 업로드할 수 있습니다. (JPEG, PNG, GIF, WebP)',
    };
  }

  return { valid: true };
}

function ensureProtocol(url?: string | null): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

// Upload profile photo
export async function uploadProfilePhoto(formData: FormData) {
  try {
    // Get file from FormData
    const file = formData.get('file') as File;
    if (!file) {
      return { success: false, error: '파일이 선택되지 않았습니다.' };
    }

    // Validate image
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Get session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    const userId = session.user.id;

    // Generate unique filename
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop() || 'jpg';
    const storagePath = `${AVATAR_DIR}/${userId}/${timestamp}.${fileExt}`;

    // Upload to Supabase Storage (File object directly)
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, file, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return { success: false, error: '이미지 업로드에 실패했습니다.' };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(storagePath);

    const avatarUrl = urlData.publicUrl;

    // Update user profile
    const { error: updateError } = await supabase
      .from('user')
      .update({
        avatar_url: avatarUrl,
        photo_url: avatarUrl, // Update both fields for compatibility
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Database update error:', updateError);
      return { success: false, error: '프로필 업데이트에 실패했습니다.' };
    }

    // Revalidate the settings page
    revalidatePath('/instructor-settings');
    revalidatePath('/instructor-profile');

    return { success: true, avatar_url: avatarUrl };
  } catch (error) {
    console.error('Profile photo upload error:', error);
    return { success: false, error: '업로드 중 오류가 발생했습니다.' };
  }
}

// Upload cover photo
export async function uploadCoverPhoto(formData: FormData) {
  try {
    // Get file from FormData
    const file = formData.get('file') as File;
    if (!file) {
      return { success: false, error: '파일이 선택되지 않았습니다.' };
    }

    // Validate image
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Get session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    const userId = session.user.id;

    // Generate unique filename
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop() || 'jpg';
    const storagePath = `${COVER_DIR}/${userId}/${timestamp}.${fileExt}`;

    // Upload to Supabase Storage (File object directly)
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, file, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return { success: false, error: '커버 이미지 업로드에 실패했습니다.' };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(storagePath);

    const coverUrl = urlData.publicUrl;

    // Update user profile
    const { error: updateError } = await supabase
      .from('user')
      .update({ cover_photo_url: coverUrl })
      .eq('id', userId);

    if (updateError) {
      console.error('Database update error:', updateError);
      return { success: false, error: '커버 이미지 업데이트에 실패했습니다.' };
    }

    // Revalidate the settings page
    revalidatePath('/instructor-settings');
    revalidatePath('/instructor-profile');

    return { success: true, cover_photo_url: coverUrl };
  } catch (error) {
    console.error('Cover photo upload error:', error);
    return { success: false, error: '업로드 중 오류가 발생했습니다.' };
  }
}

// Update user profile information
export async function updateUserProfile(data: UpdateProfileData) {
  try {
    // Get session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    const userId = session.user.id;

    // Process social URLs - add https:// if needed
    const processedData: UpdateProfileData = {
      ...data,
      facebook_url: ensureProtocol(data.facebook_url),
      instagram_url: ensureProtocol(data.instagram_url),
      linkedin_url: ensureProtocol(data.linkedin_url),
      website_url: ensureProtocol(data.website_url),
      github_url: ensureProtocol(data.github_url),
      twitter_url: ensureProtocol(data.twitter_url),
    };

    // Also update the name field (combine first and last)
    const name = `${data.first_name || ''} ${data.last_name || ''}`.trim();
    if (name) {
      // Use bracket notation to add dynamic property
      const dataWithName = { ...processedData, name };
      Object.assign(processedData, dataWithName);
    }

    // Update user profile
    const { error: updateError } = await supabase
      .from('user')
      .update(processedData)
      .eq('id', userId);

    if (updateError) {
      console.error('Profile update error:', updateError);
      return { success: false, error: '프로필 업데이트에 실패했습니다.' };
    }

    // Revalidate pages
    revalidatePath('/instructor-settings');
    revalidatePath('/instructor-profile');

    return { success: true };
  } catch (error) {
    console.error('Profile update error:', error);
    return { success: false, error: '업데이트 중 오류가 발생했습니다.' };
  }
}
