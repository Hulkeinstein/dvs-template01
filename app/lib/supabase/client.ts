import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Note: In production, ensure SERVICE_ROLE_KEY is only used server-side
// For client-side operations, use ANON_KEY instead

let supabaseInstance: SupabaseClient | null = null;

/**
 * Get Supabase client instance with lazy initialization
 * This prevents build-time errors when environment variables are not available
 */
function getSupabaseClient(): SupabaseClient {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn('Missing Supabase environment variables');
    // Create a dummy client that will work during build time
    // but will fail if actually used without proper env vars
    if (typeof window === 'undefined') {
      // Server-side: create a minimal mock during build
      return {
        from: () => ({
          select: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
          insert: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
          update: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
          delete: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
        }),
        storage: {
          from: () => ({
            upload: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
            getPublicUrl: () => ({ data: { publicUrl: '' } }),
          }),
        },
      } as any;
    }
    throw new Error('Supabase client is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
  }

  supabaseInstance = createClient(supabaseUrl, supabaseKey);
  return supabaseInstance;
}

// Export a getter that lazily initializes the client
// This allows the module to be imported without immediately requiring env vars
export const supabase = new Proxy({} as SupabaseClient, {
  get(target, prop) {
    const client = getSupabaseClient();
    return client[prop as keyof SupabaseClient];
  },
  apply(target, thisArg, argArray) {
    const client = getSupabaseClient();
    return Reflect.apply(client as any, thisArg, argArray);
  }
});