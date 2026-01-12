"use server"

import { createClient } from '@/utils/supabase/server'
import { loginSchema } from '@/schema/login'
import { z } from 'zod'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export type LoginActionState = {
  error?: {
    errors?: string[];
    properties?: {
      email?: { errors: string[] };
      password?: { errors: string[] };
    };
    message?: string;
  };
  success?: string;
  values?: {
    email?: string;
  };
} | null;

export async function loginUser(prevState: LoginActionState, formData: FormData): Promise<LoginActionState> {
  const supabase = await createClient();

  // Validate input data
  const rawData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const validated = loginSchema.safeParse(rawData);

  if (!validated.success) {
    return { 
      error: z.treeifyError(validated.error),
      values: {
        email: rawData.email,
      }
    };
  }

  // Sign in user in Supabase
  const { data, error } = await supabase.auth.signInWithPassword({
    email: validated.data.email,
    password: validated.data.password,
  });

  if (error) {
    return {
      error: {
        message: error.message,
      },
      values: {
        email: rawData.email,
      }
    };
  }

  // On successful login
  revalidatePath('/onboarding');
  return { success: 'Login successful. Redirecting…' };
}