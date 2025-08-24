import { createClient, SupabaseClient } from '@supabase/supabase-js';

let serverClient: SupabaseClient | null = null;

/**
 * Server-only Supabase client with SERVICE_ROLE_KEY
 * NEVER import this in client components
 * Only use in server actions and API routes
 */
export function getServerClient(): SupabaseClient {
  if (serverClient) return serverClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase server environment variables');
  }

  serverClient = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return serverClient;
}

// Named export for compatibility
export const supabaseServer = new Proxy({} as SupabaseClient, {
  get(target, prop) {
    const client = getServerClient();
    return client[prop as keyof SupabaseClient];
  },
});
