'use server';

import { createClient } from '../models/supabaseServer';
import { Camper, RegistrationWithDetails } from '../models/supabaseClient';
import { revalidatePath } from 'next/cache';
import { verifyCurrentUserPassword } from './authController';

export async function fetchMySecureCampers(): Promise<{ campers: Camper[], error?: string }> {
  const supabase = await createClient();
  
  // Implicitly uses the RLS policy! No need to specify parent_id,
  // the authenticated session token will prove who the user is to Postgres.
  const { data, error } = await supabase
    .from('campers')
    .select('id, parent_id, full_name, date_of_birth, registration_number, gender, age_category, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    return { campers: [], error: error.message };
  }

  return { campers: data || [] };
}

export async function addCamper(formData: FormData) {
  const fullName = formData.get('full_name') as string;
  const dob = formData.get('dob') as string; // Expected format: YYYY-MM-DD
  const gender = (formData.get('gender') as 'male' | 'female' | 'other') || 'male';

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
        gender,
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
      workshop_id: string;
      slot_label: 'A' | 'B' | 'C' | 'D';
      start_time: string;
      end_time: string;
      venue: string;
      max_capacity: number;
      current_enrollment: number;
    } | {
      id: string;
      workshop_id: string;
      slot_label: 'A' | 'B' | 'C' | 'D';
      start_time: string;
      end_time: string;
      venue: string;
      max_capacity: number;
      current_enrollment: number;
    }[];
  };

  const registrationQuery = supabase
    .from('registrations')
    .select(`
      id,
      camper_id,
      schedule_id,
      status,
      created_at,
      campers!inner(id, full_name, age_category),
      schedules!inner(id, workshop_id, slot_label, start_time, end_time, venue, max_capacity, current_enrollment)
    `)
    .neq('status', 'cancelled')
    .order('created_at', { ascending: false });

  const { data, error } = await registrationQuery;

  if (error) {
    return { registrations: [], error: error.message };
  }

  const rows = (data || []) as unknown as DashboardRegistrationRow[];

  const pickFirst = <T>(value: T | T[] | null | undefined): T | null => {
    if (!value) return null;
    return Array.isArray(value) ? (value[0] ?? null) : value;
  };

  const workshopIds = Array.from(
    new Set(
      rows
        .map((row) => pickFirst(row.schedules)?.workshop_id)
        .filter((id): id is string => Boolean(id))
    )
  );

  const workshopTitleById = new Map<string, string>();

  if (workshopIds.length > 0) {
    const { data: workshopsData, error: workshopError } = await supabase
      .from('workshops')
      .select('id, title')
      .in('id', workshopIds);

    if (workshopError) {
      return { registrations: [], error: workshopError.message };
    }

    (workshopsData || []).forEach((workshop) => {
      workshopTitleById.set(workshop.id, workshop.title);
    });
  }

  const registrations: RegistrationWithDetails[] = rows
    .map((row) => {
      const camper = pickFirst(row.campers);
      const schedule = pickFirst(row.schedules);
      const workshopTitle = schedule ? workshopTitleById.get(schedule.workshop_id) : null;

      if (!camper || !schedule || !workshopTitle) {
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
          slot_label: schedule.slot_label,
          start_time: schedule.start_time,
          end_time: schedule.end_time,
          venue: schedule.venue,
          max_capacity: schedule.max_capacity,
          current_enrollment: schedule.current_enrollment,
        },
        workshop: {
          id: schedule.workshop_id,
          title: workshopTitle,
        },
      };
    })
    .filter((row): row is RegistrationWithDetails => row !== null);

  return { registrations };
}

export async function cancelRegistration(registrationId: string, password: string) {
  const supabase = await createClient();

  const passwordCheck = await verifyCurrentUserPassword(password);
  if (!passwordCheck.valid) {
    return { success: false, message: passwordCheck.message || 'Password verification failed.' };
  }

  if (!registrationId) {
    return { success: false, message: 'Registration id is required.' };
  }

  const { error } = await supabase
    .from('registrations')
    .delete()
    .eq('id', registrationId);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath('/dashboard');
  revalidatePath('/catalog');
  return { success: true, message: 'Registration cancelled successfully.' };
}
