import { google } from '@ai-sdk/google';
import { embedMany } from 'ai';

export async function getEmbeddings(chunks: string[], fileName: string, taskType?: string) {
  const model = google.embedding('gemini-embedding-001');

  const { embeddings } = await embedMany({
    model,
    values: chunks,
    providerOptions: {
      google: {
        outputDimensionality: 768,
        taskType: taskType || 'RETRIEVAL_DOCUMENT', 
        title: fileName || 'Untitled Document',
      },
    },
  });

  return embeddings;
}
