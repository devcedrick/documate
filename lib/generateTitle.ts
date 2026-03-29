import { generateText } from 'ai';
import { google } from "@ai-sdk/google";

// Custom error class for title generation errors
export class TitleGenerationError extends Error {
  code: string;
  isRetryable: boolean;
  
  constructor(message: string, code: string, isRetryable = false) {
    super(message);
    this.name = 'TitleGenerationError';
    this.code = code;
    this.isRetryable = isRetryable;
  }
}

export async function generateTitle(content: string): Promise<string> {
  console.log('[TitleGen] Starting title generation...');
  
  if (!content || content.trim().length === 0) {
    console.warn('[TitleGen] Empty content provided, using default title');
    return 'Untitled Document';
  }

  // Truncate content to avoid token limits (use first ~2000 chars)
  const truncatedContent = content.slice(0, 2000);
  
  try {
    const { text } = await generateText({
      model: google('gemini-2.5-flash'),
      prompt: `Generate a concise title (max 5 words) for a document with the following content:\n\n${truncatedContent}. Return only a plain text title without any additional formatting.`,
    });

    const cleanTitle = text?.trim() || 'Untitled Document';
    console.log('[TitleGen] Generated title:', cleanTitle);
    return cleanTitle;
    
  } catch (err: any) {
    const statusCode = err?.statusCode || err?.status;
    const errorMessage = err?.message || 'Unknown error';
    
    console.error('[TitleGen] Title generation failed:', {
      statusCode,
      message: errorMessage,
      stack: err?.stack
    });
    
    // Log specific error types for debugging
    if (statusCode === 429) {
      console.error('[TitleGen] Rate limit exceeded');
    } else if (statusCode === 401 || statusCode === 403) {
      console.error('[TitleGen] Authentication error');
    } else if (statusCode === 400) {
      console.error('[TitleGen] Invalid request - content may be malformed');
    }
    
    return 'Untitled Document';
  }
}
