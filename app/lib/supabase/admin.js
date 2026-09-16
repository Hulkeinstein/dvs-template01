import { supabaseServer } from './server';

// Admin client with SERVICE_ROLE_KEY for bypassing RLS
// Only use this in server-side code, never expose to client
// NOTE: 공용 지연 생성 클라이언트 — import 시점이 아닌 최초 사용 시점에 env를 검증한다
const supabaseAdmin = supabaseServer;

export { supabaseAdmin };
