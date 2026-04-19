import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type AgeCategory = 'sub-junior' | 'junior' | 'senior';
export type RegistrationStatus = 'registered' | 'waitlisted' | 'cancelled';

export interface Workshop {
  id: string;
  title: string;
  description: string;
  allowed_age_categories: AgeCategory[];
  created_at: string;
  schedules?: Schedule[];
}

export interface Schedule {
  id: string;
  workshop_id: string;
  start_time: string;
  end_time: string;
  venue: string;
  max_capacity: number;
  current_enrollment: number;
  created_at: string;
}

export interface Camper {
  id: string;
  parent_id: string;
  full_name: string;
  date_of_birth: string;
  age_category: AgeCategory;
  created_at: string;
}

export interface Registration {
  id: string;
  camper_id: string;
  schedule_id: string;
  status: RegistrationStatus;
  created_at: string;
}
