import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type AgeCategory = 'sub-junior' | 'junior' | 'senior';
export type CamperGender = 'male' | 'female' | 'other';
export type RegistrationStatus = 'registered' | 'waitlisted' | 'cancelled';
export type ScheduleSlot = 'A' | 'B' | 'C' | 'D';

export interface Workshop {
  id: string;
  title: string;
  description: string;
  speaker_name: string;
  speaker_title: string;
  learning_outcome: string;
  allowed_age_categories: AgeCategory[];
  created_at: string;
  schedules?: Schedule[];
}

export interface Schedule {
  id: string;
  workshop_id: string;
  slot_label: ScheduleSlot;
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
  registration_number: string;
  gender: CamperGender;
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

export interface RegistrationWithDetails extends Registration {
  camper: Pick<Camper, 'id' | 'full_name' | 'age_category'>;
  schedule: Pick<Schedule, 'id' | 'slot_label' | 'start_time' | 'end_time' | 'venue' | 'max_capacity' | 'current_enrollment'>;
  workshop: Pick<Workshop, 'id' | 'title'>;
}
