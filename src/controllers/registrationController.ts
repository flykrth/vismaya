'use server';

import { createClient } from '../models/supabaseServer';
import { Camper } from '../models/supabaseClient';
import { revalidatePath } from 'next/cache';

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
    const { data: selectedSchedule, error: selectedScheduleError } = await supabase
      .from('schedules')
      .select('id, workshop_id')
      .eq('id', scheduleId)
      .single();

    if (selectedScheduleError || !selectedSchedule) {
      return { success: false, message: 'Selected schedule was not found.' };
    }

    const { data: existingRegistration, error: existingRegistrationError } = await supabase
      .from('registrations')
      .select('id, status, schedules!inner(workshop_id)')
      .eq('camper_id', camperId)
      .neq('status', 'cancelled')
      .eq('schedules.workshop_id', selectedSchedule.workshop_id)
      .limit(1)
      .maybeSingle();

    if (existingRegistrationError) {
      return { success: false, message: existingRegistrationError.message };
    }

    if (existingRegistration) {
      return { success: false, message: 'This camper is already registered for this workshop.' };
    }

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

    revalidatePath('/dashboard');
    revalidatePath('/catalog');

    return { success: true, message: 'Successfully registered!', data: data[0] };
  } catch (err: unknown) {
    return {
      success: false,
      message: err instanceof Error ? err.message : 'An unexpected error occurred.',
    };
  }
}
