'use server'

import { createClient } from "@/utils/supabase/server"
import { parseFile } from "@/lib/parser"
import { chunkText } from "@/lib/chunking"
import { getEmbeddings } from "@/lib/embedding"
import { generateTitle } from "@/lib/generateTitle"

const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25MB
const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
] 

export async function ingestDocument(docId: string, filePath: string, useCase: string) {
  const supabase = await createClient();
  try {
    // 1. Download file from storage
    const { data, error } = await supabase
      .storage
      .from('user_documents')
      .download(filePath);
    if (error || !data) {
      console.error("Error downloading file:", error);
      throw new Error("Failed to download file from storage");
    }

    // 2. Parse file
    let fileBuffer, mimeType;
    try {
      fileBuffer = await data.arrayBuffer();
      mimeType = data.type;
    } catch (err) {
      console.error("Error reading file buffer:", err);
      throw new Error("Failed to read file buffer");
    }

    let parsed;
    try {
      parsed = await parseFile(Buffer.from(fileBuffer), mimeType);
      if (!parsed || !parsed.text) throw new Error();
    } catch (err) {
      console.error("Failed to parse document", err);
      throw new Error("Failed to parse document");
    }

    // 3. Chunk text
    let chunks;
    try {
      chunks = chunkText(parsed.text, useCase);
      if (!chunks || chunks.length === 0) throw new Error();
    } catch (err) {
      console.error("Failed to chunk document", err);
      throw new Error("Failed to chunk document");
    }

    // 4. Generate embeddings
    let embeddings;
    try {
      embeddings = await getEmbeddings(chunks.map(c => c.content), filePath, 'RETRIEVAL_DOCUMENT');
      if (!embeddings || embeddings.length !== chunks.length) throw new Error();
    } catch (err) {
      console.error("Failed to generate embeddings", err);
      throw new Error("Failed to generate embeddings");
    }

    // 5. Insert chunks into document_sections
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const embedding = embeddings[i];
      const { error: insertError } = await supabase
        .from('document_sections')
        .insert({
          document_id: docId,
          content: chunk.content,
          embedding,
          token_count: chunk.charCount, // charCount used as token_count estimate
        });
      if (insertError) {
        console.error(`Failed to insert chunk #${i}:`, insertError);
      }
    }

    // Generate Document Title
    const docTitle = await generateTitle(parsed.text);

    // 6. Update document 
    const { error: updateError } = await supabase
      .from('documents')
      .update({ is_processed: true, doc_title: docTitle })
      .eq('id', docId);
    if (updateError) {
      console.error("Failed to update document status:", updateError);
      throw new Error("Failed to update document status");
    }

    return {
      success: true,
     };
  } catch (err) {
    console.error("ingestDocument failed:", err);
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }
}


export async function uploadDocument(formData: FormData) {
  const supabase = await createClient()

  const useCase = formData.get("useCase") as string || "general";

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

  // Trigger document ingestion
  ingestDocument(doc.id, filePath, useCase);

  return { success: true, doc }
}