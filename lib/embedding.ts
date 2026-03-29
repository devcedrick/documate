import { google } from '@ai-sdk/google';
import { embedMany } from 'ai';

export class EmbeddingError extends Error {
  code: string;
  isRetryable: boolean;
  
  constructor(message: string, code: string, isRetryable = false) {
    super(message);
    this.name = 'EmbeddingError';
    this.code = code;
    this.isRetryable = isRetryable;
  }
}

export async function getEmbeddings(chunks: string[], fileName: string, taskType?: string) {
  console.log(`[Embedding] Starting embedding generation for ${chunks.length} chunks`);
  
  if (!chunks || chunks.length === 0) {
    console.error('[Embedding] Error: No chunks provided');
    throw new EmbeddingError('No content to embed', 'EMPTY_CONTENT', false);
  }

  
  const validChunks = chunks.filter(chunk => chunk && chunk.trim().length > 0);
  
  if (validChunks.length === 0) {
    console.error('[Embedding] Error: All chunks are empty after filtering');
    throw new EmbeddingError('No valid content to embed', 'EMPTY_CONTENT', false);
  }
  
  if (validChunks.length !== chunks.length) {
    console.warn(`[Embedding] Filtered out ${chunks.length - validChunks.length} empty chunks`);
  }

  const model = google.embedding('gemini-embedding-001');
  const BATCH_SIZE = 20;
  const BATCH_DELAY_MS = 1500; 
  let allEmbeddings: any[] = [];

  for (let i = 0; i < validChunks.length; i += BATCH_SIZE) {
    const batch = validChunks.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(validChunks.length / BATCH_SIZE);
    let attempt = 0;
    const MAX_RETRIES = 5;
    
    if (i > 0) {
      console.log(`[Embedding] Waiting ${BATCH_DELAY_MS}ms before next batch...`);
      await new Promise(res => setTimeout(res, BATCH_DELAY_MS));
    }
    
    console.log(`[Embedding] Processing batch ${batchNum}/${totalBatches}`);
    
    while (true) {
      try {
        const { embeddings } = await embedMany({
          model,
          values: batch,
          providerOptions: {
            google: {
              outputDimensionality: 768,
              taskType: taskType || 'RETRIEVAL_DOCUMENT',
              title: fileName || 'Untitled Document',
            },
          },
        });
        allEmbeddings.push(...embeddings);
        console.log(`[Embedding] Batch ${batchNum} completed successfully`);
        break;
      } catch (err: any) {
        const statusCode = err?.statusCode || err?.status;
        const errorMessage = err?.message || 'Unknown error';
        const responseBody = err?.responseBody || '';
        
        console.error(`[Embedding] Error in batch ${batchNum}, attempt ${attempt + 1}:`, {
          statusCode,
          message: errorMessage,
          responseBody: responseBody.slice(0, 500)
        });
        
      
        const isQuota = statusCode === 429 || responseBody.includes('quota') || responseBody.includes('rate');
        
        if (isQuota && attempt < MAX_RETRIES) {
          let delay = 35000;
          const match = responseBody?.match(/retry in ([\d.]+)s/);
          if (match && match[1]) {
            delay = Math.ceil(Number(match[1]) * 1000);
          }
          console.log(`[Embedding] Rate limited. Retrying in ${delay/1000}s (attempt ${attempt + 1}/${MAX_RETRIES})`);
          await new Promise(res => setTimeout(res, delay));
          attempt++;
        } else if (statusCode === 401 || statusCode === 403) {
          throw new EmbeddingError('API authentication failed. Please check your API key.', 'AUTH_ERROR', false);
        } else if (statusCode === 400) {
          throw new EmbeddingError('Invalid request to embedding API. Content may be too long or malformed.', 'INVALID_REQUEST', false);
        } else if (isQuota) {
          throw new EmbeddingError('API rate limit exceeded. Please try again later.', 'RATE_LIMIT', true);
        } else {
          throw new EmbeddingError(`Embedding generation failed: ${errorMessage}`, 'EMBEDDING_FAILED', false);
        }
      }
    }
  }

  console.log(`[Embedding] Successfully generated ${allEmbeddings.length} embeddings`);
  return allEmbeddings;
}
