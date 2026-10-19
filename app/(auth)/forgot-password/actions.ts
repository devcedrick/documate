"use server"

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";

export type ForgotPasswordActionState = {
  error?: string;
  success?: string;
} | null;

export async function forgotPassword(prevState: ForgotPasswordActionState, formData: FormData) {
  const email = formData.get('email') as string;

  const emailSchema = z.email();
  const parsedEmail = emailSchema.safeParse(email);

  if (!parsedEmail.success) {
    return {
      error: "Please enter a valid email address."
    }
  }

  const origin = (await headers()).get('origin') || 'http://localhost:3000';
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(
    email, {
      redirectTo: `${origin}/update-password`,
    })

  if (error) {
    return { error: "Could not send reset password email. Please try again." };
  }

  return { 
    success: "A password reset email has been sent. Please check your inbox" 
  };
}