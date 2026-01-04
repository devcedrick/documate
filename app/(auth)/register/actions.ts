"use server"

import { createClient } from '@/utils/supabase/server'
import { registerSchema } from '@/schema/register'
import { z } from 'zod'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export type ActionState = {
  error?: {
    errors?: string[];
    properties?: {
      firstName?: { errors: string[] };
      lastName?: { errors: string[] };
      email?: { errors: string[] };
      password?: { errors: string[] };
      confirmPassword?: { errors: string[] };
    };
    message?: string;
  };
  success?: string;
  values?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
} | null;

export async function createAccount(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient();

  // Validate input data
  const rawData = {
    firstName: formData.get('firstname') as string,
    lastName: formData.get('lastname') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    confirmPassword: formData.get('confirmPassword') as string,
  }

  const validated = registerSchema.safeParse(rawData);

  if (!validated.success) {
    return { 
      error: z.treeifyError(validated.error),
      values: {
        firstName: rawData.firstName,
        lastName: rawData.lastName,
        email: rawData.email,
      }
    };
  }

  // Create user in Supabase
  const { data, error } = await supabase.auth.signUp({
    email: validated.data.email,
    password: validated.data.password,
    options: {
      data: {
        first_name: validated.data.firstName,
        last_name: validated.data.lastName,
        hasCompletedOnboarding: false,
      }
    }
  });

  if (error) {
    return { 
      error: { message: error.message },
      values: {
        firstName: rawData.firstName,
        lastName: rawData.lastName,
        email: rawData.email,
      }
    };
  }

  if (!data.session) {
    return { success: "Please check your email to confirm your account." };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}