'use server';

import { createClient } from '../models/supabaseServer';
import { createServiceClient } from '../models/supabaseService';
import { Camper } from '../models/supabaseClient';
import { revalidatePath } from 'next/cache';

export async function fetchMyCampers(camperId?: string): Promise<Camper[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data, error } = await supabase
      .from('campers')
      .select('id, parent_id, full_name, date_of_birth, gender, age_category, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching campers:', error);
      return [];
    }

    return data || [];
  }

  if (!camperId) {
    return [];
  }

  const serviceSupabase = createServiceClient();
  const { data, error } = await serviceSupabase
    .from('campers')
    .select('id, parent_id, full_name, date_of_birth, gender, age_category, created_at')
    .eq('id', camperId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching campers:', error);
    return [];
  }

  return data ? [data] : [];
}

export async function submitRegistration(camperId: string, scheduleId: string) {
  const supabase = createServiceClient();

  try {
    if (!camperId || !scheduleId) {
      return { success: false, message: 'Camper and schedule are required.' };
    }

    const { data: camper, error: camperError } = await supabase
      .from('campers')
      .select('id')
      .eq('id', camperId)
      .single();

    if (camperError || !camper) {
      return { success: false, message: 'Invalid camper selected.' };
    }

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
      .select('id, camper_id, schedule_id, status, created_at')
      .single();

    if (error) {
      // Return the error message directly from the PostgreSQL trigger
      return { success: false, message: error.message };
    }

    revalidatePath('/dashboard');
    revalidatePath('/catalog');

    return { success: true, message: 'Successfully registered!', data };
  } catch (err: unknown) {
    return {
      success: false,
      message: err instanceof Error ? err.message : 'An unexpected error occurred.',
    };
  }
}
