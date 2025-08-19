import { createClient } from '@supabase/supabase-js';

// Note: In production, ensure SERVICE_ROLE_KEY is only used server-side
// For client-side operations, use ANON_KEY instead
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Named export for consistent usage across the codebase
export { supabase };