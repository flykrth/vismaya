'use server';

import { createClient } from '../models/supabaseServer';
import { Workshop, Schedule } from '../models/supabaseClient';

export async function fetchCatalog(): Promise<Workshop[]> {
  const supabase = await createClient();

  // Fetch workshops
  const { data: workshops, error: workshopError } = await supabase
    .from('workshops')
    .select('*')
    .order('created_at', { ascending: false });

  if (workshopError) {
    console.error('Error fetching workshops:', workshopError);
    return [];
  }

  // Fetch schedules
  const { data: schedules, error: scheduleError } = await supabase
    .from('schedules')
    .select('*')
    .order('start_time', { ascending: true });

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
