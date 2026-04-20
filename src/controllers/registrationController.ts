'use server';

import { createClient } from '../models/supabaseServer';
import { Camper } from '../models/supabaseClient';

export async function fetchMyCampers(): Promise<Camper[]> {
  const supabase = await createClient();
  
  // Securely fetches only campers belonging to the authenticated parent
  const { data, error } = await supabase
    .from('campers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching campers:', error);
    return [];
  }
  
  return data || [];
}

export async function submitRegistration(camperId: string, scheduleId: string) {
  const supabase = await createClient();

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

    return { success: true, message: 'Successfully registered!', data: data[0] };
  } catch (err: any) {
    return { success: false, message: err.message || 'An unexpected error occurred.' };
  }
}
