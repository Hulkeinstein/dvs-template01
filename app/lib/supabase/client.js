import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// <<<--- 이 부분을 Named Export로 수정했습니다. ---<<<
// export default supabase; -> 이 줄을 아래와 같이 변경합니다.
export { supabase };
