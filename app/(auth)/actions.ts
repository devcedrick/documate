'use server'

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export async function resendConfirmation(email: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: email,
  });

  if (error) {
    return { error: "Could not resend email. Please try again." };
  }

  // Set the "VIP Ticket" again
  (await cookies()).set("signup_complete", "true", { 
    path: "/", 
    httpOnly: true, 
    maxAge: 300 
  });

  redirect("/confirm");
}

