"use server"

import { createClient } from "@/utils/supabase/server"

export async function deleteDocument(docId: string, filePath: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  // Delete file from storage
  const { error: storageError } = await supabase.storage
    .from('user_documents')
    .remove([filePath])

  if (storageError) return { error: "Failed to delete file from storage" }

  // Delete metadata from database
  const { error: dbError } = await supabase
    .from('documents')
    .delete()
    .eq('id', docId)
    .eq('user_id', user.id)

  if (dbError) {
    console.error("DB Deletion Error:", dbError)
    return { error: "Failed to delete document record" }
  }

  return { success: true }
}