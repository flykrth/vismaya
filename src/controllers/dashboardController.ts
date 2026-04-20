'use server';

import { createClient } from '../models/supabaseServer';
import { Camper } from '../models/supabaseClient';
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
