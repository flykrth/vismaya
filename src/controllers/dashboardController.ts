'use server';

import { createClient } from '../models/supabaseServer';
import { Camper, RegistrationWithDetails } from '../models/supabaseClient';
import { revalidatePath } from 'next/cache';

export async function fetchMySecureCampers(): Promise<{ campers: Camper[], error?: string }> {
  const supabase = await createClient();
  
  // Implicitly uses the RLS policy! No need to specify parent_id,
  // the authenticated session token will prove who the user is to Postgres.
  const { data, error } = await supabase
    .from('campers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return { campers: [], error: error.message };
  }

  return { campers: data || [] };
}

export async function addCamper(formData: FormData) {
  const fullName = formData.get('full_name') as string;
  const dob = formData.get('dob') as string; // Expected format: YYYY-MM-DD

  const supabase = await createClient();

  // Get the current user ID to assign as parent_id
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: 'Not authenticated' };
  }

  const { error } = await supabase
    .from('campers')
    .insert([
      {
        parent_id: user.id,
        full_name: fullName,
        date_of_birth: dob,
      }
    ]);

  if (error) {
    return { success: false, message: error.message };
  }

  // Revalidate the dashboard and registration page so the new camper appears
  revalidatePath('/dashboard');
  revalidatePath('/register');

  return { success: true, message: 'Camper successfully added!' };
}

export async function fetchMyRegistrations(): Promise<{ registrations: RegistrationWithDetails[], error?: string }> {
  const supabase = await createClient();

  const pickFirst = <T>(value: T | T[] | null | undefined): T | null => {
    if (!value) return null;
    return Array.isArray(value) ? (value[0] ?? null) : value;
  };

  type DashboardRegistrationRow = {
    id: string;
    camper_id: string;
    schedule_id: string;
    status: 'registered' | 'waitlisted' | 'cancelled';
    created_at: string;
    campers: {
      id: string;
      full_name: string;
      age_category: 'sub-junior' | 'junior' | 'senior';
    } | {
      id: string;
      full_name: string;
      age_category: 'sub-junior' | 'junior' | 'senior';
    }[];
    schedules: {
      id: string;
      start_time: string;
      end_time: string;
      venue: string;
      max_capacity: number;
      current_enrollment: number;
      workshops: {
        id: string;
        title: string;
      } | {
        id: string;
        title: string;
      }[];
    } | {
      id: string;
      start_time: string;
      end_time: string;
      venue: string;
      max_capacity: number;
      current_enrollment: number;
      workshops: {
        id: string;
        title: string;
      } | {
        id: string;
        title: string;
      }[];
    }[];
  };

  const { data, error } = await supabase
    .from('registrations')
    .select(`
      id,
      camper_id,
      schedule_id,
      status,
      created_at,
      campers!inner(id, full_name, age_category),
      schedules!inner(id, workshop_id, start_time, end_time, venue, max_capacity, current_enrollment, workshops!inner(id, title))
    `)
    .neq('status', 'cancelled')
    .order('created_at', { ascending: false });

  if (error) {
    return { registrations: [], error: error.message };
  }

  const registrations: RegistrationWithDetails[] = ((data || []) as unknown as DashboardRegistrationRow[])
    .map((row) => {
      const camper = pickFirst(row.campers);
      const schedule = pickFirst(row.schedules);
      const workshop = schedule ? pickFirst(schedule.workshops) : null;

      if (!camper || !schedule || !workshop) {
        return null;
      }

      return {
        id: row.id,
        camper_id: row.camper_id,
        schedule_id: row.schedule_id,
        status: row.status,
        created_at: row.created_at,
        camper: {
          id: camper.id,
          full_name: camper.full_name,
          age_category: camper.age_category,
        },
        schedule: {
          id: schedule.id,
          start_time: schedule.start_time,
          end_time: schedule.end_time,
          venue: schedule.venue,
          max_capacity: schedule.max_capacity,
          current_enrollment: schedule.current_enrollment,
        },
        workshop: {
          id: workshop.id,
          title: workshop.title,
        },
      };
    })
    .filter((row): row is RegistrationWithDetails => row !== null);

  return { registrations };
}

export async function cancelRegistration(registrationId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('registrations')
    .update({ status: 'cancelled' })
    .eq('id', registrationId)
    .neq('status', 'cancelled');

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath('/dashboard');
  revalidatePath('/catalog');
  return { success: true, message: 'Registration cancelled successfully.' };
}
