'use server';

import { supabaseServer as supabase } from '@/app/lib/supabase/server';

interface UserProfile {
  id: string;
  email: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  avatar_url?: string;
  role?: string;
  created_at?: string;
  updated_at?: string;
}

export async function getUserProfile(
  email: string
): Promise<UserProfile | null> {
  if (!email) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('user')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data as UserProfile;
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return null;
  }
}

export async function getUserById(userId: string): Promise<UserProfile | null> {
  if (!userId) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('user')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user by ID:', error);
      return null;
    }

    return data as UserProfile;
  } catch (error) {
    console.error('Error in getUserById:', error);
    return null;
  }
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('user')
      .update(updates)
      .eq('id', userId);

    if (error) {
      console.error('Error updating user profile:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    return { success: false, error: 'Failed to update profile' };
  }
}
