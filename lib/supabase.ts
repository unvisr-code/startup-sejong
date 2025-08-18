import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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