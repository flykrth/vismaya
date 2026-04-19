'use server';

import { supabase, Camper } from '../models/supabaseClient';

export async function fetchMyCampers(parentId: string): Promise<Camper[]> {
  const { data, error } = await supabase
    .from('campers')
    .select('*')
    .eq('parent_id', parentId);

  if (error) {
    console.error('Error fetching campers:', error);
    return [];
  }
  
  return data || [];
}

export async function submitRegistration(camperId: string, scheduleId: string) {
  try {
    const { data, error } = await supabase
      .from('registrations')
      .insert([
        {
          camper_id: camperId,
          schedule_id: scheduleId,
        }
      ])
      .select();

    if (error) {
      // Return the error message directly from the PostgreSQL trigger
      return { success: false, message: error.message };
    }

    return { success: true, data: data[0] };
  } catch (err: any) {
    return { success: false, message: err.message || 'An unexpected error occurred.' };
  }
}
