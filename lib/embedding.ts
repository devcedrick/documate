import { google } from '@ai-sdk/google';
import { embedMany } from 'ai';

export async function getEmbeddings(chunks: string[], fileName: string, taskType?: string) {
  const model = google.embedding('gemini-embedding-001');
  const BATCH_SIZE = 100;
  let allEmbeddings: any[] = [];

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);
    let attempt = 0;
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
        break;
      } catch (err: any) {
        // Check for quota error (429) and retry if possible
        const isQuota = err?.statusCode === 429 || (err?.responseBody && err.responseBody.includes('quota'));
        if (isQuota && attempt < 3) {
          // Try to parse retry delay from error message (in seconds)
          let delay = 35000; // default 35s
          const match = err?.responseBody?.match(/retry in ([\d.]+)s/);
          if (match && match[1]) {
            delay = Math.ceil(Number(match[1]) * 1000);
          }
          await new Promise(res => setTimeout(res, delay));
          attempt++;
        } else {
          throw err;
        }
      }
    }
  }

  return allEmbeddings;
}
