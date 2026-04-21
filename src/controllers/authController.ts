'use server';

import { createClient } from '../models/supabaseServer';
import { redirect } from 'next/navigation';

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, message: error.message };
  }

  // Redirect to dashboard on success
  redirect('/dashboard');
}

export async function signup(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const fullName = formData.get('full_name') as string;
  const phoneNumber = formData.get('phone_number') as string;
  const emergencyContact = formData.get('emergency_contact') as string;

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone_number: phoneNumber,
        emergency_contact: emergencyContact,
      },
    },
  });

  if (error) {
    return { success: false, message: error.message };
  }

  // Usually requires email verification, but we'll assume auto-confirm for testing,
  // or they just login. We'll redirect to dashboard.
  redirect('/dashboard');
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

export async function verifyCurrentUserPassword(password: string): Promise<{ valid: boolean; message?: string }> {
  if (!password) {
    return { valid: false, message: 'Password is required.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user?.email) {
    return { valid: false, message: 'You must be logged in to continue.' };
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password,
  });

  if (signInError) {
    return { valid: false, message: 'Password does not match your account.' };
  }

  return { valid: true };
}
