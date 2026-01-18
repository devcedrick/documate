"use server"

import { createClient } from '@/utils/supabase/server'
import { onboardingSchema } from '@/schema/onboarding'
import { z } from 'zod'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export type OnboardingActionState = {
  error?: {
    errors?: string[];
    properties?: {
      firstName?: { errors: string[] };
      lastName?: { errors: string[] };
      useCase?: { errors: string[] };
      responsePreference?: { errors: string[] };
      strictnessLevel?: { errors: string[] };
    };
    message?: string;
  };
  success?: string;
  values?: {
    firstName?: string;
    lastName?: string;
    useCase?: string;
    responsePreference?: string;
    strictnessLevel?: string;
  };
} | null;

export async function completeOnboarding(
  prevState: OnboardingActionState, 
  formData: FormData
): Promise<OnboardingActionState> {
  const supabase = await createClient();

  // Check if user is authenticated
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      error: {
        message: 'You must be logged in to complete onboarding.',
      },
    };
  }

  // Extract and validate input data
  const rawData = {
    firstName: formData.get('firstName') as string,
    lastName: formData.get('lastName') as string,
    useCase: formData.get('useCase') as string,
    responsePreference: formData.get('responsePreference') as string,
    strictnessLevel: formData.get('strictnessLevel') as string,
  };

  const validated = onboardingSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      error: z.treeifyError(validated.error),
      values: rawData,
    };
  }

  // Update user metadata in Supabase Auth
  const { error: updateUserError } = await supabase.auth.updateUser({
    data: {
      first_name: validated.data.firstName,
      last_name: validated.data.lastName,
      hasCompletedOnboarding: true,
    },
  })

  if (updateUserError) {
    return {
      error: {
        message: updateUserError.message || 'Failed to update user information. Please try again.',
      },
      values: rawData,
    };
  }

  const { error: refreshError } = await supabase.auth.refreshSession();
  
  if (refreshError) {
    console.error('Failed to refresh session:', refreshError);
  }

  const { error: updateError } = await supabase
    .from('user_profiles')
    .upsert({
      id: user.id,
      first_name: validated.data.firstName,
      last_name: validated.data.lastName,
      has_completed_onboarding: true,
      use_case: validated.data.useCase,
      response_preference: validated.data.responsePreference,
      strictness_level: validated.data.strictnessLevel,
    }, {
      onConflict: 'id'
    })

  if (updateError) {
    await supabase.auth.updateUser({
      data: { hasCompletedOnboarding: false },
    });
    
    return {
      error: {
        message: updateError.message || 'Failed to save your preferences. Please try again.',
      },
      values: rawData,
    };
  }

  // On successful onboarding
  revalidatePath('/', 'layout');
  redirect('/c');
}

