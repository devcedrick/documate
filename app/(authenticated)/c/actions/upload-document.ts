'use server'

import { createClient } from "@/utils/supabase/server"
import { parseFile, ParserError } from "@/lib/parser"
import { chunkText } from "@/lib/chunking"
import { getEmbeddings, EmbeddingError } from "@/lib/embedding"
import { generateTitle } from "@/lib/generateTitle"

const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25MB
const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
] 

// User-friendly error messages for different failure types
const ERROR_MESSAGES = {
  DOWNLOAD_FAILED: 'Failed to retrieve your document. Please try uploading again.',
  PARSE_FAILED: 'Could not read the document content. The file may be corrupted or password-protected.',
  CHUNK_FAILED: 'Failed to process document content. Please try a different file.',
  EMBEDDING_FAILED: 'Failed to analyze document. The service may be temporarily busy.',
  DB_INSERT_FAILED: 'Failed to save document sections. Please try again.',
  UPDATE_FAILED: 'Document processed but status update failed.',
} as const;

export async function ingestDocument(docId: string, filePath: string, useCase: string) {
  const supabase = await createClient();
  console.log(`[Ingest] Starting document ingestion for docId: ${docId}`);
  
  try {
    // 1. Download file from storage
    console.log('[Ingest] Step 1: Downloading file from storage...');
    const { data, error } = await supabase
      .storage
      .from('user_documents')
      .download(filePath);
      
    if (error || !data) {
      console.error("[Ingest] Download failed:", error);
      throw { code: 'DOWNLOAD_FAILED', original: error };
    }
    console.log('[Ingest] File downloaded successfully');

    // 2. Parse file
    console.log('[Ingest] Step 2: Parsing file...');
    let fileBuffer, mimeType;
    try {
      fileBuffer = await data.arrayBuffer();
      mimeType = data.type;
    } catch (err) {
      console.error("[Ingest] Error reading file buffer:", err);
      throw { code: 'PARSE_FAILED', original: err };
    }

    let parsed;
    try {
      parsed = await parseFile(Buffer.from(fileBuffer), mimeType);
      if (!parsed || !parsed.text) {
        throw new Error('No text content extracted');
      }
    } catch (err) {
      console.error("[Ingest] Parse failed:", err);
      if (err instanceof ParserError) {
        throw { code: 'PARSE_FAILED', message: err.message, original: err };
      }
      throw { code: 'PARSE_FAILED', original: err };
    }
    console.log(`[Ingest] File parsed: ${parsed.text.length} chars extracted`);

    // 3. Chunk text
    console.log('[Ingest] Step 3: Chunking text...');
    let chunks;
    try {
      chunks = chunkText(parsed.text, useCase);
      if (!chunks || chunks.length === 0) {
        throw new Error('No chunks generated');
      }
    } catch (err) {
      console.error("[Ingest] Chunking failed:", err);
      throw { code: 'CHUNK_FAILED', original: err };
    }
    console.log(`[Ingest] Created ${chunks.length} chunks`);

    // 4. Generate embeddings
    console.log('[Ingest] Step 4: Generating embeddings...');
    let embeddings;
    try {
      embeddings = await getEmbeddings(chunks.map(c => c.content), filePath, 'RETRIEVAL_DOCUMENT');
      if (!embeddings || embeddings.length !== chunks.length) {
        throw new Error(`Embedding count mismatch: expected ${chunks.length}, got ${embeddings?.length || 0}`);
      }
    } catch (err) {
      console.error("[Ingest] Embedding generation failed:", err);
      if (err instanceof EmbeddingError) {
        throw { code: 'EMBEDDING_FAILED', message: err.message, original: err };
      }
      throw { code: 'EMBEDDING_FAILED', original: err };
    }
    console.log(`[Ingest] Generated ${embeddings.length} embeddings`);

    // 5. Insert chunks into document_sections
    console.log('[Ingest] Step 5: Inserting chunks into database...');
    let insertedCount = 0;
    let failedCount = 0;
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const embedding = embeddings[i];
      const { error: insertError } = await supabase
        .from('document_sections')
        .insert({
          document_id: docId,
          content: chunk.content,
          embedding,
          token_count: chunk.charCount,
        });
        
      if (insertError) {
        console.error(`[Ingest] Failed to insert chunk #${i}:`, insertError);
        failedCount++;
      } else {
        insertedCount++;
      }
    }
    
    console.log(`[Ingest] Inserted ${insertedCount}/${chunks.length} chunks (${failedCount} failed)`);
    
    if (insertedCount === 0) {
      throw { code: 'DB_INSERT_FAILED', original: new Error('All chunk insertions failed') };
    }

    // Generate Document Title
    console.log('[Ingest] Step 6: Generating document title...');
    const docTitle = await generateTitle(parsed.text);
    console.log(`[Ingest] Generated title: "${docTitle}"`);

    // 7. Update document 
    console.log('[Ingest] Step 7: Updating document status...');
    const { error: updateError } = await supabase
      .from('documents')
      .update({ is_processed: true, doc_title: docTitle })
      .eq('id', docId);
      
    if (updateError) {
      console.error("[Ingest] Status update failed:", updateError);
      throw { code: 'UPDATE_FAILED', original: updateError };
    }

    console.log(`[Ingest] Document ingestion completed successfully for docId: ${docId}`);
    return { success: true };
    
  } catch (err: any) {
    const code = err?.code || 'UNKNOWN';
    const userMessage = ERROR_MESSAGES[code as keyof typeof ERROR_MESSAGES] || 
      (err?.message || 'An unexpected error occurred during document processing.');
    
    console.error(`[Ingest] Document ingestion failed for docId: ${docId}`, {
      code,
      message: userMessage,
      original: err?.original || err
    });
    
    // Update document to mark processing as failed
    try {
      await supabase
        .from('documents')
        .update({ is_processed: false })
        .eq('id', docId);
    } catch (updateErr) {
      console.error('[Ingest] Failed to update document failure status:', updateErr);
    }
    
    return { error: userMessage, code };
  }
}


export async function uploadDocument(formData: FormData) {
  const supabase = await createClient()
  console.log('[Upload] Starting document upload...');

  const useCase = formData.get("useCase") as string || "general";

  // GET FILE (ensure exactly one file)
  const files = formData.getAll("file")
  if (files.length === 0) {
    console.error('[Upload] No file provided');
    return { error: "No file uploaded. Please select a file." }
  }
  if (files.length > 1) {
    console.error('[Upload] Multiple files provided');
    return { error: "Only one file can be uploaded at a time." }
  }

  const file = files[0] as File
  if (!file || file.size === 0) {
    console.error('[Upload] Empty file');
    return { error: "File appears to be empty. Please select a valid file." }
  }

  console.log(`[Upload] File: ${file.name}, Size: ${(file.size / 1024).toFixed(2)} KB, Type: ${file.type}`);

  // VALIDATE FILE SIZE
  if (file.size > MAX_FILE_SIZE) {
    console.error(`[Upload] File too large: ${file.size} bytes`);
    return { error: `File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds the 25MB limit.` }
  }

  // VALIDATE FILE TYPE
  if (!ALLOWED_TYPES.includes(file.type)) {
    console.error(`[Upload] Invalid file type: ${file.type}`);
    return { error: `Unsupported file type. Please upload PDF, DOCX, or TXT files.` }
  }

  // UPLOAD FILE TO STORAGE (SUPABASE)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    console.error('[Upload] User not authenticated');
    return { error: "Please log in to upload documents." }
  }

  const filePath = `${user.id}/${Date.now()}_${file.name}`
  console.log(`[Upload] Uploading to storage: ${filePath}`);
  
  const { error: uploadError } = await supabase.storage
    .from('user_documents')
    .upload(filePath, file)

  if (uploadError) {
    console.error('[Upload] Storage upload failed:', uploadError);
    return { error: "Failed to upload file. Please try again." }
  }
  console.log('[Upload] File uploaded to storage successfully');

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

  if (dbError) {
    console.error('[Upload] Database insert failed:', dbError);
    // Try to clean up the uploaded file
    await supabase.storage.from('user_documents').remove([filePath]);
    return { error: "Failed to save document record. Please try again." }
  }
  console.log(`[Upload] Document record created: ${doc.id}`);

  // Trigger document ingestion (async, don't await)
  console.log('[Upload] Triggering document ingestion...');
  ingestDocument(doc.id, filePath, useCase);

  return { success: true, doc }
}