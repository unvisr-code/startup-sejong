import { createClient } from '@supabase/supabase-js';

// Service Role Key를 사용하는 Admin 클라이언트
// RLS (Row Level Security)를 우회할 수 있습니다
// 서버 사이드에서만 사용하세요!

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// 개발 환경에서 Service Role Key가 없을 경우 일반 anon key 사용 (임시)
const supabaseKey = supabaseServiceRoleKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 환경 변수가 없을 경우 경고만 출력하고 빌드는 계속 진행
if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ WARNING: Missing Supabase environment variables');
  console.warn('Supabase Admin client will not function properly');
  console.warn('Please check your environment variables configuration');
}

// Service Role Key 사용 여부 확인
if (supabaseUrl && supabaseKey && !supabaseServiceRoleKey) {
  console.warn('⚠️ WARNING: Service Role Key not found. Using anon key instead.');
  console.warn('Push notifications may fail due to RLS policies.');
  console.warn('Please add SUPABASE_SERVICE_ROLE_KEY to your .env.local file.');
}

// 조건부 클라이언트 생성 - 환경 변수가 없으면 Mock 클라이언트 반환
const createSupabaseAdminClient = () => {
  if (!supabaseUrl || !supabaseKey) {
    // Mock client for build-time when env vars are missing
    return {
      from: () => ({
        select: () => Promise.resolve({ data: [], error: null }),
        insert: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
        update: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
        delete: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
        upsert: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') })
      }),
      auth: {
        signInWithPassword: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
        signOut: () => Promise.resolve({ error: null })
      }
    } as any;
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  });
};

export const supabaseAdmin = createSupabaseAdminClient();