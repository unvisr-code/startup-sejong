import { createClient } from '@supabase/supabase-js';

// Service Role Key를 사용하는 Admin 클라이언트
// RLS (Row Level Security)를 우회할 수 있습니다
// 서버 사이드에서만 사용하세요!

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// 개발 환경에서 Service Role Key가 없을 경우 일반 anon key 사용 (임시)
const supabaseKey = supabaseServiceRoleKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

// Service Role Key 사용 여부 확인
if (!supabaseServiceRoleKey) {
  console.warn('⚠️ WARNING: Service Role Key not found. Using anon key instead.');
  console.warn('Push notifications may fail due to RLS policies.');
  console.warn('Please add SUPABASE_SERVICE_ROLE_KEY to your .env.local file.');
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
});