'use server'

import { createClient } from "@/utils/supabase/server"

const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25MB
const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
]

export async function uploadDocument(formData: FormData) {
  const supabase = await createClient()
  
  // GET FILE (ensure exactly one file)
  const files = formData.getAll("file")
  if (files.length === 0) return { error: "No file uploaded" }
  if (files.length > 1) return { error: "Only one file can be uploaded at a time" }
  
  const file = files[0] as File
  if (!file || file.size === 0) return { error: "No file uploaded" }

  // VALIDATE FILE SIZE
  if (file.size > MAX_FILE_SIZE) {
    return { error: "File size exceeds 25MB limit" }
  }

  // VALIDATE FILE TYPE
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: "Invalid file type. Allowed: PDF, DOC, DOCX, TXT" }
  }

  // UPLOAD FILE TO STORAGE (SUPABASE)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const filePath = `${user.id}/${Date.now()}_${file.name}`
  const { error: uploadError } = await supabase.storage
    .from('user_documents')
    .upload(filePath, file)

  if (uploadError) return { error: "Upload failed" }

  // INSERT FILE METADATA TO DATABASE
  const { data: doc, error: dbError } = await supabase
    .from('documents')
    .insert({
      user_id: user.id,
      file_name: file.name,
      file_path: filePath,
      file_size: file.size,
      is_processed: false 
    })
    .select()
    .single()

  if (dbError) return { error: "Database error" }

  return { success: true, doc }
}

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

  if (dbError) return { error: "Failed to delete document record" }

  return { success: true }
}