"use server"

import { createClient } from "@/utils/supabase/server";
import { updatePasswordSchema } from "@/schema/update-password";
import { z } from "zod";

export type UpdatePasswordActionState = {
  error?: {
    errors?: string[];
    properties?: {
      password?: { errors: string[] };
      confirmPassword?: { errors: string[] };
    };
    message?: string;
  };
  success?: string;
} | null;

export async function updatePassword(
  prevState: UpdatePasswordActionState, 
  formData: FormData
): Promise<UpdatePasswordActionState> {
  const supabase = await createClient();

  const rawData = {
    password: formData.get('password') as string,
    confirmPassword: formData.get('confirmPassword') as string,
  };

  const validated = updatePasswordSchema.safeParse(rawData);

  if (!validated.success) {
    return { 
      error: z.treeifyError(validated.error),
    };
  }

  const { error } = await supabase.auth.updateUser({
    password: validated.data.password,
  });

  if (error) {
    return { 
      error: { message: error.message },
    };
  }

  return { 
    success: "Your password has been updated successfully." 
  };
}
