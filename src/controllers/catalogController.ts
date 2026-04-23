'use server';

import { createClient } from '../models/supabaseServer';
import { Workshop, Schedule } from '../models/supabaseClient';

export async function fetchCatalog(): Promise<Workshop[]> {
  const supabase = await createClient();

  // Fetch workshops
  const { data: workshops, error: workshopError } = await supabase
    .from('workshops')
    .select('id, title, description, speaker_name, speaker_title, learning_outcome, allowed_age_categories, created_at')
    .order('created_at', { ascending: false });

  if (workshopError) {
    console.error('Error fetching workshops:', workshopError);
    return [];
  }

  // Fetch schedules
  const { data: schedules, error: scheduleError } = await supabase
    .from('schedules')
    .select('id, workshop_id, slot_label, start_time, end_time, venue, max_capacity, current_enrollment, created_at')
    .order('slot_label', { ascending: true });

  if (scheduleError) {
    console.error('Error fetching schedules:', scheduleError);
    return workshops;
  }

  // Map schedules to their respective workshops
  const catalog = workshops.map((workshop: Workshop) => {
    return {
      ...workshop,
      schedules: schedules.filter((schedule: Schedule) => schedule.workshop_id === workshop.id),
    };
  });

  return catalog;
}

export async function fetchWorkshopById(id: string): Promise<Workshop | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('workshops')
    .select('id, title, description, speaker_name, speaker_title, learning_outcome, allowed_age_categories, created_at')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching workshop:', error);
    return null;
  }
  
  return data;
}

export async function fetchSchedulesForWorkshop(workshopId: string): Promise<Schedule[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('schedules')
    .select('id, workshop_id, slot_label, start_time, end_time, venue, max_capacity, current_enrollment, created_at')
    .eq('workshop_id', workshopId)
    .order('slot_label', { ascending: true });

  if (error) {
    console.error('Error fetching schedules:', error);
    return [];
  }
  
  return data || [];
}
