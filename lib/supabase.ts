import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a dummy client for build time or when environment variables are not set
const createSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables are not set. Some features may not work.');
    // Return a mock client that won't throw errors during build
    return {
      from: () => ({
        select: () => Promise.resolve({ data: [], error: null }),
        insert: () => Promise.resolve({ data: null, error: null }),
        update: () => Promise.resolve({ data: null, error: null }),
        delete: () => Promise.resolve({ data: null, error: null }),
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: null })
        }),
        order: () => ({
          select: () => Promise.resolve({ data: [], error: null })
        })
      }),
      auth: {
        getSession: () => Promise.resolve({ data: { session: null } }),
        signInWithPassword: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
        signOut: () => Promise.resolve({ error: null })
      }
    } as any;
  }
  
  return createClient(supabaseUrl, supabaseAnonKey);
};

export const supabase = createSupabaseClient();

// Database Types
export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'general' | 'important' | 'academic' | 'event';
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface AcademicEvent {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  event_type: 'semester' | 'exam' | 'holiday' | 'application' | 'other';
  description?: string;
  created_at: string;
}