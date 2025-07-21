'use server'

import { supabase } from '@/app/lib/supabase/client';

export async function getUserProfile(userId) {
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
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return null;
  }
}