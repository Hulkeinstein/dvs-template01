import { createClient } from '@supabase/supabase-js';

// Admin client with SERVICE_ROLE_KEY for bypassing RLS
// Only use this in server-side code, never expose to client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export { supabaseAdmin };
